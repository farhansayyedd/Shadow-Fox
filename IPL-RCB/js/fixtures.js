'use strict';
/**
 * RCB Fan Zone — Fixtures Engine
 * Fetches data/ipl2026.json every 30 seconds
 * Shows real IPL 2026 fixtures, live scores, results, countdown & scorecards
 */

const CRICAPI_KEY = '3812d023-8576-4422-bc75-9cd9c7160d14';
const DATA_URL    = 'data/ipl2026.json';
const REFRESH_MS  = 30000; // 30 seconds

let _matches     = [];
let _activeFilter = 'all';
let _teamFilter   = 'all';
let _countdownTimer = null;
let _refreshTimer   = null;
let _currentScorecardId = null;

/* ── Team helpers ── */
const LOGOS = {
  RCB:'images/rcb-logo.png', CSK:'images/csk.png', MI:'images/mi.png',
  KKR:'images/kkr.png', SRH:'images/srh.png', RR:'images/rr.png',
  DC:'images/dc.png', PBKS:'images/pbks.png', GT:'images/gt.png', LSG:'images/lsg.png'
};
const COLORS = {
  RCB:'#CC0000', CSK:'#F9CD05', MI:'#004BA0', KKR:'#3A225D',
  SRH:'#F7A721', RR:'#254AA5', DC:'#0078BC', PBKS:'#ED1C24',
  GT:'#1B2133', LSG:'#A2EDFC'
};
const FULL_NAMES = {
  RCB:'Royal Challengers Bengaluru', CSK:'Chennai Super Kings',
  MI:'Mumbai Indians', KKR:'Kolkata Knight Riders',
  SRH:'Sunrisers Hyderabad', RR:'Rajasthan Royals',
  DC:'Delhi Capitals', PBKS:'Punjab Kings',
  GT:'Gujarat Titans', LSG:'Lucknow Super Giants'
};

function logo(t) { return LOGOS[t] || ''; }
function color(t) { return COLORS[t] || '#888'; }

/* ── Match time ── */
function matchDateTime(m) {
  // dateTimeGMT from API is UTC, stored as IST in our JSON time field
  // date = "2026-04-27", time = "19:30" (IST)
  return new Date(`${m.date}T${m.time}:00+05:30`);
}

function isLive(m) {
  if (m.ended) return false;
  if (m.isLive) return true;
  const dt = matchDateTime(m);
  const now = new Date();
  const elapsed = now - dt;
  return m.started && !m.ended && elapsed > 0;
}

function isUpcoming(m) {
  return !m.ended && !isLive(m) && matchDateTime(m) > new Date();
}

/* ── Data fetch ── */
async function fetchData() {
  // Try JSON fetch first (works on GitHub Pages, gets fresh data)
  try {
    const r = await fetch(`${DATA_URL}?t=${Date.now()}`);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const json = await r.json();
    _matches = json.matches || [];
    updateLastUpdated(json.generatedAt);
    return true;
  } catch (e) {
    // Fallback: use the window global from ipl-data.js script tag (works on file://)
    if (window.IPL_2026_DATA && window.IPL_2026_DATA.matches) {
      _matches = window.IPL_2026_DATA.matches;
      updateLastUpdated(window.IPL_2026_DATA.generatedAt);
      return true;
    }
    console.warn('No data available:', e.message);
    return false;
  }
}

function updateLastUpdated(ts) {
  const el = document.getElementById('last-updated');
  if (!el) return;
  if (ts) {
    const d = new Date(ts);
    const mins = Math.floor((Date.now() - d) / 60000);
    el.textContent = mins < 1 ? '• Updated just now'
      : mins < 60 ? `• Updated ${mins}m ago`
      : `• Updated ${Math.floor(mins/60)}h ago`;
  }
}

/* ── Full refresh cycle ── */
async function refreshData(showLoader = false) {
  if (showLoader) {
    const list = document.getElementById('fixtures-list');
    if (list && !_matches.length) list.innerHTML = '<div class="fx-empty">Loading...</div>';
  }
  await fetchData();
  render();
  updateCountdown();
}

