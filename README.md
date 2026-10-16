# SE7E Celulares

Site da SE7E Celulares com catálogo de celulares e acessórios, busca por produto, filtros, carrinho e consulta de pedidos pelo WhatsApp.

- Três produtos por linha no celular.
- Carrinho com quantidades e armazenamento no navegador.
- Finalização pelo WhatsApp com lista dos produtos e observações.
- Imagens locais otimizadas em WebP.
- Valores e disponibilidade sob consulta.

## Editar

Produtos e WhatsApp ficam em `store.js`, a estrutura em `index.html` e a aparência em `styles.css`. As imagens ficam em `assets/`.

## Publicação

GitHub Pages: branch `main`, pasta `/ (root)`. O arquivo `.nojekyll` permite servir os arquivos estáticos diretamente.

## Verificar

`npm run check` e `npm test`.

## Imagens

Fachada enviada pelo usuário. Fotos ilustrativas de produtos da Apple Store CDN, DummyJSON e Unsplash; não representam disponibilidade em estoque. Banners gerados com imagegen, com os prompts em `ASSETS.md`.
