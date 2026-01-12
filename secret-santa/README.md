# Secret Santa Frontend

This is the frontend for the Secret Santa application, built with React, TypeScript, and Material UI.

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd secret-santa-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env` file based on the example:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your backend API URL (make sure to include /api suffix) and other configurations.

5. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

The application will start on `http://localhost:5173`.

## Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run preview` - Preview the production build locally
- `npm run lint` - Lint the code

## Project Structure

- `src/` - Main source code
  - `components/` - React components
  - `contexts/` - React contexts for state management
  - `hooks/` - Custom React hooks
  - `lib/` - Utility functions and API clients
  - `services/` - Service classes for external integrations
  - `assets/` - Static assets like images
  - `types/` - TypeScript type definitions

## Configuration

The application uses environment variables for configuration:

- `VITE_API_BASE_URL` - Base URL for the backend API (should include /api suffix)
- `VITE_SIGNALR_HUB_URL` - URL for SignalR hub
- `VITE_OAUTH_REDIRECT_URI` - OAuth redirect URI

## Deployment

To build the application for production:

```bash
npm run build
```

The build artifacts will be placed in the `dist/` directory.