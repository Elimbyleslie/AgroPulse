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

import router from "./routers/index.js";
import { errorHandler, notFound } from "./middlewares/errorHandle.js";

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// =====================
// Middlewares globaux
// =====================

app.use(morgan("dev"));

app.use(
  helmet({
    contentSecurityPolicy: false,
    frameguard: false,
  })
);

app.use(credentials);
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  fileUpload({
    createParentPath: true,
    limits: { fileSize: 10 * 1024 * 1024 },
  })
);

app.use("/public", express.static(path.join(__dirname, "..", "public")));

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

// Auth (public)
app.use("/api/auth", router.auth);

// =====================
// Protection globale
// =====================

app.use("/api", authenticate);
app.use("/api", checkEmailVerified);

// =====================
// Routes protégées par authentification
// =====================

app.use("/api/organizations", router.organization);
app.use("/api/plan", router.plan);
app.use("/api/audit", router.audit);
app.use("/api/APIKey", router.apiKeys);
app.use("/api/users", router.user);
app.use("/api/subscriptions", router.subscription);

// =====================
// Routes protégées par authentification et permission
// =====================

// Animaux
app.use("/api/animals", router.animal);
app.use("/api/births", router.birth);
app.use("/api/animal-reproductions", router.animalReproduction);
app.use("/api/reproductions", router.reproductionBirth);
app.use("/api/animal-health", router.AnimalHealthRecord);
app.use("/api/animal-treatments", router.AnimalTreatment);
app.use("/api/animal-vaccinations", router.animaVaccination);
app.use("/api/animal-deaths", router.animalDeath);
app.use("/api/animal-transfers", router.animalTransfer);
app.use("/api/animal-weights", router.AnimalWeight);
app.use("/api/animal-movements", router.AnimalMovement);
app.use("/api/animal-feedings", router.animalFeeding);

// Fermes & structures
app.use("/api/farms", router.farm);
app.use("/api/FarmTasks", router.farmtask);
app.use("/api/barns", router.barn);
app.use("/api/pens", router.pen);

// Biologie
app.use("/api/breeds", router.breed);
app.use("/api/species", router.species);
app.use("/api/herds", router.herd);
app.use("/api/lots", router.lot);

// Finances
app.use("/api/expense-categories", router.expenseCategory);
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
app.use("/api/Feedstocks", router.feedstock);
app.use("/api/FeedUsages", router.feedUsage);
app.use("/api/inventories", router.inventory);
app.use("/api/Suppliers", router.supplier);
app.use("/api/FeedPurchases", router.feedPurchase);

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