/* ── Countdown ── */
function updateCountdown() {
  // Clear old timer
  if (_countdownTimer) { clearInterval(_countdownTimer); _countdownTimer = null; }

  const now = new Date();
  // Check if any RCB match is live right now
  const liveMatch = _matches.find(m => m.rcb && isLive(m));
  if (liveMatch) {
    showLiveBanner(liveMatch);
    return;
  }

  // Find next upcoming RCB match
  const next = _matches
    .filter(m => m.rcb && !m.ended && matchDateTime(m) > now)
    .sort((a, b) => matchDateTime(a) - matchDateTime(b))[0];

  if (!next) {
    // All done
    const wrap = document.getElementById('countdown-wrap');
    if (wrap) wrap.innerHTML = `<div class="cdw-label">🏆 IPL 2026 SEASON</div><div class="cdw-match">All RCB Matches Completed</div>`;
    return;
  }

  const dt = matchDateTime(next);
  const opp = next.t1 === 'RCB' ? next.t2 : next.t1;
  const vsText = `RCB VS ${opp}`;
  const dateStr = dt.toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
  const timeStr = next.time + ' IST';

  document.getElementById('cdw-label').textContent = '⚡ Next RCB Match In';
  document.getElementById('cdw-match').textContent = vsText;
  document.getElementById('cdw-venue').textContent = `${next.venue}${next.city ? ', ' + next.city : ''}`;
  document.getElementById('cdw-date').textContent = `${dateStr} • ${timeStr}`;
  document.getElementById('cdw-timer').style.display = 'flex';

  function tick() {
    const diff = dt - new Date();
    if (diff <= 0) {
      clearInterval(_countdownTimer);
      _countdownTimer = null;
      // Show live banner
      document.getElementById('cdw-label').textContent = '🔴 MATCH IS LIVE';
      document.getElementById('cdw-timer').innerHTML = `<div class="cdw-live-banner">● ${vsText} IS LIVE NOW</div>`;
      return;
    }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = String(v).padStart(2, '0'); };
    set('cd-d', d); set('cd-h', h); set('cd-m', m); set('cd-s', s);
  }
  tick();
  _countdownTimer = setInterval(tick, 1000);
}

function showLiveBanner(m) {
  const opp = m.t1 === 'RCB' ? m.t2 : m.t1;
  document.getElementById('cdw-label').textContent = '🔴 MATCH LIVE NOW';
  document.getElementById('cdw-match').textContent = `RCB VS ${opp}`;
  document.getElementById('cdw-venue').textContent = `${m.venue}, ${m.city}`;
  document.getElementById('cdw-date').textContent = 'Live score updates every 30 seconds';
  const score1 = m.t1runs ? `${m.t1}: ${m.t1runs}` : '';
  const score2 = m.t2runs ? `${m.t2}: ${m.t2runs}` : '';
  document.getElementById('cdw-timer').innerHTML = `<div class="cdw-live-banner">● LIVE${score1 ? ' — ' + score1 + (score2 ? ' | ' + score2 : '') : ''}</div>`;
}

/* ── Filter helpers ── */
function getFilteredMatches() {
  let list = [..._matches];
  if (_activeFilter === 'rcb')      list = list.filter(m => m.rcb);
  if (_activeFilter === 'results')  list = list.filter(m => m.ended);
  if (_activeFilter === 'upcoming') list = list.filter(m => !m.ended);
  if (_teamFilter && _teamFilter !== 'all') list = list.filter(m => m.t1 === _teamFilter || m.t2 === _teamFilter);
  return list;
}

