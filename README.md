# Codalyx: AI-Powered Developer Performance Hub

**Codalyx** is a production-grade developer intelligence platform. It consolidates metrics from multiple coding platforms—GitHub, LeetCode, Codeforces, CodeChef, and AtCoder—into a single, high-fidelity dashboard. Equipped with an AI Performance Coach powered by Google Gemini (with persistent intelligence caching), Codalyx helps developers visualize their growth, track contest streaks, and master conceptual weaknesses.

![Codalyx Dashboard Banner](https://via.placeholder.com/1200x400.png?text=Codalyx+DEVELOPER+PLATFORM)

---

## 🚀 Key Features

### 1. Unified Intelligence Dashboard
- **GitHub Integration**: Full repository registry, tech stack distribution (languages), and development chronology.
- **CP Analytics**: Detailed breakdown of LeetCode, Codeforces, and CodeChef performance.
- **Mental Models**: Simulation of "Psychology Radars" to track problem-solving consistency.

### 2. Arena (Contests) & Reminders
- **Global Stream**: Upcoming contests from LC, CF, CC, and AtCoder in one view.
- **Smart Alerts**: Automated "2-hour" reminders for registered competitions.
- **Performance Matrix**: Post-contest analysis with global rank tracking.

### 3. AI Coach (Google Gemini ✨)
- **Concept Mastery**: AI-generated roadmaps for weak topics.
- **Sub-topic Deep Dives**: Context-aware explanations for OS, DBMS, SQL, and DSA concepts.
- **Revision Tracker**: Specialized queue for problems requiring spaced repetition.

### 4. Chrome Extension
- Seamlessly bridge the gap between coding platforms and your Codalyx dashboard.

---

## 🛠 Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Framer Motion, Lucide Icons.
- **Backend**: Node.js, Express, MongoDB (Mongoose), Passport.js (JWT Auth).
- **AI Engine**: Google Gemini Pro (v1.5).
- **Caching/Real-time**: Predictive platform scrapers for low-latency sync.

---

## 📦 Installation & Setup

### 1. Prerequisites
- Node.js (v18+)
- MongoDB Atlas account
- Google Gemini API Key

### 2. Environment Configuration
Create a `.env` file in the `server/` directory:
```env
PORT=4000
MONGODB_URI=your_atlas_connection_string
JWT_SECRET=your_secret_key
GEMINI_API_KEY=your_gemini_key
CLIENT_URL=http://localhost:5173
```

Create a `.env` file in the `client/` directory:
```env
VITE_API_URL=http://localhost:4000/api
```

### 3. Run Locally
```bash
# Install root dependencies
cd server && npm install
cd ../client && npm install

# Start Backend
cd server
npm run dev

# Start Frontend
cd client
npm run dev
```

---

## 🤝 Contribution
Contributions are welcome! Please open an issue or submit a PR for any features or bug fixes.

---

## 📄 License
This project is licensed under the MIT License.


