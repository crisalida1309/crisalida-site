# Site da CrisálidA

Site estático (HTML/CSS/JS puro), sem dependências, pronto para publicar de graça.

## Estrutura
```
index.html
styles.css
script.js
assets/img/   → fotos e artes do EP
```

## Como publicar

### Opção 1 — Vercel (recomendado, mais rápido)
1. Acesse https://vercel.com e crie uma conta grátis (pode usar GitHub ou e-mail).
2. Clique em **Add New → Project**.
3. Escolha **"Deploy without Git"** (ou arraste a pasta) e envie esta pasta inteira (`crisalida-site`).
4. Em alguns segundos o site estará no ar em um link como `crisalida.vercel.app`.
5. Quer trocar o nome do link? Vá em **Settings → Domains** e edite o subdomínio.

### Opção 2 — Netlify (arrastar e soltar)
1. Acesse https://app.netlify.com/drop
2. Arraste esta pasta inteira na página.
3. Pronto — link tipo `crisalida.netlify.app`.

### Opção 3 — GitHub Pages
1. Crie um repositório novo no GitHub (ex: `crisalida-site`).
2. Suba todos os arquivos desta pasta para o repositório (pelo site do GitHub: **Add file → Upload files**).
3. Vá em **Settings → Pages**, em "Source" escolha a branch `main` e pasta `/root`.
4. Salve. Em 1–2 minutos o site estará em `seuusuario.github.io/crisalida-site`.

## Atualizar o conteúdo depois
- Textos e links: edite `index.html` (procure a seção correspondente, ex: `<!-- SOBRE -->`).
- Cores: edite as variáveis no topo do `styles.css` (`:root { ... }`).
- Trocar fotos: substitua os arquivos em `assets/img/` mantendo o mesmo nome, ou troque o `src=""` no `index.html`.
- Link do Spotify: quando estiver no ar, troque a pill "Spotify — em breve" na seção do EP por um link, igual ao botão do YouTube.

## O que falta você adicionar quando tiver
- Link do Spotify do EP "Nekyialismo"
- Datas de próximos shows (posso montar uma seção de agenda quando tiver confirmado)
