import test from 'node:test';
import assert from 'node:assert/strict';
import {PRODUCTS,sanitizeCart,updateCart,countCart,filterProducts,orderMessage,whatsappLink,WHATSAPP} from '../store.js';

test('o carrinho soma unidades, preserva outros produtos e remove ao zerar',()=>{
 let cart=updateCart([],'iphone',1);cart=updateCart(cart,'iphone',1);cart=updateCart(cart,'airpods',1);
 assert.equal(countCart(cart),3);assert.deepEqual(cart,[{id:'iphone',qty:2},{id:'airpods',qty:1}]);
 cart=updateCart(cart,'airpods',-1);assert.deepEqual(cart,[{id:'iphone',qty:2}]);
 cart=updateCart(cart,'iphone',-2);assert.deepEqual(cart,[]);
});
test('recuperação de armazenamento inválido não introduz produtos inexistentes ou quantidades incorretas',()=>{
 assert.deepEqual(sanitizeCart({}),[]);
 assert.deepEqual(sanitizeCart([{id:'iphone',qty:5},{id:'inexistente',qty:1},{id:'iphone',qty:2},{id:'airpods',qty:-1},{id:'case',qty:Infinity},null,{id:'watch',qty:400}]),[{id:'iphone',qty:5},{id:'watch',qty:99}]);
 const initial=[{id:'iphone',qty:99}];assert.deepEqual(updateCart(initial,'iphone',1),initial);assert.deepEqual(updateCart(initial,'desconhecido',1),initial);
});
test('busca ignora acentos e pode ser combinada com categoria',()=>{
 assert.equal(filterProducts({query:'relogio'}).length,1);
 assert.deepEqual(filterProducts({category:'audio'}).map(p=>p.id),['headphone','airpods']);
 assert.equal(filterProducts({query:'Samsung',category:'audio'}).length,0);
 assert.equal(filterProducts({query:'  iphone  '})[0].id,'iphone');
 assert.equal(filterProducts({query:'nadaexiste'}).length,0);
 assert.equal(new Set(PRODUCTS.map(p=>p.image)).size,PRODUCTS.length);
});
test('checkout envia a lista e quantidades corretas, sem inventar total ou preço',()=>{
 const cart=[{id:'iphone',qty:2},{id:'cable',qty:1}];
 const msg=orderMessage(cart,{name:'  Carlos  ',receiving:'entrega',note:'Cor azul & cabo de 2m'});
 assert.ok(msg.includes('2x iPhone 13 Pro'));assert.ok(msg.includes('1x Cabo USB-C'));
 assert.ok(msg.includes('Quantidade total: 3'));assert.ok(msg.includes('Nome: Carlos'));
 assert.ok(msg.includes('Quero consultar entrega'));assert.ok(msg.includes('Cor azul & cabo de 2m'));
 assert.ok(!msg.includes('R$'));assert.equal(orderMessage([]),'');
 const url=new URL(whatsappLink(msg));assert.equal(url.hostname,'wa.me');assert.equal(url.pathname,`/${WHATSAPP}`);assert.equal(url.searchParams.get('text'),msg);
 assert.ok(orderMessage(cart).includes('Retirada na loja'));
});
