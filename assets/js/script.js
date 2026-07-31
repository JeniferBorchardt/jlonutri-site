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
 * PIX direto (chave e-mail na conta Mercado Pago).
 * Copia e cola / QR com valor por plano. Confirmação ainda via comprovante no WhatsApp.
 */
const PIX = {
  key: "jenifer@jlonutri.com.br",
  name: "Jenifer Lopes Borchardt",
  bank: "Mercado Pago",
  /** Nome e cidade no BR Code (máx. 25 / 15) */
  merchantName: "JENIFER LOPES BORCHARDT",
  merchantCity: "Sao Paulo",
  /** txid do QR gerado no Mercado Pago */
  txid: "daqr114768819608510",
};

/**
 * Catálogo de planos — único lugar para preço e link de pagamento.
 *
 * Pagamento: o site NÃO coleta dados de cartão. O botão só redireciona
 * para o checkout hospedado do Mercado Pago (PCI fica com o gateway).
 * Não use access_token / chave secreta no frontend — só link público.
 *
 * Mercado Pago:
 * 1. Seu negócio → Link de pagamento
 * 2. 1 link por plano
 * 3. Cole em paymentUrl (https://mpago.la/... ou mpago.li/...)
 * 4. URL de retorno (cole exatamente assim em cada link):
 *    Individual → https://www.jlonutri.com.br/obrigado?plano=avulsa
 *    Trimestral → https://www.jlonutri.com.br/obrigado?plano=trimestral
 *    Semestral  → https://www.jlonutri.com.br/obrigado?plano=semestral
 *
 * paymentUrl vazio → botão abre WhatsApp.
 * price: null → mostra "Sob consulta".
 */
const PLANS = {
  avulsa: {
    id: "avulsa",
    name: "Individual",
    price: 350,
    period: "",
    paymentUrl: "https://mpago.la/2PgHtAZ",
    pixCopiaECola:
      "00020126450014br.gov.bcb.pix0123jenifer@jlonutri.com.br5204000053039865406350.005802BR5923JENIFER LOPES BORCHARDT6009Sao Paulo62230519daqr1147688196085106304B31D",
  },
  trimestral: {
    id: "trimestral",
    name: "Trimestral",
    price: 960,
    period: "",
    paymentUrl: "https://mpago.la/2bTQ7iV",
    pixCopiaECola:
      "00020126450014br.gov.bcb.pix0123jenifer@jlonutri.com.br5204000053039865406960.005802BR5923JENIFER LOPES BORCHARDT6009Sao Paulo62230519daqr11476881972864363044DE5",
  },
  semestral: {
    id: "semestral",
    name: "Semestral",
    price: 1790,
    period: "",
    paymentUrl: "https://mpago.la/1DY7iKd",
    pixCopiaECola:
      "00020126450014br.gov.bcb.pix0123jenifer@jlonutri.com.br52040000530398654071790.005802BR5923JENIFER LOPES BORCHARDT6009Sao Paulo62230519daqr1147688198267096304791B",
  },
};

/**
 * Depoimentos reais (só com autorização).
 * Ex.: { quote: "…", name: "Maria", detail: "Pelotas · plano Trimestral" }
 * Lista vazia → a seção fica oculta.
 */
const TESTIMONIALS = [];

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

/** CRC16-CCITT (padrão Pix / EMV). */
function pixCrc16(payload) {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i += 1) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function pixTlv(id, value) {
  const str = String(value);
  return id + String(str.length).padStart(2, "0") + str;
}

/** Gera Pix Copia e Cola com valor (ex.: 350 → R$ 350,00). */
function buildPixCopiaECola(amount) {
  const mai = pixTlv("00", "br.gov.bcb.pix") + pixTlv("01", PIX.key);
  const amountStr = Number(amount).toFixed(2);
  const payload =
    pixTlv("00", "01") +
    pixTlv("26", mai) +
    pixTlv("52", "0000") +
    pixTlv("53", "986") +
    pixTlv("54", amountStr) +
    pixTlv("58", "BR") +
    pixTlv("59", PIX.merchantName) +
    pixTlv("60", PIX.merchantCity) +
    pixTlv("62", pixTlv("05", PIX.txid)) +
    "6304";
  return payload + pixCrc16(payload);
}

