import yup from 'yup';

export const createOrganizationSchema = yup.object({
  name: yup.string().required().min(2),
  contactEmail: yup.string().email().required(),
  address: yup.string().required(),
  ownerName: yup.string().required(),
  contactPhone: yup.string().required(),   
 
});