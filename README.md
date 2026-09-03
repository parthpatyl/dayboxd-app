# 🎬 Dayboxd — Personal Cinema Journal

> *"Treat every day like a feature film. Rate it in half-stars, log iconic moments, collect posters, and view the archive of your life through a cinematic lens."*

Dayboxd is a privacy-first, local-first daily micro-journaling application built with React 19, TypeScript, Tailwind CSS, Dexie.js (IndexedDB), and Capacitor for Android.

## ✨ Key Features

- **Continuous Live Studio:** Micro-log timestamped scenes (`+ Scene`) throughout the day without the dread of the blank page.
- **0.5 – 5.0 Star Ratings:** Half-star precision + Liked Heart toggle and dedicated "Dialogue of the Day".
- **Poster Wall & 7 Fallback Themes:** 2:3 vertical film posters with automatically generated day-of-week aesthetics.
- **Top 4 Criterion Pinboard:** Showcase your four all-time favorite days on your Profile.
- **Pro-Style Stats & Heatmap:** Handcrafted lightweight SVG rating histograms, streak counters, and monthly trend curves.
- **Cinema Ticket Exporter:** Generate high-resolution vintage ticket cards ready for sharing without exposing private thoughts.
- **100% Offline Sanctuary:** Zero tracking, zero telemetry, local IndexedDB storage with instant JSON & Markdown backup.

## 🛠️ Tech Stack

- **Frontend:** React 19, Vite, TypeScript, Tailwind CSS v4, Lucide Icons, Framer Motion
- **Storage:** Dexie.js (IndexedDB) with reactive queries
- **Mobile Runtime:** Capacitor 7 (Android)
- **Charts:** Native handcrafted SVG engines (zero D3/Chart.js bloat)

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Sync and open Android project
npx cap sync android
npx cap open android
```

## 📄 License
MIT License.
