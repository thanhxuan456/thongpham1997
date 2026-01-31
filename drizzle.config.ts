import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

const dbType = process.env.DB_TYPE || "postgresql";

export default defineConfig({
  out: "./migrations",
  schema: dbType === "mysql" ? "./shared/schema-mysql.ts" : "./shared/schema.ts",
  dialect: dbType === "mysql" ? "mysql" : "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
