'use strict';
/* ============================================================
   IPL 2026 — RCB Match Scorecard Data
   Only contains REAL RCB matches from official IPL 2026 schedule
   ============================================================ */

const RCB_SCORECARDS = {
  1: { // RCB vs SRH — March 28, 2026 — RCB won by 6 wickets
    toss: "RCB won the toss and elected to field",
    inn1: { team:"SRH", score:"201/9 (20 Ov)",
      bat:[
        ["Travis Head","c Salt b Duffy",11,9,2,0,"122.22"],
        ["Abhishek Sharma","c Jitesh b Duffy",7,8,0,1,"87.50"],
        ["Ishan Kishan","c Salt b Singh",80,38,8,5,"210.53"],
        ["Nitish Kumar Reddy","c Singh b Duffy",1,6,0,0,"16.67"],
        ["Heinrich Klaasen","c Salt b Shepherd",31,22,2,1,"140.91"],
        ["Salil Arora","c Padikkal b Sharma",9,6,0,1,"150.00"],
        ["Aniket Verma","c Kohli b Shepherd",43,18,3,4,"238.89"],
        ["Harsh Dubey","c Padikkal b Shepherd",3,3,0,0,"100.00"],
        ["Harshal Patel","c Padikkal b Kumar",0,2,0,0,"0.00"],
        ["David Payne","not out",6,5,0,0,"120.00"],
        ["Jaydev Unadkat","not out",4,3,0,0,"133.33"],
        ["Extras","(b 0, lb 2, w 14, nb 0)"," "," "," "," ","16"]
      ],
      bowl:[
        ["Jacob Duffy","4","0","22","3","5.50"],
        ["Bhuvneshwar Kumar","4","0","31","1","7.80"],
        ["Abhinandan Singh","3","0","38","1","12.70"],
        ["Romario Shepherd","4","0","54","3","13.50"],
        ["Suyash Sharma","3","0","28","1","9.30"],
        ["Krunal Pandya","2","0","26","0","13.00"]
      ]
    },
    inn2: { team:"RCB", score:"203/4 (15.4 Ov)",
      bat:[
        ["Philip Salt","c Klaasen b Unadkat",8,7,2,0,"114.29"],
        ["Virat Kohli","not out",69,38,5,5,"181.58"],
        ["Devdutt Padikkal","c Klaasen b Dubey",61,26,7,4,"234.62"],
        ["Rajat Patidar","c Dubey b Payne",31,12,2,3,"258.33"],
        ["Jitesh Sharma","c Unadkat b Payne",0,1,0,0,"0.00"],
        ["Tim David","not out",16,10,1,1,"160.00"],
        ["Extras","(b 0, lb 2, w 16, nb 0)"," "," "," "," ","18"]
      ],
      bowl:[
        ["Nitish Kumar Reddy","2","0","19","0","9.50"],
        ["Jaydev Unadkat","3","0","29","1","9.70"],
        ["David Payne","3","0","35","2","11.70"],
        ["Harsh Dubey","3","0","35","1","11.70"],
        ["Eshan Malinga","2","0","35","0","17.50"],
        ["Harshal Patel","2.4","0","39","0","14.60"]
      ]
    }
  }
  // Additional RCB matches will be added as the tournament progresses
  // Matches 11, 16, 20, 23, 26, 34, 39, 42, 50, 54, 57, 61, 67 are RCB matches
};

/* ── Inject scorecards into ALL_IPL_2026 ── */
(function injectScorecards() {
  if (typeof ALL_IPL_2026 === 'undefined') return;
  ALL_IPL_2026.forEach(m => {
    if (RCB_SCORECARDS[m.id] && !m.scorecard) {
      m.scorecard = RCB_SCORECARDS[m.id];
    }
  });
})();

/* ── Live Auto-Update via CricAPI ── */
const CRIC_API_KEY = '3812d023-8576-4422-bc75-9cd9c7160d14';
const LIVE_POLL_INTERVAL = 60 * 1000; // 60 seconds

async function fetchLiveMatchUpdates() {
  try {
    const res = await fetch(`https://api.cricapi.com/v1/currentMatches?apikey=${CRIC_API_KEY}&offset=0`);
    if (!res.ok) return;
    const data = await res.json();
    if (!data.data) return;

    let updated = false;
    data.data.forEach(live => {
      const name = (live.name || '').toLowerCase();
      // Find matching match in our fixture list
      const match = ALL_IPL_2026.find(m => {
        if (m.result) return false; // already has result
        const t1 = m.t1.toLowerCase(), t2 = m.t2.toLowerCase();
        return name.includes(t1) && name.includes(t2);
      });
      if (!match) return;

      // If match is complete, update result
      if (live.matchEnded || live.status?.toLowerCase().includes('won')) {
        const status = live.status || '';
        // Determine winner
        const t1win = status.toLowerCase().includes(match.t1.toLowerCase());
        match.result = status;
        match.winner = t1win ? match.t1 : match.t2;
        // Update scores if available
        if (live.score && live.score.length >= 2) {
          match.t1runs = live.score[0]?.r + '/' + live.score[0]?.w + ' (' + live.score[0]?.o + ')';
          match.t2runs = live.score[1]?.r + '/' + live.score[1]?.w + ' (' + live.score[1]?.o + ')';
        }
        updated = true;
        console.log(`[Live Update] Match ${match.id} result updated: ${status}`);
        // Save to localStorage for persistence
        try {
          const cache = JSON.parse(localStorage.getItem('ipl2026results') || '{}');
          cache[match.id] = { result: match.result, winner: match.winner, t1runs: match.t1runs, t2runs: match.t2runs };
          localStorage.setItem('ipl2026results', JSON.stringify(cache));
        } catch(e) {}
      }
    });

    if (updated) {
      // Re-render fixtures and update countdown
      const statusFilter = document.querySelector('.fx-tab.active')?.dataset.filter || 'all';
      const teamFilter = document.getElementById('team-filter')?.value || 'all';
      if (typeof renderFixtures === 'function') renderFixtures('fixtures-list', statusFilter, teamFilter);
      if (typeof startCountdown === 'function') startCountdown();
    }
  } catch(e) {
    console.log('[Live Poll] API unavailable:', e.message);
  }
}

/* ── Load cached results from localStorage on startup ── */
function loadCachedResults() {
  try {
    const cache = JSON.parse(localStorage.getItem('ipl2026results') || '{}');
    ALL_IPL_2026.forEach(m => {
      if (cache[m.id] && !m.result) {
        m.result = cache[m.id].result;
        m.winner = cache[m.id].winner;
        m.t1runs = cache[m.id].t1runs || m.t1runs;
        m.t2runs = cache[m.id].t2runs || m.t2runs;
      }
    });
  } catch(e) {}
}

/* ── Init live polling ── */
document.addEventListener('DOMContentLoaded', () => {
  if (typeof ALL_IPL_2026 !== 'undefined') {
    loadCachedResults();
    injectScorecards();
    // Poll immediately for latest updates, then every 60s
    setTimeout(fetchLiveMatchUpdates, 2000);
    setInterval(fetchLiveMatchUpdates, LIVE_POLL_INTERVAL);
  }
});
