# 🎬 Letterboxd for Days — Product Specification & Philosophy

> *"Treat every day like a feature film. Rate it, log its iconic quotes, collect its posters, and view the archive of your life through a cinematic lens."*

---

## 1. Core Thesis & App Philosophy

Traditional journaling often suffers from two friction points:
1. **The Blank Page Burden:** Staring at an empty page feeling the pressure to write long, introspective paragraphs every single night.
2. **Lack of Gratifying Retrospection:** Plain text notes rarely offer satisfying, aesthetic overviews when looking back months or years later.

**"Letterboxd for Days"** reframes personal journaling through the beloved, visual, and rewarding design language of Letterboxd:
- **Every day is a release:** Give it a title/logline, assign a 0.5 – 5.0 star rating, drop a memorable quote, and select/generate an evocative poster.
- **Micro-journaling meets live timeline:** Instead of waiting until midnight, capture bite-sized timestamped "Scenes" throughout your day in a continuous open auto-draft.
- **Your life's personal filmography:** View your journey not as raw diary entries, but as a rich visual poster wall, a chronological calendar diary, an iconic "Top 4 Pinned Favorites", and deep Pro-style statistical breakdowns.
- **A Private Sanctuary:** Zero social feeds, zero followers, zero telemetry. Your thoughts remain 100% solo and local-first on your device.

---

## 2. What We Add vs. What We Retract

| Feature / Concept | Traditional Journaling | Letterboxd Social App | **Letterboxd for Days (Our App)** |
| :--- | :--- | :--- | :--- |
| **Atomic Unit** | Long freeform prose | A movie review & rating | **A "Day Log" with Stars, Poster, Quote & Scenes** |
| **Rating System** | Binary mood / emoji | 0.5 – 5.0 Star scale | **0.5 – 5.0 Green Half-Star increments + Heart ("Liked")** |
| **Intra-Day Logging** | Fragmented notes | None (post-watch only) | **Live "Scene" Timeline (timestamped moments throughout the day)** |
| **Cover Visuals** | Optional camera photos | Movie studio posters | **Photo upload OR 7 distinct Day-of-Week template posters** |
| **Dialogue/Quote** | Lost in paragraphs | Memorable review quotes | **Dedicated "Dialogue of the Day" punchline** |
| **Curation & Showcase** | Chronological lists | Profile Top 4, Lists, Diary | **Iconic Top 4 Pinboard, Poster Grid, Diary Table** |
| **Analytics & Trends** | Basic streak count | Letterboxd Pro / Year in Review | **Rating Histogram, Average Stars, Monthly breakdown, Mood clouds** |
| **Social Feed / Comments** | None | Public feed, comments, likes | ❌ **Retracted: 100% Solo & Private Sanctuary** |
| **Export / Sharing** | PDF/Plain text export | Social links | **Cinema Ticket / Film Poster Image Card Generator** |
| **Data Storage** | Cloud account lock-in | Centralized cloud server | **Local-First PWA (IndexedDB, offline, 1-click backup/restore)** |

---

## 3. Core Features & UX Architecture

### 3.1. Today: Live Studio & Continuous Auto-Draft
- **Continuous Open Canvas:** Today is always active. No need to "open and close" a session.
- **Timestamped Scenes:** Tap `+ Scene` at 10:15 AM, 2:30 PM, or 9:00 PM to jot quick moments, locations, or micro-thoughts with automatic timestamps.
- **Day Metadata Suite:**
  - **Star Rating:** 0.5 to 5.0 in half-star increments (glowing neon green stars).
  - **Liked Toggle:** Iconic Letterboxd orange/pink heart.
  - **Day Title / Logline:** e.g., *"The Sunday Reset"*, *"Crisis in the Boardroom"*, *"Rainy Coffee & Lost Trains"*.
  - **Review / Synopsis:** Summary reflection of the day.
  - **Dialogue of the Day:** One memorable line spoken, overheard, or thought.
  - **Genre / Mood Tags:** e.g., *Comedy, Slice-of-Life, Drama, Sci-Fi/Work, Thriller, Melancholic, Euphoric, Cozy*.
  - **Filming Location:** Tag main spots (Home, Coffee Shop, Airport, Studio).
  - **Cover Poster:** Pick a gallery/camera photo or choose from the 7 curated Day-of-Week cinema template posters.

### 3.2. The 'Diary' View (Calendar / Table)
- Clean, structured chronological feed inspired by Letterboxd’s Diary tab:
  - **Date & Day of week**
  - **Poster Thumbnail**
  - **Day Title & Dialogue excerpt**
  - **Star Rating (★ ★ ★ ★ ½)**
  - **Heart icon (if liked)**
  - **Scene count badge**
  - **Tag pills**

### 3.3. 'Poster Grid' / Film Wall
- An immersive gallery of vertical (2:3 aspect ratio) Day Posters.
- Sortable and filterable by:
  - Highest Rated (5.0 → 0.5)
  - Date (Newest → Oldest)
  - Liked only
  - Mood / Genre Tag filter
- Hover/tap reveals title, rating, and date overlay.

