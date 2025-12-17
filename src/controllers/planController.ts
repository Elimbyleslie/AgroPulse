
import { Request, Response } from "express";
import prisma from "../models/prismaClient.js";
import ResponseApi from "../helpers/response.js";
import { Plan } from "../typages/plan.js";
// Créer un plan
export const createPlan = async (
  req: Request<any, any, Plan>,
  res: Response
) => {
  try {
    const {
      name,
      price,
      durationDays,
      description,
      billingCycle,
      userLimit,
      storageLimit,
      animalLimit,
    } = req.body;

    if (!name || !price || !durationDays || !billingCycle) {
      return ResponseApi.error(res, "Champs requis manquants", 400);
    }

    const plan = await prisma.plan.create({
      data: {
        name,
        price,
        durationDays,
        description,
        billingCycle,
        userLimit,
        storageLimit,
        animalLimit,
      },
    });

    return ResponseApi.success(res, "Plan créé", 201, plan);
  } catch (error) {
    console.error(error);
    return ResponseApi.error(res, "Erreur serveur", 500);
  }
};

// Lister tous les plans avec pagination
export const getAllPlans = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const plans = await prisma.plan.findMany({
      skip,
      take: limit,
    });
    const totalItems = await prisma.plan.count();
    return ResponseApi.success(res, "Liste des plans", 200, {
      plans,
      pagination: {
        currentPage: page,
        previousPage: page > 1 ? page - 1 : null,
        nextPage: page * limit < totalItems ? page + 1 : null,
        totalItems,
        totalPage: Math.ceil(totalItems / limit),
      },
    });
  } catch (error) {
    console.error(error);
    return ResponseApi.error(res, "Erreur serveur", 500);
  }
};

//Recuperer un plan par ID

export const getPlanById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const plan = await prisma.plan.findUnique({ where: { id: Number(id) } });
    if (!plan) {
      return ResponseApi.error(res, "Plan introuvable", 404);
    }
    return ResponseApi.success(res, "Plan trouvé", 200, plan);
  } catch (error) {
    console.error(error);
    return ResponseApi.error(res, "Erreur serveur", 500);
  }
};  


// Mettre à jour un plan
export const updatePlan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const plan = await prisma.plan.update({ where: { id: Number(id) }, data });
    return ResponseApi.success(res, "Plan mis à jour", 200, plan);
  } catch (error) {
    console.error(error);
    return ResponseApi.error(res, "Erreur serveur", 500);
  }
};

// Supprimer un plan
export const deletePlan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.plan.delete({ where: { id: Number(id) } });
    return ResponseApi.success(res, "Plan supprimé", 200, null);
  } catch (error) {
    console.error(error);
    return ResponseApi.error(res, "Erreur serveur", 500);
  }
};
