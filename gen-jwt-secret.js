// gen-jwt-secret.js
const crypto = require('crypto');

// Clé pour access token
const accessSecret = crypto.randomBytes(32).toString('hex');

// Clé pour refresh token
const refreshSecret = crypto.randomBytes(64).toString('hex');

console.log('=== JWT SECRETS GÉNÉRÉS ===');
console.log('JWT_SECRET=', accessSecret);
console.log('REFRESH_JWT_SECRET=', refreshSecret);
