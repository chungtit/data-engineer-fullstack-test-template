# Data Engineer Fullstack Test

A monorepo project demonstrating **PostHog webhook integration** with a React frontend and NestJS backend. The app showcases two key use cases:

1. **Marketing Automation** – Trigger Mailgun emails when users interact with features
2. **Training Data Pipeline** – Process `generation_failed` events to generate ML training data

## Project Structure

```
├── apps/
│   ├── api/         # NestJS backend - handles webhooks
│   └── web/         # React frontend - sends PostHog events
├── training_data.jsonl   # Output file for processed webhook data
```

## Prerequisites

- **Node.js** >= 18
- **pnpm** (package manager)
- A **PostHog** account with API key

## How to Run

### 1. Install Dependencies

```sh
pnpm install
```

### 2. Configure Environment Variables

Create a `.env` file in `apps/web/` with your PostHog credentials:

```env
VITE_POSTHOG_KEY=your_posthog_project_api_key
VITE_POSTHOG_HOST=https://app.posthog.com
```

### 3. Start the Applications

**Start the API server (backend):**

```sh
npx nx serve api
```

This runs the NestJS API on `http://localhost:3000`.

**Start the Web app (frontend):**

```sh
npx nx serve web
```

This runs the React app on `http://localhost:4200`.

### 4. Expose Local Server for Webhooks (Tunneling)

To receive PostHog webhooks on your local machine, use Pinggy to create a public tunnel:

```sh
ssh -p 443 -R0:localhost:3000 qr@free.pinggy.io
```

This will output a public URL (e.g., `https://xyz.free.pinggy.link`). Use this URL to configure your PostHog webhook destination.

---

## PostHog Webhook Configuration

### 1. Marketing Emails (Mailgun Integration)

The **"Simulate Feature Usage"** button triggers a `feature_used` event with the user's email. PostHog can forward this to Mailgun to send marketing emails.

**Setup in PostHog:**

1. Go to **Data Pipelines → Destinations**
2. Create a **Mailgun destination** (or use the HTTP Webhook destination)
3. Configure the Mailgun API endpoint:
  - **URL**: `https://api.mailgun.net/v3/YOUR_DOMAIN/messages`
  - **Auth**: Your Mailgun API key
4. Set a **filter** to trigger on `feature_used` events
5. Map the `person.properties.email` field to the recipient

### 2. Training Data Pipeline (generation_failed Webhook)

The **"Simulate Generation Failure"** button triggers a `generation_failed` event. PostHog forwards this to your API, which appends the data to a JSONL file for ML training.

**Setup in PostHog:**

1. Go to **Data Pipelines → Destinations**
2. Create a new **Webhook destination** with:
  - **URL**: `<your-pinggy-url>api//webhooks/generation-failed`  
    (e.g., `https://xyz.free.pinggy.link/api/webhooks/generation-failed`)
  - **Method**: `POST`
3. Set a **filter** to trigger on `generation_failed` events
4. Save and enable the destination

### How It Works

```
┌─────────────────┐     ┌─────────────┐     ┌──────────────────────────┐
│   React App     │────▶│   PostHog   │────▶│  Webhook Destinations    │
│  (PostHogDemo)  │     │             │     │                          │
└─────────────────┘     └─────────────┘     │  • Mailgun (emails)      │
                                            │  • NestJS API (training) │
                                            └──────────────────────────┘
```
- User clicks a button in the **React frontend**
- The `PostHogDemo` component captures the event via PostHog SDK
- **PostHog** receives the event and triggers configured webhooks 
- For `feature_used` → **Mailgun** sends a marketing email 
- For `generation_failed` → **NestJS API** appends data to `training_data.jsonl`

---

## API Endpoints

| Method | Endpoint                          | Description                                   |
|--------|-----------------------------------|-----------------------------------------------|
| POST   | `/api/webhooks/generation-failed` | Processes `generation_failed` events → JSONL  |

### Example Payloads

**feature_used (triggers Mailgun email):**

```json
{
  "event": "feature_used",
  "person": {
    "properties": {
      "email": "user@example.com"
    }
  }
}
```

**generation_failed (triggers training data pipeline):**

```json
{
  "event": "generation_failed",
  "properties": {
    "failure_reason": "timeout",
    "input_prompt": "Generate a summary of the latest news"
  }
}
```

---

## Development Commands

| Command              | Description                    |
|----------------------|--------------------------------|
| `npx nx serve api`   | Start API in development mode  |
| `npx nx serve web`   | Start web app in development mode |
| `npx nx build api`   | Build API for production       |
| `npx nx build web`   | Build web app for production   |
| `npx nx graph`       | Visualize project dependencies |

---

## Tech Stack

- **Frontend**: React, Vite, TailwindCSS, PostHog JS SDK
- **Backend**: NestJS, Node.js
- **Monorepo**: Nx
- **Package Manager**: pnpm
