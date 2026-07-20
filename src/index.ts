import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

import corsOptions from "./config/corsOptions.js";
import credentials from "./middlewares/credential.js";
import { authenticate } from "./middlewares/auth.js";
import { checkEmailVerified } from "./middlewares/checkEmailVerified.js";
import { getDashboardStatus } from "./middlewares/auth.js";
import router from "./routers/index.js";
import { errorHandler, notFound } from "./middlewares/errorHandle.js";
import passport from "passport";
import "./config/passport.js";
import {startAlertCron} from "./cron/alerts.js";



dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const uploadsPath = path.resolve(__dirname, "..", "..", "uploads");
app.use("/uploads", express.static(uploadsPath));
// =====================
// Middlewares globaux
// =====================

app.use(morgan("dev"));

app.use(
  helmet({
    contentSecurityPolicy: false,
    frameguard: false,
  }),
);

app.use(credentials);
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());



// =====================
// Routes publiques
// =====================

app.get("/", (req, res) => {
  res.json({
    message: "API AgroPulse is running 🚀",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    environment: process.env.NODE_ENV || "development",
  });
});

app.use(passport.initialize());

// Auth (public)
app.use("/api/auth", router.auth);

// =====================
// Protection globale
// =====================

app.use("/api", authenticate);
app.use("/api", checkEmailVerified);
app.use("/api/dashboard/status", getDashboardStatus);
// =====================
// Routes protégées par authentification
// =====================

app.use("/api/organizations", router.organization);
app.use("/api/plans", router.plan);
app.use("/api/audit", router.audit);
app.use("/api/APIKey", router.apiKeys);
app.use("/api/users", router.user);
app.use("/api/subscriptions", router.subscription);
app.use("/api/clients", router.client);
app.use("/api/settings", router.settings);
app.use("api/invoices", router.invoice);


// =====================
// Routes protégées par authentification et permission
// =====================

// Animaux
app.use("/api/animals", router.animal);
app.use("/api/births", router.birth);
app.use("/api/  ", router.animalReproduction);
app.use("/api/reproductions", router.reproductionBirth);
app.use("/api/animal-health", router.AnimalHealthRecord);
app.use("/api/animal-treatments", router.AnimalTreatment);
app.use("/api/animal-vaccinations", router.animaVaccination);
app.use("/api/animal-deaths", router.animalDeath);
app.use("/api/animal-transfers", router.animalTransfer);
app.use("/api/animal-weights", router.AnimalWeight);
app.use("/api/animal-movements", router.AnimalMovement);
app.use("/api/animal-feedings", router.animalFeeding);

//reproduction
app.use("/api/reproduction-cycles", router.reproductionCycle);
app.use("/api/gestation-checkups", router.gestationCheckup);
app.use("/api/reproduction-with-birth", router.reproductionBirth);

// Tâches & performances
app.use("/api/farmtasks", router.farmtask);

// Généalogie & performance génétique
app.use("/api/pedigrees", router.pedigree);
app.use("/api/genetic-performances", router.geneticPerformance);
app.use("/api/gestations", router.gestation);

// Fermes & structures
app.use("/api/farms", router.farm);
app.use("/api/barns", router.barn);
app.use("/api/pens", router.pen);

// Biologie
app.use("/api/breeds", router.breed);
app.use("/api/species", router.species);
app.use("/api/herds", router.herd);
app.use("/api/lots", router.lot);

// Finances
app.use("/api/expenses", router.expense);
app.use("/api/sales", router.sale);
app.use("/api/sale-items", router.saleItems);
app.use("/api/productions", router.production);
app.use("/api/payments", router.payment);
app.use("/api/purchases", router.purchase);
app.use("/api/Invoices", router.invoice);

// Équipements
app.use("/api/equipment-maintenances", router.equipmentMaintenance);
app.use("/api/equipments", router.equipment);

// Stock
app.use("/api/FeedUsages", router.feedUsage);
app.use("/api/feedingPlan", router.feedingPlan);
app.use("/api/inventories", router.inventory);
app.use("/api/feedStocks", router.feedStock);
app.use("/api/Suppliers", router.supplier);
app.use("/api/FeedPurchases", router.feedPurchase);
app.use("/api/stock-movements", router.stockMovement);

// Notifications
app.use("/api/notifications", router.notifications);
app.use("/api/alerts", router.alert);


// =====================
// Errors
// =====================

app.use(notFound);
app.use(errorHandler);

// =====================
// Server
// =====================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("=======================================");
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 API on http://localhost:${PORT}/api`);
  console.log("=======================================");
});

startAlertCron();
