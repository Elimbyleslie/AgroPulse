import fs from 'fs';
import crypto from 'crypto';
import path from 'path';

const envPath = path.join(process.cwd(), '.env');

const generateSecret = (length = 64) => crypto.randomBytes(length).toString('hex');

const accessSecret = generateSecret(32);
const refreshSecret = generateSecret(64);

// Lire le contenu existant du .env s’il existe
let envContent = '';
if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf-8');
}

// Supprimer les anciennes clés si elles existent
envContent = envContent
  .replace(/^JWT_SECRET=.*/m, '')
  .replace(/^REFRESH_JWT_SECRET=.*/m, '')
  .trim();

envContent += `\nJWT_SECRET=${accessSecret}\nREFRESH_JWT_SECRET=${refreshSecret}\n`;

fs.writeFileSync(envPath, envContent.trim() + '\n');

console.log('✅ Clés JWT générées et ajoutées dans le fichier .env :');
console.log('- JWT_SECRET ajouté');
console.log('- REFRESH_JWT_SECRET ajouté');
