import express from "express";
import { ProfilingIntegration } from "@sentry/profiling-node";
import * as Sentry from "@sentry/node";
import { RequestHandlerWithToken, RequestWithToken } from "./types";

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

const checkToken: RequestHandlerWithToken = (req, res, next) => {
  const token = (req.headers as any)['token'];

  if (!token) return res.sendStatus(403);

  if (token === "584be57d-1729-46c1-8850-166fdf7c0c95" || token === "613b2edf-540c-4eff-a16b-176eac548050") {
    (req as RequestWithToken).token = token;
    next();
  } else {
    res.sendStatus(403);
  }
};

app.use(checkToken);

import SalaryController from "./controller/SalaryController";
import RecordsController from "./controller/RecordsController";
import OptionsController from "./controller/OptionsController";

const optionsController = new OptionsController();

app.get("/ping", (_: any, res: any) => {
  res.json({ res: "pong" });
});

app.get("/compulsions_options", (req: RequestWithToken, res: any) => {
  optionsController.getCompulsionsOptions(req, res);
});
app.get("/lifecost_options", (req: RequestWithToken, res: any) => {
  optionsController.getLifeCostOptions(req, res);
});
app.get("/additional_expenses_options", (req: RequestWithToken, res: any) => {
  optionsController.getAdditionalExpensesOptions(req, res);
});

const salaryController = new SalaryController();
const recordsController = new RecordsController();

app.post("/salary", async (req: RequestWithToken, res: any) => {
  salaryController.createSalary(req, res);
});

app.post("/record", async (req: RequestWithToken, res: any) => {
  recordsController.createRecord(req, res);
});

app.get("/current_salary", async (req: RequestWithToken, res: any) => {
  salaryController.getCurrentSalary(req, res);
});

app.get("/current_salary_details", async (req: RequestWithToken, res: any) => {
  salaryController.getCurrentSalaryDetails(req, res);
});

app.get("/validate_token/:token", (req: RequestWithToken, res: any) => {
  res.send(
    (req.params.token === "584be57d-1729-46c1-8850-166fdf7c0c95" ||
      req.params.token === "613b2edf-540c-4eff-a16b-176eac548050") + ""
  );
});


const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});
