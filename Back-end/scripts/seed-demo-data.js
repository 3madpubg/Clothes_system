const fs = require("fs/promises");
const path = require("path");
const dotenv = require("dotenv");
const { Client } = require("pg");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const demoSqlPath = path.resolve(__dirname, "../prisma/demo/demo_data.sql");

const getDatasetCounts = async (client) => {
  const { rows } = await client.query(`
    SELECT
      (SELECT COUNT(*)::int FROM products) AS products,
      (SELECT COUNT(*)::int FROM product_variants) AS variants,
      (SELECT COUNT(*)::int FROM suppliers) AS suppliers,
      (SELECT COUNT(*)::int FROM customers) AS customers,
      (SELECT COUNT(*)::int FROM purchase_invoices) AS purchase_invoices,
      (SELECT COUNT(*)::int FROM sales_invoices) AS sales_invoices
  `);

  return rows[0];
};

const hasBusinessData = (counts) =>
  Object.values(counts).some((value) => Number(value || 0) > 0);

async function main() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not set.");
  }

  const client = new Client({ connectionString });
  await client.connect();

  try {
    const beforeCounts = await getDatasetCounts(client);

    if (hasBusinessData(beforeCounts)) {
      console.log(
        "Skipping demo seed because the database already contains application data.",
      );
      console.log(beforeCounts);
      return;
    }

    const sql = await fs.readFile(demoSqlPath, "utf8");

    if (!sql.trim()) {
      throw new Error(`Demo SQL file is empty: ${demoSqlPath}`);
    }

    console.log(`Seeding demo data from ${demoSqlPath}`);

    await client.query("BEGIN");
    await client.query(sql);
    await client.query("COMMIT");

    const afterCounts = await getDatasetCounts(client);
    console.log("Demo data imported successfully.");
    console.log(afterCounts);
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error("Failed to seed demo data.");
  console.error(error);
  process.exit(1);
});
