import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // 1. users
  await knex.schema.createTable("users", (table) => {
    table.uuid("id").primary();
    table.string("email").notNullable().unique();
    table.string("password").notNullable();
    table.string("phoneNumber").unique();
    table.string("firstName").notNullable();
    table.string("lastName").notNullable();
    table.string("avatarUrl");
    table.string("role").notNullable().defaultTo("PATIENT");
    table.boolean("isVerified").notNullable().defaultTo(false);
    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.timestamp("updatedAt").defaultTo(knex.fn.now());
  });

  // 2. patients
  await knex.schema.createTable("patients", (table) => {
    table.uuid("id").primary().references("id").inTable("users").onDelete("CASCADE");
    table.datetime("dob");
    table.string("gender");
    table.string("bloodGroup");
    table.text("allergies");
    table.string("emergencyContactName");
    table.string("emergencyContactPhone");
    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.timestamp("updatedAt").defaultTo(knex.fn.now());
  });

  // 3. doctors
  await knex.schema.createTable("doctors", (table) => {
    table.uuid("id").primary().references("id").inTable("users").onDelete("CASCADE");
    table.text("bio");
    table.decimal("consultationFee", 10, 2).notNullable();
    table.string("licenseNumber").unique();
    table.integer("experienceYears").notNullable().defaultTo(0);
    table.float("rating").notNullable().defaultTo(0.0);
    table.string("status").notNullable().defaultTo("PENDING");
    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.timestamp("updatedAt").defaultTo(knex.fn.now());
  });

  // 4. admins
  await knex.schema.createTable("admins", (table) => {
    table.uuid("id").primary().references("id").inTable("users").onDelete("CASCADE");
    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.timestamp("updatedAt").defaultTo(knex.fn.now());
  });

  // 5. specialties
  await knex.schema.createTable("specialties", (table) => {
    table.uuid("id").primary();
    table.string("name").notNullable().unique();
    table.text("description");
  });

  // 6. doctorSpecialties
  await knex.schema.createTable("doctorSpecialties", (table) => {
    table.uuid("doctorId").references("id").inTable("doctors").onDelete("CASCADE");
    table.uuid("specialtyId").references("id").inTable("specialties").onDelete("CASCADE");
    table.primary(["doctorId", "specialtyId"]);
  });

  // 7. doctorAvailabilities
  await knex.schema.createTable("doctorAvailabilities", (table) => {
    table.uuid("id").primary();
    table.uuid("doctorId").notNullable().references("id").inTable("doctors").onDelete("CASCADE");
    table.integer("dayOfWeek").notNullable();
    table.string("startTime").notNullable();
    table.string("endTime").notNullable();
    table.boolean("isAvailable").notNullable().defaultTo(true);
  });

  // 8. doctorUnavailabilities
  await knex.schema.createTable("doctorUnavailabilities", (table) => {
    table.uuid("id").primary();
    table.uuid("doctorId").notNullable().references("id").inTable("doctors").onDelete("CASCADE");
    table.date("date").notNullable();
    table.string("reason");
  });

  // 9. appointments
  await knex.schema.createTable("appointments", (table) => {
    table.uuid("id").primary();
    table.uuid("patientId").notNullable().references("id").inTable("patients").onDelete("CASCADE");
    table.uuid("doctorId").notNullable().references("id").inTable("doctors").onDelete("CASCADE");
    table.timestamp("dateTime").notNullable();
    table.string("status").notNullable().defaultTo("PENDING");
    table.text("reason");
    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.timestamp("updatedAt").defaultTo(knex.fn.now());
  });

  // 10. consultations
  await knex.schema.createTable("consultations", (table) => {
    table.uuid("id").primary();
    table.uuid("appointmentId").notNullable().unique().references("id").inTable("appointments").onDelete("CASCADE");
    table.text("diagnosis");
    table.text("notes");
    table.text("recommendations");
    table.timestamp("startedAt");
    table.timestamp("endedAt");
    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.timestamp("updatedAt").defaultTo(knex.fn.now());
  });

  // 11. videoSessions
  await knex.schema.createTable("videoSessions", (table) => {
    table.uuid("id").primary();
    table.uuid("consultationId").notNullable().unique().references("id").inTable("consultations").onDelete("CASCADE");
    table.string("channelName").notNullable();
    table.text("token");
    table.string("status").notNullable().defaultTo("INACTIVE");
    table.timestamp("startedAt");
    table.timestamp("endedAt");
  });

  // 12. messages
  await knex.schema.createTable("messages", (table) => {
    table.uuid("id").primary();
    table.uuid("consultationId").notNullable().references("id").inTable("consultations").onDelete("CASCADE");
    table.uuid("senderId").notNullable().references("id").inTable("users").onDelete("CASCADE");
    table.text("content").notNullable();
    table.string("attachmentUrl");
    table.string("attachmentType");
    table.timestamp("createdAt").defaultTo(knex.fn.now());
  });

  // 13. medicalRecords
  await knex.schema.createTable("medicalRecords", (table) => {
    table.uuid("id").primary();
    table.uuid("patientId").notNullable().references("id").inTable("patients").onDelete("CASCADE");
    table.uuid("doctorId").references("id").inTable("doctors").onDelete("SET NULL");
    table.string("recordType").notNullable();
    table.text("description");
    table.string("attachmentUrl");
    table.timestamp("recordDate").notNullable();
    table.timestamp("createdAt").defaultTo(knex.fn.now());
  });

  // 14. prescriptions
  await knex.schema.createTable("prescriptions", (table) => {
    table.uuid("id").primary();
    table.uuid("consultationId").unique().references("id").inTable("consultations").onDelete("SET NULL");
    table.uuid("patientId").notNullable().references("id").inTable("patients").onDelete("CASCADE");
    table.uuid("doctorId").notNullable().references("id").inTable("doctors").onDelete("CASCADE");
    table.text("notes");
    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.timestamp("updatedAt").defaultTo(knex.fn.now());
  });

  // 15. prescriptionItems
  await knex.schema.createTable("prescriptionItems", (table) => {
    table.uuid("id").primary();
    table.uuid("prescriptionId").notNullable().references("id").inTable("prescriptions").onDelete("CASCADE");
    table.string("medication").notNullable();
    table.string("dosage").notNullable();
    table.string("frequency").notNullable();
    table.string("duration").notNullable();
    table.text("instructions");
  });

  // 16. payments
  await knex.schema.createTable("payments", (table) => {
    table.uuid("id").primary();
    table.uuid("appointmentId").notNullable().unique().references("id").inTable("appointments").onDelete("CASCADE");
    table.uuid("patientId").notNullable().references("id").inTable("patients").onDelete("CASCADE");
    table.decimal("amount", 10, 2).notNullable();
    table.string("status").notNullable().defaultTo("PENDING");
    table.string("provider").notNullable().defaultTo("PAYSTACK");
    table.string("reference").notNullable().unique();
    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.timestamp("updatedAt").defaultTo(knex.fn.now());
  });

  // 17. transactions
  await knex.schema.createTable("transactions", (table) => {
    table.uuid("id").primary();
    table.uuid("paymentId").references("id").inTable("payments").onDelete("SET NULL");
    table.uuid("userId").notNullable().references("id").inTable("users").onDelete("CASCADE");
    table.decimal("amount", 10, 2).notNullable();
    table.string("type").notNullable();
    table.text("description").notNullable();
    table.timestamp("createdAt").defaultTo(knex.fn.now());
  });

  // 18. doctorVerifications
  await knex.schema.createTable("doctorVerifications", (table) => {
    table.uuid("id").primary();
    table.uuid("doctorId").notNullable().references("id").inTable("doctors").onDelete("CASCADE");
    table.string("documentType").notNullable();
    table.string("documentUrl").notNullable();
    table.string("status").notNullable().defaultTo("PENDING");
    table.text("comments");
    table.uuid("reviewedById").references("id").inTable("admins").onDelete("SET NULL");
    table.timestamp("reviewedAt");
    table.timestamp("createdAt").defaultTo(knex.fn.now());
  });

  // 19. reviews
  await knex.schema.createTable("reviews", (table) => {
    table.uuid("id").primary();
    table.uuid("doctorId").notNullable().references("id").inTable("doctors").onDelete("CASCADE");
    table.uuid("patientId").notNullable().references("id").inTable("patients").onDelete("CASCADE");
    table.uuid("appointmentId").notNullable().unique().references("id").inTable("appointments").onDelete("CASCADE");
    table.integer("rating").notNullable();
    table.text("comment");
    table.timestamp("createdAt").defaultTo(knex.fn.now());
  });

  // 20. notifications
  await knex.schema.createTable("notifications", (table) => {
    table.uuid("id").primary();
    table.uuid("userId").notNullable().references("id").inTable("users").onDelete("CASCADE");
    table.string("title").notNullable();
    table.text("body").notNullable();
    table.string("type").notNullable();
    table.boolean("isRead").notNullable().defaultTo(false);
    table.timestamp("createdAt").defaultTo(knex.fn.now());
  });

  // 21. auditLogs
  await knex.schema.createTable("auditLogs", (table) => {
    table.uuid("id").primary();
    table.uuid("userId").references("id").inTable("users").onDelete("SET NULL");
    table.string("action").notNullable();
    table.text("details").notNullable();
    table.string("ipAddress");
    table.timestamp("createdAt").defaultTo(knex.fn.now());
  });

  // 22. documents
  await knex.schema.createTable("documents", (table) => {
    table.uuid("id").primary();
    table.string("name").notNullable();
    table.string("fileUrl").notNullable();
    table.integer("fileSize");
    table.string("mimeType");
    table.uuid("uploadedById").notNullable().references("id").inTable("users").onDelete("CASCADE");
    table.timestamp("createdAt").defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  // Drop tables in reverse order of creation
  await knex.schema.dropTableIfExists("documents");
  await knex.schema.dropTableIfExists("auditLogs");
  await knex.schema.dropTableIfExists("notifications");
  await knex.schema.dropTableIfExists("reviews");
  await knex.schema.dropTableIfExists("doctorVerifications");
  await knex.schema.dropTableIfExists("transactions");
  await knex.schema.dropTableIfExists("payments");
  await knex.schema.dropTableIfExists("prescriptionItems");
  await knex.schema.dropTableIfExists("prescriptions");
  await knex.schema.dropTableIfExists("medicalRecords");
  await knex.schema.dropTableIfExists("messages");
  await knex.schema.dropTableIfExists("videoSessions");
  await knex.schema.dropTableIfExists("consultations");
  await knex.schema.dropTableIfExists("appointments");
  await knex.schema.dropTableIfExists("doctorUnavailabilities");
  await knex.schema.dropTableIfExists("doctorAvailabilities");
  await knex.schema.dropTableIfExists("doctorSpecialties");
  await knex.schema.dropTableIfExists("specialties");
  await knex.schema.dropTableIfExists("admins");
  await knex.schema.dropTableIfExists("doctors");
  await knex.schema.dropTableIfExists("patients");
  await knex.schema.dropTableIfExists("users");
}
