# Nexus Finance

Nexus Finance is a unified personal finance and SaaS application designed for SME finance managers and ambitious individuals (like Ruby). It consolidates disparate tools—accounts, transactions, crypto, stocks, and fundraising—into one unified workspace with an intelligent AI advisor ("Apex").

## Technologies Used

- **Framework**: TanStack Start (React 19 + Vite 7)
- **Styling**: Tailwind CSS & Inline CSS for complex components
- **Database**: Netlify Database (PostgreSQL) mapped via Drizzle ORM
- **AI**: Netlify AI Gateway using OpenAI (`gpt-4o-mini`)
- **Backend RPC**: TanStack Server Functions

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the local development server:
   ```bash
   netlify dev
   ```
   This will spin up a local server on port 8888 and emulate all Netlify primitives (like AI Gateway and Netlify DB).

3. The application will auto-seed initial database records for accounts and crypto holdings on the very first API hit. Open the browser and talk to Apex!
