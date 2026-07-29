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

Agendamento e pagamento: **Mercado Pago** (Pix/cartão) + WhatsApp para horário.

## Configuração (`assets/js/script.js`)

Tudo que muda com frequência fica no topo do arquivo:

| Onde | O quê |
|------|-------|
| `WHATSAPP_NUMBER` | Número no formato internacional |
| `INSTAGRAM_URL` | Link do Instagram |
| `CAL_BOOKING_URL` | Agenda online (vazio = só WhatsApp) |
| `PLANS.*.price` | Valores das consultas |
| `PLANS.*.paymentUrl` | Links Mercado Pago |
| `TESTIMONIALS` | Depoimentos reais (vazio = seção oculta) |

### Mercado Pago — URL de retorno (cole em cada link)

| Plano | URL de retorno no Mercado Pago |
|-------|--------------------------------|
| Individual | `https://www.jlonutri.com.br/obrigado?plano=avulsa` |
| Trimestral | `https://www.jlonutri.com.br/obrigado?plano=trimestral` |
| Semestral | `https://www.jlonutri.com.br/obrigado?plano=semestral` |

Assim a página “obrigado” já abre o WhatsApp com o nome do plano pago.

### Redirect `jlonutri.com.br` → `www`

Não dá para fazer só pelo arquivo `_redirects` do Pages. No Cloudflare:

1. **Rules → Redirect Rules** (ou template “Redirect from root to WWW”)
2. De: `https://jlonutri.com.br/*`
3. Para: `https://www.jlonutri.com.br/${1}` · status **301**
4. Garantir que só o `www` está ligado ao projeto Pages (evita loop)

### Depoimentos

Em `TESTIMONIALS`, adicione objetos `{ quote, name, detail }` com autorização da paciente. Enquanto a lista estiver vazia, a seção não aparece no site.

## Como visualizar localmente

```
npx serve .
```

## Publicação

Hospedagem atual: **Cloudflare Pages** a partir do repositório GitHub. DNS no Registro.br apontando para o Cloudflare.
