import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import corsOptions from "./config/corsOptions.js";
import credentials from "./middlewares/credential.js";
import { authenticate, authorizePermission } from "./middlewares/auth.js";


import fileUpload from "express-fileupload";
import { fileURLToPath } from "url";
import path from "path";

// Routes
import router from "./routers/index.js";

import { dirname } from "path";
// Middlewares d'erreurs
import { errorHandler, notFound } from "./middlewares/errorHandle.js";
import { authorize } from "./middlewares/auth.js";
import { Permission } from "./typages/permissions.js";
import { checkEmailVerified } from "./middlewares/checkEmailVerified.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();

// =====================
// Middleware global
// =====================

app.use(morgan("dev"));
app.use(
  helmet({
    contentSecurityPolicy: false,
    frameguard: false,
    hsts: true,
    noSniff: true,
    xssFilter: true,
    hidePoweredBy: true,
  })
);
app.use(credentials);
app.use(cors(corsOptions));
app.use(express.json()); // Parse JSON raw
app.use(express.urlencoded({ extended: true })); // Parse form-urlencoded
app.use(cookieParser());

// Upload de fichiers
app.use(
  fileUpload({
    createParentPath: true,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
    abortOnLimit: true,
    safeFileNames: true,
    preserveExtension: true,
  })
);

// Dossier pour fichiers statiques (images, etc.)
app.use("/public", express.static(path.join(__dirname, "..", "public")));

// -----------------------------
// Routes publiques
// -----------------------------
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

// Routes Auth (non protégées)
app.use("/api/auth", router.auth);
app.use(checkEmailVerified);
// Middleware JWT pour protéger les routes suivantes

// Routes protégées
app.use(authenticate);
// // Routes  du Modules SaaS
app.use(
  "/api/organizations",
  authorizePermission([
    Permission.READ_ORGANIZATION,
    Permission.CREATE_ORGANIZATION,
  ]),
  router.organization
);

app.use(
  "/api/plan",
  authorizePermission([Permission.READ_PLAN, Permission.CREATE_PLAN]),
  router.plan
);

app.use(
  "/api/audit",
  authorizePermission([Permission.READ_AUDITLOG, Permission.CREATE_AUDITLOG]),
  router.audit
);

app.use(
  "/api/APIKey",
  authorizePermission([Permission.READ_API_KEY, Permission.CREATE_API_KEY]),
  router.apiKeys
)

app.use(
  "/api/users",
  authorizePermission([Permission.READ_USER, Permission.CREATE_USER]),
  router.user
);

// // Routes de Gestion des animaux
app.use(
  "/api/animals",
  authorizePermission([Permission.READ_ANIMAL, Permission.CREATE_ANIMAL]),
  router.animal
);
app.use(
  "/api/births",
  authorizePermission([Permission.READ_BIRTH, Permission.CREATE_BIRTH]),
  router.birth
);

app.use(
  "/api/animal-reproductions",
  authorizePermission([Permission.READ_ANIMAL_REPRODUCTION, Permission.CREATE_ANIMAL_REPRODUCTION]),
  router.animalReproduction
);
app.use(
  "/api/reproductions",
  authorizePermission([Permission.READ_REPRODUCTION, Permission.CREATE_REPRODUCTION]),
  router.reproductionBirth
);


app.use(
  "/api/animal-health",
  authorizePermission([
    Permission.READ_HEALTH_RECORD,
    Permission.CREATE_HEALTH_RECORD,
  ]),
  router.AnimalHealthRecord
);
app.use(
  "/api/animal-treatments",
  authorizePermission([Permission.READ_TREATMENT, Permission.CREATE_TREATMENT]),
  router.AnimalTreatment
);
app.use(
  "/api/animal-vaccinations",
  authorizePermission([
    Permission.READ_VACCINATION,
    Permission.CREATE_VACCINATION,
  ]),
  router.animaVaccination
);
app.use(
  "/api/animal-deaths",
  authorizePermission([Permission.READ_ANIMAL_DEATH, Permission.CREATE_ANIMAL_DEATH]),
  router.animalDeath
);


app.use(
  '/api/animal-transfers',
  authorizePermission([Permission.READ_TRANSFER, Permission.CREATE_TRANSFER]),
  router.animalTransfer
);
app.use(
  '/api/animal-weights',
  authorizePermission([Permission.READ_WEIGHT, Permission.CREATE_WEIGHT , Permission.UPDATE_WEIGHT]),
  router.AnimalWeight
);
app.use(
  '/api/animal-movements',
  authorizePermission([Permission.READ_MOVEMENT, Permission.CREATE_MOVEMENT , Permission.UPDATE_MOVEMENT]),
  router.AnimalMovement
);

app.use(
  '/api/animal-feedings',
  authorizePermission([Permission.READ_ANIMAL_FEEDING, Permission.CREATE_ANIMAL_FEEDING, Permission.UPDATE_ANIMAL_FEEDING]),
  router.animalFeeding 
);


// // Routes de Gestion des fermes et infrastructures
app.use(
  "/api/farms",
  authorizePermission([Permission.READ_FARM, Permission.CREATE_FARM, Permission.UPDATE_FARM]),
  router.farm
);

