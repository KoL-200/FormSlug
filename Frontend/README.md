# FormSlug Frontend

The FormSlug frontend is a React application powered by Vite. Authentication, projects, forms, responses, account settings, and project webhooks use the backend API.

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

For local development, set `VITE_BACKEND_URL` to the backend origin used by Vite's `/api` and `/f` proxies. For a deployed frontend, route `/api` and `/f` to the backend on the same origin, or set `VITE_API_BASE_URL` to the browser-accessible API base URL (defaults to `/api/v1`). The API docs link uses that base URL as well.

After registration, the form switches to sign-in. Once authenticated, the dashboard loads the signed-in user's workspace from the backend.

Create projects in **Projects**, then use the workspace dropdown in the sidebar to select a project and view its forms. New forms are created in the selected project. **View all** opens the forms view; the notification control opens responses, and the profile control opens account settings.

Manage project webhooks from **Webhooks**: create HTTPS endpoints, update URLs, pause or activate delivery, send test deliveries, and delete endpoints. The signing secret is displayed only when the endpoint is created; save it securely at that time.

The form builder includes an interactive local preview. Test responses entered in that preview are not sent to the backend or saved.

## Scripts

```bash
npm run dev      # Start the Vite development server
npm run build    # Create a production build in dist/
npm run preview  # Preview the production build locally
```
