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
├── _headers                   Cache (Cloudflare Pages)
├── README.md
└── assets/
    ├── css/style.css          Design system + seções + responsivo
    ├── js/script.js           Config, menu, WhatsApp, planos, GA
    └── images/
        ├── jlo-mark.png       Logo do site
        ├── favicon.png
        ├── jenifer-hero.jpg
        ├── jenifer-about.jpg
        ├── jenifer-gains.jpg
        ├── og-share.png       Preview de compartilhamento
        └── social-logo-*.png  Versões para redes sociais
```

## Seções do site (`index.html`)

1. Hero — chamada + credenciais + foto
2. Para quem é — dores do público 35+
3. Sobre — bio e diferenciais
4. Benefícios — foto + resultados
5. Meus Serviços — Individual, Trimestral e Semestral
6. Rodapé — CRN, redes, documentos legais

Agendamento e pagamento: **WhatsApp** (Mercado Pago opcional via `paymentUrl`).

## Configuração (`assets/js/script.js`)

Tudo que muda com frequência fica no topo do arquivo:

| Onde | O quê |
|------|-------|
| `WHATSAPP_NUMBER` | Número no formato internacional |
| `INSTAGRAM_URL` | Link do Instagram |
| `CAL_BOOKING_URL` | Agenda online (vazio = só WhatsApp) |
| `PLANS.*.price` | Valores das consultas |
| `PLANS.*.paymentUrl` | Links Mercado Pago |

### Ativar Mercado Pago
1. Mercado Pago → Seu negócio → Link de pagamento
2. Crie 1 link por plano
3. Cole a URL em `paymentUrl`
4. URL de retorno: `https://www.jlonutri.com.br/obrigado.html`

Enquanto `paymentUrl` estiver vazio, o botão “Começar agora” abre o WhatsApp.

## Como visualizar localmente

```
npx serve .
```

Ou abra o `index.html` no navegador.

## Publicação

Hospedagem atual: **Cloudflare Pages** a partir do repositório GitHub. DNS no Registro.br apontando para o Cloudflare.