app.use(
  "/api/FarmTasks",
  authorizePermission([Permission.READ_FARM_TASK, Permission.CREATE_FARM_TASK, Permission.UPDATE_FARM_TASK, Permission.DELETE_FARM_TASK]),
  router.farmtask 
)



app.use(
  "/api/barns",
  authorizePermission([Permission.READ_BARN, Permission.CREATE_BARN, Permission.UPDATE_BARN]),
  router.barn
);
app.use(
  "/api/pens",
  authorizePermission([Permission.READ_PEN, Permission.CREATE_PEN, Permission.UPDATE_PEN]),
  router.pen
);

// // Routes de  Gestion biologique
app.use(
  "/api/breeds",
  authorizePermission([Permission.READ_BREED, Permission.CREATE_BREED, Permission.UPDATE_BREED]),
  router.breed
);
app.use(
  "/api/species",
  authorizePermission([Permission.READ_SPECIES, Permission.CREATE_SPECIES, Permission.UPDATE_SPECIES]),
  router.species
);
app.use(
  "/api/herds",
  authorizePermission([Permission.READ_HERD, Permission.CREATE_HERD, Permission.UPDATE_HERD, Permission.DELETE_HERD]),
  router.herd
);
app.use(
  "/api/lots",
  authorizePermission([Permission.READ_LOT, Permission.CREATE_LOT, Permission.UPDATE_LOT, Permission.DELETE_LOT]),
  router.lot
);

// // Routes de gestion struturelle

app.use(
  "/api/expense-categories",
  authorizePermission([Permission.READ_EXPENSE_CATEGORY, Permission.CREATE_EXPENSE_CATEGORY]),
  router.expenseCategory
);
app.use(
  "/api/expenses",
  authorizePermission([Permission.READ_EXPENSE, Permission.CREATE_EXPENSE]),
  router.expense
);
app.use(
  "/api/sales",
  authorizePermission([Permission.READ_SALE, Permission.CREATE_SALE]),
  router.sale
);
app.use(
  "/api/sale-items",
  authorizePermission([Permission.READ_SALE_ITEM, Permission.CREATE_SALE_ITEM]),
  router.saleItems
);

// // Routes de Gestion alimentaire

// // Routes de Gestion de la production et des ventes
app.use(
  "/api/productions",
  authorizePermission([Permission.READ_PRODUCTION, Permission.CREATE_PRODUCTION]),
  router.production
);

// // Routes de Gestion financiere
app.use(
  "/api/payments",
  authorizePermission([Permission.READ_PAYMENT, Permission.CREATE_PAYMENT]),
  router.payment
);

app.use(
  "/api/purchases",
  authorizePermission([Permission.READ_PURCHASE, Permission.CREATE_PURCHASE]),
  router.purchase
);

app.use(
  "/api/Invoices", 
  authorizePermission([Permission.READ_INVOICE, Permission.CREATE_INVOICE]),
  router.invoice
);




// // Routes de Gestion des équipements et maintenance
app.use(
  "/api/equipment-maintenances",
  authorizePermission([
    Permission.READ_EQUIPMENT_MAINTENANCE,
    Permission.CREATE_EQUIPMENT_MAINTENANCE,
  ]),
  router.equipmentMaintenance
);

app.use(
  "/api/equipments",
  authorizePermission([Permission.READ_EQUIPMENT, Permission.CREATE_EQUIPMENT]),
  router.equipment
)

// // Routes de Gestion de la productivité et suivi


// // Routes de Gestion Stock & inventaire
app.use(
  "/api/Feedstocks",
  authorizePermission([Permission.CREATE_FEEDSTOCK, Permission.READ_FEEDSTOCK]),
  router.feedstock
);
app.use(
  "/api/FeedUsages",
  authorizePermission([Permission.CREATE_FEED_USAGE, Permission.READ_FEED_USAGE]),
  router.feedUsage
)
app.use(
  "/api/inventories",
  authorizePermission([Permission.READ_INVENTORY, Permission.CREATE_INVENTORY]),
  router.inventory
);

app.use(
  "/api/Suppliers",
  authorizePermission([Permission.READ_SUPPLIER, Permission.CREATE_SUPPLIER, Permission.UPDATE_SUPPLIER, Permission.DELETE_SUPPLIER]),
  router.supplier
)

app.use(
  "/api/FeedPurchases",
  authorizePermission([Permission.READ_FEED_PURCHASE, Permission.CREATE_FEED_PURCHASE, Permission.UPDATE_FEED_PURCHASE, Permission.DELETE_FEED_PURCHASE]),
  router.feedPurchase
)

// // Routes de Gestion Notifications et logs
app.use(
  "/api/notifications",
  authorizePermission([Permission.READ_NOTIFICATION, Permission.CREATE_NOTIFICATION]),
  router.notifications
);

app.use(
  "/api/alerts",
  authorizePermission([Permission.READ_ALERT, Permission.CREATE_ALERT]),
  router.alert
)



// Routes non trouvées
app.use(notFound);

// Middleware gestion d'erreurs
app.use(errorHandler);

// =====================
// Server
// =====================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(
    "=================================================================="
  );
  console.log(` Server running on http://localhost:${PORT}`);
  console.log(` API disponible sur http://localhost:${PORT}/api`);
  console.log(
    "=================================================================="
  );
});
