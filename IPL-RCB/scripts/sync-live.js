#!/usr/bin/env node
/**
 * RCB Fan Zone — Live Data Sync
 * Scrapes cricketdata.org public match pages for all RCB IPL 2026 matches
 * Generates js/official-data.js
 *
 * Table structure per match page:
 *   Table 2: Inn1 batting (header row + batter rows)
 *   Table 3: Inn1 bowling (header row + bowler rows)
 *   Table 4: Inn1 catching stats (skip)
 *   (Tables 5/6 are extras/totals, skip)
 *   Table 7: Inn2 batting
 *   Table 8: Inn2 bowling
 *   Table 9: Inn2 catching (skip)
 *   Tables 10-11: empty
 *   Tables 12-13: squad lists (skip)
 *   Table 1 is a merged summary (skip, use individual tables instead)
 */

const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const sleep = ms => new Promise(r => setTimeout(r, ms));

// All RCB matches — [matchId, pageSlug+id, opponent]
const RCB_MATCHES = [
  { id: 1,  url: 'royal-challengers-bengaluru-vs-sunrisers-hyderabad-1st-match-indian-premier-league-2026-55fe0f15-6eb0-4ad5-835b-5564be4f6a21',    opp: 'SRH' },
  { id: 11, url: 'royal-challengers-bengaluru-vs-chennai-super-kings-11th-match-indian-premier-league-2026-e92727d0-61fc-4c6f-82ed-cde4789745a2',  opp: 'CSK' },
  { id: 16, url: 'rajasthan-royals-vs-royal-challengers-bengaluru-16th-match-indian-premier-league-2026-05a88a74-0e68-47d9-996b-257b3b1ebf8d',     opp: 'RR'  },
  { id: 20, url: 'mumbai-indians-vs-royal-challengers-bengaluru-20th-match-indian-premier-league-2026-11d553de-3b2a-4e58-9abd-4bb7d575595e',       opp: 'MI'  },
  { id: 23, url: 'royal-challengers-bengaluru-vs-lucknow-super-giants-23rd-match-indian-premier-league-2026-e8225a82-12c7-4bc8-8e40-4892f52d7d21', opp: 'LSG' },
  { id: 26, url: 'royal-challengers-bengaluru-vs-delhi-capitals-26th-match-indian-premier-league-2026-d9242d24-f86f-4dbd-8291-3b00eadcda4a',       opp: 'DC'  },
  { id: 34, url: 'royal-challengers-bengaluru-vs-gujarat-titans-34th-match-indian-premier-league-2026-bff622ad-fe85-46f0-8969-80a3df72face',       opp: 'GT'  },
  { id: 39, url: 'delhi-capitals-vs-royal-challengers-bengaluru-39th-match-indian-premier-league-2026-0ed37800-881a-401b-a1fe-f41adb244741',       opp: 'DC'  },
  { id: 42, url: 'gujarat-titans-vs-royal-challengers-bengaluru-42nd-match-indian-premier-league-2026-abe1482c-3e40-43c8-be6f-9da9da643111',       opp: 'GT'  },
  { id: 50, url: 'lucknow-super-giants-vs-royal-challengers-bengaluru-50th-match-indian-premier-league-2026-79770ea7-9819-4414-97fe-f01444aa8ccf', opp: 'LSG' },
  { id: 54, url: 'royal-challengers-bengaluru-vs-mumbai-indians-54th-match-indian-premier-league-2026-634ea924-b96f-478a-bd6f-48370174f344',       opp: 'MI'  },
  { id: 57, url: 'royal-challengers-bengaluru-vs-kolkata-knight-riders-57th-match-indian-premier-league-2026-ef86ee7b-dbea-4e3c-9bbf-af77da1ff223',opp: 'KKR' },
  { id: 61, url: 'punjab-kings-vs-royal-challengers-bengaluru-61st-match-indian-premier-league-2026-26e1c31e-1033-4d72-887e-2c6ccb09b82f',         opp: 'PBKS'},
  { id: 67, url: 'sunrisers-hyderabad-vs-royal-challengers-bengaluru-67th-match-indian-premier-league-2026-25c031c2-2776-48a7-824c-fe66e0e6cf48',  opp: 'SRH' },
];