/* ── Build match card HTML ── */
function cardHTML(m) {
  const live   = isLive(m);
  const done   = m.ended;
  const rcb    = m.rcb;
  const won    = done && m.winner === 'RCB';
  const lost   = done && m.winner && m.winner !== 'RCB' && rcb;
  const canClick = done || live;

  const dt = matchDateTime(m);
  const dateStr = dt.toLocaleDateString('en-IN', { weekday:'short', day:'numeric', month:'short' });
  const t1c = color(m.t1), t2c = color(m.t2);
  const t1l = logo(m.t1), t2l = logo(m.t2);

  // Card classes
  let cls = 'fx-card';
  if (rcb)  cls += ' fx-rcb';
  if (won)  cls += ' fx-win';
  if (lost) cls += ' fx-loss';
  if (live) cls += ' fx-live-card';
  if (canClick) cls += ' fx-clickable';

  // Badges
  let badges = '';
  if (rcb)  badges += `<span class="fx-badge-rcb">RCB MATCH</span>`;
  if (live) badges += `<span class="fx-badge-live">● LIVE</span>`;

  // Center content
  let centerContent = '';
  if (live) {
    const s = m.t1runs ? `${m.t1} ${m.t1runs}${m.t1ovs ? ' ('+m.t1ovs+' Ov)' : ''}` : '';
    const s2 = m.t2runs ? `${m.t2} ${m.t2runs}${m.t2ovs ? ' ('+m.t2ovs+' Ov)' : ''}` : '';
    centerContent = `
      <div class="fx-result-wrap">
        <div class="fx-result-badge" style="background:rgba(0,200,100,.18);color:#00C864;border:1px solid rgba(0,200,100,.4);animation:pulse 1.5s infinite">● LIVE</div>
        ${s || s2 ? `<div class="fx-live-score">${s}${s && s2 ? '<br>' : ''}${s2}</div>` : ''}
        <div class="fx-hint">TAP FOR LIVE SCORE</div>
      </div>`;
  } else if (done) {
    const badgeCls = won ? 'fx-badge-win-style' : lost ? 'fx-badge-loss-style' : 'fx-badge-neutral';
    const badgeTxt = won ? '✓ RCB WON' : lost ? '✗ RCB LOST'
      : m.winner ? `${m.winner} WON` : 'COMPLETED';
    centerContent = `
      <div class="fx-result-wrap">
        <div class="fx-result-badge ${badgeCls}">${badgeTxt}</div>
        <div class="fx-result-text">${m.result || ''}</div>
        <div class="fx-hint">📊 TAP FOR SCORECARD</div>
      </div>`;
  } else {
    centerContent = `
      <div class="fx-vs">VS</div>
      <div class="fx-upcoming-pill">UPCOMING</div>`;
  }

  // Scores under team names (only if match started)
  const t1score = (done || live) && m.t1runs ? `<div class="fx-score">${m.t1runs}${m.t1ovs ? ' <small style="font-size:11px;opacity:.7">('+m.t1ovs+' Ov)</small>' : ''}</div>` : '';
  const t2score = (done || live) && m.t2runs ? `<div class="fx-score">${m.t2runs}${m.t2ovs ? ' <small style="font-size:11px;opacity:.7">('+m.t2ovs+' Ov)</small>' : ''}</div>` : '';

  return `
  <div class="${cls}" ${canClick ? `onclick="showScorecard('${m.apiId}', ${m.id})"` : ''}>
    <div class="fx-top-row">
      <div class="fx-match-num">MATCH ${m.id} — IPL 2026</div>
      <div class="fx-badges">${badges}</div>
    </div>
    <div class="fx-body">
      <div class="fx-team">
        <div class="fx-logo" style="border-color:${t1c}">
          ${t1l ? `<img src="${t1l}" alt="${m.t1}" onerror="this.style.display='none';this.nextElementSibling.style.display='block'">` : ''}
          <span style="display:none;color:${t1c};font-weight:800;font-size:11px">${m.t1}</span>
        </div>
        <div class="fx-tname">${m.t1}</div>
        ${t1score}
      </div>
      <div class="fx-center">
        ${centerContent}
        <div class="fx-meta">
          <div class="fx-meta-line">📅 ${dateStr} • ${m.time} IST</div>
          <div class="fx-meta-line">📍 ${m.venue}${m.city ? ', ' + m.city : ''}</div>
        </div>
      </div>
      <div class="fx-team">
        <div class="fx-logo" style="border-color:${t2c}">
          ${t2l ? `<img src="${t2l}" alt="${m.t2}" onerror="this.style.display='none';this.nextElementSibling.style.display='block'">` : ''}
          <span style="display:none;color:${t2c};font-weight:800;font-size:11px">${m.t2}</span>
        </div>
        <div class="fx-tname">${m.t2}</div>
        ${t2score}
      </div>
    </div>
  </div>`;
}

/* ── Render list ── */
function render() {
  const list = document.getElementById('fixtures-list');
  if (!list) return;

  const filtered = getFilteredMatches();
  const countEl  = document.getElementById('fx-count');
  if (countEl) countEl.textContent = `${filtered.length} MATCH${filtered.length !== 1 ? 'ES' : ''}`;

  if (!filtered.length) {
    list.innerHTML = '<div class="fx-empty">No matches found for this filter.</div>';
    return;
  }

  list.innerHTML = filtered.map(cardHTML).join('');
}

