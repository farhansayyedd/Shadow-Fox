/* ============================================================
   RCB Fan Zone — Fixtures Engine v3
   - Loads instantly from window.IPL_2026_DATA (script tag)
   - Refreshes via fetch() every 30s when on HTTP/GitHub Pages
   - Working countdown, live badge, scorecard modal
   ============================================================ */

const CRICAPI_KEY = '3812d023-8576-4422-bc75-9cd9c7160d14';
const DATA_URL    = 'data/ipl2026.json';
const REFRESH_MS  = 30000;

var _matches = [];
var _filter  = 'all';
var _team    = 'all';
var _cdTimer = null;

/* ─── Team config ─── */
var LOGOS = {
  RCB:'images/rcb-logo.png', CSK:'images/csk.png', MI:'images/mi.png',
  KKR:'images/kkr.png', SRH:'images/srh.png', RR:'images/rr.png',
  DC:'images/dc.png', PBKS:'images/pbks.png', GT:'images/gt.png', LSG:'images/lsg.png'
};
var COLORS = {
  RCB:'#CC0000', CSK:'#DBA70A', MI:'#004BA0', KKR:'#3A225D',
  SRH:'#F7A721', RR:'#254AA5', DC:'#0078BC', PBKS:'#ED1C24',
  GT:'#1B2133', LSG:'#56CCF2'
};

function teamColor(t) { return COLORS[t] || '#666'; }
function teamLogo(t)  { return LOGOS[t] || ''; }

/* ─── DateTime ─── */
function matchDT(m) {
  return new Date(m.date + 'T' + m.time + ':00+05:30');
}
function isLive(m) {
  if (m.ended) return false;
  if (m.isLive) return true;
  var dt = matchDT(m), now = new Date();
  return m.started && !m.ended && now > dt && (now - dt) < 4 * 3600000;
}

/* ─── Load data from window global (SYNCHRONOUS — always works) ─── */
function loadFromGlobal() {
  if (window.IPL_2026_DATA && window.IPL_2026_DATA.matches && window.IPL_2026_DATA.matches.length) {
    _matches = window.IPL_2026_DATA.matches;
    setUpdatedLabel(window.IPL_2026_DATA.generatedAt);
    return true;
  }
  return false;
}

/* ─── Fetch fresh JSON (async — works on HTTP/GitHub Pages) ─── */
function fetchFresh() {
  var ctrl = new AbortController();
  var tid = setTimeout(function() { ctrl.abort(); }, 6000);
  fetch(DATA_URL + '?t=' + Date.now(), { signal: ctrl.signal })
    .then(function(r) {
      clearTimeout(tid);
      if (!r.ok) throw new Error('bad status');
      return r.json();
    })
    .then(function(json) {
      if (json && json.matches && json.matches.length) {
        _matches = json.matches;
        setUpdatedLabel(json.generatedAt);
        render();
        updateCountdown();
      }
    })
    .catch(function() { /* silently ignore on file:// */ });
}

function setUpdatedLabel(ts) {
  var el = document.getElementById('last-updated');
  if (!el || !ts) return;
  var mins = Math.floor((Date.now() - new Date(ts)) / 60000);
  el.textContent = mins < 1 ? '• Updated just now'
    : mins < 60 ? '• Updated ' + mins + 'm ago'
    : '• Updated ' + Math.floor(mins / 60) + 'h ago';
}

/* ─── Filter ─── */
function filtered() {
  var list = _matches.slice();
  if (_filter === 'rcb')      list = list.filter(function(m) { return m.rcb; });
  if (_filter === 'results')  list = list.filter(function(m) { return m.ended; });
  if (_filter === 'upcoming') list = list.filter(function(m) { return !m.ended; });
  if (_team !== 'all') list = list.filter(function(m) { return m.t1 === _team || m.t2 === _team; });
  return list;
}