// Full IPL 2026 schedule
const SCHEDULE = [
  { id:1,  date:'2026-03-28', time:'19:30', t1:'RCB',  t2:'SRH',  venue:'M. Chinnaswamy Stadium', city:'Bengaluru', rcb:true },
  { id:2,  date:'2026-03-29', time:'15:30', t1:'MI',   t2:'KKR',  venue:'Wankhede Stadium', city:'Mumbai', rcb:false },
  { id:3,  date:'2026-03-29', time:'19:30', t1:'RR',   t2:'CSK',  venue:'Sawai Mansingh Stadium', city:'Jaipur', rcb:false },
  { id:4,  date:'2026-03-30', time:'15:30', t1:'PBKS', t2:'GT',   venue:'New PCA Stadium', city:'Mullanpur', rcb:false },
  { id:5,  date:'2026-03-30', time:'19:30', t1:'LSG',  t2:'DC',   venue:'Ekana Cricket Stadium', city:'Lucknow', rcb:false },
  { id:6,  date:'2026-03-31', time:'19:30', t1:'KKR',  t2:'SRH',  venue:'Eden Gardens', city:'Kolkata', rcb:false },
  { id:7,  date:'2026-04-01', time:'19:30', t1:'CSK',  t2:'PBKS', venue:'MA Chidambaram Stadium', city:'Chennai', rcb:false },
  { id:8,  date:'2026-04-02', time:'19:30', t1:'DC',   t2:'MI',   venue:'Arun Jaitley Stadium', city:'Delhi', rcb:false },
  { id:9,  date:'2026-04-03', time:'19:30', t1:'GT',   t2:'RR',   venue:'Narendra Modi Stadium', city:'Ahmedabad', rcb:false },
  { id:10, date:'2026-04-04', time:'19:30', t1:'SRH',  t2:'LSG',  venue:'Rajiv Gandhi Intl. Cricket Stadium', city:'Hyderabad', rcb:false },
  { id:11, date:'2026-04-05', time:'15:30', t1:'RCB',  t2:'CSK',  venue:'M. Chinnaswamy Stadium', city:'Bengaluru', rcb:true },
  { id:12, date:'2026-04-05', time:'19:30', t1:'KKR',  t2:'PBKS', venue:'Eden Gardens', city:'Kolkata', rcb:false },
  { id:13, date:'2026-04-06', time:'15:30', t1:'RR',   t2:'MI',   venue:'Sawai Mansingh Stadium', city:'Jaipur', rcb:false },
  { id:14, date:'2026-04-06', time:'19:30', t1:'DC',   t2:'GT',   venue:'Arun Jaitley Stadium', city:'Delhi', rcb:false },
  { id:15, date:'2026-04-07', time:'19:30', t1:'KKR',  t2:'LSG',  venue:'Eden Gardens', city:'Kolkata', rcb:false },
  { id:16, date:'2026-04-08', time:'19:30', t1:'RR',   t2:'RCB',  venue:'Sawai Mansingh Stadium', city:'Jaipur', rcb:true },
  { id:17, date:'2026-04-09', time:'19:30', t1:'PBKS', t2:'SRH',  venue:'New PCA Stadium', city:'Mullanpur', rcb:false },
  { id:18, date:'2026-04-10', time:'19:30', t1:'CSK',  t2:'DC',   venue:'MA Chidambaram Stadium', city:'Chennai', rcb:false },
  { id:19, date:'2026-04-11', time:'19:30', t1:'LSG',  t2:'GT',   venue:'Ekana Cricket Stadium', city:'Lucknow', rcb:false },
  { id:20, date:'2026-04-12', time:'15:30', t1:'MI',   t2:'RCB',  venue:'Wankhede Stadium', city:'Mumbai', rcb:true },
  { id:21, date:'2026-04-12', time:'19:30', t1:'SRH',  t2:'RR',   venue:'Rajiv Gandhi Intl. Cricket Stadium', city:'Hyderabad', rcb:false },
  { id:22, date:'2026-04-13', time:'19:30', t1:'CSK',  t2:'KKR',  venue:'MA Chidambaram Stadium', city:'Chennai', rcb:false },
  { id:23, date:'2026-04-14', time:'19:30', t1:'RCB',  t2:'LSG',  venue:'M. Chinnaswamy Stadium', city:'Bengaluru', rcb:true },
  { id:24, date:'2026-04-15', time:'19:30', t1:'MI',   t2:'PBKS', venue:'Wankhede Stadium', city:'Mumbai', rcb:false },
  { id:25, date:'2026-04-16', time:'19:30', t1:'GT',   t2:'KKR',  venue:'Narendra Modi Stadium', city:'Ahmedabad', rcb:false },
  { id:26, date:'2026-04-17', time:'19:30', t1:'RCB',  t2:'DC',   venue:'M. Chinnaswamy Stadium', city:'Bengaluru', rcb:true },
  { id:27, date:'2026-04-18', time:'19:30', t1:'SRH',  t2:'CSK',  venue:'Rajiv Gandhi Intl. Cricket Stadium', city:'Hyderabad', rcb:false },
  { id:28, date:'2026-04-19', time:'15:30', t1:'KKR',  t2:'RR',   venue:'Eden Gardens', city:'Kolkata', rcb:false },
  { id:29, date:'2026-04-19', time:'19:30', t1:'PBKS', t2:'LSG',  venue:'New PCA Stadium', city:'Mullanpur', rcb:false },
  { id:30, date:'2026-04-20', time:'15:30', t1:'GT',   t2:'MI',   venue:'Narendra Modi Stadium', city:'Ahmedabad', rcb:false },
  { id:31, date:'2026-04-20', time:'19:30', t1:'SRH',  t2:'DC',   venue:'Rajiv Gandhi Intl. Cricket Stadium', city:'Hyderabad', rcb:false },
  { id:32, date:'2026-04-21', time:'19:30', t1:'LSG',  t2:'RR',   venue:'Ekana Cricket Stadium', city:'Lucknow', rcb:false },
  { id:33, date:'2026-04-22', time:'19:30', t1:'MI',   t2:'CSK',  venue:'Wankhede Stadium', city:'Mumbai', rcb:false },
  { id:34, date:'2026-04-23', time:'19:30', t1:'RCB',  t2:'GT',   venue:'M. Chinnaswamy Stadium', city:'Bengaluru', rcb:true },
  { id:35, date:'2026-04-24', time:'19:30', t1:'DC',   t2:'PBKS', venue:'Arun Jaitley Stadium', city:'Delhi', rcb:false },
  { id:36, date:'2026-04-25', time:'15:30', t1:'RR',   t2:'SRH',  venue:'Sawai Mansingh Stadium', city:'Jaipur', rcb:false },
  { id:37, date:'2026-04-25', time:'19:30', t1:'GT',   t2:'CSK',  venue:'Narendra Modi Stadium', city:'Ahmedabad', rcb:false },
  { id:38, date:'2026-04-26', time:'15:30', t1:'LSG',  t2:'KKR',  venue:'Ekana Cricket Stadium', city:'Lucknow', rcb:false },
  { id:39, date:'2026-04-26', time:'19:30', t1:'DC',   t2:'RCB',  venue:'Arun Jaitley Stadium', city:'Delhi', rcb:true },
  { id:40, date:'2026-04-27', time:'19:30', t1:'PBKS', t2:'RR',   venue:'New PCA Stadium', city:'Mullanpur', rcb:false },
  { id:41, date:'2026-04-28', time:'19:30', t1:'MI',   t2:'SRH',  venue:'Wankhede Stadium', city:'Mumbai', rcb:false },
  { id:42, date:'2026-04-29', time:'19:30', t1:'GT',   t2:'RCB',  venue:'Narendra Modi Stadium', city:'Ahmedabad', rcb:true },
  { id:43, date:'2026-04-30', time:'19:30', t1:'RR',   t2:'DC',   venue:'Sawai Mansingh Stadium', city:'Jaipur', rcb:false },
  { id:44, date:'2026-05-01', time:'19:30', t1:'CSK',  t2:'MI',   venue:'MA Chidambaram Stadium', city:'Chennai', rcb:false },
  { id:45, date:'2026-05-02', time:'15:30', t1:'SRH',  t2:'KKR',  venue:'Rajiv Gandhi Intl. Cricket Stadium', city:'Hyderabad', rcb:false },
  { id:46, date:'2026-05-02', time:'19:30', t1:'GT',   t2:'PBKS', venue:'Narendra Modi Stadium', city:'Ahmedabad', rcb:false },
  { id:47, date:'2026-05-03', time:'15:30', t1:'MI',   t2:'LSG',  venue:'Wankhede Stadium', city:'Mumbai', rcb:false },
  { id:48, date:'2026-05-03', time:'19:30', t1:'DC',   t2:'CSK',  venue:'Arun Jaitley Stadium', city:'Delhi', rcb:false },
  { id:49, date:'2026-05-04', time:'19:30', t1:'SRH',  t2:'PBKS', venue:'Rajiv Gandhi Intl. Cricket Stadium', city:'Hyderabad', rcb:false },
  { id:50, date:'2026-05-05', time:'19:30', t1:'LSG',  t2:'RCB',  venue:'Ekana Cricket Stadium', city:'Lucknow', rcb:true },
  { id:51, date:'2026-05-06', time:'19:30', t1:'DC',   t2:'KKR',  venue:'Arun Jaitley Stadium', city:'Delhi', rcb:false },
  { id:52, date:'2026-05-07', time:'19:30', t1:'RR',   t2:'GT',   venue:'Sawai Mansingh Stadium', city:'Jaipur', rcb:false },
  { id:53, date:'2026-05-08', time:'19:30', t1:'CSK',  t2:'LSG',  venue:'MA Chidambaram Stadium', city:'Chennai', rcb:false },
  { id:54, date:'2026-05-09', time:'15:30', t1:'RCB',  t2:'MI',   venue:'M. Chinnaswamy Stadium', city:'Bengaluru', rcb:true },
  { id:55, date:'2026-05-09', time:'19:30', t1:'PBKS', t2:'DC',   venue:'New PCA Stadium', city:'Mullanpur', rcb:false },
  { id:56, date:'2026-05-10', time:'19:30', t1:'GT',   t2:'SRH',  venue:'Narendra Modi Stadium', city:'Ahmedabad', rcb:false },
  { id:57, date:'2026-05-11', time:'15:30', t1:'RCB',  t2:'KKR',  venue:'M. Chinnaswamy Stadium', city:'Bengaluru', rcb:true },
  { id:58, date:'2026-05-11', time:'19:30', t1:'PBKS', t2:'MI',   venue:'New PCA Stadium', city:'Mullanpur', rcb:false },
  { id:59, date:'2026-05-12', time:'19:30', t1:'LSG',  t2:'CSK',  venue:'Ekana Cricket Stadium', city:'Lucknow', rcb:false },
  { id:60, date:'2026-05-13', time:'19:30', t1:'KKR',  t2:'GT',   venue:'Eden Gardens', city:'Kolkata', rcb:false },
  { id:61, date:'2026-05-14', time:'19:30', t1:'PBKS', t2:'RCB',  venue:'New PCA Stadium', city:'Mullanpur', rcb:true },
  { id:62, date:'2026-05-15', time:'19:30', t1:'DC',   t2:'RR',   venue:'Arun Jaitley Stadium', city:'Delhi', rcb:false },
  { id:63, date:'2026-05-16', time:'19:30', t1:'CSK',  t2:'SRH',  venue:'MA Chidambaram Stadium', city:'Chennai', rcb:false },
  { id:64, date:'2026-05-17', time:'15:30', t1:'RR',   t2:'LSG',  venue:'Sawai Mansingh Stadium', city:'Jaipur', rcb:false },
  { id:65, date:'2026-05-17', time:'19:30', t1:'KKR',  t2:'MI',   venue:'Eden Gardens', city:'Kolkata', rcb:false },
  { id:66, date:'2026-05-18', time:'19:30', t1:'CSK',  t2:'GT',   venue:'MA Chidambaram Stadium', city:'Chennai', rcb:false },
  { id:67, date:'2026-05-19', time:'19:30', t1:'SRH',  t2:'RCB',  venue:'Rajiv Gandhi Intl. Cricket Stadium', city:'Hyderabad', rcb:true },
  { id:68, date:'2026-05-20', time:'19:30', t1:'LSG',  t2:'PBKS', venue:'Ekana Cricket Stadium', city:'Lucknow', rcb:false },
  { id:69, date:'2026-05-21', time:'19:30', t1:'MI',   t2:'RR',   venue:'Wankhede Stadium', city:'Mumbai', rcb:false },
  { id:70, date:'2026-05-22', time:'19:30', t1:'KKR',  t2:'DC',   venue:'Eden Gardens', city:'Kolkata', rcb:false },
  { id:71, date:'2026-05-26', time:'19:30', t1:'TBD',  t2:'TBD',  venue:'TBD', city:'TBD', rcb:false },
  { id:72, date:'2026-05-27', time:'19:30', t1:'TBD',  t2:'TBD',  venue:'TBD', city:'TBD', rcb:false },
  { id:73, date:'2026-05-29', time:'19:30', t1:'TBD',  t2:'TBD',  venue:'TBD', city:'TBD', rcb:false },
  { id:74, date:'2026-06-01', time:'19:30', t1:'TBD',  t2:'TBD',  venue:'Narendra Modi Stadium', city:'Ahmedabad', rcb:false },
];

