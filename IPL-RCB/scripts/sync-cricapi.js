#!/usr/bin/env node
/**
 * RCB Fan Zone — CricAPI Sync Script
 * Fetches all IPL 2026 matches + RCB scorecards from CricAPI
 * Generates: data/ipl2026.json
 * Run: node scripts/sync-cricapi.js
 */

const fs = require('fs');
const path = require('path');

const API_KEY = '3812d023-8576-4422-bc75-9cd9c7160d14';
const SERIES_ID = '87c62aac-bc3c-4738-ab93-19da0690488f';
const BASE = 'https://api.cricapi.com/v1';
const OUT_DIR = path.join(__dirname, '../data');
const OUT_FILE = path.join(OUT_DIR, 'ipl2026.json');

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function api(endpoint, params = {}) {
  const qs = new URLSearchParams({ apikey: API_KEY, ...params }).toString();
  const url = `${BASE}/${endpoint}?${qs}`;
  for (let i = 0; i < 3; i++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(12000) });
      const json = await res.json();
      if (json.status === 'success') return json.data;
      if (json.status === 'failure') throw new Error(json.reason || 'API failure');
    } catch (e) {
      console.warn(`  Attempt ${i+1}/3 failed for ${endpoint}: ${e.message}`);
      if (i < 2) await sleep(2000);
    }
  }
  return null;
}

// Extract match number from name like "Delhi Capitals vs RCB, 39th Match..."
function extractMatchNum(name) {
  const m = name.match(/(\d+)(st|nd|rd|th)\s+Match/i);
  return m ? parseInt(m[1]) : 999;
}

// Map full team name to short code
function shortName(full) {
  const map = {
    'Royal Challengers Bengaluru': 'RCB',
    'Sunrisers Hyderabad': 'SRH',
    'Chennai Super Kings': 'CSK',
    'Mumbai Indians': 'MI',
    'Kolkata Knight Riders': 'KKR',
    'Rajasthan Royals': 'RR',
    'Delhi Capitals': 'DC',
    'Punjab Kings': 'PBKS',
    'Gujarat Titans': 'GT',
    'Lucknow Super Giants': 'LSG',
  };
  return map[full] || full.split(' ').map(w => w[0]).join('').toUpperCase();
}

function isRCBTeam(name) {
  return name.toLowerCase().includes('royal challengers') || name === 'RCB';
}

// Parse scorecard innings from CricAPI format
function parseInnings(inn) {
  const team = inn.inning.replace(' Inning 1', '').replace(' Inning 2', '').trim();
  const bat = (inn.batting || []).map(b => [
    b.batsman?.name || '',
    b['dismissal-text'] || 'not out',
    b.r ?? 0,
    b.b ?? 0,
    b['4s'] ?? 0,
    b['6s'] ?? 0,
    (b.sr ?? 0).toFixed(2)
  ]);
  const bowl = (inn.bowling || []).map(b => [
    b.bowler?.name || '',
    String(b.o ?? 0),
    String(b.m ?? 0),
    String(b.r ?? 0),
    String(b.w ?? 0),
    (b.eco ?? 0).toFixed(2)
  ]);
  return { team: shortName(team), bat, bowl };
}

