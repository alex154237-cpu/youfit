export const styles = ['Rock', 'Casual', 'Esportivo', 'Elegante', 'Streetwear'];
export const colors = { preto:'#292c2b', branco:'#f9f8ee', cinza:'#929591', azul:'#627e96', bege:'#c9ba9e', marrom:'#81604b', verde:'#718565', vermelho:'#b8584d', rosa:'#d8a4ac', amarelo:'#dbbd63' };
export const types = {top:'Parte de cima',bottom:'Parte de baixo',shoes:'Calçado'};
export function combinations(pieces, style) {
 const groups = Object.keys(types).map(type => pieces.filter(p => p.type === type));
 const result = [];
 for (const top of groups[0]) for (const bottom of groups[1]) for (const shoes of groups[2]) {
  const outfit = [top,bottom,shoes];
  const matches = outfit.filter(p => p.styles.includes(style)).length;
  if(matches < 2) continue;
  const neutral = ['preto','branco','cinza','bege','marrom'];
  const harmonious = new Set(outfit.map(p=>p.color)).size <= 2 || outfit.filter(p=>neutral.includes(p.color)).length >= 2;
  result.push({id:outfit.map(p=>p.id).join('|')+'|'+style, pieces:outfit,style,score:matches*10+(harmonious?4:0),reason: harmonious?'Uma paleta fácil de combinar, com a sua personalidade.':'Um toque de contraste para dar presença ao look.'});
 }
 return result.sort((a,b)=>b.score-a.score || a.id.localeCompare(b.id));
}
export function illustration(type, color) {
 const fill = colors[color] || colors.preto;
 const shapes = {
 top:`<path d="M55 30 25 45 8 82 35 96 47 76 47 164 133 164 133 76 145 96 172 82 155 45 125 30Q90 55 55 30Z"/><path d="M66 34Q90 68 114 34M53 155H127M34 84 17 76M146 84 163 76" fill="none" stroke="#ffffff35" stroke-width="3"/>`,
 bottom:`<path d="M49 17H132L145 176 102 180 90 85 78 180 35 176Z"/><path d="M49 30H133M90 20V84M53 33Q57 52 73 52M128 33Q125 52 109 52M40 167 76 170M104 170 140 167" fill="none" stroke="#ffffff40" stroke-width="2"/>`,
 shoes:`<path d="M31 65H75L83 113 144 132Q165 138 164 155H22L19 139Z"/><path d="M22 146H163V160H21Z" fill="#eeeee5"/><path d="M83 114 106 122 89 140H61L55 74H74Z" fill="#eeeee5"/><path d="M73 104 88 110M76 115 100 120M83 127 112 131" stroke="#e7e7de" stroke-width="3"/><circle cx="45" cy="103" r="11" fill="#eeeee5"/><path d="m45 96 2 5 6 1-5 3 2 6-5-4-5 4 2-6-5-3 6-1Z" fill="${fill}"/>`
 };
 return `<svg viewBox="0 0 180 195" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g fill="${fill}" stroke="#24372d35" stroke-width="1.5" stroke-linejoin="round">${shapes[type]||shapes.top}</g></svg>`;
}
export const demoPieces = [
 ['camiseta-preta','Camiseta preta','top','preto',['Rock','Casual','Streetwear'],'black-tee.jpg'],
 ['jeans-preto','Calça jeans preta','bottom','preto',['Rock','Casual','Streetwear'],'black-jeans.jpg'],
 ['tenis-preto','Tênis de lona preto','shoes','preto',['Rock','Casual','Streetwear'],'black-sneakers.jpg'],
 ['camiseta-branca','Camiseta branca','top','branco',['Casual','Esportivo','Streetwear'],'white-tee.png'],
 ['jeans-azul','Calça jeans azul','bottom','azul',['Casual','Streetwear'],'blue-jeans.jpg'],
 ['tenis-branco','Tênis branco','shoes','branco',['Casual','Esportivo','Streetwear'],'white-sneakers.jpg'],
 ['tenis-vermelho','Tênis de lona vermelho','shoes','vermelho',['Rock','Casual','Streetwear'],'red-sneakers.jpg']
].map(([id,name,type,color,styles,file])=>({id,name,type,color,styles,photo:'assets/'+file,demo:true,catalog:true}));
