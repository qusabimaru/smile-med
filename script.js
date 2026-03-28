(function () {
  "use strict";

  var yearEl = document.querySelector("[data-year]");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* Header: прозрачный у верха и смена стиля только на главной (body.page-home) */
  var headerEl = document.querySelector(".header");
  if (headerEl && document.body.classList.contains("page-home")) {
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

  /* Before/After slider (до/после) */
  var baSliders = document.querySelectorAll("[data-ba-slider]");
  baSliders.forEach(function (slider) {
    var range = slider.querySelector("[data-ba-range]");
    var nearHandleRadius = 56;
    var labelEdgeThreshold = 85;
    function clampPos(v) {
      if (Number.isNaN(v)) return 50;
      return Math.max(0, Math.min(100, v));
    }

    function applyPos(pos) {
      var p = clampPos(pos);
      slider.style.setProperty("--ba-pos", String(p));
      slider.style.setProperty("--ba-pos-p", String(p) + "%");
      slider.dataset.hideBeforeLabel = p >= labelEdgeThreshold ? "true" : "false";
      slider.dataset.hideAfterLabel =
        p <= 100 - labelEdgeThreshold ? "true" : "false";
      if (range) range.value = String(p);
    }

    var initial = range ? parseFloat(range.value) : 50;
    applyPos(initial);

    if (range) {
      range.addEventListener("input", function () {
        applyPos(parseFloat(range.value));
      });
    }

    function syncNearHandle(clientX, clientY) {
      var rect = slider.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      var pos = clampPos(
        parseFloat(
          getComputedStyle(slider).getPropertyValue("--ba-pos")
        )
      );
      var handleX = rect.left + (rect.width * pos) / 100;
      var handleY = rect.top + rect.height / 2;
      var dx = clientX - handleX;
      var dy = clientY - handleY;
      var near = dx * dx + dy * dy <= nearHandleRadius * nearHandleRadius;
      slider.dataset.nearHandle = near ? "true" : "false";
    }

    slider.addEventListener("pointermove", function (e) {
      syncNearHandle(e.clientX, e.clientY);
    });

    slider.addEventListener("pointerenter", function (e) {
      syncNearHandle(e.clientX, e.clientY);
    });

    slider.addEventListener("pointerleave", function () {
      slider.dataset.nearHandle = "false";
    });

    slider.addEventListener("pointerdown", function () {
      slider.dataset.dragging = "true";
      var end = function () {
        slider.dataset.dragging = "false";
        window.removeEventListener("pointerup", end);
        window.removeEventListener("pointercancel", end);
      };
      window.addEventListener("pointerup", end);
      window.addEventListener("pointercancel", end);
    });
  });

  /* Лицензии врачей — заглушка до загрузки PDF или страницы */
  document.querySelectorAll("[data-license-placeholder]").forEach(function (link) {
    link.addEventListener("click", function (e) {
      if (link.getAttribute("href") === "#") {
        e.preventDefault();
        alert(
          "Добавьте ссылку на сканы лицензий или страницу «Документы». Сейчас это заглушка."
        );
      }
    });
  });

})();
