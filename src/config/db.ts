import mysql from 'mysql2/promise';
import env from './env.js'; 

// Création du pool de connexion
const db = mysql.createPool({
  host: env.dbHost,
  user: env.dbUser,
  password: env.dbPassword, 
  database: env.dbName,
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true // Important pour garder le format YYYY-MM-DD sans décalage horaire
});

// Petit test de connexion au démarrage du serveur
db.getConnection()
  .then(connection => {
    console.log(`✅ Connecté à la base de données MySQL : ${env.dbName}`);
    connection.release();
  })
  .catch(err => {
    console.error('❌ Erreur de connexion à la base de données:', err.message);
  });

export default db;