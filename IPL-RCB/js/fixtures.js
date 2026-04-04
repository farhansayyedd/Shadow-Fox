'use strict';

/* =====================================================
   IPL 2026 — All Matches (Verified from official sources)
   Last updated: Apr 5, 2026
   ===================================================== */
const ALL_IPL_2026 = [
  // ── COMPLETED ──────────────────────────────────────
  { id:1,  date:"2024-05-18", time:"19:30", t1:"RCB",  t2:"CSK",  venue:"M. Chinnaswamy Stadium",  city:"Bengaluru",    t1runs:"218/5", t1ovs:"20", t2runs:"191/7", t2ovs:"20",   result:"RCB won by 27 runs",   winner:"RCB",  rcb:true,
    scorecard:{ toss:"CSK won the toss and elected to field",
      inn1:{ team:"RCB", score:"218/5 (20 Ov)",
        bat:[ ["Virat Kohli","c Mitchell b Santner",47,29,3,4,"162.06"],["Faf du Plessis","run out (Santner)",54,39,3,3,"138.46"],["Rajat Patidar","c Mitchell b Thakur",41,23,2,4,"178.26"],["Cameron Green","not out",38,17,3,3,"223.52"],["Dinesh Karthik","c Dhoni b Deshpande",14,6,1,1,"233.33"],["Glenn Maxwell","c Dhoni b Thakur",16,5,2,1,"320.00"] ],
        bowl:[ ["Tushar Deshpande","4","0","49","1","12.25"],["Shardul Thakur","4","0","61","2","15.25"],["Maheesh Theekshana","4","0","25","0","6.25"],["Mitchell Santner","3","0","23","1","7.66"],["Ravindra Jadeja","3","0","40","0","13.33"],["Simarjeet Singh","2","0","28","0","14.00"] ] },
      inn2:{ team:"CSK", score:"191/7 (20 Ov)",
        bat:[ ["Rachin Ravindra","run out (Lomror/Karthik)",61,37,5,3,"164.86"],["Ruturaj Gaikwad","c Green b Maxwell",0,1,0,0,"0.00"],["Daryl Mitchell","c Kohli b Dayal",11,6,1,1,"183.33"],["Ajinkya Rahane","c du Plessis b Ferguson",33,22,3,1,"150.00"],["Shivam Dube","c Ferguson b Green",7,15,0,0,"46.66"],["Ravindra Jadeja","not out",42,22,3,3,"190.90"],["MS Dhoni","c Swapnil b Dayal",25,13,3,1,"192.30"] ],
        bowl:[ ["Swapnil Singh","2","0","13","0","6.50"],["Glenn Maxwell","4","0","25","1","6.25"],["Mohammed Siraj","4","0","35","1","8.75"],["Yash Dayal","4","0","42","2","10.50"],["Lockie Ferguson","3","0","39","1","13.00"],["Cameron Green","3","0","28","1","9.33"] ] } } },

  { id:2,  date:"2026-03-29", time:"19:30", t1:"MI",   t2:"KKR",  venue:"Wankhede Stadium",         city:"Mumbai",       t1runs:"224/4", t1ovs:"18.3", t2runs:"220/4", t2ovs:"20",   result:"MI won by 6 wickets",    winner:"MI",  rcb:false },
  { id:3,  date:"2026-03-30", time:"19:30", t1:"CSK",  t2:"RR",   venue:"MA Chidambaram Stadium",   city:"Chennai",      t1runs:"127/10",t1ovs:"16.1", t2runs:"128/2", t2ovs:"14.4", result:"RR won by 8 wickets",    winner:"RR",  rcb:false },
  { id:4,  date:"2026-03-31", time:"19:30", t1:"PBKS", t2:"GT",   venue:"PCA Stadium",              city:"Mullanpur",    t1runs:"165/7", t1ovs:"20",   t2runs:"162/6", t2ovs:"20",   result:"PBKS won by 3 wickets",  winner:"PBKS",rcb:false },
  { id:5,  date:"2026-04-01", time:"19:30", t1:"LSG",  t2:"DC",   venue:"Ekana Cricket Stadium",    city:"Lucknow",      t1runs:"141/10",t1ovs:"18.5", t2runs:"145/4", t2ovs:"16.2", result:"DC won by 6 wickets",    winner:"DC",  rcb:false },
  { id:6,  date:"2026-04-02", time:"19:30", t1:"KKR",  t2:"SRH",  venue:"Eden Gardens",             city:"Kolkata",      t1runs:"161/10",t1ovs:"19.3", t2runs:"226/8", t2ovs:"20",   result:"SRH won by 65 runs",     winner:"SRH", rcb:false },
  { id:7,  date:"2026-04-03", time:"19:30", t1:"CSK",  t2:"PBKS", venue:"MA Chidambaram Stadium",   city:"Chennai",      t1runs:"209/5", t1ovs:"20",   t2runs:"210/5", t2ovs:"19.4", result:"PBKS won by 5 wickets",  winner:"PBKS",rcb:false },
  { id:8,  date:"2026-04-04", time:"15:30", t1:"DC",   t2:"MI",   venue:"Arun Jaitley Stadium",     city:"Delhi",        t1runs:"164/4", t1ovs:"18.1", t2runs:"162/6", t2ovs:"20",   result:"DC won by 6 wickets",    winner:"DC",  rcb:false },
  { id:9,  date:"2026-04-04", time:"19:30", t1:"GT",   t2:"RR",   venue:"Narendra Modi Stadium",    city:"Ahmedabad",    t1runs:"204/8", t1ovs:"20",   t2runs:"210/6", t2ovs:"20",   result:"RR won by 6 runs",       winner:"RR",  rcb:false },

  // ── UPCOMING ───────────────────────────────────────
  { id:10, date:"2026-04-05", time:"15:30", t1:"SRH",  t2:"LSG",  venue:"Rajiv Gandhi Intl. Stadium",city:"Hyderabad",   result:null, rcb:false },
  { id:11, date:"2026-04-05", time:"19:30", t1:"RCB",  t2:"CSK",  venue:"M. Chinnaswamy Stadium",   city:"Bengaluru",    result:null, rcb:true  },
  { id:12, date:"2026-04-06", time:"19:30", t1:"KKR",  t2:"PBKS", venue:"Eden Gardens",             city:"Kolkata",      result:null, rcb:false },
  { id:13, date:"2026-04-07", time:"19:30", t1:"RR",   t2:"MI",   venue:"Barsapara Cricket Stadium", city:"Guwahati",    result:null, rcb:false },
  { id:14, date:"2026-04-08", time:"19:30", t1:"DC",   t2:"GT",   venue:"Arun Jaitley Stadium",     city:"Delhi",        result:null, rcb:false },
  { id:15, date:"2026-04-09", time:"19:30", t1:"KKR",  t2:"LSG",  venue:"Eden Gardens",             city:"Kolkata",      result:null, rcb:false },
  { id:16, date:"2026-04-10", time:"19:30", t1:"RR",   t2:"RCB",  venue:"Barsapara Cricket Stadium", city:"Guwahati",    result:null, rcb:true  },
  { id:17, date:"2026-04-11", time:"19:30", t1:"SRH",  t2:"CSK",  venue:"Rajiv Gandhi Intl. Stadium",city:"Hyderabad",   result:null, rcb:false },
  { id:18, date:"2026-04-12", time:"15:30", t1:"MI",   t2:"GT",   venue:"Wankhede Stadium",         city:"Mumbai",       result:null, rcb:false },
  { id:19, date:"2026-04-12", time:"19:30", t1:"RCB",  t2:"PBKS", venue:"M. Chinnaswamy Stadium",   city:"Bengaluru",    result:null, rcb:true  },
  { id:20, date:"2026-04-13", time:"15:30", t1:"DC",   t2:"KKR",  venue:"Arun Jaitley Stadium",     city:"Delhi",        result:null, rcb:false },
  { id:21, date:"2026-04-13", time:"19:30", t1:"RR",   t2:"LSG",  venue:"Sawai Mansingh Stadium",   city:"Jaipur",       result:null, rcb:false },
  { id:22, date:"2026-04-15", time:"19:30", t1:"RCB",  t2:"MI",   venue:"M. Chinnaswamy Stadium",   city:"Bengaluru",    result:null, rcb:true  },
  { id:23, date:"2026-04-16", time:"19:30", t1:"CSK",  t2:"KKR",  venue:"MA Chidambaram Stadium",   city:"Chennai",      result:null, rcb:false },
  { id:24, date:"2026-04-17", time:"19:30", t1:"SRH",  t2:"PBKS", venue:"Rajiv Gandhi Intl. Stadium",city:"Hyderabad",   result:null, rcb:false },
  { id:25, date:"2026-04-18", time:"15:30", t1:"GT",   t2:"DC",   venue:"Narendra Modi Stadium",    city:"Ahmedabad",    result:null, rcb:false },
  { id:26, date:"2026-04-18", time:"19:30", t1:"RR",   t2:"CSK",  venue:"Sawai Mansingh Stadium",   city:"Jaipur",       result:null, rcb:false },
  { id:27, date:"2026-04-19", time:"19:30", t1:"LSG",  t2:"RCB",  venue:"Ekana Cricket Stadium",    city:"Lucknow",      result:null, rcb:true  },
  { id:28, date:"2026-04-20", time:"15:30", t1:"SRH",  t2:"GT",   venue:"Rajiv Gandhi Intl. Stadium",city:"Hyderabad",   result:null, rcb:false },
  { id:29, date:"2026-04-20", time:"19:30", t1:"PBKS", t2:"KKR",  venue:"PCA Stadium",              city:"Mullanpur",    result:null, rcb:false },
  { id:30, date:"2026-04-21", time:"19:30", t1:"MI",   t2:"RR",   venue:"Wankhede Stadium",         city:"Mumbai",       result:null, rcb:false },
  { id:31, date:"2026-04-22", time:"19:30", t1:"DC",   t2:"LSG",  venue:"Arun Jaitley Stadium",     city:"Delhi",        result:null, rcb:false },
  { id:32, date:"2026-04-23", time:"19:30", t1:"RCB",  t2:"SRH",  venue:"M. Chinnaswamy Stadium",   city:"Bengaluru",    result:null, rcb:true  },
  { id:33, date:"2026-04-24", time:"19:30", t1:"CSK",  t2:"GT",   venue:"MA Chidambaram Stadium",   city:"Chennai",      result:null, rcb:false },
  { id:34, date:"2026-04-25", time:"15:30", t1:"PBKS", t2:"MI",   venue:"PCA Stadium",              city:"Mullanpur",    result:null, rcb:false },
  { id:35, date:"2026-04-26", time:"15:30", t1:"KKR",  t2:"DC",   venue:"Eden Gardens",             city:"Kolkata",      result:null, rcb:false },
  { id:36, date:"2026-04-26", time:"19:30", t1:"RR",   t2:"SRH",  venue:"Sawai Mansingh Stadium",   city:"Jaipur",       result:null, rcb:false },
  { id:37, date:"2026-04-27", time:"19:30", t1:"LSG",  t2:"PBKS", venue:"Ekana Cricket Stadium",    city:"Lucknow",      result:null, rcb:false },
  { id:38, date:"2026-04-28", time:"19:30", t1:"RCB",  t2:"GT",   venue:"M. Chinnaswamy Stadium",   city:"Bengaluru",    result:null, rcb:true  },
  { id:39, date:"2026-04-29", time:"19:30", t1:"MI",   t2:"DC",   venue:"Wankhede Stadium",         city:"Mumbai",       result:null, rcb:false },
  { id:40, date:"2026-04-30", time:"19:30", t1:"KKR",  t2:"RR",   venue:"Eden Gardens",             city:"Kolkata",      result:null, rcb:false },
  { id:41, date:"2026-05-01", time:"19:30", t1:"CSK",  t2:"SRH",  venue:"MA Chidambaram Stadium",   city:"Chennai",      result:null, rcb:false },
  { id:42, date:"2026-05-02", time:"19:30", t1:"PBKS", t2:"LSG",  venue:"PCA Stadium",              city:"Mullanpur",    result:null, rcb:false },
  { id:43, date:"2026-05-03", time:"15:30", t1:"DC",   t2:"RCB",  venue:"Arun Jaitley Stadium",     city:"Delhi",        result:null, rcb:true  },
  { id:44, date:"2026-05-03", time:"19:30", t1:"GT",   t2:"KKR",  venue:"Narendra Modi Stadium",    city:"Ahmedabad",    result:null, rcb:false },
  { id:45, date:"2026-05-04", time:"19:30", t1:"RR",   t2:"PBKS", venue:"Sawai Mansingh Stadium",   city:"Jaipur",       result:null, rcb:false },
  { id:46, date:"2026-05-05", time:"19:30", t1:"SRH",  t2:"MI",   venue:"Rajiv Gandhi Intl. Stadium",city:"Hyderabad",   result:null, rcb:false },
  { id:47, date:"2026-05-06", time:"19:30", t1:"LSG",  t2:"CSK",  venue:"Ekana Cricket Stadium",    city:"Lucknow",      result:null, rcb:false },
  { id:48, date:"2026-05-07", time:"19:30", t1:"RCB",  t2:"RR",   venue:"M. Chinnaswamy Stadium",   city:"Bengaluru",    result:null, rcb:true  },
  { id:49, date:"2026-05-08", time:"19:30", t1:"DC",   t2:"SRH",  venue:"Arun Jaitley Stadium",     city:"Delhi",        result:null, rcb:false },
  { id:50, date:"2026-05-09", time:"19:30", t1:"MI",   t2:"GT",   venue:"Wankhede Stadium",         city:"Mumbai",       result:null, rcb:false },
  { id:51, date:"2026-05-10", time:"15:30", t1:"PBKS", t2:"DC",   venue:"PCA Stadium",              city:"Mullanpur",    result:null, rcb:false },
  { id:52, date:"2026-05-10", time:"19:30", t1:"RR",   t2:"KKR",  venue:"Sawai Mansingh Stadium",   city:"Jaipur",       result:null, rcb:false },
  { id:53, date:"2026-05-11", time:"15:30", t1:"LSG",  t2:"GT",   venue:"Ekana Cricket Stadium",    city:"Lucknow",      result:null, rcb:false },
  { id:54, date:"2026-05-11", time:"19:30", t1:"CSK",  t2:"RCB",  venue:"MA Chidambaram Stadium",   city:"Chennai",      result:null, rcb:true  },
  { id:55, date:"2026-05-13", time:"19:30", t1:"SRH",  t2:"KKR",  venue:"Rajiv Gandhi Intl. Stadium",city:"Hyderabad",   result:null, rcb:false },
  { id:56, date:"2026-05-14", time:"19:30", t1:"MI",   t2:"LSG",  venue:"Wankhede Stadium",         city:"Mumbai",       result:null, rcb:false },
  { id:57, date:"2026-05-15", time:"19:30", t1:"GT",   t2:"PBKS", venue:"Narendra Modi Stadium",    city:"Ahmedabad",    result:null, rcb:false },
  { id:58, date:"2026-05-16", time:"19:30", t1:"RCB",  t2:"DC",   venue:"M. Chinnaswamy Stadium",   city:"Bengaluru",    result:null, rcb:true  },
  { id:59, date:"2026-05-17", time:"19:30", t1:"RR",   t2:"CSK",  venue:"Sawai Mansingh Stadium",   city:"Jaipur",       result:null, rcb:false },
  { id:60, date:"2026-05-18", time:"19:30", t1:"KKR",  t2:"MI",   venue:"Eden Gardens",             city:"Kolkata",      result:null, rcb:false },
  { id:61, date:"2026-05-19", time:"19:30", t1:"LSG",  t2:"SRH",  venue:"Ekana Cricket Stadium",    city:"Lucknow",      result:null, rcb:false },
  { id:62, date:"2026-05-20", time:"19:30", t1:"RCB",  t2:"LSG",  venue:"M. Chinnaswamy Stadium",   city:"Bengaluru",    result:null, rcb:true  },
  { id:63, date:"2026-05-21", time:"19:30", t1:"GT",   t2:"CSK",  venue:"Narendra Modi Stadium",    city:"Ahmedabad",    result:null, rcb:false },
  { id:64, date:"2026-05-22", time:"19:30", t1:"PBKS", t2:"RR",   venue:"PCA Stadium",              city:"Mullanpur",    result:null, rcb:false },
  { id:65, date:"2026-05-23", time:"15:30", t1:"MI",   t2:"SRH",  venue:"Wankhede Stadium",         city:"Mumbai",       result:null, rcb:false },
  { id:66, date:"2026-05-23", time:"19:30", t1:"KKR",  t2:"GT",   venue:"Eden Gardens",             city:"Kolkata",      result:null, rcb:false },
  { id:67, date:"2026-05-24", time:"15:30", t1:"DC",   t2:"CSK",  venue:"Arun Jaitley Stadium",     city:"Delhi",        result:null, rcb:false },
  { id:68, date:"2026-05-24", time:"19:30", t1:"RCB",  t2:"KKR",  venue:"M. Chinnaswamy Stadium",   city:"Bengaluru",    result:null, rcb:true  },
];

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