async function fetchPage(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122',
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        signal: AbortSignal.timeout(15000)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (e) {
      console.warn(`  ⚠ Attempt ${i+1}/3 failed: ${e.message}`);
      if (i < retries - 1) await sleep(2500);
    }
  }
  return null;
}

function parseBattingTable($, table) {
  const rows = [];
  $(table).find('tr').each((ri, tr) => {
    if (ri === 0) return; // skip header
    const cells = $(tr).find('td').map((_, td) => $(td).text().trim().replace(/\s+/g,' ')).get();
    if (cells.length < 5) return;
    const [name, dtype, bowler, catcher, runsStr, ballsStr, foursStr, sixesStr, srStr] = cells;
    if (!name || name === 'batsman') return;

    // Build dismissal string
    let dismissal = 'not out';
    if (dtype === 'catch') dismissal = `c ${catcher} b ${bowler}`;
    else if (dtype === 'bowled') dismissal = `b ${bowler}`;
    else if (dtype === 'lbw') dismissal = `lbw b ${bowler}`;
    else if (dtype === 'stumped') dismissal = `st ${catcher} b ${bowler}`;
    else if (dtype === 'run out') dismissal = `run out (${catcher})`;
    else if (dtype && dtype !== '') dismissal = dtype;

    const runs = parseInt(runsStr) || 0;
    const balls = parseInt(ballsStr) || 0;
    const fours = parseInt(foursStr) || 0;
    const sixes = parseInt(sixesStr) || 0;
    const sr = parseFloat(srStr) || 0;

    rows.push([name, dismissal, runs, balls, fours, sixes, sr.toFixed(2)]);
  });
  return rows;
}

