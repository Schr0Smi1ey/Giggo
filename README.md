# Giggo

Giggo is a freelance marketplace built for CSE KU Web Programming & Mobile
Applications Development. This repository contains both halves of the app.

| Folder | What it is | Stack |
| --- | --- | --- |
| [`client/`](client) | Web client (frontend) | React, Vite, Tailwind CSS, TanStack Query |
| [`server/`](server) | REST API and real-time server (backend) | Node.js, Express, MongoDB, Socket.IO |

Each folder is an independent npm project with its own `package.json`,
`.env.example`, and README. Run the commands below from inside the folder.

## Getting started

Use the Node version in each folder's `.nvmrc`.

```bash
# Server (API)
cd server
cp .env.example .env     # then fill in the placeholder values
npm install
npm run dev

# Client (web app), in a second terminal
cd client
cp .env.example .env.local
npm install
npm run dev
```

See [`server/README.md`](server/README.md) and
[`client/README.md`](client/README.md) for details, and
[`client/CONTRIBUTING.md`](client/CONTRIBUTING.md) for the contribution workflow.

## Repository layout

- `client/`, `server/`: the two applications.
- `.github/`: shared CI workflows, issue and PR templates, and CODEOWNERS.
  Each CI workflow only runs when files in its own folder change.

## History

This repo was created by merging the former `cseku_26_wpl_Giggo_Frontend` and
`cseku_26_wpl_Giggo_Backend` repositories. Their full commit history is preserved.
