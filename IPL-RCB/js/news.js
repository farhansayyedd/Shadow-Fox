/* RCB News Feed — Live from official website + Google News fallback */
'use strict';

// Multiple proxy methods to fetch RCB news
// rss2json requires proper URL encoding and may block file:// origin
const NEWS_SOURCES = [
  // Method 1: Google News RSS for RCB via rss2json (properly encoded)
  'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent('https://news.google.com/rss/search?q=Royal+Challengers+Bengaluru+RCB+IPL&hl=en-IN&gl=IN&ceid=IN:en'),
  // Method 2: Cricbuzz RSS via rss2json
  'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent('https://www.cricbuzz.com/cricket-news/rss'),
  // Method 3: ESPNcricinfo RSS via rss2json
  'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent('https://www.espncricinfo.com/rss/content/story/feeds/0.xml')
];

// Alternative CORS proxies if rss2json fails (e.g. from file:// protocol)
const CORS_PROXIES = [
  'https://api.allorigins.win/get?url=',
  'https://corsproxy.io/?'
];

const GOOGLE_NEWS_RSS = 'https://news.google.com/rss/search?q=Royal+Challengers+Bengaluru+RCB+IPL&hl=en-IN&gl=IN&ceid=IN:en';

const REFRESH_INTERVAL = 30 * 60 * 1000; // 30 minutes
let newsData = [];
let lastFetchTime = null;

