export const autoConvertUnit = (
  quantity: number,
  unit: string,
): { quantity: number; unit: string } => {
  if (unit === "tonne" && quantity < 1) {
    return { quantity: quantity * 1000, unit: "kg" };
  }
  return { quantity, unit };
};