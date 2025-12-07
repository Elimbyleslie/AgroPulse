import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import { UploadedFile } from 'express-fileupload';
import { format,parse } from 'date-fns';
import { Request, Response } from 'express';

// Conversion de __filename et __dirname pour ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Utilities {
  /**
   * Formate les erreurs de validation (Yup, Zod, etc.)
   */
  static formatValidationErrors(error: Record<string, any> = {}) {
    const errors = error.inner?.reduce((acc: Record<string, any>, err: Record<string, any>) => {
      if (err.path && !acc[err.path]) acc[err.path] = err.message;
      return acc;
    }, {}) || {};
    return errors;
  }

  /**
   * Réponse de succès standard (Express)
   */
  static successResponse(res: Response, message: string, data: any = null, status = 200) {
    return res.status(status).json({
      meta: {
        status,
        message,
      },
      data,
    });
  }
    static successReponse = (code: number, message: string, data: any) => {
    return {
      meta: {
        status: code,
        message,
      },
      data,
    };
  };


  static errorResponse = (code: number, message: string, error?: any) => {
    return {
      meta: {
        status: code,
        message,
      },
      error,
    };
  };
  /**
   * Réponse de succès simple (sans Express)
   */
  static buildSuccess(code: number, message: string, data: any = null) {
    return {
      meta: { status: code, message },
      data,
    };
  }

  /**
   * Réponse d'erreur simple (sans Express)
   */
  static buildError(code: number, message: string, error?: any) {
    return {
      meta: { status: code, message },
      error,
    };
  }

  /**
   * Vérifie si un fichier existe
   */
  static async fileExists(filePath: string) {
    try {
      await fsp.access(filePath, fs.constants.F_OK);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Sauvegarde un fichier uploadé (ex: image, PDF)
   */
  static async saveFile(file: UploadedFile, uploadDir = 'uploads'): Promise<string> {
    try {
      const targetDir = path.join(__dirname, '../../public', uploadDir);
      await fsp.mkdir(targetDir, { recursive: true });

      const extension = path.extname(file.name);
      const filename = `${Date.now()}_${Math.random().toString(36).slice(2)}${extension}`;
      const filePath = path.join(targetDir, filename);

      await file.mv(filePath);
      return `/${uploadDir}/${filename}`;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du fichier:', error);
      throw new Error('Échec de l’enregistrement du fichier.');
    }
  }

  /**
   * Sauvegarde plusieurs images et renvoie leurs chemins
   */
  static async saveImages(files: UploadedFile | UploadedFile[], uploadDir = 'uploads'): Promise<string[]> {
    const normalized = Array.isArray(files) ? files : [files];
    const paths: string[] = [];

    for (const file of normalized) {
      const pathSaved = await this.saveFile(file, uploadDir);
      paths.push(pathSaved);
    }

    return paths;
  }

  /**
   * Résout une URL publique à partir d’un chemin relatif
   */
  static resolveFileUrl(req: Request, relativePath: string) {
    if (!relativePath) return '';
    if (relativePath.startsWith('http')) return relativePath;
    return `${req.protocol}://${req.get('host')}${relativePath}`;
  }

  static resolveFileUrls(req: Request, relativePaths: string[] = []) {
    return relativePaths.map((p) => this.resolveFileUrl(req, p));
  }

  /**
   * Nettoie un objet en supprimant les espaces inutiles
   */
  static cleanObject(obj: Record<string, any>) {
    return Object.keys(obj).reduce((acc, key) => {
      const cleanKey = key.trim();
      const value = obj[key];
      acc[cleanKey] = typeof value === 'string' ? value.trim() : value;
      return acc;
    }, {} as Record<string, any>);
  }

  /**
   * Formate une date pour la base de données
   */
  static formatDate(date: string | Date): string {
    const dateObj = typeof date === 'string' ? parse(date) : date;
    return format(dateObj, 'yyyy-MM-dd HH:mm:ss');
  }

  /**
   * Génère un entier aléatoire
   */
  static generateRandomInt(min = 1000, max = 9999) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Hash un mot de passe (bcrypt)
   */
  static async hashPassword(password: string) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  /**
   * Compare un mot de passe avec son hash
   */
  static async comparePassword(password: string, hash: string) {
    return bcrypt.compare(password, hash);
  }


}

export default Utilities;