function parseBowlingTable($, table) {
  const rows = [];
  $(table).find('tr').each((ri, tr) => {
    if (ri === 0) return; // skip header
    const cells = $(tr).find('td').map((_, td) => $(td).text().trim().replace(/\s+/g,' ')).get();
    if (cells.length < 5) return;
    // [Player, overs, maidens, runs, wickets, wides, noballs, economy]
    const [name, overs, maidens, runs, wickets, , , econ] = cells;
    if (!name || name === 'Player') return;
    if (isNaN(parseFloat(overs))) return;
    rows.push([name, overs, maidens || '0', runs, wickets, parseFloat(econ || 0).toFixed(2)]);
  });
  return rows;
}

function extractScoreFromHeader($, table) {
  // Table 0 (R0) has "TeamName Inning 1: 201/9 in 20 overs"
  // Or from the big merged table row 0 cell 0 and cell 1
  const firstRow = $(table).find('tr').first();
  const cells = firstRow.find('td').map((_, td) => $(td).text().trim()).get();
  // cells[0] = "Sunrisers Hyderabad Inning 1", cells[1] = "201/9 in 20 overs" 
  const scoreText = cells[1] || '';
  const m = scoreText.match(/(\d+\/\d+|\d+)\s+in\s+(\d+\.?\d*)\s+overs?/i);
  if (m) return `${m[1]} (${m[2]} Ov)`;
  return '';
}

