# Smart Schedule AI 🎓

An Automatic College Timetable Generator for college administrators that eliminates teacher clashes, room double-bookings, class-section collisions, and unbalanced workloads.

---

## 🚀 Key Features

1. **Intelligent Constraint-Based Scheduler**
   - **Teacher Clash Avoidance**: Ensures a faculty member is never scheduled in two locations at the same time.
   - **Room Conflict Prevention**: Prevents any classroom, laboratory, or seminar hall from double-booking.
   - **Class Section Isolation**: Schedules sections (`CS-A`, `CS-B`, `IT-A`) so students never have concurrent required lectures.
   - **Custom Faculty & Room Constraints**:
     - *Faculty off-days*: e.g., Dr. Sharma is unavailable on Wednesdays.
     - *Room cutoff restrictions*: e.g., Room 101 unavailable after 2 PM.
     - *Pedagogical limits*: No class before 9 AM; maximum 2 consecutive periods per teacher.
   - **Honest Conflict Reporting**: Real conflict counts and an explicit "Unscheduled" badge if a slot cannot be placed without violation.

2. **Schedule Health Score (0–100)**
   - Computes a quantitative quality score factoring in zero-clash integrity, faculty workload distribution (standard deviation of teaching periods), and campus room utilization rate.

3. **Gemini 3.8 Flash AI Scheduling Insights**
   - Direct server-side integration via the `@google/genai` TypeScript SDK.
   - Provides 3 concrete efficiency reasons, 1 actionable operational recommendation, and an executive quality summary.

4. **Firebase Firestore Integration**
   - Connected to project `smart-schedule-ai`.
   - Collections:
     - `teachers`: Faculty roster, departments, daily limits, off-days, and color badges.
     - `rooms`: Facilities, capacities, types, and time constraints.
     - `subjects`: Course codes, names, required weekly periods, preferred venues, and enrolled sections.
     - `constraints`: Active institutional policies and priority weighting.
     - `timetables`: Saved historical schedules with audit results and conflict diagnostics.

5. **Administrative Tools**
   - One-click **Load Demo Data** (pre-populates 6+ teachers, 5 rooms, 8 subjects, 3 sections, and realistic constraints).
   - **CSV Export** for printing or importing into university management systems.
   - **Saved Timetables Archive** to switch between and review different schedule versions.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons
- **Backend**: Node.js, Express (running on Port 3000)
- **Database**: Firebase Firestore (`smart-schedule-ai`) with resilient local fallback
- **AI Engine**: Google Gemini API (`gemini-3.8-flash`) executed strictly server-side

---

## ⚙️ Environment Configuration

Create a `.env` file (or configure environment variables in AI Studio):

```env
# Gemini API Key (Server-Side only)
GEMINI_API_KEY=your_gemini_api_key_here

# Firebase Firestore Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=smart-schedule-ai.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=smart-schedule-ai
VITE_FIREBASE_STORAGE_BUCKET=smart-schedule-ai.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

---

## 📦 Getting Started

### Development
```bash
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.

### Production Build
```bash
npm run build
npm start
```
Compiles both Vite client assets and bundles `server.ts` into a self-contained CommonJS artifact at `dist/server.cjs`.

### Deploy to Vercel

1. Import this GitHub repository into Vercel.
2. Keep the framework preset as **Vite** and the build command as `npm run build`.
3. Add the environment variables listed in `.env.example` in **Project Settings → Environment Variables**. `GEMINI_API_KEY` enables AI insights. The `VITE_FIREBASE_*` values are required for Firestore-backed saving and loading.
4. Redeploy after adding or changing environment variables. Set `GEMINI_API_KEY` for Production and for Preview if you want AI insights on preview deployments.

The `/api` folder contains Vercel Functions for `/api/health` and `/api/gemini/analyze-timetable`. The Express server in `server.ts` is used for local development and hosts that run a persistent Node server.

### Security before using real schedules

The current `firestore.rules` file permits unauthenticated public reads and writes to timetable collections. This is only suitable for a throwaway demo dataset. Do not put real teacher or institutional schedules in the database until Firebase Authentication is added and the rules restrict each user's access.

Never commit `.env` or paste `GEMINI_API_KEY` into frontend code. Firebase web configuration values are public identifiers; access to Firestore must be protected by security rules.
