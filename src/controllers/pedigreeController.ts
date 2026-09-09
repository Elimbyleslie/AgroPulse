// controllers/pedigreeController.ts
import { Request, Response, NextFunction } from 'express';
import ResponseApi  from '../helpers/response.js';
import prisma  from '../models/prismaClient.js';

// ==================== GET PEDIGREE BY ANIMAL ====================
export const getPedigreeById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { animalId } = req.params;

    const pedigree = await prisma.pedigree.findUnique({
      where: { animalId: Number(animalId) },
      include: {
        animal: {
          select: {
            id: true,
            name: true,
            gender: true,
            birthDate: true,
            species: { select: { name: true } },
            breed: { select: { name: true } },
          },
        },
        mother: {
          select: {
            id: true,
            name: true,
            birthDate: true,
          },
        },
        father: {
          select: {
            id: true,
            name: true,
            birthDate: true,
          },
        },
        maternalGrandmother: {
          select: {
            id: true,
            name: true,
          },
        },
        maternalGrandfather: {
          select: {
            id: true,
            name: true,
          },
        },
        paternalGrandmother: {
          select: {
            id: true,
            name: true,
          },
        },
        paternalGrandfather: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!pedigree) {
      return ResponseApi.error(res, 'Pedigree non trouvé', 404);
    }

    return ResponseApi.success(
      res,
      'Pedigree récupéré avec succès',
      200,
      pedigree
    );
  } catch (error) {
    next(error);
  }
};

// ==================== CREATE PEDIGREE ====================
export const createPedigree = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      animalId,
      motherId,
      fatherId,
      maternalGrandmotherId,
      maternalGrandfatherId,
      paternalGrandmotherId,
      paternalGrandfatherId,
      generation4Ids,
      verified,
    } = req.body;

    // Vérifier que l'animal existe
    const animal = await prisma.animal.findUnique({
      where: { id: Number(animalId) },
    });

    if (!animal) {
      return ResponseApi.error(res, 'Animal non trouvé', 404);
    }

    // Vérifier qu'il n'y a pas déjà un pedigree
    const existingPedigree = await prisma.pedigree.findUnique({
      where: { animalId: Number(animalId) },
    });

    if (existingPedigree) {
      return ResponseApi.error(
        res,
        'Un pedigree existe déjà pour cet animal',
        400
      );
    }

    // Calculer le taux de complétude
    const completeness = calculateCompleteness({
      motherId,
      fatherId,
      maternalGrandmotherId,
      maternalGrandfatherId,
      paternalGrandmotherId,
      paternalGrandfatherId,
      generation4Ids,
    });

    const pedigree = await prisma.pedigree.create({
      data: {
        animalId: Number(animalId),
        ...(motherId && { motherId: Number(motherId) }),
        ...(fatherId && { fatherId: Number(fatherId) }),
        ...(maternalGrandmotherId && {
          maternalGrandmotherId: Number(maternalGrandmotherId),
        }),
        ...(maternalGrandfatherId && {
          maternalGrandfatherId: Number(maternalGrandfatherId),
        }),
        ...(paternalGrandmotherId && {
          paternalGrandmotherId: Number(paternalGrandmotherId),
        }),
        ...(paternalGrandfatherId && {
          paternalGrandfatherId: Number(paternalGrandfatherId),
        }),
        ...(generation4Ids && { generation4Ids }),
        completeness,
        verified: verified || false,
      },
      include: {
        animal: true,
        mother: true,
        father: true,
        maternalGrandmother: true,
        maternalGrandfather: true,
        paternalGrandmother: true,
        paternalGrandfather: true,
      },
    });

    return ResponseApi.success(res, 'Pedigree créé avec succès', 201, pedigree);
  } catch (error) {
    next(error);
  }
};

