# AniLaunch 🚀

> **"Every Episode Is a New Launch."**

AniLaunch is a stunning, production-quality, frontend-only anime release command center. It empowers anime fans to track upcoming episodes, upload custom high-resolution posters to local IndexedDB, configure weekly release schedules, monitor live second-by-second countdowns, and manage their watchlists with zero backend servers, API keys, or subscriptions required.

---

## 🌌 Visual Design & Architecture

AniLaunch features an anime-inspired cosmic visual design system:
- **Deep Midnight Navy**: `#080B18`
- **Space Indigo**: `#17152E`
- **Electric Violet**: `#8065FF`
- **Cosmic Cyan**: `#62DDF5`
- **Restrained Magenta**: `#D85CBA`
- **Soft White**: `#F5F5FF`
- **Muted Lavender**: `#A9A1D9`

### Visual Highlights:
- **Cinematic Anime Launch Hero**: Custom Makoto Shinkai-aesthetic anime hero art featuring an explorer observing an interstellar launch trail across a starlight nebula.
- **Glassmorphism**: High-performance backdrop blurs, ambient glow borders, and layered surfaces.
- **No Emojis as Substitutes**: Authentic anime posters, custom SVG artwork, and crisp Lucide React icons.
- **IndexedDB Image Storage**: Upload large PNG, JPG, and WebP poster artwork without exceeding LocalStorage size quotas.
- **Live Release Countdown**: Dynamic countdowns that update every second, calculating the exact time remaining based on weekly release schedules and user local timezones.

---

## 🛠️ Technology Stack

- **React 18** with **Vite**
- **JavaScript & JSX**
- **Tailwind CSS** with custom cosmic theme configuration
- **Framer Motion** for smooth launch sequence animations and modals
- **React Router 6** (`HashRouter` for 100% reliable deep links on GitHub Pages)
- **Lucide React** for interface controls
- **LocalStorage** for structured watchlist entries, watch history, and user settings
- **IndexedDB** (`anilaunch_db`) for binary image blob storage
- **date-fns** for date calculations, weekly recurrence, and timezone calculations
- **canvas-confetti** for milestone celebrations upon completing series

---

## 🚀 Key Features

1. **Welcoming Space-Launch Landing Page**:
   - Cinematic anime hero artwork.
   - Welcoming copy: *"Welcome to AniLaunch — Your Personal Anime Command Center"*.
   - Direct CTAs to launch into your dashboard or explore the watchlist.

2. **Dashboard Command Center**:
   - Real-time station metrics (Tracked anime, episodes releasing this week, total episodes watched, completed count).
   - Next Episode Launch spotlight card with live ticking countdown.
   - "Launching This Week" carousel.
   - Recently updated watchlist feed.
   - Onboarding state with one-click Curated Demo Anime Pack loader.

3. **My Anime Watchlist**:
   - Grid and compact list layout views.
   - Multi-criteria filtering by status (`Airing`, `Upcoming`, `On Hold`, `Completed`) and genres.
   - Sorting by next release date, title, recently added, or watch progress percentage.
   - Instant search across titles, alternate titles, and tags.

4. **Anime Flight Deck (Detail View)**:
   - Full banner backdrop with poster overlap.
   - Episode tracker with interactive checkmarks for marking individual episodes watched or unwatched.
   - Bulk action: "Mark all up to Episode N as watched".
   - Manual `+` and `-` episode counters.
   - Milestone celebration effects.

5. **Upcoming Launch Sequence**:
   - Chronological release timeline: *Today's Launches*, *Tomorrow*, *Later This Week*, and *Future Missions*.
   - Live countdown clocks for each upcoming episode.

6. **Weekly & Monthly Release Calendar**:
   - 7-day weekly schedule columns.
   - Full 30/31 day monthly calendar grid.
   - Highlights for past, today, and future broadcasts.

7. **Notification Center**:
   - Slide-over drawer with launch alerts.
   - In-app animated toasts when episodes are about to air.
   - Native browser desktop notifications via the `Notification` API with explicit user permission.

8. **Settings & Data Management**:
   - Customizable call-sign / display name.
   - Local timezone selection.
   - Email reminder configuration (with clear frontend-only educational notes).
   - Auto-cleanup rules for completed anime.
   - Full JSON Export and Import for transferring libraries across browsers or devices.
   - Station data reset with confirmation.

---

## 🔒 Frontend-Only Transparency

AniLaunch is proudly 100% frontend-only:
- **No Background Scheduling When Closed**: Browser notification popups and in-app toasts execute while the AniLaunch browser tab remains open.
- **Email Reminder Configuration**: Email addresses and lead times are saved locally. As clearly explained in the interface, automated email dispatch requires an external backend or webhook (e.g. Resend, Supabase, Firebase Functions).
- **Client-Side Data Storage**: All data is stored in the browser's LocalStorage and IndexedDB on the current origin. It is not synchronized across devices unless you export/import your JSON backup.

---

## 📦 Getting Started & Local Development

### Prerequisites
- Node.js (v18 or newer)
- npm (v9 or newer)

### Installation
```bash
# Clone the repository
git clone https://github.com/your-username/anilaunch.git

# Navigate into the project folder
cd anilaunch

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (or the port shown in your terminal) in your browser.

---

## 🌐 Deploying to GitHub Pages

AniLaunch is pre-configured for GitHub Pages:
- **Vite Base Path**: Set to relative (`base: './'`) in `vite.config.js`.
- **Client-side Routing**: Uses `HashRouter` (`/#/dashboard`), ensuring that page refreshes on GitHub Pages never produce 404 errors.

### Step-by-Step GitHub Pages Deployment:

1. **Build the production bundle**:
   ```bash
   npm run build
   ```
   This generates the optimized static files in the `dist/` directory.

2. **Deploy with `gh-pages`**:
   ```bash
   # Install gh-pages helper
   npm install -D gh-pages

   # Add deploy scripts to package.json:
   # "predeploy": "npm run build",
   # "deploy": "gh-pages -d dist"

   # Run deploy
   npm run deploy
   ```

3. **Or Deploy with GitHub Actions**:
   Create `.github/workflows/deploy.yml`:
   ```yaml
   name: Deploy to GitHub Pages

   on:
     push:
       branches: [ main ]

   jobs:
     build-and-deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: actions/setup-node@v3
           with:
             node-version: 20
         - run: npm ci
         - run: npm run build
         - uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./dist
   ```

---

## 📄 License

MIT License. Designed and engineered for anime fans everywhere.
