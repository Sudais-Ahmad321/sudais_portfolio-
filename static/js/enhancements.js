/* Portfolio upgrade layer: split headings, card tilt + spotlight, scroll reveals.
   Runs after the page's own scripts. Safe to load on any device. */
(function () {
  "use strict";

  var root = document.documentElement;
  root.classList.add("js-ready");

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- 1. Split headings into animated letters ---------- */

  var HEADING_SELECTOR = ".section-title, .hero-title-main";

  // Wraps every character of every text node in a span.ch, keeping element
  // children (e.g. .gradient-text, .name-highlight) and their attributes intact.
  function splitNode(node, counter) {
    Array.prototype.slice.call(node.childNodes).forEach(function (child) {
      if (child.nodeType === 3) {
        var frag = document.createDocumentFragment();
        child.textContent.split("").forEach(function (ch) {
          var span = document.createElement("span");
          span.className = "ch";
          span.style.setProperty("--i", counter.i++);
          span.textContent = ch === " " ? "\u00A0" : ch;
          frag.appendChild(span);
        });
        child.parentNode.replaceChild(frag, child);
      } else if (child.nodeType === 1) {
        splitNode(child, counter);
      }
    });
  }

  var headings = document.querySelectorAll(HEADING_SELECTOR);
  headings.forEach(function (h) {
    h.classList.add("split-heading");
    splitNode(h, { i: 0 });
  });

  // Reveal headings as they scroll into view
  var revealTargets = Array.prototype.slice.call(headings).concat(
    Array.prototype.slice.call(document.querySelectorAll(".section-header"))
  );

  if ("IntersectionObserver" in window && !reduceMotion) {
    var headingObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          headingObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.35 });
    revealTargets.forEach(function (el) { headingObs.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- 2. Card system: tilt, spotlight, staggered entry ---------- */

  var CARD_SELECTOR = [
    ".project-card-major",
    ".sec-proj-card",
    ".focus-card",
    ".skill-cat-card",
    ".about-card",
    ".cert-item-card",
    ".hero-stat-card",
    ".opswat-card",
    ".contact-form-card",
    ".contact-card-left"
  ].join(",");

  var cards = document.querySelectorAll(CARD_SELECTOR);
  cards.forEach(function (card) { card.classList.add("fx-card"); });

  // Stagger entrance delays within each grid so cards cascade in
  document.querySelectorAll(
    ".projects-container-grid, .secondary-projects-grid, .focus-cards-grid, .skill-cat-grid"
  ).forEach(function (grid) {
    Array.prototype.slice.call(grid.children).forEach(function (child, idx) {
      child.style.setProperty("--d", idx);
    });
  });

  // Tilt + spotlight only on devices with a fine pointer (PC / laptop)
  if (finePointer && !reduceMotion) {
    var MAX_TILT = 6; // degrees

    cards.forEach(function (card) {
      var raf = null;
      var last = null;

      card.addEventListener("pointermove", function (e) {
        last = e;
        if (raf) return;
        raf = requestAnimationFrame(function () {
          raf = null;
          var r = card.getBoundingClientRect();
          var px = (last.clientX - r.left) / r.width;   // 0..1
          var py = (last.clientY - r.top) / r.height;   // 0..1
          card.style.setProperty("--mx", (px * 100) + "%");
          card.style.setProperty("--my", (py * 100) + "%");
          card.style.setProperty("--ry", ((px - 0.5) * 2 * MAX_TILT).toFixed(2) + "deg");
          card.style.setProperty("--rx", ((0.5 - py) * 2 * MAX_TILT).toFixed(2) + "deg");
        });
      });

      card.addEventListener("pointerleave", function () {
        card.style.setProperty("--rx", "0deg");
        card.style.setProperty("--ry", "0deg");
      });
    });
  }

  /* ---------- 3. Scroll reveal for anything marked fade-up ---------- */
  // The page already toggles .visible on .fade-up; this only makes sure
  // cards added by this layer are not stuck invisible if that observer missed them.
  if (!reduceMotion) {
    document.querySelectorAll(".fx-card.fade-up").forEach(function (el) {
      el.style.willChange = "transform, opacity";
    });
  }
})();
