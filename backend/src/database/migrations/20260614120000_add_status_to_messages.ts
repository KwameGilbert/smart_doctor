import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("messages", (table) => {
    table.string("status").notNullable().defaultTo("SENT");
    table.timestamp("deliveredAt");
    table.timestamp("readAt");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("messages", (table) => {
    table.dropColumn("status");
    table.dropColumn("deliveredAt");
    table.dropColumn("readAt");
  });
}
