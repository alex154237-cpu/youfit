import {mkdir,writeFile} from 'node:fs/promises';
const entries=[
 ['black-tee','Camiseta-negra.jpg'],
 ['black-jeans',"Levi's 501 black.jpg"],
 ['black-sneakers','Converse-Classic Chuck.jpg'],
 ['white-tee','Transcription-wh-tshirt.png'],
 ['blue-jeans','Acne Jeans Nye cowboybukser.jpg'],
 ['white-sneakers','Converse All Star High White (4649858686).jpg'],
 ['red-sneakers','Converse All Star Red High (4649851394).jpg']
];
await mkdir(new URL('../dist/assets/',import.meta.url),{recursive:true});
const catalog=[];
for(const [slug,title] of entries){
 const query=new URLSearchParams({action:'query',format:'json',prop:'imageinfo',iiprop:'url|extmetadata',iiurlwidth:'600',titles:'File:'+title});
 const response=await fetch('https://commons.wikimedia.org/w/api.php?'+query,{headers:{'User-Agent':'YoufitPrototype/0.2 (clothing catalog attribution)'}});
 if(!response.ok)throw Error('Metadata '+response.status);
 const data=await response.json();const info=Object.values(data.query.pages)[0].imageinfo?.[0];if(!info)throw Error('Missing '+title);
 const url=info.thumburl||info.url;const image=await fetch(url);if(!image.ok)throw Error('Image '+image.status+' '+title);
 const ext=image.headers.get('content-type')?.includes('png')?'png':'jpg';
 const file=`assets/${slug}.${ext}`;await writeFile(new URL('../dist/'+file,import.meta.url),Buffer.from(await image.arrayBuffer()));
 const meta=info.extmetadata;const plain=s=>String(s||'').replace(/<[^>]*>/g,'').replace(/&amp;/g,'&');
 catalog.push({slug,file,title,source:info.descriptionurl,author:plain(meta.Artist?.value),license:meta.LicenseShortName?.value,licenseUrl:meta.LicenseUrl?.value,original:info.url,changes:'Redimensionada para até 600 px; sem recoloração.'});
 console.log('Saved',slug);
}
await writeFile(new URL('../dist/assets/credits.json',import.meta.url),JSON.stringify(catalog,null,2));
