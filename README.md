<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/7532f770-b4c4-4d35-adf8-727cd0fb9059

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Dependency notes

- `@google/genai` is currently unused by `src/` but is kept intentionally: it is reserved for the Phase 3 server-side Gemini integration (Smart Import PDF parsing) planned in the roadmap.
