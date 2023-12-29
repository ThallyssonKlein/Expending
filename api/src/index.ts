import express from 'express';
import { ProfilingIntegration } from '@sentry/profiling-node';
import * as Sentry from '@sentry/node';

const app = express();
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
app.use(express.json());

import SalaryController from './controller/SalaryController';
import { IConfig, loadConfigsFromNotion } from './config';

(async function startApp() {
  let config: IConfig[] = await loadConfigsFromNotion()

  config = config.filter(config => {
    if (config.Name && config.NameInApp && config.Category && config.Subcategory) {
      return config
    }
  })

  app.get('/ping', (req: any, res: any) => {
    res.json({ res: 'pong' });
  });
  
  app.post('/refresh_config', async (req: any, res: any) => {
      config = await loadConfigsFromNotion()
      res.json({ res: 'ok' })
  })

  app.get('/compulsions_options', (req: any, res: any) => {
    res.json(
      config.filter(config => config.Category === '1 - Compulsões')
    )
  })
  app.get('/lifecost_options', (req: any, res: any) => {
    res.json(
      config.filter(config => config.Category === '2 - Life Cost')
    )
  })
  app.get('/additional_expenses_options', (req: any, res: any) => {
    res.json(
      config.filter(config => config.Category === '3 - Extra')
    )
  })

  const salaryController = new SalaryController();

  app.post('/enter_salary', async (req: any, res: any) => {
    salaryController.enterSalary(req, res);
  });

  app.get('/current_salary', async (req: any, res: any) => {
    salaryController.getCurrentSalary(req, res);
  });

})()


const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});
