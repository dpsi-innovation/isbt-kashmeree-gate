# ISBT Kashmere Gate - Smart Crowd Odometer & Delhi All-Bus Transit Navigation

An interactive transit wayfinding and passenger crowd navigation web app for ISBT Kashmere Gate, Interstate bus routes (Route 550 to Mahipalpur), Delhi bus terminals, and turn-by-turn pedestrian wayfinding with an Accidental Metro Gate 1 & 2 Red Alert warning system.

---

## 🚀 Features

- **Live Transit Map**: Instant visualization of Route 550 (ISBT Kashmere Gate to Mahipalpur Bypass via Ring Road) with origin and destination pins.
- **14 Delhi Bus Stations**: Interactive directory and route lines for major ISBTs, Majnu Ka Tila Private Volvo Hub, Dhaula Kuan, and DTC terminals.
- **Live Bus Status Dashboard**: Comprehensive real-time bay information, arrival schedule, and departure board categorized by Level 1 & Level 2 Interstate and Local decks with direct "Show on Map" bay locating.
- **English & Hindi Language Options**: Dedicated bilingual language selector for voice and UI guidance.
- **Turn-by-Turn Wayfinding & Walk Simulators**: Interactive pedestrian walking guidance to Level 2 interstate bus boarding bays with "Walk to Bus" and "Walk to Metro" simulation controls.
- **Accidental Metro Red Alert System**: Automatic detection when walking towards the underground Yellow Line concourse (Metro Gates 1 & 2) instead of interstate bus platforms, featuring a flashing strobe alert, siren, and rerouting button.
- **Multilingual Voice Assistant & AI Chatbot**: High-fidelity speech guidance and instant answers across English and Hindi.
- **Crowd Odometer Telemetry**: Live CCTV passenger density stream with sector-by-sector congestion metrics and dynamic decongestion advice.

---

## 📁 Repository Structure

```
├── api/
│   └── index.js             # Vercel Serverless Function entry point
├── public/
│   └── posters/
│       └── qr_isbt_app.png  # Station QR code poster asset
├── .gitignore               # Excludes node_modules, logs, and OS files
├── index.html               # Frontend application (Tailwind CSS, Leaflet, Web Speech)
├── package.json             # Node dependencies and execution scripts
├── package-lock.json        # Dependency lockfile
├── server.js                # Express API backend for local and serverless execution
├── vercel.json              # Vercel routing configuration
└── README.md
```

---

## 🌐 Deploy to Vercel via GitHub

1. **Upload or Push to GitHub**:
   - Initialize git in this folder or upload these files to a GitHub repository:
     ```bash
     git init
     git add .
     git commit -m "Initial commit of ISBT transit app"
     git branch -M main
     git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
     git push -u origin main
     ```
   *(Note: Do not upload `node_modules`. The provided `.gitignore` automatically excludes it.)*

2. **Deploy on Vercel**:
   - Go to [vercel.com](https://vercel.com) and log in.
   - Click **"Add New..."** ➔ **"Project"**.
   - Select your GitHub repository.
   - Leave the default settings (Framework Preset: **Other**, Root Directory: `./`).
   - Click **"Deploy"**.

3. **Done!**
   - Vercel automatically deploys `index.html` on the Edge CDN and configures `/api/*` routes via `api/index.js` using `vercel.json`.

---

## 💻 Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the local server:
   ```bash
   npm start
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.
