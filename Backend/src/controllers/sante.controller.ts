import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getAllSante = async (req: Request, res: Response) => {
  try {
    const sante = await prisma.sante.findMany({ 
      include: { 
        animal: { 
          select: {
            id_animal: true,
            numero_identification: true,
            espece: true,
            race: true
          }
        },
        veterinaire: { 
          select: {
            id_user: true,
            nom: true,
            email: true
          }
        }
      },
      orderBy: {
        date_debut: 'desc' 
      }
    });
    res.json(sante);
  } catch (err) {
    console.error('Erreur getAllSante:', err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

export const getSanteById = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  try {
    const sante = await prisma.sante.findUnique({ 
      where: { id_sante: id }, 
      include: { 
        animal: {
          include: {
            ferme: {
              select: {
                id_ferme: true,
                nom: true
              }
            }
          }
        },
        veterinaire: {
          select: {
            id_user: true,
            nom: true,
            telephone: true
          }
        }
      }
    });
    if (!sante) return res.status(404).json({ error: "Donnée santé non trouvée" });
    res.json(sante);
  } catch (error) {
    console.error('Erreur getSanteById:', error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

export const createSante = async (req: Request, res: Response) => {
  const { animal_id, type, maladie, diagnostic, traitement, date_debut, date_fin, statut, veterinaire_id, cout } = req.body;
  
  try {
    // Validation
    if (!animal_id) {
      return res.status(400).json({ error: "L'animal est requis" });
    }
    if (!type) {
      return res.status(400).json({ error: "Le type est requis" });
    }

    // Vérifier si l'animal existe
    const animal = await prisma.animaux.findUnique({
      where: { id_animal: Number(animal_id) }
    });

    if (!animal) {
      return res.status(404).json({ error: "Animal non trouvé" });
    }

    const newSante = await prisma.sante.create({
      data: { 
        animal_id: Number(animal_id),
        type,
        maladie: maladie || null,
        diagnostic: diagnostic || null,
        traitement: traitement || null,
        date_debut: date_debut ? new Date(date_debut) : new Date(),
        date_fin: date_fin ? new Date(date_fin) : null,
        statut: statut || 'en_cours',
        veterinaire_id: veterinaire_id ? Number(veterinaire_id) : null,
        cout: cout ? parseFloat(cout) : null
      },
      include: {
        animal: {
          select: {
            id_animal: true,
            numero_identification: true,
            espece: true
          }
        }
      }
    });
    res.status(201).json(newSante);
  } catch (error) {
    console.error('Erreur createSante:', error);
    res.status(500).json({ error: "Erreur lors de la création" });
  }
};

export const updateSante = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { maladie, diagnostic, traitement, date_debut, date_fin, statut, cout } = req.body;
  
  try {
    const santeExist = await prisma.sante.findUnique({
      where: { id_sante: id } 
    });

    if (!santeExist) {
      return res.status(404).json({ error: "Donnée santé non trouvée" });
    }

    const updateData: any = {};
    
    if (maladie !== undefined) updateData.maladie = maladie;
    if (diagnostic !== undefined) updateData.diagnostic = diagnostic;
    if (traitement !== undefined) updateData.traitement = traitement;
    if (statut !== undefined) updateData.statut = statut;
    if (cout !== undefined) updateData.cout = cout ? parseFloat(cout) : null;
    
    if (date_debut) updateData.date_debut = new Date(date_debut);
    if (date_fin) updateData.date_fin = new Date(date_fin);

    const updated = await prisma.sante.update({
      where: { id_sante: id }, 
      data: updateData,
      include: {
        animal: {
          select: {
            id_animal: true,
            numero_identification: true,
            espece: true
          }
        }
      }
    });
    
    res.json(updated);
  } catch (error) {
    console.error('Erreur updateSante:', error);
    res.status(500).json({ error: "Erreur lors de la mise à jour" });
  }
};

export const deleteSante = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  try {
    await prisma.sante.delete({ 
      where: { id_sante: id } 
    });
    res.status(204).send();
  } catch (error: any) {
    console.error('Erreur deleteSante:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({ error: "Donnée santé non trouvée" });
    }
    
    res.status(500).json({ error: "Erreur lors de la suppression" });
  }
};

// Fonctions supplémentaires 
export const getSanteByAnimal = async (req: Request, res: Response) => {
  const animalId = Number(req.params.animalId);
  try {
    const sante = await prisma.sante.findMany({
      where: { animal_id: animalId },
      include: {
        veterinaire: {
          select: {
            id_user: true,
            nom: true
          }
        }
      },
      orderBy: {
        date_debut: 'desc'
      }
    });
    res.json(sante);
  } catch (error) {
    console.error('Erreur getSanteByAnimal:', error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

export const getSanteByStatut = async (req: Request, res: Response) => {
  const statut = req.params.statut;
  try {
    const sante = await prisma.sante.findMany({
      where: { statut },
      include: {
        animal: {
          select: {
            id_animal: true,
            numero_identification: true,
            espece: true,
            ferme: {
              select: {
                nom: true
              }
            }
          }
        }
      },
      orderBy: {
        date_debut: 'desc'
      }
    });
    res.json(sante);
  } catch (error) {
    console.error('Erreur getSanteByStatut:', error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};