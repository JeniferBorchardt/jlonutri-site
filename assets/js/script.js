/* =========================================================
   JLO Nutri — Interações do site
   Ordem: config → helpers → UI → planos → tracking → motion
   ========================================================= */

/* ---------- 1. Configuração (edite aqui) ---------- */

/** WhatsApp no formato internacional, só números. Ex.: (53) 98137-8527 → "5553981378527" */
const WHATSAPP_NUMBER = "5553981378527";

/** Instagram da Jenifer */
const INSTAGRAM_URL = "https://www.instagram.com/nutrijeniferlopes";

/**
 * Agenda online (Cal.com) — DESATIVADA.
 * Deixe vazio para agendar só pelo WhatsApp.
 * Para reativar: cole a URL e use data-booking nos links.
 */
const CAL_BOOKING_URL = "";

/**
 * Catálogo de planos — único lugar para preço e link de pagamento.
 *
 * Mercado Pago:
 * 1. Seu negócio → Link de pagamento
 * 2. 1 link por plano
 * 3. Cole em paymentUrl
 * 4. Retorno: https://www.jlonutri.com.br/obrigado.html
 *
 * paymentUrl vazio → botão abre WhatsApp.
 * price: null → mostra "Sob consulta".
 */
const PLANS = {
  avulsa: {
    id: "avulsa",
    name: "Individual",
    price: 350,
    period: "/ consulta",
    paymentUrl: "",
  },
  trimestral: {
    id: "trimestral",
    name: "Trimestral",
    price: 990,
    period: "(ou 3x de R$ 330)",
    paymentUrl: "",
  },
  semestral: {
    id: "semestral",
    name: "Semestral",
    price: 1790,
    period: "(ou 6x de R$ 298)",
    paymentUrl: "",
  },
};

/* ---------- 2. Analytics (GA4 / dataLayer) ---------- */

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

/* ---------- 3. Helpers ---------- */

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

/* ---------- 4. Ano no rodapé ---------- */

(function initYear() {
  const el = document.getElementById("year");
  if (el) el.textContent = new Date().getFullYear();
})();

/* ---------- 5. Menu mobile ---------- */

(function initMenu() {
  const btn = document.getElementById("menuBtn");
  const menu = document.getElementById("mobileMenu");
  const backdrop = document.getElementById("menuBackdrop");
  if (!btn || !menu) return;

  function toggle(open) {
    const willOpen = typeof open === "boolean" ? open : menu.hidden;
    menu.hidden = !willOpen;
    if (backdrop) backdrop.hidden = !willOpen;
    btn.setAttribute("aria-expanded", String(willOpen));
    btn.setAttribute("aria-label", willOpen ? "Fechar menu" : "Abrir menu");
    document.body.style.overflow = willOpen ? "hidden" : "";
  }

  btn.addEventListener("click", () => toggle());
  if (backdrop) backdrop.addEventListener("click", () => toggle(false));
  menu.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => toggle(false))
  );
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !menu.hidden) toggle(false);
  });
})();

/* ---------- 5b. Sticky CTA: só após scroll curto (não cobrir hero) ---------- */

(function initMobileSticky() {
  const sticky = document.getElementById("mobileSticky");
  if (!sticky || !window.matchMedia("(max-width: 768px)").matches) return;

  sticky.classList.add("is-deferred");
  const revealAt = Math.min(280, Math.round(window.innerHeight * 0.35));

  function onScroll() {
    const show = window.scrollY > revealAt;
    sticky.classList.toggle("is-visible", show);
    sticky.classList.toggle("is-deferred", !show);
    document.body.classList.toggle("sticky-cta-on", show);
  }

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
})();

/* ---------- 6. WhatsApp, Instagram e e-mail ---------- */

