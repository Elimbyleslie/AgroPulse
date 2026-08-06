import * as Yup from "yup";

export const assignRoleSchema = Yup.object().shape({
  userId: Yup
    .number()
    .integer()
    .positive()
    .required("L'ID de l'utilisateur est requis"),
  roleId: Yup
    .number()
    .integer()
    .positive()
    .required("L'ID du rôle est requis"),
  assignedBy: Yup
    .string()
    .required("Le nom de l'administrateur qui a assigné le rôle est requis")
});




export const assignPermissionSchema = Yup.object().shape({
  roleId: Yup
    .number()
    .integer()
    .positive()
    .required("L'ID du rôle est requis"),
  permissionId: Yup
    .number()
    .integer()
    .positive()
    .required("L'ID de la permission est requis")
});



export const createRoleSchema = Yup.object().shape({
  name: Yup.string().required("Le nom du rôle est requis"),
  description: Yup.string().optional(),
  permissionIds: Yup.array()
    .of(Yup.number().integer().positive())
    .optional()
});

export const updateRoleSchema = Yup.object().shape({
  name: Yup.string().optional(),
  description: Yup.string().optional(),
  permissionIds: Yup.array()
    .of(Yup.number().integer().positive())
    .optional()
});



export const createPermissionSchema = Yup.object().shape({
  code: Yup.string().required("Le code de la permission est requis"),
  description: Yup.string().required("La description de la permission est requise"),
});

export const updatePermissionSchema = Yup.object().shape({
  code: Yup.string().optional(),
  description: Yup.string().optional(),
});
