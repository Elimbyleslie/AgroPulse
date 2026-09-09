import cron from "node-cron";
import { runPeriodicAlertChecks } from "../services/alert.js";

export function startAlertCron(): void {
  cron.schedule("*/15 * * * *", async () => {
    await runPeriodicAlertChecks();
  });
}