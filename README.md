# JLO Nutri — Site da Nutricionista Jenifer Lopes Borchardt

Site estático (mobile-first) para apresentação profissional e conversão de consultas nutricionais, com foco em **mulheres 35+**.

- **Domínio:** https://www.jlonutri.com.br
- **Stack:** HTML + CSS + JavaScript puro (sem build, sem dependências)
- **Fontes:** Cormorant Garamond (títulos) + Manrope (texto), via Google Fonts
- **Analytics:** Google Analytics 4 (`G-QKJYT0FB50`)

## Estrutura

```
jlonutri/
├── index.html                 Página principal
├── obrigado.html              Pós-pagamento → WhatsApp
├── privacidade.html           Política de privacidade (LGPD)
├── termos.html                Termos de atendimento
├── cancelamento.html          Cancelamento e reagendamento
├── manifest.json              PWA / ícone
├── robots.txt / sitemap.xml
├── _headers                   Segurança + cache (Cloudflare Pages)
├── _redirects                 Redirects do Pages
├── README.md
└── assets/
    ├── css/style.css          Design system + seções + responsivo
    ├── js/script.js           Config, menu, WhatsApp, planos, GA
    └── images/
        ├── jlo-mark.png       Logo do site
        ├── favicon.png
        ├── jenifer-hero.jpg / .webp / -480.webp
        ├── jenifer-about.jpg / .webp
        └── og-share.jpg       Preview de compartilhamento (1200×630)
```

## Seções do site (`index.html`)

1. Hero — chamada + foto
2. Para quem é — dores do público 35+
3. Sobre — bio e diferenciais
4. Benefícios — resultados esperados
5. Primeira consulta + planos (Individual, Trimestral, Semestral)
6. FAQ + CTA final
7. Rodapé — CRN, redes, documentos legais

Agendamento e pagamento: **Mercado Pago** (Pix/cartão) + WhatsApp para horário.

## Configuração (`assets/js/script.js`)

Tudo que muda com frequência fica no topo do arquivo:

| Onde | O quê |
|------|-------|
| `WHATSAPP_NUMBER` | Número no formato internacional |
| `INSTAGRAM_URL` | Link do Instagram |
| `PLANS.*.price` | Valores das consultas |
| `PLANS.*.paymentUrl` | Links Mercado Pago |
| `PIX.key` / `PIX.name` | Chave PIX direta (WhatsApp) |
| `TESTIMONIALS` | Depoimentos reais (vazio = seção oculta) |

### Eventos GA4 úteis

| Evento | Quando | Marcar conversão? |
|--------|--------|-------------------|
| `checkout_open` | Continuar com cartão → Mercado Pago | **Sim** (alta) |
| `pix_modal_open` | Abriu o modal PIX (QR) | **Sim** (alta) |
| `obrigado_view` | Visitou `/obrigado` após pagamento | **Sim** (alta) |
| `whatsapp_click` | Clique em WhatsApp | **Sim** (média) |
| `pix_copy` | Copiou o código PIX | Opcional |
| `pay_method_select` | Escolheu PIX ou cartão | Não |
| `agendar_click` | Clique em âncoras `#consultas` | Não |

#### Como marcar conversões (painel GA4)

1. Abra [analytics.google.com](https://analytics.google.com) → propriedade **G-QKJYT0FB50**
2. **Admin** (engrenagem) → **Exibição de dados** → **Eventos**
3. Se o evento ainda não aparecer: use o site (pague teste / abra PIX / WhatsApp) e aguarde alguns minutos (ou veja em **Relatórios** → **Tempo real**)
4. Em cada evento da tabela acima marcado **Sim**, ative **Marcar como evento-chave** / **converter como conversão**
5. Em **Admin** → **Eventos-chave** (ou Conversões), confira a lista

Sugestão mínima: `checkout_open` + `pix_modal_open` + `obrigado_view`.

### Mercado Pago — retorno

No painel do MP, o redirecionamento geral pode ser:
`https://www.jlonutri.com.br/obrigado`

(Opcional por plano, se disponível: `?plano=avulsa|trimestral|semestral`.)

### Redirect `jlonutri.com.br` → `www`

No Cloudflare → Rules → Redirect Rules (Dynamic):

- If: `http.host eq "jlonutri.com.br"`
- Then: `concat("https://www.jlonutri.com.br", http.request.uri.path)` · 301 · Preserve query string On

### Depoimentos

Em `TESTIMONIALS`, adicione objetos `{ quote, name, detail }` com autorização da paciente. Lista vazia = seção oculta.

## Como visualizar localmente

```
npx serve .
```

(Se não houver Node: abra um servidor HTTP estático na pasta do projeto.)

## Publicação

Hospedagem: **Cloudflare Pages** a partir do GitHub. DNS no Registro.br apontando para o Cloudflare.
