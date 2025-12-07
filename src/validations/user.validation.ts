import yup from 'yup';

const passwordRules: RegExp = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{5,}$/;

export const createdUserSchema = yup.object({
  email: yup.string().email().required(),
  name: yup.string().required().min(2),
  phone: yup.string().required(),
  password: yup
    .string()
    .matches(passwordRules, { message: 'créer un mot de passe plus  securisé' })
    .required()
    .min(8) as yup.StringSchema,
  passwordConfirmation: yup
    .string()
    .oneOf([yup.ref('password')], 'les mots de passe doivent correspondre')
    .required(),
});