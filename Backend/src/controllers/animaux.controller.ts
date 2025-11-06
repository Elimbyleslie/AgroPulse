import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { logAction } from '../controllers/audit.controller';

const prisma = new PrismaClient();

// Créer un animal
export const createAnimal = async (req: Request, res: Response) => {
  try {
    const { ferme_id, numero_identification, espece, race, date_naissance, poids_actuel, statut, lot_id, sexe } = req.body;
    const userId = (req as any).user?.id_user;

    // Validation des champs requis
    if (!ferme_id) {
      return res.status(400).json({ error: "La ferme est requise" });
    }
    if (!espece) {
      return res.status(400).json({ error: "L'espèce est requise" });
    }

    // Vérifier si la ferme existe
    const ferme = await prisma.fermes.findUnique({
      where: { id_ferme: Number(ferme_id) }
    });

    if (!ferme) {
      return res.status(404).json({ error: "Ferme non trouvée" });
    }

    // Vérifier si le numéro d'identification est unique (si fourni)
    if (numero_identification) {
      const existingAnimal = await prisma.animaux.findUnique({
        where: { numero_identification }
      });
      if (existingAnimal) {
        return res.status(400).json({ error: "Ce numéro d'identification existe déjà" });
      }
    }

    // Vérifier si le lot existe (si fourni)
    if (lot_id) {
      const lot = await prisma.lots.findUnique({
        where: { id_lot: Number(lot_id) }
      });
      if (!lot) {
        return res.status(404).json({ error: "Lot non trouvé" });
      }
    }

    const animal = await prisma.animaux.create({
      data: {
        ferme_id: Number(ferme_id),
        numero_identification: numero_identification || null,
        espece,
        race: race || null,
        sexe: sexe || null,
        date_naissance: date_naissance ? new Date(date_naissance) : null,
        poids_actuel: poids_actuel ? parseFloat(poids_actuel) : null,
        statut: statut || 'ACTIF',
        lot_id: lot_id ? Number(lot_id) : null,
      },
      include: {
        ferme: {
          select: {
            id_ferme: true,
            nom: true
          }
        },
        lot: {
          select: {
            id_lot: true,
            espece: true
          }
        }
      }
    });

    //  AJOUT AUDIT - Création animal
    await logAction({
      utilisateur_id: userId,
      ferme_id: Number(ferme_id),
      table_cible: 'animaux',
      id_cible: animal.id_animal,
      action: 'creation',
      nouvelles_valeurs: animal,
      ip_address: req.ip
    });

    res.status(201).json(animal);
  } catch (error) {
    console.error('Erreur createAnimal:', error);
    res.status(500).json({ error: "Erreur lors de la création de l'animal" });
  }
};

// Lire tous les animaux
export const getAllAnimaux = async (req: Request, res: Response) => {
  try {
    const { ferme_id, espece, statut, lot_id } = req.query;
    const userId = (req as any).user?.id_user;

    // Construction des filtres
    const where: any = {};
    
    if (ferme_id) where.ferme_id = Number(ferme_id);
    if (espece) where.espece = espece;
    if (statut) where.statut = statut;
    if (lot_id) where.lot_id = Number(lot_id);

    const animaux = await prisma.animaux.findMany({
      where,
      include: { 
        ferme: {
          select: {
            id_ferme: true,
            nom: true,
            adresse: true
          }
        }, 
        lot: {
          select: {
            id_lot: true,
            espece: true,
            categorie: true
          }
        },
        production: {
          take: 5,
          orderBy: {
            date_collecte: 'desc'
          }
        }
      },
      orderBy: { id_animal: "desc" },
    });

    //  AJOUT AUDIT - Consultation animaux
    await logAction({
      utilisateur_id: userId,
      table_cible: 'animaux',
      action: 'consultation_liste',
      nouvelles_valeurs: { 
        filters: { ferme_id, espece, statut, lot_id },
        count: animaux.length 
      },
      ip_address: req.ip
    });

    res.json(animaux);
  } catch (error) {
    console.error('Erreur getAllAnimaux:', error);
    res.status(500).json({ error: "Erreur de récupération des animaux" });
  }
};

