import { PRODUCTS, sanitizeCart, updateCart, countCart, filterProducts, orderMessage, whatsappLink } from './store.js';

const $=selector=>document.querySelector(selector);
const $$=selector=>[...document.querySelectorAll(selector)];
const icon=name=>`<svg class="icon" aria-hidden="true"><use href="#i-${name}"/></svg>`;
const escapeHTML=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const state={category:'todos',query:'',order:'destaques',all:false};
const cartKey='se7e-carrinho-v1';
let cart=[];
try{cart=sanitizeCart(JSON.parse(localStorage.getItem(cartKey)||'[]'));}catch{cart=[];}
let toastTimer;
let searchTimer;
let activeProduct=null;

function productCard(product){
  return `<article class="product-card" data-product="${product.id}">
    <button class="product-photo ${product.id==='headphone'?'photographic':''}" data-details="${product.id}" aria-label="Ver detalhes de ${escapeHTML(product.name)}">
      <span class="product-badge ${product.tone}">${product.tag}</span>
      <img src="${product.image}" alt="${escapeHTML(product.name)}" width="600" height="600" loading="lazy" decoding="async">
    </button>
    <div class="product-content"><button class="product-name" data-details="${product.id}">${escapeHTML(product.short)}</button><p class="product-spec">${escapeHTML(product.spec)}</p><div class="product-bottom"><span class="product-price"><small>Valor sob</small><strong>consulta</strong></span><button class="add-button" data-add="${product.id}" aria-label="Adicionar ${escapeHTML(product.name)} ao carrinho">${icon('cart')}</button></div></div>
  </article>`;
}
function renderProducts(){
  const filtering=state.query.trim()!==''||state.category!=='todos'||state.all||state.order!=='destaques';
  const featured=$('.featured-section');
  featured.hidden=filtering;
  let result=filterProducts(state);
  if(!filtering) result=result.slice(3);
  $('#featured-grid').innerHTML=PRODUCTS.slice(0,3).map(productCard).join('');
  $('#catalog-grid').innerHTML=result.map(productCard).join('');
  $('#results-count').textContent=`${result.length} ${result.length===1?'produto':'produtos'} ${filtering?'encontrados':'para explorar'}`;
  $('#empty-results').hidden=result.length>0;
  $('#reset-filter').hidden=!filtering;
  $('#search-clear').hidden=state.query==='';
  const names={todos:'Encontre sua próxima conexão',celulares:'Celulares para o seu dia',audio:'Seu som. Seu momento.',relogios:'Mais conexão no seu pulso',carregadores:'Energia para acompanhar você',acessorios:'Detalhes que fazem a diferença'};
  $('#catalog-title').textContent=state.query?`Resultados para “${state.query.slice(0,50)}”`:names[state.category];
  $$('.category[data-category]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.category===state.category)));
  const radio=$(`#filter-form input[value="${state.category}"]`);
  if(radio)radio.checked=true;
}
function persistCart(){try{localStorage.setItem(cartKey,JSON.stringify(cart));}catch{}}
function renderCart(){
  const count=countCart(cart);
  $$('.cart-count').forEach(el=>{el.textContent=count>99?'99+':String(count);el.hidden=count===0;});
  $$('[data-cart]').filter(el=>el.id!=='toast').forEach(el=>el.setAttribute('aria-label',`Abrir carrinho, ${count} ${count===1?'item':'itens'}`));
  $('#cart-title-count').textContent=`(${count})`;
  $('#cart-empty').hidden=count>0;
  $('#cart-filled').hidden=count===0;
  $('#cart-items').innerHTML=cart.map(item=>{
    const product=PRODUCTS.find(p=>p.id===item.id);
    return `<article class="cart-line"><img class="cart-line-image" src="${product.image}" alt="${escapeHTML(product.name)}" width="80" height="80"><div class="cart-line-copy"><h3>${escapeHTML(product.name)}</h3><span>Valor sob consulta</span><div class="quantity-control" role="group" aria-label="Quantidade de ${escapeHTML(product.name)}"><button type="button" data-qty="${product.id}" data-delta="-1" aria-label="Diminuir quantidade de ${escapeHTML(product.name)}">${icon('minus')}</button><strong aria-live="polite">${item.qty}</strong><button type="button" data-qty="${product.id}" data-delta="1" ${item.qty>=99?'disabled':''} aria-label="Aumentar quantidade de ${escapeHTML(product.name)}">${icon('plus')}</button></div></div><button class="remove-item" data-remove="${product.id}" aria-label="Remover ${escapeHTML(product.name)}">${icon('trash')}</button></article>`;
  }).join('');
}
function notify(message){
  const toast=$('#toast');
  toast.querySelector('span').textContent=message;
  toast.hidden=false;
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>toast.hidden=true,3500);
}
function addProduct(id){
  const p=PRODUCTS.find(product=>product.id===id);
  if(!p)return;
  const existing=cart.find(item=>item.id===id);
  if(existing?.qty>=99){notify('Limite de 99 unidades por produto.');return;}
  cart=updateCart(cart,id,1);persistCart();renderCart();
  notify(`${p.short} no carrinho`);
  $$(`[data-add="${id}"]`).forEach(button=>{button.classList.add('added');button.innerHTML=icon('check');setTimeout(()=>{if(button.isConnected){button.classList.remove('added');button.innerHTML=icon('cart');}},1100);});
}
function closePanels(){
  $$('dialog[open]').forEach(dialog=>dialog.close());
  document.body.classList.remove('dialog-open');
}
function openPanel(id){
  closePanels();
  const dialog=document.getElementById(id);
  if(!dialog)return;
  dialog.showModal();
  document.body.classList.add('dialog-open');
  $('#toast').hidden=true;
}
function openProduct(id){
  const product=PRODUCTS.find(p=>p.id===id);
  if(!product)return;
  activeProduct=id;
  $('#product-detail').innerHTML=`<img class="detail-photo" src="${product.image}" width="600" height="600" alt="${escapeHTML(product.name)}"><div class="detail-copy"><span class="product-badge ${product.tone}">${product.tag}</span><h2 id="product-title">${escapeHTML(product.name)}</h2><p>${escapeHTML(product.detail)}</p><p class="detail-price">Sob consulta</p><button class="pill" data-detail-add>${icon('cart')} Adicionar ao carrinho</button><small>Foto ilustrativa do modelo. Disponibilidade, versões e valores confirmados no atendimento.</small></div>`;
  openPanel('product-dialog');
}
function scrollCatalog(){document.getElementById('catalogo').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});}
function resetProducts(){state.category='todos';state.query='';state.order='destaques';state.all=false;$('#search-input').value='';$('#sort-select').value='destaques';renderProducts();}
function setCategory(category){
  state.category=category;state.all=false;state.query='';$('#search-input').value='';
  renderProducts();scrollCatalog();
}
function openChat(message){
  const link=whatsappLink(message);
  const a=document.createElement('a');a.href=link;a.target='_blank';a.rel='noopener noreferrer';document.body.appendChild(a);a.click();a.remove();
  return link;
}

