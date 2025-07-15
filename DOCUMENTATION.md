# Vapi Voice Assistant Integration Documentation

## Overview
This project integrates a Vapi voice AI assistant with custom tools for appointment and order lookup, using secure, production-ready Next.js API handlers.

## Key Endpoints
- `/api/vapi/create-assistant` — Create/configure the Vapi assistant with tools
- `/api/vapi/tool-handler` — Webhook for appointment lookup
- `/api/vapi/order-tool-handler` — Webhook for order lookup
- `/api/vapi/status`, `/api/vapi/recording`, `/api/vapi/incoming` — Vapi call webhooks

## Security
- All tool endpoints require a secret (`VAPI_TOOL_SECRET`) in the header or body.

## Testing
- Automated tests in `__tests__/api/vapi/` using Jest and node-mocks-http.

## Deployment
- Use Vercel or Netlify. See `DEPLOYMENT.md`.

## Monitoring
- See `MONITORING.md` for error and usage monitoring setup.

## Adding More Tools
- Follow the pattern in `tool-handler.ts` and `order-tool-handler.ts` to add new business logic tools.

## Compliance
- Enable PCI/HIPAA options in Vapi as needed.

## Support & Runbooks
- Document troubleshooting steps and escalation contacts here as your system grows.
