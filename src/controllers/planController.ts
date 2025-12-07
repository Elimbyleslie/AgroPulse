// src/controllers/planController.ts
import { Request, Response } from 'express';
import prisma from '../models/prismaClient.js';
import  ResponseApi  from '../helpers/response.js';
import { Plan } from '../typages/plan.js';
// Créer un plan
export const createPlan = async (req: Request<any, any, Plan>, res: Response) => {
  try {
    const { name, price, durationDays, description, billingCycle, userLimit, storageLimit, animalLimit } = req.body;

    if (!name || !price || !durationDays || !billingCycle) {
      return ResponseApi.error(res, 'Champs requis manquants', 400);
    }

    const plan = await prisma.plan.create({
      data: { name, price, durationDays, description, billingCycle, userLimit, storageLimit, animalLimit },
    });

    return ResponseApi.success(res, 'Plan créé', 201, plan);
  } catch (error) {
    console.error(error);
    return ResponseApi.error(res, 'Erreur serveur', 500);
  }
};

// Lister tous les plans
export const getAllPlans = async (_req: Request, res: Response) => {
  try {
    const plans = await prisma.plan.findMany({ orderBy: { id: 'asc' } });
    return ResponseApi.success(res, 'Liste des plans', 200, plans);
  } catch (error) {
    console.error(error);
    return ResponseApi.error(res, 'Erreur serveur', 500);
  }
};

// Mettre à jour un plan
export const updatePlan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const plan = await prisma.plan.update({ where: { id: Number(id) }, data });
    return ResponseApi.success(res, 'Plan mis à jour', 200, plan);
  } catch (error) {
    console.error(error);
    return ResponseApi.error(res, 'Erreur serveur', 500);
  }
};

// Supprimer un plan
export const deletePlan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.plan.delete({ where: { id: Number(id) } });
    return ResponseApi.success(res, 'Plan supprimé', 200, null);
  } catch (error) {
    console.error(error);
    return ResponseApi.error(res, 'Erreur serveur', 500);
  }
};
