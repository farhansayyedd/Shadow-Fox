'use strict';
/* ============================================================
   IPL 2026 — Full Scorecard Data + Live Auto-Update Polling
   Bat row: [name, how_out, runs, balls, 4s, 6s, sr]
   Bowl row: [name, overs, maidens, runs, wkts, econ]
   ============================================================ */

const EXTRA_SCORECARDS = {
  2: { // MI vs KKR — KKR 220/4 (20), MI 224/4 (18.3)
    toss: "MI won the toss and elected to field",
    inn1: { team:"KKR", score:"220/4 (20 Ov)",
      bat:[["Phil Salt","c Rohit b Bumrah",58,32,6,4,"181.25"],["Angkrish Raghuvanshi","c Hardik b Jasprit",45,28,4,2,"160.71"],["Venkatesh Iyer","not out",67,38,7,3,"176.32"],["Rinku Singh","not out",34,18,3,2,"188.89"],["Extras","(lb 2, w 14)"," "," "," "," ","16"]],
      bowl:[["Jasprit Bumrah","4","0","32","2","8.00"],["Hardik Pandya","4","0","48","1","12.00"],["Trent Boult","4","0","55","0","13.75"],["Ashwin","4","0","42","0","10.50"],["Deepak Chahar","4","0","43","1","10.75"]]},
    inn2: { team:"MI", score:"224/4 (18.3 Ov)",
      bat:[["Rohit Sharma","c Salt b Cummins",52,34,5,2,"152.94"],["Ishan Kishan","c Rinku b Vaibhav",78,45,8,4,"173.33"],["Suryakumar Yadav","not out",61,32,6,3,"190.63"],["Hardik Pandya","not out",24,14,2,1,"171.43"],["Extras","(w 9)"," "," "," "," ","9"]],
      bowl:[["Pat Cummins","4","0","52","1","13.00"],["Vaibhav Arora","4","0","44","1","11.00"],["Harshit Rana","3.3","0","48","1","13.71"],["Sunil Narine","4","0","46","1","11.50"],["Ramandeep Singh","3","0","34","0","11.33"]]}
  },
  3: { // CSK vs RR — CSK 127/10 (16.1), RR 128/2 (14.4)
    toss: "CSK won the toss and elected to bat",
    inn1: { team:"CSK", score:"127/10 (16.1 Ov)",
      bat:[["Ruturaj Gaikwad","c Samson b Chahal",23,19,3,0,"121.05"],["Devon Conway","b Avesh Khan",18,16,2,0,"112.50"],["Daryl Mitchell","c Jaiswal b Kuldeep",31,24,3,1,"129.17"],["MS Dhoni","lbw b Avesh Khan",22,15,2,1,"146.67"],["Ravindra Jadeja","run out (Buttler)",11,9,1,0,"122.22"],["Shivam Dube","c Samson b Trent Boult",8,7,1,0,"114.29"],["Sam Curran","b Trent Boult",5,5,1,0,"100.00"],["Extras","(b 2, lb 1, w 6)"," "," "," "," ","9"]],
      bowl:[["Trent Boult","4","0","22","2","5.50"],["Avesh Khan","3","0","24","2","8.00"],["Yuzvendra Chahal","4","0","28","3","7.00"],["Kuldeep Sen","3","0","32","1","10.67"],["Riyan Parag","1.1","0","12","2","10.29"],["Sandeep Sharma","1","0","8","0","8.00"]]},
    inn2: { team:"RR", score:"128/2 (14.4 Ov)",
      bat:[["Yashasvi Jaiswal","not out",67,44,7,3,"152.27"],["Jos Buttler","c Dhoni b Jadeja",48,28,4,2,"171.43"],["Sanju Samson","not out",13,12,1,0,"108.33"],["Extras","(lb 0, w 0)"," "," "," "," ","0"]],
      bowl:[["Deepak Chahar","3","0","28","0","9.33"],["Ravindra Jadeja","4","0","32","1","8.00"],["Sam Curran","3","0","35","0","11.67"],["Matheesha Pathirana","2.4","0","28","1","10.50"],["Noor Ahmad","2","0","5","0","2.50"]]}
  },
  4: { // PBKS vs GT — GT 162/6 (20), PBKS 165/7 (20)
    toss: "GT won the toss and elected to bat",
    inn1: { team:"GT", score:"162/6 (20 Ov)",
      bat:[["Shubman Gill","c Dhawan b Arshdeep",45,35,4,1,"128.57"],["Sai Sudharsan","c Bairstow b Bumrah",38,28,3,1,"135.71"],["David Miller","not out",42,25,4,2,"168.00"],["Vijay Shankar","run out (Curran)",22,14,2,1,"157.14"],["Rashid Khan","c Prabhsimran b Arshdeep",8,6,1,0,"133.33"],["Extras","(lb 1, w 7)"," "," "," "," ","8"]],
      bowl:[["Arshdeep Singh","4","0","28","2","7.00"],["Kagiso Rabada","4","0","38","1","9.50"],["Sam Curran","4","0","35","1","8.75"],["Yuzvendra Chahal","4","0","32","1","8.00"],["Harpreet Brar","4","0","29","1","7.25"]]},
    inn2: { team:"PBKS", score:"165/7 (20 Ov)",
      bat:[["Prabhsimran Singh","c Gill b Mohit",34,22,3,2,"154.55"],["Jonny Bairstow","c Miller b Rashid",52,33,5,3,"157.58"],["Shashank Singh","not out",45,28,4,2,"160.71"],["Sam Curran","not out",24,17,2,1,"141.18"],["Extras","(lb 2, w 8)"," "," "," "," ","10"]],
      bowl:[["Mohammed Siraj","4","0","32","2","8.00"],["Rashid Khan","4","0","28","2","7.00"],["Mohit Sharma","4","0","35","2","8.75"],["Vijay Shankar","4","0","42","1","10.50"],["Sai Kishore","4","0","28","0","7.00"]]}
  },
  5: { // LSG vs DC — LSG 141/10 (18.5), DC 145/4 (16.2)
    toss: "DC won the toss and elected to field",
    inn1: { team:"LSG", score:"141/10 (18.5 Ov)",
      bat:[["Quinton de Kock","c Warner b Axar",38,28,3,1,"135.71"],["KL Rahul","c Pant b Mukesh",45,36,4,1,"125.00"],["Nicholas Pooran","b Kuldeep",28,18,3,1,"155.56"],["Krunal Pandya","c Axar b Kuldeep",18,14,1,1,"128.57"],["Ayush Badoni","run out (Pant)",6,8,0,0,"75.00"],["Extras","(b 1, lb 1, w 4)"," "," "," "," ","6"]],
      bowl:[["Axar Patel","4","0","22","2","5.50"],["Kuldeep Yadav","4","0","28","3","7.00"],["Mukesh Kumar","3.5","0","32","2","8.35"],["Ishant Sharma","4","0","35","2","8.75"],["Harry Brook","3","0","23","1","7.67"]]},
    inn2: { team:"DC", score:"145/4 (16.2 Ov)",
      bat:[["David Warner","c Pooran b Bishnoi",62,38,7,2,"163.16"],["Abhishek Porel","run out (KL)",28,20,2,1,"140.00"],["Rishabh Pant","not out",38,22,4,1,"172.73"],["Axar Patel","not out",17,12,1,1,"141.67"],["Extras","(lb 0, w 0)"," "," "," "," ","0"]],
      bowl:[["Yash Thakur","3.2","0","32","1","9.60"],["Ravi Bishnoi","4","0","35","1","8.75"],["Mohsin Khan","3","0","28","1","9.33"],["Krunal Pandya","3","0","28","1","9.33"],["Ayush Badoni","3","0","22","0","7.33"]]}
  },
  6: { // KKR vs SRH — SRH 226/8 (20), KKR 161/10 (19.3)
    toss: "SRH won the toss and elected to bat",
    inn1: { team:"SRH", score:"226/8 (20 Ov)",
      bat:[["Travis Head","c Rinku b Cummins",89,46,9,5,"193.48"],["Abhishek Sharma","b Vaibhav Arora",42,24,4,2,"175.00"],["Ishan Kishan","c Salt b Harshit",38,22,3,2,"172.73"],["Heinrich Klaasen","not out",35,18,3,2,"194.44"],["Nitish Reddy","run out (Rinku)",22,11,2,1,"200.00"],["Extras","(lb 1, w 0)"," "," "," "," ","0"]],
      bowl:[["Pat Cummins","4","0","38","1","9.50"],["Vaibhav Arora","4","0","42","2","10.50"],["Harshit Rana","4","0","55","2","13.75"],["Sunil Narine","4","0","48","1","12.00"],["Ramandeep Singh","4","0","43","2","10.75"]]},
    inn2: { team:"KKR", score:"161/10 (19.3 Ov)",
      bat:[["Phil Salt","c Head b Harshal",32,22,3,1,"145.45"],["Angkrish Raghuvanshi","b Cummins",18,14,2,0,"128.57"],["Venkatesh Iyer","c Klaasen b Nitish",45,32,4,1,"140.63"],["Rinku Singh","run out (Head)",28,20,2,1,"140.00"],["Sunil Narine","b Shahbaz",16,12,1,1,"133.33"],["Extras","(b 2, lb 5, w 15)"," "," "," "," ","22"]],
      bowl:[["Pat Cummins","4","0","28","2","7.00"],["Harshal Patel","4","0","32","2","8.00"],["Shahbaz Ahmed","3.3","0","25","3","7.14"],["Nitish Reddy","4","0","38","1","9.50"],["Jaydev Unadkat","4","0","38","2","9.50"]]}
  },
  7: { // CSK vs PBKS — CSK 209/5 (20), PBKS 210/5 (19.4)
    toss: "PBKS won the toss and elected to field",
    inn1: { team:"CSK", score:"209/5 (20 Ov)",
      bat:[["Ruturaj Gaikwad","not out",68,48,7,2,"141.67"],["Devon Conway","c Bairstow b Arshdeep",42,32,4,1,"131.25"],["Shivam Dube","not out",55,30,5,3,"183.33"],["Daryl Mitchell","run out (Curran)",26,15,2,1,"173.33"],["Extras","(lb 2, w 16)"," "," "," "," ","18"]],
      bowl:[["Arshdeep Singh","4","0","35","1","8.75"],["Kagiso Rabada","4","0","42","1","10.50"],["Sam Curran","4","0","38","1","9.50"],["Yuzvendra Chahal","4","0","48","2","12.00"],["Harpreet Brar","4","0","46","0","11.50"]]},
    inn2: { team:"PBKS", score:"210/5 (19.4 Ov)",
      bat:[["Prabhsimran Singh","c Conway b Jadeja",45,28,4,2,"160.71"],["Jonny Bairstow","c Dhoni b Mustafizur",72,44,7,3,"163.64"],["Shashank Singh","not out",52,30,5,2,"173.33"],["Sam Curran","not out",30,18,3,1,"166.67"],["Extras","(lb 1, w 10)"," "," "," "," ","11"]],
      bowl:[["Matheesha Pathirana","4","0","38","1","9.50"],["Ravindra Jadeja","4","0","32","1","8.00"],["Mustafizur Rahman","3.4","0","42","1","11.45"],["Noor Ahmad","4","0","52","1","13.00"],["Sam Curran","4","0","46","1","11.50"]]}
  },
  8: { // DC vs MI — MI 162/6 (20), DC 164/4 (18.1)
    toss: "DC won the toss and elected to field",
    inn1: { team:"MI", score:"162/6 (20 Ov)",
      bat:[["Rohit Sharma","c Pant b Axar",38,28,4,1,"135.71"],["Ishan Kishan","run out (Warner)",44,30,4,2,"146.67"],["Suryakumar Yadav","c Warner b Kuldeep",42,26,4,2,"161.54"],["Hardik Pandya","b Mukesh",22,15,2,1,"146.67"],["Naman Dhir","not out",10,9,1,0,"111.11"],["Extras","(lb 2, w 4)"," "," "," "," ","6"]],
      bowl:[["Kuldeep Yadav","4","0","30","2","7.50"],["Axar Patel","4","0","28","2","7.00"],["Mukesh Kumar","4","0","32","2","8.00"],["Ishant Sharma","4","0","38","0","9.50"],["Harry Brook","4","0","34","0","8.50"]]},
    inn2: { team:"DC", score:"164/4 (18.1 Ov)",
      bat:[["David Warner","c Rohit b Bumrah",52,36,5,2,"144.44"],["Abhishek Porel","c SKY b Hardik",38,25,3,2,"152.00"],["Rishabh Pant","not out",55,32,5,3,"171.88"],["Harry Brook","not out",19,13,2,0,"146.15"],["Extras","(lb 0, w 0)"," "," "," "," ","0"]],
      bowl:[["Jasprit Bumrah","4","0","28","1","7.00"],["Hardik Pandya","3.1","0","38","1","12.00"],["Trent Boult","4","0","42","1","10.50"],["Ashwin","4","0","32","1","8.00"],["Deepak Chahar","3","0","24","0","8.00"]]}
  },
  9: { // GT vs RR — RR 210/6 (20), GT 204/8 (20) — RR won by 6 runs
    toss: "RR won the toss and elected to bat",
    inn1: { team:"RR", score:"210/6 (20 Ov)",
      bat:[["Yashasvi Jaiswal","c Gill b Rashid",78,48,8,4,"162.50"],["Jos Buttler","c Miller b Mohit",55,34,5,3,"161.76"],["Sanju Samson","not out",48,28,4,2,"171.43"],["Shimron Hetmyer","not out",22,11,2,1,"200.00"],["Extras","(lb 1, w 6)"," "," "," "," ","7"]],
      bowl:[["Mohammed Siraj","4","0","38","1","9.50"],["Rashid Khan","4","0","32","2","8.00"],["Mohit Sharma","4","0","45","1","11.25"],["Vijay Shankar","4","0","50","1","12.50"],["Sai Kishore","4","0","45","1","11.25"]]},
    inn2: { team:"GT", score:"204/8 (20 Ov)",
      bat:[["Shubman Gill","b Chahal",62,42,6,3,"147.62"],["Sai Sudharsan","c Samson b Avesh",45,34,4,1,"132.35"],["David Miller","c Buttler b Boult",52,30,5,2,"173.33"],["Vijay Shankar","b Chahal",28,18,2,2,"155.56"],["Rahul Tewatia","b Avesh",8,6,1,0,"133.33"],["Extras","(lb 3, w 6)"," "," "," "," ","9"]],
      bowl:[["Trent Boult","4","0","35","1","8.75"],["Avesh Khan","4","0","38","2","9.50"],["Yuzvendra Chahal","4","0","42","3","10.50"],["Sandeep Sharma","4","0","45","1","11.25"],["Riyan Parag","4","0","44","1","11.00"]]}
  }
};

/* ── Inject scorecards into ALL_IPL_2026 ── */
(function injectScorecards() {
  if (typeof ALL_IPL_2026 === 'undefined') return;
  ALL_IPL_2026.forEach(m => {
    if (EXTRA_SCORECARDS[m.id] && !m.scorecard) {
      m.scorecard = EXTRA_SCORECARDS[m.id];
    }
  });
})();

/* ── Live Auto-Update via CricAPI ── */
const CRIC_API_KEY = '3812d023-8576-4422-bc75-9cd9c7160d14';
const LIVE_POLL_INTERVAL = 60 * 1000; // 60 seconds

async function fetchLiveMatchUpdates() {
  try {
    const res = await fetch(`https://api.cricapi.com/v1/matches?apikey=${CRIC_API_KEY}&offset=0`);
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
