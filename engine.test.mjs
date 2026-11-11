import test from 'node:test';
import assert from 'node:assert/strict';
import {combinations,demoPieces,styles} from './dist/engine.mjs';
import {newPieceId} from './dist/piece-id.mjs';

test('gera identificador de peça quando randomUUID não está disponível na rede HTTP',()=>{
 const source={getRandomValues(bytes){bytes.fill(171);return bytes}};
 assert.match(newPieceId(source),/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/);
});

test('camiseta preta + calça preta + tênis de lona forma um look rock',()=>{
 const pieces=demoPieces.slice(0,3);
 const looks=combinations(pieces,'Rock');
 assert.equal(looks.length,1);
 assert.deepEqual(looks[0].pieces.map(p=>p.name),['Camiseta preta','Calça jeans preta','Tênis de lona preto']);
 assert.equal(looks[0].score,34);
});
test('não gera looks incompletos nem mistura categorias',()=>{
 assert.deepEqual(combinations(demoPieces.filter(p=>p.type!=='shoes'),'Rock'),[]);
 for(const style of styles) for(const look of combinations(demoPieces,style)){
  assert.deepEqual(look.pieces.map(p=>p.type),['top','bottom','shoes']);
  assert.ok(look.pieces.filter(p=>p.styles.includes(style)).length>=2);
 }
});
test('remoção de peça elimina as combinações que dependem dela',()=>{
 const before=combinations(demoPieces,'Rock');
 const after=combinations(demoPieces.filter(p=>p.id!=='camiseta-preta'),'Rock');
 assert.ok(before.length>after.length);
 assert.ok(after.every(l=>l.pieces.every(p=>p.id!=='camiseta-preta')));
});
test('combinações possuem identificadores únicos e priorizam a aderência ao estilo',()=>{
 for(const style of styles){const result=combinations(demoPieces,style);assert.equal(new Set(result.map(l=>l.id)).size,result.length);assert.ok(result.every((l,i)=>!i||result[i-1].score>=l.score));}
});