/* ── Scorecard Modal ── */
async function showScorecard(apiId, matchId) {
  const modal = document.getElementById('sc-modal');
  const inner = document.getElementById('sc-modal-inner');
  if (!modal || !inner) return;

  _currentScorecardId = apiId;
  inner.innerHTML = `<div class="sc-loading"><div class="sc-spinner"></div><br>Loading scorecard...</div>`;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';

  // Find local match data
  const m = _matches.find(x => x.id === matchId || x.apiId === apiId);
  if (!m) { inner.innerHTML = '<div class="sc-no-data">Match not found.</div>'; return; }

  // If we already have the scorecard locally, use it
  if (m.scorecard) {
    renderScorecard(m);
    return;
  }

  // Otherwise fetch from CricAPI
  try {
    const url = `https://api.cricapi.com/v1/match_scorecard?apikey=${CRICAPI_KEY}&id=${apiId}`;
    const r = await fetch(url);
    const json = await r.json();
    if (json.status !== 'success' || !json.data) throw new Error('No data');
    renderScorecardFromAPI(json.data, m);
  } catch (e) {
    // Fallback — show what we have
    inner.innerHTML = `
      <div class="sc-header">
        <div class="sc-teams">${m.t1} vs ${m.t2}</div>
        <div class="sc-meta">Match ${m.id} — ${m.date} • ${m.venue}</div>
        <div class="sc-result sc-res-other">${m.result || 'Score unavailable'}</div>
      </div>
      <div class="sc-body">
        <div class="sc-no-data">
          Detailed scorecard unavailable at the moment.<br>
          <a href="https://www.espncricinfo.com" target="_blank" class="sc-ext-link">View on ESPNcricinfo →</a>
        </div>
      </div>`;
  }
}

function renderScorecard(m) {
  const inner = document.getElementById('sc-modal-inner');
  if (!inner) return;
  const sc = m.scorecard;
  const won = m.winner === 'RCB';
  const lost = m.winner && m.winner !== 'RCB' && m.rcb;
  const resCls = won ? 'sc-res-win' : lost ? 'sc-res-loss' : 'sc-res-other';
  inner.innerHTML = `
    <div class="sc-header">
      <div class="sc-teams">${m.t1} vs ${m.t2}</div>
      <div class="sc-meta">Match ${m.id} • ${new Date(m.date+'T12:00:00').toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'})} • ${m.venue}${m.city ? ', '+m.city : ''}</div>
      <div class="sc-result ${resCls}">${m.result || 'Completed'}</div>
    </div>
    ${sc.toss ? `<div class="sc-toss">🪙 Toss: ${sc.toss}</div>` : ''}
    <div class="sc-body">
      ${sc.inn1 ? innHTML(sc.inn1) : ''}
      ${sc.inn2 ? innHTML(sc.inn2) : ''}
    </div>
    <div class="sc-footer">
      <a href="https://www.espncricinfo.com/series/indian-premier-league-2026-1449924" target="_blank" class="sc-ext-link">Full details on ESPNCricinfo ↗</a>
    </div>`;
}

function renderScorecardFromAPI(data, m) {
  const inner = document.getElementById('sc-modal-inner');
  if (!inner) return;

  const innings = data.scorecard || [];
  const score   = data.score || [];
  const won     = data.matchWinner && (data.matchWinner.toLowerCase().includes('royal challengers') || data.matchWinner === 'RCB');
  const rcb     = m && m.rcb;
  const resCls  = (won && rcb) ? 'sc-res-win' : (!won && rcb) ? 'sc-res-loss' : 'sc-res-other';
  const toss    = data.tossWinner
    ? `${data.tossWinner.charAt(0).toUpperCase() + data.tossWinner.slice(1)} won the toss and elected to ${data.tossChoice || 'bat'}`
    : '';

  const innSections = innings.map((inn, idx) => {
    const sc_obj = score[idx];
    const scoreStr = sc_obj ? `${sc_obj.r}/${sc_obj.w} (${sc_obj.o} Ov)` : '';
    const teamShort = inn.inning.replace(/ Inning \d+/i, '').trim();
    const bat = (inn.batting || []).map(b => [
      b.batsman?.name || '',
      b['dismissal-text'] || 'not out',
      b.r ?? 0, b.b ?? 0, b['4s'] ?? 0, b['6s'] ?? 0,
      (b.sr ?? 0).toFixed(2)
    ]);
    const bowl = (inn.bowling || []).map(b => [
      b.bowler?.name || '',
      String(b.o ?? 0), String(b.m ?? 0),
      String(b.r ?? 0), String(b.w ?? 0),
      (b.eco ?? 0).toFixed(2)
    ]);
    return innHTML({ team: teamShort, score: scoreStr, bat, bowl });
  }).join('');

  inner.innerHTML = `
    <div class="sc-header">
      <div class="sc-teams">${data.teams?.[0] || (m?.t1 || '')} vs ${data.teams?.[1] || (m?.t2 || '')}</div>
      <div class="sc-meta">Match ${m?.id || ''} • ${data.date ? new Date(data.date+'T12:00:00').toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'}) : ''} • ${data.venue || ''}</div>
      <div class="sc-result ${resCls}">${data.status || 'Completed'}</div>
    </div>
    ${toss ? `<div class="sc-toss">🪙 Toss: ${toss}</div>` : ''}
    <div class="sc-body">${innSections || '<div class="sc-no-data">Scorecard not available yet.</div>'}</div>
    <div class="sc-footer">
      <a href="https://www.espncricinfo.com/series/indian-premier-league-2026-1449924" target="_blank" class="sc-ext-link">Full details on ESPNCricinfo ↗</a>
    </div>`;
}

