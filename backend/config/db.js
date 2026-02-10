const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = process.env.DB_NAME || 'sample_mflix';

async function connectDB() {
  if (!MONGO_URI) {
    throw new Error('Falta MONGO_URI en el archivo .env');
  }

  await mongoose.connect(MONGO_URI, {
    dbName: DB_NAME,
  });

  console.log('Conectado a MongoDB con Mongoose. BD:', DB_NAME);
}

module.exports = connectDB;