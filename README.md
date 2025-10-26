<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Gomoku Game with Gemini AI

This is a Gomoku (Five in a Row) game built with React and deployed on Azure Static Web Apps. It features AI opponents powered by Google's Gemini AI and a classic AI algorithm.

View your app in AI Studio: https://ai.studio/apps/drive/1Sg6P7jnBILlBwLlUA_jmA8kJJbdr4BIb

## Project Structure

This project follows Azure Static Web Apps architecture:

```
GomokuBasic/
├── /                    # Frontend application (React + Vite)
│   ├── components/      # React components
│   ├── services/        # Frontend services
│   ├── hooks/           # React hooks
│   ├── utils/           # Utility functions
│   └── build/           # Built static files (generated)
│
└── api/                 # Backend API (Azure Functions)
    └── getGeminiMove/   # Gemini AI endpoint
```

### Frontend (Root Directory)
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Output**: `/build` folder
- **Features**: 
  - Game UI and logic
  - Classic AI (client-side)
  - Calls backend API for Gemini AI moves

### Backend (`/api` folder)
- **Runtime**: Azure Functions (Node.js)
- **Purpose**: Server-side API for Gemini AI integration
- **Endpoints**:
  - `POST /api/getGeminiMove` - Get AI move from Gemini

## Run Locally

**Prerequisites:**  Node.js (v18 or later)

### Frontend Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

### API Development (Optional)

The API runs automatically on Azure Static Web Apps. For local API development:

1. Navigate to the API folder:
   ```bash
   cd api
   ```

2. Install API dependencies:
   ```bash
   npm install
   ```

3. Set up local environment:
   - Create `local.settings.json` in the `api` folder
   - Add your `GEMINI_API_KEY`

4. Run Azure Functions locally:
   ```bash
   npm start
   ```

## Deployment

This app is configured for automatic deployment to Azure Static Web Apps via GitHub Actions.

**Environment Variables Required:**
- `GEMINI_API_KEY` - Your Google Gemini API key (set in Azure Static Web Apps configuration)

The deployment workflow is located at `.github/workflows/azure-static-web-apps-proud-forest-0e104b01e.yml`