/* ─── Build one card ─── */
function buildCard(m) {
  var live = isLive(m);
  var done = m.ended;
  var won  = done && m.winner === 'RCB';
  var lost = done && m.rcb && m.winner && m.winner !== 'RCB';
  var canClick = done || live;

  var cls = 'fx-card';
  if (live)       cls += ' fx-live-card';
  else if (won)   cls += ' fx-win';
  else if (lost)  cls += ' fx-loss';
  else if (done)  cls += ' fx-done';
  else            cls += ' fx-upcoming';
  if (canClick) cls += ' fx-clickable';

  var dt = matchDT(m);
  var dateStr = dt.toLocaleDateString('en-IN', { weekday:'short', day:'numeric', month:'short' });
  var c1 = teamColor(m.t1), c2 = teamColor(m.t2);
  var l1 = teamLogo(m.t1), l2 = teamLogo(m.t2);

  // Badges row
  var badges = '';
  if (m.rcb)  badges += '<span class="fx-badge-rcb">RCB</span>';
  if (live)   badges += '<span class="fx-badge-live">&#9679; LIVE</span>';

  // Scores — show actual scores if available, else show result stub for completed matches
  var s1 = '';
  var s2 = '';
  if (done || live) {
    s1 = m.t1runs ? m.t1runs + (m.t1ovs ? '<small> (' + m.t1ovs + ' Ov)</small>' : '') : (done && m.winner === m.t1 ? '<span style="color:#00C864;font-size:11px">★ WINNER</span>' : (done ? '<span style="color:#888;font-size:11px">&mdash;</span>' : ''));
    s2 = m.t2runs ? m.t2runs + (m.t2ovs ? '<small> (' + m.t2ovs + ' Ov)</small>' : '') : (done && m.winner === m.t2 ? '<span style="color:#00C864;font-size:11px">★ WINNER</span>' : (done ? '<span style="color:#888;font-size:11px">&mdash;</span>' : ''));
  }

  // Center
  var center = '';
  if (live) {
    center = '<div class="fx-result-wrap">'
      + '<div class="fx-result-badge" style="background:rgba(0,200,100,.2);color:#00C864;border:1px solid rgba(0,200,100,.5)">&#9679; LIVE</div>'
      + '<div class="fx-hint">TAP FOR LIVE SCORE</div>'
      + '</div>';
  } else if (done) {
    var bcls = won ? 'fx-badge-win-style' : lost ? 'fx-badge-loss-style' : 'fx-badge-neutral';
    var btxt = won ? '&#10003; RCB WON' : lost ? '&#10007; RCB LOST' : (m.winner ? m.winner + ' WON' : 'COMPLETED');
    center = '<div class="fx-result-wrap">'
      + '<div class="fx-result-badge ' + bcls + '">' + btxt + '</div>'
      + '<div class="fx-result-text">' + (m.result || '') + '</div>'
      + '<div class="fx-hint">&#128202; TAP FOR SCORECARD</div>'
      + '</div>';
  } else {
    center = '<div class="fx-vs">VS</div><div class="fx-upcoming-pill">UPCOMING</div>';
  }

  var onclk = canClick ? ' onclick="openScorecard(\'' + m.apiId + '\',' + m.id + ')"' : '';

  return '<div class="' + cls + '"' + onclk + '>'
    + '<div class="fx-top-row">'
    +   '<div class="fx-match-num">MATCH ' + m.id + ' &mdash; IPL 2026</div>'
    +   '<div class="fx-badges">' + badges + '</div>'
    + '</div>'
    + '<div class="fx-body">'
    +   '<div class="fx-team">'
    +     '<div class="fx-logo" style="border-color:' + c1 + '">'
    +       (l1 ? '<img src="' + l1 + '" alt="' + m.t1 + '" onerror="this.style.display=\'none\'">' : '')
    +     '</div>'
    +     '<div class="fx-tname">' + m.t1 + '</div>'
    +     (s1 ? '<div class="fx-score">' + s1 + '</div>' : '')
    +   '</div>'
    +   '<div class="fx-center">'
    +     center
    +     '<div class="fx-meta">'
    +       '<div class="fx-meta-line">&#128197; ' + dateStr + ' &bull; ' + m.time + ' IST</div>'
    +       '<div class="fx-meta-line">&#128205; ' + m.venue + (m.city ? ', ' + m.city : '') + '</div>'
    +     '</div>'
    +   '</div>'
    +   '<div class="fx-team">'
    +     '<div class="fx-logo" style="border-color:' + c2 + '">'
    +       (l2 ? '<img src="' + l2 + '" alt="' + m.t2 + '" onerror="this.style.display=\'none\'">' : '')
    +     '</div>'
    +     '<div class="fx-tname">' + m.t2 + '</div>'
    +     (s2 ? '<div class="fx-score">' + s2 + '</div>' : '')
    +   '</div>'
    + '</div>'
    + '</div>';
}