document.addEventListener('click',event=>{
  const target=event.target.closest('button,a');
  if(!target)return;
  if(target.hasAttribute('data-close'))closePanels();
  if(target.dataset.open)openPanel(target.dataset.open);
  if(target.hasAttribute('data-cart')){renderCart();openPanel('cart-dialog');}
  if(target.dataset.add)addProduct(target.dataset.add);
  if(target.dataset.details)openProduct(target.dataset.details);
  if(target.hasAttribute('data-detail-add')&&activeProduct){const id=activeProduct;closePanels();addProduct(id);}
  if(target.dataset.qty){
    const id=target.dataset.qty;const delta=Number(target.dataset.delta);
    const prior=cart.find(item=>item.id===id);
    cart=updateCart(cart,id,delta);persistCart();renderCart();
    const focus=$(`[data-qty="${id}"][data-delta="${delta}"]`);
    if(focus&&!focus.disabled)focus.focus({preventScroll:true});
    else if(delta<0&&prior?.qty===1){const fallback=$('#cart-items button')||$('#cart-empty button');fallback?.focus({preventScroll:true});}
  }
  if(target.dataset.remove){cart=cart.filter(item=>item.id!==target.dataset.remove);persistCart();renderCart();const fallback=$('#cart-items button')||$('#cart-empty button');fallback?.focus({preventScroll:true});}
  if(target.dataset.category)setCategory(target.dataset.category);
  if(target.hasAttribute('data-browse-accessories')){setCategory('acessorios');}
  if(target.hasAttribute('data-service')){closePanels();openChat('Olá, SE7E Celulares! Gostaria de consultar a assistência técnica. Meu aparelho é: ');}
  if(target.hasAttribute('data-contact')){target.href=whatsappLink('Olá, SE7E Celulares! Vim pelo site e gostaria de falar com a equipe.');}
  if(target.id==='reset-filter'||target.id==='empty-reset'){resetProducts();scrollCatalog();}
  if(target.id==='search-clear'){clearTimeout(searchTimer);state.query='';$('#search-input').value='';renderProducts();$('#search-input').focus();}
  if(target.classList.contains('text-link')&&target.getAttribute('href')==='#catalogo'){state.all=true;renderProducts();}
  if(target.classList.contains('bottom-item')&&target.dataset.bottom){
    if(target.dataset.bottom==='destaques'||target.dataset.bottom==='inicio')resetProducts();
    $$('.bottom-item[data-bottom]').forEach(item=>item.classList.toggle('active',item===target));
  }
});

$$('dialog').forEach(dialog=>{
  dialog.addEventListener('close',()=>{if(!$('dialog[open]'))document.body.classList.remove('dialog-open');});
  dialog.addEventListener('click',event=>{
    if(event.target!==dialog)return;
    const rect=dialog.getBoundingClientRect();
    if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();
  });
});
$('#search-input').addEventListener('input',event=>{
  state.query=event.target.value;state.all=false;clearTimeout(searchTimer);
  searchTimer=setTimeout(()=>{renderProducts();if(state.query.trim())scrollCatalog();},300);
});
$('#search-form').addEventListener('submit',event=>{event.preventDefault();clearTimeout(searchTimer);state.query=$('#search-input').value;renderProducts();scrollCatalog();$('#search-input').blur();});
$('#sort-select').addEventListener('change',event=>{state.order=event.target.value;renderProducts();});
$('#filter-form').addEventListener('submit',event=>{event.preventDefault();const category=new FormData(event.currentTarget).get('categoria');closePanels();setCategory(category);});
$('#checkout-form').addEventListener('submit',event=>{
  event.preventDefault();
  const data=new FormData(event.currentTarget);
  const message=orderMessage(cart,{name:data.get('nome'),receiving:data.get('recebimento'),note:data.get('observacoes')});
  if(!message)return;
  const link=openChat(message);
  const fallback=$('#manual-whatsapp');fallback.href=link;fallback.hidden=false;
});
window.addEventListener('storage',event=>{
  if(event.key!==cartKey&&event.key!==null)return;
  try{cart=sanitizeCart(JSON.parse(localStorage.getItem(cartKey)||'[]'));}catch{cart=[];}
  renderCart();
});
$('#year').textContent=new Date().getFullYear();
renderProducts();renderCart();
