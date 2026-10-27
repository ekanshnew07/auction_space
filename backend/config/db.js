/**
 * Module: backend/config/db.js
 * Purpose: Connects to local MongoDB or automatically falls back to an embedded Free MongoMemoryServer.
 */
const mongoose = require('mongoose');
const { seedDemoData } = require('./seedDemoData');

let memoryServer = null;

const connectDB = async () => {
  const configuredUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/auctionpulse';

  try {
    const conn = await mongoose.connect(configuredUri, {
      maxPoolSize: Number(process.env.MONGO_MAX_POOL_SIZE || 20),
      serverSelectionTimeoutMS: Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS || 2500),
      socketTimeoutMS: Number(process.env.MONGO_SOCKET_TIMEOUT_MS || 45000),
      autoIndex: process.env.NODE_ENV !== 'production',
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    await seedDemoData();
    return;
  } catch (primaryError) {
    console.log(`Local MongoDB at ${configuredUri} not reachable (${primaryError.message}).`);
    console.log('Starting embedded Free MongoMemoryServer (zero external DB setup required)...');
  }

  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    memoryServer = await MongoMemoryServer.create({
      binary: {
        version: '4.4.18',
      },
    });
    const memoryUri = memoryServer.getUri();

    const conn = await mongoose.connect(memoryUri, {
      maxPoolSize: 10,
      autoIndex: true,
    });

    console.log(`Embedded MongoMemoryServer Connected: ${conn.connection.host}`);
    await seedDemoData();
  } catch (error) {
    console.error(`Database initialization error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
