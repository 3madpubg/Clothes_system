const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = require("./app");
const prisma = require("./lib/prisma");

const port = Number(process.env.PORT) || 3000;
let isShuttingDown = false;

const server = app.listen(port, () => {
  console.log(`Shop system backend is running on port ${port}`);
});

const shutdown = (signal) => {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  console.log(`${signal} received. Shutting down gracefully...`);

  server.close(async () => {
    try {
      await prisma.$disconnect();
    } finally {
      process.exit(0);
    }
  });

  setTimeout(async () => {
    try {
      await prisma.$disconnect();
    } finally {
      process.exit(1);
    }
  }, 10000).unref();
};

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));
