// Shared calculations. Amounts are whole Chilean pesos; quantities may have
// three decimal places. Financial records never become public site content.
export const SALES_START = '2026-10-25';
export const CATEGORIES = ['Ingredientes', 'Envases', 'Gas y energía', 'Sueldos', 'Arriendo', 'Servicios', 'Equipamiento', 'Impuestos', 'Alimentación casa', 'Salud', 'Transporte', 'Educación', 'Otros'];
export const SCOPES = {business:'Negocio', personal:'Personal'};
export const ACCOUNT_TYPES = {bank:'Cuenta bancaria / débito', cash:'Efectivo', credit:'Tarjeta de crédito'};
export const UNITS = {kg: {family: 'weight', factor: 1000, label: 'kg'}, g: {family: 'weight', factor: 1, label: 'g'}, l: {family: 'volume', factor: 1000, label: 'litros'}, ml: {family: 'volume', factor: 1, label: 'ml'}, unidad: {family: 'count', factor: 1, label: 'unidades'}};
export class FinanceError extends Error { constructor(message, status = 400) { super(message); this.status = status; } }
const fail = message => { throw new FinanceError(message); };
export function todayChile(now = new Date()) {
 const parts = new Intl.DateTimeFormat('en-CA', {timeZone: 'America/Santiago', year: 'numeric', month: '2-digit', day: '2-digit'}).formatToParts(now);
 const get = type => parts.find(p => p.type === type).value;
 return `${get('year')}-${get('month')}-${get('day')}`;
}
function text(value, label, max = 200, optional = false) {
 if (typeof value !== 'string') fail(`${label}: ingresa un texto.`);
 const v = value.trim();
 if ((!optional && !v) || v.length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(v)) fail(`${label}: revisa el texto (máximo ${max} caracteres).`);
 return v;
}
function num(v, label, min = 0, max = 1000000000, decimals = 0) {
 if (typeof v !== 'number' || !Number.isFinite(v) || v < min || v > max || Math.abs(v * 10 ** decimals - Math.round(v * 10 ** decimals)) > 0.00001) fail(`${label}: ingresa un número válido${decimals ? '' : ' en pesos enteros'}.`);
 return v;
}
export function validDate(v, {sales = false, today = todayChile()} = {}) {
 if (typeof v !== 'string' || !/^20\d{2}-\d{2}-\d{2}$/.test(v) || !Number.isFinite(Date.parse(v + 'T12:00:00Z')) || new Date(v + 'T12:00:00Z').toISOString().slice(0,10) !== v) fail('Revisa la fecha.');
 if (v > today) fail('Solo puedes registrar movimientos de hoy o de días anteriores.');
 if (sales && v < SALES_START) fail('El seguimiento de ventas comienza el 25 de octubre de 2026.');
 return v;
}
export function validMonth(v) { if (typeof v !== 'string' || !/^20\d{2}-(0[1-9]|1[0-2])$/.test(v)) fail('Selecciona un mes válido.'); return v; }
export function validId(v) { if (typeof v !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v)) fail('Identificador inválido.'); return v; }
function unit(v) { if (!Object.hasOwn(UNITS, v)) fail('Selecciona una unidad válida.'); return v; }
function list(v, label, max, min = 0) { if (!Array.isArray(v) || v.length < min || v.length > max) fail(`${label}: revisa la cantidad de filas (máximo ${max}).`); return v; }
function scope(v) {if(!Object.hasOwn(SCOPES,v))fail('Selecciona negocio o personal.');return v;}
const accountId = v => v ? validId(v) : '';
export function expenseSplit(expense) {
 if(expense.lines?.length){const business=expense.lines.reduce((sum,l)=>sum+Math.round(l.amount*(l.businessQuantity??(expense.scope==='personal'?0:l.quantity))/l.quantity),0);return {business,personal:expense.total-business};}
 return expense.scope==='personal'?{business:0,personal:expense.total}:{business:expense.total,personal:0};
}
export function distributeLineTotal(lines,total){
 if(!Number.isSafeInteger(total)||total<1||!lines.length)fail('Indica un total y al menos una línea.');
 const sum=lines.reduce((s,l)=>s+l.amount,0);if(!Number.isFinite(sum)||sum<=0||lines.some(l=>!Number.isFinite(l.amount)||l.amount<0))fail('Indica los importes base de las líneas antes de repartir.');
 const parts=lines.map((l,i)=>({i,raw:total*(l.amount/sum)})),values=parts.map(p=>Math.floor(p.raw));let remaining=total-values.reduce((s,n)=>s+n,0);
 for(const p of parts.sort((a,b)=>(b.raw-Math.floor(b.raw))-(a.raw-Math.floor(a.raw))||a.i-b.i)){if(remaining-->0)values[p.i]++;}
 return values;
}
export function validateFinance(kind, input, {today = todayChile()} = {}) {
 if (!input || typeof input !== 'object' || Array.isArray(input)) fail('Datos inválidos.');
 const notes = () => text(input.notes ?? '', 'Notas', 1000, true);
 if (kind === 'sale') {
  const date = validDate(input.date, {sales: true, today});
  const data = {date, notes: notes()};
  for (const key of ['cash', 'card', 'transfer', 'other']) data[key] = num(input[key], 'Ventas');
  data.accounts={};for(const key of ['cash','card','transfer','other'])data.accounts[key]=accountId(input.accounts?.[key]);
  return data;
 }
 if (kind === 'expense') {
  const data = {date: validDate(input.date, {today}), invoiceDate:validDate(input.invoiceDate??input.date,{today}), supplier: text(input.supplier, 'Proveedor', 150), number: text(input.number ?? '', 'Número de comprobante', 80, true), category: input.category, total: num(input.total, 'Total del gasto', 1), notes: notes(), receiptId: input.receiptId ? validId(input.receiptId) : '', accountId:accountId(input.accountId), scope:input.scope??'business', lines: []};
  if(!['business','personal','mixed'].includes(data.scope))fail('Selecciona el destino de la compra.');
  if (!CATEGORIES.includes(data.category)) fail('Selecciona una categoría de gasto.');
  data.lines = list(input.lines ?? [], 'Detalle', 60).map(line => {
   if (!line || typeof line !== 'object') fail('Revisa el detalle de la compra.');
   const quantity=num(line.quantity,'Cantidad comprada',0.001,1000000,3),businessQuantity=num(line.businessQuantity??(data.scope==='personal'?0:quantity),'Cantidad para el negocio',0,quantity,3);
   return {description: text(line.description, 'Producto comprado', 150), ingredientId: businessQuantity>0&&line.ingredientId ? validId(line.ingredientId) : '', quantity, businessQuantity, unit: unit(line.unit), amount: num(line.amount, 'Importe de la línea', 1)};
  });
  if (data.lines.length && data.lines.reduce((sum, line) => sum + line.amount, 0) !== data.total) fail('La suma del detalle debe coincidir con el total del comprobante. Incluye impuestos, descuentos y otros cargos en las líneas.');
  if(data.scope==='mixed'&&!data.lines.length)fail('Agrega el detalle para separar una compra mixta.');
  if(data.lines.length){const split=expenseSplit(data);data.scope=split.business===0?'personal':split.personal===0?'business':'mixed';}
  return data;
 }
 if(kind==='account'){
  if(!Object.hasOwn(ACCOUNT_TYPES,input.type))fail('Selecciona el tipo de cuenta.');
  const last4=text(input.last4??'','Últimos cuatro dígitos',4,true);if(last4&&!/^\d{4}$/.test(last4))fail('Ingresa solo los últimos cuatro dígitos o deja el campo vacío.');
  return {name:text(input.name,'Nombre de la cuenta',100),bank:text(input.bank??'','Banco',100,true),last4,type:input.type,scope:scope(input.scope),openingDate:validDate(input.openingDate,{today}),openingBalance:num(input.openingBalance,input.type==='credit'?'Deuda inicial':'Saldo inicial',-1000000000),creditLimit:input.type==='credit'?num(input.creditLimit,'Cupo total'):0,paymentDay:input.type==='credit'?num(input.paymentDay??0,'Día de pago',0,31):0,closingDay:input.type==='credit'?num(input.closingDay??0,'Día de facturación',0,31):0};
 }
 if(kind==='movement'){
  if(!['income','transfer','adjustment'].includes(input.type))fail('Selecciona el tipo de movimiento.');
  const result={type:input.type,date:validDate(input.date,{today}),scope:scope(input.scope),description:text(input.description,'Descripción',150),amount:num(input.amount,'Importe',input.type==='adjustment'?-1000000000:1),fromAccountId:input.type==='transfer'?validId(input.fromAccountId):'',toAccountId:validId(input.toAccountId),notes:notes()};
  if(result.type==='adjustment'&&result.amount===0)fail('El ajuste debe ser distinto de cero.');
  if(result.type==='transfer'&&result.fromAccountId===result.toAccountId)fail('Selecciona dos cuentas diferentes para la transferencia.');return result;
 }
 if (kind === 'ingredient') return {name: text(input.name, 'Ingrediente o insumo', 120), unit: unit(input.unit), unitCost: num(input.unitCost, 'Costo por unidad', 0, 100000000, 4)};
 if (kind === 'recipe') return {name: text(input.name, 'Producto o receta', 150), portions: num(input.portions, 'Porciones obtenidas', 1, 10000), price: num(input.price, 'Precio de venta por porción'), overhead: num(input.overhead, 'Otros costos de la preparación'), parts: list(input.parts, 'Ingredientes de la receta', 40, 1).map(part => {if(!part||typeof part!=='object')fail('Revisa los ingredientes de la receta.');return {ingredientId: validId(part.ingredientId), quantity: num(part.quantity, 'Cantidad utilizada', 0.001, 1000000, 3), unit: unit(part.unit), waste: num(part.waste, 'Merma (%)', 0, 95, 2)};})};
 fail('Tipo de registro no disponible.');
}
export function convertedQuantity(quantity, from, to) {
 if (!UNITS[from] || !UNITS[to] || UNITS[from].family !== UNITS[to].family) return null;
 return quantity * UNITS[from].factor / UNITS[to].factor;
}
export function costRecipe(recipe, ingredients, costs = {}) {
 const parts = recipe.parts.map(part => {
  const ingredient = ingredients.find(i => i.id === part.ingredientId);
  const quantity = ingredient ? convertedQuantity(part.quantity, part.unit, ingredient.unit) : null;
  const unitCost = ingredient ? (costs[ingredient.id]?.unitCost ?? ingredient.unitCost) : null;
  const cost = Number.isFinite(quantity) && quantity>0 && unitCost > 0 && Number.isFinite(part.waste) && part.waste>=0 && part.waste<=95 ? quantity / (1 - part.waste / 100) * unitCost : null;
  return {...part, name: ingredient?.name || 'Insumo no disponible', cost};
 });
 const complete = parts.length>0 && parts.every(p => p.cost !== null) && Number.isInteger(recipe.portions) && recipe.portions>0 && Number.isFinite(recipe.overhead) && recipe.overhead>=0;
 const batchCost = complete ? parts.reduce((s, p) => s + p.cost, recipe.overhead) : null;
 const portionCost = complete ? batchCost / recipe.portions : null;
 return {parts, complete, batchCost, portionCost, margin: complete ? recipe.price - portionCost : null, marginPercent: complete && recipe.price > 0 ? (recipe.price - portionCost) / recipe.price * 100 : null};
}
export function summarizeMonth(month, sales, expenses, today = todayChile()) {
 validMonth(month);
 const start = month + '-01', last = new Date(Date.UTC(Number(month.slice(0,4)), Number(month.slice(5,7)), 0)).toISOString().slice(0,10);
 const byDay = new Map(sales.filter(s => s.date.startsWith(month)).map(s => [s.date, s]));
 const days = [];
 for (let day = 1; day <= Number(last.slice(-2)); day++) {
  const date = `${month}-${String(day).padStart(2,'0')}`, sale = byDay.get(date);
  days.push({date, status: date < SALES_START ? 'before' : date > today ? 'future' : sale ? 'recorded' : 'missing', total: sale ? sale.cash + sale.card + sale.transfer + sale.other : null});
 }
 const totals = {cash: 0, card: 0, transfer: 0, other: 0};
 for (const s of byDay.values()) for (const key of Object.keys(totals)) totals[key] += s[key];
 const revenue = Object.values(totals).reduce((s, v) => s + v, 0);
 const outflow = expenses.filter(e => e.date.startsWith(month)).reduce((s, e) => s + expenseSplit(e).business, 0);
 return {days, totals, revenue, outflow, cashResult: revenue - outflow, recorded: days.filter(d => d.status === 'recorded').length, missing: days.filter(d => d.status === 'missing').length, started: last >= SALES_START && today >= SALES_START && start <= today};
}
// Prefix spreadsheet formulas in user text. Numeric values stay numeric.
export function csvCell(value) { let s = String(value ?? ''); if (typeof value === 'string' && /^[\s]*[=+@\-\t\r]/.test(s)) s = "'" + s; return '"' + s.replaceAll('"', '""') + '"'; }
