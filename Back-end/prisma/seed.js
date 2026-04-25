// backend/prisma/seed.js
const path = require("path");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const prisma = require("../src/lib/prisma");

const DEFAULT_DEV_ADMIN = {
  name: "System Admin",
  username: "admin",
  password: "Admin@1234",
};

const getSeedAdmin = () => {
  const name = process.env.SEED_ADMIN_NAME || DEFAULT_DEV_ADMIN.name;
  const username = process.env.SEED_ADMIN_USERNAME;
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (username && password) {
    return { name, username, password };
  }

  if (process.env.NODE_ENV !== "production") {
    return DEFAULT_DEV_ADMIN;
  }

  throw new Error(
    [
      "No ADMIN user exists.",
      "Set SEED_ADMIN_USERNAME and SEED_ADMIN_PASSWORD before running the seed in production.",
    ].join(" "),
  );
};

async function main() {
  const existing = await prisma.user.findFirst({
    where: { role: "ADMIN" },
  });

  if (existing) {
    console.log("Admin already exists:", existing.username);
    return;
  }

  const seedAdmin = getSeedAdmin();
  const hashed = await bcrypt.hash(seedAdmin.password, 12);

  const admin = await prisma.user.create({
    data: {
      name: seedAdmin.name,
      username: seedAdmin.username,
      password: hashed,
      role: "ADMIN",
      isActive: true,
    },
  });

  console.log("Admin created successfully.");
  console.log("   Username:", admin.username);
  console.log("Change the password after first login.");
}

main()
  .catch((err) => {
    console.error(err.message || err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
