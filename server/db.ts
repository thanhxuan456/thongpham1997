import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { drizzle as drizzleMysql } from "drizzle-orm/mysql2";
import pg from "pg";
import mysql from "mysql2/promise";
import * as schemaPg from "../shared/schema";
import * as schemaMysql from "../shared/schema-mysql";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const dbType = process.env.DB_TYPE || "postgresql";
const databaseUrl = process.env.DATABASE_URL;

let db: any;
let pool: any;

if (dbType === "mysql") {
  pool = mysql.createPool(databaseUrl);
  db = drizzleMysql(pool, { schema: schemaMysql, mode: "default" });
} else {
  pool = new Pool({ connectionString: databaseUrl });
  db = drizzlePg(pool, { schema: schemaPg });
}

export { db, pool };
export const schema = dbType === "mysql" ? schemaMysql : schemaPg;
