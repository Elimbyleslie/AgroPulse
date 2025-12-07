import * as yup from "yup";

export const createNotificationSchema = yup.object({
  userId: yup.number().required("userId est obligatoire"),
  title: yup.string().required("Le titre est obligatoire").max(255),
  message: yup.string().required("Le message est obligatoire"),
});

export const updateNotificationSchema = yup.object({
  title: yup.string().max(255),
  message: yup.string(),
  read: yup.boolean(),
});
