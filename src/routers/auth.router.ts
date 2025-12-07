import { Router } from "express";
import {
  login,
  refreshToken,
  register,
  resetPassword,
  verifyOtp,
  resendOtp,
  logout,
  updatePassword,
  sendEmailVerificationOTP,
  verifyEmailOTP,
  changePassword

} from "../controllers/auth.controller.js";
import { validator } from "../middlewares/validator.middleware.js";
import {
  loginValidation,  
  registerUserValidation,
  optValidation,
  resendOptValidation,
  resetPasswordValidation,
sendEmailVerificationOTPValidation,
verifyEmailOTPValidation,
changePasswordValidation,


  
} from "../validations/auth.js";

const router = Router();

// Routes publiques
router.post("/login", validator(loginValidation), login);
router.post("/register", validator(registerUserValidation), register);
router.post("/verify-otp", validator(optValidation),verifyOtp,);
router.post("/resend-otp", validator(resendOptValidation), resendOtp);
router.post("/verify-email-otp",validator(verifyEmailOTPValidation), verifyEmailOTP);
router.post("/send-email-verification-otp",validator(sendEmailVerificationOTPValidation), sendEmailVerificationOTP);
router.post("/reset-password",validator(resetPasswordValidation),resetPassword);
router.post("/change-password",validator(changePasswordValidation), changePassword);
router.post("/refresh-token", refreshToken);
router.post("/logout", logout);
router.post("/update-password", updatePassword);

export default router;
