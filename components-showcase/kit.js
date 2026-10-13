/* Capgemini Invent Design System - kit behaviour
   Plain script, works over file://. Load once per page:
     <script src="../../kit.js" defer></script>
   Wires, when the markup is present:
     .cg-site-nav            scroll shadow + mobile toggle (.cg-site-nav__toggle)
     .cg-reveal              fade-up on scroll (content stays visible without JS)
     [role=tablist]          tabs: click + arrow keys, shows aria-controls panel
     [data-cg-filter]        single-select chip group (aria-pressed). Optional filtering: set
                             data-cg-filter="#list-id" on the group, data-filter="value" on each chip
                             ("all" shows everything) and data-cat="value" on each list item. An element
                             with [data-cg-empty] inside the list's parent shows when nothing matches.
     [data-cg-current]       nav group: click moves aria-current (page) to the clicked item
     [data-cg-open="id"]     opens <dialog class="cg-modal" id="id">; [data-cg-close] or backdrop closes
     details.cg-dropdown     closes on outside click, Esc, item or link pick
     cgToast(text, tone)     toast in a polite live region; or <button data-cg-toast="Saved" data-cg-toast-tone="success">
     [data-cg-contain]       keeps overlays inside this element (the mobile phone screen): toasts land in it,
                             and a cg-modal that is its direct child opens over it only, the rest made inert
     window.CG_CHAT          assistant chatbot popup, e.g.
       window.CG_CHAT = { title: "Claims assistant", subtitle: "Grounded on your queue",
         greeting: "Hi Jordan. ...", suggestions: ["...", "..."], placeholder: "Ask about a claim" };
*/
(function () {
  document.documentElement.classList.add("js");

  function ready(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }
  function all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function siteNav() {
    var navs = all(".cg-site-nav");
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      navs.forEach(function (nav) {
        if (!nav.classList.contains("is-open")) return;
        nav.classList.remove("is-open");
        var t = nav.querySelector(".cg-site-nav__toggle");
        if (t) { t.setAttribute("aria-expanded", "false"); t.focus(); }
      });
    });
    navs.forEach(function (nav) {
      function onScroll() { nav.classList.toggle("is-scrolled", window.scrollY > 8); }
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
      var toggle = nav.querySelector(".cg-site-nav__toggle");
      if (!toggle) return;
      function set(open) {
        nav.classList.toggle("is-open", open);
        toggle.setAttribute("aria-expanded", String(open));
      }
      toggle.addEventListener("click", function () { set(!nav.classList.contains("is-open")); });
      all(".cg-site-nav__links a", nav).forEach(function (a) { a.addEventListener("click", function () { set(false); }); });
    });
  }

  function reveal() {
    var items = all(".cg-reveal");
    if (!("IntersectionObserver" in window)) { items.forEach(function (el) { el.classList.add("is-visible"); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    items.forEach(function (el) { io.observe(el); });
  }

  function tabs() {
    all("[role=tablist]").forEach(function (list) {
      var tabs = all("[role=tab]", list);
      function select(tab, focus) {
        tabs.forEach(function (t) {
          var on = t === tab;
          t.setAttribute("aria-selected", String(on));
          t.setAttribute("tabindex", on ? "0" : "-1");
          t.classList.toggle("is-active", on);
          var panel = document.getElementById(t.getAttribute("aria-controls"));
          if (panel) panel.hidden = !on;
        });
        if (focus) tab.focus();
      }
      tabs.forEach(function (t, i) {
        t.addEventListener("click", function () { select(t); });
        t.addEventListener("keydown", function (e) {
          var d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
          if (d) { e.preventDefault(); select(tabs[(i + d + tabs.length) % tabs.length], true); }
          else if (e.key === "Home") { e.preventDefault(); select(tabs[0], true); }
          else if (e.key === "End") { e.preventDefault(); select(tabs[tabs.length - 1], true); }
        });
      });
      var current = tabs.filter(function (t) { return t.getAttribute("aria-selected") === "true"; })[0] || tabs[0];
      if (current) select(current);
    });
  }

  function filters() {
    all("[data-cg-filter]").forEach(function (group) {
      var chips = all("[aria-pressed]", group);
      var sel = group.getAttribute("data-cg-filter");
      var list = sel ? document.querySelector(sel) : null;
      chips.forEach(function (c) {
        c.addEventListener("click", function () {
          chips.forEach(function (o) { o.setAttribute("aria-pressed", String(o === c)); });
          if (!list) return;
          var value = c.getAttribute("data-filter") || "all";
          var shown = 0;
          all("[data-cat]", list).forEach(function (item) {
            var on = value === "all" || item.getAttribute("data-cat") === value;
            item.hidden = !on;
            if (on) shown++;
          });
          var empty = list.parentNode.querySelector("[data-cg-empty]");
          if (empty) empty.hidden = shown > 0;
        });
      });
    });
  }

  function currentGroups() {
    all("[data-cg-current]").forEach(function (group) {
      var items = all("a, button", group);
      items.forEach(function (it) {
        it.addEventListener("click", function () {
          items.forEach(function (o) {
            if (o === it) o.setAttribute("aria-current", "page"); else o.removeAttribute("aria-current");
          });
        });
      });
    });
  }

  function modals() {
    document.addEventListener("click", function (e) {
      var opener = e.target.closest("[data-cg-open]");
      if (opener) {
        var d = document.getElementById(opener.getAttribute("data-cg-open"));
        if (d && d.showModal) open(d, opener);
        return;
      }
      var closer = e.target.closest("[data-cg-close]");
      var dlg = closer && closer.closest("dialog");
      if (dlg) { dlg.close(); return; }
      // click on the backdrop lands on the <dialog> itself
      if (e.target.matches && e.target.matches("dialog.cg-modal")) { e.target.close(); return; }
      // contained modal: a click anywhere else in the container acts as the backdrop
      var box = e.target.closest && e.target.closest("[data-cg-contain]");
      var inBox = box && box.querySelector(":scope > dialog.cg-modal[open]");
      if (inBox && !inBox.contains(e.target)) inBox.close();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      all("[data-cg-contain] > dialog.cg-modal[open]").forEach(function (d) { d.close(); });
    });
  }
  function open(d, opener) {
    var box = d.parentElement;
    if (!box || !box.hasAttribute("data-cg-contain")) { d.showModal(); return; }
    // non-modal show keeps the dialog in the container; inert siblings stand in for the focus trap
    var rest = all(":scope > *", box).filter(function (c) { return c !== d && !c.inert && c !== toastRegion; });
    rest.forEach(function (c) { c.inert = true; });
    d.addEventListener("close", function () {
      rest.forEach(function (c) { c.inert = false; });
      if (opener && opener.focus) opener.focus();
    }, { once: true });
    d.show();
  }

  function dropdowns() {
    function closeAll(except) {
      all("details.cg-dropdown[open]").forEach(function (d) { if (d !== except) d.open = false; });
    }
    document.addEventListener("click", function (e) {
      var d = e.target.closest("details.cg-dropdown");
      closeAll(d);
      if (d && e.target.closest(".cg-dropdown__item, .cg-dropdown__menu a")) d.open = false;
    });
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      var d = document.activeElement && document.activeElement.closest("details.cg-dropdown[open]");
      if (d) { d.open = false; d.querySelector("summary").focus(); }
    });
  }

  var toastRegion;
  var TONE = { success: "check", warning: "alert", error: "alert", info: "info" };
  function region() {
    if (!toastRegion) {
      // created up front so screen readers are already watching it when the first toast lands
      toastRegion = document.createElement("div");
      toastRegion.className = "cg-toast-region";
      toastRegion.setAttribute("role", "status");
      toastRegion.setAttribute("aria-live", "polite");
      (document.querySelector("[data-cg-contain]") || document.body).appendChild(toastRegion);
    }
    return toastRegion;
  }
  window.cgToast = function (text, tone) {
    region();
    var t = document.createElement("div");
    t.className = "cg-toast" + (tone ? " cg-toast--" + tone : "");
    t.innerHTML = '<span class="cg-toast__icon">' + svg(TONE[tone] || "info", 14).replace('stroke-width="1.6"', 'stroke-width="2.4"') + '</span><span class="cg-toast__text"></span>' +
      '<button type="button" class="cg-icon-btn" aria-label="Dismiss">' + svg("close", 16) + '</button><span class="cg-toast__timer" aria-hidden="true"></span>';
    t.querySelector(".cg-toast__text").textContent = text;
    t.querySelector("button").addEventListener("click", function () { t.remove(); });
    while (toastRegion.children.length > 2) toastRegion.firstChild.remove();
    toastRegion.appendChild(t);
    setTimeout(function () { t.remove(); }, 5000);
  };
  function toasts() {
    region();
    document.addEventListener("click", function (e) {
      var b = e.target.closest("[data-cg-toast]");
      if (b) window.cgToast(b.getAttribute("data-cg-toast"), b.getAttribute("data-cg-toast-tone"));
    });
  }

  var ICON = {
    chat: '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>',
    restart: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
    close: '<path d="M18 6 6 18M6 6l12 12"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    info: '<path d="M12 11v6"/><circle cx="12" cy="7" r="0.5" fill="currentColor"/>',
    alert: '<path d="M12 6v7"/><circle cx="12" cy="18" r="0.5" fill="currentColor"/>',
    send: '<path d="M22 2 11 13M22 2l-7 20-4-9-9-4z"/>'
  };
  function svg(name, size) {
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICON[name] + "</svg>";
  }

  function chat() {
    var cfg = window.CG_CHAT;
    if (!cfg) return;
    var title = cfg.title || "Assistant";
    var fab = document.createElement("button");
    fab.className = "cg-chat-fab";
    fab.type = "button";
    fab.setAttribute("aria-label", "Open " + title.toLowerCase());
    fab.setAttribute("aria-expanded", "false");
    fab.setAttribute("aria-controls", "cg-chat");
    fab.innerHTML = svg("chat", 24);

    var panel = document.createElement("section");
    panel.className = "cg-chat";
    panel.id = "cg-chat";
    panel.hidden = true;
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "true");
    panel.setAttribute("aria-label", title);
    panel.innerHTML =
      '<div class="cg-chat__head"><div class="cg-chat__mark">' + svg("chat", 18) + "</div>" +
      '<div><div class="cg-chat__title"></div><div class="cg-chat__sub"></div></div>' +
      '<div class="cg-chat__actions">' +
      '<button type="button" class="cg-icon-btn" data-act="restart" aria-label="Restart chat" title="Restart chat">' + svg("restart", 18) + "</button>" +
      '<button type="button" class="cg-icon-btn" data-act="close" aria-label="Close ' + title.toLowerCase() + '">' + svg("close", 18) + "</button>" +
      "</div></div>" +
      '<div class="cg-chat__body" aria-live="polite"></div>' +
      '<form class="cg-chat__foot"><input class="cg-input cg-input--pill" type="text" aria-label="Message">' +
      '<button type="submit" class="cg-chat__send" aria-label="Send">' + svg("send", 18) + "</button></form>";
    panel.querySelector(".cg-chat__title").textContent = title;
    panel.querySelector(".cg-chat__sub").textContent = cfg.subtitle || "";
    var body = panel.querySelector(".cg-chat__body");
    var input = panel.querySelector("input");
    input.placeholder = cfg.placeholder || "Type a message";

    function msg(role, text) {
      var d = document.createElement("div");
      d.className = "cg-chat__msg cg-chat__msg--" + role;
      d.textContent = text;
      body.appendChild(d);
      body.scrollTop = body.scrollHeight;
    }
    function ask(text) {
      msg("user", text);
      setTimeout(function () {
        msg("bot", cfg.reply ? cfg.reply(text) : "Here is what I found for “" + text + "”. (Demo response. Wire this to your assistant backend.)");
      }, 350);
    }
    function reset() {
      body.innerHTML = "";
      msg("bot", cfg.greeting || "How can I help?");
      var wrap = document.createElement("div");
      wrap.className = "cg-chat__suggests";
      (cfg.suggestions || []).forEach(function (s) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "cg-chat__suggest";
        b.textContent = s;
        b.addEventListener("click", function () { wrap.remove(); ask(s); });
        wrap.appendChild(b);
      });
      body.appendChild(wrap);
    }
    function set(open) {
      panel.hidden = !open;
      fab.setAttribute("aria-expanded", String(open));
      if (open) input.focus(); else fab.focus();
    }

    fab.addEventListener("click", function () { set(panel.hidden); });
    panel.querySelector("[data-act=close]").addEventListener("click", function () { set(false); });
    panel.querySelector("[data-act=restart]").addEventListener("click", reset);
    panel.querySelector("form").addEventListener("submit", function (e) {
      e.preventDefault();
      var v = input.value.trim();
      if (v) { ask(v); input.value = ""; }
    });
    document.addEventListener("keydown", function (e) {
      if (panel.hidden) return;
      if (e.key === "Escape") { set(false); return; }
      if (e.key !== "Tab") return;
      // keep Tab inside the open panel
      var f = all("button, input", panel).filter(function (el) { return !el.disabled && el.offsetParent !== null; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    document.body.appendChild(panel);
    document.body.appendChild(fab);
    reset();
  }

  ready(function () { siteNav(); reveal(); tabs(); filters(); currentGroups(); modals(); dropdowns(); toasts(); chat(); });
})();
