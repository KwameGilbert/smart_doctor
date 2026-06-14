import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("appointments", (table) => {
    table.boolean("reminder24hSent").notNullable().defaultTo(false);
    table.boolean("reminder1hSent").notNullable().defaultTo(false);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("appointments", (table) => {
    table.dropColumn("reminder24hSent");
    table.dropColumn("reminder1hSent");
  });
}
