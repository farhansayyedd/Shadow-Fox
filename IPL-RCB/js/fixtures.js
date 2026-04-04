'use strict';

/* =====================================================
   IPL 2026 — All Matches (Verified from official sources)
   Last updated: Apr 5, 2026
   ===================================================== */
/* Team Data & Fixtures Render Logic */

/* ── Countdown to next RCB match ── */
function startCountdown() {
  const now = new Date();
  const nextMatch = ALL_IPL_2026.find(m => m.rcb && !m.result && new Date(m.date + 'T' + m.time + ':00+05:30') > now);
  
  const els = [document.getElementById('countdown-wrap'), document.getElementById('next-countdown-box')].filter(Boolean);
  if (!nextMatch || els.length === 0) { 
    els.forEach(el => el.style.display = 'none'); 
    return; 
  }

  const matchTime = new Date(nextMatch.date + 'T' + nextMatch.time + ':00+05:30');
  const vsText = nextMatch.t1 === 'RCB' ? `RCB vs ${nextMatch.t2}` : `${nextMatch.t1} vs RCB`;
  const dateStr = matchTime.toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'});

  els.forEach(el => {
    if (el.querySelector('.cdw-match')) el.querySelector('.cdw-match').textContent = vsText;
    if (el.querySelector('.cdw-venue')) el.querySelector('.cdw-venue').textContent = nextMatch.venue + ', ' + nextMatch.city;
    if (el.querySelector('.cdw-date'))  el.querySelector('.cdw-date').textContent = dateStr + ' • ' + nextMatch.time + ' IST';
    if (el.querySelector('.countdown-label')) el.querySelector('.countdown-label').textContent = `NEXT MATCH: ${vsText}`;
  });

  function tick() {
    const diff = matchTime - new Date();
    if (diff <= 0) { 
      els.forEach(el => {
        const timer = el.querySelector('.cdw-timer') || el.querySelector('.countdown-timer');
        if (timer) timer.innerHTML = '<span style="color:var(--rcb-gold);font-weight:700">● MATCH IS LIVE</span>'; 
      });
      return; 
    }
    const d = Math.floor(diff/86400000), h = Math.floor((diff%86400000)/3600000),
          m = Math.floor((diff%3600000)/60000), s = Math.floor((diff%60000)/1000);
          
    els.forEach(el => {
      if (el.querySelector('#cd-d')) el.querySelector('#cd-d').textContent = String(d).padStart(2,'0');
      if (el.querySelector('#cd-h')) el.querySelector('#cd-h').textContent = String(h).padStart(2,'0');
      if (el.querySelector('#cd-m')) el.querySelector('#cd-m').textContent = String(m).padStart(2,'0');
      if (el.querySelector('#cd-s')) el.querySelector('#cd-s').textContent = String(s).padStart(2,'0');
    });
  }
  tick(); setInterval(tick, 1000);
}

/* ── Team meta ── */
function teamLogo(short) {
  const logos = { RCB:'images/rcb-logo.png', CSK:'images/csk.png', MI:'images/mi.png', KKR:'images/kkr.png', SRH:'images/srh.png', RR:'images/rr.png', DC:'images/dc.png', PBKS:'images/pbks.png', GT:'images/gt.png', LSG:'images/lsg.png' };
  return logos[short] || 'images/rcb-logo.png';
}
function teamColor(short) {
  const c = { RCB:'#CC0000', CSK:'#F9CD05', MI:'#004BA0', KKR:'#3A225D', SRH:'#F7A721', RR:'#254AA5', DC:'#0078BC', PBKS:'#ED1C24', GT:'#1B2133', LSG:'#A2EDFC' };
  return c[short] || '#888';
}

