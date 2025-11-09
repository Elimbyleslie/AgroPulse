// import multer from 'multer';
// import path from 'path';
// import fs from 'fs';

// export const createMulterStorage = (folder: string) => {
//   const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);

//   if (!fs.existsSync(uploadDir)) {
//     fs.mkdirSync(uploadDir, { recursive: true });
//   }

//   const storage = multer.diskStorage({
//     destination: (_, __, cb ) => cb(null, uploadDir),
//     filename: (_, file, cb) => {
//       const ext = path.extname(file.originalname);
//       const uniqueName = `${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`;
//       cb(null, uniqueName);
//     },
//   });

//   return multer({
//     storage,
//     limits: { fileSize: 10 * 1024 * 1024 },
//     fileFilter: (_, file, cb) => {
//       const allowed = ['image/jpeg', 'image/png', 'image/webp'];
//       allowed.includes(file.mimetype)
//         ? cb(null, true)
//         : cb(new Error('Format d’image non autorisé'));
//     },
//   });
// };