// Lire un animal par ID
export const getAnimalById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id_user;

    if (isNaN(Number(id))) {
      return res.status(400).json({ error: "ID invalide" });
    }

    const animal = await prisma.animaux.findUnique({
      where: { id_animal: Number(id) },
      include: { 
        ferme: {
          select: {
            id_ferme: true,
            nom: true,
            adresse: true,
            proprietaire: {
              select: {
                nom: true,
                email: true
              }
            }
          }
        }, 
        lot: {
          select: {
            id_lot: true,
            espece: true,
            categorie: true
          }
        },
        production: {
          orderBy: {
            date_collecte: 'desc'
          },
          take: 10
        },
        sante: {
          orderBy: {
            date_debut: 'desc'
          },
          take: 10
        }
      },
    });

    if (!animal) {
      return res.status(404).json({ error: "Animal non trouvé" });
    }

    //  AJOUT AUDIT - Consultation détaillée animal
    await logAction({
      utilisateur_id: userId,
      ferme_id: animal.ferme_id,
      table_cible: 'animaux',
      id_cible: animal.id_animal,
      action: 'consultation_detail',
      ip_address: req.ip
    });

    res.json(animal);
  } catch (error) {
    console.error('Erreur getAnimalById:', error);
    res.status(500).json({ error: "Erreur de lecture de l'animal" });
  }
};

// Mettre à jour un animal
export const updateAnimal = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { numero_identification, espece, race, sexe, date_naissance, poids_actuel, statut, lot_id } = req.body;
    const userId = (req as any).user?.id_user;

    if (isNaN(Number(id))) {
      return res.status(400).json({ error: "ID invalide" });
    }

    // Vérifier si l'animal existe
    const animalExist = await prisma.animaux.findUnique({
      where: { id_animal: Number(id) },
      include: {
        ferme: {
          select: {
            id_ferme: true,
            nom: true
          }
        }
      }
    });

    if (!animalExist) {
      return res.status(404).json({ error: "Animal non trouvé" });
    }

    // Vérifier si le nouveau numéro d'identification est unique (si fourni et changé)
    if (numero_identification && numero_identification !== animalExist.numero_identification) {
      const existingAnimal = await prisma.animaux.findUnique({
        where: { numero_identification }
      });
      if (existingAnimal) {
        return res.status(400).json({ error: "Ce numéro d'identification existe déjà" });
      }
    }

    // Vérifier si le lot existe (si fourni)
    if (lot_id) {
      const lot = await prisma.lots.findUnique({
        where: { id_lot: Number(lot_id) }
      });
      if (!lot) {
        return res.status(404).json({ error: "Lot non trouvé" });
      }
    }

    const updateData: any = {};
    
    if (numero_identification !== undefined) updateData.numero_identification = numero_identification;
    if (espece !== undefined) updateData.espece = espece;
    if (race !== undefined) updateData.race = race;
    if (sexe !== undefined) updateData.sexe = sexe;
    if (statut !== undefined) updateData.statut = statut;
    
    if (poids_actuel !== undefined) updateData.poids_actuel = poids_actuel ? parseFloat(poids_actuel) : null;
    if (date_naissance) updateData.date_naissance = new Date(date_naissance);
    if (lot_id !== undefined) updateData.lot_id = lot_id ? Number(lot_id) : null;

    const updated = await prisma.animaux.update({
      where: { id_animal: Number(id) },
      data: updateData,
      include: {
        ferme: {
          select: {
            id_ferme: true,
            nom: true
          }
        },
        lot: {
          select: {
            id_lot: true,
            espece: true
          }
        }
      }
    });

    //  AJOUT AUDIT - Modification animal
    await logAction({
      utilisateur_id: userId,
      ferme_id: animalExist.ferme_id,
      table_cible: 'animaux',
      id_cible: Number(id),
      action: 'modification',
      anciennes_valeurs: animalExist,
      nouvelles_valeurs: updated,
      ip_address: req.ip
    });

    res.json(updated);
  } catch (error: any) {
    console.error('Erreur updateAnimal:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({ error: "Animal non trouvé" });
    }
    
    res.status(500).json({ error: "Erreur de mise à jour de l'animal" });
  }
};

