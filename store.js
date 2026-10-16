export const WHATSAPP = '5531993674515';
export const INSTAGRAM = 'https://www.instagram.com/setecelularesegourmet/';
export const PRODUCTS = [
  { id:'headphone', name:'Headphone Bluetooth', short:'Headphone Bluetooth', category:'audio', image:'assets/headphones.webp', tag:'ÁUDIO', tone:'blue', detail:'Sua música em todos os momentos. Consulte marcas, modelos, cores e opções de conexão disponíveis.', spec:'Fone sem fio · Over-ear' },
  { id:'iphone', name:'iPhone 13 Pro', short:'iPhone 13 Pro', category:'celulares', image:'assets/iphone-13-pro.webp', tag:'IPHONE', tone:'green', detail:'Consulte as opções de armazenamento, cor, condição do aparelho e disponibilidade com a equipe SE7E.', spec:'Apple · Consulte as versões' },
  { id:'airpods', name:'AirPods Pro', short:'AirPods Pro', category:'audio', image:'assets/airpods.webp', tag:'SEM FIO', tone:'purple', detail:'Leve sua música com você. Consulte geração, características e disponibilidade com nossa equipe.', spec:'Apple · Fone sem fio' },
  { id:'samsung', name:'Smartphone Samsung', short:'Celular Samsung', category:'celulares', image:'assets/galaxy-s10.webp', tag:'SAMSUNG', tone:'blue', detail:'Encontre um Samsung para o seu dia a dia. A foto representa a linha Galaxy; modelos, memória e cores são confirmados no atendimento.', spec:'Linha Galaxy · Consulte modelos' },
  { id:'watch', name:'Smartwatch', short:'Smartwatch', category:'relogios', image:'assets/smartwatch.webp', tag:'CONECTADO', tone:'green', detail:'Consulte modelos de relógios inteligentes e verifique a compatibilidade com seu celular antes de fazer o pedido.', spec:'Relógio inteligente' },
  { id:'charger', name:'Carregador de tomada', short:'Carregador USB', category:'carregadores', image:'assets/charger.webp', tag:'ESSENCIAL', tone:'blue', detail:'Informe o modelo do seu aparelho para consultar carregadores, potência, conexão e compatibilidade.', spec:'Consulte potência e conexão' },
  { id:'magsafe', name:'Carregador sem fio', short:'Carregador sem fio', category:'carregadores', image:'assets/magsafe.webp', tag:'PRATICIDADE', tone:'purple', detail:'Consulte carregadores sem fio e confirme a compatibilidade do seu aparelho com o atendimento.', spec:'Consulte compatibilidade' },
  { id:'cable', name:'Cabo USB-C', short:'Cabo USB-C', category:'acessorios', image:'assets/cable.webp', tag:'DIA A DIA', tone:'blue', detail:'Cabos para carregar e conectar. Informe a entrada do seu aparelho e consulte tamanhos e modelos.', spec:'Consulte conexões e tamanhos' },
  { id:'case', name:'Capinha para celular', short:'Capinha para celular', category:'acessorios', image:'assets/case.webp', tag:'PROTEÇÃO', tone:'green', detail:'Seu celular, seu estilo. Informe o modelo exato do aparelho e consulte capinhas, cores e materiais.', spec:'Consulte modelos e cores' }
];

export function sanitizeCart(input) {
  if (!Array.isArray(input)) return [];
  const seen = new Set();
  return input.filter(item => item && PRODUCTS.some(p=>p.id===item.id) && Number.isFinite(item.qty) && item.qty > 0 && !seen.has(item.id) && seen.add(item.id))
    .map(item=>({id:item.id,qty:Math.min(99,Math.floor(item.qty))})).filter(item=>item.qty>0);
}
export function updateCart(cart,id,delta) {
  if (!PRODUCTS.some(p=>p.id===id)) return sanitizeCart(cart);
  const next=sanitizeCart(cart).map(item=>({...item}));
  const existing=next.find(item=>item.id===id);
  if(existing) existing.qty=Math.min(99,existing.qty+delta);
  else if(delta>0) next.push({id,qty:Math.min(99,delta)});
  return sanitizeCart(next);
}
export function countCart(cart) { return sanitizeCart(cart).reduce((sum,item)=>sum+item.qty,0); }
export function filterProducts({query='',category='todos',order='destaques'}={}) {
  const normalize=value=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const q=normalize(query.trim());
  const result=PRODUCTS.filter(p=>(category==='todos'||p.category===category)&&(!q||normalize(p.name+' '+p.spec+' '+p.category).includes(q)));
  return order==='az' ? result.sort((a,b)=>a.name.localeCompare(b.name,'pt-BR')) : result;
}
export function orderMessage(cart, details={}) {
  const valid=sanitizeCart(cart);
  if (!valid.length) return '';
  const lines=['Olá, SE7E Celulares! 👋','Gostaria de consultar este pedido:',''];
  for(const item of valid) lines.push(`• ${item.qty}x ${PRODUCTS.find(p=>p.id===item.id).name}`);
  lines.push('',`Quantidade total: ${countCart(valid)} item(ns)`,`Recebimento: ${details.receiving==='entrega'?'Quero consultar entrega':'Retirada na loja'}`);
  if(details.name?.trim()) lines.push(`Nome: ${details.name.trim().slice(0,80)}`);
  if(details.note?.trim()) lines.push(`Observações: ${details.note.trim().slice(0,500)}`);
  lines.push('','Podem confirmar os modelos, valores, disponibilidade e formas de pagamento?','Pedido enviado pelo catálogo SE7E Celulares.');
  return lines.join('\n');
}
export function whatsappLink(message) { return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message)}`; }