function extractTeamFromHeader($, table) {
  const firstRow = $(table).find('tr').first();
  const cell = firstRow.find('td').first().text().trim();
  // "Sunrisers Hyderabad Inning 1" → "Sunrisers Hyderabad"
  const m = cell.match(/^(.+?)\s+Inning\s+\d/i);
  if (m) return m[1].trim();
  // fallback: strip last word if it looks like "Inning"
  return cell.replace(/\s+Inning\s+\d.*$/i, '').trim();
}

function teamShort(fullName) {
  const map = {
    'Royal Challengers Bengaluru': 'RCB', 'Royal Challengers': 'RCB',
    'Sunrisers Hyderabad': 'SRH', 'Chennai Super Kings': 'CSK',
    'Mumbai Indians': 'MI', 'Kolkata Knight Riders': 'KKR',
    'Rajasthan Royals': 'RR', 'Delhi Capitals': 'DC',
    'Punjab Kings': 'PBKS', 'Gujarat Titans': 'GT',
    'Lucknow Super Giants': 'LSG',
  };
  for (const [full, short] of Object.entries(map)) {
    if (fullName.includes(full)) return short;
  }
  return fullName.replace(/\s+/g,'').slice(0,4).toUpperCase();
}

function computeResult(inn1Team, inn1Score, inn2Team, inn2Score) {
  const m1 = inn1Score.match(/(\d+)\/(\d+)/);
  const m2 = inn2Score.match(/(\d+)\/(\d+)/);
  if (!m1 || !m2) return { result: '', winner: '' };
  const r1 = parseInt(m1[1]), r2 = parseInt(m2[1]), w2 = parseInt(m2[2]);
  if (r2 > r1) {
    return {
      result: `${inn2Team} won by ${10 - w2} wicket${10-w2!==1?'s':''}`,
      winner: inn2Team
    };
  } else if (r1 > r2) {
    return {
      result: `${inn1Team} won by ${r1 - r2} run${r1-r2!==1?'s':''}`,
      winner: inn1Team
    };
  }
  return { result: 'Match tied', winner: '' };
}