// Supprimer un animal
export const deleteAnimal = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id_user;

    if (isNaN(Number(id))) {
      return res.status(400).json({ error: "ID invalide" });
    }

    // Vérifier si l'animal existe
    const animalExist = await prisma.animaux.findUnique({
      where: { id_animal: Number(id) },
      include: {
        ferme: {
          select: {
            id_ferme: true,
            nom: true
          }
        }
      }
    });

    if (!animalExist) {
      return res.status(404).json({ error: "Animal non trouvé" });
    }

    // Vérifier si l'animal a des productions ou données de santé liées
    const [productionsCount, santeCount] = await Promise.all([
      prisma.production.count({ where: { animal_id: Number(id) } }),
      prisma.sante.count({ where: { animal_id: Number(id) } })
    ]);

    if (productionsCount > 0 || santeCount > 0) {
      return res.status(400).json({ 
        error: "Impossible de supprimer cet animal car il a des productions ou données de santé associées" 
      });
    }

    await prisma.animaux.delete({ 
      where: { id_animal: Number(id) } 
    });

    //  AJOUT AUDIT - Suppression animal
    await logAction({
      utilisateur_id: userId,
      ferme_id: animalExist.ferme_id,
      table_cible: 'animaux',
      id_cible: Number(id),
      action: 'suppression',
      anciennes_valeurs: animalExist,
      ip_address: req.ip
    });

    res.status(204).send(); // 204 No Content pour les suppressions
  } catch (error: any) {
    console.error('Erreur deleteAnimal:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({ error: "Animal non trouvé" });
    }
    
    res.status(500).json({ error: "Erreur de suppression de l'animal" });
  }
};

// Fonctions supplémentaires utiles
export const getAnimauxByFerme = async (req: Request, res: Response) => {
  try {
    const { fermeId } = req.params;
    const { espece, statut } = req.query;
    const userId = (req as any).user?.id_user;

    if (isNaN(Number(fermeId))) {
      return res.status(400).json({ error: "ID de ferme invalide" });
    }

    const where: any = {
      ferme_id: Number(fermeId)
    };

    if (espece) where.espece = espece;
    if (statut) where.statut = statut;

    const animaux = await prisma.animaux.findMany({
      where,
      include: {
        lot: {
          select: {
            id_lot: true,
            espece: true
          }
        },
        _count: {
          select: {
            production: true,
            sante: true
          }
        }
      },
      orderBy: { id_animal: "desc" }
    });

    //  AJOUT AUDIT - Consultation animaux par ferme
    await logAction({
      utilisateur_id: userId,
      ferme_id: Number(fermeId),
      table_cible: 'animaux',
      action: 'consultation_par_ferme',
      nouvelles_valeurs: { 
        ferme_id: Number(fermeId),
        filters: { espece, statut },
        count: animaux.length 
      },
      ip_address: req.ip
    });

    res.json(animaux);
  } catch (error) {
    console.error('Erreur getAnimauxByFerme:', error);
    res.status(500).json({ error: "Erreur de récupération des animaux" });
  }
};

