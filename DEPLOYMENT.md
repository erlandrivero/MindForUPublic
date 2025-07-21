# Deployment Guide

## 1. Prepare Environment Variables
- Set `VAPI_PRIVATE_KEY`, `VAPI_PUBLIC_KEY`, and `VAPI_TOOL_SECRET` in your Vercel/Netlify dashboard.

## 2. Deploy
- Push your code to GitHub/GitLab.
- Connect your repo to Vercel or Netlify.
- Deploy the project (auto-build on push).

## 3. Update Vapi Dashboard
- Set webhook URLs to your production endpoints (e.g., `https://your-vercel-app.vercel.app/api/vapi/tool-handler`).

## 4. Test
- Call your production endpoints to verify assistant and tool integration.

## 5. Monitor & Maintain
- Use Vercel/Netlify and Sentry dashboards for monitoring.
- Rotate secrets and keys periodically for security.
