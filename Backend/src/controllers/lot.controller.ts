import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllLots = async (req: Request, res: Response) => {
  try {
    const lots = await prisma.lots.findMany({ // ← "lots" au lieu de "lot"
      include: { 
        ferme: { // ← Inclure la ferme
          select: {
            id_ferme: true,
            nom: true,
            proprietaire: {
              select: {
                nom: true
              }
            }
          }
        },
        animaux: true, // ← "animaux" au lieu de "sante", "alimentation", etc.
        production: {
          take: 10, // Limiter les productions récentes
          orderBy: {
            date_collecte: 'desc'
          }
        },
        _count: {
          select: {
            animaux: true,
            production: true
          }
        }
      },
      orderBy: {
        date_entree: 'desc'
      }
    });
    res.json(lots);
  } catch (err) {
    console.error('Erreur getAllLots:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const getLotById = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  try {
    const lot = await prisma.lots.findUnique({ // ← "lots" au lieu de "lot"
      where: { id_lot: id }, // ← "id_lot" au lieu de "id"
      include: { 
        ferme: {
          select: {
            id_ferme: true,
            nom: true,
            adresse: true
          }
        },
        animaux: {
          include: {
            productions: {
              take: 5,
              orderBy: {
                date_collecte: 'desc'
              }
            }
          }
        },
        production: {
          orderBy: {
            date_collecte: 'desc'
          }
        }
      }
    });
    if (!lot) return res.status(404).json({ error: 'Lot non trouvé' });
    res.json(lot);
  } catch (err) {
    console.error('Erreur getLotById:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const createLot = async (req: Request, res: Response) => {
  try {
    const { ferme_id, espece, categorie, tranche_age, quantite, date_entree, statut } = req.body; // ← Champs de ton schéma
    
    // Validation
    if (!ferme_id) return res.status(400).json({ error: 'La ferme est obligatoire' });
    if (!espece) return res.status(400).json({ error: 'L\'espèce est obligatoire' });
    if (!quantite) return res.status(400).json({ error: 'La quantité est obligatoire' });

    // Vérifier si la ferme existe
    const ferme = await prisma.fermes.findUnique({
      where: { id_ferme: Number(ferme_id) }
    });

    if (!ferme) {
      return res.status(404).json({ error: 'Ferme non trouvée' });
    }

    const lot = await prisma.lots.create({ // ← "lots" au lieu de "lot"
      data: { 
        ferme_id: Number(ferme_id),
        espece,
        categorie: categorie || null,
        tranche_age: tranche_age || null, // ← "tranche_age" au lieu de "trancheAge"
        quantite: Number(quantite),
        date_entree: date_entree ? new Date(date_entree) : new Date(), // ← "date_entree" au lieu de "dateEntree"
        statut: statut || 'Actif'
      },
      include: {
        ferme: {
          select: {
            id_ferme: true,
            nom: true
          }
        }
      }
    });
    res.status(201).json(lot);
  } catch (err) {
    console.error('Erreur createLot:', err);
    res.status(500).json({ error: 'Erreur lors de la création' });
  }
};

export const updateLot = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { espece, categorie, tranche_age, quantite, date_entree, statut } = req.body; // ← Champs de ton schéma
  
  try {
    const lotExist = await prisma.lots.findUnique({ // ← "lots" au lieu de "lot"
      where: { id_lot: id } // ← "id_lot" au lieu de "id"
    });
    
    if (!lotExist) return res.status(404).json({ error: 'Lot non trouvé' });

    const updateData: any = {};
    
    if (espece !== undefined) updateData.espece = espece;
    if (categorie !== undefined) updateData.categorie = categorie;
    if (tranche_age !== undefined) updateData.tranche_age = tranche_age;
    if (statut !== undefined) updateData.statut = statut;
    
    if (quantite !== undefined) updateData.quantite = Number(quantite);
    if (date_entree) updateData.date_entree = new Date(date_entree);

    const updated = await prisma.lots.update({ // ← "lots" au lieu de "lot"
      where: { id_lot: id }, // ← "id_lot" au lieu de "id"
      data: updateData,
      include: {
        ferme: {
          select: {
            id_ferme: true,
            nom: true
          }
        },
        _count: {
          select: {
            animaux: true
          }
        }
      }
    });
    res.json(updated);
  } catch (err) {
    console.error('Erreur updateLot:', err);
    res.status(500).json({ error: 'Erreur lors de la mise à jour' });
  }
};

export const deleteLot = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  try {
    // Vérifier s'il y a des animaux dans le lot
    const animauxCount = await prisma.animaux.count({
      where: { lot_id: id }
    });

    if (animauxCount > 0) {
      return res.status(400).json({ 
        error: 'Impossible de supprimer ce lot car il contient des animaux' 
      });
    }

    await prisma.lots.delete({ 
      where: { id_lot: id } // ← "id_lot" au lieu de "id"
    });
    res.status(204).send();
  } catch (err: any) {
    console.error('Erreur deleteLot:', err);
    if (err.code === 'P2025') return res.status(404).json({ error: 'Lot non trouvé' });
    
    if (err.code === 'P2003') {
      return res.status(400).json({ 
        error: 'Impossible de supprimer ce lot car il est lié à d\'autres données' 
      });
    }
    
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Fonctions supplémentaires utiles
export const getLotsByFerme = async (req: Request, res: Response) => {
  const fermeId = Number(req.params.fermeId);
  try {
    const lots = await prisma.lots.findMany({
      where: { ferme_id: fermeId },
      include: {
        _count: {
          select: {
            animaux: true
          }
        },
        animaux: {
          take: 3 // Aperçu des animaux
        }
      },
      orderBy: {
        date_entree: 'desc'
      }
    });
    res.json(lots);
  } catch (err) {
    console.error('Erreur getLotsByFerme:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const getLotsByStatut = async (req: Request, res: Response) => {
  const statut = req.params.statut;
  try {
    const lots = await prisma.lots.findMany({
      where: { statut },
      include: {
        ferme: {
          select: {
            id_ferme: true,
            nom: true
          }
        },
        _count: {
          select: {
            animaux: true
          }
        }
      },
      orderBy: {
        date_entree: 'desc'
      }
    });
    res.json(lots);
  } catch (err) {
    console.error('Erreur getLotsByStatut:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const addAnimalToLot = async (req: Request, res: Response) => {
  const lotId = Number(req.params.lotId);
  const { animalId } = req.body;
  
  try {
    // Vérifier si le lot existe
    const lot = await prisma.lots.findUnique({
      where: { id_lot: lotId }
    });

    if (!lot) {
      return res.status(404).json({ error: 'Lot non trouvé' });
    }

    // Vérifier si l'animal existe
    const animal = await prisma.animaux.findUnique({
      where: { id_animal: Number(animalId) }
    });

    if (!animal) {
      return res.status(404).json({ error: 'Animal non trouvé' });
    }

    // Ajouter l'animal au lot
    const updatedAnimal = await prisma.animaux.update({
      where: { id_animal: Number(animalId) },
      data: { lot_id: lotId },
      include: {
        lot: true,
        ferme: {
          select: {
            nom: true
          }
        }
      }
    });

    res.json(updatedAnimal);
  } catch (err) {
    console.error('Erreur addAnimalToLot:', err);
    res.status(500).json({ error: 'Erreur lors de l\'ajout de l\'animal au lot' });
  }
};