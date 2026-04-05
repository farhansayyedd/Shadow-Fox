'use strict';
/* ============================================================
   RCB Fan Zone — LIVE DATA SYSTEM (CricAPI Integration)
   
   Features:
   - Live fixtures from CricAPI
   - Automatic scorecard updates for completed matches
   - True countdown for upcoming RCB matches
   - Auto-update countdown when RCB finishes current match
   
   API Key: 3812d023-8576-4422-bc75-9cd9c7160d14
   ============================================================ */

const CRIC_API_KEY = '3812d023-8576-4422-bc75-9cd9c7160d14';
const SERIES_ID = 'ipl-2026'; // We'll use current matches and match info endpoints

// Polling intervals
const POLL_MATCHES = 30 * 1000;     // 30 seconds for live matches
const POLL_SERIES = 5 * 60 * 1000;  // 5 minutes for series data
const POLL_SCHEDULE = 60 * 60 * 1000; // 1 hour for schedule updates

// State
let liveMatches = [];
let upcomingRCBMatch = null;
let currentRCBMatch = null;
let countdownInterval = null;
let lastCountdownUpdate = null;

/* ============================================================
   1. FETCH LIVE FIXTURES FROM CRICAPI
   ============================================================ */

async function fetchSeriesMatches() {
  try {
    // Get current matches (includes live and recently completed)
    const currentRes = await fetch(`https://api.cricapi.com/v1/currentMatches?apikey=${CRIC_API_KEY}&offset=0`);
    if (!currentRes.ok) throw new Error('Current matches API failed');
    const currentData = await currentRes.json();
    
    if (currentData.data) {
      liveMatches = currentData.data.filter(m => {
        const name = (m.name || '').toLowerCase();
        return name.includes('ipl') || name.includes('indian premier league');
      });
      console.log('[LiveData] Fetched', liveMatches.length, 'IPL matches from CricAPI');
    }
    
    // Get series info for full schedule
    const seriesRes = await fetch(`https://api.cricapi.com/v1/series_info?apikey=${CRIC_API_KEY}&id=76b4f729-8cff-4df2-8d64-d96c1fb218ba`);
    if (seriesRes.ok) {
      const seriesData = await seriesRes.json();
      if (seriesData.data && seriesData.data.matchList) {
        updateFixturesFromSeries(seriesData.data.matchList);
      }
    }
    
    return liveMatches;
  } catch (e) {
    console.error('[LiveData] Error fetching series matches:', e.message);
    return [];
  }
}

