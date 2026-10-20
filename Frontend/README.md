# FormSlug Frontend

The FormSlug frontend is a React application powered by Vite. It provides responsive sign-up and login screens plus a frontend-only workspace dashboard preview. Authentication and dashboard data are not connected to the API.

## Requirements

- Node.js and npm

## Run locally

From this directory:

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`).

## Authentication

Sign-up and login currently provide frontend-only forms. They perform basic browser validation and show a notice on submission; no authentication requests are sent. Connect the forms to the backend when the API integration is ready.

The workspace dashboard is accessible from the sign-up/login screen using “Preview the workspace.” It displays sample data and keeps interactions in the browser only.

## Scripts

```bash
npm run dev      # Start the Vite development server
npm run build    # Create a production build in dist/
npm run preview  # Preview the production build locally
```