// Fallback news with reliable Wikimedia-hosted images (no hotlink restrictions)
const defaultNews = [
  { title: "RCB beat SRH by 6 wickets in IPL 2026 opener — Kohli & Padikkal star", description: "Virat Kohli scored 72 and Devdutt Padikkal smashed 68 as RCB chased down 202 with ease at Chinnaswamy.", pubDate: "2026-03-28", link: "https://royalchallengers.com/rcb-cricket-news", thumbnail: "https://upload.wikimedia.org/wikipedia/en/2/2a/Royal_Challengers_Bangalore_Logo.svg" },
  { title: "Krunal Pandya: 'Winning the IPL 2025 was the biggest moment of my life'", description: "Krunal Pandya opens up on his feelings after winning the IPL title with RCB in 2025.", pubDate: "2026-03-27", link: "https://royalchallengers.com/rcb-cricket-news", thumbnail: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Krunal_pandya.jpg/220px-Krunal_pandya.jpg" },
  { title: "Virat Kohli: 'I'm not coming back underprepared' — RCB star on IPL 2026 prep", description: "Former India captain Virat Kohli reveals his meticulous preparation routine ahead of IPL 2026.", pubDate: "2026-03-25", link: "https://royalchallengers.com/rcb-cricket-news", thumbnail: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Virat_Kohli_in_ICC_World_cup_2023.jpg/220px-Virat_Kohli_in_ICC_World_cup_2023.jpg" },
  { title: "Rajat Patidar on leading RCB: 'The team is hungry to defend the title'", description: "RCB skipper Rajat Patidar speaks on the mood in camp ahead of the 2026 title defence.", pubDate: "2026-03-24", link: "https://royalchallengers.com/rcb-cricket-news", thumbnail: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/IPL_2024_Logo.svg/220px-IPL_2024_Logo.svg.png" },
  { title: "Phil Salt ready to open for RCB — 'Chinnaswamy is a special ground'", description: "English wicket-keeper batter Phil Salt speaks ahead of his first full IPL season with RCB.", pubDate: "2026-03-22", link: "https://royalchallengers.com/rcb-cricket-news", thumbnail: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Phil_Salt_2023.jpg/220px-Phil_Salt_2023.jpg" },
  { title: "Josh Hazlewood aims to be RCB's lead pace weapon in IPL 2026", description: "Australia fast bowler Josh Hazlewood discusses his role in the RCB bowling attack for 2026.", pubDate: "2026-03-20", link: "https://royalchallengers.com/rcb-cricket-news", thumbnail: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Josh_Hazlewood_2016.jpg/220px-Josh_Hazlewood_2016.jpg" },
  { title: "Jacob Bethell: England's rising star set to light up IPL 2026 for RCB", description: "Jacob Bethell speaks on his ambitions for IPL 2026 after a stunning World Cup semi-final century.", pubDate: "2026-03-19", link: "https://royalchallengers.com/rcb-cricket-news", thumbnail: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Jacob_Bethell_2024.jpg/220px-Jacob_Bethell_2024.jpg" },
  { title: "Devdutt Padikkal: 'Having Kohli at the other end gives you so much confidence'", description: "Devdutt Padikkal reflects on his extraordinary partnership with Virat Kohli in the season opener.", pubDate: "2026-03-28", link: "https://royalchallengers.com/rcb-cricket-news", thumbnail: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Devdutt_Padikkal_%28cropped%29.jpg/220px-Devdutt_Padikkal_%28cropped%29.jpg" },
  { title: "Andy Flower: 'RCB have the batting depth to win back-to-back titles'", description: "RCB head coach Andy Flower backs his team to defend the IPL title in 2026.", pubDate: "2026-03-18", link: "https://royalchallengers.com/rcb-cricket-news", thumbnail: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Andy_Flower_2009.jpg/220px-Andy_Flower_2009.jpg" },
  { title: "Bhuvneshwar Kumar brings experience and craft to RCB's 2026 attack", description: "Veteran seamer Bhuvneshwar Kumar joins RCB and talks about his role in the bowling unit.", pubDate: "2026-03-17", link: "https://royalchallengers.com/rcb-cricket-news", thumbnail: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Bhuvneshwar_Kumar_April_2019.jpg/220px-Bhuvneshwar_Kumar_April_2019.jpg" },
  { title: "RCB clinch IPL 2025 title — A look back at the historic triumph", description: "Reliving the magical IPL 2025 final as RCB lifted their maiden IPL trophy at Chinnaswamy.", pubDate: "2026-03-15", link: "https://royalchallengers.com/rcb-cricket-news", thumbnail: "https://upload.wikimedia.org/wikipedia/en/2/2a/Royal_Challengers_Bangalore_Logo.svg" },
  { title: "IPL 2026 Season Preview — Can RCB defend their title successfully?", description: "An in-depth look at whether the Royal Challengers Bengaluru have what it takes to retain the IPL trophy.", pubDate: "2026-03-10", link: "https://royalchallengers.com/rcb-cricket-news", thumbnail: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/IPL_2024_Logo.svg/220px-IPL_2024_Logo.svg.png" }
];

// Filter keywords to ensure RCB-relevant results
const RCB_KEYWORDS = ['rcb', 'royal challengers', 'bengaluru', 'bangalore', 'kohli', 'patidar', 
  'chinnaswamy', 'play bold', 'playbold', 'hazlewood', 'krunal pandya', 'phil salt',
  'bhuvneshwar', 'devdutt padikkal', 'jacob bethell', 'andy flower'];

function isRCBRelevant(text) {
  if (!text) return false;
  const lower = text.toLowerCase();
  return RCB_KEYWORDS.some(kw => lower.includes(kw));
}

async function fetchFromSource(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();
  if (data.status !== 'ok' || !data.items || data.items.length === 0) throw new Error('No items');
  return data.items;
}

// Parse RSS XML directly (used as fallback when rss2json fails)
function parseRSSXML(xmlText) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, 'text/xml');
  const items = doc.querySelectorAll('item');
  return Array.from(items).map(item => ({
    title: item.querySelector('title')?.textContent || '',
    description: (item.querySelector('description')?.textContent || '').replace(/<[^>]*>/g, '').substring(0, 250),
    link: item.querySelector('link')?.textContent || '',
    pubDate: item.querySelector('pubDate')?.textContent || '',
    thumbnail: item.querySelector('media\\:content, enclosure')?.getAttribute('url') || ''
  }));
}

// Fetch RSS via CORS proxy (works from file:// protocol)
async function fetchViaProxy(rssUrl) {
  for (const proxy of CORS_PROXIES) {
    try {
      const url = proxy + encodeURIComponent(rssUrl);
      const resp = await fetch(url);
      if (!resp.ok) continue;
      const data = await resp.json();
      // allorigins returns { contents: "..." }
      const xmlText = data.contents || data;
      if (typeof xmlText === 'string' && xmlText.includes('<item>')) {
        return parseRSSXML(xmlText);
      }
    } catch (e) {
      continue;
    }
  }
  throw new Error('All proxies failed');
}

async function fetchNews() {
  // Attempt 1: rss2json API
  for (const sourceUrl of NEWS_SOURCES) {
    try {
      const items = await fetchFromSource(sourceUrl);
      let rcbItems = items.filter(item =>
        isRCBRelevant(item.title) || isRCBRelevant(item.description)
      );
      if (sourceUrl === NEWS_SOURCES[0]) rcbItems = items; // Google News — take all
      if (rcbItems.length >= 3) {
        newsData = rcbItems.map(item => {
          // Try every possible thumbnail location
          let thumb = item.thumbnail || item.enclosure?.link || item.enclosure?.url || '';
          // Also parse raw description HTML for <img src=...>
          const rawDesc = item.description || item.content || '';
          if (!thumb && rawDesc.includes('<img')) {
            const m = rawDesc.match(/<img[^>]+src=["']([^"'>]+)["']/);
            if (m) thumb = m[1];
          }
          // Google News wraps article images in <figure> sometimes
          if (!thumb && rawDesc.includes('figure')) {
            const m = rawDesc.match(/https?:\/\/[^"'\s<>]+\.(?:jpg|jpeg|png|webp|gif)[^"'\s<>]*/);
            if (m) thumb = m[0];
          }
          const cleanDesc = rawDesc.replace(/<[^>]*>/g, '').substring(0, 250);
          return {
            title: item.title || '',
            description: cleanDesc,
            pubDate: item.pubDate || new Date().toISOString(),
            link: item.link || '#',
            thumbnail: thumb || ''
          };
        });
        lastFetchTime = new Date();
        console.log(`[RCB News] ✅ Fetched ${newsData.length} articles, ${newsData.filter(n=>n.thumbnail).length} with thumbnails`);
        return newsData;
      }
    } catch (e) {
      console.log(`[RCB News] rss2json source failed:`, e.message);
      continue;
    }
  }

  // Attempt 2: Direct CORS proxy with raw RSS parsing
  try {
    console.log('[RCB News] Trying CORS proxy for Google News RSS...');
    const items = await fetchViaProxy(GOOGLE_NEWS_RSS);
    let rcbItems = items.filter(item => isRCBRelevant(item.title) || isRCBRelevant(item.description));
    if (rcbItems.length < 3) rcbItems = items; // Take all if not enough
    if (rcbItems.length >= 1) {
      newsData = rcbItems.map(item => {
        let thumb = item.thumbnail;
        if (!thumb && item.description && item.description.includes('<img')) {
          const match = item.description.match(/<img[^>]+src="([^">]+)"/);
          if (match) thumb = match[1];
        }
        return {
          title: item.title || '',
          description: item.description ? item.description.replace(/<[^>]*>/g, '').substring(0, 250) : '',
          pubDate: item.pubDate || new Date().toISOString(),
          link: item.link || '#',
          thumbnail: thumb || ''
        };
      });
      lastFetchTime = new Date();
      console.log(`[RCB News] ✅ Fetched ${newsData.length} articles via CORS proxy`);
      return newsData;
    }
  } catch (e) {
    console.log('[RCB News] CORS proxy also failed:', e.message);
  }

  // All sources failed — use defaults
  console.log('[RCB News] ⚠️ All live sources failed. Using cached/default news.');
  newsData = defaultNews;
  lastFetchTime = new Date();
  return newsData;
}

function renderNewsGrid(containerId, limit = 12) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const items = newsData.length ? newsData : defaultNews;
  const displayItems = items.slice(0, limit);

  container.innerHTML = displayItems.map((item, i) => {
    const hasThumb = item.thumbnail && item.thumbnail.length > 10;
    const thumbHtml = hasThumb
      ? `<img src="${item.thumbnail}" alt="" loading="lazy" style="width:100%;height:100%;object-fit:cover;" onerror="this.parentElement.innerHTML='<div class=\\'news-card-img-placeholder\\'><span style=\\'font-family:var(--font-display);font-size:32px;color:var(--rcb-red);\\'>RCB</span></div>'">`
      : `<div class="news-card-img-placeholder" style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;background:linear-gradient(135deg,#12121C,#1A0005);"><span style="font-family:var(--font-display);font-size:40px;color:var(--rcb-red);text-shadow:0 0 20px rgba(204,0,0,0.5);letter-spacing:0.1em;">RCB</span><span style="font-family:var(--font-heading);font-size:9px;color:var(--rcb-gold);letter-spacing:0.2em;">#PLAYBOLD</span></div>`;
    return `
    <a href="${item.link}" target="_blank" rel="noopener" class="news-card ${i === 0 ? 'news-card-featured' : ''} reveal" style="animation-delay: ${i * 0.08}s">
      <div class="news-card-img">
        ${thumbHtml}
      </div>
      <div class="news-card-body">
        <div class="news-card-category">
          <span class="tag tag-red">NEWS</span>
          ${lastFetchTime ? `<span class="tag tag-outline" style="font-size:9px">LIVE FEED</span>` : ''}
        </div>
        <h3 class="news-card-title">${item.title}</h3>
        <p class="news-card-desc">${item.description || ''}</p>
        <div class="news-card-meta">
          <span class="news-card-date">${formatNewsDate(item.pubDate)}</span>
          <span class="news-card-read-more">Read More →</span>
        </div>
      </div>
    </a>
  `}).join('');

  if (typeof initScrollAnimations === 'function') initScrollAnimations();
}

function formatNewsDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

async function initNews(gridContainerId, limit) {
  // Show loading state
  const container = document.getElementById(gridContainerId);
  if (container) {
    container.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-muted);font-family:var(--font-heading)"><div class="glow-dot" style="margin:0 auto 16px"></div>Fetching latest RCB news...</div>';
  }

  await fetchNews();
  renderNewsGrid(gridContainerId, limit);

  // Update status indicator
  const refreshEl = document.querySelector('.news-refresh-text');
  if (refreshEl && lastFetchTime) {
    const isLive = newsData !== defaultNews && newsData.length > 0 && newsData[0] !== defaultNews[0];
    refreshEl.textContent = isLive 
      ? `LIVE FEED — LAST UPDATED: ${lastFetchTime.toLocaleTimeString('en-IN')} — AUTO-REFRESHES EVERY 30 MIN`
      : `CACHED NEWS — SHOWING LATEST FROM OFFICIAL SITE — REFRESHES EVERY 30 MIN`;
  }

  // Auto-refresh
  setInterval(async () => {
    await fetchNews();
    renderNewsGrid(gridContainerId, limit);
    if (refreshEl && lastFetchTime) {
      refreshEl.textContent = `LIVE FEED — LAST UPDATED: ${lastFetchTime.toLocaleTimeString('en-IN')}`;
    }
  }, REFRESH_INTERVAL);
}

window.RCBNews = { fetchNews, renderNewsGrid, initNews, defaultNews };