/* ─── Render list ─── */
function render() {
  var list = document.getElementById('fixtures-list');
  if (!list) return;
  var items = filtered();
  var countEl = document.getElementById('fx-count');
  if (countEl) countEl.textContent = items.length + ' MATCH' + (items.length !== 1 ? 'ES' : '');
  if (!items.length) {
    list.innerHTML = '<div class="fx-empty">No matches found.</div>';
    return;
  }
  list.innerHTML = items.map(buildCard).join('');
}

/* ─── Countdown ─── */
function updateCountdown() {
  if (_cdTimer) { clearInterval(_cdTimer); _cdTimer = null; }

  var liveMatch = _matches.find(function(m) { return m.rcb && isLive(m); });
  if (liveMatch) {
    showLiveBanner(liveMatch);
    return;
  }

  var now = new Date();
  var upcoming = _matches
    .filter(function(m) { return m.rcb && !m.ended && matchDT(m) > now; })
    .sort(function(a, b) { return matchDT(a) - matchDT(b); });

  var next = upcoming[0];
  if (!next) {
    var w = document.getElementById('countdown-wrap');
    if (w) w.innerHTML = '<div class="cdw-label">IPL 2026</div><div class="cdw-match">All RCB Matches Complete</div>';
    return;
  }

  var dt   = matchDT(next);
  var opp  = next.t1 === 'RCB' ? next.t2 : next.t1;
  var vsT  = 'RCB vs ' + opp;
  var dateS = dt.toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' });

  var cdLabel = document.getElementById('cdw-label');
  var cdMatch = document.getElementById('cdw-match');
  var cdVenue = document.getElementById('cdw-venue');
  var cdDate  = document.getElementById('cdw-date');
  var cdTimer = document.getElementById('cdw-timer');

  if (cdLabel) cdLabel.textContent  = 'Next RCB Match In';
  if (cdMatch) cdMatch.textContent  = vsT;
  if (cdVenue) cdVenue.textContent  = next.venue + (next.city ? ', ' + next.city : '');
  if (cdDate)  cdDate.textContent   = dateS + ' \u2022 ' + next.time + ' IST';
  if (cdTimer) cdTimer.style.display = 'flex';

  function tick() {
    var diff = dt - new Date();
    if (diff <= 0) {
      clearInterval(_cdTimer); _cdTimer = null;
      if (cdLabel) cdLabel.textContent = 'MATCH IS LIVE';
      if (cdTimer) cdTimer.innerHTML = '<div class="cdw-live-banner">\u25CF ' + vsT + ' IS LIVE</div>';
      return;
    }
    var d = Math.floor(diff / 86400000);
    var h = Math.floor((diff % 86400000) / 3600000);
    var min = Math.floor((diff % 3600000) / 60000);
    var s = Math.floor((diff % 60000) / 1000);
    function pad(v) { return v < 10 ? '0' + v : '' + v; }
    var dEl = document.getElementById('cd-d');
    var hEl = document.getElementById('cd-h');
    var mEl = document.getElementById('cd-m');
    var sEl = document.getElementById('cd-s');
    if (dEl) dEl.textContent = pad(d);
    if (hEl) hEl.textContent = pad(h);
    if (mEl) mEl.textContent = pad(min);
    if (sEl) sEl.textContent = pad(s);
  }
  tick();
  _cdTimer = setInterval(tick, 1000);
}