function innHTML(inn) {
  const batRows = (inn.bat || []).map(r =>
    `<tr>
      <td class="sc-name">${r[0]}</td>
      <td class="sc-dim">${r[1]}</td>
      <td class="sc-bold">${r[2]}</td>
      <td>${r[3]}</td>
      <td>${r[4]}</td>
      <td>${r[5]}</td>
      <td>${r[6]}</td>
    </tr>`).join('');
  const bowlRows = (inn.bowl || []).map(r =>
    `<tr>
      <td class="sc-name">${r[0]}</td>
      <td>${r[1]}</td>
      <td>${r[2]}</td>
      <td>${r[3]}</td>
      <td class="sc-bold">${r[4]}</td>
      <td>${r[5]}</td>
    </tr>`).join('');
  return `
    <div class="sc-inn-header">
      <span class="sc-team">${inn.team}</span>
      <span class="sc-score">${inn.score || ''}</span>
    </div>
    ${batRows ? `
    <table class="sc-table">
      <thead><tr><th>Batter</th><th>Dismissal</th><th>R</th><th>B</th><th>4s</th><th>6s</th><th>SR</th></tr></thead>
      <tbody>${batRows}</tbody>
    </table>` : ''}
    ${bowlRows ? `
    <table class="sc-table" style="margin-bottom:24px">
      <thead><tr><th>Bowler</th><th>O</th><th>M</th><th>R</th><th>W</th><th>Econ</th></tr></thead>
      <tbody>${bowlRows}</tbody>
    </table>` : ''}`;
}

function closeScorecard() {
  document.getElementById('sc-modal')?.classList.remove('open');
  document.body.style.overflow = '';
  _currentScorecardId = null;
}

/* ── Team filter population ── */
function populateTeamFilter() {
  const sel = document.getElementById('team-filter');
  if (!sel) return;
  const teams = ['RCB','CSK','MI','KKR','SRH','RR','DC','PBKS','GT','LSG'];
  sel.innerHTML = `<option value="all">All Teams</option>`
    + teams.map(t => `<option value="${t}">${t}</option>`).join('');
}

/* ── Init ── */
document.addEventListener('DOMContentLoaded', async () => {
  populateTeamFilter();

  // Tab filter
  document.querySelectorAll('.fx-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.fx-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      _activeFilter = btn.dataset.filter || 'all';
      render();
    });
  });

  // Team filter
  document.getElementById('team-filter')?.addEventListener('change', e => {
    _teamFilter = e.target.value;
    render();
  });

  // Close modal
  document.getElementById('sc-modal')?.addEventListener('click', e => {
    if (e.target.id === 'sc-modal') closeScorecard();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeScorecard(); });

  // Initial load
  await refreshData(true);

  // Auto-refresh every 30 seconds
  _refreshTimer = setInterval(async () => {
    await fetchData();
    render();
    updateCountdown();
  }, REFRESH_MS);
});

/* ── Global exports ── */
window.showScorecard = showScorecard;
window.closeScorecard = closeScorecard;
window.refreshData = () => refreshData(false);
