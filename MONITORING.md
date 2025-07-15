# Monitoring & Alerting Setup

## 1. Error Logging
- All API handlers should use `console.error` for unexpected errors.
- For advanced monitoring, integrate with Sentry:

```bash
npm install @sentry/nextjs
```

In `pages/_app.tsx` or a custom server file:
```typescript
import * as Sentry from '@sentry/nextjs';
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
});
```

In each API handler:
```typescript
try {
  // ...
} catch (error) {
  Sentry.captureException(error);
  res.status(500).json({ error: 'Internal server error' });
}
```

## 2. Usage Monitoring
- Use Vercel/Netlify dashboards for request and error metrics.
- Optionally, integrate Datadog or LogRocket for more analytics.

## 3. Alerts
- Set up Sentry or Datadog alerts for error spikes or downtime.
- Use Vercel/Netlify notifications for deploy/build failures.
