import cron from "node-cron";
import { runDailyAlertChecks } from "../services/alert.js";

export function startAlertCron(): void {
  // Tous les jours à 00h00
  cron.schedule("0 0 * * *", async () => {
    await runDailyAlertChecks();
  });
}