import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { logAction } from '../controllers/audit.controller';

const prisma = new PrismaClient();

export const getAllProduction = async (req: Request, res: Response) => {
  try {
    const { ferme_id, animal_id, lot_id, date_debut, date_fin, type_production, page = 1, limit = 50 } = req.query;
    const userId = (req as any).user?.id_user;

    // Construction des filtres
    const where: any = {};
    
    if (ferme_id) where.ferme_id = Number(ferme_id);
    if (animal_id) where.animal_id = Number(animal_id);
    if (lot_id) where.lot_id = Number(lot_id);
    if (type_production) where.type_production = type_production;
    
    // Filtre par date
    if (date_debut || date_fin) {
      where.date_collecte = {};
      if (date_debut) where.date_collecte.gte = new Date(date_debut as string);
      if (date_fin) where.date_collecte.lte = new Date(date_fin as string);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [productions, total] = await Promise.all([
      prisma.production.findMany({
        where,
        include: { 
          ferme: {
            select: {
              id_ferme: true,
              nom: true
            }
          },
          animal: {
            select: {
              id_animal: true,
              numero_identification: true,
              espece: true
            }
          },
          lot: {
            select: {
              id_lot: true,
              espece: true,
              categorie: true
            }
          },
          operateur: {
            select: {
              id_user: true,
              nom: true
            }
          }
        },
        orderBy: {
          date_collecte: 'desc'
        },
        skip,
        take: Number(limit)
      }),
      prisma.production.count({ where })
    ]);

    // ✅ AJOUT AUDIT - Consultation production
    await logAction({
      utilisateur_id: userId,
      ferme_id: ferme_id ? Number(ferme_id) : undefined,
      table_cible: 'production',
      action: 'consultation_liste',
      nouvelles_valeurs: { 
        filters: { ferme_id, animal_id, lot_id, type_production, date_debut, date_fin },
        count: productions.length 
      },
      ip_address: req.ip
    });

    res.json({
      productions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Erreur getAllProduction:', error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

export const getProductionById = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const userId = (req as any).user?.id_user;

  try {
    const production = await prisma.production.findUnique({
      where: { id: id },
      include: { 
        ferme: {
          select: {
            id_ferme: true,
            nom: true,
            adresse: true
          }
        },
        animal: {
          select: {
            id_animal: true,
            numero_identification: true,
            espece: true,
            race: true
          }
        },
        lot: {
          select: {
            id_lot: true,
            espece: true,
            categorie: true
          }
        },
        operateur: {
          select: {
            id_user: true,
            nom: true,
            email: true
          }
        }
      }
    });
    
    if (!production) {
      return res.status(404).json({ error: "Production non trouvée" });
    }

    // ✅ AJOUT AUDIT - Consultation détaillée production
    await logAction({
      utilisateur_id: userId,
      ferme_id: production.ferme_id,
      table_cible: 'production',
      id_cible: id,
      action: 'consultation_detail',
      ip_address: req.ip
    });
    
    res.json(production);
  } catch (error) {
    console.error('Erreur getProductionById:', error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

export const createProduction = async (req: Request, res: Response) => {
  const { ferme_id, animal_id, lot_id, type_production, quantite, unite, date_collecte, operateur_id, qualite, prix_unitaire } = req.body;
  const userId = (req as any).user?.id_user;
  
  try {
    // Validation
    if (!type_production) {
      return res.status(400).json({ error: "Le type de production est requis" });
    }
    if (!quantite) {
      return res.status(400).json({ error: "La quantité est requise" });
    }
    if (!ferme_id) {
      return res.status(400).json({ error: "La ferme est requise" });
    }

    // Vérifier si la ferme existe
    const ferme = await prisma.fermes.findUnique({
      where: { id_ferme: Number(ferme_id) }
    });

    if (!ferme) {
      return res.status(404).json({ error: "Ferme non trouvée" });
    }

    // Vérifier si l'animal existe (si fourni)
    if (animal_id) {
      const animal = await prisma.animaux.findUnique({
        where: { id_animal: Number(animal_id) }
      });
      if (!animal) {
        return res.status(404).json({ error: "Animal non trouvé" });
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

    const newProduction = await prisma.production.create({
      data: { 
        ferme_id: Number(ferme_id),
        animal_id: animal_id ? Number(animal_id) : null,
        lot_id: lot_id ? Number(lot_id) : null,
        type_production,
        quantite: Number(quantite),
        unite: unite || 'unite',
        date_collecte: date_collecte ? new Date(date_collecte) : new Date(),
        operateur_id: operateur_id ? Number(operateur_id) : null,
        qualite: qualite || null,
        prix_unitaire: prix_unitaire ? parseFloat(prix_unitaire) : null
      },
      include: {
        ferme: {
          select: {
            id_ferme: true,
            nom: true
          }
        },
        animal: {
          select: {
            id_animal: true,
            numero_identification: true
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

    // ✅ AJOUT AUDIT - Création production
    await logAction({
      utilisateur_id: userId,
      ferme_id: Number(ferme_id),
      table_cible: 'production',
      id_cible: newProduction.id,
      action: 'creation',
      nouvelles_valeurs: newProduction,
      ip_address: req.ip
    });

    res.status(201).json(newProduction);
  } catch (error) {
    console.error('Erreur createProduction:', error);
    res.status(500).json({ error: "Erreur lors de la création" });
  }
};

export const updateProduction = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { type_production, quantite, unite, date_collecte, qualite, prix_unitaire } = req.body;
  const userId = (req as any).user?.id_user;
  
  try {
    const productionExist = await prisma.production.findUnique({
      where: { id: id },
      include: {
        ferme: {
          select: {
            id_ferme: true,
            nom: true
          }
        }
      }
    });

    if (!productionExist) {
      return res.status(404).json({ error: "Production non trouvée" });
    }

    const updateData: any = {};
    
    if (type_production !== undefined) updateData.type_production = type_production;
    if (unite !== undefined) updateData.unite = unite;
    if (qualite !== undefined) updateData.qualite = qualite;
    
    if (quantite !== undefined) updateData.quantite = Number(quantite);
    if (prix_unitaire !== undefined) updateData.prix_unitaire = prix_unitaire ? parseFloat(prix_unitaire) : null;
    if (date_collecte) updateData.date_collecte = new Date(date_collecte);

    const updated = await prisma.production.update({
      where: { id: id },
      data: updateData,
      include: {
        ferme: {
          select: {
            id_ferme: true,
            nom: true
          }
        },
        animal: {
          select: {
            id_animal: true,
            numero_identification: true
          }
        }
      }
    });

    // ✅ AJOUT AUDIT - Modification production
    await logAction({
      utilisateur_id: userId,
      ferme_id: productionExist.ferme_id,
      table_cible: 'production',
      id_cible: id,
      action: 'modification',
      anciennes_valeurs: productionExist,
      nouvelles_valeurs: updated,
      ip_address: req.ip
    });
    
    res.json(updated);
  } catch (error: any) {
    console.error('Erreur updateProduction:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({ error: "Production non trouvée" });
    }
    
    res.status(500).json({ error: "Erreur lors de la mise à jour" });
  }
};

export const deleteProduction = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const userId = (req as any).user?.id_user;

  try {
    const productionExist = await prisma.production.findUnique({
      where: { id: id },
      include: {
        ferme: {
          select: {
            id_ferme: true,
            nom: true
          }
        }
      }
    });

    if (!productionExist) {
      return res.status(404).json({ error: "Production non trouvée" });
    }

    await prisma.production.delete({ 
      where: { id: id }
    });

    // ✅ AJOUT AUDIT - Suppression production
    await logAction({
      utilisateur_id: userId,
      ferme_id: productionExist.ferme_id,
      table_cible: 'production',
      id_cible: id,
      action: 'suppression',
      anciennes_valeurs: productionExist,
      ip_address: req.ip
    });

    res.status(204).send();
  } catch (error: any) {
    console.error('Erreur deleteProduction:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({ error: "Production non trouvée" });
    }
    
    res.status(500).json({ error: "Erreur lors de la suppression" });
  }
};

// Fonctions supplémentaires utiles
export const getProductionStats = async (req: Request, res: Response) => {
  try {
    const { ferme_id, date_debut, date_fin } = req.query;
    const userId = (req as any).user?.id_user;

    const where: any = {};
    if (ferme_id) where.ferme_id = Number(ferme_id);
    
    if (date_debut || date_fin) {
      where.date_collecte = {};
      if (date_debut) where.date_collecte.gte = new Date(date_debut as string);
      if (date_fin) where.date_collecte.lte = new Date(date_fin as string);
    }

    const stats = await prisma.production.groupBy({
      by: ['type_production'],
      where,
      _sum: {
        quantite: true
      },
      _avg: {
        quantite: true
      },
      orderBy: {
        _sum: {
          quantite: 'desc'
        }
      }
    });

    // ✅ AJOUT AUDIT - Consultation statistiques production
    await logAction({
      utilisateur_id: userId,
      ferme_id: ferme_id ? Number(ferme_id) : undefined,
      table_cible: 'production',
      action: 'consultation_statistiques',
      nouvelles_valeurs: { 
        ferme_id: ferme_id ? Number(ferme_id) : 'toutes',
        periode: { date_debut, date_fin },
        stats_count: stats.length 
      },
      ip_address: req.ip
    });

    res.json(stats);
  } catch (error) {
    console.error('Erreur getProductionStats:', error);
    res.status(500).json({ error: "Erreur lors du calcul des statistiques" });
  }
};

export const getProductionByFerme = async (req: Request, res: Response) => {
  const fermeId = Number(req.params.fermeId);
  const userId = (req as any).user?.id_user;

  try {
    const productions = await prisma.production.findMany({
      where: { ferme_id: fermeId },
      include: {
        animal: {
          select: {
            id_animal: true,
            numero_identification: true
          }
        },
        lot: {
          select: {
            id_lot: true,
            espece: true
          }
        }
      },
      orderBy: {
        date_collecte: 'desc'
      },
      take: 50 // Limiter les résultats
    });

    // ✅ AJOUT AUDIT - Consultation production par ferme
    await logAction({
      utilisateur_id: userId,
      ferme_id: fermeId,
      table_cible: 'production',
      action: 'consultation_par_ferme',
      nouvelles_valeurs: { 
        ferme_id: fermeId,
        count: productions.length 
      },
      ip_address: req.ip
    });

    res.json(productions);
  } catch (error) {
    console.error('Erreur getProductionByFerme:', error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

export const getProductionByAnimal = async (req: Request, res: Response) => {
  const animalId = Number(req.params.animalId);
  const userId = (req as any).user?.id_user;

  try {
    const animal = await prisma.animaux.findUnique({
      where: { id_animal: animalId },
      select: {
        id_animal: true,
        numero_identification: true,
        ferme_id: true
      }
    });

    if (!animal) {
      return res.status(404).json({ error: "Animal non trouvé" });
    }

    const productions = await prisma.production.findMany({
      where: { animal_id: animalId },
      include: {
        ferme: {
          select: {
            id_ferme: true,
            nom: true
          }
        },
        operateur: {
          select: {
            id_user: true,
            nom: true
          }
        }
      },
      orderBy: {
        date_collecte: 'desc'
      }
    });

    // ✅ AJOUT AUDIT - Consultation production par animal
    await logAction({
      utilisateur_id: userId,
      ferme_id: animal.ferme_id,
      table_cible: 'production',
      action: 'consultation_par_animal',
      nouvelles_valeurs: { 
        animal_id: animalId,
        animal_numero: animal.numero_identification,
        count: productions.length 
      },
      ip_address: req.ip
    });

    res.json({
      animal,
      productions
    });
  } catch (error) {
    console.error('Erreur getProductionByAnimal:', error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

export const createMultipleProduction = async (req: Request, res: Response) => {
  const { productions } = req.body;
  const userId = (req as any).user?.id_user;

  try {
    if (!Array.isArray(productions) || productions.length === 0) {
      return res.status(400).json({ error: "Tableau de productions requis" });
    }

    // Validation des productions
    for (const prod of productions) {
      if (!prod.type_production || !prod.quantite || !prod.ferme_id) {
        return res.status(400).json({ 
          error: "Champs obligatoires manquants: type_production, quantite, ferme_id" 
        });
      }

      // Vérifier si la ferme existe
      const ferme = await prisma.fermes.findUnique({
        where: { id_ferme: Number(prod.ferme_id) }
      });

      if (!ferme) {
        return res.status(404).json({ error: `Ferme ${prod.ferme_id} non trouvée` });
      }
    }

    const createdProductions = await prisma.production.createMany({
      data: productions.map(prod => ({
        ferme_id: Number(prod.ferme_id),
        animal_id: prod.animal_id ? Number(prod.animal_id) : null,
        lot_id: prod.lot_id ? Number(prod.lot_id) : null,
        type_production: prod.type_production,
        quantite: Number(prod.quantite),
        unite: prod.unite || 'unite',
        date_collecte: prod.date_collecte ? new Date(prod.date_collecte) : new Date(),
        operateur_id: prod.operateur_id ? Number(prod.operateur_id) : null,
        qualite: prod.qualite || null,
        prix_unitaire: prod.prix_unitaire ? parseFloat(prod.prix_unitaire) : null
      }))
    });

    // ✅ AJOUT AUDIT - Création multiple productions
    await logAction({
      utilisateur_id: userId,
      table_cible: 'production',
      action: 'creation_multiple',
      nouvelles_valeurs: { 
        count: createdProductions.count,
        fermes: [...new Set(productions.map(prod => prod.ferme_id))]
      },
      ip_address: req.ip
    });

    res.status(201).json({
      message: `${createdProductions.count} production(s) créée(s) avec succès`,
      count: createdProductions.count
    });
  } catch (error) {
    console.error('Erreur createMultipleProduction:', error);
    res.status(500).json({ error: "Erreur lors de la création des productions" });
  }
};

export const getProductionJournaliere = async (req: Request, res: Response) => {
  try {
    const { ferme_id, date } = req.query;
    const userId = (req as any).user?.id_user;

    const targetDate = date ? new Date(date as string) : new Date();
    const dateDebut = new Date(targetDate);
    dateDebut.setHours(0, 0, 0, 0);
    const dateFin = new Date(targetDate);
    dateFin.setHours(23, 59, 59, 999);

    const where: any = {
      date_collecte: {
        gte: dateDebut,
        lte: dateFin
      }
    };

    if (ferme_id) where.ferme_id = Number(ferme_id);

    const productions = await prisma.production.findMany({
      where,
      include: {
        ferme: {
          select: {
            id_ferme: true,
            nom: true
          }
        },
        animal: {
          select: {
            id_animal: true,
            numero_identification: true
          }
        },
        operateur: {
          select: {
            id_user: true,
            nom: true
          }
        }
      },
      orderBy: {
        date_collecte: 'desc'
      }
    });

    const totalQuantite = productions.reduce((sum: any, prod: { quantite: any; }) => sum + prod.quantite, 0);

    // ✅ AJOUT AUDIT - Consultation production journalière
    await logAction({
      utilisateur_id: userId,
      ferme_id: ferme_id ? Number(ferme_id) : undefined,
      table_cible: 'production',
      action: 'consultation_journaliere',
      nouvelles_valeurs: { 
        date: targetDate.toISOString().split('T')[0],
        ferme_id: ferme_id ? Number(ferme_id) : 'toutes',
        total_quantite: totalQuantite,
        count: productions.length 
      },
      ip_address: req.ip
    });

    res.json({
      date: targetDate.toISOString().split('T')[0],
      total_quantite: totalQuantite,
      productions,
      count: productions.length
    });
  } catch (error) {
    console.error('Erreur getProductionJournaliere:', error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};