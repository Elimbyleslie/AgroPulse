import auth from './auth.router.js';
import user from './user.router.js';
import audit from './audit.router.js';
import organization from './organization.router.js';
import plan from './plan.router.js' 
import animal from './animal.router.js';
import lot from './lot.router.js';
import barn from './barn.router.js';
import herd from './herd.js'
import farm from './farm.router.js'
import AnimalHealthRecord from './animalHealthRecord.js';
import AnimalTreatment  from './animalTreatement.js';
import animalDeath from './AnimalDeath.js';
import animalTransfer from './animalTransfert.router.js';
import animaVaccination from './animalVaccination.router.js';
import pen from './pen.router.js';
import species from './species.js';
import breed from './breed.router.js';
import AnimalWeight from './animalWeight.router.js'
import AnimalMovement from './animalMovement.js'
import payment from './payments.js';
import purchase from './purchase.js';
import birth from './birth.js';
import animalReproduction from './animalReproduction.routes.js';
import reproductionBirth from './reproductionBirth.js';
import production from  './production.js';
import expense from './expense.js';
import sale from './sale.js';
import saleItems from './saleItems.js';
import expenseCategory from './expenseCategory.js';
import notifications from './notification.js';
import apiKeys from './apikey.js';
import feedstock from './feedStock.js';
import feedUsage from './feedUsage.js';
import report from './report.js';
import FinancialReport from './financialReport.js';
import farmtask from './farmTask.js';
import animalFeeding from './animalFeeding.js';
import equipment from './equipment.js';
import equipmentMaintenance from './equipmentMaintenance.js';
import  alert from './alert.js';
import inventory from './inventory.js';
import invoice from './invoice.router.js';
import feedPurchase from './feedPurchase.js';
import supplier from './supplier.js';
import subscription from './subscription.router.js';


const router={
    auth,
    audit,
    user,
    organization,
    plan,
    animal,
    lot,
    AnimalHealthRecord,
    barn,
    herd,
    farm,
    AnimalTreatment,
    pen,
    species,
    breed,
    animaVaccination,
    animalDeath,
    animalTransfer,
    AnimalWeight,
    AnimalMovement,
    payment,
    purchase,
    birth,
    animalReproduction,
    reproductionBirth,
    production,
    expense,
    sale,
    saleItems,
    expenseCategory,
    notifications,
    apiKeys,
    feedstock,
    feedUsage,
    report,
    FinancialReport,
    farmtask,
    animalFeeding,
    equipment,
    equipmentMaintenance,
    alert,
    inventory,
    invoice,
    feedPurchase,
    supplier,
    subscription

}
export default router;