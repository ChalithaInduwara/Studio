'use strict';

require('dotenv').config();

const app     = require('./src/app');
const { connectDB } = require('./src/config/database');
const { PORT }      = require('./src/config/env');

// ── Establish database connection, then start the HTTP server ──────────────
connectDB().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`\n🚀  StudioSync API is running`);
    console.log(`   ➜  Environment : ${process.env.NODE_ENV}`);
    console.log(`   ➜  Port        : ${PORT}`);
    console.log(`   ➜  Base URL    : http://localhost:${PORT}/api/v1\n`);
  });

  // ── Graceful shutdown ──────────────────────────────────────────────────
  const shutdown = (signal) => {
    console.log(`\n${signal} received. Shutting down gracefully…`);
    server.close(() => {
      console.log('✅  HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT',  () => shutdown('SIGINT'));
}).catch((err) => {
  console.error('❌  Failed to connect to MongoDB:', err.message);
  process.exit(1);
});
