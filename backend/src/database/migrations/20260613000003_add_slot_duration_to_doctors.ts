import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("doctors", (table) => {
    // Number of minutes per bookable appointment slot (doctor-configurable)
    table.integer("slotDurationMinutes").notNullable().defaultTo(30);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("doctors", (table) => {
    table.dropColumn("slotDurationMinutes");
  });
}
