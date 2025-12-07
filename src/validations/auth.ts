import * as yup from 'yup';

export const loginValidation = yup.object().shape({
  email: yup.string().email('invalid email').required('email is required'),
  password: yup
    .string()
    .min(6, 'password must be at least 6 characters long')
    .matches(/[A-Z]/, 'password must contain at least one uppercase')
    .matches(/\d/, 'password must be contain at least one number')
    .matches(/[!@#$%^&*(),.<>;:{}]/, 'password must contain at least one special character')
    .required('password is required'),
});

export const registerUserValidation = yup.object().shape({
  name: yup.string().required('name is required'),
  userName: yup.string().required('name is required'),
  email: yup.string().email('invalid email').required('email is required'),
  password: yup
    .string()
    .min(6, 'password must be at least 6 characters long')
    .matches(/[A-Z]/, 'password must contain at least one uppercase')
    .matches(/\d/, 'password must be contain at least one number')
    .matches(/[!@#$%^&*(),.<>;:{}]/, 'password must contain at least one special character')
    .required('password is required'),
  passwordConfirmation: yup
        .string()
        .oneOf([yup.ref('password')], 'les mots de passe doivent correspondre')
        .required(),
  phone: yup.string().required('phone is required'),
 photo: yup.mixed().nullable(),

  
});

export const optValidation = yup.object({
  email: yup.string().email().required(),
  otp: yup.string().required(),
});

export const resendOptValidation = yup.object({
  email: yup.string().email().required(),
});
export const resetPasswordValidation = yup.object({
  email: yup.string().email().required(),
  otp: yup.string().required(),
    newPassword: yup
    .string()
    .min(6, 'password must be at least 6 characters long')
    .matches(/[A-Z]/, 'password must contain at least one uppercase')
    .matches(/\d/, 'password must be contain at least one number')
    .matches(/[!@#$%^&*(),.<>;:{}]/, 'password must contain at least one special character')
    .required('password is required'),
});


export const updatePasswordValidation = yup.object({
  oldPassword: yup
    .string()
    .min(6, 'password must be at least 6 characters long')
    .matches(/[A-Z]/, 'password must contain at least one uppercase')
    .matches(/\d/, 'password must be contain at least one number')
    .matches(/[!@#$%^&*(),.<>;:{}]/, 'password must contain at least one special character')
    .required('password is required'),
    newPassword: yup
    .string()
    .min(6, 'password must be at least 6 characters long')
    .matches(/[A-Z]/, 'password must contain at least one uppercase')
    .matches(/\d/, 'password must be contain at least one number')
    .matches(/[!@#$%^&*(),.<>;:{}]/, 'password must contain at least one special character')
    .required('password is required'),
});


export const forgotPasswordValidation = yup.object({
  email: yup.string().email().required(),
})


export const verifyEmailOTPValidation = yup.object({
  email: yup.string().email().required(),
  otp: yup.string().required(),
});

export const verifyPhoneOTPValidation = yup.object({
  phone: yup.string().required(),
  otp: yup.string().required(),
});

export const sendEmailVerificationOTPValidation = yup.object({
  email: yup.string().email().required(),
})

export const changePasswordValidation = yup.object({
  oldPassword: yup
    .string()
    .min(6, 'password must be at least 6 characters long')
    .matches(/[A-Z]/, 'password must contain at least one uppercase')
    .matches(/\d/, 'password must be contain at least one number')
    .matches(/[!@#$%^&*(),.<>;:{}]/, 'password must contain at least one special character')
    .required('password is required'),
    newPassword: yup
    .string()
    .min(6, 'password must be at least 6 characters long')
    .matches(/[A-Z]/, 'password must contain at least one uppercase')
    .matches(/\d/, 'password must be contain at least one number')
    .matches(/[!@#$%^&*(),.<>;:{}]/, 'password must contain at least one special character')
    .required('password is required'),
})