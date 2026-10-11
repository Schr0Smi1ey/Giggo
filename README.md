# Giggo

Giggo is a freelance marketplace built for CSE KU Web Programming & Mobile
Applications Development. This repository contains both halves of the app.

| Folder | What it is | Stack |
| --- | --- | --- |
| [`frontend/`](frontend) | Web client | React, Vite, Tailwind CSS, TanStack Query |
| [`backend/`](backend) | REST API and real-time server | Node.js, Express, MongoDB, Socket.IO |

Each folder is an independent npm project with its own `package.json`,
`.env.example`, and README. Run the commands below from inside the folder.

## Getting started

Use the Node version in each folder's `.nvmrc`.

```bash
# Backend (API)
cd backend
cp .env.example .env     # then fill in the placeholder values
npm install
npm run dev

# Frontend (web client), in a second terminal
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

See [`backend/README.md`](backend/README.md) and
[`frontend/README.md`](frontend/README.md) for details, and
[`frontend/CONTRIBUTING.md`](frontend/CONTRIBUTING.md) for the contribution workflow.

## Repository layout

- `frontend/`, `backend/`: the two applications.
- `.github/`: shared CI workflows, issue and PR templates, and CODEOWNERS.
  Each CI workflow only runs when files in its own folder change.

## History

This repo was created by merging the former `cseku_26_wpl_Giggo_Frontend` and
`cseku_26_wpl_Giggo_Backend` repositories. Their full commit history is preserved.