export const getAnimauxStats = async (req: Request, res: Response) => {
  try {
    const { ferme_id } = req.query;
    const userId = (req as any).user?.id_user;

    const where: any = {};
    if (ferme_id) where.ferme_id = Number(ferme_id);

    const stats = await prisma.animaux.groupBy({
      by: ['espece', 'statut'],
      where,
      _count: {
        id_animal: true
      },
      _avg: {
        poids_actuel: true
      }
    });

    //  AJOUT AUDIT - Consultation statistiques animaux
    await logAction({
      utilisateur_id: userId,
      ferme_id: ferme_id ? Number(ferme_id) : undefined,
      table_cible: 'animaux',
      action: 'consultation_statistiques',
      nouvelles_valeurs: { 
        ferme_id: ferme_id ? Number(ferme_id) : 'toutes',
        stats_count: stats.length 
      },
      ip_address: req.ip
    });

    res.json(stats);
  } catch (error) {
    console.error('Erreur getAnimauxStats:', error);
    res.status(500).json({ error: "Erreur lors du calcul des statistiques" });
  }
};

// Mettre à jour le poids d'un animal
export const updatePoidsAnimal = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { poids } = req.body;
    const userId = (req as any).user?.id_user;

    if (isNaN(Number(id))) {
      return res.status(400).json({ error: "ID invalide" });
    }

    if (!poids) {
      return res.status(400).json({ error: "Le poids est requis" });
    }

    const animalExist = await prisma.animaux.findUnique({
      where: { id_animal: Number(id) },
      select: {
        id_animal: true,
        ferme_id: true,
        poids_actuel: true,
        numero_identification: true
      }
    });

    if (!animalExist) {
      return res.status(404).json({ error: "Animal non trouvé" });
    }

    const animal = await prisma.animaux.update({
      where: { id_animal: Number(id) },
      data: { 
        poids_actuel: parseFloat(poids) 
      },
      include: {
        ferme: {
          select: {
            nom: true
          }
        }
      }
    });

    //  AJOUT AUDIT - Mise à jour poids animal
    await logAction({
      utilisateur_id: userId,
      ferme_id: animalExist.ferme_id,
      table_cible: 'animaux',
      id_cible: Number(id),
      action: 'mise_a_jour_poids',
      anciennes_valeurs: { poids_actuel: animalExist.poids_actuel },
      nouvelles_valeurs: { poids_actuel: parseFloat(poids) },
      ip_address: req.ip
    });

    res.json(animal);
  } catch (error: any) {
    console.error('Erreur updatePoidsAnimal:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({ error: "Animal non trouvé" });
    }
    
    res.status(500).json({ error: "Erreur lors de la mise à jour du poids" });
  }
};

// Rechercher des animaux
export const searchAnimaux = async (req: Request, res: Response) => {
  try {
    const { q, ferme_id } = req.query;
    const userId = (req as any).user?.id_user;

    if (!q) {
      return res.status(400).json({ error: "Le terme de recherche est requis" });
    }

    const where: any = {
      OR: [
        { numero_identification: { contains: q as string } },
        { espece: { contains: q as string } },
        { race: { contains: q as string } }
      ]
    };

    if (ferme_id) where.ferme_id = Number(ferme_id);

    const animaux = await prisma.animaux.findMany({
      where,
      include: {
        ferme: {
          select: {
            id_ferme: true,
            nom: true
          }
        },
        lot: {
          select: {
            id_lot: true,
            espece: true
          }
        }
      },
      take: 50,
      orderBy: { id_animal: "desc" }
    });

    // ✅ AJOUT AUDIT - Recherche animaux
    await logAction({
      utilisateur_id: userId,
      ferme_id: ferme_id ? Number(ferme_id) : undefined,
      table_cible: 'animaux',
      action: 'recherche',
      nouvelles_valeurs: { 
        search_term: q,
        ferme_id: ferme_id ? Number(ferme_id) : 'toutes',
        results_count: animaux.length 
      },
      ip_address: req.ip
    });

    res.json(animaux);
  } catch (error) {
    console.error('Erreur searchAnimaux:', error);
    res.status(500).json({ error: "Erreur lors de la recherche" });
  }
};