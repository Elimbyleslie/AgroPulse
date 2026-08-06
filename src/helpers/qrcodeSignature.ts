// src/utils/qrSignature.ts
import crypto from "crypto";

export const signQr = (animalId: number) => {
  return crypto
    .createHmac("sha256", process.env.QR_SECRET!)
    .update(`ANIMAL:${animalId}`)
    .digest("hex");
};

export const verifyQr = (animalId: number, signature: string) => {
  const expected = signQr(animalId);
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
};
