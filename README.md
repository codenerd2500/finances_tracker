🚀 ledger
ledger is a premium, high-performance Expense and Income Tracker built with a modern tech stack. It provides users with a seamless interface to manage their financial data, featuring integrated Google Authentication and real-time data visualization.

📑 Key Features
Google OAuth Integration: Secure login using @react-oauth/google.

Financial Dashboard: Comprehensive overview of income and expenses.

Interactive Analytics: Dynamic charts and graphs powered by recharts.

Full-Stack Architecture: A React frontend paired with an Express server and SQLite database (better-sqlite3).

🛠️ Tech Stack
Frontend: React 19, Vite, TypeScript, and Tailwind CSS.

Backend: Express.js with tsx for TypeScript execution.

Database: SQLite via better-sqlite3.

Authentication: JSON Web Tokens (JWT) and Google OAuth.

🚀 Getting Started
1. Prerequisites
Ensure you have Node.js installed on your machine.

2. Installation
Clone the repository and install the dependencies:

Bash
git clone https://github.com/codenerd2500/finances_tracker.git
cd interstellar-shuttle
npm install
3. Running the App
The project requires running both the frontend and the backend server.

Start the Frontend (Vite):

Bash
npm run dev
The app will be available at http://localhost:5173.

Start the Backend Server:

Bash
npm run server
The server runs on http://localhost:3001 and is automatically proxied for API calls.

📂 Project Structure
/src: Frontend React components (Dashboard, Expense Tracker, Login, etc.).

/server: Express server logic and SQLite database integration.

vite.config.ts: Configuration for the development server and API proxying.

📝 Scripts
npm run dev: Starts the Vite development server.

npm run build: Compiles TypeScript and builds the production-ready frontend.

npm run server: Launches the backend API server.