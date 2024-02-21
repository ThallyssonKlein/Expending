import express from "express";
import { ProfilingIntegration } from "@sentry/profiling-node";
import * as Sentry from "@sentry/node";

const app = express();
Sentry.init({
  dsn: "https://d885625495f176009a5dd25f38329508@o4505779172737024.ingest.sentry.io/4505886773084160",
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

app.use((req, res, next) => {
  const authHeader = (req.headers as any)['token'];
  const token = typeof authHeader === 'string' ? authHeader.split(' ')[1] : undefined;

  if (!token) return res.sendStatus(403);

  if (token === "584be57d-1729-46c1-8850-166fdf7c0c95" || token === "613b2edf-540c-4eff-a16b-176eac548050") {
    next();
  } else {
    res.sendStatus(403);
  }
});

import SalaryController from "./controller/SalaryController";
import RecordsController from "./controller/RecordsController";
import { IConfig, loadConfigsFromNotion } from "./config";

(async function startApp() {
  let config: IConfig[] = await loadConfigsFromNotion();

  config = config.filter((config) => {
    if (
      config.Name &&
      config.NameInApp &&
      config.Category &&
      config.Subcategory
    ) {
      return config;
    }
  });

  app.get("/ping", (req: any, res: any) => {
    res.json({ res: "pong" });
  });

  app.post("/refresh_config", async (req: any, res: any) => {
    config = await loadConfigsFromNotion();
    res.json({ res: "ok" });
  });

  app.get("/compulsions_options", (req: any, res: any) => {
    res.json(config.filter((config) => config.Category === "1 - Compulsões"));
  });
  app.get("/lifecost_options", (req: any, res: any) => {
    res.json(config.filter((config) => config.Category === "2 - Life Cost"));
  });
  app.get("/additional_expenses_options", (req: any, res: any) => {
    res.json(config.filter((config) => config.Category === "3 - Extra"));
  });

  const salaryController = new SalaryController();
  const recordsController = new RecordsController();

  app.post("/salary", async (req: any, res: any) => {
    salaryController.createSalary(req, res);
  });

  app.post("/record", async (req: any, res: any) => {
    recordsController.createRecord(req, res);
  });

  app.get("/current_salary", async (req: any, res: any) => {
    salaryController.getCurrentSalary(req, res);
  });

  app.get("/current_salary_details", async (req: any, res: any) => {
    salaryController.getCurrentSalaryDetails(req, res);
  });

  app.get("/validate_token/:token", (req: any, res: any) => {
    res.send(
      (req.params.token === "584be57d-1729-46c1-8850-166fdf7c0c95" ||
        req.params.token === "613b2edf-540c-4eff-a16b-176eac548050") + ""
    );
  });
})();

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});
