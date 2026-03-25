(function () {
  "use strict";

  var yearEl = document.querySelector("[data-year]");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* Header: прозрачный у верха страницы, белый после прокрутки */
  var headerEl = document.querySelector(".header");
  if (headerEl) {
    var headerScrollThreshold = 16;
    var headerTicking = false;
    function syncHeaderSolid() {
      headerTicking = false;
      if (window.scrollY > headerScrollThreshold) {
        headerEl.classList.add("header--scrolled");
      } else {
        headerEl.classList.remove("header--scrolled");
      }
    }
    function onHeaderScroll() {
      if (!headerTicking) {
        headerTicking = true;
        window.requestAnimationFrame(syncHeaderSolid);
      }
    }
    window.addEventListener("scroll", onHeaderScroll, { passive: true });
    syncHeaderSolid();
  }

  /* Scroll reveal */
  var revealNodes = document.querySelectorAll(".reveal");
  if (revealNodes.length) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      revealNodes.forEach(function (el) {
        el.classList.add("is-visible");
      });
    } else {
      var revealObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          });
        },
        { root: null, rootMargin: "0px 0px -7% 0px", threshold: 0.1 }
      );
      revealNodes.forEach(function (el) {
        var delay = el.getAttribute("data-reveal-delay");
        if (delay !== null && delay !== "") {
          el.style.transitionDelay = delay + "ms";
        }
        revealObserver.observe(el);
      });
    }
  }

  /* Mobile nav */
  var burger = document.querySelector("[data-burger]");
  var navMobile = document.querySelector("[data-nav-mobile]");
  if (burger && navMobile) {
    burger.addEventListener("click", function () {
      var open = navMobile.hasAttribute("hidden");
      if (open) {
        navMobile.removeAttribute("hidden");
        burger.setAttribute("aria-expanded", "true");
      } else {
        navMobile.setAttribute("hidden", "");
        burger.setAttribute("aria-expanded", "false");
      }
    });
    navMobile.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        navMobile.setAttribute("hidden", "");
        burger.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* Modal */
  var modal = document.querySelector('[data-modal="appointment"]');
  function openModal() {
    if (!modal) return;
    modal.removeAttribute("hidden");
    document.body.style.overflow = "hidden";
  }
  function closeModal() {
    if (!modal) return;
    modal.setAttribute("hidden", "");
    document.body.style.overflow = "";
  }
  document.querySelectorAll("[data-open-modal]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      openModal();
    });
  });
  if (modal) {
    modal.querySelectorAll("[data-close-modal]").forEach(function (el) {
      el.addEventListener("click", closeModal);
    });
    modal.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeModal();
    });
  }

  /* Reviews carousel */
  var carousel = document.querySelector("[data-carousel]");
  if (carousel) {
    var track = carousel.querySelector("[data-carousel-track]");
    var prev = carousel.querySelector("[data-carousel-prev]");
    var next = carousel.querySelector("[data-carousel-next]");
    var slides = track ? track.children.length : 0;
    var index = 0;

    function go(i) {
      if (!track || slides === 0) return;
      index = (i + slides) % slides;
      track.style.transform = "translateX(-" + index * 100 + "%)";
    }

    if (prev) prev.addEventListener("click", function () { go(index - 1); });
    if (next) next.addEventListener("click", function () { go(index + 1); });
  }

  /* Lead form — затычка: без отправки на сервер */
  var form = document.getElementById("lead-form");
  var hint = document.getElementById("form-hint");
  if (form && hint) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      hint.textContent =
        "Затычка: заявка не отправлена. Подключите Email, Telegram-бота или backend позже.";
      form.reset();
    });
  }

  /* Прайс-лист затычка */
  var priceBtn = document.getElementById("price-placeholder");
  if (priceBtn) {
    priceBtn.addEventListener("click", function (e) {
      if (priceBtn.getAttribute("href") === "#") {
        e.preventDefault();
        alert("Затычка: замените ссылку на PDF или страницу с прайсом.");
      }
    });
  }
})();
