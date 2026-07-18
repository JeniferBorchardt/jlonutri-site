/* =========================================================
   JLO Nutri — Interações do site
   ========================================================= */

/* >>> CONFIGURE AQUI <<< */

/** WhatsApp no formato internacional, só números. Ex.: (53) 98137-8527 → "5553981378527" */
const WHATSAPP_NUMBER = "5553981378527";

/** Instagram da Jenifer (quando tiver a conta) */
const INSTAGRAM_URL = "https://www.instagram.com/";

/**
 * Agenda online (Cal.com — região Europa)
 * Evento: Consulta nutricional
 * https://cal.eu/jlonutri/consulta-nutricional
 */
const CAL_BOOKING_URL = "https://cal.eu/jlonutri/consulta-nutricional";

/**
 * Catálogo de planos — ÚNICO lugar para preço e link de pagamento.
 *
 * Como ativar Mercado Pago:
 * 1. Mercado Pago → Seu negócio → Link de pagamento
 * 2. Crie 1 link por plano (valor + descrição + parcelamento)
 * 3. Cole a URL em `paymentUrl`
 * 4. Em "URL de retorno" do link, use: https://SEU-DOMINIO/obrigado.html
 *
 * Enquanto `paymentUrl` estiver vazio (""), o botão de pagar abre o WhatsApp.
 * Coloque `price: null` para esconder o valor e mostrar "Sob consulta".
 */
const PLANS = {
  avulsa: {
    id: "avulsa",
    name: "Consulta Avulsa",
    price: null, // ex.: 250
    period: "/ consulta",
    paymentUrl: "", // ex.: "https://mpago.la/xxxxx"
  },
  mensal: {
    id: "mensal",
    name: "Acompanhamento Mensal",
    price: null, // ex.: 197
    period: "/ mês",
    paymentUrl: "",
  },
  trimestral: {
    id: "trimestral",
    name: "Programa Trimestral",
    price: null, // ex.: 497
    period: "/ trimestre",
    paymentUrl: "",
  },
};

/* ---------- Helpers ---------- */

function waLink(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function formatPrice(value) {
  if (value == null || value === "" || Number.isNaN(Number(value))) return null;
  return Number(value).toLocaleString("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function getPlan(planId) {
  return PLANS[planId] || null;
}

/* Ano no rodapé */
(function initYear() {
  const el = document.getElementById("year");
  if (el) el.textContent = new Date().getFullYear();
})();

/* Menu mobile */
(function initMenu() {
  const btn = document.getElementById("menuBtn");
  const menu = document.getElementById("mobileMenu");
  if (!btn || !menu) return;

  function toggle(open) {
    const willOpen = open ?? menu.hidden;
    menu.hidden = !willOpen;
    btn.setAttribute("aria-expanded", String(willOpen));
    document.body.style.overflow = willOpen ? "hidden" : "";
  }

  btn.addEventListener("click", () => toggle());
  menu.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => toggle(false))
  );
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !menu.hidden) toggle(false);
  });
})();

/* Links de WhatsApp (flutuante, CTA final, rodapé) */
(function initWhatsLinks() {
  const defaultMsg =
    "Olá, Jenifer! Vim pelo site e gostaria de saber mais sobre as consultas nutricionais.";

  const targets = [
    document.getElementById("whatsFloat"),
    document.getElementById("whatsMain"),
    document.querySelector('[data-cta="footer-whats"]'),
  ];
  targets.forEach((el) => {
    if (el) el.href = waLink(defaultMsg);
  });

  const insta = document.querySelector('[data-cta="footer-instagram"]');
  if (insta) insta.href = INSTAGRAM_URL;
})();

/* Links de agendamento (Cal.com) */
(function initBookingLinks() {
  document.querySelectorAll("[data-booking]").forEach((el) => {
    el.href = CAL_BOOKING_URL;
    el.target = "_blank";
    el.rel = "noopener noreferrer";
  });
})();

/**
 * Planos: preenche preços e liga botões de pagamento / WhatsApp
 * a partir do catálogo PLANS.
 */
(function initPlansCatalog() {
  document.querySelectorAll("[data-plan-id]").forEach((card) => {
    const planId = card.getAttribute("data-plan-id");
    const plan = getPlan(planId);
    if (!plan) return;

    const priceEl = card.querySelector("[data-plan-price]");
    if (priceEl) {
      const formatted = formatPrice(plan.price);
      if (formatted) {
        priceEl.innerHTML = `<span>R$</span> ${formatted} <small>${plan.period}</small>`;
      } else {
        priceEl.innerHTML = `<span class="plan-card__price-soft">Sob consulta</span>`;
      }
    }

    const payBtn = card.querySelector("[data-pay]");
    if (payBtn) {
      const url = (plan.paymentUrl || "").trim();
      if (url) {
        payBtn.href = url;
        payBtn.setAttribute("data-pay-ready", "true");
      } else {
        payBtn.href = waLink(
          `Olá, Jenifer! Quero fechar o formato "${plan.name}". Pode me enviar o link de pagamento e os horários disponíveis?`
        );
        payBtn.setAttribute("data-pay-ready", "false");
      }
      payBtn.target = "_blank";
      payBtn.rel = "noopener noreferrer";
    }

    const waBtn = card.querySelector("[data-plan]");
    if (waBtn) {
      waBtn.href = waLink(
        `Olá, Jenifer! Tenho interesse no formato "${plan.name}". Pode me passar os valores e horários disponíveis?`
      );
      waBtn.target = "_blank";
      waBtn.rel = "noopener noreferrer";
    }
  });
})();

/* Formulário de lead: valida e abre o WhatsApp com os dados preenchidos */
(function initLeadForm() {
  const form = document.getElementById("leadForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const nome = form.nome.value.trim();
    const tel = form.telefone.value.trim();
    const email = form.email.value.trim();
    const msg = form.mensagem.value.trim();

    if (!nome || !tel) {
      if (!nome) form.nome.focus();
      else form.telefone.focus();
      form.reportValidity();
      return;
    }

    const texto =
      `Olá, Jenifer! Gostaria de agendar uma consulta.%0A%0A` +
      `*Nome:* ${nome}%0A` +
      `*Telefone:* ${tel}%0A` +
      (email ? `*E-mail:* ${email}%0A` : "") +
      (msg ? `*Objetivo:* ${msg}` : "");

    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${texto}`,
      "_blank",
      "noopener"
    );
  });
})();

/* Animação de entrada ao rolar */
(function initReveal() {
  const els = document.querySelectorAll(
    ".section-head, .pain-card, .gain-card, .plan-card, .how-step, .testi-card, .about__copy, .about__media, .hero__copy, .hero__media, .lead-form, .cta-final__copy"
  );
  els.forEach((el) => el.classList.add("reveal"));

  if (!("IntersectionObserver" in window)) {
    els.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  els.forEach((el) => io.observe(el));
})();
