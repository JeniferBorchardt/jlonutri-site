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
 * 4. Em "URL de retorno" do link, use: https://www.jlonutri.com.br/obrigado.html
 *
 * Enquanto `paymentUrl` estiver vazio (""), o botão de pagar abre o WhatsApp.
 * Coloque `price: null` para esconder o valor e mostrar "Sob consulta".
 */
const PLANS = {
  avulsa: {
    id: "avulsa",
    name: "Consulta Avulsa",
    price: 400,
    period: "/ consulta",
    paymentUrl: "", // cole o link Mercado Pago
  },
  trimestral: {
    id: "trimestral",
    name: "Programa Trimestral",
    price: 790,
    period: "/ trimestre",
    paymentUrl: "",
  },
  anual: {
    id: "anual",
    name: "Programa Anual",
    price: 3000,
    period: "/ ano",
    paymentUrl: "",
  },
};

const OBJECTIVE_LABELS = {
  emagrecimento: "Emagrecimento",
  energia: "Energia e disposição",
  menopausa: "Menopausa ou climatério",
  alimentacao: "Melhora da alimentação",
  saude: "Acompanhamento de saúde",
  outro: "Outro",
};

/* ---------- Analytics (GA4 / dataLayer) ---------- */

/**
 * Dispara eventos de conversão.
 * Funciona com dataLayer mesmo antes do snippet GA estar no HTML.
 * Quando adicionar o gtag, os mesmos nomes de evento serão recebidos.
 */
function track(eventName, params = {}) {
  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: eventName, ...params });
    if (typeof window.gtag === "function") {
      window.gtag("event", eventName, params);
    }
  } catch (_) {
    /* nunca quebrar a página por analytics */
  }
}

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

function digitsOnly(value) {
  return String(value || "").replace(/\D/g, "");
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
    btn.setAttribute("aria-label", willOpen ? "Fechar menu" : "Abrir menu");
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

/* Links de WhatsApp (flutuante, CTAs, rodapé) */
(function initWhatsLinks() {
  const defaultMsg =
    "Olá, Jenifer! Vim pelo site e gostaria de saber mais sobre as consultas nutricionais.";

  const targets = [
    document.getElementById("whatsFloat"),
    document.getElementById("whatsMain"),
    document.getElementById("heroWhats"),
    document.getElementById("trustWhats"),
    document.querySelector('[data-cta="footer-whats"]'),
  ];
  targets.forEach((el) => {
    if (!el) return;
    el.href = waLink(defaultMsg);
    el.target = "_blank";
    el.rel = "noopener noreferrer";
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
    el.addEventListener("click", () => {
      track("agendar_click", { link_url: CAL_BOOKING_URL, cta: el.getAttribute("data-cta") || "booking" });
    });
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
        payBtn.addEventListener("click", () => {
          track("selecao_plano", { plan_id: plan.id, plan_name: plan.name });
          track("checkout_open", { plan_id: plan.id, plan_name: plan.name, value: plan.price });
        });
      } else {
        payBtn.href = waLink(
          `Olá, Jenifer! Quero fechar o formato "${plan.name}". Pode me enviar o link de pagamento e os horários disponíveis?`
        );
        payBtn.setAttribute("data-pay-ready", "false");
        payBtn.addEventListener("click", () => {
          track("selecao_plano", { plan_id: plan.id, plan_name: plan.name });
          track("whatsapp_click", { source: "pay_fallback", plan_id: plan.id });
        });
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
      waBtn.addEventListener("click", () => {
        track("whatsapp_click", { source: "plan_doubt", plan_id: plan.id });
        track("selecao_plano", { plan_id: plan.id, plan_name: plan.name, intent: "doubt" });
      });
    }
  });
})();

/* Tracking genérico de WhatsApp / CTAs de agenda */
(function initCtaTracking() {
  const whatsIds = ["whatsFloat", "whatsMain", "heroWhats", "trustWhats"];
  whatsIds.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("click", () => {
      track("whatsapp_click", { source: id });
    });
  });

  document.querySelectorAll('[data-cta="footer-whats"]').forEach((el) => {
    el.addEventListener("click", () => track("whatsapp_click", { source: "footer" }));
  });

  document.querySelectorAll('a[href="#consultas"]').forEach((el) => {
    el.addEventListener("click", () => {
      track("agendar_click", { source: el.getAttribute("data-cta") || "anchor_consultas" });
    });
  });
})();

/* Formulário de lead: valida e abre o WhatsApp com os dados preenchidos */
(function initLeadForm() {
  const form = document.getElementById("leadForm");
  if (!form) return;

  const errorEl = document.getElementById("leadError");
  const successEl = document.getElementById("leadSuccess");

  function showError(message) {
    if (!errorEl) return;
    errorEl.hidden = false;
    errorEl.textContent = message;
    if (successEl) successEl.hidden = true;
  }

  function clearMessages() {
    if (errorEl) {
      errorEl.hidden = true;
      errorEl.textContent = "";
    }
    if (successEl) successEl.hidden = true;
  }

  form.addEventListener("input", clearMessages);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    clearMessages();

    const nome = form.nome.value.trim();
    const tel = form.telefone.value.trim();
    const objetivo = form.objetivo ? form.objetivo.value : "";
    const telDigits = digitsOnly(tel);

    if (!nome || nome.length < 2) {
      showError("Informe seu nome completo.");
      form.nome.focus();
      return;
    }

    if (!telDigits || telDigits.length < 10) {
      showError("Informe um WhatsApp válido com DDD.");
      form.telefone.focus();
      return;
    }

    if (!objetivo) {
      showError("Selecione seu principal objetivo.");
      if (form.objetivo) form.objetivo.focus();
      return;
    }

    const objetivoLabel = OBJECTIVE_LABELS[objetivo] || objetivo;

    const texto =
      `Olá, Jenifer! Gostaria de agendar uma consulta.%0A%0A` +
      `*Nome:* ${nome}%0A` +
      `*WhatsApp:* ${tel}%0A` +
      `*Objetivo:* ${objetivoLabel}`;

    if (successEl) successEl.hidden = false;

    track("formulario_envio", {
      objective: objetivo,
      has_phone: true,
    });
    track("whatsapp_click", { source: "lead_form" });

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
    ".section-head, .pain-card, .gain-card, .plan-card, .how-step, .about__copy, .about__media, .hero__copy, .hero__media, .lead-form, .cta-final__copy, .trust-block__inner, .how__details"
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