function renderPixQr(targetEl, copiaECola, altText) {
  if (!targetEl) return false;
  targetEl.innerHTML = "";
  targetEl.setAttribute("role", "img");
  targetEl.setAttribute("aria-label", altText || "QR Code PIX");

  try {
    if (typeof qrcode === "function") {
      const qr = qrcode(0, "M");
      qr.addData(copiaECola, "Byte");
      qr.make();
      const size = Math.max(2, Math.floor(220 / qr.getModuleCount()));
      targetEl.innerHTML = qr.createImgTag(size, 8);
      const img = targetEl.querySelector("img");
      if (img) {
        img.alt = altText || "QR Code PIX";
        img.width = 240;
        img.height = 240;
        img.style.width = "240px";
        img.style.height = "240px";
        img.style.display = "block";
        img.style.margin = "0 auto";
      }
      return true;
    }
  } catch (_) {
    /* fallback abaixo */
  }

  // Fallback externo se a lib local falhar
  const img = document.createElement("img");
  img.width = 240;
  img.height = 240;
  img.alt = altText || "QR Code PIX";
  img.src =
    "https://api.qrserver.com/v1/create-qr-code/?size=240x240&ecc=M&margin=8&data=" +
    encodeURIComponent(copiaECola);
  targetEl.appendChild(img);
  return true;
}

function pixWhatsAppMessage(plan) {
  const price = formatPrice(plan && plan.price);
  const planLine = plan
    ? `Já paguei o plano ${plan.name}${price ? ` (R$ ${price})` : ""} via PIX.`
    : "Já paguei via PIX.";
  return [
    `Olá, Jenifer! ${planLine}`,
    "Segue o comprovante para combinarmos o horário. Prefiro manhã ou tarde? Tenho preferência de dia: ___.",
  ].join("\n");
}

function pixInterestMessage(plan) {
  const price = formatPrice(plan && plan.price);
  const planLine = plan
    ? `Quero o plano ${plan.name}${price ? ` (R$ ${price})` : ""} e vou pagar com PIX.`
    : "Quero pagar com PIX.";
  return [
    `Olá, Jenifer! ${planLine}`,
    `Chave: ${PIX.key}`,
    `Nome: ${PIX.name} (${PIX.bank})`,
    "Assim que pagar, te mando o comprovante para combinarmos o horário.",
  ].join("\n");
}

/** Aceita só links HTTPS do Mercado Pago (checkout hospedado — sem cartão no nosso site). */
function isAllowedPaymentUrl(url) {
  try {
    const u = new URL(String(url || "").trim());
    if (u.protocol !== "https:") return false;
    const host = u.hostname.toLowerCase();
    return (
      host === "mpago.la" ||
      host === "mpago.li" ||
      host === "www.mercadopago.com.br" ||
      host === "mercadopago.com.br" ||
      host.endsWith(".mercadopago.com.br") ||
      host.endsWith(".mercadopago.com")
    );
  } catch (_) {
    return false;
  }
}

