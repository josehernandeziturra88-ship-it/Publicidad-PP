import {DatabaseSync} from 'node:sqlite';
export class LocalD1 {
 constructor(path=':memory:'){this.sqlite=new DatabaseSync(path);this.sqlite.exec('PRAGMA journal_mode=WAL;');}
 prepare(sql){const db=this.sqlite;return {args:[],bind(...args){this.args=args;return this},async run(){const s=db.prepare(sql);const result=s.run(...this.args);return {success:true,meta:{changes:Number(result.changes)}}},async first(){return db.prepare(sql).get(...this.args)||null},async all(){return {results:db.prepare(sql).all(...this.args),success:true}},sql};}
 async batch(statements){this.sqlite.exec('BEGIN IMMEDIATE');try{const result=[];for(const s of statements){const prepared=this.sqlite.prepare(s.sql);const columns=prepared.columns();if(columns.length)result.push({success:true,results:prepared.all(...s.args)});else{const out=prepared.run(...s.args);result.push({success:true,results:[],meta:{changes:Number(out.changes)}})}}this.sqlite.exec('COMMIT');return result}catch(e){this.sqlite.exec('ROLLBACK');throw e}}
 close(){this.sqlite.close()}
}
