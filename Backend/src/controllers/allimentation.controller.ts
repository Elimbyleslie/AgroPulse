import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { logAction } from '../controllers/audit.controller';

const prisma = new PrismaClient();

// Gestion du stock d'aliments
export const getAllAlimentsStock = async (req: Request, res: Response) => {
  try {
    const { ferme_id, type_aliment, seuil_min } = req.query;
    const userId = (req as any).user?.id_user;

    const where: any = {};

    if (type_aliment) where.type_aliment = type_aliment;
    if (seuil_min) where.quantite_stock = { lte: Number(seuil_min) };

    // Filtre par ferme via le lot
    if (ferme_id) {
      where.lot = {
        ferme_id: Number(ferme_id)
      };
    }

    const aliments = await prisma.alimentation.findMany({
      where,
      include: { 
        lot: {
          select: {
            id_lot: true,
            espece: true,
            ferme: {
              select: {
                id_ferme: true,
                nom: true
              }
            }
          }
        }
      },
      orderBy: {
        date_entree: 'desc'
      }
    });

    // ✅ AJOUT AUDIT - Consultation stock aliments
    await logAction({
      utilisateur_id: userId,
      ferme_id: ferme_id ? Number(ferme_id) : undefined,
      table_cible: 'alimentation',
      action: 'consultation_stock',
      nouvelles_valeurs: { 
        filters: { ferme_id, type_aliment, seuil_min },
        count: aliments.length 
      },
      ip_address: req.ip
    });

    res.json(aliments);
  } catch (error) {
    console.error('Erreur getAllAlimentsStock:', error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// Historique d'alimentation
export const getAllHistoriquesAlimentation = async (req: Request, res: Response) => {
  try {
    const { animal_id, lot_id, ferme_id, date_debut, date_fin, page = 1, limit = 50 } = req.query;
    const userId = (req as any).user?.id_user;

    const where: any = {};

    if (animal_id) where.animal_id = Number(animal_id);
    if (lot_id) where.lot_id = Number(lot_id);

    // Filtre par ferme via animal ou lot
    if (ferme_id) {
      where.OR = [
        { animal: { ferme_id: Number(ferme_id) } },
        { lot: { ferme_id: Number(ferme_id) } }
      ];
    }

    // Filtre par date
    if (date_debut || date_fin) {
      where.date = {};
      if (date_debut) where.date.gte = new Date(date_debut as string);
      if (date_fin) where.date.lte = new Date(date_fin as string);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [historiques, total] = await Promise.all([
      prisma.historiques_alimentation.findMany({
        where,
        include: {
          animal: {
            select: {
              id_animal: true,
              numero_identification: true,
              espece: true,
              ferme: {
                select: {
                  id_ferme: true,
                  nom: true
                }
              }
            }
          },
          lot: {
            select: {
              id_lot: true,
              espece: true,
              ferme: {
                select: {
                  id_ferme: true,
                  nom: true
                }
              }
            }
          }
        },
        orderBy: {
          date: 'desc'
        },
        skip,
        take: Number(limit)
      }),
      prisma.historiques_alimentation.count({ where })
    ]);

    //  AJOUT AUDIT - Consultation historique alimentation
    await logAction({
      utilisateur_id: userId,
      ferme_id: ferme_id ? Number(ferme_id) : undefined,
      table_cible: 'historiques_alimentation',
      action: 'consultation_historique',
      nouvelles_valeurs: { 
        filters: { animal_id, lot_id, ferme_id, date_debut, date_fin },
        count: historiques.length 
      },
      ip_address: req.ip
    });

    res.json({
      historiques,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Erreur getAllHistoriquesAlimentation:', error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

export const getAlimentStockById = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const userId = (req as any).user?.id_user;

  try {
    const aliment = await prisma.alimentation.findUnique({
      where: { id_aliment: id },
      include: {
        lot: {
          include: {
            ferme: {
              select: {
                id_ferme: true,
                nom: true
              }
            }
          }
        }
      }
    });
    
    if (!aliment) return res.status(404).json({ error: "Aliment non trouvé" });

    // ✅ AJOUT AUDIT - Consultation détaillée stock
    await logAction({
      utilisateur_id: userId,
      ferme_id: aliment.lot?.ferme_id,
      table_cible: 'alimentation',
      id_cible: id,
      action: 'consultation_detail_stock',
      ip_address: req.ip
    });

    res.json(aliment);
  } catch (error) {
    console.error('Erreur getAlimentStockById:', error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

export const createAlimentStock = async (req: Request, res: Response) => {
  const { type_aliment, quantite_stock, unite, date_entree, date_sortie, lot_id } = req.body;
  const userId = (req as any).user?.id_user;
  
  try {
    // Validation
    if (!type_aliment) {
      return res.status(400).json({ error: "Le type d'aliment est requis" });
    }
    if (!quantite_stock) {
      return res.status(400).json({ error: "La quantité est requise" });
    }

    // Vérifier si le lot existe (si fourni)
    let fermeId: number | undefined;
    if (lot_id) {
      const lot = await prisma.lots.findUnique({
        where: { id_lot: Number(lot_id) },
        select: { ferme_id: true }
      });
      if (!lot) {
        return res.status(404).json({ error: "Lot non trouvé" });
      }
      fermeId = lot.ferme_id;
    }

    const newAliment = await prisma.alimentation.create({
      data: { 
        type_aliment,
        quantite_stock: Number(quantite_stock),
        unite: unite || 'kg',
        date_entree: date_entree ? new Date(date_entree) : new Date(),
        date_sortie: date_sortie ? new Date(date_sortie) : null,
        lot_id: lot_id ? Number(lot_id) : null
      },
      include: {
        lot: {
          select: {
            id_lot: true,
            espece: true,
            ferme: {
              select: {
                id_ferme: true,
                nom: true
              }
            }
          }
        }
      }
    });

    // ✅ AJOUT AUDIT - Création stock aliment
    await logAction({
      utilisateur_id: userId,
      ferme_id: fermeId,
      table_cible: 'alimentation',
      id_cible: newAliment.id_aliment,
      action: 'creation_stock',
      nouvelles_valeurs: newAliment,
      ip_address: req.ip
    });

    res.status(201).json(newAliment);
  } catch (error) {
    console.error('Erreur createAlimentStock:', error);
    res.status(500).json({ error: "Erreur lors de la création" });
  }
};

// Pour l'historique d'alimentation des animaux/lots
export const createHistoriqueAlimentation = async (req: Request, res: Response) => {
  const { animal_id, lot_id, type_aliment, quantite, date } = req.body;
  const userId = (req as any).user?.id_user;
  
  try {
    // Validation
    if (!type_aliment) {
      return res.status(400).json({ error: "Le type d'aliment est requis" });
    }
    if (!quantite) {
      return res.status(400).json({ error: "La quantité est requise" });
    }

    // Vérifier qu'au moins un animal ou lot est spécifié
    if (!animal_id && !lot_id) {
      return res.status(400).json({ error: "Un animal ou un lot doit être spécifié" });
    }

    // Vérifier les existences et récupérer ferme_id
    let fermeId: number | undefined;

    if (animal_id) {
      const animal = await prisma.animaux.findUnique({
        where: { id_animal: Number(animal_id) },
        select: { ferme_id: true }
      });
      if (!animal) {
        return res.status(404).json({ error: "Animal non trouvé" });
      }
      fermeId = animal.ferme_id;
    } else if (lot_id) {
      const lot = await prisma.lots.findUnique({
        where: { id_lot: Number(lot_id) },
        select: { ferme_id: true }
      });
      if (!lot) {
        return res.status(404).json({ error: "Lot non trouvé" });
      }
      fermeId = lot.ferme_id;
    }

    const newHistorique = await prisma.historiques_alimentation.create({
      data: { 
        animal_id: animal_id ? Number(animal_id) : null,
        lot_id: lot_id ? Number(lot_id) : null,
        type_aliment,
        quantite: Number(quantite),
        date: date ? new Date(date) : new Date()
      },
      include: {
        animal: {
          select: {
            id_animal: true,
            numero_identification: true,
            espece: true,
            ferme: {
              select: {
                id_ferme: true,
                nom: true
              }
            }
          }
        },
        lot: {
          select: {
            id_lot: true,
            espece: true,
            ferme: {
              select: {
                id_ferme: true,
                nom: true
              }
            }
          }
        }
      }
    });

    //  AJOUT AUDIT - Création historique alimentation
    await logAction({
      utilisateur_id: userId,
      ferme_id: fermeId,
      table_cible: 'historiques_alimentation',
      id_cible: newHistorique.id,
      action: 'creation_historique',
      nouvelles_valeurs: newHistorique,
      ip_address: req.ip
    });

    res.status(201).json(newHistorique);
  } catch (error) {
    console.error('Erreur createHistoriqueAlimentation:', error);
    res.status(500).json({ error: "Erreur lors de la création" });
  }
};

export const updateAlimentStock = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { type_aliment, quantite_stock, unite, date_entree, date_sortie } = req.body;
  const userId = (req as any).user?.id_user;
  
  try {
    const alimentExist = await prisma.alimentation.findUnique({
      where: { id_aliment: id },
      include: {
        lot: {
          select: {
            ferme_id: true
          }
        }
      }
    });

    if (!alimentExist) {
      return res.status(404).json({ error: "Aliment non trouvé" });
    }

    const updateData: any = {};
    
    if (type_aliment !== undefined) updateData.type_aliment = type_aliment;
    if (unite !== undefined) updateData.unite = unite;
    
    if (quantite_stock !== undefined) updateData.quantite_stock = Number(quantite_stock);
    if (date_entree) updateData.date_entree = new Date(date_entree);
    if (date_sortie) updateData.date_sortie = new Date(date_sortie);

    const updated = await prisma.alimentation.update({
      where: { id_aliment: id },
      data: updateData,
      include: {
        lot: {
          select: {
            id_lot: true,
            espece: true,
            ferme: {
              select: {
                id_ferme: true,
                nom: true
              }
            }
          }
        }
      }
    });

    //  AJOUT AUDIT - Modification stock aliment
    await logAction({
      utilisateur_id: userId,
      ferme_id: alimentExist.lot?.ferme_id,
      table_cible: 'alimentation',
      id_cible: id,
      action: 'modification_stock',
      anciennes_valeurs: alimentExist,
      nouvelles_valeurs: updated,
      ip_address: req.ip
    });
    
    res.json(updated);
  } catch (error) {
    console.error('Erreur updateAlimentStock:', error);
    res.status(500).json({ error: "Erreur lors de la mise à jour" });
  }
};

export const deleteAlimentStock = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const userId = (req as any).user?.id_user;

  try {
    const alimentExist = await prisma.alimentation.findUnique({
      where: { id_aliment: id },
      include: {
        lot: {
          select: {
            ferme_id: true
          }
        }
      }
    });

    if (!alimentExist) {
      return res.status(404).json({ error: "Aliment non trouvé" });
    }

    await prisma.alimentation.delete({ 
      where: { id_aliment: id }
    });

    //  AJOUT AUDIT - Suppression stock aliment
    await logAction({
      utilisateur_id: userId,
      ferme_id: alimentExist.lot?.ferme_id,
      table_cible: 'alimentation',
      id_cible: id,
      action: 'suppression_stock',
      anciennes_valeurs: alimentExist,
      ip_address: req.ip
    });

    res.status(204).send();
  } catch (error: any) {
    console.error('Erreur deleteAlimentStock:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({ error: "Aliment non trouvé" });
    }
    
    res.status(500).json({ error: "Erreur lors de la suppression" });
  }
};

// Fonctions supplémentaires utiles
export const getAlimentationByLot = async (req: Request, res: Response) => {
  const lotId = Number(req.params.lotId);
  const userId = (req as any).user?.id_user;

  try {
    const lot = await prisma.lots.findUnique({
      where: { id_lot: lotId },
      select: {
        id_lot: true,
        espece: true,
        ferme_id: true
      }
    });

    if (!lot) {
      return res.status(404).json({ error: "Lot non trouvé" });
    }

    const historiques = await prisma.historiques_alimentation.findMany({
      where: { lot_id: lotId },
      include: {
        lot: {
          select: {
            espece: true,
            categorie: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    //  AJOUT AUDIT - Consultation alimentation par lot
    await logAction({
      utilisateur_id: userId,
      ferme_id: lot.ferme_id,
      table_cible: 'historiques_alimentation',
      action: 'consultation_par_lot',
      nouvelles_valeurs: { 
        lot_id: lotId,
        count: historiques.length 
      },
      ip_address: req.ip
    });

    res.json({
      lot,
      historiques
    });
  } catch (error) {
    console.error('Erreur getAlimentationByLot:', error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

export const getAlimentationByAnimal = async (req: Request, res: Response) => {
  const animalId = Number(req.params.animalId);
  const userId = (req as any).user?.id_user;

  try {
    const animal = await prisma.animaux.findUnique({
      where: { id_animal: animalId },
      select: {
        id_animal: true,
        numero_identification: true,
        espece: true,
        ferme_id: true
      }
    });

    if (!animal) {
      return res.status(404).json({ error: "Animal non trouvé" });
    }

    const historiques = await prisma.historiques_alimentation.findMany({
      where: { animal_id: animalId },
      orderBy: {
        date: 'desc'
      }
    });

    //  AJOUT AUDIT - Consultation alimentation par animal
    await logAction({
      utilisateur_id: userId,
      ferme_id: animal.ferme_id,
      table_cible: 'historiques_alimentation',
      action: 'consultation_par_animal',
      nouvelles_valeurs: { 
        animal_id: animalId,
        animal_numero: animal.numero_identification,
        count: historiques.length 
      },
      ip_address: req.ip
    });

    res.json({
      animal,
      historiques
    });
  } catch (error) {
    console.error('Erreur getAlimentationByAnimal:', error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

export const getStockFaible = async (req: Request, res: Response) => {
  try {
    const seuil = Number(req.query.seuil) || 10; // Seuil par défaut de 10 unités
    const ferme_id = req.query.ferme_id;
    const userId = (req as any).user?.id_user;
    
    const where: any = {
      quantite_stock: {
        lte: seuil
      }
    };

    if (ferme_id) {
      where.lot = {
        ferme_id: Number(ferme_id)
      };
    }

    const stockFaible = await prisma.alimentation.findMany({
      where,
      include: {
        lot: {
          select: {
            espece: true,
            ferme: {
              select: {
                id_ferme: true,
                nom: true
              }
            }
          }
        }
      },
      orderBy: {
        quantite_stock: 'asc'
      }
    });

    //  AJOUT AUDIT - Consultation stock faible
    await logAction({
      utilisateur_id: userId,
      ferme_id: ferme_id ? Number(ferme_id) : undefined,
      table_cible: 'alimentation',
      action: 'consultation_stock_faible',
      nouvelles_valeurs: { 
        seuil,
        ferme_id: ferme_id ? Number(ferme_id) : 'toutes',
        count: stockFaible.length 
      },
      ip_address: req.ip
    });
    
    res.json(stockFaible);
  } catch (error) {
    console.error('Erreur getStockFaible:', error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

export const consommerStock = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { quantite } = req.body;
  const userId = (req as any).user?.id_user;

  try {
    if (!quantite || quantite <= 0) {
      return res.status(400).json({ error: "Quantité invalide" });
    }

    const aliment = await prisma.alimentation.findUnique({
      where: { id_aliment: id },
      include: {
        lot: {
          select: {
            ferme_id: true
          }
        }
      }
    });

    if (!aliment) {
      return res.status(404).json({ error: "Aliment non trouvé" });
    }

    if (aliment.quantite_stock < quantite) {
      return res.status(400).json({ error: "Stock insuffisant" });
    }

    const ancienneQuantite = aliment.quantite_stock;
    const nouvelleQuantite = ancienneQuantite - quantite;

    const updated = await prisma.alimentation.update({
      where: { id_aliment: id },
      data: {
        quantite_stock: nouvelleQuantite
      },
      include: {
        lot: {
          select: {
            id_lot: true,
            espece: true,
            ferme: {
              select: {
                id_ferme: true,
                nom: true
              }
            }
          }
        }
      }
    });

    //  AJOUT AUDIT - Consommation stock
    await logAction({
      utilisateur_id: userId,
      ferme_id: aliment.lot?.ferme_id,
      table_cible: 'alimentation',
      id_cible: id,
      action: 'consommation_stock',
      anciennes_valeurs: { quantite_stock: ancienneQuantite },
      nouvelles_valeurs: { quantite_stock: nouvelleQuantite, quantite_consommee: quantite },
      ip_address: req.ip
    });

    res.json({
      message: `${quantite} unités consommées avec succès`,
      aliment: updated,
      ancien_stock: ancienneQuantite,
      nouveau_stock: nouvelleQuantite
    });
  } catch (error) {
    console.error('Erreur consommerStock:', error);
    res.status(500).json({ error: "Erreur lors de la consommation du stock" });
  }
};

export const getStatsAlimentation = async (req: Request, res: Response) => {
  try {
    const { ferme_id, mois, annee } = req.query;
    const userId = (req as any).user?.id_user;

    const where: any = {};

    if (ferme_id) {
      where.OR = [
        { animal: { ferme_id: Number(ferme_id) } },
        { lot: { ferme_id: Number(ferme_id) } }
      ];
    }

    if (mois || annee) {
      const dateDebut = new Date(
        Number(annee) || new Date().getFullYear(),
        Number(mois) - 1 || new Date().getMonth(),
        1
      );
      const dateFin = new Date(dateDebut);
      dateFin.setMonth(dateFin.getMonth() + 1);
      
      where.date = { gte: dateDebut, lt: dateFin };
    }

    const stats = await prisma.historiques_alimentation.groupBy({
      by: ['type_aliment'],
      where,
      _sum: {
        quantite: true
      },
      _count: {
        id: true
      },
      orderBy: {
        _sum: {
          quantite: 'desc'
        }
      }
    });

    const totalConsommation = stats.reduce((sum: any, stat: { _sum: { quantite: any; }; }) => sum + (stat._sum.quantite || 0), 0);

    //  AJOUT AUDIT - Consultation statistiques alimentation
    await logAction({
      utilisateur_id: userId,
      ferme_id: ferme_id ? Number(ferme_id) : undefined,
      table_cible: 'historiques_alimentation',
      action: 'consultation_statistiques',
      nouvelles_valeurs: { 
        ferme_id: ferme_id ? Number(ferme_id) : 'toutes',
        periode: { mois, annee },
        total_consommation: totalConsommation,
        types_aliments: stats.length 
      },
      ip_address: req.ip
    });

    res.json({
      total_consommation: totalConsommation,
      repartition: stats,
      periode: {
        mois: mois || 'tous',
        annee: annee || new Date().getFullYear()
      }
    });
  } catch (error) {
    console.error('Erreur getStatsAlimentation:', error);
    res.status(500).json({ error: "Erreur lors du calcul des statistiques" });
  }
};