function showLiveBanner(m) {
  var opp = m.t1 === 'RCB' ? m.t2 : m.t1;
  var cdMatch = document.getElementById('cdw-match');
  var cdLabel = document.getElementById('cdw-label');
  var cdVenue = document.getElementById('cdw-venue');
  var cdDate  = document.getElementById('cdw-date');
  var cdTimer = document.getElementById('cdw-timer');
  if (cdLabel) cdLabel.textContent = '\uD83D\uDD34 MATCH LIVE NOW';
  if (cdMatch) cdMatch.textContent = 'RCB vs ' + opp;
  if (cdVenue) cdVenue.textContent = m.venue + (m.city ? ', ' + m.city : '');
  if (cdDate)  cdDate.textContent  = 'Live score updates every 30 seconds';
  var scoreStr = '';
  if (m.t1runs) scoreStr += m.t1 + ' ' + m.t1runs;
  if (m.t2runs) scoreStr += (scoreStr ? ' | ' : '') + m.t2 + ' ' + m.t2runs;
  if (cdTimer) cdTimer.innerHTML = '<div class="cdw-live-banner">\u25CF LIVE' + (scoreStr ? ' &mdash; ' + scoreStr : '') + '</div>';
}

/* ─── Scorecard Modal ─── */
function openScorecard(apiId, matchId) {
  var modal = document.getElementById('sc-modal');
  var inner = document.getElementById('sc-modal-inner');
  if (!modal || !inner) return;

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';

  var m = _matches.find(function(x) { return x.id === matchId || x.apiId === apiId; });
  if (!m) {
    inner.innerHTML = '<div class="sc-no-data">Match not found.</div>';
    return;
  }

  // If we have local scorecard data, render it immediately (no network needed)
  if (m.scorecard) {
    inner.innerHTML = buildScorecardHTML(m);
    return;
  }

  // Show spinner and fetch from CricAPI
  inner.innerHTML = '<div class="sc-loading"><div class="sc-spinner"></div><br>Loading scorecard...</div>';

  var url = 'https://api.cricapi.com/v1/match_scorecard?apikey=' + CRICAPI_KEY + '&id=' + apiId;
  fetch(url)
    .then(function(r) { return r.json(); })
    .then(function(json) {
      if (json.status === 'success' && json.data) {
        inner.innerHTML = buildScorecardFromAPI(json.data, m);
      } else {
        inner.innerHTML = buildNoScorecard(m);
      }
    })
    .catch(function() {
      inner.innerHTML = buildNoScorecard(m);
    });
}

function buildNoScorecard(m) {
  var won = m.winner === 'RCB', lost = m.rcb && m.winner && m.winner !== 'RCB';
  return '<div class="sc-header">'
    + '<div class="sc-teams">' + m.t1 + ' vs ' + m.t2 + '</div>'
    + '<div class="sc-meta">Match ' + m.id + ' &bull; ' + m.date + ' &bull; ' + m.venue + '</div>'
    + '<div class="sc-result ' + (won ? 'sc-res-win' : lost ? 'sc-res-loss' : 'sc-res-other') + '">' + (m.result || 'Completed') + '</div>'
    + '</div>'
    + '<div class="sc-body"><div class="sc-no-data">Detailed scorecard not available.<br>'
    + '<a href="https://www.espncricinfo.com/series/indian-premier-league-2026-1449924" target="_blank" class="sc-ext-link">View on ESPNCricinfo &rarr;</a></div></div>';
}