(function initContactLinks() {
  const defaultMsg =
    "Olá, Jenifer! Vim pelo site e gostaria de saber mais sobre as consultas nutricionais.";

  [
    document.getElementById("whatsFloat"),
    document.getElementById("heroWhats"),
    document.querySelector('[data-cta="footer-whats"]'),
  ].forEach((el) => {
    if (!el) return;
    el.href = waLink(defaultMsg);
    el.target = "_blank";
    el.rel = "noopener noreferrer";
  });

  const insta = document.querySelector('[data-cta="footer-instagram"]');
  if (insta) {
    insta.href = INSTAGRAM_URL;
    insta.target = "_blank";
    insta.rel = "noopener noreferrer";
  }

  const emailBtn = document.getElementById("footerEmail");
  if (emailBtn) {
    emailBtn.addEventListener("click", async () => {
      track("email_click", { source: "footer" });
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText("contato@jlonutri.com.br");
        }
      } catch (_) {
        /* ignore */
      }
    });
  }
})();

/* ---------- 7. Agenda (Cal.com opcional via data-booking) ---------- */

(function initBookingLinks() {
  const bookingUrl = (CAL_BOOKING_URL || "").trim();
  document.querySelectorAll("[data-booking]").forEach((el) => {
    if (bookingUrl) {
      el.href = bookingUrl;
      el.target = "_blank";
      el.rel = "noopener noreferrer";
      el.addEventListener("click", () => {
        track("agendar_click", {
          link_url: bookingUrl,
          cta: el.getAttribute("data-cta") || "booking",
        });
      });
      return;
    }

    el.href = waLink("Olá, Jenifer! Gostaria de combinar o horário da minha consulta.");
    el.target = "_blank";
    el.rel = "noopener noreferrer";
    el.addEventListener("click", () => {
      track("whatsapp_click", {
        source: el.getAttribute("data-cta") || "booking_fallback",
      });
    });
  });
})();

/* ---------- 8. Planos (preço + pagamento / WhatsApp) ---------- */

(function initPlansCatalog() {
  document.querySelectorAll("[data-plan-id]").forEach((card) => {
    const plan = getPlan(card.getAttribute("data-plan-id"));
    if (!plan) return;

    const period = plan.period || "";
    const priceEl = card.querySelector("[data-plan-price]");
    if (priceEl) {
      const formatted = formatPrice(plan.price);
      priceEl.innerHTML = formatted
        ? `<span>R$</span> ${formatted} <small>${period}</small>`
        : `<span class="plan-card__price-soft">Sob consulta</span>`;
    }

    const payBtn = card.querySelector("[data-pay]");
    if (payBtn) {
      const url = (plan.paymentUrl || "").trim();
      if (url) {
        payBtn.href = url;
        payBtn.setAttribute("data-pay-ready", "true");
        payBtn.addEventListener("click", () => {
          track("selecao_plano", { plan_id: plan.id, plan_name: plan.name });
          track("checkout_open", {
            plan_id: plan.id,
            plan_name: plan.name,
            value: plan.price,
          });
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
        track("selecao_plano", {
          plan_id: plan.id,
          plan_name: plan.name,
          intent: "doubt",
        });
      });
    }
  });
})();

/* ---------- 9. Tracking de CTAs ---------- */

(function initCtaTracking() {
  ["whatsFloat", "heroWhats"].forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("click", () => track("whatsapp_click", { source: id }));
  });

  document.querySelectorAll('[data-cta="footer-whats"]').forEach((el) => {
    el.addEventListener("click", () => track("whatsapp_click", { source: "footer" }));
  });

  document.querySelectorAll('a[href="#consultas"]').forEach((el) => {
    el.addEventListener("click", () => {
      track("agendar_click", {
        source: el.getAttribute("data-cta") || "anchor_consultas",
      });
    });
  });
})();

/* ---------- 10. Animação ao rolar ---------- */

(function initReveal() {
  const els = document.querySelectorAll(
    ".section-head, .pain-card, .gain-card, .plan-card, .about__copy"
  );
  els.forEach((el) => el.classList.add("reveal"));

  document.querySelectorAll(".hero__copy, .hero__media, .about__media").forEach((el) => {
    el.classList.add("reveal", "is-visible");
  });

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