/* ── Render fixture cards ── */
function renderFixtures(containerId, statusFilter, teamFilter) {
  const container = document.getElementById(containerId);
  if (!container) return;
  let list = ALL_IPL_2026;
  const now = new Date();
  if (statusFilter === 'results')  list = list.filter(m => m.result);
  if (statusFilter === 'upcoming') list = list.filter(m => !m.result);
  if (teamFilter && teamFilter !== 'all') list = list.filter(m => m.t1===teamFilter||m.t2===teamFilter);
  if (!list.length) { container.innerHTML = `<div class="fx-empty">No matches found.</div>`; return; }

  container.innerHTML = list.map(m => {
    const dt = new Date(m.date+'T'+m.time+':00+05:30');
    const dateStr = dt.toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short',year:'numeric'});
    const isRCB = m.rcb;
    const won = m.result && m.winner === 'RCB';
    const lost = m.result && m.winner && m.winner !== 'RCB' && isRCB;

    return `
    <div class="fx-card ${isRCB?'fx-rcb':''} ${m.result?'fx-done':'fx-upcoming'} ${won?'fx-win':lost?'fx-loss':''}"
         ${m.result?`onclick="showScorecard(${m.id})" style="cursor:pointer" title="View Scorecard"`:''}
         >
      ${isRCB?`<div class="fx-rcb-badge">RCB MATCH</div>`:''}
      <div class="fx-match-num">MATCH ${m.id}</div>
      <div class="fx-body">
        <div class="fx-team">
          <div class="fx-logo" style="border-color:${teamColor(m.t1)}">
            <img src="${teamLogo(m.t1)}" alt="${m.t1}" onerror="this.style.display='none';this.nextSibling.style.display='block'">
            <span style="display:none;color:${teamColor(m.t1)};font-weight:800;font-size:12px">${m.t1}</span>
          </div>
          <div class="fx-tname">${m.t1}</div>
          ${m.result?`<div class="fx-score">${m.t1runs||''}</div>`:''}
        </div>
        <div class="fx-center">
          ${m.result
            ? `<div class="fx-badge ${won?'fx-badge-win':lost?'fx-badge-loss':'fx-badge-done'}">${won?'✓ WIN':lost?'✗ LOSS':'RESULT'}</div>
               <div class="fx-result-text">${m.result}</div>`
            : `<div class="fx-vs">VS</div>`}
          <div class="fx-info">
            <div class="fx-datetime">📅 ${dateStr}</div>
            <div class="fx-datetime">🕐 ${m.time} IST</div>
            <div class="fx-datetime">📍 ${m.venue}, ${m.city}</div>
          </div>
          ${m.result?`<div class="fx-click-hint">📊 Tap for scorecard</div>`:`<div class="fx-upcoming-tag">UPCOMING</div>`}
        </div>
        <div class="fx-team fx-team-r">
          <div class="fx-logo" style="border-color:${teamColor(m.t2)}">
            <img src="${teamLogo(m.t2)}" alt="${m.t2}" onerror="this.style.display='none';this.nextSibling.style.display='block'">
            <span style="display:none;color:${teamColor(m.t2)};font-weight:800;font-size:12px">${m.t2}</span>
          </div>
          <div class="fx-tname">${m.t2}</div>
          ${m.result?`<div class="fx-score">${m.t2runs||''}</div>`:''}
        </div>
      </div>
    </div>`;
  }).join('');
}