function buildScorecardHTML(m) {
  var sc = m.scorecard;
  var won = m.winner === 'RCB', lost = m.rcb && m.winner && m.winner !== 'RCB';
  var resCls = won ? 'sc-res-win' : lost ? 'sc-res-loss' : 'sc-res-other';
  var dateStr = new Date(m.date + 'T12:00:00').toLocaleDateString('en-IN',
    { weekday:'long', day:'numeric', month:'long', year:'numeric' });
  return '<div class="sc-header">'
    + '<div class="sc-teams">' + m.t1 + ' vs ' + m.t2 + '</div>'
    + '<div class="sc-meta">Match ' + m.id + ' &bull; ' + dateStr + ' &bull; ' + m.venue + (m.city ? ', ' + m.city : '') + '</div>'
    + '<div class="sc-result ' + resCls + '">' + (m.result || 'Completed') + '</div>'
    + '</div>'
    + (sc.toss ? '<div class="sc-toss">&#127922; Toss: ' + sc.toss + '</div>' : '')
    + '<div class="sc-body">'
    + (sc.inn1 ? buildInningsHTML(sc.inn1) : '')
    + (sc.inn2 ? buildInningsHTML(sc.inn2) : '')
    + '</div>'
    + '<div class="sc-footer"><a href="https://www.espncricinfo.com/series/indian-premier-league-2026-1449924" target="_blank" class="sc-ext-link">Full details on ESPNCricinfo &nearr;</a></div>';
}

function buildScorecardFromAPI(data, m) {
  var innings = data.scorecard || [];
  var scores  = data.score || [];
  var won = data.matchWinner && (data.matchWinner.toLowerCase().includes('royal challengers') || data.matchWinner === 'RCB');
  var rcb = m && m.rcb;
  var resCls = (won && rcb) ? 'sc-res-win' : (!won && rcb) ? 'sc-res-loss' : 'sc-res-other';
  var toss = data.tossWinner
    ? data.tossWinner.charAt(0).toUpperCase() + data.tossWinner.slice(1) + ' won the toss and elected to ' + (data.tossChoice || 'bat')
    : '';
  var innSections = innings.map(function(inn, idx) {
    var sc = scores[idx];
    var scoreStr = sc ? sc.r + '/' + sc.w + ' (' + sc.o + ' Ov)' : '';
    var team = inn.inning.replace(/ Inning \d+/i, '').trim();
    var bat = (inn.batting || []).map(function(b) {
      return [b.batsman && b.batsman.name || '', b['dismissal-text'] || 'not out',
        b.r || 0, b.b || 0, b['4s'] || 0, b['6s'] || 0,
        (b.sr || 0).toFixed(2)];
    });
    var bowl = (inn.bowling || []).map(function(b) {
      return [b.bowler && b.bowler.name || '', String(b.o || 0),
        String(b.m || 0), String(b.r || 0), String(b.w || 0),
        (b.eco || 0).toFixed(2)];
    });
    return buildInningsHTML({ team: team, score: scoreStr, bat: bat, bowl: bowl });
  }).join('');

  return '<div class="sc-header">'
    + '<div class="sc-teams">' + (data.teams && data.teams[0] || (m && m.t1) || '') + ' vs ' + (data.teams && data.teams[1] || (m && m.t2) || '') + '</div>'
    + '<div class="sc-meta">' + (data.date || '') + ' &bull; ' + (data.venue || '') + '</div>'
    + '<div class="sc-result ' + resCls + '">' + (data.status || 'Completed') + '</div>'
    + '</div>'
    + (toss ? '<div class="sc-toss">&#127922; ' + toss + '</div>' : '')
    + '<div class="sc-body">' + (innSections || '<div class="sc-no-data">Scorecard not available yet.</div>') + '</div>'
    + '<div class="sc-footer"><a href="https://www.espncricinfo.com/series/indian-premier-league-2026-1449924" target="_blank" class="sc-ext-link">Full details on ESPNCricinfo &nearr;</a></div>';
}

