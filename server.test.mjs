import test from 'node:test';
import assert from 'node:assert/strict';
import {createApp} from './server.mjs';
import {demoPieces} from './dist/engine.mjs';

test('contas reais: cadastro, login, isolamento, persistência e logout',async t=>{
 const origin='http://127.0.0.1';const server=await createApp({databasePath:':memory:',origin});await new Promise(r=>server.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>server.close(r)));const base='http://127.0.0.1:'+server.address().port;
 function client(){let jar={},csrf='';return async(path,method='GET',data)=>{const response=await fetch(base+'/api/'+path,{method,headers:{Cookie:Object.entries(jar).map(([k,v])=>k+'='+v).join('; '),Origin:origin,'Content-Type':'application/json','X-Youfit-CSRF':csrf},...(data!==undefined?{body:JSON.stringify(data)}:{})});for(const c of response.headers.getSetCookie()){const [k,v]=c.split(';')[0].split('=');jar[k]=v}const body=await response.json();if(body.csrf)csrf=body.csrf;return{status:response.status,body}}}
 const alice=client(),bob=client();
 assert.equal((await alice('wardrobe')).status,401);
 assert.equal((await alice('auth/register','POST',{name:'A'})).status,403);
 await alice('bootstrap');await bob('bootstrap');
 assert.equal((await alice('auth/register','POST',{name:'Alice',email:'alice@example.test',password:'short'})).status,400);
 const a=await alice('auth/register','POST',{name:'Alice',email:'alice@example.test',password:'alice-password-123'});assert.equal(a.status,201);assert.equal(a.body.user.name,'Alice');assert.equal(a.body.user.password,undefined);
 assert.deepEqual((await alice('wardrobe')).body,{pieces:[],favorites:[]});
 const state={pieces:demoPieces.slice(0,3),favorites:['camiseta-preta|jeans-preto|tenis-preto|Rock']};assert.equal((await alice('wardrobe','PUT',state)).status,200);
 assert.equal((await alice('wardrobe','PUT',{pieces:[{...demoPieces[0],photo:'javascript:alert(1)'}],favorites:[]})).status,400);
 assert.equal((await bob('auth/register','POST',{name:'Bob',email:'bob@example.test',password:'bob-password-123'})).status,201);
 assert.deepEqual((await bob('wardrobe')).body,{pieces:[],favorites:[]});assert.deepEqual((await alice('wardrobe')).body,state);
 assert.equal((await alice('auth/logout','POST',{})).status,200);assert.equal((await alice('wardrobe')).status,401);
 assert.equal((await alice('auth/login','POST',{email:'alice@example.test',password:'wrong-password-123'})).status,401);
 assert.equal((await alice('auth/login','POST',{email:'alice@example.test',password:'alice-password-123'})).status,200);
 assert.deepEqual((await alice('wardrobe')).body,state);
 assert.equal((await alice('auth/google','POST',{credential:'fake'})).status,503);
 assert.equal((await alice('photos/start','POST',{accessToken:'fake'})).status,503);
 assert.equal((await alice('catalog')).body.pieces.length,7);
 const traversal=await fetch(base+'/.env');assert.equal(traversal.status,404);
});
