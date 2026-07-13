import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("specialties", (table) => {
    table.string("icon").nullable();
    table.string("color").nullable();
    table.string("bg").nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("specialties", (table) => {
    table.dropColumn("icon");
    table.dropColumn("color");
    table.dropColumn("bg");
  });
}
