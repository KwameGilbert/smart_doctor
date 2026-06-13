import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("doctorUnavailabilities", (table) => {
    // Optional time range for partial-day blocks.
    // NULL + NULL = full-day block (backwards-compatible with existing rows).
    table.string("startTime").nullable();
    table.string("endTime").nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("doctorUnavailabilities", (table) => {
    table.dropColumn("startTime");
    table.dropColumn("endTime");
  });
}
