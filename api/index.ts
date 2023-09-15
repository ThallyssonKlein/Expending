import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';

const express = require('express')

const app = express()

Sentry.init({
  dsn: 'https://d885625495f176009a5dd25f38329508@o4505779172737024.ingest.sentry.io/4505886773084160',
  integrations: [
    // enable HTTP calls tracing
    new Sentry.Integrations.Http({ tracing: true }),
    // enable Express.js middleware tracing
    new Sentry.Integrations.Express({ app }),
    new ProfilingIntegration(),
  ],
  // Performance Monitoring
  tracesSampleRate: 1.0, // Capture 100% of the transactions, reduce in production!
  // Set sampling rate for profiling - this is relative to tracesSampleRate
  profilesSampleRate: 1.0, // Capture 100% of the transactions, reduce in production!
});

app.use(express.json())

const generateRoutes = require('./generate-routes');

generateRoutes(app)

app.get('/ping', (req: any, res: any) => {
    res.json({res: 'pong'})
})

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});