// ==================== UPDATE PEDIGREE ====================
export const updatePedigree = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { animalId } = req.params;
    const {
      motherId,
      fatherId,
      maternalGrandmotherId,
      maternalGrandfatherId,
      paternalGrandmotherId,
      paternalGrandfatherId,
      generation4Ids,
      verified,
    } = req.body;

    const existingPedigree = await prisma.pedigree.findUnique({
      where: { animalId: Number(animalId) },
    });

    if (!existingPedigree) {
      return ResponseApi.error(res, 'Pedigree non trouvé', 404);
    }

    // Recalculer le taux de complétude
    const completeness = calculateCompleteness({
      motherId: motherId !== undefined ? motherId : existingPedigree.motherId,
      fatherId: fatherId !== undefined ? fatherId : existingPedigree.fatherId,
      maternalGrandmotherId:
        maternalGrandmotherId !== undefined
          ? maternalGrandmotherId
          : existingPedigree.maternalGrandmotherId,
      maternalGrandfatherId:
        maternalGrandfatherId !== undefined
          ? maternalGrandfatherId
          : existingPedigree.maternalGrandfatherId,
      paternalGrandmotherId:
        paternalGrandmotherId !== undefined
          ? paternalGrandmotherId
          : existingPedigree.paternalGrandmotherId,
      paternalGrandfatherId:
        paternalGrandfatherId !== undefined
          ? paternalGrandfatherId
          : existingPedigree.paternalGrandfatherId,
      generation4Ids:
        generation4Ids !== undefined
          ? generation4Ids
          : existingPedigree.generation4Ids,
    });

    const pedigree = await prisma.pedigree.update({
      where: { animalId: Number(animalId) },
      data: {
        ...(motherId !== undefined && {
          motherId: motherId ? Number(motherId) : null,
        }),
        ...(fatherId !== undefined && {
          fatherId: fatherId ? Number(fatherId) : null,
        }),
        ...(maternalGrandmotherId !== undefined && {
          maternalGrandmotherId: maternalGrandmotherId
            ? Number(maternalGrandmotherId)
            : null,
        }),
        ...(maternalGrandfatherId !== undefined && {
          maternalGrandfatherId: maternalGrandfatherId
            ? Number(maternalGrandfatherId)
            : null,
        }),
        ...(paternalGrandmotherId !== undefined && {
          paternalGrandmotherId: paternalGrandmotherId
            ? Number(paternalGrandmotherId)
            : null,
        }),
        ...(paternalGrandfatherId !== undefined && {
          paternalGrandfatherId: paternalGrandfatherId
            ? Number(paternalGrandfatherId)
            : null,
        }),
        ...(generation4Ids !== undefined && { generation4Ids }),
        completeness,
        ...(verified !== undefined && { verified: Boolean(verified) }),
      },
      include: {
        animal: true,
        mother: true,
        father: true,
        maternalGrandmother: true,
        maternalGrandfather: true,
        paternalGrandmother: true,
        paternalGrandfather: true,
      },
    });

    return ResponseApi.success(
      res,
      'Pedigree mis à jour avec succès',
      200,
      pedigree
    );
  } catch (error) {
    next(error);
  }
};

// ==================== DELETE PEDIGREE ====================
export const deletePedigree = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { animalId } = req.params;

    const existingPedigree = await prisma.pedigree.findUnique({
      where: { animalId: Number(animalId) },
    });

    if (!existingPedigree) {
      return ResponseApi.error(res, 'Pedigree non trouvé', 404);
    }

    await prisma.pedigree.delete({
      where: { animalId: Number(animalId) },
    });

    return ResponseApi.success(
      res,
      'Pedigree supprimé avec succès',
      200,
      Number(animalId)
    );
  } catch (error) {
    next(error);
  }
};

// ==================== GET GENEALOGY TREE ====================
export const getGenealogyTree = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { animalId } = req.params;
    const { generations = 3 } = req.query;

    const tree = await buildGenealogyTree(Number(animalId), Number(generations));

    if (!tree) {
      return ResponseApi.error(res, 'Animal non trouvé', 404);
    }

    return ResponseApi.success(
      res,
      'Arbre généalogique récupéré avec succès',
      200,
      tree
    );
  } catch (error) {
    next(error);
  }
};