function formatPrice(value) {
  if (value == null || value === "" || Number.isNaN(Number(value))) return null;
  return Number(value).toLocaleString("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
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

  let lastFocus = null;

  function focusable() {
    return Array.from(
      menu.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')
    ).filter((el) => !el.hasAttribute("disabled") && el.offsetParent !== null);
  }

  function toggle(open) {
    const willOpen = typeof open === "boolean" ? open : menu.hidden;
    menu.hidden = !willOpen;
    if (backdrop) backdrop.hidden = !willOpen;
    btn.setAttribute("aria-expanded", String(willOpen));
    btn.setAttribute("aria-label", willOpen ? "Fechar menu" : "Abrir menu");
    document.body.style.overflow = willOpen ? "hidden" : "";
    if (willOpen) {
      lastFocus = document.activeElement;
      const first = focusable()[0];
      if (first) first.focus();
    } else if (lastFocus && typeof lastFocus.focus === "function") {
      lastFocus.focus();
    } else {
      btn.focus();
    }
  }

  btn.addEventListener("click", () => toggle());
  if (backdrop) backdrop.addEventListener("click", () => toggle(false));
  menu.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => toggle(false))
  );
  window.addEventListener("keydown", (e) => {
    if (menu.hidden) return;
    if (e.key === "Escape") {
      toggle(false);
      return;
    }
    if (e.key !== "Tab") return;
    const items = focusable();
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
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
  const doubtMsg = [
    "Olá, Jenifer! Tenho uma dúvida antes de pagar pelo site.",
    `Se preferir PIX direto: ${PIX.key} — ${PIX.name} (${PIX.bank}).`,
    "Pode me orientar?",
  ].join("\n");

  const floatEl = document.getElementById("whatsFloat");
  if (floatEl) {
    floatEl.href = waLink(defaultMsg);
    floatEl.target = "_blank";
    floatEl.rel = "noopener noreferrer";
  }

  const doubtEl = document.getElementById("plansDoubt");
  if (doubtEl) {
    doubtEl.href = waLink(doubtMsg);
    doubtEl.target = "_blank";
    doubtEl.rel = "noopener noreferrer";
  }

  const footerWa = document.querySelector('[data-cta="footer-whats"]');
  if (footerWa) {
    footerWa.href = waLink(defaultMsg);
    footerWa.target = "_blank";
    footerWa.rel = "noopener noreferrer";
  }

  const pixInfo = document.getElementById("pixInfoWhats");
  if (pixInfo) {
    pixInfo.href = "#consultas";
    pixInfo.addEventListener("click", (e) => {
      e.preventDefault();
      const featured = document.querySelector("[data-plan-id='trimestral'] [data-pix]");
      if (featured) featured.click();
      else document.getElementById("consultas")?.scrollIntoView({ behavior: "smooth" });
      track("pix_interest", { source: "plans_note" });
    });
  }

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

/* ---------- 7. Planos (preço + pagamento / WhatsApp) ---------- */

(function initPlansCatalog() {
  document.querySelectorAll("[data-plan-id]").forEach((card) => {
    const plan = getPlan(card.getAttribute("data-plan-id"));
    if (!plan) return;

    const period = (plan.period || "").trim();
    const priceEl = card.querySelector("[data-plan-price]");
    if (priceEl) {
      const formatted = formatPrice(plan.price);
      if (!formatted) {
        priceEl.innerHTML = `<span class="plan-card__price-soft">Sob consulta</span>`;
      } else if (period) {
        priceEl.innerHTML = `<span>R$</span> ${formatted} <small>${period}</small>`;
      } else {
        priceEl.innerHTML = `<span>R$</span> ${formatted}`;
      }
    }

    const payBtn = card.querySelector("[data-pay]");
    if (payBtn) {
      const url = (plan.paymentUrl || "").trim();
      if (url && isAllowedPaymentUrl(url)) {
        payBtn.href = url;
        payBtn.textContent = "Pagar com cartão";
        payBtn.setAttribute("data-pay-ready", "true");
        payBtn.removeAttribute("target");
        payBtn.rel = "noopener noreferrer";
        payBtn.addEventListener("click", () => {
          try {
            localStorage.setItem(
              "jlo_last_plan",
              JSON.stringify({
                id: plan.id,
                at: Date.now(),
              })
            );
          } catch (_) {
            /* ignore */
          }
          track("selecao_plano", { plan_id: plan.id, plan_name: plan.name });
          track("checkout_open", {
            plan_id: plan.id,
            plan_name: plan.name,
            value: plan.price,
          });
        });
      } else {
        if (url && !isAllowedPaymentUrl(url)) {
          console.warn("paymentUrl bloqueada (domínio não permitido):", plan.id);
        }
        payBtn.href = waLink(
          `Olá, Jenifer! Quero fechar o formato "${plan.name}". Pode me enviar o link de pagamento e os horários disponíveis?`
        );
        payBtn.textContent = "Quero no WhatsApp";
        payBtn.setAttribute("data-pay-ready", "false");
        payBtn.target = "_blank";
        payBtn.rel = "noopener noreferrer";
        payBtn.addEventListener("click", () => {
          track("selecao_plano", { plan_id: plan.id, plan_name: plan.name });
          track("whatsapp_click", { source: "pay_fallback", plan_id: plan.id });
        });
      }
    }

    const pixBtn = card.querySelector("[data-pix]");
    if (pixBtn) {
      pixBtn.href = "#";
      pixBtn.removeAttribute("target");
      pixBtn.addEventListener("click", (e) => {
        e.preventDefault();
        try {
          localStorage.setItem(
            "jlo_last_plan",
            JSON.stringify({
              id: plan.id,
              at: Date.now(),
            })
          );
        } catch (_) {
          /* ignore */
        }
        track("selecao_plano", { plan_id: plan.id, plan_name: plan.name });
        track("pix_interest", { plan_id: plan.id, plan_name: plan.name });
        if ((plan.pixCopiaECola || "").trim() && typeof window.openPixModal === "function") {
          window.openPixModal(plan);
        } else {
          window.open(waLink(pixInterestMessage(plan)), "_blank", "noopener,noreferrer");
          track("whatsapp_click", { source: "pix_pay_fallback", plan_id: plan.id });
        }
      });
    }
  });
})();

/* ---------- 7b. Modal PIX (QR + copia e cola) ---------- */

(function initPixModal() {
  const modal = document.getElementById("pixModal");
  if (!modal) return;

  const dialog = modal.querySelector(".pix-modal__dialog");
  const backdrop = modal.querySelector(".pix-modal__backdrop");
  const closeBtn = modal.querySelector(".pix-modal__close");
  const titleEl = document.getElementById("pixModalTitle");
  const amountEl = document.getElementById("pixModalAmount");
  const qrEl = document.getElementById("pixModalQr");
  const codeEl = document.getElementById("pixModalCode");
  const copyBtn = document.getElementById("pixModalCopy");
  const waBtn = document.getElementById("pixModalWhats");
  let lastFocus = null;
  let currentPlan = null;

  function focusable() {
    return Array.from(
      modal.querySelectorAll('button, a[href], textarea, [tabindex]:not([tabindex="-1"])')
    ).filter((el) => !el.disabled && el.offsetParent !== null);
  }

  function close() {
    modal.hidden = true;
    document.body.style.overflow = "";
    if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
  }

  function open(plan) {
    if (!plan || plan.price == null) return;
    if (!titleEl || !amountEl || !qrEl || !codeEl || !waBtn || !copyBtn) return;

    currentPlan = plan;
    lastFocus = document.activeElement;
    const copia = (plan.pixCopiaECola || "").trim() || buildPixCopiaECola(plan.price);
    const priceLabel = formatPrice(plan.price);

    titleEl.textContent = `PIX · ${plan.name}`;
    amountEl.textContent = priceLabel ? `R$ ${priceLabel}` : "";
    codeEl.value = copia;
    renderPixQr(qrEl, copia, `QR Code Pix do plano ${plan.name}`);
    waBtn.href = waLink(pixWhatsAppMessage(plan));
    waBtn.target = "_blank";
    waBtn.rel = "noopener noreferrer";
    copyBtn.textContent = "Copiar código Pix";

    modal.hidden = false;
    document.body.style.overflow = "hidden";
    try {
      (closeBtn || dialog || copyBtn).focus();
    } catch (_) {
      /* ignore */
    }
    track("pix_modal_open", { plan_id: plan.id, plan_name: plan.name, value: plan.price });
  }

  window.openPixModal = open;

  if (backdrop) backdrop.addEventListener("click", close);
  if (closeBtn) closeBtn.addEventListener("click", close);

  copyBtn.addEventListener("click", async () => {
    const text = codeEl.value || "";
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        codeEl.select();
        document.execCommand("copy");
      }
      copyBtn.textContent = "Código copiado!";
      track("pix_copy", {
        plan_id: currentPlan && currentPlan.id,
        plan_name: currentPlan && currentPlan.name,
      });
      setTimeout(() => {
        copyBtn.textContent = "Copiar código Pix";
      }, 2000);
    } catch (_) {
      codeEl.select();
      copyBtn.textContent = "Selecione e copie (Ctrl+C)";
    }
  });

  waBtn.addEventListener("click", () => {
    track("whatsapp_click", {
      source: "pix_modal",
      plan_id: currentPlan && currentPlan.id,
    });
  });

  window.addEventListener("keydown", (e) => {
    if (modal.hidden) return;
    if (e.key === "Escape") {
      close();
      return;
    }
    if (e.key !== "Tab") return;
    const items = focusable();
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });
})();

