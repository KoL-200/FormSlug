# FormSlug Frontend

The FormSlug frontend is a React application powered by Vite. Its sign-up and login screens use the backend authentication API. The workspace dashboard remains a frontend-only preview with sample data.

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

The auth forms call `POST /api/v1/auth/register` and `POST /api/v1/auth/login`. Start the backend on `http://localhost:3000` before submitting either form; Vite proxies `/api` to that address during development. Set `VITE_BACKEND_URL` in the frontend environment to proxy to a backend running elsewhere.

For a deployed frontend, configure the hosting setup to route `/api` to the backend on the same origin, or set `VITE_API_BASE_URL` to the browser-accessible API base URL (defaults to `/api/v1`). The API docs link uses that base URL as well.

After registration, the form switches to sign-in. Successful sign-in shows a confirmation; it does not open the sample dashboard, which is still only a preview and is not connected to account data.

The workspace dashboard is accessible from the sign-up/login screen using “Preview the workspace.” It displays sample data and keeps interactions in the browser only.

The form builder’s live preview accepts answers and validates required questions. Submitting it displays a local confirmation only; preview responses are not sent to the backend or saved.

## Scripts

```bash
npm run dev      # Start the Vite development server
npm run build    # Create a production build in dist/
npm run preview  # Preview the production build locally
```
