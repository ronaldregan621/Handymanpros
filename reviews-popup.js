/* =========================================================================
   AHP review popup widget (NiceJob-style toast)
   Reads window.AHP_REVIEWS_POPUP (generated from the Google Sheet by
   sync-reviews-popup.py) and slides little review notifications up from the
   bottom-left corner, one at a time, on a loop.

   Static file -- the DATA lives in reviews-popup-data.js. To change reviews,
   edit the Google Sheet and re-run sync-reviews-popup.py. Do not hardcode
   reviews here.
   ========================================================================= */
(function () {
  "use strict";

  var REVIEWS = (window.AHP_REVIEWS_POPUP || []).filter(function (r) {
    return r && r.name && r.text;
  });
  if (!REVIEWS.length) return;                       // nothing to show -> stay invisible
  if (sessionStorage.getItem("ahpPopupClosed") === "1") return;  // user dismissed this session

  // ---- config -----------------------------------------------------------
  var FIRST_DELAY = 4000;   // ms before the first toast
  var VISIBLE_MS  = 7000;   // ms a toast stays on screen
  var GAP_MS      = 9000;   // ms between toasts
  var SNIPPET_MAX = 95;     // chars of review text shown
  var GOOGLE_URL  = "https://maps.google.com/?cid=17473950248621877564";

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- styles -----------------------------------------------------------
  var css = '' +
    '#ahp-rp{position:fixed;left:20px;bottom:20px;z-index:9999;width:330px;max-width:calc(100vw - 32px);' +
      'font-family:inherit;pointer-events:none}' +
    '#ahp-rp .ahp-rp-card{pointer-events:auto;display:flex;gap:12px;background:#fff;border:1px solid #eceff3;' +
      'border-radius:14px;box-shadow:0 10px 35px rgba(16,24,40,.16);padding:14px 16px 14px 14px;position:relative;' +
      'opacity:0;transform:translateY(16px);transition:opacity .45s ease,transform .45s ease;cursor:pointer}' +
    '#ahp-rp.ahp-show .ahp-rp-card{opacity:1;transform:translateY(0)}' +
    (reduceMotion ? '#ahp-rp .ahp-rp-card{transform:none!important;transition:opacity .3s ease}' : '') +
    '#ahp-rp .ahp-rp-g{flex:0 0 auto;width:34px;height:34px;border-radius:50%;border:1px solid #eceff3;' +
      'display:flex;align-items:center;justify-content:center;margin-top:2px}' +
    '#ahp-rp .ahp-rp-body{flex:1 1 auto;min-width:0}' +
    '#ahp-rp .ahp-rp-head{font-size:13.5px;line-height:1.35;color:#1a1a1a}' +
    '#ahp-rp .ahp-rp-head b{font-weight:700}' +
    '#ahp-rp .ahp-rp-stars{color:#fbbc05;letter-spacing:1px;font-size:13px;margin:2px 0 1px}' +
    '#ahp-rp .ahp-rp-text{font-size:12.5px;line-height:1.4;color:#475467;margin:2px 0 4px;' +
      'display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}' +
    '#ahp-rp .ahp-rp-meta{font-size:11.5px;color:#98a2b3;display:flex;align-items:center;gap:5px}' +
    '#ahp-rp .ahp-rp-meta .ahp-rp-verified{color:#34a853}' +
    '#ahp-rp .ahp-rp-close{position:absolute;top:8px;right:10px;border:0;background:transparent;color:#c2c8d0;' +
      'font-size:16px;line-height:1;cursor:pointer;padding:2px;pointer-events:auto}' +
    '#ahp-rp .ahp-rp-close:hover{color:#667085}' +
    '@media (max-width:480px){#ahp-rp{left:12px;right:12px;width:auto;bottom:12px}}';

  var style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  // ---- markup -----------------------------------------------------------
  var googleG = '<svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">' +
    '<path fill="#4285F4" d="M45.1 24.5c0-1.6-.1-2.8-.4-4H24v7.3h12.1c-.2 1.8-1.5 4.6-4.4 6.4l-.04.3 6.4 4.9.4.04c4.1-3.8 6.4-9.3 6.4-15.9z"/>' +
    '<path fill="#34A853" d="M24 46c5.8 0 10.7-1.9 14.3-5.2l-6.8-5.3c-1.8 1.3-4.3 2.2-7.5 2.2-5.7 0-10.6-3.8-12.3-9.1l-.3.02-6.6 5.1-.1.3C8.3 41.1 15.6 46 24 46z"/>' +
    '<path fill="#FBBC05" d="M11.7 28.6c-.5-1.4-.7-2.9-.7-4.6s.3-3.2.7-4.6l-.01-.3-6.7-5.2-.2.1C3.3 17.2 2.6 20.5 2.6 24s.7 6.8 2.1 10l7-5.4z"/>' +
    '<path fill="#EA4335" d="M24 10.3c4 0 6.8 1.7 8.3 3.2l6.1-5.9C34.7 4.1 29.8 2 24 2 15.6 2 8.3 6.9 4.7 14l7 5.4C13.4 14.1 18.3 10.3 24 10.3z"/>' +
    '</svg>';

  var wrap = document.createElement("div");
  wrap.id = "ahp-rp";
  wrap.setAttribute("role", "status");
  wrap.setAttribute("aria-live", "polite");
  wrap.innerHTML =
    '<div class="ahp-rp-card">' +
      '<button class="ahp-rp-close" aria-label="Dismiss review notifications">&times;</button>' +
      '<div class="ahp-rp-g">' + googleG + '</div>' +
      '<div class="ahp-rp-body">' +
        '<div class="ahp-rp-head"></div>' +
        '<div class="ahp-rp-stars"></div>' +
        '<div class="ahp-rp-text"></div>' +
        '<div class="ahp-rp-meta"><span class="ahp-rp-verified">&#10003;</span><span class="ahp-rp-when"></span></div>' +
      '</div>' +
    '</div>';
  document.body.appendChild(wrap);

  var card  = wrap.querySelector(".ahp-rp-card");
  var head  = wrap.querySelector(".ahp-rp-head");
  var stars = wrap.querySelector(".ahp-rp-stars");
  var textEl= wrap.querySelector(".ahp-rp-text");
  var when  = wrap.querySelector(".ahp-rp-when");

  card.addEventListener("click", function (e) {
    if (e.target.classList.contains("ahp-rp-close")) return;
    window.open(GOOGLE_URL, "_blank", "noopener");
  });
  wrap.querySelector(".ahp-rp-close").addEventListener("click", function () {
    wrap.classList.remove("ahp-show");
    sessionStorage.setItem("ahpPopupClosed", "1");
    clearTimeout(showTimer); clearTimeout(hideTimer);
    setTimeout(function () { wrap.remove(); }, 500);
  });

  // ---- helpers ----------------------------------------------------------
  function firstName(n) {
    n = String(n).trim();
    // Drop a trailing single-letter initial ("James M." -> "James",
    // "La Kesha L." -> "La Kesha"); leave single names ("Chris") untouched.
    return n.replace(/\s+[A-Za-z]\.?$/, "").trim() || n;
  }

  function relTime(dateStr) {
    if (!dateStr) return "";
    var t = Date.parse(dateStr);
    if (isNaN(t)) return "";
    var days = Math.floor((Date.now() - t) / 86400000);
    if (days <= 0) return "today";
    if (days === 1) return "yesterday";
    if (days < 7) return days + " days ago";
    if (days < 14) return "a week ago";
    if (days < 31) return Math.floor(days / 7) + " weeks ago";
    if (days < 61) return "a month ago";
    if (days < 365) return Math.floor(days / 30) + " months ago";
    return "over a year ago";
  }

  function snippet(s) {
    s = String(s).trim();
    if (s.length <= SNIPPET_MAX) return '“' + s + '”';
    return '“' + s.slice(0, SNIPPET_MAX).replace(/\s+\S*$/, "") + '…”';
  }

  function render(r) {
    var loc = r.location ? " of " + r.location : "";
    head.innerHTML = "<b>" + firstName(r.name) + "</b>" + loc + " left us a " + (r.rating || 5) + "-star review";
    stars.textContent = "★".repeat(r.rating || 5);
    textEl.textContent = snippet(r.text);
    var rt = relTime(r.date);
    when.textContent = (rt ? rt + " · " : "") + "on " + (r.source || "Google");
  }

  // ---- cycle ------------------------------------------------------------
  var i = 0, showTimer, hideTimer;
  function cycle() {
    render(REVIEWS[i % REVIEWS.length]);
    i++;
    requestAnimationFrame(function () { wrap.classList.add("ahp-show"); });
    hideTimer = setTimeout(function () {
      wrap.classList.remove("ahp-show");
      showTimer = setTimeout(cycle, GAP_MS);
    }, VISIBLE_MS);
  }
  showTimer = setTimeout(cycle, FIRST_DELAY);
})();