### 3.4. 'Favorites' Top 4 Pinboard
- Pinned prominently at the top of your Profile / Sanctuary view.
- Choose your 4 all-time greatest or most meaningful days to showcase your "Life's Criterion Collection".

### 3.5. 'Letterboxd Pro' Style Stats Dashboard
- **Rating Distribution Bar Chart:** Visual histogram of ratings from ½ star to 5 stars.
- **Headline Metrics:** Total Days Logged, All-time Average Rating, Total "Liked" Days, Current & Longest Streak.
- **Monthly Matrix & Calendar Heatmap:** Average rating per month, high-scoring months vs low-scoring months.
- **Genre / Mood Cloud:** Most frequent day genres (e.g., 40% Cozy, 25% High Action, 15% Melancholy).
- **Day-of-Week Rating Averages:** Discover whether your Fridays really outshine your Tuesdays.

### 3.6. Cinema Ticket / Story Poster Export Generator
- Generates an exportable high-resolution image card for any day:
  - Styled as an authentic vintage cinema ticket or indie film poster.
  - Includes: Poster art, Day Title, Star Rating, Date, Filming Location, and "Dialogue of the Day".
  - Ready for saving to photos or sharing to stories without exposing private review text.

---

## 4. Visual Identity & Aesthetics (Modern UI Pack & Letterboxd Synthesis)

### 4.1. Design System & Component Language (MUIP Inspired)
- **Minimalist Geometry:** Clean, border-radius refined surfaces, subtle sub-pixel hairlines, and restrained depth.
- **Interactive Tactile Controls:** Sleek glowing toggle switches, segmented tab bars, radial arc progress gauges for average rating scorecards, and crisp slider inputs.
- **Glass & Grain Touches:** Subtle frosted backdrop blurs (`backdrop-blur-md`) with optional 35mm film grain texture for cinematic depth.

### 4.2. Dual Theme System
1. **Cinema Dark (Default):**
   - Backgrounds: Obsidian & Deep Charcoal (`#14181c`, `#1f242d`, `#2c3440`)
   - Accent Primary: Iconic Letterboxd Neon Green (`#00e054` / `#00c030`)
   - Accent Secondary: Sunset Orange (`#ff8000`), Letterboxd Cyan (`#40bcf4`), Liked Heart (`#ff6060`)
   - Stars: Glowing amber/green half & full star SVGs
   - Typography: Clean modernist sans-serif (Inter / Geist / Syne) with atmospheric movie title display serif/condensed accents.
2. **Editorial Light (Day Mode):**
   - Backgrounds: Warm archival paper / cream (`#f7f6f2`, `#ffffff`, `#eae8e0`)
   - Ink text with forest emerald accents and tactile card borders.

### 4.3. 7 Day-of-Week Fallback Poster Templates
For days without custom photos, 7 distinct cinematic aesthetic graphics representing each day:
- **Monday:** *The Opening Scene* (Geometric minimal modernist framing)
- **Tuesday:** *The Steady Rhythm* (Warm architectural / ambient grain)
- **Wednesday:** *The Midpoint Twist* (Abstract dual-tone gradient)
- **Thursday:** *The Rising Action* (Kinetic typography & film frame lines)
- **Friday:** *The Climax* (Neon dusk glow & cinematic flare)
- **Saturday:** *The Golden Hour* (Warm analog sunbeam & vintage 35mm grain)
- **Sunday:** *The End Credits* (Ethereal monochrome & classic serif typesetting)


---

## 5. Technical & Privacy Architecture

### 5.1. Tech Stack & Engineering Standards
- **Core Frontend:** React 19, Vite, TypeScript, Tailwind CSS v4, Lucide Icons, Framer Motion (for refined micro-interactions and transitions).
- **State & Data Store:** Zustand + `Dexie.js` (IndexedDB) with reactive live queries and state synchronization.
- **Pure SVG Visualization Engines (Zero Heavy Charting Dependencies):**
  - All charts (Rating Distribution Histogram, GitHub-style Year Heatmap, Day-of-Week Radar/Bars, Monthly Average Trend Curves) are built as lightweight, handcrafted native SVG components (`<svg>`, `<path>`, `<rect>`).
  - No bulky dependencies like D3, Chart.js, or Recharts.
- **Native Mobile & Shell (Capacitor Ready):**
  - **Code Reusability:** Single codebase running in web browser and wrapped via `@capacitor/core` & `@capacitor/app`.
  - **Storage Safety:** Sandboxed filesystem mirroring via `@capacitor/filesystem` to prevent iOS WebView storage eviction.
  - **Native Local Reminders:** `@capacitor/local-notifications` to schedule daily evening wrap-up alarms offline on the OS without any push server.
  - **Hardware Back Button:** Intercepts Android back button to smoothly dismiss open sheets, modals, and poster viewers before navigating back.
- **Poster & Card Exporter:** Native HTML5 Canvas / `html-to-image` for high-resolution 2:3 film poster and vintage cinema ticket image generation.
- **Privacy Sanctuary:** 100% local-first, zero telemetry, zero external trackers, instant 1-click JSON backup & restore + Markdown Diary export.

