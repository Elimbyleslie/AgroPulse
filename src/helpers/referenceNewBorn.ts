
export const generateNewbornReference = (index?: number): string => {
  const year = new Date().getFullYear();
  const prefix = "NB"; // Pour Newborn
  
  if (index !== undefined) {
    // Format séquentiel : NB-2026-001
    const sequence = String(index + 1).padStart(3, '0');
    return `${prefix}-${year}-${sequence}`;
  } else {
    // Format aléatoire court : NB-2026-A9B2
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${year}-${randomSuffix}`;
  }
};