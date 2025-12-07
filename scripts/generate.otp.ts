import speakeasy from "speakeasy";

export const generateOtp = () => {
  // 🔥 Génère un secret unique pour l’utilisateur
  const secret = speakeasy.generateSecret().base32;

  // 🔥 Génère un OTP TOTP valide 10 minutes
  const otp = speakeasy.totp({
    secret,
    encoding: "base32",
    digits: 6,
    step: 600, // 600 secondes → 10 minutes
  });

  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  return {
    otp,
    secret,
    expiresAt,
  };
};
