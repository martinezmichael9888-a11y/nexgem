# AGENTS.md

This document serves as an overview of the Nexus Finance architecture and codebase conventions.

## Architecture

Nexus is built on TanStack Start using file-based routing and Server Functions for backend operations. 

- **Frontend**: The primary UI is handled in `src/routes/index.tsx` which embeds `src/components/Advisor.tsx`. The design relies on a dark-mode palette (`#080c14`, `#00f5a0`) and provides a chat-like interface.
- **Backend / API**: All backend interactions occur through TanStack Server Functions defined in `src/server/*.functions.ts`. 
- **Database**: Uses Netlify Database (managed PostgreSQL). The schema is defined in `db/schema.ts` and managed via Drizzle ORM.
- **AI Integration**: The `askApex` function located in `src/server/ai.functions.ts` handles communication with the Netlify AI Gateway.

## Directory Structure

```
├── db/
│   ├── index.ts              # Drizzle ORM client initialization
│   └── schema.ts             # PostgreSQL table definitions
├── netlify/database/migrations/ # Auto-generated Drizzle migrations
├── src/
│   ├── components/           # UI elements (Advisor.tsx)
│   ├── routes/               # TanStack Router definitions
│   └── server/               # Backend logic
│       ├── advisor.server.ts # Direct DB utilities (seed, update)
│       ├── advisor.functions.ts # RPC wrappers for client use
│       └── ai.functions.ts   # OpenAI Gateway integration
├── drizzle.config.ts         # Drizzle kit configuration
```

## Conventions

- **Server Functions**: All input schemas strictly use Zod `.inputValidator(...)`. Data-access helpers should reside in `.server.ts` and be imported by `.functions.ts`.
- **Database Mutations**: Do not use in-memory arrays. Always persist data back to Netlify Database via Drizzle.
- **Action Execution**: The AI is programmed to output `ACTION: { ... }` JSON strings. The frontend parses these, strips them from the visible text, executes the corresponding server function, and prints the result.
