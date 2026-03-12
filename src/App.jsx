import { useState, useEffect, useRef, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { supabase } from "./supabase.js";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const ADMIN_ID = "7c786021-d4f8-4ba1-924c-8eecc4f119ea";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500;1,600&family=Outfit:wght@300;400;500;600&display=swap');`;

const CSS = `
*, *::before, *::after { box-sizing:border-box; margin:0; padding:0; -webkit-tap-highlight-color:transparent; }
html,body { font-family:'Outfit',sans-serif; background:#0f0e0c; color:#f2ede4; height:100%; overflow:hidden; -webkit-font-smoothing:antialiased; }
:root {
  --bg:#0f0e0c; --surface:#1a1916; --raised:#232119; --border:#2e2b24;
  --muted:#7a7568; --text:#f2ede4; --sub:#a09890;
  --terra:#d4622a; --terra2:#e8845a; --gold:#c9a84c; --sage:#7aab7d;
  --safe-top:env(safe-area-inset-top,44px); --safe-bot:env(safe-area-inset-bottom,20px);
}
::-webkit-scrollbar { display:none; } * { scrollbar-width:none; }
#root { height:100dvh; display:flex; flex-direction:column; max-width:430px; margin:0 auto; position:relative; }
.status-bar { height:var(--safe-top); background:var(--surface); flex-shrink:0; }
.topbar { background:var(--surface); padding:0.7rem 1.25rem 0.8rem; display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid var(--border); flex-shrink:0; }
.topbar-logo { font-family:'Cormorant Garamond',serif; font-size:1.4rem; font-weight:700; color:var(--text); }
.topbar-logo span { color:var(--terra2); font-style:italic; }
.topbar-right { display:flex; gap:0.5rem; align-items:center; }
.icon-btn { width:34px; height:34px; border-radius:50%; background:var(--raised); border:1px solid var(--border); display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:0.9rem; color:var(--sub); flex-shrink:0; }
.icon-btn:active { background:var(--terra); color:white; }
.bottom-nav { background:var(--surface); border-top:1px solid var(--border); display:flex; padding-bottom:var(--safe-bot); flex-shrink:0; }
.nav-item { flex:1; display:flex; flex-direction:column; align-items:center; padding:0.6rem 0 0.45rem; cursor:pointer; gap:0.18rem; color:var(--muted); border:none; background:none; font-family:'Outfit',sans-serif; transition:color 0.15s; }
.nav-item.active { color:var(--terra2); }
.nav-icon { font-size:1.2rem; line-height:1; }
.nav-label { font-size:0.58rem; font-weight:600; letter-spacing:0.08em; text-transform:uppercase; }
.scroll-area { flex:1; overflow-y:auto; overscroll-behavior:contain; -webkit-overflow-scrolling:touch; }

/* MAP */
.map-wrap { flex:1; position:relative; overflow:hidden; }
.mapboxgl-map { width:100%; height:100%; }
.map-search-bar { position:absolute; top:0.75rem; left:0.75rem; right:0.75rem; z-index:10; }
.map-search-input-wrap { background:var(--surface); border:1.5px solid var(--border); border-radius:12px; display:flex; align-items:center; padding:0 0.85rem; gap:0.5rem; box-shadow:0 4px 20px rgba(0,0,0,0.4); }
.map-search-input { flex:1; background:none; border:none; outline:none; font-family:'Outfit',sans-serif; font-size:0.88rem; color:var(--text); padding:0.7rem 0; }
.map-search-input::placeholder { color:var(--muted); }
.map-filters { display:flex; gap:0.4rem; margin-top:0.5rem; overflow-x:auto; padding-bottom:0.1rem; }
.map-filter-pill { white-space:nowrap; padding:0.32rem 0.75rem; border-radius:20px; border:1.5px solid rgba(46,43,36,0.9); background:rgba(26,25,22,0.92); color:var(--sub); font-family:'Outfit',sans-serif; font-size:0.7rem; font-weight:500; cursor:pointer; flex-shrink:0; backdrop-filter:blur(8px); }
.map-filter-pill.active { background:var(--terra); border-color:var(--terra); color:white; }
.map-legend { position:absolute; bottom:1rem; left:0.75rem; background:rgba(26,25,22,0.92); border:1px solid var(--border); border-radius:10px; padding:0.5rem 0.75rem; backdrop-filter:blur(8px); display:flex; gap:0.75rem; }
.legend-item { display:flex; align-items:center; gap:0.3rem; font-size:0.65rem; color:var(--sub); font-weight:500; }
.legend-dot { width:10px; height:10px; border-radius:50%; flex-shrink:0; }

/* POPUP */
.map-popup { background:var(--surface) !important; border:1px solid var(--border) !important; border-radius:12px !important; padding:0 !important; box-shadow:0 8px 32px rgba(0,0,0,0.5) !important; }
.map-popup .mapboxgl-popup-content { background:transparent !important; padding:0 !important; border-radius:12px !important; }
.map-popup .mapboxgl-popup-tip { border-top-color:var(--surface) !important; border-bottom-color:var(--surface) !important; }
.popup-inner { padding:0.75rem 0.9rem; min-width:180px; cursor:pointer; }
.popup-type { font-size:0.58rem; text-transform:uppercase; letter-spacing:0.15em; font-weight:600; margin-bottom:0.2rem; }
.popup-type.destination { color:var(--terra2); }
.popup-type.experience { color:var(--sage); }
.popup-name { font-family:'Cormorant Garamond',serif; font-size:1rem; font-weight:600; color:var(--text); margin-bottom:0.3rem; line-height:1.2; }
.popup-meta { font-size:0.68rem; color:var(--muted); display:flex; gap:0.4rem; align-items:center; flex-wrap:wrap; }
.popup-stars { color:var(--gold); font-size:0.7rem; }
.popup-tap { font-size:0.62rem; color:var(--terra2); font-weight:600; margin-top:0.4rem; }
.popup-btn { display:block; width:100%; margin-top:0.6rem; background:var(--terra); color:white; border:none; border-radius:8px; padding:0.45rem 0.75rem; font-family:'Outfit',sans-serif; font-size:0.75rem; font-weight:600; cursor:pointer; text-align:center; }

/* SEARCH SCREEN */
.search-wrap { padding:0.75rem 1.25rem 0.5rem; flex-shrink:0; }
.search-box { background:var(--raised); border:1.5px solid var(--border); border-radius:12px; display:flex; align-items:center; padding:0 1rem; gap:0.6rem; }
.search-input { flex:1; background:none; border:none; outline:none; font-family:'Outfit',sans-serif; font-size:0.9rem; color:var(--text); padding:0.75rem 0; }
.search-input::placeholder { color:var(--muted); }
.filter-section { padding:0.25rem 1.25rem 0.5rem; }
.filter-label { font-size:0.6rem; text-transform:uppercase; letter-spacing:0.12em; font-weight:600; color:var(--muted); margin-bottom:0.4rem; }
.filter-row { display:flex; gap:0.4rem; overflow-x:auto; padding-bottom:0.1rem; }
.filter-pill { white-space:nowrap; padding:0.35rem 0.8rem; border-radius:20px; border:1.5px solid var(--border); background:var(--raised); color:var(--sub); font-family:'Outfit',sans-serif; font-size:0.72rem; font-weight:500; cursor:pointer; flex-shrink:0; transition:all 0.15s; }
.filter-pill.active { background:var(--terra); border-color:var(--terra); color:white; }
.results-list { padding:0 1.25rem 6rem; display:flex; flex-direction:column; gap:0.75rem; }
.result-card { background:var(--surface); border:1px solid var(--border); border-radius:14px; overflow:hidden; cursor:pointer; display:flex; transition:border-color 0.2s; animation:slideUp 0.25s ease both; }
.result-card:active { border-color:var(--terra); transform:scale(0.985); }
@keyframes slideUp { from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)} }
.result-img { width:90px; flex-shrink:0; object-fit:cover; }
.result-placeholder { width:90px; flex-shrink:0; display:flex; align-items:center; justify-content:center; font-size:2rem; background:var(--raised); }
.result-body { padding:0.85rem; flex:1; min-width:0; }
.result-type-badge { display:inline-flex; align-items:center; gap:0.3rem; font-size:0.58rem; text-transform:uppercase; letter-spacing:0.12em; font-weight:700; margin-bottom:0.25rem; }
.result-type-badge.destination { color:var(--terra2); }
.result-type-badge.experience { color:var(--sage); }
.result-name { font-family:'Cormorant Garamond',serif; font-size:1.05rem; font-weight:600; color:var(--text); margin-bottom:0.25rem; line-height:1.2; }
.result-location { font-size:0.68rem; color:var(--muted); margin-bottom:0.35rem; }
.result-meta { display:flex; gap:0.4rem; flex-wrap:wrap; margin-bottom:0.35rem; }
.result-pill { font-size:0.6rem; padding:0.15rem 0.4rem; border-radius:4px; background:var(--raised); color:var(--muted); font-weight:600; text-transform:uppercase; letter-spacing:0.05em; }
.result-pill.exertion-easy { background:rgba(122,171,125,0.15); color:var(--sage); }
.result-pill.exertion-moderate { background:rgba(201,168,76,0.15); color:var(--gold); }
.result-pill.exertion-strenuous { background:rgba(212,98,42,0.15); color:var(--terra2); }
.result-pill.cost { background:rgba(201,168,76,0.1); color:var(--gold); }
.result-pill.accessibility-full { background:rgba(122,171,125,0.15); color:var(--sage); }
.result-pill.accessibility-partial { background:rgba(201,168,76,0.15); color:var(--gold); }
.result-pill.accessibility-limited { background:rgba(212,98,42,0.15); color:var(--terra2); }
.result-stars { color:var(--gold); font-size:0.72rem; }
.result-review-ct { font-size:0.65rem; color:var(--muted); }
.section-header { padding:0.75rem 1.25rem 0.4rem; display:flex; align-items:baseline; justify-content:space-between; }
.section-title { font-family:'Cormorant Garamond',serif; font-size:1.1rem; font-weight:600; color:var(--text); }
.section-count { font-size:0.7rem; color:var(--muted); }


/* DETAIL FILTERS + AI SUMMARY */
.detail-filter-bar { padding:0.6rem 1.25rem; border-bottom:1px solid var(--border); display:flex; gap:0.4rem; overflow-x:auto; }
.ai-summary-box { margin:0.75rem 1.25rem; background:linear-gradient(135deg,rgba(42,30,14,0.9),rgba(30,42,30,0.8)); border:1px solid rgba(201,168,76,0.25); border-radius:14px; overflow:hidden; }
.ai-summary-header { display:flex; align-items:center; gap:0.5rem; padding:0.75rem 1rem 0.5rem; }
.ai-summary-dot { width:6px; height:6px; background:var(--gold); border-radius:50%; flex-shrink:0; animation:pulse 2s infinite; }
@keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.3} }
.ai-summary-label { font-size:0.6rem; text-transform:uppercase; letter-spacing:0.15em; font-weight:700; color:var(--gold); }
.ai-summary-body { padding:0 1rem 0.85rem; font-size:0.8rem; color:var(--sub); line-height:1.75; }
.ai-summary-btn { display:flex; align-items:center; justify-content:center; gap:0.5rem; width:calc(100% - 2rem); margin:0 1rem 0.85rem; background:rgba(201,168,76,0.12); border:1px solid rgba(201,168,76,0.25); border-radius:10px; padding:0.6rem; font-family:'Outfit',sans-serif; font-size:0.78rem; font-weight:600; color:var(--gold); cursor:pointer; }
.ai-summary-btn:active { background:rgba(201,168,76,0.22); }
.filter-count-badge { background:var(--terra); color:white; font-size:0.55rem; font-weight:700; border-radius:10px; padding:0.1rem 0.35rem; margin-left:0.3rem; }

/* DETAIL */
.detail-screen { flex:1; display:flex; flex-direction:column; overflow:hidden; }
.detail-topbar { background:var(--surface); padding:0.75rem 1.25rem; display:flex; align-items:center; gap:0.75rem; border-bottom:1px solid var(--border); flex-shrink:0; }
.back-btn { background:var(--raised); border:1px solid var(--border); border-radius:50%; width:34px; height:34px; display:flex; align-items:center; justify-content:center; cursor:pointer; color:var(--text); font-size:1rem; flex-shrink:0; }
.back-btn:active { background:var(--terra); }
.detail-topbar-title { font-family:'Cormorant Garamond',serif; font-size:1.05rem; font-weight:600; flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.detail-hero-img { width:100%; height:200px; object-fit:cover; display:block; }
.detail-hero { background:linear-gradient(160deg,#211d14,#2e2318); padding:1.25rem 1.25rem 1rem; border-bottom:1px solid var(--border); }
.detail-eyebrow { font-size:0.6rem; text-transform:uppercase; letter-spacing:0.18em; color:var(--terra2); font-weight:600; margin-bottom:0.25rem; }
.detail-title { font-family:'Cormorant Garamond',serif; font-size:1.75rem; font-weight:700; color:var(--text); line-height:1.1; margin-bottom:0.6rem; }
.detail-stats-row { display:flex; gap:1.1rem; align-items:center; flex-wrap:wrap; }
.stat-item { display:flex; flex-direction:column; gap:0.1rem; }
.stat-value { font-size:1.1rem; font-weight:700; color:var(--text); }
.stat-label { font-size:0.6rem; color:var(--muted); text-transform:uppercase; letter-spacing:0.08em; }
.stat-stars { color:var(--gold); font-size:0.88rem; }
.detail-attrs { display:flex; gap:0.4rem; flex-wrap:wrap; padding:0.75rem 1.25rem; border-bottom:1px solid var(--border); }
.attr-pill { display:flex; align-items:center; gap:0.3rem; font-size:0.68rem; padding:0.3rem 0.65rem; border-radius:20px; border:1px solid var(--border); background:var(--raised); color:var(--sub); font-weight:500; }
.detail-tags { display:flex; gap:0.35rem; flex-wrap:wrap; padding:0.6rem 1.25rem; border-bottom:1px solid var(--border); }
.tag { font-size:0.58rem; padding:0.15rem 0.45rem; background:var(--raised); border-radius:4px; color:var(--muted); letter-spacing:0.06em; text-transform:uppercase; font-weight:500; }
.detail-description { padding:1rem 1.25rem; font-size:0.82rem; color:var(--sub); line-height:1.75; border-bottom:1px solid var(--border); }

/* REVIEWS */
.reviews-section { padding:0.5rem 1.25rem 6rem; }
.review-card { background:var(--surface); border:1px solid var(--border); border-radius:14px; padding:1rem; margin-bottom:0.75rem; }
.rc-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.65rem; }
.rc-left { display:flex; gap:0.6rem; align-items:center; }
.avatar { width:38px; height:38px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-family:'Cormorant Garamond',serif; font-size:0.95rem; font-weight:700; color:white; flex-shrink:0; }
.avatar-img { width:38px; height:38px; border-radius:50%; object-fit:cover; flex-shrink:0; border:1.5px solid var(--border); }
.rc-name { font-size:0.85rem; font-weight:600; color:var(--text); }
.rc-meta { font-size:0.65rem; color:var(--muted); display:flex; gap:0.3rem; flex-wrap:wrap; margin-top:0.1rem; }
.rc-right { text-align:right; }
.rc-stars { color:var(--gold); font-size:0.82rem; }
.rc-date { font-size:0.62rem; color:var(--muted); margin-top:0.1rem; }
.rc-title { font-family:'Cormorant Garamond',serif; font-size:0.95rem; font-weight:600; color:var(--text); margin-bottom:0.4rem; }
.rc-body { font-size:0.78rem; color:var(--sub); line-height:1.7; }
.rc-footer { display:flex; gap:0.4rem; margin-top:0.6rem; flex-wrap:wrap; align-items:center; }
.verified-badge { font-size:0.6rem; color:var(--sage); font-weight:600; letter-spacing:0.06em; text-transform:uppercase; display:flex; align-items:center; gap:0.25rem; }
.style-badge { font-size:0.58rem; padding:0.12rem 0.4rem; background:var(--raised); border-radius:4px; color:var(--muted); text-transform:uppercase; letter-spacing:0.06em; font-weight:600; }
.review-photo { width:100%; max-height:200px; object-fit:cover; border-radius:8px; margin-top:0.6rem; cursor:zoom-in; }
.fab { position:fixed; bottom:calc(62px + var(--safe-bot) + 1rem); right:1.25rem; width:50px; height:50px; background:var(--terra); border:none; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:1.3rem; color:white; cursor:pointer; box-shadow:0 4px 20px rgba(212,98,42,0.45); z-index:100; }
.fab:active { transform:scale(0.92); }
.toast { position:fixed; bottom:calc(72px + var(--safe-bot)); left:1.25rem; right:1.25rem; background:var(--sage); color:white; border-radius:12px; padding:0.8rem 1rem; font-size:0.82rem; font-weight:500; z-index:500; animation:toastIn 0.3s ease; max-width:calc(430px - 2.5rem); margin:0 auto; }
@keyframes toastIn { from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)} }

/* SHEET */
.sheet-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.65); z-index:300; display:flex; flex-direction:column; justify-content:flex-end; backdrop-filter:blur(4px); }
.sheet { background:var(--surface); border-radius:20px 20px 0 0; border-top:1px solid var(--border); max-height:92dvh; overflow-y:auto; padding:0 1.25rem 2rem; -webkit-overflow-scrolling:touch; }
.sheet-title { font-family:'Cormorant Garamond',serif; font-size:1.35rem; font-weight:700; color:var(--text); margin-bottom:0.2rem; }
.sheet-sub { font-size:0.76rem; color:var(--muted); line-height:1.6; margin-bottom:1.25rem; }
.form-label { display:block; font-size:0.62rem; text-transform:uppercase; letter-spacing:0.12em; font-weight:600; color:var(--sub); margin-bottom:0.35rem; }
.form-group { margin-bottom:1rem; }
.form-row { display:grid; grid-template-columns:1fr 1fr; gap:0.65rem; }
.form-input,.form-select,.form-textarea { width:100%; padding:0.65rem 0.85rem; background:var(--raised); border:1.5px solid var(--border); border-radius:10px; font-family:'Outfit',sans-serif; font-size:0.85rem; color:var(--text); outline:none; transition:border-color 0.2s; -webkit-appearance:none; }
.form-input:focus,.form-select:focus,.form-textarea:focus { border-color:var(--terra); }
.form-select { background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%237a7568' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 0.85rem center; padding-right:2rem; }
.form-textarea { resize:none; min-height:100px; }
.star-row { display:flex; gap:0.5rem; }
.star-tap { font-size:1.7rem; background:none; border:none; cursor:pointer; color:var(--border); padding:0; line-height:1; transition:color 0.1s; }
.star-tap.lit { color:var(--gold); }
.submit-btn { width:100%; background:var(--terra); color:white; border:none; border-radius:12px; padding:0.9rem; font-family:'Outfit',sans-serif; font-size:0.92rem; font-weight:600; cursor:pointer; margin-top:0.65rem; transition:background 0.2s; }
.submit-btn:active { background:var(--terra2); }
.submit-btn:disabled { opacity:0.4; cursor:not-allowed; }

/* AUTH */
.auth-overlay { position:fixed; inset:0; background:var(--bg); z-index:700; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:2rem 1.5rem; }
.auth-logo { font-family:'Cormorant Garamond',serif; font-size:2rem; font-weight:700; color:var(--text); margin-bottom:0.3rem; }
.auth-logo span { color:var(--terra2); font-style:italic; }
.auth-tagline { font-size:0.76rem; color:var(--muted); margin-bottom:2rem; text-align:center; line-height:1.6; }
.auth-card { background:var(--surface); border:1px solid var(--border); border-radius:20px; padding:1.5rem; width:100%; max-width:360px; }
.auth-title { font-family:'Cormorant Garamond',serif; font-size:1.35rem; font-weight:700; color:var(--text); margin-bottom:0.2rem; }
.auth-sub { font-size:0.76rem; color:var(--muted); margin-bottom:1.25rem; line-height:1.6; }
.auth-divider { display:flex; align-items:center; gap:0.65rem; margin:1rem 0; }
.auth-divider-line { flex:1; height:1px; background:var(--border); }
.auth-divider-text { font-size:0.65rem; color:var(--muted); text-transform:uppercase; letter-spacing:0.1em; }
.social-btn { width:100%; display:flex; align-items:center; justify-content:center; gap:0.6rem; padding:0.75rem; border-radius:12px; border:1.5px solid var(--border); background:var(--raised); color:var(--text); font-family:'Outfit',sans-serif; font-size:0.85rem; font-weight:500; cursor:pointer; margin-bottom:0.5rem; }
.social-btn:active { border-color:var(--terra); }
.auth-error { background:#3a1a1a; border:1px solid #6a2a2a; border-radius:8px; padding:0.6rem 0.8rem; font-size:0.73rem; color:#f08080; margin-bottom:0.85rem; }
.auth-success { background:#1a3a1f; border:1px solid #2a6a30; border-radius:8px; padding:0.6rem 0.8rem; font-size:0.73rem; color:#7adb84; margin-bottom:0.85rem; }
.auth-switch { text-align:center; margin-top:1rem; font-size:0.75rem; color:var(--muted); }
.auth-switch-btn { color:var(--terra2); background:none; border:none; font-family:'Outfit',sans-serif; font-size:0.75rem; font-weight:600; cursor:pointer; }
.guest-btn { background:none; border:none; color:var(--muted); font-family:'Outfit',sans-serif; font-size:0.75rem; cursor:pointer; padding:1rem 0 0; text-decoration:underline; }
.sign-in-prompt { background:var(--raised); border:1px solid var(--border); border-radius:14px; margin:1rem 1.25rem; padding:1.25rem; text-align:center; }
.sign-in-prompt-icon { font-size:2rem; margin-bottom:0.6rem; }
.sign-in-prompt-title { font-family:'Cormorant Garamond',serif; font-size:1rem; font-weight:600; color:var(--text); margin-bottom:0.3rem; }
.sign-in-prompt-text { font-size:0.75rem; color:var(--muted); line-height:1.6; margin-bottom:1rem; }
.sign-in-prompt-btn { background:var(--terra); color:white; border:none; border-radius:10px; padding:0.6rem 1.5rem; font-family:'Outfit',sans-serif; font-size:0.82rem; font-weight:600; cursor:pointer; }



/* PROFILE SCREEN */
.profile-screen { flex:1; overflow-y:auto; overscroll-behavior:contain; -webkit-overflow-scrolling:touch; padding-bottom:calc(62px + var(--safe-bot)); }
.profile-header { background:linear-gradient(160deg,#211d14,#2e2318); padding:2rem 1.25rem 1.5rem; display:flex; flex-direction:column; align-items:center; gap:0.75rem; border-bottom:1px solid var(--border); }
.profile-avatar-wrap { position:relative; }
.profile-avatar { width:80px; height:80px; border-radius:50%; object-fit:cover; border:3px solid var(--terra); }
.profile-avatar-placeholder { width:80px; height:80px; border-radius:50%; background:var(--terra); display:flex; align-items:center; justify-content:center; font-family:'Cormorant Garamond',serif; font-size:2rem; font-weight:700; color:white; border:3px solid var(--terra2); }
.profile-avatar-edit { position:absolute; bottom:2px; right:2px; width:24px; height:24px; background:var(--terra); border:2px solid var(--bg); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:0.65rem; cursor:pointer; }
.profile-name { font-family:'Cormorant Garamond',serif; font-size:1.5rem; font-weight:700; color:var(--text); text-align:center; }
.profile-meta { font-size:0.75rem; color:var(--muted); text-align:center; }
.profile-stats-row { display:flex; gap:2rem; }
.profile-stat { text-align:center; }
.profile-stat-val { font-size:1.2rem; font-weight:700; color:var(--text); }
.profile-stat-label { font-size:0.6rem; text-transform:uppercase; letter-spacing:0.08em; color:var(--muted); }
.profile-section { margin:0.75rem 1.25rem 0; }
.profile-section-title { font-size:0.6rem; text-transform:uppercase; letter-spacing:0.12em; font-weight:700; color:var(--muted); margin-bottom:0.5rem; }
.profile-card { background:var(--surface); border:1px solid var(--border); border-radius:14px; overflow:hidden; margin-bottom:0.75rem; }
.profile-row { display:flex; align-items:center; justify-content:space-between; padding:0.85rem 1rem; border-bottom:1px solid var(--border); cursor:pointer; }
.profile-row:last-child { border-bottom:none; }
.profile-row-left { display:flex; align-items:center; gap:0.65rem; }
.profile-row-icon { font-size:1rem; width:20px; text-align:center; }
.profile-row-label { font-size:0.85rem; color:var(--text); font-weight:500; }
.profile-row-value { font-size:0.78rem; color:var(--muted); }
.profile-row-arrow { font-size:0.7rem; color:var(--border); }
.fav-card { display:flex; background:var(--surface); border:1px solid var(--border); border-radius:12px; overflow:hidden; margin-bottom:0.6rem; cursor:pointer; }
.fav-card:active { border-color:var(--terra); }
.fav-img { width:72px; flex-shrink:0; object-fit:cover; }
.fav-placeholder { width:72px; flex-shrink:0; display:flex; align-items:center; justify-content:center; font-size:1.5rem; background:var(--raised); }
.fav-body { padding:0.65rem 0.75rem; flex:1; min-width:0; }
.fav-type { font-size:0.55rem; text-transform:uppercase; letter-spacing:0.12em; font-weight:700; margin-bottom:0.15rem; }
.fav-type.destination { color:var(--terra2); }
.fav-type.experience { color:var(--sage); }
.fav-name { font-family:'Cormorant Garamond',serif; font-size:0.95rem; font-weight:600; color:var(--text); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.fav-meta { font-size:0.65rem; color:var(--muted); margin-top:0.15rem; }
.fav-remove { padding:0 0.75rem; display:flex; align-items:center; color:var(--muted); font-size:0.8rem; cursor:pointer; flex-shrink:0; }
.edit-sheet-title { font-family:'Cormorant Garamond',serif; font-size:1.25rem; font-weight:700; color:var(--text); margin-bottom:0.2rem; }
.edit-sheet-sub { font-size:0.75rem; color:var(--muted); line-height:1.6; margin-bottom:1.25rem; }
.sign-out-btn { width:100%; background:none; border:1.5px solid var(--border); border-radius:12px; padding:0.8rem; font-family:'Outfit',sans-serif; font-size:0.85rem; font-weight:600; color:var(--muted); cursor:pointer; margin-top:0.5rem; }
.sign-out-btn:active { border-color:var(--terra); color:var(--terra); }

/* HOME SCREEN */
.home-screen { flex:1; overflow-y:auto; overscroll-behavior:contain; -webkit-overflow-scrolling:touch; padding-bottom:calc(62px + var(--safe-bot)); }
.home-hero { position:relative; height:52dvh; overflow:hidden; background:#1a1612; }
.home-hero-img { width:100%; height:100%; object-fit:cover; opacity:0.7; transition:opacity 0.8s ease; }
.home-hero-overlay { position:absolute; inset:0; background:linear-gradient(to bottom, rgba(15,14,12,0.1) 0%, rgba(15,14,12,0.85) 100%); }
.home-hero-content { position:absolute; bottom:0; left:0; right:0; padding:1.5rem 1.25rem 1.25rem; }
.home-hero-eyebrow { font-size:0.58rem; text-transform:uppercase; letter-spacing:0.2em; color:var(--terra2); font-weight:700; margin-bottom:0.3rem; }
.home-hero-title { font-family:'Cormorant Garamond',serif; font-size:1.8rem; font-weight:700; color:white; line-height:1.1; margin-bottom:0.5rem; }
.home-hero-sub { font-size:0.75rem; color:rgba(242,237,228,0.75); line-height:1.6; margin-bottom:1rem; }
.home-hero-btn { display:inline-flex; align-items:center; gap:0.4rem; background:var(--terra); color:white; border:none; border-radius:20px; padding:0.55rem 1.1rem; font-family:'Outfit',sans-serif; font-size:0.78rem; font-weight:600; cursor:pointer; }
.home-hero-dots { position:absolute; bottom:1rem; right:1.25rem; display:flex; gap:0.3rem; }
.home-hero-dot { width:5px; height:5px; border-radius:50%; background:rgba(255,255,255,0.35); transition:background 0.3s; }
.home-hero-dot.active { background:var(--terra2); }
.home-section { padding:1rem 1.25rem 0.25rem; }
.home-section-header { display:flex; align-items:baseline; justify-content:space-between; margin-bottom:0.75rem; }
.home-section-title { font-family:'Cormorant Garamond',serif; font-size:1.2rem; font-weight:700; color:var(--text); }
.home-section-link { font-size:0.7rem; color:var(--terra2); font-weight:600; cursor:pointer; background:none; border:none; font-family:'Outfit',sans-serif; }
.home-cards { display:flex; gap:0.75rem; overflow-x:auto; padding-bottom:0.5rem; }
.home-card { flex-shrink:0; width:160px; background:var(--surface); border:1px solid var(--border); border-radius:14px; overflow:hidden; cursor:pointer; transition:transform 0.15s; }
.home-card:active { transform:scale(0.96); }
.home-card-img { width:100%; height:100px; object-fit:cover; display:block; }
.home-card-placeholder { width:100%; height:100px; display:flex; align-items:center; justify-content:center; font-size:2rem; background:var(--raised); }
.home-card-body { padding:0.65rem 0.7rem 0.75rem; }
.home-card-type { font-size:0.55rem; text-transform:uppercase; letter-spacing:0.12em; font-weight:700; margin-bottom:0.15rem; }
.home-card-type.destination { color:var(--terra2); }
.home-card-type.experience { color:var(--sage); }
.home-card-name { font-family:'Cormorant Garamond',serif; font-size:0.9rem; font-weight:600; color:var(--text); line-height:1.2; margin-bottom:0.25rem; }
.home-card-meta { font-size:0.62rem; color:var(--muted); }
.home-card-stars { color:var(--gold); font-size:0.65rem; }
.home-why { margin:1rem 1.25rem; background:var(--surface); border:1px solid var(--border); border-radius:16px; padding:1.1rem; }
.home-why-title { font-family:'Cormorant Garamond',serif; font-size:1rem; font-weight:700; color:var(--text); margin-bottom:0.75rem; }
.home-why-row { display:flex; flex-direction:column; gap:0.6rem; }
.home-why-item { display:flex; align-items:flex-start; gap:0.65rem; }
.home-why-icon { font-size:1.1rem; flex-shrink:0; margin-top:0.05rem; }
.home-why-text { font-size:0.75rem; color:var(--sub); line-height:1.55; }
.home-why-text strong { color:var(--text); font-weight:600; }

/* EMPTY / LOADING */
.loading-wrap { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:3rem; gap:0.85rem; color:var(--muted); font-size:0.8rem; }
.dot-row { display:flex; gap:4px; }
.dot-row span { width:5px; height:5px; background:var(--terra2); border-radius:50%; animation:dp 1.2s infinite; }
.dot-row span:nth-child(2) { animation-delay:0.2s; }
.dot-row span:nth-child(3) { animation-delay:0.4s; }
@keyframes dp { 0%,80%,100%{opacity:0.2;transform:scale(0.7)}40%{opacity:1;transform:scale(1)} }
.empty { text-align:center; padding:2.5rem 1.5rem; color:var(--muted); }
.empty-icon { font-size:2.2rem; opacity:0.4; margin-bottom:0.6rem; }
.empty-text { font-size:0.8rem; line-height:1.6; }
`;

/* ── HELPERS ── */
const AVATAR_COLORS = ["#8B4513","#556B2F","#4B5320","#6B3A3A","#2F4F4F","#4A4060","#5C4033","#3D5A80"];
const avatarColor = s => AVATAR_COLORS[(s||"").split("").reduce((a,c)=>a+c.charCodeAt(0),0)%AVATAR_COLORS.length];
const Stars = ({n,size="0.8rem"}) => <span style={{color:"#c9a84c",fontSize:size}}>{"★".repeat(Math.max(0,Math.min(5,n||0)))+"☆".repeat(Math.max(0,5-(n||0)))}</span>;
const formatDate = d => { if(!d) return ""; const dt=new Date(d); return dt.toLocaleDateString("en-AU",{month:"short",year:"numeric"}); };

const EXERTION_OPTS = ["Any exertion","easy","moderate","strenuous"];
const COST_OPTS = ["Any cost","$","$$","$$$","$$$$"];
const ACCESS_OPTS = ["Any accessibility","full","partial","limited"];
const DURATION_OPTS = ["Any duration","half-day","full-day","multi-day"];
const TYPE_OPTS = ["Any type","nature","culture","food","adventure","wellness","history","wildlife","cruise","touring"];
const BOOKING_OPTS = ["Any booking","walk-in","recommended","required"];


/* ── HOME SCREEN ── */
function HomeScreen({ onSelectItem, onGoToMap, onGoToSearch, user, onSignIn }) {
  const [destinations, setDestinations] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [heroIndex, setHeroIndex] = useState(0);
  const [heroItems, setHeroItems] = useState([]);
  const timerRef = useRef(null);

  useEffect(() => {
    (async () => {
      const [{ data: d }, { data: e }] = await Promise.all([
        supabase.from("destinations").select("*").eq("published", true).order("avg_rating", { ascending: false }).limit(8),
        supabase.from("experiences").select("*").eq("published", true).order("avg_rating", { ascending: false }).limit(8),
      ]);
      const dests = d || [];
      const exps = e || [];
      setDestinations(dests);
      setExperiences(exps);
      // Hero items = anything with a hero image
      const withImg = [
        ...dests.filter(x => x.hero_image_url).map(x => ({ ...x, _type: "destination" })),
        ...exps.filter(x => x.hero_image_url).map(x => ({ ...x, _type: "experience" })),
      ];
      setHeroItems(withImg.length ? withImg : dests.map(x => ({ ...x, _type: "destination" })));
    })();
  }, []);

  useEffect(() => {
    if (heroItems.length < 2) return;
    timerRef.current = setInterval(() => setHeroIndex(i => (i + 1) % heroItems.length), 5000);
    return () => clearInterval(timerRef.current);
  }, [heroItems.length]);

  const hero = heroItems[heroIndex];

  return (
    <div className="home-screen">
      {/* Hero */}
      {hero && (
        <div className="home-hero" onClick={() => onSelectItem({ type: hero._type, data: hero })}>
          {hero.hero_image_url
            ? <img key={hero.id} className="home-hero-img" src={hero.hero_image_url} alt={hero.name} />
            : <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg,#2a1f0e,#1a2a1f)" }} />
          }
          <div className="home-hero-overlay" />
          <div className="home-hero-content">
            <div className="home-hero-eyebrow">{hero._type === "destination" ? "📍 Featured Destination" : "✨ Featured Experience"}</div>
            <div className="home-hero-title">{hero.name}</div>
            <div className="home-hero-sub">{hero.snippet || hero.description || ""}</div>
            <button className="home-hero-btn">Explore →</button>
          </div>
          {heroItems.length > 1 && (
            <div className="home-hero-dots">
              {heroItems.map((_, i) => <div key={i} className={`home-hero-dot ${i === heroIndex ? "active" : ""}`} />)}
            </div>
          )}
        </div>
      )}

      {/* Destinations */}
      {destinations.length > 0 && (
        <div className="home-section">
          <div className="home-section-header">
            <span className="home-section-title">Top Destinations</span>
            <button className="home-section-link" onClick={onGoToSearch}>See all →</button>
          </div>
          <div className="home-cards">
            {destinations.map(d => (
              <div key={d.id} className="home-card" onClick={() => onSelectItem({ type: "destination", data: d })}>
                {d.hero_image_url
                  ? <img className="home-card-img" src={d.hero_image_url} alt={d.name} onError={e => e.target.style.display = "none"} />
                  : <div className="home-card-placeholder">📍</div>
                }
                <div className="home-card-body">
                  <div className="home-card-type destination">Destination</div>
                  <div className="home-card-name">{d.name}</div>
                  <div className="home-card-meta">
                    <span className="home-card-stars">{"★".repeat(Math.round(d.avg_rating || 0))}</span> {d.avg_rating || 0} · {d.country}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Experiences */}
      {experiences.length > 0 && (
        <div className="home-section">
          <div className="home-section-header">
            <span className="home-section-title">Experiences</span>
            <button className="home-section-link" onClick={onGoToSearch}>See all →</button>
          </div>
          <div className="home-cards">
            {experiences.map(e => (
              <div key={e.id} className="home-card" onClick={() => onSelectItem({ type: "experience", data: e })}>
                {e.hero_image_url
                  ? <img className="home-card-img" src={e.hero_image_url} alt={e.name} onError={e2 => e2.target.style.display = "none"} />
                  : <div className="home-card-placeholder">✨</div>
                }
                <div className="home-card-body">
                  <div className="home-card-type experience">Experience</div>
                  <div className="home-card-name">{e.name}</div>
                  <div className="home-card-meta">
                    {e.exertion && <span>{e.exertion} · </span>}{e.cost_range || ""}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Why TrueTrails */}
      <div className="home-why">
        <div className="home-why-title">Why TrueTrails?</div>
        <div className="home-why-row">
          <div className="home-why-item"><span className="home-why-icon">🚫</span><span className="home-why-text"><strong>No ads, no sponsors.</strong> Every review is from a real traveller — no paid placements, ever.</span></div>
          <div className="home-why-item"><span className="home-why-icon">👴</span><span className="home-why-text"><strong>Built for 50+ travellers.</strong> Accessibility, pace and comfort — the things that actually matter.</span></div>
          <div className="home-why-item"><span className="home-why-icon">✅</span><span className="home-why-text"><strong>Honest only.</strong> Our AI flags marketing language. Only genuine experiences make it through.</span></div>
        </div>
      </div>

      {!user && (
        <div style={{ margin: "0.5rem 1.25rem 1.5rem", textAlign: "center" }}>
          <button onClick={onSignIn} style={{ background: "var(--terra)", color: "white", border: "none", borderRadius: "12px", padding: "0.8rem 2rem", fontFamily: "'Outfit',sans-serif", fontSize: "0.88rem", fontWeight: 600, cursor: "pointer" }}>Join TrueTrails — free</button>
          <div style={{ fontSize: "0.68rem", color: "var(--muted)", marginTop: "0.5rem" }}>Write reviews · Save favourites · Share discoveries</div>
        </div>
      )}
    </div>
  );
}

/* ── MAP SCREEN ── */
function MapScreen({ onSelectItem, user, onSignIn }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersRef = useRef([]);
  const [destinations, setDestinations] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("Any type");
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (map.current) return;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [20, 10],
      zoom: 1.2,
      projection: "globe",
    });
    map.current.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "bottom-right");
    map.current.on("load", () => setMapReady(true));
    map.current.getCanvas().style.cursor = "default";
  }, []);

  useEffect(() => {
    (async () => {
      const [{ data: d }, { data: e }] = await Promise.all([
        supabase.from("destinations").select("id,name,country,continent,lat,lng,hero_image_url,avg_rating,review_count,snippet,tags").eq("published", true),
        supabase.from("experiences").select("id,name,type,exertion,cost_range,accessibility,duration,lat,lng,hero_image_url,avg_rating,review_count,destination_id,region_id").eq("published", true).not("lat", "is", null)
      ]);
      setDestinations(d || []);
      setExperiences(e || []);
    })();
  }, []);

  useEffect(() => {
    if (!mapReady || !map.current) return;
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    const query = search.toLowerCase();

    destinations
      .filter(d => !query || d.name.toLowerCase().includes(query) || d.country.toLowerCase().includes(query))
      .forEach(dest => {
        if (!dest.lat || !dest.lng) return;

        const popup = new mapboxgl.Popup({ offset: 36, closeButton: false, maxWidth: "240px", className: "map-popup" })
          .setHTML(`
            <div class="popup-inner">
              ${dest.hero_image_url ? `<img src="${dest.hero_image_url}" style="width:100%;height:90px;object-fit:cover;border-radius:8px 8px 0 0;margin:-0px;display:block;" onerror="this.style.display='none'"/>` : ""}
              <div style="padding:0.65rem 0.75rem 0.75rem;">
                <div class="popup-type destination">📍 Destination · ${dest.country}</div>
                <div class="popup-name">${dest.name}</div>
                <div class="popup-meta">
                  <span class="popup-stars">${"★".repeat(Math.round(dest.avg_rating||0))}${"☆".repeat(5-Math.round(dest.avg_rating||0))}</span>
                  <span>${dest.avg_rating||0} · ${dest.review_count||0} review${dest.review_count===1?"":"s"}</span>
                </div>
                <button class="popup-btn" onclick="window.__tt_dest_${dest.id}()">View details →</button>
              </div>
            </div>`);

        window[`__tt_dest_${dest.id}`] = () => { popup.remove(); onSelectItem({ type: "destination", data: dest }); };

        const marker = new mapboxgl.Marker({ color: "#e8845a", scale: 0.9 })
          .setLngLat([dest.lng, dest.lat])
          .setPopup(popup)
          .addTo(map.current);

        marker.getElement().style.cursor = "pointer";
        markersRef.current.push(marker);
      });

    experiences
      .filter(e => {
        if (typeFilter !== "Any type" && e.type !== typeFilter) return false;
        if (query && !e.name.toLowerCase().includes(query)) return false;
        return true;
      })
      .forEach(exp => {
        if (!exp.lat || !exp.lng) return;

        const attrs = [exp.exertion, exp.cost_range, exp.duration].filter(Boolean).join(" · ");
        const popup = new mapboxgl.Popup({ offset: 30, closeButton: false, maxWidth: "240px", className: "map-popup" })
          .setHTML(`
            <div class="popup-inner">
              ${exp.hero_image_url ? `<img src="${exp.hero_image_url}" style="width:100%;height:90px;object-fit:cover;border-radius:8px 8px 0 0;display:block;" onerror="this.style.display='none'"/>` : ""}
              <div style="padding:0.65rem 0.75rem 0.75rem;">
                <div class="popup-type experience">✨ Experience${exp.type ? " · "+exp.type : ""}</div>
                <div class="popup-name">${exp.name}</div>
                <div class="popup-meta">${attrs}</div>
                <button class="popup-btn" onclick="window.__tt_exp_${exp.id}()">View details →</button>
              </div>
            </div>`);

        window[`__tt_exp_${exp.id}`] = () => { popup.remove(); onSelectItem({ type: "experience", data: exp }); };

        const marker = new mapboxgl.Marker({ color: "#7aab7d", scale: 0.75 })
          .setLngLat([exp.lng, exp.lat])
          .setPopup(popup)
          .addTo(map.current);

        marker.getElement().style.cursor = "pointer";
        markersRef.current.push(marker);
      });
  }, [mapReady, destinations, experiences, search, typeFilter]);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div className="map-search-bar">
        <div className="map-search-input-wrap">
          <span style={{ color: "var(--muted)", fontSize: "0.9rem" }}>🔍</span>
          <input className="map-search-input" placeholder="Search destinations…" value={search} onChange={e => setSearch(e.target.value)} />
          {search && <span onClick={() => setSearch("")} style={{ color: "var(--muted)", cursor: "pointer", fontSize: "0.82rem" }}>✕</span>}
        </div>
        <div className="map-filters">
          {TYPE_OPTS.map(t => (
            <button key={t} className={`map-filter-pill ${typeFilter === t ? "active" : ""}`} onClick={() => setTypeFilter(t)}>
              {t === "Any type" ? "All types" : t}
            </button>
          ))}
        </div>
      </div>
      <div className="map-wrap">
        <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />
        <div className="map-legend">
          <div className="legend-item"><div className="legend-dot" style={{ background: "#e8845a" }} />Destinations</div>
          <div className="legend-item"><div className="legend-dot" style={{ background: "#7aab7d" }} />Experiences</div>
        </div>
      </div>
    </div>
  );
}

/* ── SEARCH SCREEN ── */
function SearchScreen({ onSelectItem }) {
  const [destinations, setDestinations] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showType, setShowType] = useState("all"); // all | destinations | experiences
  const [exertionF, setExertionF] = useState("Any exertion");
  const [costF, setCostF] = useState("Any cost");
  const [accessF, setAccessF] = useState("Any accessibility");
  const [durationF, setDurationF] = useState("Any duration");
  const [typeF, setTypeF] = useState("Any type");

  useEffect(() => {
    (async () => {
      const [{ data: d }, { data: e }] = await Promise.all([
        supabase.from("destinations").select("*").eq("published", true).order("avg_rating", { ascending: false }),
        supabase.from("experiences").select("*").eq("published", true).order("avg_rating", { ascending: false })
      ]);
      setDestinations(d || []);
      setExperiences(e || []);
      setLoading(false);
    })();
  }, []);

  const q = search.toLowerCase();
  const filteredDests = destinations.filter(d =>
    (showType === "all" || showType === "destinations") &&
    (!q || d.name.toLowerCase().includes(q) || d.country.toLowerCase().includes(q) || (d.tags || []).some(t => t.toLowerCase().includes(q)))
  );
  const filteredExps = experiences.filter(e =>
    (showType === "all" || showType === "experiences") &&
    (!q || e.name.toLowerCase().includes(q)) &&
    (exertionF === "Any exertion" || e.exertion === exertionF) &&
    (costF === "Any cost" || e.cost_range === costF) &&
    (accessF === "Any accessibility" || e.accessibility === accessF) &&
    (durationF === "Any duration" || e.duration === durationF) &&
    (typeF === "Any type" || e.type === typeF)
  );

  const totalResults = filteredDests.length + filteredExps.length;

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div className="search-wrap">
        <div className="search-box">
          <span style={{ color: "var(--muted)", fontSize: "0.9rem" }}>🔍</span>
          <input className="search-input" placeholder="Search destinations & experiences…" value={search} onChange={e => setSearch(e.target.value)} />
          {search && <span onClick={() => setSearch("")} style={{ color: "var(--muted)", cursor: "pointer" }}>✕</span>}
        </div>
      </div>

      <div className="filter-section">
        <div className="filter-row">
          {["all", "destinations", "experiences"].map(t => (
            <button key={t} className={`filter-pill ${showType === t ? "active" : ""}`} onClick={() => setShowType(t)}>
              {t === "all" ? "All" : t === "destinations" ? "📍 Destinations" : "✨ Experiences"}
            </button>
          ))}
        </div>
      </div>

      {(showType === "all" || showType === "experiences") && (
        <div style={{ padding: "0 1.25rem 0.25rem" }}>
          <div className="filter-row" style={{ marginBottom: "0.3rem" }}>
            {EXERTION_OPTS.map(o => <button key={o} className={`filter-pill ${exertionF === o ? "active" : ""}`} onClick={() => setExertionF(o)}>{o === "Any exertion" ? "Any effort" : o}</button>)}
          </div>
          <div className="filter-row" style={{ marginBottom: "0.3rem" }}>
            {COST_OPTS.map(o => <button key={o} className={`filter-pill ${costF === o ? "active" : ""}`} onClick={() => setCostF(o)}>{o}</button>)}
            {ACCESS_OPTS.map(o => <button key={o} className={`filter-pill ${accessF === o ? "active" : ""}`} onClick={() => setAccessF(o)}>{o === "Any accessibility" ? "Any access" : o}</button>)}
          </div>
          <div className="filter-row">
            {DURATION_OPTS.map(o => <button key={o} className={`filter-pill ${durationF === o ? "active" : ""}`} onClick={() => setDurationF(o)}>{o}</button>)}
          </div>
        </div>
      )}

      <div className="section-header">
        <span className="section-title">Results</span>
        <span style={{ fontSize: "0.7rem", color: "var(--muted)" }}>{totalResults} found</span>
      </div>

      <div className="scroll-area">
        {loading ? (
          <div className="loading-wrap"><div className="dot-row"><span /><span /><span /></div><span>Loading…</span></div>
        ) : totalResults === 0 ? (
          <div className="empty"><div className="empty-icon">🔍</div><div className="empty-text">No results match your filters.</div></div>
        ) : (
          <div className="results-list">
            {filteredDests.map(d => <ResultCard key={`d-${d.id}`} item={d} type="destination" onClick={() => onSelectItem({ type: "destination", data: d })} />)}
            {filteredExps.map(e => <ResultCard key={`e-${e.id}`} item={e} type="experience" onClick={() => onSelectItem({ type: "experience", data: e })} />)}
          </div>
        )}
      </div>
    </div>
  );
}

function ResultCard({ item, type, onClick }) {
  const isExp = type === "experience";
  return (
    <div className="result-card" onClick={onClick}>
      {item.hero_image_url
        ? <img className="result-img" src={item.hero_image_url} alt={item.name} onError={e => e.target.style.display = "none"} />
        : <div className="result-placeholder">{isExp ? "✨" : "📍"}</div>
      }
      <div className="result-body">
        <div className={`result-type-badge ${type}`}>{isExp ? "✨ Experience" : "📍 Destination"}</div>
        <div className="result-name">{item.name}</div>
        <div className="result-location">{isExp ? [item.type, item.duration].filter(Boolean).join(" · ") : `${item.country} · ${item.continent}`}</div>
        {isExp && (
          <div className="result-meta">
            {item.exertion && <span className={`result-pill exertion-${item.exertion}`}>{item.exertion}</span>}
            {item.cost_range && <span className="result-pill cost">{item.cost_range}</span>}
            {item.accessibility && <span className={`result-pill accessibility-${item.accessibility}`}>{item.accessibility} access</span>}
            {item.booking && <span className="result-pill">{item.booking}</span>}
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <Stars n={Math.round(item.avg_rating || 0)} />
          <span className="result-review-ct">{item.avg_rating || 0} · {item.review_count || 0} reviews</span>
        </div>
      </div>
    </div>
  );
}


/* ── FAV BUTTON ── */
function FavButton({ user, type, itemId }) {
  const [isFav, setIsFav] = useState(false);
  const [favId, setFavId] = useState(null);

  useEffect(() => {
    if (!user) return;
    const field = type === "destination" ? "destination_id" : "experience_id";
    supabase.from("favourites").select("id").eq("user_id", user.id).eq(field, itemId).maybeSingle()
      .then(({ data }) => { if (data) { setIsFav(true); setFavId(data.id); } });
  }, [user?.id, itemId]);

  const toggle = async () => {
    if (isFav && favId) {
      await supabase.from("favourites").delete().eq("id", favId);
      setIsFav(false); setFavId(null);
    } else {
      const field = type === "destination" ? "destination_id" : "experience_id";
      const { data } = await supabase.from("favourites").insert([{ user_id: user.id, [field]: itemId }]).select().single();
      if (data) { setIsFav(true); setFavId(data.id); }
    }
  };

  return (
    <button className="icon-btn" onClick={toggle} style={{ color: isFav ? "#e8845a" : "var(--muted)", fontSize: "1rem" }}>
      {isFav ? "♥" : "♡"}
    </button>
  );
}

/* ── DETAIL SCREEN ── */
function DetailScreen({ item, onBack, user, onSignIn }) {
  const { type, data } = item;
  const isExp = type === "experience";
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSheet, setShowSheet] = useState(false);
  const [toast, setToast] = useState(false);
  const [stats, setStats] = useState({ avg_rating: data.avg_rating, review_count: data.review_count });
  const [ageF, setAgeF] = useState("All ages");
  const [natF, setNatF] = useState("All origins");
  const [styleF, setStyleF] = useState("All styles");
  const [aiSummary, setAiSummary] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const field = isExp ? "experience_id" : "destination_id";
      const { data: r } = await supabase.from("reviews_v2").select("*").eq(field, data.id).order("created_at", { ascending: false });
      setReviews(r || []);
      setLoading(false);
    })();
  }, [data.id]);

  const loadReviews = async () => {
    const field = isExp ? "experience_id" : "destination_id";
    const { data: r } = await supabase.from("reviews_v2").select("*").eq(field, data.id).order("created_at", { ascending: false });
    setReviews(r || []);
    const table = isExp ? "experiences" : "destinations";
    const { data: s } = await supabase.from(table).select("avg_rating,review_count").eq("id", data.id).single();
    if (s) setStats({ avg_rating: s.avg_rating, review_count: s.review_count });
  };

  const handleSubmit = async () => { await loadReviews(); setToast(true); setTimeout(() => setToast(false), 3500); };

  const filtered = reviews.filter(r =>
    (ageF === "All ages" || r.age === ageF) &&
    (natF === "All origins" || r.nationality === natF) &&
    (styleF === "All styles" || r.travel_style === styleF)
  );

  const activeFilters = [ageF, natF, styleF].filter(f => !f.startsWith("All")).length;

  const generateSummary = async () => {
    if (filtered.length === 0) return;
    setAiLoading(true);
    setAiSummary(null);
    const reviewText = filtered.map(r => r.name + " (" + r.age + ", " + r.nationality + ", " + r.travel_style + ", " + r.rating + "stars): " + r.title + " - " + r.body).join("

");


    const filterDesc = [ageF !== "All ages" && ageF, natF !== "All origins" && natF, styleF !== "All styles" && styleF].filter(Boolean).join(", ");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `You are an honest travel summariser for TrueTrails — a platform built for travellers aged 50+. No marketing language. No hype. Practical and honest only.

Summarise what ${filtered.length} real travellers${filterDesc ? ` (${filterDesc})` : ""} genuinely say about ${data.name}.

Cover: what they loved, any practical warnings or downsides, accessibility notes if mentioned, and one concrete tip.

Keep it under 120 words. Write in second person ("You'll find…", "Expect…"). No bullet points — flowing prose only.

Reviews:
${reviewText}`
          }]
        })
      });
      const json = await res.json();
      const text = json.content?.[0]?.text || "Unable to generate summary.";
      setAiSummary(text);
    } catch {
      setAiSummary("Unable to generate summary right now.");
    }
    setAiLoading(false);
  };

  // Auto-clear summary when filters change
  useEffect(() => { setAiSummary(null); }, [ageF, natF, styleF]);

  const ages = ["All ages", ...new Set(reviews.map(r => r.age).filter(Boolean))];
  const nats = ["All origins", ...new Set(reviews.map(r => r.nationality).filter(Boolean))];
  const styles = ["All styles", ...new Set(reviews.map(r => r.travel_style).filter(Boolean))];

  return (
    <div className="detail-screen">
      <div className="detail-topbar">
        <button className="back-btn" onClick={onBack}>←</button>
        <div className="detail-topbar-title">{data.name}</div>
        <div style={{display:"flex",gap:"0.4rem"}}>
          {user && <FavButton user={user} type={type} itemId={data.id} />}
          <button className="icon-btn" onClick={() => user ? setShowSheet(true) : onSignIn()}>✏️</button>
        </div>
      </div>
      <div className="scroll-area">
        {data.hero_image_url && <img className="detail-hero-img" src={data.hero_image_url} alt={data.name} onError={e => e.target.style.display="none"} />}
        <div className="detail-hero">
          <div className="detail-eyebrow">{isExp ? `✨ Experience${data.type ? ` · ${data.type}` : ""}` : `📍 ${data.country} · ${data.continent}`}</div>
          <div className="detail-title">{data.name}</div>
          <div className="detail-stats-row">
            <div className="stat-item"><div className="stat-stars"><Stars n={Math.round(stats.avg_rating || 0)} size="0.95rem" /></div><div className="stat-label">{stats.avg_rating || 0} avg</div></div>
            <div className="stat-item"><div className="stat-value">{stats.review_count || 0}</div><div className="stat-label">Reviews</div></div>
          </div>
        </div>

        {isExp && (
          <div className="detail-attrs">
            {data.exertion && <span className="attr-pill">🏃 {data.exertion}</span>}
            {data.cost_range && <span className="attr-pill">💰 {data.cost_range}</span>}
            {data.accessibility && <span className="attr-pill">♿ {data.accessibility} access</span>}
            {data.duration && <span className="attr-pill">⏱ {data.duration}</span>}
            {data.booking && <span className="attr-pill">🎟 {data.booking}</span>}
          </div>
        )}
        {data.accessibility && !isExp && <div className="detail-attrs"><span className="attr-pill">♿ {data.accessibility}</span></div>}
        {(data.tags || []).length > 0 && <div className="detail-tags">{(data.tags||[]).map(t => <span key={t} className="tag">{t}</span>)}</div>}
        {data.description && <div className="detail-description">{data.description}</div>}

        {/* Review filters */}
        {reviews.length > 0 && (
          <>
            <div className="detail-filter-bar">
              {ages.map(a => <button key={a} className={`filter-pill ${ageF===a?"active":""}`} onClick={()=>setAgeF(a)} style={{fontSize:"0.68rem"}}>{a}</button>)}
            </div>
            <div className="detail-filter-bar" style={{paddingTop:0}}>
              {nats.map(n => <button key={n} className={`filter-pill ${natF===n?"active":""}`} onClick={()=>setNatF(n)} style={{fontSize:"0.68rem"}}>{n}</button>)}
              {styles.map(s => <button key={s} className={`filter-pill ${styleF===s?"active":""}`} onClick={()=>setStyleF(s)} style={{fontSize:"0.68rem"}}>{s}</button>)}
            </div>

            {/* AI Summary */}
            <div className="ai-summary-box">
              <div className="ai-summary-header">
                <div className="ai-summary-dot"/>
                <span className="ai-summary-label">AI Honest Summary</span>
                {activeFilters > 0 && <span className="filter-count-badge">{filtered.length} reviews filtered</span>}
              </div>
              {aiSummary ? (
                <div className="ai-summary-body">{aiSummary}</div>
              ) : (
                <button className="ai-summary-btn" onClick={generateSummary} disabled={aiLoading || filtered.length === 0}>
                  {aiLoading ? <><span style={{animation:"dp 1s infinite",display:"inline-block"}}>⟳</span> Generating…</> : `✦ Summarise ${filtered.length} review${filtered.length===1?"":"s"}${activeFilters > 0 ? " (filtered)" : ""}`}
                </button>
              )}
            </div>
          </>
        )}

        <div className="section-header">
          <span className="section-title">Reviews</span>
          <span style={{fontSize:"0.7rem",color:"var(--muted)"}}>{filtered.length}{filtered.length !== reviews.length ? ` of ${reviews.length}` : ""}</span>
        </div>

        {!user && (
          <div className="sign-in-prompt">
            <div className="sign-in-prompt-icon">✍️</div>
            <div className="sign-in-prompt-title">Share your experience</div>
            <div className="sign-in-prompt-text">Sign in to write a review and help fellow travellers.</div>
            <button className="sign-in-prompt-btn" onClick={onSignIn}>Sign in to review</button>
          </div>
        )}

        <div className="reviews-section">
          {loading ? (
            <div className="loading-wrap"><div className="dot-row"><span /><span /><span /></div></div>
          ) : filtered.length === 0 ? (
            <div className="empty"><div className="empty-icon">🔍</div><div className="empty-text">No reviews match these filters.</div></div>
          ) : (
            filtered.map(r => (
              <div key={r.id} className="review-card">
                <div className="rc-header">
                  <div className="rc-left">
                    {r.avatar_url
                      ? <img className="avatar-img" src={r.avatar_url} alt={r.initials} onError={e=>e.target.style.display="none"} />
                      : <div className="avatar" style={{background:avatarColor(r.initials)}}>{r.initials}</div>
                    }
                    <div>
                      <div className="rc-name">{r.name}</div>
                      <div className="rc-meta"><span>{r.nationality}</span><span>·</span><span>{r.age}</span><span>·</span><span>{r.travel_style}</span></div>
                    </div>
                  </div>
                  <div className="rc-right"><div className="rc-stars"><Stars n={r.rating}/></div><div className="rc-date">{formatDate(r.created_at)}</div></div>
                </div>
                <div className="rc-title">{r.title}</div>
                <div className="rc-body">{r.body}</div>
                {r.image_url && <img className="review-photo" src={r.image_url} alt="review" onError={e=>e.target.style.display="none"} />}
                <div className="rc-footer">
                  {r.verified && <span className="verified-badge"><span style={{width:5,height:5,background:"var(--sage)",borderRadius:"50%",display:"inline-block"}}/>Verified Visit</span>}
                  <span className="style-badge">{r.travel_style}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      {user && <button className="fab" onClick={()=>setShowSheet(true)}>+</button>}
      {showSheet && <ReviewSheet item={item} user={user} onClose={()=>setShowSheet(false)} onSubmit={handleSubmit}/>}
      {toast && <div className="toast">✓ Your review has been saved!</div>}
    </div>
  );
}

/* ── REVIEW SHEET ── */
function ReviewSheet({ item, user, onClose, onSubmit }) {
  const { type, data } = item;
  const isExp = type === "experience";
  const [profileData, setProfileData] = useState(null);
  const [form, setForm] = useState({ name: "", age: "", nationality: "", travelStyle: "Couple", rating: 0, title: "", body: "", youtube: "", avatarUrl: "" });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [hover, setHover] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: p } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (p) {
        setProfileData(p);
        setForm(f => ({
          ...f,
          name: p.username ? "@" + p.username : p.display_name || "",
          age: p.age || "",
          nationality: p.nationality || "",
          travelStyle: p.travel_style || "Couple",
          avatarUrl: p.avatar_url || "",
        }));
      }
    })();
  }, [user?.id]);

  const profileComplete = profileData && profileData.age && profileData.nationality && (profileData.username || profileData.display_name);
  const valid = form.name && form.age && form.nationality && form.rating > 0 && form.title && form.body.length > 20;

  const submit = async () => {
    setSaving(true); setError(null);
    let imageUrl = null;
    if (imageFile) {
      const ext = imageFile.name.split(".").pop();
      const path = `reviews/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("review-images").upload(path, imageFile, { contentType: imageFile.type });
      if (!upErr) {
        const { data: urlData } = supabase.storage.from("review-images").getPublicUrl(path);
        imageUrl = urlData.publicUrl;
      }
    }
    const initials = form.name.trim().split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
    const payload = {
      user_id: user.id,
      destination_id: isExp ? null : data.id,
      experience_id: isExp ? data.id : null,
      name: form.name, initials,
      age: form.age, nationality: form.nationality,
      travel_style: form.travelStyle,
      rating: form.rating,
      title: form.title, body: form.body,
      image_url: imageUrl,
      avatar_url: form.avatarUrl || null,
      youtube: form.youtube || null,
      verified: false,
    };
    const { error: err } = await supabase.from("reviews_v2").insert([payload]);
    setSaving(false);
    if (err) setError(err.message);
    else { onSubmit(); onClose(); }
  };

  return (
    <div className="sheet-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="sheet">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.85rem 0 0.5rem" }}>
          <div style={{ width: "36px", height: "4px", background: "var(--border)", borderRadius: "2px", margin: "0 auto" }} />
          <button onClick={onClose} style={{ background: "var(--raised)", border: "1px solid var(--border)", borderRadius: "50%", width: "30px", height: "30px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--muted)", fontSize: "0.85rem", flexShrink: 0, position: "absolute", right: "1.25rem" }}>✕</button>
        </div>
        <div className="sheet-title">Write a Review</div>
        <div className="sheet-sub">Reviewing <strong style={{ color: "var(--terra2)" }}>{data.name}</strong> — honest experiences only.</div>

        {profileComplete ? (
          <div style={{ background: "var(--raised)", border: "1px solid var(--border)", borderRadius: "12px", padding: "0.7rem 0.9rem", marginBottom: "0.85rem", display: "flex", alignItems: "center", gap: "0.65rem" }}>
            {form.avatarUrl
              ? <img src={form.avatarUrl} style={{ width: "34px", height: "34px", borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "2px solid var(--border)" }} onError={e => e.target.style.display = "none"} />
              : <div className="avatar" style={{ background: "var(--terra)", width: "34px", height: "34px", fontSize: "0.75rem", flexShrink: 0 }}>{form.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}</div>
            }
            <div>
              <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text)" }}>{form.name}</div>
              <div style={{ fontSize: "0.68rem", color: "var(--muted)" }}>{form.age} · {form.nationality}</div>
            </div>
          </div>
        ) : (
          <>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Your Name</label><input className="form-input" placeholder="e.g. Margaret T." value={form.name} onChange={e => set("name", e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Age Group</label><select className="form-select" value={form.age} onChange={e => set("age", e.target.value)}><option value="">Select…</option>{["Under 35", "35–49", "50–54", "55–64", "65+"].map(a => <option key={a}>{a}</option>)}</select></div>
            </div>
            <div className="form-group"><label className="form-label">Nationality</label><select className="form-select" value={form.nationality} onChange={e => set("nationality", e.target.value)}><option value="">Select…</option>{["Australian", "New Zealander", "British", "American", "Canadian", "German", "French", "Other"].map(n => <option key={n}>{n}</option>)}</select></div>
          </>
        )}

        <div className="form-group"><label className="form-label">Travel Style</label><select className="form-select" value={form.travelStyle} onChange={e => set("travelStyle", e.target.value)}>{["Solo", "Couple", "Family", "Group"].map(s => <option key={s}>{s}</option>)}</select></div>
        <div className="form-group"><label className="form-label">Your Rating</label><div className="star-row">{[1, 2, 3, 4, 5].map(n => <button key={n} className={`star-tap ${n <= (hover || form.rating) ? "lit" : ""}`} onClick={() => set("rating", n)} onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)}>★</button>)}</div></div>
        <div className="form-group"><label className="form-label">Review Title</label><input className="form-input" placeholder="Sum up your experience" value={form.title} onChange={e => set("title", e.target.value)} /></div>
        <div className="form-group">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.35rem" }}>
            <label className="form-label" style={{ marginBottom: 0 }}>Your Review</label>
            <span style={{ fontSize: "0.62rem", color: form.body.length >= 20 ? "var(--sage)" : "var(--terra2)", fontWeight: 600 }}>{form.body.length >= 20 ? "✓ Good" : `${20 - form.body.length} more chars`}</span>
          </div>
          <textarea className="form-textarea" placeholder="Share what you genuinely experienced — practical details other travellers would value." value={form.body} onChange={e => set("body", e.target.value)} rows={4} />
        </div>
        <div className="form-group">
          <label className="form-label">Photo (optional)</label>
          <input type="file" accept="image/*" id="review-img" style={{ display: "none" }} onChange={e => { const f = e.target.files[0]; if (f) { setImageFile(f); setImagePreview(URL.createObjectURL(f)); } }} />
          <label htmlFor="review-img" style={{ display: "block", padding: "0.65rem", background: "var(--raised)", border: "1.5px dashed var(--border)", borderRadius: "10px", textAlign: "center", cursor: "pointer", fontSize: "0.78rem", color: "var(--muted)" }}>
            {imagePreview ? <img src={imagePreview} style={{ width: "100%", maxHeight: "130px", objectFit: "cover", borderRadius: "6px" }} /> : "📷 Tap to add a photo"}
          </label>
        </div>
        {error && <div className="auth-error">⚠️ {error}</div>}
        <button className="submit-btn" onClick={submit} disabled={!valid || saving}>{saving ? "Saving…" : "Submit Honest Review"}</button>
      </div>
    </div>
  );
}


/* ── PROFILE SCREEN ── */
function ProfileScreen({ user, onSignIn, onSelectItem }) {
  const [profile, setProfile] = useState(null);
  const [favourites, setFavourites] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [showEdit, setShowEdit] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const [{ data: p }, { data: favs }, { data: revs }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("favourites").select("*, destinations(*), experiences(*)").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("reviews_v2").select("*, destinations(name), experiences(name)").eq("user_id", user.id).order("created_at", { ascending: false }),
    ]);
    setProfile(p || {});
    setFavourites(favs || []);
    setMyReviews(revs || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user?.id]);

  const removeFav = async (favId, e) => {
    e.stopPropagation();
    await supabase.from("favourites").delete().eq("id", favId);
    setFavourites(f => f.filter(x => x.id !== favId));
  };

  const handleFavTap = (fav) => {
    if (fav.destinations) onSelectItem({ type: "destination", data: fav.destinations });
    else if (fav.experiences) onSelectItem({ type: "experience", data: fav.experiences });
  };

  if (!user) return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem", gap: "1rem" }}>
      <div style={{ fontSize: "3rem" }}>👤</div>
      <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.35rem", fontWeight: 700, color: "var(--text)", textAlign: "center" }}>Your TrueTrails Profile</div>
      <div style={{ fontSize: "0.78rem", color: "var(--muted)", textAlign: "center", lineHeight: 1.7 }}>Sign in to save favourites, write reviews and build your travel history.</div>
      <button className="submit-btn" style={{ maxWidth: 280 }} onClick={onSignIn}>Sign in or create account</button>
    </div>
  );

  const displayName = profile?.username ? "@" + profile.username : profile?.display_name || user.email?.split("@")[0] || "Traveller";
  const initials = displayName.replace("@","").split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase();
  const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url;

  return (
    <div className="profile-screen">
      <div className="profile-header">
        <div className="profile-avatar-wrap">
          {avatarUrl
            ? <img className="profile-avatar" src={avatarUrl} alt={displayName} onError={e => e.target.style.display="none"} />
            : <div className="profile-avatar-placeholder">{initials}</div>
          }
          <div className="profile-avatar-edit" onClick={() => setShowEdit(true)}>✏️</div>
        </div>
        <div className="profile-name">{displayName}</div>
        <div className="profile-meta">
          {[profile?.nationality, profile?.age, profile?.travel_style].filter(Boolean).join(" · ")}
        </div>
        <div className="profile-stats-row">
          <div className="profile-stat"><div className="profile-stat-val">{myReviews.length}</div><div className="profile-stat-label">Reviews</div></div>
          <div className="profile-stat"><div className="profile-stat-val">{favourites.length}</div><div className="profile-stat-label">Saved</div></div>
        </div>
      </div>

      {loading ? (
        <div className="loading-wrap"><div className="dot-row"><span /><span /><span /></div></div>
      ) : (
        <>
          {/* Saved Favourites */}
          <div className="profile-section" style={{ marginTop: "1rem" }}>
            <div className="profile-section-title">Saved Places</div>
            {favourites.length === 0 ? (
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "14px", padding: "1.5rem", textAlign: "center" }}>
                <div style={{ fontSize: "1.8rem", marginBottom: "0.5rem" }}>🔖</div>
                <div style={{ fontSize: "0.78rem", color: "var(--muted)", lineHeight: 1.6 }}>Tap the ♡ on any destination or experience to save it here.</div>
              </div>
            ) : (
              favourites.map(fav => {
                const item = fav.destinations || fav.experiences;
                const type = fav.destinations ? "destination" : "experience";
                if (!item) return null;
                return (
                  <div key={fav.id} className="fav-card" onClick={() => handleFavTap(fav)}>
                    {item.hero_image_url
                      ? <img className="fav-img" src={item.hero_image_url} alt={item.name} onError={e => e.target.style.display="none"} />
                      : <div className="fav-placeholder">{type === "destination" ? "📍" : "✨"}</div>
                    }
                    <div className="fav-body">
                      <div className={`fav-type ${type}`}>{type === "destination" ? "📍 Destination" : "✨ Experience"}</div>
                      <div className="fav-name">{item.name}</div>
                      <div className="fav-meta">{item.country || item.type || ""}</div>
                    </div>
                    <div className="fav-remove" onClick={e => removeFav(fav.id, e)}>✕</div>
                  </div>
                );
              })
            )}
          </div>

          {/* My Reviews */}
          <div className="profile-section" style={{ marginTop: "1rem" }}>
            <div className="profile-section-title">My Reviews</div>
            {myReviews.length === 0 ? (
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "14px", padding: "1.5rem", textAlign: "center" }}>
                <div style={{ fontSize: "1.8rem", marginBottom: "0.5rem" }}>✍️</div>
                <div style={{ fontSize: "0.78rem", color: "var(--muted)", lineHeight: 1.6 }}>You haven't written any reviews yet. Share your honest experiences!</div>
              </div>
            ) : (
              myReviews.map(r => (
                <div key={r.id} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "0.85rem", marginBottom: "0.6rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.35rem" }}>
                    <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--terra2)" }}>{r.destinations?.name || r.experiences?.name}</div>
                    <Stars n={r.rating} />
                  </div>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "0.9rem", fontWeight: 600, color: "var(--text)", marginBottom: "0.25rem" }}>{r.title}</div>
                  <div style={{ fontSize: "0.72rem", color: "var(--sub)", lineHeight: 1.65 }}>{r.body.slice(0, 120)}{r.body.length > 120 ? "…" : ""}</div>
                  <div style={{ fontSize: "0.62rem", color: "var(--muted)", marginTop: "0.4rem" }}>{formatDate(r.created_at)}</div>
                </div>
              ))
            )}
          </div>

          {/* Account settings */}
          <div className="profile-section" style={{ marginTop: "1rem" }}>
            <div className="profile-section-title">Account</div>
            <div className="profile-card">
              <div className="profile-row" onClick={() => setShowEdit(true)}>
                <div className="profile-row-left"><span className="profile-row-icon">✏️</span><span className="profile-row-label">Edit Profile</span></div>
                <span className="profile-row-arrow">›</span>
              </div>
              <div className="profile-row" onClick={async () => { await supabase.auth.signOut(); }}>
                <div className="profile-row-left"><span className="profile-row-icon">🚪</span><span className="profile-row-label" style={{ color: "var(--terra2)" }}>Sign Out</span></div>
                <span className="profile-row-arrow">›</span>
              </div>
            </div>
          </div>

          <div style={{ height: "1rem" }} />
        </>
      )}

      {showEdit && <EditProfileSheet user={user} profile={profile} onClose={() => { setShowEdit(false); load(); }} />}
    </div>
  );
}

/* ── EDIT PROFILE SHEET ── */
function EditProfileSheet({ user, profile, onClose }) {
  const [form, setForm] = useState({
    display_name: profile?.display_name || "",
    username: profile?.username || "",
    age: profile?.age || "",
    nationality: profile?.nationality || "",
    travel_style: profile?.travel_style || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(profile?.avatar_url || user?.user_metadata?.avatar_url || null);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true); setError(null);
    let avatarUrl = profile?.avatar_url || null;
    if (avatarFile) {
      const ext = avatarFile.name.split(".").pop();
      const path = `avatars/${user.id}.${ext}`;
      const { error: upErr } = await supabase.storage.from("review-images").upload(path, avatarFile, { contentType: avatarFile.type, upsert: true });
      if (!upErr) {
        const { data: urlData } = supabase.storage.from("review-images").getPublicUrl(path);
        avatarUrl = urlData.publicUrl + "?t=" + Date.now();
      }
    }
    const { error: err } = await supabase.from("profiles").upsert({
      id: user.id,
      email: user.email,
      display_name: form.display_name,
      username: form.username || null,
      age: form.age,
      nationality: form.nationality,
      travel_style: form.travel_style,
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString(),
    });
    setSaving(false);
    if (err) setError(err.message);
    else onClose();
  };

  return (
    <div className="sheet-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="sheet">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.85rem 0 0.75rem" }}>
          <div style={{ width: "36px", height: "4px", background: "var(--border)", borderRadius: "2px", margin: "0 auto" }} />
          <button onClick={onClose} style={{ background: "var(--raised)", border: "1px solid var(--border)", borderRadius: "50%", width: "30px", height: "30px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--muted)", fontSize: "0.85rem", position: "absolute", right: "1.25rem" }}>✕</button>
        </div>
        <div className="edit-sheet-title">Edit Profile</div>
        <div className="edit-sheet-sub">Your details appear on reviews you write.</div>

        {/* Avatar */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.25rem" }}>
          <div style={{ position: "relative" }}>
            {avatarPreview
              ? <img src={avatarPreview} style={{ width: 72, height: 72, borderRadius: "50%", objectFit: "cover", border: "3px solid var(--terra)" }} onError={e => e.target.style.display="none"} />
              : <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--terra)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", fontWeight: 700, color: "white", fontFamily: "'Cormorant Garamond',serif" }}>{(form.display_name||user.email||"?")[0].toUpperCase()}</div>
            }
            <input type="file" accept="image/*" id="avatar-upload" style={{ display: "none" }} onChange={e => { const f = e.target.files[0]; if(f) { setAvatarFile(f); setAvatarPreview(URL.createObjectURL(f)); }}} />
            <label htmlFor="avatar-upload" style={{ position: "absolute", bottom: 0, right: 0, width: 24, height: 24, background: "var(--terra)", border: "2px solid var(--bg)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "0.65rem" }}>📷</label>
          </div>
        </div>

        <div className="form-group"><label className="form-label">Display Name</label><input className="form-input" placeholder="How you appear on reviews" value={form.display_name} onChange={e => set("display_name", e.target.value)} /></div>
        <div className="form-group"><label className="form-label">Username (optional)</label><input className="form-input" placeholder="e.g. tony_travels" value={form.username} onChange={e => set("username", e.target.value.toLowerCase().replace(/[^a-z0-9_]/g,""))} /></div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Age Group</label>
            <select className="form-select" value={form.age} onChange={e => set("age", e.target.value)}>
              <option value="">Select…</option>
              {["Under 35","35–49","50–54","55–64","65+"].map(a => <option key={a}>{a}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Travel Style</label>
            <select className="form-select" value={form.travel_style} onChange={e => set("travel_style", e.target.value)}>
              <option value="">Select…</option>
              {["Solo","Couple","Family","Group"].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Nationality</label>
          <select className="form-select" value={form.nationality} onChange={e => set("nationality", e.target.value)}>
            <option value="">Select…</option>
            {["Australian","New Zealander","British","American","Canadian","German","French","Japanese","Singaporean","Other"].map(n => <option key={n}>{n}</option>)}
          </select>
        </div>
        {error && <div className="auth-error">⚠️ {error}</div>}
        <button className="submit-btn" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save Profile"}</button>
      </div>
    </div>
  );
}

/* ── AUTH SCREEN ── */
function AuthScreen({ onClose }) {
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGoogle = async () => {
    setLoading(true); setError(null);
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin } });
    if (error) { setError(error.message); setLoading(false); }
  };

  const handleEmail = async () => {
    if (!email || !password) { setError("Please enter your email and password."); return; }
    setLoading(true); setError(null);
    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
      if (error) setError(error.message);
      else { setMode("check_email"); }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      else onClose();
    }
    setLoading(false);
  };

  if (mode === "check_email") return (
    <div className="auth-overlay">
      <div className="auth-logo">True<span>Trails</span></div>
      <div className="auth-card" style={{ textAlign: "center" }}>
        <div style={{ fontSize: "2.5rem", marginBottom: "0.85rem" }}>📧</div>
        <div className="auth-title">Check your email</div>
        <div className="auth-sub">We sent a confirmation link to <strong style={{ color: "var(--terra2)" }}>{email}</strong>.</div>
        <button className="submit-btn" onClick={() => setMode("signin")}>Back to Sign In</button>
      </div>
      <button className="guest-btn" onClick={onClose}>Continue as guest</button>
    </div>
  );

  return (
    <div className="auth-overlay">
      <div className="auth-logo">True<span>Trails</span></div>
      <div className="auth-tagline">Honest travel reviews — no sponsorships, no paid placements.</div>
      <div className="auth-card">
        <div className="auth-title">{mode === "signin" ? "Welcome back" : "Create account"}</div>
        <div className="auth-sub">{mode === "signin" ? "Sign in to write reviews and save favourites." : "Join TrueTrails — free, 30 seconds."}</div>
        {error && <div className="auth-error">⚠️ {error}</div>}
        <button className="social-btn" onClick={handleGoogle} disabled={loading}>🇬 Continue with Google</button>
        <div className="auth-divider"><div className="auth-divider-line" /><span className="auth-divider-text">or</span><div className="auth-divider-line" /></div>
        <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} /></div>
        <div className="form-group"><label className="form-label">Password</label><input className="form-input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} /></div>
        <button className="submit-btn" onClick={handleEmail} disabled={loading}>{loading ? "Please wait…" : mode === "signin" ? "Sign In" : "Create Account"}</button>
        <div className="auth-switch">
          {mode === "signin" ? "Don't have an account? " : "Already have an account? "}
          <button className="auth-switch-btn" onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(null); }}>{mode === "signin" ? "Sign up free" : "Sign in"}</button>
        </div>
      </div>
      <button className="guest-btn" onClick={onClose}>Continue as guest →</button>
    </div>
  );
}

/* ── ROOT ── */
export default function App() {
  const [tab, setTab] = useState("home");
  const [selectedItem, setSelectedItem] = useState(null);
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const isAdmin = user?.id === ADMIN_ID;

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setShowAuth(false);
      setAuthReady(true);
      if (session?.user) {
        const googleAvatar = session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture;
        if (googleAvatar) {
          supabase.from("profiles").select("avatar_url").eq("id", session.user.id).single().then(({ data }) => {
            if (!data?.avatar_url) supabase.from("profiles").upsert({ id: session.user.id, email: session.user.email, avatar_url: googleAvatar });
          });
        }
      }
    });
    supabase.auth.getSession().then(({ data: { session } }) => { setUser(session?.user || null); setAuthReady(true); });
    return () => subscription.unsubscribe();
  }, []);

  const handleSelectItem = (item) => { setSelectedItem(item); };
  const handleBack = () => setSelectedItem(null);

  if (!authReady) return (
    <>
      <style>{FONTS + CSS}</style>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="dot-row"><span /><span /><span /></div>
      </div>
    </>
  );

  return (
    <>
      <style>{FONTS + CSS}</style>
      <div className="status-bar" />

      {selectedItem ? (
        <DetailScreen item={selectedItem} onBack={handleBack} user={user} onSignIn={() => setShowAuth(true)} />
      ) : (
        <>
          <div className="topbar">
            <div className="topbar-logo">True<span>Trails</span></div>
            <div className="topbar-right">
              {user
                ? <div style={{ width: 32, height: 32, borderRadius: "50%", overflow: "hidden", cursor: "pointer", border: "2px solid var(--border)" }} onClick={() => setTab("profile")}>
                  {user.user_metadata?.avatar_url
                    ? <img src={user.user_metadata.avatar_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <div style={{ width: "100%", height: "100%", background: "var(--terra)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 700, color: "white" }}>{(user.email || "?")[0].toUpperCase()}</div>
                  }
                </div>
                : <button className="icon-btn" onClick={() => setShowAuth(true)} style={{ fontSize: "0.62rem", fontWeight: 700, color: "var(--terra2)", width: "auto", padding: "0 0.7rem", borderRadius: "20px", whiteSpace: "nowrap" }}>Sign in</button>
              }
            </div>
          </div>

          {tab === "home" && <HomeScreen onSelectItem={handleSelectItem} onGoToMap={() => setTab("map")} onGoToSearch={() => setTab("search")} user={user} onSignIn={() => setShowAuth(true)} />}
          {tab === "map" && <MapScreen onSelectItem={handleSelectItem} user={user} onSignIn={() => setShowAuth(true)} />}
          {tab === "search" && <SearchScreen onSelectItem={handleSelectItem} />}
          {tab === "profile" && <ProfileScreen user={user} onSignIn={() => setShowAuth(true)} onSelectItem={handleSelectItem} />}

          <div className="bottom-nav">
            {[
              { id: "home", icon: "🏠", label: "Home" },
              { id: "map", icon: "🗺️", label: "Map" },
              { id: "search", icon: "🔍", label: "Search" },
              { id: "profile", icon: "👤", label: "Profile" },
            ].map(n => (
              <button key={n.id} className={`nav-item ${tab === n.id ? "active" : ""}`} onClick={() => setTab(n.id)}>
                <span className="nav-icon">{n.icon}</span>
                <span className="nav-label">{n.label}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {showAuth && <AuthScreen onClose={() => setShowAuth(false)} />}
    </>
  );
}