async function scrapeMatch(match) {
  const url = `https://cricketdata.org/cricket-data-formats/matches/${match.url}`;
  console.log(`\n📥 Match ${match.id} (vs ${match.opp})`);

  const html = await fetchPage(url);
  if (!html) return null;

  const $ = cheerio.load(html);
  const tables = $('table');

  console.log(`   Tables found: ${tables.length}`);
  if (tables.length < 9) {
    console.log('   ⚠ Not enough tables — match likely upcoming/in progress');
    return null;
  }

  // Extract innings data using the known table layout
  // Table 0 = big summary (has inning headers at R0 and R30)
  // Table 1 (idx 1) = Inn1 batting ; Table 2 (idx 2) = Inn1 bowling
  // Table 6 (idx 6) = Inn2 batting ; Table 7 (idx 7) = Inn2 bowling

  const bigTable = tables.eq(0);
  const inn1BatTable = tables.eq(1);
  const inn1BowlTable = tables.eq(2);
  const inn2BatTable = tables.eq(6);
  const inn2BowlTable = tables.eq(7);

  // Get team names + scores from big table header rows
  const bigRows = bigTable.find('tr');
  let inn1Team = '', inn1Score = '', inn2Team = '', inn2Score = '';

  bigRows.each((ri, tr) => {
    const cells = $(tr).find('td').map((_, td) => $(td).text().trim()).get();
    if (cells.length >= 2) {
      const c0 = cells[0], c1 = cells[1] || '';
      if (c0.match(/Inning\s+1/i)) {
        inn1Team = teamShort(c0.replace(/\s*Inning\s*\d.*/i,'').trim());
        const m = c1.match(/(\d+\/\d+|\d+)\s+in\s+(\d+\.?\d*)/i);
        if (m) inn1Score = `${m[1]} (${m[2]} Ov)`;
      }
      if (c0.match(/Inning\s+2/i) || (ri > 20 && c0.match(/Inning\s+1/i))) {
        if (ri > 20) {
          inn2Team = teamShort(c0.replace(/\s*Inning\s*\d.*/i,'').trim());
          const m = c1.match(/(\d+\/\d+|\d+)\s+in\s+(\d+\.?\d*)/i);
          if (m) inn2Score = `${m[1]} (${m[2]} Ov)`;
        }
      }
    }
  });

  // Better approach: scan all rows for inning headers
  let innHeaders = [];
  bigRows.each((ri, tr) => {
    const cells = $(tr).find('td').map((_, td) => $(td).text().trim()).get();
    if (!cells.length) return;
    if (cells[0] && cells[0].match(/Inning\s+\d/i)) {
      const teamRaw = cells[0].replace(/\s*Inning\s*\d.*/i, '').trim();
      const scoreRaw = cells[1] || '';
      const sm = scoreRaw.match(/(\d+\/?\d*)\s+in\s+(\d+\.?\d*)/i);
      innHeaders.push({
        team: teamShort(teamRaw),
        score: sm ? `${sm[1]} (${sm[2]} Ov)` : scoreRaw,
        row: ri
      });
    }
  });

  if (innHeaders.length >= 2) {
    inn1Team = innHeaders[0].team;
    inn1Score = innHeaders[0].score;
    inn2Team = innHeaders[1].team;
    inn2Score = innHeaders[1].score;
  } else if (innHeaders.length === 1) {
    inn1Team = innHeaders[0].team;
    inn1Score = innHeaders[0].score;
  }

  if (!inn1Team) {
    console.log('   ⚠ Could not find inning headers');
    return null;
  }

  const inn1Bat = parseBattingTable($, inn1BatTable);
  const inn1Bowl = parseBowlingTable($, inn1BowlTable);
  const inn2Bat = parseBattingTable($, inn2BatTable);
  const inn2Bowl = parseBowlingTable($, inn2BowlTable);

  console.log(`   Inn1: ${inn1Team} ${inn1Score} | Bat:${inn1Bat.length} Bowl:${inn1Bowl.length}`);
  console.log(`   Inn2: ${inn2Team} ${inn2Score} | Bat:${inn2Bat.length} Bowl:${inn2Bowl.length}`);

  if (inn1Bat.length === 0 && inn2Bat.length === 0) {
    console.log('   ⚠ No batting data parsed');
    return null;
  }

  // Compute result
  const { result, winner } = computeResult(inn1Team, inn1Score, inn2Team, inn2Score);

  // Look for POTM on page
  let potm = '';
  $('b,strong,h4,h3').each((_, el) => {
    const t = $(el).text().trim();
    if (t.toLowerCase().includes('player of the match') || t.toLowerCase().includes('potm')) {
      const next = $(el).next().text().trim();
      if (next && next.length < 50) potm = next;
    }
  });

  return {
    inn1: { team: inn1Team, score: inn1Score, bat: inn1Bat, bowl: inn1Bowl },
    inn2: { team: inn2Team, score: inn2Score, bat: inn2Bat, bowl: inn2Bowl },
    result,
    winner,
    potm,
  };
}

