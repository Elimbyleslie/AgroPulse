import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { logAction } from '../controllers/audit.controller';

const prisma = new PrismaClient();

export const getAllTransactions = async (req: Request, res: Response) => {
  try {
    const { ferme_id, type, categorie, mois, annee, page = 1, limit = 50 } = req.query;
    const userId = (req as any).user?.id_user;
    
    const where: any = {};
    if (ferme_id) where.ferme_id = Number(ferme_id);
    if (type) where.type = type;
    if (categorie) where.categorie = categorie;
    
    // Filtre par date
    if (mois || annee) {
      const dateDebut = new Date(
        Number(annee) || new Date().getFullYear(),
        Number(mois) - 1 || new Date().getMonth(),
        1
      );
      const dateFin = new Date(dateDebut);
      dateFin.setMonth(dateFin.getMonth() + 1);
      
      where.date = {
        gte: dateDebut,
        lt: dateFin
      };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [transactions, total] = await Promise.all([
      prisma.transactions.findMany({
        where,
        include: {
          ferme: {
            select: { 
              id_ferme: true,
              nom: true 
            }
          }
        },
        orderBy: { date: 'desc' },
        skip,
        take: Number(limit)
      }),
      prisma.transactions.count({ where })
    ]);

    // ✅ AJOUT AUDIT - Consultation transactions
    await logAction({
      utilisateur_id: userId,
      ferme_id: ferme_id ? Number(ferme_id) : undefined,
      table_cible: 'transactions',
      action: 'consultation_liste',
      nouvelles_valeurs: { 
        filters: { ferme_id, type, categorie, mois, annee },
        count: transactions.length 
      },
      ip_address: req.ip
    });
    
    res.json({
      transactions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Erreur getAllTransactions:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const getTransactionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id_user;

    if (isNaN(Number(id))) {
      return res.status(400).json({ error: 'ID invalide' });
    }

    const transaction = await prisma.transactions.findUnique({
      where: { id_tx: Number(id) },
      include: {
        ferme: {
          select: {
            id_ferme: true,
            nom: true,
            proprietaire: {
              select: {
                nom: true
              }
            }
          }
        }
      }
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction non trouvée' });
    }

    //  AJOUT AUDIT - Consultation détaillée transaction
    await logAction({
      utilisateur_id: userId,
      ferme_id: transaction.ferme_id,
      table_cible: 'transactions',
      id_cible: Number(id),
      action: 'consultation_detail',
      ip_address: req.ip
    });

    res.json(transaction);
  } catch (error) {
    console.error('Erreur getTransactionById:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const createTransaction = async (req: Request, res: Response) => {
  try {
    const { ferme_id, type, categorie, montant, description, reference_type, reference_id, details, date } = req.body;
    const userId = (req as any).user?.id_user;

    // Validation
    if (!ferme_id || !type || !categorie || !montant) {
      return res.status(400).json({ 
        error: 'Champs obligatoires manquants: ferme_id, type, categorie, montant' 
      });
    }

    // Vérifier si la ferme existe
    const ferme = await prisma.fermes.findUnique({
      where: { id_ferme: Number(ferme_id) }
    });

    if (!ferme) {
      return res.status(404).json({ error: 'Ferme non trouvée' });
    }

    const transaction = await prisma.transactions.create({
      data: {
        ferme_id: Number(ferme_id),
        type,
        categorie,
        montant: parseFloat(montant),
        description: description || null,
        reference_type: reference_type || null,
        reference_id: reference_id ? Number(reference_id) : null,
        details: details || null,
        date: date ? new Date(date) : new Date()
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

    //  AJOUT AUDIT - Création transaction
    await logAction({
      utilisateur_id: userId,
      ferme_id: Number(ferme_id),
      table_cible: 'transactions',
      id_cible: transaction.id_tx,
      action: 'creation',
      nouvelles_valeurs: transaction,
      ip_address: req.ip
    });

    res.status(201).json(transaction);
  } catch (error) {
    console.error('Erreur createTransaction:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la transaction' });
  }
};

export const updateTransaction = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { type, categorie, montant, description, reference_type, reference_id, details, date } = req.body;
    const userId = (req as any).user?.id_user;

    if (isNaN(Number(id))) {
      return res.status(400).json({ error: 'ID invalide' });
    }

    const transactionExist = await prisma.transactions.findUnique({
      where: { id_tx: Number(id) },
      include: {
        ferme: {
          select: {
            id_ferme: true,
            nom: true
          }
        }
      }
    });

    if (!transactionExist) {
      return res.status(404).json({ error: 'Transaction non trouvée' });
    }

    const updateData: any = {};
    
    if (type !== undefined) updateData.type = type;
    if (categorie !== undefined) updateData.categorie = categorie;
    if (description !== undefined) updateData.description = description;
    if (reference_type !== undefined) updateData.reference_type = reference_type;
    if (details !== undefined) updateData.details = details;
    
    if (montant !== undefined) updateData.montant = parseFloat(montant);
    if (reference_id !== undefined) updateData.reference_id = reference_id ? Number(reference_id) : null;
    if (date) updateData.date = new Date(date);

    const updated = await prisma.transactions.update({
      where: { id_tx: Number(id) },
      data: updateData,
      include: {
        ferme: {
          select: { nom: true }
        }
      }
    });

    //  AJOUT AUDIT - Modification transaction
    await logAction({
      utilisateur_id: userId,
      ferme_id: transactionExist.ferme_id,
      table_cible: 'transactions',
      id_cible: Number(id),
      action: 'modification',
      anciennes_valeurs: transactionExist,
      nouvelles_valeurs: updated,
      ip_address: req.ip
    });

    res.json(updated);
  } catch (error: any) {
    console.error('Erreur updateTransaction:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Transaction non trouvée' });
    }
    
    res.status(500).json({ error: 'Erreur lors de la mise à jour' });
  }
};

export const deleteTransaction = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id_user;

    if (isNaN(Number(id))) {
      return res.status(400).json({ error: 'ID invalide' });
    }

    const transactionExist = await prisma.transactions.findUnique({
      where: { id_tx: Number(id) },
      include: {
        ferme: {
          select: {
            id_ferme: true,
            nom: true
          }
        }
      }
    });

    if (!transactionExist) {
      return res.status(404).json({ error: 'Transaction non trouvée' });
    }

    await prisma.transactions.delete({
      where: { id_tx: Number(id) }
    });

    //  AJOUT AUDIT - Suppression transaction
    await logAction({
      utilisateur_id: userId,
      ferme_id: transactionExist.ferme_id,
      table_cible: 'transactions',
      id_cible: Number(id),
      action: 'suppression',
      anciennes_valeurs: transactionExist,
      ip_address: req.ip
    });

    res.status(204).send();
  } catch (error: any) {
    console.error('Erreur deleteTransaction:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Transaction non trouvée' });
    }
    
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
};

export const getStatsFinancieres = async (req: Request, res: Response) => {
  try {
    const { ferme_id, annee, mois } = req.query;
    const userId = (req as any).user?.id_user;
    
    const where: any = {};
    if (ferme_id) where.ferme_id = Number(ferme_id);
    
    // Filtre par date
    if (annee || mois) {
      const dateDebut = new Date(
        Number(annee) || new Date().getFullYear(),
        Number(mois) - 1 || 0,
        1
      );
      const dateFin = new Date(dateDebut);
      mois ? dateFin.setMonth(dateFin.getMonth() + 1) : dateFin.setFullYear(dateFin.getFullYear() + 1);
      
      where.date = { gte: dateDebut, lt: dateFin };
    }

    const [totalRevenus, totalDepenses, repartitionRevenus, repartitionDepenses] = await Promise.all([
      // Total revenus
      prisma.transactions.aggregate({
        where: { ...where, type: 'entree' },
        _sum: { montant: true }
      }),
      
      // Total dépenses
      prisma.transactions.aggregate({
        where: { ...where, type: 'sortie' },
        _sum: { montant: true }
      }),
      
      // Répartition des revenus par catégorie
      prisma.transactions.groupBy({
        by: ['categorie'],
        where: { ...where, type: 'entree' },
        _sum: { montant: true },
        _count: { id_tx: true }
      }),
      
      // Répartition des dépenses par catégorie
      prisma.transactions.groupBy({
        by: ['categorie'],
        where: { ...where, type: 'sortie' },
        _sum: { montant: true },
        _count: { id_tx: true }
      })
    ]);

    const benefice = (totalRevenus._sum.montant || 0) - (totalDepenses._sum.montant || 0);

    //  AJOUT AUDIT - Consultation statistiques financières
    await logAction({
      utilisateur_id: userId,
      ferme_id: ferme_id ? Number(ferme_id) : undefined,
      table_cible: 'transactions',
      action: 'consultation_statistiques',
      nouvelles_valeurs: { 
        ferme_id: ferme_id ? Number(ferme_id) : 'toutes',
        periode: { annee, mois },
        benefice_net: benefice
      },
      ip_address: req.ip
    });

    res.json({
      total_revenus: totalRevenus._sum.montant || 0,
      total_depenses: totalDepenses._sum.montant || 0,
      benefice_net: benefice,
      repartition: {
        revenus: repartitionRevenus,
        depenses: repartitionDepenses
      }
    });
  } catch (error) {
    console.error('Erreur getStatsFinancieres:', error);
    res.status(500).json({ error: 'Erreur calcul statistiques' });
  }
};

export const getTransactionsByCategorie = async (req: Request, res: Response) => {
  try {
    const { categorie } = req.params;
    const { ferme_id, type } = req.query;
    const userId = (req as any).user?.id_user;

    const where: any = { categorie };
    if (ferme_id) where.ferme_id = Number(ferme_id);
    if (type) where.type = type;

    const transactions = await prisma.transactions.findMany({
      where,
      include: {
        ferme: {
          select: { nom: true }
        }
      },
      orderBy: { date: 'desc' }
    });

    //  AJOUT AUDIT - Consultation transactions par catégorie
    await logAction({
      utilisateur_id: userId,
      ferme_id: ferme_id ? Number(ferme_id) : undefined,
      table_cible: 'transactions',
      action: 'consultation_par_categorie',
      nouvelles_valeurs: { 
        categorie,
        ferme_id: ferme_id ? Number(ferme_id) : 'toutes',
        type: type || 'tous',
        count: transactions.length 
      },
      ip_address: req.ip
    });

    res.json(transactions);
  } catch (error) {
    console.error('Erreur getTransactionsByCategorie:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const getSoldeFerme = async (req: Request, res: Response) => {
  try {
    const { fermeId } = req.params;
    const userId = (req as any).user?.id_user;

    if (isNaN(Number(fermeId))) {
      return res.status(400).json({ error: 'ID ferme invalide' });
    }

    const [totalRevenus, totalDepenses] = await Promise.all([
      prisma.transactions.aggregate({
        where: { 
          ferme_id: Number(fermeId),
          type: 'entree'
        },
        _sum: { montant: true }
      }),
      prisma.transactions.aggregate({
        where: { 
          ferme_id: Number(fermeId),
          type: 'sortie'
        },
        _sum: { montant: true }
      })
    ]);

    const solde = (totalRevenus._sum.montant || 0) - (totalDepenses._sum.montant || 0);

    //  AJOUT AUDIT - Consultation solde ferme
    await logAction({
      utilisateur_id: userId,
      ferme_id: Number(fermeId),
      table_cible: 'transactions',
      action: 'consultation_solde',
      nouvelles_valeurs: { 
        ferme_id: Number(fermeId),
        solde,
        total_revenus: totalRevenus._sum.montant || 0,
        total_depenses: totalDepenses._sum.montant || 0
      },
      ip_address: req.ip
    });

    res.json({
      ferme_id: Number(fermeId),
      solde,
      total_revenus: totalRevenus._sum.montant || 0,
      total_depenses: totalDepenses._sum.montant || 0
    });
  } catch (error) {
    console.error('Erreur getSoldeFerme:', error);
    res.status(500).json({ error: 'Erreur calcul solde' });
  }
};

export const createMultipleTransactions = async (req: Request, res: Response) => {
  try {
    const { transactions } = req.body;
    const userId = (req as any).user?.id_user;

    if (!Array.isArray(transactions) || transactions.length === 0) {
      return res.status(400).json({ error: 'Tableau de transactions requis' });
    }

    // Validation des transactions
    for (const tx of transactions) {
      if (!tx.ferme_id || !tx.type || !tx.categorie || !tx.montant) {
        return res.status(400).json({ 
          error: 'Champs obligatoires manquants dans une transaction: ferme_id, type, categorie, montant' 
        });
      }

      // Vérifier si la ferme existe
      const ferme = await prisma.fermes.findUnique({
        where: { id_ferme: Number(tx.ferme_id) }
      });

      if (!ferme) {
        return res.status(404).json({ error: `Ferme ${tx.ferme_id} non trouvée` });
      }
    }

    const createdTransactions = await prisma.transactions.createMany({
      data: transactions.map(tx => ({
        ferme_id: Number(tx.ferme_id),
        type: tx.type,
        categorie: tx.categorie,
        montant: parseFloat(tx.montant),
        description: tx.description || null,
        reference_type: tx.reference_type || null,
        reference_id: tx.reference_id ? Number(tx.reference_id) : null,
        details: tx.details || null,
        date: tx.date ? new Date(tx.date) : new Date()
      }))
    });

    //  AJOUT AUDIT - Création multiple transactions
    await logAction({
      utilisateur_id: userId,
      table_cible: 'transactions',
      action: 'creation_multiple',
      nouvelles_valeurs: { 
        count: createdTransactions.count,
        fermes: [...new Set(transactions.map(tx => tx.ferme_id))]
      },
      ip_address: req.ip
    });

    res.status(201).json({
      message: `${createdTransactions.count} transaction(s) créée(s) avec succès`,
      count: createdTransactions.count
    });
  } catch (error) {
    console.error('Erreur createMultipleTransactions:', error);
    res.status(500).json({ error: 'Erreur lors de la création des transactions' });
  }
};

export const getTransactionsRecentes = async (req: Request, res: Response) => {
  try {
    const { ferme_id, limit = 10 } = req.query;
    const userId = (req as any).user?.id_user;

    const where: any = {};
    if (ferme_id) where.ferme_id = Number(ferme_id);

    const transactions = await prisma.transactions.findMany({
      where,
      include: {
        ferme: {
          select: { 
            id_ferme: true,
            nom: true 
          }
        }
      },
      orderBy: { date: 'desc' },
      take: Number(limit)
    });

    //  AJOUT AUDIT - Consultation transactions récentes
    await logAction({
      utilisateur_id: userId,
      ferme_id: ferme_id ? Number(ferme_id) : undefined,
      table_cible: 'transactions',
      action: 'consultation_recentes',
      nouvelles_valeurs: { 
        ferme_id: ferme_id ? Number(ferme_id) : 'toutes',
        limit: Number(limit),
        count: transactions.length 
      },
      ip_address: req.ip
    });

    res.json(transactions);
  } catch (error) {
    console.error('Erreur getTransactionsRecentes:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};