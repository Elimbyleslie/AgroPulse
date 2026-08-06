import { Request, Response } from "express";
import prisma from "../models/prismaClient.js";

// ----------------- PERMISSION CRUD -----------------

export const createPermission = async (req: Request, res: Response) => {
  try {
    const { code, description } = req.body;

    const permission = await prisma.permission.create({
      data: { code, description },
    });
    res.status(201).json(permission);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const getPermissions = async (req: Request, res: Response) => {
  try {
    const permissions = await prisma.permission.findMany();
    res.json(permissions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const getPermissionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const permission = await prisma.permission.findUnique({
      where: { id: Number(id) },
    });
    if (!permission)
      return res.status(404).json({ message: "Permission introuvable" });
    res.json(permission);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const updatePermission = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { code, description } = req.body;
    const permission = await prisma.permission.update({
      where: { id: Number(id) },
      data: { code, description },
    });
    res.json(permission);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const deletePermission = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.permission.delete({ where: { id: Number(id) } });
    res.json({ message: "Permission supprimée" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