function buildInningsHTML(inn) {
  var batRows = (inn.bat || []).map(function(r) {
    return '<tr>'
      + '<td class="sc-name">' + r[0] + '</td>'
      + '<td class="sc-dim">' + r[1] + '</td>'
      + '<td class="sc-bold">' + r[2] + '</td>'
      + '<td>' + r[3] + '</td><td>' + r[4] + '</td><td>' + r[5] + '</td>'
      + '<td>' + r[6] + '</td>'
      + '</tr>';
  }).join('');
  var bowlRows = (inn.bowl || []).map(function(r) {
    return '<tr>'
      + '<td class="sc-name">' + r[0] + '</td>'
      + '<td>' + r[1] + '</td><td>' + r[2] + '</td>'
      + '<td>' + r[3] + '</td>'
      + '<td class="sc-bold">' + r[4] + '</td>'
      + '<td>' + r[5] + '</td>'
      + '</tr>';
  }).join('');
  return '<div class="sc-inn-header">'
    + '<span class="sc-team">' + inn.team + '</span>'
    + '<span class="sc-score">' + (inn.score || '') + '</span>'
    + '</div>'
    + (batRows ? '<table class="sc-table"><thead><tr>'
      + '<th>Batter</th><th>Dismissal</th><th>R</th><th>B</th><th>4s</th><th>6s</th><th>SR</th>'
      + '</tr></thead><tbody>' + batRows + '</tbody></table>' : '')
    + (bowlRows ? '<table class="sc-table" style="margin-bottom:24px"><thead><tr>'
      + '<th>Bowler</th><th>O</th><th>M</th><th>R</th><th>W</th><th>Eco</th>'
      + '</tr></thead><tbody>' + bowlRows + '</tbody></table>' : '');
}

function closeScorecard() {
  var modal = document.getElementById('sc-modal');
  if (modal) modal.classList.remove('open');
  document.body.style.overflow = '';
}

/* ─── Team filter ─── */
function populateTeamFilter() {
  var sel = document.getElementById('team-filter');
  if (!sel) return;
  var teams = ['RCB','CSK','MI','KKR','SRH','RR','DC','PBKS','GT','LSG'];
  sel.innerHTML = '<option value="all">All Teams</option>'
    + teams.map(function(t) { return '<option value="' + t + '">' + t + '</option>'; }).join('');
}

/* ─── INIT ─── */
document.addEventListener('DOMContentLoaded', function() {

  // 1. Populate filters
  populateTeamFilter();

  // 2. INSTANTLY load & render from window global — no async, no waiting
  loadFromGlobal();
  render();
  updateCountdown();

  // 3. Set up filter tabs
  document.querySelectorAll('.fx-tab').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.fx-tab').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      _filter = btn.dataset.filter || 'all';
      render();
    });
  });

  // 4. Team dropdown
  var sel = document.getElementById('team-filter');
  if (sel) sel.addEventListener('change', function(e) { _team = e.target.value; render(); });

  // 5. Modal close handlers
  var modal = document.getElementById('sc-modal');
  if (modal) modal.addEventListener('click', function(e) { if (e.target === modal) closeScorecard(); });
  document.addEventListener('keydown', function(e) { if (e.key === 'Escape') closeScorecard(); });

  // 6. Refresh button
  var rbtn = document.getElementById('refresh-now');
  if (rbtn) rbtn.addEventListener('click', function() { fetchFresh(); });

  // 7. Background fetch for fresh data (HTTP only)
  fetchFresh();

  // 8. Auto-refresh every 30 seconds
  setInterval(function() { fetchFresh(); }, REFRESH_MS);
});

// Global exports
window.openScorecard  = openScorecard;
window.closeScorecard = closeScorecard;
window.refreshData    = function() { fetchFresh(); };
