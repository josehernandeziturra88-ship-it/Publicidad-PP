import {FinanceError,SCOPES,validDate,validMonth,expenseSplit} from './finance-domain.mjs';

export function paymentDate(day,today){
 if(!day)return null;
 const y=Number(today.slice(0,4)),m=Number(today.slice(5,7));
 for(let offset=0;offset<2;offset++){
  const last=new Date(Date.UTC(y,m+offset,0)),date=new Date(Date.UTC(last.getUTCFullYear(),last.getUTCMonth(),Math.min(day,last.getUTCDate()))).toISOString().slice(0,10);
  if(date>=today)return date;
 }return null;
}
// Assets are positive balances. A credit card's balance is a positive debt;
// paying it reduces debt, while a charge or advance increases it.
export function buildWallet({accounts=[],sales=[],expenses=[],movements=[]},month,today){
 validMonth(month);const last=new Date(Date.UTC(Number(month.slice(0,4)),Number(month.slice(5,7)),0)).toISOString().slice(0,10),asOf=last<today?last:today;
 const cards=accounts.map(a=>({...a,balance:a.openingDate<=asOf?a.openingBalance:null})),byId=new Map(cards.map(a=>[a.id,a])),ledger=[];
 function apply(accountId,amount,date){const a=byId.get(accountId);if(a&&a.balance!==null&&date>=a.openingDate&&date<=asOf)a.balance+=amount;}
 function flow(accountId,amount,date,direction){const a=byId.get(accountId);if(a)apply(accountId,amount*(a.type==='credit'?-direction:direction),date);}
 for(const s of sales){for(const key of ['cash','card','transfer','other'])if(s[key]>0){const accountId=s.accounts?.[key]??'';flow(accountId,s[key],s.date,1);ledger.push({id:`sale:${s.id}:${key}`,recordId:s.id,source:'sale',date:s.date,scope:'business',type:'income',description:'Venta diaria · '+({cash:'efectivo',card:'tarjeta',transfer:'transferencia',other:'otros'}[key]),amount:s[key],accountId,category:'Ventas'});}}
 for(const e of expenses){flow(e.accountId,e.total,e.date,-1);const split=expenseSplit(e);for(const scope of Object.keys(SCOPES))if(split[scope]>0)ledger.push({id:`expense:${e.id}:${scope}`,recordId:e.id,source:'expense',date:e.date,scope,type:'expense',description:e.supplier,amount:split[scope],accountId:e.accountId??'',category:e.category,receiptId:e.receiptId,number:e.number});}
 for(const m of movements){
  if(m.type==='transfer'){flow(m.fromAccountId,m.amount,m.date,-1);flow(m.toAccountId,m.amount,m.date,1);}
  else if(m.type==='income')flow(m.toAccountId,m.amount,m.date,1);
  else apply(m.toAccountId,m.amount,m.date);
  ledger.push({id:'movement:'+m.id,recordId:m.id,source:'movement',date:m.date,scope:m.scope,type:m.type,description:m.description,amount:m.amount,accountId:m.toAccountId,fromAccountId:m.fromAccountId,category:m.type==='income'?'Otros ingresos':m.type==='transfer'?'Transferencia / pago de tarjeta':'Ajuste'});
 }
 const monthly=ledger.filter(l=>l.date.startsWith(month)&&l.date<=asOf).sort((a,b)=>b.date.localeCompare(a.date)||a.id.localeCompare(b.id));
 for(const a of cards){a.available=a.type==='credit'&&a.balance!==null?a.creditLimit-a.balance:null;a.nextPayment=a.type==='credit'?paymentDate(a.paymentDay,today):null;}
 const totals={};for(const scope of ['business','personal','all']){
  const rows=monthly.filter(r=>scope==='all'||r.scope===scope),own=cards.filter(a=>(scope==='all'||a.scope===scope)&&a.balance!==null);
  const income=rows.filter(r=>r.type==='income').reduce((s,r)=>s+r.amount,0),expense=rows.filter(r=>r.type==='expense').reduce((s,r)=>s+r.amount,0);
  totals[scope]={income,expense,result:income-expense,assets:own.filter(a=>a.type!=='credit').reduce((s,a)=>s+a.balance,0),debt:own.filter(a=>a.type==='credit').reduce((s,a)=>s+a.balance,0),unassigned:rows.filter(r=>!r.accountId&&['income','expense'].includes(r.type)).length};
 }
 return {asOf,month,accounts:cards,ledger:monthly,totals};
}

export function parseCSV(text){
 if(typeof text!=='string'||text.length>300000)throw new FinanceError('El CSV debe pesar menos de 300 kB.');
 text=text.replace(/^\ufeff/,'');const first=text.split(/\r?\n/,1)[0],delimiter=first.includes(';')?';':first.includes('\t')?'\t':',';
 const rows=[];let row=[],cell='',quoted=false;
 for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){cell+='"';i++;}else if(quoted||cell==='')quoted=!quoted;else cell+=c;}else if(c===delimiter&&!quoted){row.push(cell);cell='';}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(cell);if(row.some(v=>v.trim()))rows.push(row);row=[];cell='';}else cell+=c;}
 if(quoted)throw new FinanceError('El CSV tiene comillas sin cerrar.');row.push(cell);if(row.some(v=>v.trim()))rows.push(row);return rows;
}
const normalized=s=>s.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
export function parseStatement(text,today,defaultScope='personal'){
 const csv=parseCSV(text);if(csv.length<2||csv.length>101)throw new FinanceError('El archivo debe tener encabezado y entre 1 y 100 movimientos.');
 const header=csv.shift().map(normalized),index=name=>header.indexOf(name);
 for(const field of ['fecha','descripcion','monto'])if(index(field)<0)throw new FinanceError('Usa las columnas fecha, descripcion y monto. Descarga la plantilla para ver el formato.');
 const occurrences=new Map();return csv.map((cells,i)=>{
  const get=key=>(cells[index(key)]??'').trim();let date=get('fecha');if(/^\d{2}\/\d{2}\/20\d{2}$/.test(date))date=date.slice(6)+'-'+date.slice(3,5)+'-'+date.slice(0,2);validDate(date,{today});
  const raw=get('monto');if(!/^-?\d+$/.test(raw)||!Number.isSafeInteger(Number(raw))||Math.abs(Number(raw))<1||Math.abs(Number(raw))>1000000000)throw new FinanceError(`Fila ${i+2}: ingresa el monto en pesos enteros, sin puntos ni comas.`);
  const description=get('descripcion');if(!description||description.length>150)throw new FinanceError(`Fila ${i+2}: revisa la descripción (máximo 150 caracteres).`);
  const amount=Math.abs(Number(raw)),type=normalized(get('tipo'))|| (Number(raw)<0?'expense':'income'),scope=normalized(get('destino'))||defaultScope;
  const aliases={gasto:'expense',ingreso:'income',omitir:'ignore',negocio:'business',casa:'personal',personal:'personal'};
  const resolvedType=aliases[type]??type,resolvedScope=aliases[scope]??scope;if(!['expense','income','ignore'].includes(resolvedType)||!Object.hasOwn(SCOPES,resolvedScope))throw new FinanceError(`Fila ${i+2}: revisa tipo (ingreso/gasto/omitir) y destino (negocio/personal).`);
  const base=[date,description,Number(raw)].join('|'),occurrence=(occurrences.get(base)??0)+1;occurrences.set(base,occurrence);
  return {date,description,amount,type:resolvedType,scope:resolvedScope,category:get('categoria')||'Otros',sourceKey:get('referencia')?'ref:'+get('referencia'):base+'|'+occurrence};
 });
}
