# JLO Nutri — Site da Nutricionista Jenifer Lopes Borchardt

Site premium (estático, mobile-first) para apresentação profissional e **venda de consultas nutricionais online**, com foco em **mulheres 35+**.

- **Domínio:** www.jlonutri.com.br (registrado no Registro.br)
- **Stack:** HTML + CSS + JavaScript puro (sem build, sem dependências)
- **Fontes:** Cormorant Garamond (títulos) + Nunito Sans (texto), via Google Fonts

## Estrutura

```
jlonutri/
├── index.html          Página única com todas as seções
├── style.css           Design system + responsivo
├── script.js           Menu, WhatsApp, formulário, animações
├── manifest.json       PWA / ícone
├── robots.txt          SEO
├── sitemap.xml         SEO
└── assets/
    └── images/
        └── favicon.svg  (placeholder do ícone JLO)
```

## Seções do site

1. Hero (chamada principal + credenciais)
2. "Você se reconhece?" — dores do público 35+
3. Sobre a Jenifer (bio + credenciais)
4. Consultas (3 planos com preço e CTA)
5. Como funciona (4 passos)
6. Depoimentos
7. Dúvidas (FAQ)
8. Contato (formulário + WhatsApp)
9. Rodapé (CRN, redes sociais, LGPD)

## ⚙️ O que você precisa preencher (placeholders)

Procure por estes itens e substitua pelos dados reais:

| Onde | O quê |
|------|-------|
| `script.js` → `WHATSAPP_NUMBER` | Número do WhatsApp (ex.: `5553999999999`) |
| `script.js` → `INSTAGRAM_URL` | Link do Instagram |
| `index.html` → `CRN-_ • _____` | Número de registro no CRN (obrigatório por lei) |
| `index.html` → `R$ ___` | Valores das consultas |
| `index.html` → "Foto da Jenifer" | Fotos profissionais (hero e seção Sobre) |
| `index.html` → seção Depoimentos | Depoimentos reais (com autorização) |
| `assets/images/og-share.jpg` | Imagem de compartilhamento (1200×630) |

## Como visualizar localmente

Abra o `index.html` no navegador, ou rode um servidor simples:

```
npx serve .
```

## Publicação

O domínio está no Registro.br. Opções de hospedagem (gratuitas/simples):
- **Netlify** ou **Vercel** — arraste a pasta ou conecte um repositório; depois aponte o DNS do Registro.br.
- **GitHub Pages** — hospedagem via repositório.
- **Hostinger / hosts tradicionais** — envie os arquivos por FTP.

Em qualquer opção, configure no Registro.br os registros DNS (A / CNAME) que o serviço de hospedagem indicar.
