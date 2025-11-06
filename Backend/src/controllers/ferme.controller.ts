import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { logAction } from '../controllers/audit.controller';

const prisma = new PrismaClient();

export const getAllFermes = async (req: Request, res: Response) => {
  try {
    const fermes = await prisma.fermes.findMany({
      include: {
        proprietaire: {
          select: {
            id_user: true,
            nom: true,
            email: true
          }
        },
        _count: {
          select: {
            animaux: true,
            lots: true
          }
        }
      },
      orderBy: {
        date_creation: 'desc'
      }
    });
    res.json(fermes);
  } catch (error) {
    console.error('Erreur getAllFermes:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des fermes' });
  }
};

export const getFermeById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID invalide' });
    }

    const ferme = await prisma.fermes.findUnique({
      where: { id_ferme: id },
      include: {
        proprietaire: {
          select: {
            id_user: true,
            nom: true,
            email: true,
            telephone: true
          }
        },
        animaux: {
          include: {
            lot: true
          }
        },
        lots: true
      }
    });
    
    if (!ferme) {
      return res.status(404).json({ error: 'Ferme non trouvée' });
    }
    
    res.json(ferme);
  } catch (error) {
    console.error('Erreur getFermeById:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const createFerme = async (req: Request, res: Response) => {
  try {
    const { nom, adresse, superficie, type_ferme, proprietaire_id } = req.body;
    const userId = (req as any).user?.id_user;

    // Validation
    if (!nom?.trim()) {
      return res.status(400).json({ error: 'Le nom est requis' });
    }
    
    if (!proprietaire_id) {
      return res.status(400).json({ error: 'Le propriétaire est requis' });
    }

    // Vérifier si le propriétaire existe
    const proprietaire = await prisma.utilisateurs.findUnique({
      where: { id_user: Number(proprietaire_id) }
    });

    if (!proprietaire) {
      return res.status(404).json({ error: 'Propriétaire non trouvé' });
    }

    const newFerme = await prisma.fermes.create({
      data: {
        nom: nom.trim(),
        adresse: adresse?.trim() || null,
        superficie: superficie ? parseFloat(superficie) : null,
        type_ferme: type_ferme || null,
        proprietaire_id: Number(proprietaire_id)
      },
      include: {
        proprietaire: {
          select: {
            id_user: true,
            nom: true,
            email: true
          }
        }
      }
    });

    //  AJOUT AUDIT - Création ferme
    await logAction({
      utilisateur_id: userId,
      ferme_id: newFerme.id_ferme,
      table_cible: 'fermes',
      id_cible: newFerme.id_ferme,
      action: 'creation',
      nouvelles_valeurs: newFerme,
      ip_address: req.ip
    });

    res.status(201).json(newFerme);
  } catch (error: any) {
    console.error('Erreur createFerme:', error);
    
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Une ferme avec ce nom existe déjà' });
    }
    
    res.status(500).json({ error: 'Erreur lors de la création de la ferme' });
  }
};

export const updateFerme = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { nom, adresse, superficie, type_ferme, statut } = req.body;
    const userId = (req as any).user?.id_user;

    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID invalide' });
    }

    const fermeExist = await prisma.fermes.findUnique({
      where: { id_ferme: id },
      include: {
        proprietaire: {
          select: {
            id_user: true,
            nom: true,
            email: true
          }
        }
      }
    });
    
    if (!fermeExist) {
      return res.status(404).json({ error: 'Ferme non trouvée' });
    }

    const updateData: any = {};
    
    if (nom !== undefined) updateData.nom = nom.trim();
    if (adresse !== undefined) updateData.adresse = adresse?.trim() || null;
    if (type_ferme !== undefined) updateData.type_ferme = type_ferme;
    if (statut !== undefined) updateData.statut = statut;
    
    if (superficie !== undefined) {
      updateData.superficie = superficie ? parseFloat(superficie) : null;
    }

    const updated = await prisma.fermes.update({
      where: { id_ferme: id },
      data: updateData,
      include: {
        proprietaire: {
          select: {
            id_user: true,
            nom: true,
            email: true
          }
        }
      }
    });

    //  AJOUT AUDIT - Modification ferme
    await logAction({
      utilisateur_id: userId,
      ferme_id: id,
      table_cible: 'fermes',
      id_cible: id,
      action: 'modification',
      anciennes_valeurs: fermeExist,
      nouvelles_valeurs: updated,
      ip_address: req.ip
    });

    res.json(updated);
  } catch (error: any) {
    console.error('Erreur updateFerme:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Ferme non trouvée' });
    }
    
    res.status(500).json({ error: 'Erreur lors de la mise à jour' });
  }
};

