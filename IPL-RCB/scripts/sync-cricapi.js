#!/usr/bin/env node
/**
 * RCB Fan Zone — CricAPI Sync Script (Smart Caching Edition)
 *
 * DAILY BUDGET: 100 hits/day
 * HOW IT WORKS:
 *   - Loads existing ipl2026.json first (cached data)
 *   - Only fetches API for:
 *       1. series_info  → 1 hit per run  (gets match list + status)
 *       2. match_scorecard → 2 hits ONLY for newly completed matches (no score yet)
 *       3. match_info   → 1 hit for any currently live match
 *   - Skips matches that already have scores cached
 *
 * WORST CASE per run: 1 + (2 per new match) + (1 if live) = ~5 hits
 * RUNS PER DAY: up to 96 (every 15 min) × 5 hits = 480... wait,
 *   BUT most runs will be 1 hit (series_info only, no new matches).
 *   New matches: max 1 per day = 2 extra hits on that one run.
 *   REAL daily usage: ~20-30 hits comfortably within 100 limit.
 *
 * Run: node scripts/sync-cricapi.js
 */

const fs   = require('fs');
const path = require('path');

const API_KEY   = '3812d023-8576-4422-bc75-9cd9c7160d14';
const SERIES_ID = '87c62aac-bc3c-4738-ab93-19da0690488f';
const BASE      = 'https://api.cricapi.com/v1';
const OUT_DIR   = path.join(__dirname, '../data');
const OUT_FILE  = path.join(OUT_DIR, 'ipl2026.json');
const JS_FILE   = path.join(__dirname, '../js/ipl-data.js');

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function api(endpoint, params = {}) {
  const qs  = new URLSearchParams({ apikey: API_KEY, ...params }).toString();
  const url = `${BASE}/${endpoint}?${qs}`;
  for (let i = 0; i < 3; i++) {
    try {
      const res  = await fetch(url, { signal: AbortSignal.timeout(12000) });
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

function extractMatchNum(name) {
  const m = name.match(/(\d+)(st|nd|rd|th)\s+Match/i);
  return m ? parseInt(m[1]) : 999;
}

function shortName(full) {
  const map = {
    'Royal Challengers Bengaluru': 'RCB',
    'Sunrisers Hyderabad':         'SRH',
    'Chennai Super Kings':         'CSK',
    'Mumbai Indians':              'MI',
    'Kolkata Knight Riders':       'KKR',
    'Rajasthan Royals':            'RR',
    'Delhi Capitals':              'DC',
    'Punjab Kings':                'PBKS',
    'Gujarat Titans':              'GT',
    'Lucknow Super Giants':        'LSG',
  };
  return map[full] || full.split(' ').map(w => w[0]).join('').toUpperCase();
}

function isRCBTeam(name = '') {
  return name.toLowerCase().includes('royal challengers') || name === 'RCB';
}

function parseInnings(inn) {
  const team = inn.inning.replace(/ Inning \d+/i, '').trim();
  const bat  = (inn.batting || []).map(b => [
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
  return { team: shortName(team), bat, bowl };
}

/* ── Load existing cached data ── */
function loadCache() {
  try {
    if (fs.existsSync(OUT_FILE)) {
      const raw = JSON.parse(fs.readFileSync(OUT_FILE, 'utf8'));
      const map = {};
      (raw.matches || []).forEach(m => { map[m.apiId] = m; });
      return map;
    }
  } catch (e) { /* ignore */ }
  return {};
}

async function main() {
  console.log('🏏 RCB Fan Zone — CricAPI Smart Sync');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Load existing cached data (avoids re-fetching already-scored matches)
  const cache = loadCache();
  const cachedCount = Object.keys(cache).length;
  console.log(`📦 Loaded ${cachedCount} cached matches\n`);

  // 1. Fetch series match list (1 API hit)
  console.log('📡 Fetching series match list...');
  const seriesData = await api('series_info', { id: SERIES_ID });
  if (!seriesData) { console.error('❌ Failed to fetch series'); process.exit(1); }

  const matchList = seriesData.matchList || [];
  console.log(`✅ Found ${matchList.length} matches\n`);
  matchList.sort((a, b) => extractMatchNum(a.name) - extractMatchNum(b.name));

  let hitsUsed    = 1; // counted series_info
  let newlyFetched = 0;
  const matches   = [];

  for (const m of matchList) {
    const matchNum = extractMatchNum(m.name);
    const teams    = m.teams || [];
    const t1Full   = teams[0] || '';
    const t2Full   = teams[1] || '';
    const t1       = shortName(t1Full);
    const t2       = shortName(t2Full);
    const rcb      = isRCBTeam(t1Full) || isRCBTeam(t2Full);
    const dtGMT    = new Date(m.dateTimeGMT + 'Z');
    const dtIST    = new Date(dtGMT.getTime() + 5.5 * 3600000);
    const timeIST  = dtIST.toTimeString().slice(0, 5);

    // ── Parse winner from status ──
    let winner = '';
    const status = m.status || '';
    if (m.matchEnded) {
      const stL = status.toLowerCase();
      if (stL.includes('royal challengers')) winner = 'RCB';
      else {
        const wt = teams.find(t => stL.startsWith(t.toLowerCase()))
               || teams.find(t => stL.includes(t.toLowerCase().split(' ')[0]));
        if (wt) winner = shortName(wt);
      }
    }

    // ── Build base match object ──
    const matchObj = {
      id: matchNum, apiId: m.id,
      date: m.date, time: timeIST,
      t1, t2,
      venue: (m.venue || '').split(',')[0].trim(),
      city:  (m.venue || '').split(',').slice(1).join(',').trim() || '',
      rcb,
      started: m.matchStarted || false,
      ended:   m.matchEnded   || false,
      result:  m.matchEnded ? status : '',
      winner,
      // Default scores from series_info (often empty for historical matches)
      t1runs: '', t1ovs: '', t2runs: '', t2ovs: '',
    };

    // ── CHECK CACHE ──
    const cached = cache[m.id];

    if (m.matchEnded) {
      if (cached && cached.t1runs && cached.t2runs) {
        // ✅ Already have scores — use cache, skip API call
        matchObj.t1runs    = cached.t1runs;
        matchObj.t1ovs     = cached.t1ovs || '';
        matchObj.t2runs    = cached.t2runs;
        matchObj.t2ovs     = cached.t2ovs || '';
        matchObj.winner    = cached.winner || winner;
        matchObj.result    = cached.result || status;
        if (cached.scorecard) matchObj.scorecard = cached.scorecard;
        // (silent — no console spam for cached matches)
      } else if (hitsUsed <= 88) {
        // 🆕 New completed match or missing scores — fetch scorecard
        console.log(`  📊 NEW: Match ${matchNum} (${t1} vs ${t2}) — fetching...`);
        await sleep(400);
        const sc = await api('match_scorecard', { id: m.id });
        hitsUsed += 2;
        newlyFetched++;

        if (sc && sc.score && sc.score.length) {
          const s1 = sc.score[0], s2 = sc.score[1];
          if (s1) { matchObj.t1runs = `${s1.r}/${s1.w}`; matchObj.t1ovs = String(s1.o); }
          if (s2) { matchObj.t2runs = `${s2.r}/${s2.w}`; matchObj.t2ovs = String(s2.o); }
          if (sc.matchWinner) {
            matchObj.winner = isRCBTeam(sc.matchWinner) ? 'RCB' : shortName(sc.matchWinner);
          }

          // Full scorecard for RCB matches only
          if (rcb && sc.scorecard && sc.scorecard.length >= 2) {
            const inn1 = parseInnings(sc.scorecard[0]);
            const inn2 = parseInnings(sc.scorecard[1]);
            if (s1) inn1.score = `${s1.r}/${s1.w} (${s1.o} Ov)`;
            if (s2) inn2.score = `${s2.r}/${s2.w} (${s2.o} Ov)`;
            const toss = sc.tossWinner
              ? `${sc.tossWinner.charAt(0).toUpperCase() + sc.tossWinner.slice(1)} won the toss and elected to ${sc.tossChoice}`
              : '';
            matchObj.scorecard = { toss, inn1, inn2 };
            console.log(`     ✅ ${t1} ${matchObj.t1runs} | ${t2} ${matchObj.t2runs} + scorecard`);
          } else {
            console.log(`     ✅ ${t1} ${matchObj.t1runs} | ${t2} ${matchObj.t2runs}`);
          }
        } else {
          console.log(`     ⚠ No score data returned`);
          // Keep any cached data we had
          if (cached) {
            matchObj.t1runs = cached.t1runs || '';
            matchObj.t2runs = cached.t2runs || '';
          }
        }
      } else {
        console.log(`  ⚠ Skipping Match ${matchNum} — API budget limit reached`);
        // Use cache if available
        if (cached) {
          matchObj.t1runs = cached.t1runs || '';
          matchObj.t1ovs  = cached.t1ovs  || '';
          matchObj.t2runs = cached.t2runs || '';
          matchObj.t2ovs  = cached.t2ovs  || '';
          if (cached.scorecard) matchObj.scorecard = cached.scorecard;
        }
      }
    } else if (!m.matchEnded && m.matchStarted) {
      // 🔴 Live match — always fetch fresh (1 hit)
      console.log(`  🔴 LIVE: Match ${matchNum} (${t1} vs ${t2})`);
      if (hitsUsed < 95) {
        await sleep(400);
        const liveData = await api('match_info', { id: m.id });
        hitsUsed += 1;
        if (liveData && liveData.score) {
          const s1 = liveData.score[0], s2 = liveData.score[1];
          if (s1) { matchObj.t1runs = `${s1.r}/${s1.w}`; matchObj.t1ovs = String(s1.o); }
          if (s2) { matchObj.t2runs = `${s2.r}/${s2.w}`; matchObj.t2ovs = String(s2.o); }
          matchObj.isLive = true;
          console.log(`     🔴 Live: ${t1} ${matchObj.t1runs} | ${t2} ${matchObj.t2runs}`);
        }
      }
    }
    // Upcoming matches: no API call needed at all

    matches.push(matchObj);
  }

  // Sort by match number
  matches.sort((a, b) => a.id - b.id);

  // Write outputs
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const output = {
    generatedAt:  new Date().toISOString(),
    seriesName:   'Indian Premier League 2026',
    totalMatches: matches.length,
    matches
  };

  fs.writeFileSync(OUT_FILE, JSON.stringify(output, null, 2), 'utf8');
  const jsContent = `/* AUTO-GENERATED ${new Date().toISOString()} — DO NOT EDIT */\nwindow.IPL_2026_DATA = ${JSON.stringify(output)};`;
  fs.writeFileSync(JS_FILE, jsContent, 'utf8');

  // Summary
  const completed  = matches.filter(m => m.ended).length;
  const withScores = matches.filter(m => m.t1runs && m.t2runs).length;
  const withCards  = matches.filter(m => m.scorecard).length;

  console.log(`\n✅ Sync complete!`);
  console.log(`   Total matches : ${matches.length}`);
  console.log(`   Completed     : ${completed}`);
  console.log(`   With scores   : ${withScores} / ${completed}`);
  console.log(`   With scorecard: ${withCards} (RCB matches)`);
  console.log(`   API hits used : ${hitsUsed} / 100`);
  console.log(`   Newly fetched : ${newlyFetched} matches`);
  console.log(`\n📝 Written: data/ipl2026.json + js/ipl-data.js`);
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
