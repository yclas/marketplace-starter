# Use the starter in Replit

## 1. Open it

In Replit, choose **Import from GitHub** and paste `https://github.com/yclas/marketplace-starter`.

## 2. Settings

Add these as **Secrets**. Vite reads them as environment variables.

- `VITE_YCLAS_URL`: your Yclas site.
- `VITE_YCLAS_SITE_KEY`: your site's API key.
- `VITE_SITE_NAME`: your marketplace's name.

The run command is `npm run dev`.

## 3. Let the preview reach your site

Add Replit's preview address, and later your deployed address, in your Yclas panel under **Integrations > Your own
front end**.

## 4. Keep building with Replit Agent

Start with *"Read AGENTS.md and follow it for every change"*. If the Agent offers to create a PostgreSQL database for listings or users, say no: they're
already on your Yclas site.