async function main() {
  console.log('🏏 RCB Fan Zone — IPL 2026 Live Scraper');
  console.log('📡 Source: cricketdata.org\n');

  // Scrape all RCB matches
  const scraped = {};
  for (const match of RCB_MATCHES) {
    const data = await scrapeMatch(match);
    if (data) scraped[match.id] = data;
    await sleep(1500);
  }

  console.log(`\n✅ Successfully scraped: ${Object.keys(scraped).length}/${RCB_MATCHES.length} RCB matches\n`);

  // Build output array
  const allMatches = SCHEDULE.map(m => {
    const s = scraped[m.id];
    const base = { id: m.id, date: m.date, time: m.time, t1: m.t1, t2: m.t2, venue: m.venue, city: m.city, rcb: m.rcb };

    if (s && s.inn1 && s.inn1.bat.length > 0) {
      const t1runs = s.inn1.score.split(' ')[0];
      const t1ovs = (s.inn1.score.match(/\((.+?) Ov\)/) || [])[1] || '20';
      const t2runs = s.inn2 ? s.inn2.score.split(' ')[0] : '';
      const t2ovs = s.inn2 ? ((s.inn2.score.match(/\((.+?) Ov\)/) || [])[1] || '20') : '';

      return {
        ...base,
        t1: s.inn1.team || m.t1,
        t2: s.inn2 ? s.inn2.team || m.t2 : m.t2,
        t1runs, t1ovs, t2runs, t2ovs,
        result: s.result || '',
        winner: s.winner || '',
        potm: s.potm || '',
        scorecard: {
          toss: '',
          inn1: { team: s.inn1.team, score: s.inn1.score, bat: s.inn1.bat, bowl: s.inn1.bowl },
          inn2: s.inn2 ? { team: s.inn2.team, score: s.inn2.score, bat: s.inn2.bat, bowl: s.inn2.bowl } : null,
        }
      };
    }
    return base;
  });

  // Write file
  const outPath = path.join(__dirname, '../js/official-data.js');
  const ts = new Date().toISOString();
  const out = `/* AUTO-GENERATED — ${ts}
 * Source: cricketdata.org (IPL 2026)
 * DO NOT EDIT MANUALLY — run: node scripts/sync-live.js
 */\n\nwindow.ALL_IPL_2026 = ${JSON.stringify(allMatches, null, 2)};\n`;

  fs.writeFileSync(outPath, out, 'utf8');
  console.log(`📝 Written: js/official-data.js`);
  console.log(`   ${allMatches.length} total matches | ${Object.keys(scraped).length} with live scorecards`);
  console.log('\n🚀 Run: git add . && git commit -m "sync: Live IPL 2026 data" && git push');
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });
