import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("otps", (table) => {
    table.uuid("id").primary();
    table.uuid("userId").notNullable().references("id").inTable("users").onDelete("CASCADE");
    table.string("code").notNullable();
    table.string("purpose").notNullable().defaultTo("VERIFICATION");
    table.timestamp("expiresAt").notNullable();
    table.timestamp("createdAt").defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("otps");
}
