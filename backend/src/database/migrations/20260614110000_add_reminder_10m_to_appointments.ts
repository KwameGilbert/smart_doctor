import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("appointments", (table) => {
    table.boolean("reminder10mSent").notNullable().defaultTo(false);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("appointments", (table) => {
    table.dropColumn("reminder10mSent");
  });
}