/* ── Scorecard Modal ── */
function showScorecard(id) {
  const m = ALL_IPL_2026.find(x => x.id === id);
  if (!m || !m.result) return;

  const link = `https://www.espncricinfo.com/series/indian-premier-league-2026/`;

  let body = '';
  if (m.scorecard) {
    const sc = m.scorecard;
    const battingTable = (inn) => `
      <div class="sc-inn-header"><span class="sc-team">${inn.team}</span><span class="sc-score">${inn.score}</span></div>
      <table class="sc-table">
        <thead><tr><th>Batter</th><th>Dismissal</th><th>R</th><th>B</th><th>4s</th><th>6s</th><th>SR</th></tr></thead>
        <tbody>${inn.bat.map(r=>`<tr><td class="sc-name">${r[0]}</td><td class="sc-dim">${r[1]}</td><td class="sc-bold">${r[2]}</td><td>${r[3]}</td><td>${r[4]}</td><td>${r[5]}</td><td>${r[6]}</td></tr>`).join('')}</tbody>
      </table>
      <table class="sc-table sc-bowl-table">
        <thead><tr><th>Bowler</th><th>O</th><th>M</th><th>R</th><th>W</th><th>Econ</th></tr></thead>
        <tbody>${inn.bowl.map(r=>`<tr><td class="sc-name">${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td><td class="sc-bold">${r[4]}</td><td>${r[5]}</td></tr>`).join('')}</tbody>
      </table>`;
    body = `<div class="sc-toss">🪙 Toss: ${sc.toss}</div>${battingTable(sc.inn1)}${battingTable(sc.inn2)}`;
  } else {
    body = `<div class="sc-no-data">
      Full scorecard available on ESPNCricinfo.
      <a href="${link}" target="_blank" class="sc-ext-link">View Full Scorecard →</a>
    </div>`;
  }

  const winnerColor = m.winner === 'RCB' ? '#00C864' : '#CC0000';
  document.getElementById('sc-modal-inner').innerHTML = `
    <div class="sc-header">
      <div class="sc-teams">${m.t1} vs ${m.t2}</div>
      <div class="sc-meta">${new Date(m.date+'T'+m.time+':00+05:30').toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'})} • ${m.venue}, ${m.city}</div>
      <div class="sc-result" style="color:${winnerColor}">${m.result}</div>
    </div>
    <div class="sc-body">${body}</div>
    <div class="sc-footer"><a href="${link}" target="_blank" class="sc-ext-link">Full Scorecard on ESPNCricinfo ↗</a></div>
  `;
  document.getElementById('sc-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeScorecard() {
  document.getElementById('sc-modal').classList.remove('open');
  document.body.style.overflow = '';
}

/* ── Populate team filter dropdown ── */
function populateTeamFilter() {
  const sel = document.getElementById('team-filter');
  if (!sel) return;
  const teams = ['RCB','CSK','MI','KKR','SRH','RR','DC','PBKS','GT','LSG'];
  sel.innerHTML = `<option value="all">All Teams</option>` + teams.map(t=>`<option value="${t}">${t}</option>`).join('');
}

function applyFilters() {
  const status = document.querySelector('.fx-tab.active')?.dataset.filter || 'all';
  const team = document.getElementById('team-filter')?.value || 'all';
  renderFixtures('fixtures-list', status, team);
}

/* ── Render Home Premium Cards ── */
function renderHomeCards(matches, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.className = 'hf-grid';
  container.innerHTML = matches.map(m => {
    const dt = new Date(m.date+'T'+m.time+':00+05:30');
    const dateStr = dt.toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'});
    const isDone = Boolean(m.result);
    
    let statusClass = 'upcoming';
    let statusText = 'UPCOMING';
    if (isDone) {
      if (m.winner === 'RCB') { statusClass = 'won'; statusText = 'RCB WON'; }
      else if (m.winner) { statusClass = 'lost'; statusText = 'RCB LOST'; }
      else { statusClass = 'upcoming'; statusText = 'COMPLETED'; }
    }

    return `
      <div class="hf-card" ${isDone ? `onclick="showScorecard(${m.id})"` : ''}>
        <div class="hf-header">
          <span class="hf-match-no">Match ${m.id}</span>
          <span class="hf-date">${dateStr} • ${m.time}</span>
        </div>
        <div class="hf-teams">
          <div class="hf-team">
            <img class="hf-logo" src="${teamLogo(m.t1)}" alt="${m.t1}">
            <div class="hf-name">${m.t1}</div>
            ${isDone ? `<div style="font-family:var(--font-heading);font-weight:700;font-size:18px;color:${teamColor(m.t1)}">${m.t1runs||''}</div>` : ''}
          </div>
          <div class="hf-vs">VS</div>
          <div class="hf-team">
            <img class="hf-logo" src="${teamLogo(m.t2)}" alt="${m.t2}">
            <div class="hf-name">${m.t2}</div>
            ${isDone ? `<div style="font-family:var(--font-heading);font-weight:700;font-size:18px;color:${teamColor(m.t2)}">${m.t2runs||''}</div>` : ''}
          </div>
        </div>
        <div class="hf-venue">📍 ${m.venue}, ${m.city}</div>
        <div class="hf-footer">
          ${isDone ? `<div class="hf-btn" style="background:var(--rcb-navy);border-color:var(--rcb-gold)">📊 SCORECARD</div>` : `<div class="hf-status ${statusClass}">${statusText}</div>`}
        </div>
      </div>
    `;
  }).join('');
}
window.renderHomeCards = renderHomeCards;

/* ── Init ── */
document.addEventListener('DOMContentLoaded', () => {
  startCountdown();
  populateTeamFilter();
  renderFixtures('fixtures-list','all','all');

  // Tab click
  document.querySelectorAll('.fx-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.fx-tab').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      applyFilters();
    });
  });

  // Team filter change
  document.getElementById('team-filter')?.addEventListener('change', applyFilters);

  // Close modal on backdrop click
  document.getElementById('sc-modal')?.addEventListener('click', e => {
    if (e.target.id === 'sc-modal') closeScorecard();
  });

  // Close on Escape
  document.addEventListener('keydown', e => { if(e.key==='Escape') closeScorecard(); });
});

window.RCBFixtures = { renderFixtures, showScorecard, closeScorecard, ALL_IPL_2026 };
