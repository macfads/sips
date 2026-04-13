# 🍻 Sips

Earn your pints. Track runs, rides, and steps — see how many beers you've earned.

## Quick Deploy (5 minutes)

### 1. Push to GitHub

```bash
# Create a new repo on github.com, then:
cd sips-pwa
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/sips.git
git push -u origin main
```

### 2. Deploy on Vercel (free)

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"New Project"**
3. Import your `sips` repo
4. Vercel auto-detects Vite — just click **"Deploy"**
5. Done! You'll get a URL like `sips-xyz.vercel.app`

### 3. Install on iPhone

1. Open your Vercel URL in Safari
2. Tap the **Share** button (square with arrow)
3. Tap **"Add to Home Screen"**
4. It now launches fullscreen like a real app

### 4. Share with friends

Send them the link — they do the same "Add to Home Screen" flow.

---

## Custom Domain (optional)

1. Buy a domain (e.g. `getsips.co` from Namecheap/Cloudflare, ~£8/year)
2. In Vercel → Project Settings → Domains → Add your domain
3. Update DNS as Vercel instructs (usually just add a CNAME)

---

## Local Development

```bash
npm install
npm run dev
# Opens at http://localhost:5173
```

## Build for Production

```bash
npm run build
# Output in /dist — upload anywhere that serves static files
```

---

## Leaderboard Note

The friend code + leaderboard currently works locally on each device.
For real-time multi-user leaderboard, you'll want to add a backend:

**Easiest option: Firebase Realtime Database**
1. Create a Firebase project (free tier)
2. `npm install firebase`
3. Replace the localStorage leaderboard calls with Firebase reads/writes
4. Friends' pints update in real-time across devices

---

## Tech Stack

- **React 18** + **Vite**
- **PWA** with service worker for offline support
- **DeviceMotion API** for step counting
- **localStorage** for data persistence
- Fonts: Outfit + Fraunces (Google Fonts)