/* ---------- 8. Depoimentos (só se houver conteúdo real) ---------- */

(function initTestimonials() {
  const section = document.getElementById("depoimentos");
  const grid = document.getElementById("quotesGrid");
  if (!section || !grid) return;

  const items = Array.isArray(TESTIMONIALS)
    ? TESTIMONIALS.filter((t) => t && String(t.quote || "").trim())
    : [];

  if (!items.length) {
    section.hidden = true;
    return;
  }

  grid.innerHTML = items
    .map((t) => {
      const quote = escapeHtml(String(t.quote).trim());
      const name = escapeHtml(String(t.name || "Paciente").trim());
      const detail = escapeHtml(String(t.detail || "").trim());
      return `<li class="quote-card">
        <blockquote>${quote}</blockquote>
        <p class="quote-card__who"><strong>${name}</strong>${
          detail ? `<span>${detail}</span>` : ""
        }</p>
      </li>`;
    })
    .join("");

  section.hidden = false;
})();

/* ---------- 9. Tracking de CTAs ---------- */

(function initCtaTracking() {
  ["whatsFloat", "plansDoubt"].forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("click", () => track("whatsapp_click", { source: id }));
  });

  document.querySelectorAll('[data-cta="footer-whats"], [data-cta="footer-whats-text"]').forEach((el) => {
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

/* ---------- 10. Analytics (carrega após interação) ---------- */

(function initAnalytics() {
  function loadGtag() {
    if (window.__gtagLoaded) return;
    window.__gtagLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", "G-QKJYT0FB50");

    const s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=G-QKJYT0FB50";
    document.head.appendChild(s);
  }

  if ("requestIdleCallback" in window) {
    requestIdleCallback(loadGtag, { timeout: 3000 });
  } else {
    window.addEventListener("load", () => setTimeout(loadGtag, 1200), { once: true });
  }
})();

/* ---------- 11. Animação ao rolar ---------- */

(function initReveal() {
  // Planos NÃO entram no reveal: preço/CTA devem aparecer na hora (conversão)
  const els = document.querySelectorAll(
    ".section-head, .pain-card, .gain-card, .about__copy, .faq__item, .first-visit__steps li"
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
    { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
  );
  els.forEach((el) => io.observe(el));
})();