export const deleteFerme = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const userId = (req as any).user?.id_user;

    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID invalide' });
    }

    const fermeExist = await prisma.fermes.findUnique({
      where: { id_ferme: id },
      include: {
        proprietaire: {
          select: {
            id_user: true,
            nom: true,
            email: true
          }
        },
        _count: {
          select: {
            animaux: true,
            lots: true,
            ventes: true,
            transactions: true
          }
        }
      }
    });

    if (!fermeExist) {
      return res.status(404).json({ error: 'Ferme non trouvée' });
    }

    // Vérifier s'il y a des données associées
    if (fermeExist._count.animaux > 0) {
      return res.status(400).json({ 
        error: 'Impossible de supprimer cette ferme car elle contient des animaux' 
      });
    }

    if (fermeExist._count.lots > 0) {
      return res.status(400).json({ 
        error: 'Impossible de supprimer cette ferme car elle contient des lots' 
      });
    }

    await prisma.fermes.delete({
      where: { id_ferme: id }
    });

    //  AJOUT AUDIT - Suppression ferme
    await logAction({
      utilisateur_id: userId,
      ferme_id: id,
      table_cible: 'fermes',
      id_cible: id,
      action: 'suppression',
      anciennes_valeurs: fermeExist,
      ip_address: req.ip
    });

    res.status(204).send();
  } catch (error: any) {
    console.error('Erreur deleteFerme:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Ferme non trouvée' });
    }
    
    if (error.code === 'P2003') {
      return res.status(400).json({ 
        error: 'Impossible de supprimer cette ferme car elle est liée à d\'autres données' 
      });
    }
    
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
};

export const getFermeStats = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID invalide' });
    }

    const ferme = await prisma.fermes.findUnique({
      where: { id_ferme: id },
      select: {
        id_ferme: true,
        nom: true
      }
    });

    if (!ferme) {
      return res.status(404).json({ error: 'Ferme non trouvée' });
    }

    const [
      totalAnimaux,
      totalLots,
      animauxActifs,
      productionMensuelle,
      ventesMensuelles
    ] = await Promise.all([
      // Total animaux
      prisma.animaux.count({ 
        where: { ferme_id: id } 
      }),
      // Total lots
      prisma.lots.count({ 
        where: { ferme_id: id } 
      }),
      // Animaux actifs
      prisma.animaux.count({ 
        where: { 
          ferme_id: id,
          statut: 'ACTIF'
        } 
      }),
      // Production du mois
      prisma.production.aggregate({
        where: {
          ferme_id: id,
          date_collecte: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        },
        _sum: {
          quantite: true
        }
      }),
      // Ventes du mois
      prisma.ventes.aggregate({
        where: {
          ferme_id: id,
          date_vente: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        },
        _sum: {
          montant_total: true
        }
      })
    ]);

    //  AJOUT AUDIT - Consultation statistiques ferme
    await logAction({
      utilisateur_id: (req as any).user?.id_user,
      ferme_id: id,
      table_cible: 'fermes',
      id_cible: id,
      action: 'consultation_statistiques',
      ip_address: req.ip
    });

    res.json({
      ferme: {
        id_ferme: ferme.id_ferme,
        nom: ferme.nom
      },
      statistiques: {
        total_animaux: totalAnimaux,
        total_lots: totalLots,
        animaux_actifs: animauxActifs,
        production_mensuelle: productionMensuelle._sum.quantite || 0,
        ventes_mensuelles: ventesMensuelles._sum.montant_total || 0
      }
    });
  } catch (error) {
    console.error('Erreur getFermeStats:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
  }
};

export const getFermesByProprietaire = async (req: Request, res: Response) => {
  try {
    const proprietaireId = Number(req.params.proprietaireId);
    const userId = (req as any).user?.id_user;
    
    if (isNaN(proprietaireId)) {
      return res.status(400).json({ error: 'ID propriétaire invalide' });
    }

    // Vérifier les permissions (un utilisateur ne peut voir que ses propres fermes sauf si admin)
    const userRole = (req as any).user?.role;
    if (userRole !== 'ADMIN' && proprietaireId !== userId) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    const fermes = await prisma.fermes.findMany({
      where: { proprietaire_id: proprietaireId },
      include: {
        proprietaire: {
          select: {
            id_user: true,
            nom: true,
            email: true
          }
        },
        _count: {
          select: {
            animaux: true,
            lots: true
          }
        }
      },
      orderBy: {
        date_creation: 'desc'
      }
    });

    //  AJOUT AUDIT - Consultation fermes par propriétaire
    await logAction({
      utilisateur_id: userId,
      table_cible: 'fermes',
      action: 'consultation_par_proprietaire',
      nouvelles_valeurs: { proprietaire_id: proprietaireId, count: fermes.length },
      ip_address: req.ip
    });

    res.json(fermes);
  } catch (error) {
    console.error('Erreur getFermesByProprietaire:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};