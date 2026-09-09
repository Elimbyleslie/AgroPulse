import * as Yup from "yup";

export const createFarmUserSchema = Yup.object().shape({
    farmId: Yup.number().required("Farm ID is required"),
    userId: Yup.number().required("User ID is required"),
});