// Alternative: Use match info endpoint for specific matches
async function fetchMatchInfo(matchId) {
  try {
    const res = await fetch(`https://api.cricapi.com/v1/match_info?apikey=${CRIC_API_KEY}&id=${matchId}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.data;
  } catch (e) {
    console.error('[LiveData] Error fetching match info:', e.message);
    return null;
  }
}

// Fetch scorecard for a match
async function fetchScorecard(matchId) {
  try {
    const res = await fetch(`https://api.cricapi.com/v1/match_scorecard?apikey=${CRIC_API_KEY}&id=${matchId}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.data;
  } catch (e) {
    console.error('[LiveData] Error fetching scorecard:', e.message);
    return null;
  }
}

/* ============================================================
   2. UPDATE FIXTURES FROM LIVE DATA
   ============================================================ */

function updateFixturesFromSeries(matchList) {
  if (!matchList || !Array.isArray(matchList)) return;
  
  matchList.forEach(apiMatch => {
    // Find corresponding match in ALL_IPL_2026
    const localMatch = findLocalMatch(apiMatch);
    if (!localMatch) return;
    
    // Update match data
    if (apiMatch.date) localMatch.date = apiMatch.date;
    if (apiMatch.dateTimeGMT) {
      const dt = new Date(apiMatch.dateTimeGMT);
      localMatch.time = dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
    }
    if (apiMatch.venue) localMatch.venue = apiMatch.venue;
    if (apiMatch.status) {
      // Check if match is complete
      const status = apiMatch.status.toLowerCase();
      if (status.includes('won') || status.includes('lost') || status.includes('tied') || status.includes('no result')) {
        localMatch.result = apiMatch.status;
        // Determine winner
        if (status.includes(localMatch.t1.toLowerCase())) localMatch.winner = localMatch.t1;
        else if (status.includes(localMatch.t2.toLowerCase())) localMatch.winner = localMatch.t2;
        else if (status.includes('rcb')) localMatch.winner = 'RCB';
      }
    }
    
    // Update scores if available
    if (apiMatch.score && apiMatch.score.length >= 1) {
      localMatch.t1runs = formatScore(apiMatch.score[0]);
    }
    if (apiMatch.score && apiMatch.score.length >= 2) {
      localMatch.t2runs = formatScore(apiMatch.score[1]);
    }
  });
  
  console.log('[LiveData] Updated fixtures from series data');
}

function findLocalMatch(apiMatch) {
  if (!apiMatch || !apiMatch.teams) return null;
  
  const teams = apiMatch.teams.map(t => t.toLowerCase());
  
  return ALL_IPL_2026.find(m => {
    const t1 = m.t1.toLowerCase();
    const t2 = m.t2.toLowerCase();
    return (teams.includes(t1) && teams.includes(t2)) ||
           (teams.some(t => t.includes(t1)) && teams.some(t => t.includes(t2)));
  });
}

function formatScore(scoreObj) {
  if (!scoreObj) return '';
  let str = '';
  if (scoreObj.r !== undefined) str += scoreObj.r;
  if (scoreObj.w !== undefined) str += '/' + scoreObj.w;
  if (scoreObj.o !== undefined) str += ' (' + scoreObj.o + ' Ov)';
  return str;
}

/* ============================================================
   3. AUTOMATIC SCORECARD UPDATES
   ============================================================ */

async function updateLiveScores() {
  try {
    // Get current matches
    const res = await fetch(`https://api.cricapi.com/v1/currentMatches?apikey=${CRIC_API_KEY}&offset=0`);
    if (!res.ok) return;
    const data = await res.json();
    if (!data.data) return;
    
    let updated = false;
    
    data.data.forEach(liveMatch => {
      const localMatch = findLocalMatch(liveMatch);
      if (!localMatch) return;
      
      // Check if this is RCB match
      const isRCB = localMatch.t1 === 'RCB' || localMatch.t2 === 'RCB';
      
      // Update live scores
      if (liveMatch.score && liveMatch.score.length > 0) {
        if (liveMatch.score[0]) localMatch.t1runs = formatScore(liveMatch.score[0]);
        if (liveMatch.score[1]) localMatch.t2runs = formatScore(liveMatch.score[1]);
      }
      
      // Check if match just completed
      const status = (liveMatch.status || '').toLowerCase();
      const isComplete = liveMatch.matchEnded || 
                          status.includes('won') || 
                          status.includes('lost') ||
                          status.includes('tied') ||
                          status.includes('no result') ||
                          status.includes('draw');
      
      if (isComplete && !localMatch.result) {
        // Match just finished - update result
        localMatch.result = liveMatch.status;
        
        // Determine winner
        if (status.includes(localMatch.t1.toLowerCase())) localMatch.winner = localMatch.t1;
        else if (status.includes(localMatch.t2.toLowerCase())) localMatch.winner = localMatch.t2;
        
        // If RCB match finished, trigger countdown update
        if (isRCB) {
          console.log('[LiveData] RCB match completed! Updating countdown...');
          handleRCBMatchComplete(localMatch);
        }
        
        // Try to fetch full scorecard for completed match
        if (liveMatch.id) {
          fetchAndStoreScorecard(liveMatch.id, localMatch);
        }
        
        updated = true;
        
        // Cache result
        cacheMatchResult(localMatch);
      }
      
      // Track current RCB match
      if (isRCB && !isComplete) {
        currentRCBMatch = localMatch;
      }
    });
    
    // Re-render if updated
    if (updated && typeof renderFixtures === 'function') {
      const statusFilter = document.querySelector('.fx-tab.active')?.dataset.filter || 'all';
      const teamFilter = document.getElementById('team-filter')?.value || 'all';
      renderFixtures('fixtures-list', statusFilter, teamFilter);
      
      // Also update home cards if on homepage
      if (typeof renderHomeCards === 'function') {
        const rcbMatches = ALL_IPL_2026.filter(m => m.rcb).slice(0, 3);
        renderHomeCards(rcbMatches, 'home-fixtures');
      }
    }
    
  } catch (e) {
    console.error('[LiveData] Error updating live scores:', e.message);
  }
}

async function fetchAndStoreScorecard(matchId, localMatch) {
  try {
    const scorecard = await fetchScorecard(matchId);
    if (scorecard && scorecard.scorecard) {
      localMatch.scorecard = convertCricapiScorecard(scorecard.scorecard);
      console.log('[LiveData] Full scorecard fetched for match', localMatch.id);
    }
  } catch (e) {
    console.error('[LiveData] Error fetching scorecard:', e.message);
  }
}

function convertCricapiScorecard(apiScorecard) {
  // Convert CricAPI format to our format
  const result = {
    toss: apiScorecard.toss || 'Toss information not available',
    inn1: { team: '', score: '', bat: [], bowl: [] },
    inn2: { team: '', score: '', bat: [], bowl: [] }
  };
  
  if (apiScorecard[0]) {
    const inn = apiScorecard[0];
    result.inn1.team = inn.inning || '';
    result.inn1.score = inn.totals || '';
    if (inn.batsman) {
      result.inn1.bat = inn.batsman.map(b => [
        b.batsman || '',
        b.dismissal || 'not out',
        b.r || '0',
        b.b || '0',
        b['4s'] || '0',
        b['6s'] || '0',
        b.sr || '0'
      ]);
    }
    if (inn.bowlers) {
      result.inn1.bowl = inn.bowlers.map(b => [
        b.bowler || '',
        b.o || '0',
        b.m || '0',
        b.r || '0',
        b.w || '0',
        b.eco || '0'
      ]);
    }
  }
  
  if (apiScorecard[1]) {
    const inn = apiScorecard[1];
    result.inn2.team = inn.inning || '';
    result.inn2.score = inn.totals || '';
    if (inn.batsman) {
      result.inn2.bat = inn.batsman.map(b => [
        b.batsman || '',
        b.dismissal || 'not out',
        b.r || '0',
        b.b || '0',
        b['4s'] || '0',
        b['6s'] || '0',
        b.sr || '0'
      ]);
    }
    if (inn.bowlers) {
      result.inn2.bowl = inn.bowlers.map(b => [
        b.bowler || '',
        b.o || '0',
        b.m || '0',
        b.r || '0',
        b.w || '0',
        b.eco || '0'
      ]);
    }
  }
  
  return result;
}

/* ============================================================
   4. TRUE COUNTDOWN FOR UPCOMING RCB MATCHES
   ============================================================ */

function findUpcomingRCBMatch() {
  const now = new Date();
  
  // Get all RCB matches that haven't been completed
  const upcoming = ALL_IPL_2026.filter(m => {
    if (!m.rcb) return false;
    if (m.result) return false; // Already completed
    const matchTime = new Date(m.date + 'T' + m.time + ':00+05:30');
    return matchTime > now;
  }).sort((a, b) => {
    const timeA = new Date(a.date + 'T' + a.time + ':00+05:30');
    const timeB = new Date(b.date + 'T' + b.time + ':00+05:30');
    return timeA - timeB;
  });
  
  return upcoming[0] || null;
}

function startTrueCountdown() {
  // Clear existing interval
  if (countdownInterval) clearInterval(countdownInterval);
  
  upcomingRCBMatch = findUpcomingRCBMatch();
  
  if (!upcomingRCBMatch) {
    // No upcoming RCB matches - show message
    updateCountdownUI(null);
    return;
  }
  
  console.log('[LiveData] Next RCB match:', upcomingRCBMatch.id, '-', upcomingRCBMatch.t1, 'vs', upcomingRCBMatch.t2);
  
  // Start countdown
  updateCountdownTick();
  countdownInterval = setInterval(updateCountdownTick, 1000);
}

function updateCountdownTick() {
  if (!upcomingRCBMatch) return;
  
  const matchTime = new Date(upcomingRCBMatch.date + 'T' + upcomingRCBMatch.time + ':00+05:30');
  const now = new Date();
  const diff = matchTime - now;
  
  if (diff <= 0) {
    // Match is starting now!
    updateCountdownUI({ live: true, match: upcomingRCBMatch });
    
    // Check if we need to find next match
    setTimeout(() => {
      startTrueCountdown();
    }, 60000); // Recheck after 1 minute
    
    return;
  }
  
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  
  updateCountdownUI({
    days,
    hours,
    minutes,
    seconds,
    match: upcomingRCBMatch
  });
}

function updateCountdownUI(data) {
  const els = [document.getElementById('countdown-wrap'), document.getElementById('next-countdown-box')].filter(Boolean);
  if (els.length === 0) return;
  
  if (!data) {
    // No upcoming matches
    els.forEach(el => {
      if (el.querySelector('.countdown-timer')) {
        el.querySelector('.countdown-timer').innerHTML = '<span style="color:var(--text-muted)">No upcoming RCB matches</span>';
      }
    });
    return;
  }
  
  const match = data.match;
  const vsText = match.t1 === 'RCB' ? `RCB vs ${match.t2}` : `${match.t1} vs RCB`;
  const dateStr = new Date(match.date + 'T' + match.time + ':00+05:30')
    .toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
  
  els.forEach(el => {
    // Update labels
    if (el.querySelector('.cdw-match')) el.querySelector('.cdw-match').textContent = vsText;
    if (el.querySelector('.cdw-venue')) el.querySelector('.cdw-venue').textContent = match.venue + ', ' + match.city;
    if (el.querySelector('.cdw-date')) el.querySelector('.cdw-date').textContent = dateStr + ' • ' + match.time + ' IST';
    if (el.querySelector('.countdown-label')) el.querySelector('.countdown-label').textContent = `NEXT MATCH: ${vsText}`;
    
    // Update timer
    const timer = el.querySelector('.cdw-timer') || el.querySelector('.countdown-timer');
    if (timer) {
      if (data.live) {
        timer.innerHTML = '<span style="color:var(--rcb-gold);font-weight:700">● MATCH IS LIVE NOW</span>';
      } else {
        // Update individual time units if they exist
        const dEl = el.querySelector('#cd-d');
        const hEl = el.querySelector('#cd-h');
        const mEl = el.querySelector('#cd-m');
        const sEl = el.querySelector('#cd-s');
        
        if (dEl) dEl.textContent = String(data.days).padStart(2, '0');
        if (hEl) hEl.textContent = String(data.hours).padStart(2, '0');
        if (mEl) mEl.textContent = String(data.minutes).padStart(2, '0');
        if (sEl) sEl.textContent = String(data.seconds).padStart(2, '0');
      }
    }
  });
}

/* ============================================================
   5. HANDLE RCB MATCH COMPLETION
   ============================================================ */

function handleRCBMatchComplete(completedMatch) {
  console.log('[LiveData] Handling RCB match completion:', completedMatch.id);
  
  // Clear current countdown
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
  
  // Find and start countdown to next match
  startTrueCountdown();
  
  // Show notification if supported
  if ('Notification' in window && Notification.permission === 'granted') {
    const won = completedMatch.winner === 'RCB';
    new Notification(won ? '🎉 RCB WON!' : '😔 RCB Match Over', {
      body: completedMatch.result,
      icon: 'images/rcb-logo.png'
    });
  }
}

/* ============================================================
   6. CACHING & PERSISTENCE
   ============================================================ */

function cacheMatchResult(match) {
  try {
    const cache = JSON.parse(localStorage.getItem('ipl2026_live_cache') || '{}');
    cache[match.id] = {
      result: match.result,
      winner: match.winner,
      t1runs: match.t1runs,
      t2runs: match.t2runs,
      scorecard: match.scorecard,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem('ipl2026_live_cache', JSON.stringify(cache));
  } catch (e) {
    console.error('[LiveData] Error caching result:', e.message);
  }
}

function loadCachedResults() {
  try {
    const cache = JSON.parse(localStorage.getItem('ipl2026_live_cache') || '{}');
    
    ALL_IPL_2026.forEach(match => {
      if (cache[match.id]) {
        const cached = cache[match.id];
        if (!match.result) match.result = cached.result;
        if (!match.winner) match.winner = cached.winner;
        if (!match.t1runs) match.t1runs = cached.t1runs;
        if (!match.t2runs) match.t2runs = cached.t2runs;
        if (!match.scorecard && cached.scorecard) match.scorecard = cached.scorecard;
      }
    });
    
    console.log('[LiveData] Loaded', Object.keys(cache).length, 'cached results');
  } catch (e) {
    console.error('[LiveData] Error loading cache:', e.message);
  }
}

/* ============================================================
   7. INITIALIZATION
   ============================================================ */

function initLiveDataSystem() {
  console.log('[LiveData] Initializing Live Data System...');
  
  // Load cached results first
  loadCachedResults();
  
  // Initial fetch
  fetchSeriesMatches().then(() => {
    updateLiveScores();
  });
  
  // Start countdown
  startTrueCountdown();
  
  // Set up polling intervals
  setInterval(updateLiveScores, POLL_MATCHES);      // Every 30s for live scores
  setInterval(fetchSeriesMatches, POLL_SCHEDULE);   // Every hour for schedule
  
  // Request notification permission
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
  
  console.log('[LiveData] System initialized successfully');
}

// Auto-init when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  if (typeof ALL_IPL_2026 !== 'undefined') {
    initLiveDataSystem();
  }
});

// Export for external use
window.RCBLiveData = {
  init: initLiveDataSystem,
  fetchSeriesMatches,
  fetchScorecard,
  updateLiveScores,
  startTrueCountdown,
  findUpcomingRCBMatch,
  getCurrentRCBMatch: () => currentRCBMatch,
  getUpcomingRCBMatch: () => upcomingRCBMatch
};
