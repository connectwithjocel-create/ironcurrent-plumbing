/* Ironcurrent Plumbing Co. — site script (vanilla, no dependencies) */
(function () {
  var roots = document.querySelectorAll(".ic"); if (!roots.length) return;
  var root = roots[0];
  Array.prototype.forEach.call(roots, function (r) { r.classList.add("js"); });
  var RM = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var esc = function (t) { var d = document.createElement("div"); d.textContent = t == null ? "" : String(t); return d.innerHTML; };
  var json = function (id) { var n = document.getElementById(id); try { return n ? JSON.parse(n.textContent) : null; } catch (e) { return null; } };
  var swap = function (el, cls) { if (RM || !el) return; el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); };
  var CFG = window.IC_CONFIG || {};

  /* images that can't load -> branded placeholder with caption */
  $$(".ph img").forEach(function (im) {
    var mark = function () { im.parentNode.classList.add("broken"); };
    if (im.complete && im.naturalWidth === 0) mark(); else im.addEventListener("error", mark);
  });

  /* header */
  var hdr = $("#hdr");
  var onScroll = function () { if (hdr) hdr.classList.toggle("scrolled", window.scrollY > 30); };
  onScroll(); window.addEventListener("scroll", onScroll, { passive: true });
  var megaBtn = $(".nav .t[aria-controls=mega]"), mega = $("#mega");
  var closeMega = function () { if (megaBtn) { megaBtn.setAttribute("aria-expanded", "false"); mega.classList.remove("open"); } };
  if (megaBtn) {
    megaBtn.addEventListener("click", function (ev) {
      ev.stopPropagation(); var o = megaBtn.getAttribute("aria-expanded") === "true";
      megaBtn.setAttribute("aria-expanded", o ? "false" : "true"); mega.classList.toggle("open", !o);
      if (!o && ev.detail === 0) { var f = $("a", mega); if (f) f.focus(); }
    });
    document.addEventListener("click", function (ev) { if (!ev.target.closest("#mega")) closeMega(); });
    mega.addEventListener("focusout", function (ev) { if (!mega.contains(ev.relatedTarget) && ev.relatedTarget !== megaBtn) closeMega(); });
  }
  var burger = $(".burger"), drawer = $("#drawer");
  var setDrawer = function (on) {
    drawer.classList.toggle("open", on); burger.setAttribute("aria-expanded", on ? "true" : "false");
    burger.setAttribute("aria-label", on ? "Close menu" : "Open menu"); 
    document.documentElement.style.overflow = on ? "hidden" : ""; if (on) hdr.classList.add("scrolled"); else onScroll();
  };
  if (burger) burger.addEventListener("click", function () { setDrawer(burger.getAttribute("aria-expanded") !== "true"); });
  document.addEventListener("keydown", function (ev) {
    if (ev.key !== "Escape") return;
    if (megaBtn && megaBtn.getAttribute("aria-expanded") === "true") { closeMega(); megaBtn.focus(); }
    if (drawer && drawer.classList.contains("open")) { setDrawer(false); burger.focus(); }
    var lb = $(".lb[open]"); if (lb) lb.close();
  });
  window.addEventListener("resize", function () { if (window.innerWidth > 1140 && drawer && drawer.classList.contains("open")) setDrawer(false); });

  /* flowline lengths + reveals */
  $$("[data-draw] .pipe").forEach(function (p) { try { p.style.setProperty("--len", Math.ceil(p.getTotalLength()) + 2); } catch (e) {} });
  $$(".schem-fig .hl").forEach(function (p) { try { p.style.setProperty("--len", Math.ceil(p.getTotalLength()) + 2); } catch (e) {} });
  var hero = $(".hero[data-intro]"), T = $$("[data-rv],[data-draw]");
  if (RM || !("IntersectionObserver" in window)) { T.forEach(function (t) { t.classList.add("in"); }); if (hero) hero.classList.add("in"); }
  else {
    var io = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } }); }, { rootMargin: "0px 0px -8% 0px", threshold: .1 });
    T.forEach(function (t) { io.observe(t); });
    if (hero) requestAnimationFrame(function () { setTimeout(function () { hero.classList.add("in"); }, 60); });
  }

  /* generic tablist with arrow keys */
  function tabs(list, sel, onSelect) {
    var bs = $$(sel, list);
    var select = function (b, focus) {
      bs.forEach(function (x) { var on = x === b; x.setAttribute("aria-selected", on ? "true" : "false"); x.tabIndex = on ? 0 : -1; });
      if (focus) b.focus(); onSelect(b, bs.indexOf(b));
    };
    bs.forEach(function (b) {
      b.addEventListener("click", function () { select(b); });
      b.addEventListener("keydown", function (ev) {
        var i = bs.indexOf(b), n = null, k = ev.key;
        if (k === "ArrowRight" || k === "ArrowDown") n = bs[(i + 1) % bs.length];
        if (k === "ArrowLeft" || k === "ArrowUp") n = bs[(i - 1 + bs.length) % bs.length];
        if (k === "Home") n = bs[0]; if (k === "End") n = bs[bs.length - 1];
        if (n) { ev.preventDefault(); select(n, true); }
      });
    });
  }

  /* house schematic */
  var sc = $("[data-schem]"), SD = json("ic-schem");
  if (sc && SD) {
    var keys = Object.keys(SD), panel = $(".schem-panel", sc);
    var show = function (k, focusEl) {
      var d = SD[k]; if (!d) return;
      $$(".hs", sc).forEach(function (h) { h.setAttribute("aria-pressed", h.getAttribute("data-k") === k ? "true" : "false"); });
      $$(".schem-tabs button", sc).forEach(function (h) { h.setAttribute("aria-pressed", h.getAttribute("data-k") === k ? "true" : "false"); });
      $$(".hl", sc).forEach(function (p) { p.classList.toggle("on", p.getAttribute("data-hl") === k); });
      $('[data-k="n"]', panel).textContent = keys.indexOf(k) + 1;
      $('[data-k="name"]', panel).textContent = d.name; $('[data-k="tip"]', panel).textContent = d.tip;
      $('[data-k="issues"]', panel).innerHTML = d.issues.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("");
      $('[data-k="url"]', panel).setAttribute("href", d.url); $('[data-k="svc"]', panel).textContent = d.svc;
      swap(panel, "swap");
    };
    var started = false;
    $$(".hs", sc).forEach(function (h) {
      h.addEventListener("click", function () { started = true; show(h.getAttribute("data-k")); });
      h.addEventListener("keydown", function (ev) {
        started = true;
        if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); show(h.getAttribute("data-k")); }
        if (ev.key === "ArrowRight" || ev.key === "ArrowLeft") {
          ev.preventDefault(); var i = keys.indexOf(h.getAttribute("data-k")), n = keys[(i + (ev.key === "ArrowRight" ? 1 : keys.length - 1)) % keys.length];
          show(n); $('.hs[data-k="' + n + '"]', sc).focus();
        }
      });
    });
    $$(".schem-tabs button", sc).forEach(function (b) { b.addEventListener("click", function () { started = true; show(b.getAttribute("data-k")); }); });
    var start = function () { if (!started) { started = true; show(keys[0]); } };
    if ("IntersectionObserver" in window && !RM) { var so = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { start(); so.disconnect(); } }, { threshold: .3 }); so.observe(sc); } else start();
  }

  /* process */
  var pr = $("[data-proc]"), PS = json("ic-steps");
  if (pr && PS) {
    var prog = $(".prog", pr), steps = $$(".proc-step", pr), L = 0;
    if (prog) { try { L = prog.getTotalLength(); } catch (e) { L = 1000; } prog.style.strokeDasharray = L; prog.style.strokeDashoffset = L * .82; }
    tabs($(".proc-steps", pr), ".proc-step", function (b, i) {
      steps.forEach(function (s, j) { s.classList.toggle("done", j <= i); });
      if (prog) prog.style.strokeDashoffset = L * (1 - (i + .4) / steps.length);
      var p = $(".proc-panel", pr);
      $('[data-k="n"]', p).textContent = "0" + (i + 1); $('[data-k="t"]', p).textContent = PS[i].t; $('[data-k="d"]', p).textContent = PS[i].d;
      $('[data-k="pts"]', p).innerHTML = PS[i].pts.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("");
      swap(p, "swap");
    });
  }

  /* seasons */
  var se = $("[data-seasons]"), SS = json("ic-seasons");
  if (se && SS) {
    var body = $(".s-body", se), im = $(".ph img", se);
    tabs($(".s-tabs", se), "button", function (b) {
      var d = SS[b.getAttribute("data-k")];
      $('[data-k="h"]', se).textContent = d.h;
      $('[data-k="tips"]', se).innerHTML = d.tips.map(function (t) { return "<li><div><b>" + esc(t[0]) + "</b><span>" + esc(t[1]) + "</span></div></li>"; }).join("");
      if (im) { im.parentNode.classList.remove("broken"); im.removeAttribute("srcset"); im.src = d.img; im.alt = d.alt; im.parentNode.setAttribute("data-cap", d.alt); }
      swap(body, "swap");
    });
  }

  /* gallery filter + lightbox */
  $$("[data-gal]").forEach(function (g) {
    var fbs = $$(".filters button", g), items = $$(".gal button", g), lb = $(".lb", g);
    fbs.forEach(function (b) {
      b.addEventListener("click", function () {
        var f = b.getAttribute("data-f");
        fbs.forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        items.forEach(function (it) { it.classList.toggle("hide", f !== "all" && it.getAttribute("data-cat") !== f); });
      });
    });
    if (!lb || typeof lb.showModal !== "function") return;
    var lim = $("img", lb), cap = $("figcaption", lb), opener = null;
    items.forEach(function (it) {
      it.addEventListener("click", function () {
        opener = it; lim.parentNode.classList.remove("broken"); lim.src = it.getAttribute("data-full"); lim.alt = it.getAttribute("data-cap");
        lim.onerror = function () { lim.parentNode.classList.add("broken"); lim.parentNode.setAttribute("data-cap", it.getAttribute("data-cap")); };
        cap.textContent = it.getAttribute("data-cap"); lb.showModal(); $(".x", lb).focus();
      });
    });
    $(".x", lb).addEventListener("click", function () { lb.close(); });
    lb.addEventListener("click", function (ev) { if (ev.target === lb) lb.close(); });
    lb.addEventListener("close", function () { if (opener) opener.focus(); });
  });

  /* forms — validation, progress meter, honest delivery */
  function check(form) {
    var ok = true, first = null;
    $$(".f", form).forEach(function (f) {
      var bad = false, t = null;
      var radios = $$("input[type=radio]", f);
      if (radios.length) { var req = radios.some(function (r) { return r.required; }); bad = req && !radios.some(function (r) { return r.checked; }); t = radios[0]; }
      else {
        var c = $("input:not([type=file]),select,textarea", f); if (!c) return; t = c;
        if (c.type === "checkbox") bad = c.required && !c.checked;
        else if (c.required) { var v = c.value.trim(); bad = !v || (c.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) || (c.type === "tel" && v.replace(/\D/g, "").length < 10); }
      }
      f.classList.toggle("bad", bad); if (t) t.setAttribute("aria-invalid", bad ? "true" : "false");
      if (bad) { ok = false; if (!first) first = t; }
    });
    if (first) first.focus();
    return ok;
  }
  function meter(form) {
    var req = $$(".f", form).filter(function (f) { return $("[required]", f); }), done = 0;
    req.forEach(function (f) {
      var r = $$("input[type=radio]", f);
      if (r.length) { if (r.some(function (x) { return x.checked; })) done++; return; }
      var c = $("[required]", f); if (c.type === "checkbox" ? c.checked : c.value.trim()) done++;
    });
    var m = $(".fmeter i", form); if (m) m.style.width = (req.length ? done / req.length * 100 : 0) + "%";
  }
  $$("form.icf").forEach(function (form) {
    form.addEventListener("input", function (ev) { var f = ev.target.closest(".f"); if (f) f.classList.remove("bad"); meter(form); });
    form.addEventListener("change", function () { meter(form); });
    form.addEventListener("submit", function (ev) {
      ev.preventDefault(); if (!check(form)) return;
      var st = $(".fstat", form), btn = $("button[type=submit]", form), url = CFG.formEndpoint || "";
      st.className = "fstat";
      if (form.elements.company_website && form.elements.company_website.value) return;
      if (!url) {
        /* No backend by choice: show the thank-you state; nothing is sent or stored. */
        form.classList.add("done"); var dn = $(".fdone", form); if (dn) dn.focus(); return;
      }
      var fd = new FormData(form); fd.append("form_name", form.getAttribute("data-form")); fd.append("page_url", location.href); fd.append("submitted_at", new Date().toISOString());
      btn.disabled = true; btn.setAttribute("aria-busy", "true");
      fetch(url, { method: "POST", body: fd }).then(function (r) {
        if (!r.ok) throw 0;
        form.classList.add("done"); var d = $(".fdone", form); if (d) d.focus();
      }).catch(function () {
        st.textContent = "Something went wrong and your request was not sent. Please try again."; st.className = "fstat on";
      }).then(function () { btn.disabled = false; btn.removeAttribute("aria-busy"); });
    });
    meter(form);
  });
})();
