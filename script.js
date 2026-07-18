/* =========================================================
   JLO Nutri — Interações do site
   ========================================================= */

/* >>> CONFIGURE AQUI <<<
   Troque pelo WhatsApp da Jenifer no formato internacional, só números.
   Ex.: Brasil (53) 99999-9999  ->  "5553999999999"
*/
const WHATSAPP_NUMBER = "5553981378527";
const INSTAGRAM_URL = "https://www.instagram.com/"; // troque pela conta da Jenifer

/* >>> LINKS DE PAGAMENTO <<<
   Cole aqui o link de pagamento de cada plano (ex.: Mercado Pago, PagBank, Stripe).
   O nome (chave) precisa ser IGUAL ao data-pay do botão no index.html.
   Enquanto o link estiver vazio (""), o botão "Pagar agora" abre o WhatsApp.
*/
const PAYMENT_LINKS = {
  "Consulta Avulsa": "",
  "Acompanhamento Mensal": "",
  "Programa Trimestral": "",
};

/* Monta um link do WhatsApp com mensagem pré-preenchida */
function waLink(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
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

/* Botões "Dúvidas no WhatsApp": mensagem específica por plano */
(function initPlanButtons() {
  document.querySelectorAll("[data-plan]").forEach((btn) => {
    const plan = btn.getAttribute("data-plan");
    btn.href = waLink(
      `Olá, Jenifer! Tenho interesse no formato "${plan}". Pode me passar os valores e horários disponíveis?`
    );
    btn.target = "_blank";
    btn.rel = "noopener noreferrer";
  });
})();

/* Botões "Pagar agora": usam o link de pagamento do plano.
   Se o link ainda não foi configurado, cai no WhatsApp. */
(function initPayButtons() {
  document.querySelectorAll("[data-pay]").forEach((btn) => {
    const plan = btn.getAttribute("data-pay");
    const link = (PAYMENT_LINKS[plan] || "").trim();

    if (link) {
      btn.href = link;
    } else {
      btn.href = waLink(
        `Olá, Jenifer! Quero fechar o formato "${plan}". Pode me enviar o link de pagamento?`
      );
    }
    btn.target = "_blank";
    btn.rel = "noopener noreferrer";
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