async function main() {
  console.log('🏏 RCB Fan Zone — CricAPI Sync');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // 1. Fetch series match list
  console.log('📡 Fetching series match list...');
  const seriesData = await api('series_info', { id: SERIES_ID });
  if (!seriesData) { console.error('❌ Failed to fetch series'); process.exit(1); }

  const matchList = seriesData.matchList || [];
  console.log(`✅ Found ${matchList.length} matches\n`);

  // Sort by match number
  matchList.sort((a, b) => extractMatchNum(a.name) - extractMatchNum(b.name));

  // Build matches array
  const matches = [];
  let hitsUsed = 1;

  for (const m of matchList) {
    const matchNum = extractMatchNum(m.name);
    const teams = m.teams || [];
    const t1Full = teams[0] || '';
    const t2Full = teams[1] || '';
    const t1 = shortName(t1Full);
    const t2 = shortName(t2Full);
    const rcb = isRCBTeam(t1Full) || isRCBTeam(t2Full);
    const dtGMT = new Date(m.dateTimeGMT + 'Z');
    const dtIST = new Date(dtGMT.getTime() + 5.5 * 3600000);
    const timeIST = dtIST.toTimeString().slice(0, 5);

    // Parse score from matchList (series_info sometimes omits scores)
    let t1runs = '', t1ovs = '', t2runs = '', t2ovs = '';
    if (m.score && m.score.length) {
      // API returns scores in batting-order; map by inning name
      for (const s of m.score) {
        const inn = (s.inning || '').toLowerCase();
        if (inn.includes(t1Full.toLowerCase().split(' ')[0])) {
          t1runs = `${s.r}/${s.w}`; t1ovs = String(s.o);
        } else if (inn.includes(t2Full.toLowerCase().split(' ')[0])) {
          t2runs = `${s.r}/${s.w}`; t2ovs = String(s.o);
        } else if (!t1runs) {
          t1runs = `${s.r}/${s.w}`; t1ovs = String(s.o);
        } else {
          t2runs = `${s.r}/${s.w}`; t2ovs = String(s.o);
        }
      }
    }

    // Determine winner from status text
    let winner = '';
    const status = m.status || '';
    if (m.matchEnded) {
      const stL = status.toLowerCase();
      if (stL.includes('royal challengers')) winner = 'RCB';
      else {
        const winTeam = teams.find(t => stL.startsWith(t.toLowerCase()));
        if (winTeam) winner = shortName(winTeam);
        else {
          // Try partial match
          const winTeam2 = teams.find(t => stL.includes(t.toLowerCase().split(' ')[0]));
          if (winTeam2) winner = shortName(winTeam2);
        }
      }
    }

    const matchObj = {
      id: matchNum,
      apiId: m.id,
      date: m.date,
      time: timeIST,
      t1, t2,
      venue: (m.venue || '').split(',')[0].trim(),
      city: (m.venue || '').split(',').slice(1).join(',').trim() || '',
      rcb,
      started: m.matchStarted || false,
      ended: m.matchEnded || false,
      t1runs, t1ovs, t2runs, t2ovs,
      result: m.matchEnded ? status : '',
      winner,
    };

    // Fetch scorecard for ALL completed matches (to get scores) — RCB matches get full bat/bowl data
    if (m.matchEnded && hitsUsed < 88) {
      await sleep(400);
      const sc = await api('match_scorecard', { id: m.id });
      hitsUsed += 2;

      if (sc && sc.score && sc.score.length) {
        // Always update scores from scorecard (accurate for all matches)
        const s1 = sc.score[0], s2 = sc.score[1];
        if (s1) { matchObj.t1runs = `${s1.r}/${s1.w}`; matchObj.t1ovs = String(s1.o); }
        if (s2) { matchObj.t2runs = `${s2.r}/${s2.w}`; matchObj.t2ovs = String(s2.o); }
        if (sc.matchWinner) {
          matchObj.winner = isRCBTeam(sc.matchWinner) ? 'RCB' : shortName(sc.matchWinner);
        }

        // For RCB matches: also store full batting/bowling scorecard
        if (rcb && sc.scorecard && sc.scorecard.length >= 2) {
          const inn1 = parseInnings(sc.scorecard[0]);
          const inn2 = parseInnings(sc.scorecard[1]);
          if (s1) inn1.score = `${s1.r}/${s1.w} (${s1.o} Ov)`;
          if (s2) inn2.score = `${s2.r}/${s2.w} (${s2.o} Ov)`;
          const toss = sc.tossWinner
            ? `${sc.tossWinner.charAt(0).toUpperCase() + sc.tossWinner.slice(1)} won the toss and elected to ${sc.tossChoice}`
            : '';
          matchObj.scorecard = { toss, inn1, inn2 };
          console.log(`  ✅ Match ${matchNum} (${t1} vs ${t2}): ${inn1.team} ${inn1.score} | ${inn2.team} ${inn2.score}`);
        } else {
          console.log(`  ✅ Match ${matchNum} (${t1} vs ${t2}): ${matchObj.t1runs} | ${matchObj.t2runs}`);
        }
      } else {
        console.log(`  ⚠ Match ${matchNum} (${t1} vs ${t2}): no scorecard`);
      }
    } else if (!m.matchEnded && m.matchStarted && rcb && hitsUsed < 90) {
      // Live RCB match — fetch current scores
      console.log(`  🔴 LIVE: Match ${matchNum} (${t1} vs ${t2})`);
      await sleep(400);
      const liveData = await api('match_info', { id: m.id });
      hitsUsed += 1;
      if (liveData && liveData.score) {
        const s1 = liveData.score[0], s2 = liveData.score[1];
        if (s1) { matchObj.t1runs = `${s1.r}/${s1.w}`; matchObj.t1ovs = String(s1.o); }
        if (s2) { matchObj.t2runs = `${s2.r}/${s2.w}`; matchObj.t2ovs = String(s2.o); }
        matchObj.isLive = true;
      }
    }

    matches.push(matchObj);
  }

  // Sort final output by match number
  matches.sort((a, b) => a.id - b.id);

  // Ensure data directory exists
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const output = {
    generatedAt: new Date().toISOString(),
    seriesName: 'Indian Premier League 2026',
    totalMatches: matches.length,
    matches
  };

  // Write JSON (for fetch() on GitHub Pages)
  fs.writeFileSync(OUT_FILE, JSON.stringify(output, null, 2), 'utf8');

  // Write JS global (fallback for file:// protocol & instant load)
  const jsOut = path.join(__dirname, '../js/ipl-data.js');
  const jsContent = `/* AUTO-GENERATED ${new Date().toISOString()} — DO NOT EDIT */\nwindow.IPL_2026_DATA = ${JSON.stringify(output)};`;
  fs.writeFileSync(jsOut, jsContent, 'utf8');

  const completed = matches.filter(m => m.ended).length;
  const rcbMatches = matches.filter(m => m.rcb).length;
  const rcbCompleted = matches.filter(m => m.rcb && m.ended).length;
  const withScorecards = matches.filter(m => m.scorecard).length;

  console.log(`\n✅ Done!`);
  console.log(`   Total: ${matches.length} matches`);
  console.log(`   Completed: ${completed}`);
  console.log(`   RCB: ${rcbMatches} matches (${rcbCompleted} played)`);
  console.log(`   Scorecards: ${withScorecards}`);
  console.log(`   API hits used: ${hitsUsed}/100`);
  console.log(`\n📝 Written: data/ipl2026.json + js/ipl-data.js`);
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