// ==================== CHECK CONSANGUINITY ====================
export const checkConsanguinity = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { animal1Id, animal2Id } = req.params;

    const [pedigree1, pedigree2] = await Promise.all([
      prisma.pedigree.findUnique({
        where: { animalId: Number(animal1Id) },
      }),
      prisma.pedigree.findUnique({
        where: { animalId: Number(animal2Id) },
      }),
    ]);

    if (!pedigree1 || !pedigree2) {
      return ResponseApi.error(res, 'Pedigrees incomplets', 404);
    }

    // Vérifier ancêtres communs (simplifié)
    const commonAncestors = [];

    // Vérifier parents
    if (pedigree1.motherId === pedigree2.motherId && pedigree1.motherId) {
      commonAncestors.push({ type: 'mother', id: pedigree1.motherId });
    }
    if (pedigree1.fatherId === pedigree2.fatherId && pedigree1.fatherId) {
      commonAncestors.push({ type: 'father', id: pedigree1.fatherId });
    }

    // Vérifier grands-parents
    const grandparents1 = [
      pedigree1.maternalGrandmotherId,
      pedigree1.maternalGrandfatherId,
      pedigree1.paternalGrandmotherId,
      pedigree1.paternalGrandfatherId,
    ].filter(Boolean);

    const grandparents2 = [
      pedigree2.maternalGrandmotherId,
      pedigree2.maternalGrandfatherId,
      pedigree2.paternalGrandmotherId,
      pedigree2.paternalGrandfatherId,
    ].filter(Boolean);

    grandparents1.forEach((gp1) => {
      if (grandparents2.includes(gp1)) {
        commonAncestors.push({ type: 'grandparent', id: gp1 });
      }
    });

    const isConsanguine = commonAncestors.length > 0;
    const consanguinityLevel = commonAncestors.length;

    return ResponseApi.success(
      res,
      'Analyse de consanguinité effectuée',
      200,
      {
        isConsanguine,
        consanguinityLevel,
        commonAncestors,
        recommendation: isConsanguine
          ? 'Accouplement déconseillé (consanguinité détectée)'
          : 'Accouplement possible',
      }
    );
  } catch (error) {
    next(error);
  }
};

// ==================== HELPER: CALCULATE COMPLETENESS ====================
function calculateCompleteness(data: any): number {
  const fields = [
    'motherId',
    'fatherId',
    'maternalGrandmotherId',
    'maternalGrandfatherId',
    'paternalGrandmotherId',
    'paternalGrandfatherId',
  ];

  const filledFields = fields.filter((field) => data[field]).length;
  const gen4Count = Array.isArray(data.generation4Ids)
    ? data.generation4Ids.length
    : 0;

  // 2 parents + 4 grands-parents + 8 arrière-grands-parents = 14 total
  const totalPossible = 14;
  const filled = filledFields + gen4Count;

  return Math.round((filled / totalPossible) * 100);
}

// ==================== HELPER: BUILD GENEALOGY TREE ====================
async function buildGenealogyTree(
  animalId: number,
  maxGenerations: number,
  currentGeneration = 0
): Promise<any> {
  if (currentGeneration >= maxGenerations) {
    return null;
  }

  const animal = await prisma.animal.findUnique({
    where: { id: animalId },
    select: {
      id: true,
      name: true,
      gender: true,
      birthDate: true,
      species: { select: { name: true } },
      breed: { select: { name: true } },
    },
  });

  if (!animal) {
    return null;
  }

  const pedigree = await prisma.pedigree.findUnique({
    where: { animalId },
  });

  if (!pedigree) {
    return { ...animal, generation: currentGeneration };
  }

  const [mother, father] = await Promise.all([
    pedigree.motherId
      ? buildGenealogyTree(pedigree.motherId, maxGenerations, currentGeneration + 1)
      : null,
    pedigree.fatherId
      ? buildGenealogyTree(pedigree.fatherId, maxGenerations, currentGeneration + 1)
      : null,
  ]);

  return {
    ...animal,
    generation: currentGeneration,
    mother,
    father,
  };
}
