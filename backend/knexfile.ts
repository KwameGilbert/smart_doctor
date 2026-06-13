import type { Knex } from "knex";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, ".env") });

const config: { [key: string]: Knex.Config } = {
  development: {
    client: "postgresql",
    connection: process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/smart_doctor",
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: "knex_migrations",
      directory: path.join(__dirname, "src/database/migrations"),
      extension: "ts"
    },
    seeds: {
      directory: path.join(__dirname, "src/database/seeds"),
      extension: "ts"
    }
  },
  production: {
    client: "postgresql",
    connection: process.env.DATABASE_URL,
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: "knex_migrations",
      directory: path.join(__dirname, "src/database/migrations"),
      extension: "js"
    }
  }
};

export default config;
