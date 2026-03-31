# 🦁 Royal Challengers Bengaluru — Fan Zone Website

> A premium, cinematic fan website for RCB built with HTML, CSS, and Vanilla JavaScript. Features live fixtures, real-time news, animated squad archives covering 2008–2026, and a dramatic lion-entrance animation on landing.

**🔗 Live (GitHub Pages):** [farhansayyedd.github.io/Shadow-Fox/IPL-RCB](https://farhansayyedd.github.io/Shadow-Fox/IPL-RCB)

---

## 📸 Preview

The site opens with a **cinematic lion-roar entrance animation** — shockwave rings explode, claw scratches flash, and the golden RCB lion slams in from above before the title text slides in from the left.

---

## 🚀 Features

- 🎬 **Lion Entrance Animation** — Pure CSS keyframe sequence: shockwave rings → claw scratches → logo slam → screen shake → title slide-in
- 🏏 **IPL 2026 Fixtures** — Full verified 2026 season schedule with live match results (Match 1: RCB won by 7 wkts vs SRH)
- 📰 **Live News Feed** — Fetches articles via RSS2JSON API from Google News & royalchallengers.com with intelligent fallback
- 👥 **Squad Archive** — All seasons 2008–2026 with player headshots sourced from royalchallengers.com
- 🎽 **Jersey Gallery** — Season-by-season kit history from 2008 to 2026
- 🏆 **Trophy Cabinet** — RCB's achievements and season milestones
- 🌑 **Dark Mode Always** — Enforced dark theme with RCB's Red, Navy, and Gold palette
- 📱 **Fully Responsive** — Mobile-first, works across all screen sizes

---

## 🏗️ Technical Architecture

### Frontend Stack
| Layer | Technology |
|-------|-----------|
| Structure | HTML5 + Semantic Elements |
| Styling | CSS3 (Custom Properties, Grid, Flexbox, Keyframes) |
| Logic | Vanilla JavaScript ES6+ |
| Fonts | Google Fonts (Rajdhani, Oswald, Inter) |
| Icons | Unicode Emojis + Custom CSS |

### JavaScript Modules

```
js/
├── squad-data.js      # All player data (2008–2026) + IPL team metadata
├── fixtures.js        # IPL 2026 schedule + live score rendering
├── news.js            # RSS feed fetcher with intelligent fallback
├── team.js            # Team page rendering + season filter
├── achievements.js    # Trophy cabinet & stats
└── jerseys.js         # Jersey gallery renderer
```

### CSS Architecture

```
css/
├── main.css           # Global design tokens, CSS variables, typography
└── components.css     # All component styles: navbar, hero, cards, fixtures, etc.
```

### Data Flow

```
Page Load
    │
    ├── squad-data.js loaded → IPL_TEAMS + RCB_SQUAD_ARCHIVE available globally
    │
    ├── fixtures.js → renders 2026 schedule from static data
    │         └── attempts CricketData.org API for live results
    │
    └── news.js → tries RSS2JSON proxy → Google News / royalchallengers.com
              └── fallback: renders defaultNews[] with real thumbnails
```

### Lion Entrance Animation (Pure CSS)

```
Timeline (no JavaScript):
  0.05s  → Ring 1 shockwave explodes (gold → red)
  0.25s  → Ring 2 expands
  0.45s  → Ring 3 expands
  0.2s   → Claw scratches slash & fade
  0.6s   → Logo SLAMS in (scale 3→1, blur→sharp, -180px→0)
  1.5s   → Screen shake (hero-shake keyframe)
  1.65s  → Title slides in from left (translateX -70px → 0)
```

---

## 📁 File Structure

```
IPL-RCB/
├── index.html          # Homepage: hero, squad carousel, fixtures preview, news
├── fixtures.html       # Full IPL 2026 schedule
├── team.html           # Squad archive by season
├── news.html           # Latest RCB news feed
├── achievements.html   # Trophy cabinet & milestones
├── jerseys.html        # Season-by-season jersey gallery
├── css/
│   ├── main.css        # Design system & global styles
│   └── components.css  # Component library
├── js/
│   ├── squad-data.js   # Player data & team metadata
│   ├── fixtures.js     # Match schedule rendering
│   ├── news.js         # News feed fetcher
│   ├── team.js         # Team page logic
│   ├── achievements.js # Trophy data
│   └── jerseys.js      # Jersey gallery
└── images/
    ├── rcb-logo-hd.png # Official HD golden lion logo
    ├── rcb-logo.png    # Fallback logo
    ├── csk.png         # Chennai Super Kings
    ├── mi.png          # Mumbai Indians
    ├── kkr.png         # Kolkata Knight Riders
    ├── srh.png         # Sunrisers Hyderabad
    ├── rr.png          # Rajasthan Royals
    ├── dc.png          # Delhi Capitals
    ├── pbks.png        # Punjab Kings
    ├── gt.png          # Gujarat Titans
    ├── lsg.png         # Lucknow Super Giants
    └── players/        # Player headshots (2026 squad)
```

---

## 🛠️ Running Locally

```bash
# Clone the repo
git clone https://github.com/farhansayyedd/Shadow-Fox.git

# Navigate to RCB project
cd Shadow-Fox/IPL-RCB

# Open in browser (no build step needed)
# Just open index.html directly
```

> **Note:** Live news requires internet access (RSS API calls). Fixtures fall back to static 2026 schedule offline.

---

## 🌐 API Integrations

| Service | Purpose | Fallback |
|---------|---------|---------|
| RSS2JSON | Fetch news articles | defaultNews[] hardcoded |
| CricketData.org | Live match scores | Static 2026 schedule |
| scores.iplt20.com | Team logo CDN | Local PNG copies in /images |

---

## 👤 Developer

**Farhan Sayyedd**  
📧 [GitHub](https://github.com/farhansayyedd) | IPL 2026 Fan Zone Project

*Built as part of ShadowFox internship — IPL Web Development Task*

---

*#PlayBold 🦁*
