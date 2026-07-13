import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  // 1. Delete existing data in reverse order of foreign key dependencies
  await knex("otps").del();
  await knex("doctorSpecialties").del();
  await knex("specialties").del();
  await knex("doctors").del();
  await knex("patients").del();
  await knex("admins").del();
  await knex("users").del();

  // Pre-hashed password for 'password123' (using bcryptjs)
  const passwordHash = "$2a$10$Xm57uV7J/b3KjZ6pY7w8E.jZ8uV6mN8tFhOaN2v7T4wP9o7Kz.y2e";

  // 2. Seed Specialties
  const specialtyIds = {
    generalMedicine: "34d1d888-f34f-4f33-bcbe-0e01d227361c",
    cardiology: "e1b0b555-d14f-4d33-bcbe-8e01d227361a",
    pediatrics: "23c1c777-e24f-4e33-acbe-9e01d227361b",
    dermatology: "45e1e999-044f-4033-acbe-1e01d227361d"
  };

  await knex("specialties").insert([
    {
      id: specialtyIds.generalMedicine,
      name: "General Medicine",
      description: "Primary care medical services, health checks, and general consulting.",
      icon: "medkit",
      color: "#0EA5E9",
      bg: "#F0F9FF"
    },
    {
      id: specialtyIds.cardiology,
      name: "Cardiology",
      description: "Disorders of the heart and the blood vessels.",
      icon: "heart",
      color: "#EF4444",
      bg: "#FEF2F2"
    },
    {
      id: specialtyIds.pediatrics,
      name: "Pediatrics",
      description: "Medical care for infants, children, and adolescents.",
      icon: "body",
      color: "#3B82F6",
      bg: "#EFF6FF"
    },
    {
      id: specialtyIds.dermatology,
      name: "Dermatology",
      description: "Diagnosis and treatment of skin, hair, and nail disorders.",
      icon: "sparkles",
      color: "#10B981",
      bg: "#ECFDF5"
    }
  ]);

  // 3. Seed Users
  const userIds = {
    drSmith: "a1b0b111-c14f-4d33-bcbe-8e01d227361a",
    drDavis: "b2c0c222-d24f-4e33-acbe-9e01d227361b",
    patientJohn: "c3d0d333-e34f-4f33-bcbe-0e01d227361c",
    patientJane: "d4e0e444-f44f-4033-acbe-1e01d227361d",
    systemAdmin: "e5f0f555-054f-4133-bcbe-2e01d227361e"
  };

  await knex("users").insert([
    {
      id: userIds.drSmith,
      email: "dr.smith@smartdoctor.com",
      password: passwordHash,
      phoneNumber: "+233240000001",
      firstName: "James",
      lastName: "Smith",
      role: "DOCTOR",
      isVerified: true
    },
    {
      id: userIds.drDavis,
      email: "dr.davis@smartdoctor.com",
      password: passwordHash,
      phoneNumber: "+233240000002",
      firstName: "Sarah",
      lastName: "Davis",
      role: "DOCTOR",
      isVerified: true
    },
    {
      id: userIds.patientJohn,
      email: "john.doe@email.com",
      password: passwordHash,
      phoneNumber: "+233240000003",
      firstName: "John",
      lastName: "Doe",
      role: "PATIENT",
      isVerified: true
    },
    {
      id: userIds.patientJane,
      email: "jane.doe@email.com",
      password: passwordHash,
      phoneNumber: "+233240000004",
      firstName: "Jane",
      lastName: "Doe",
      role: "PATIENT",
      isVerified: true
    },
    {
      id: userIds.systemAdmin,
      email: "admin@smartdoctor.com",
      password: passwordHash,
      phoneNumber: "+233240000005",
      firstName: "System",
      lastName: "Admin",
      role: "ADMIN",
      isVerified: true
    }
  ]);

  // 4. Seed Doctors
  await knex("doctors").insert([
    {
      id: userIds.drSmith,
      bio: "Experienced general practitioner with over 10 years of experience in primary health care.",
      consultationFee: 50.00,
      licenseNumber: "MDC/GD/84920",
      experienceYears: 10,
      rating: 4.8,
      status: "APPROVED"
    },
    {
      id: userIds.drDavis,
      bio: "Consultant Cardiologist specializing in interventional cardiology and cardiovascular diseases.",
      consultationFee: 120.00,
      licenseNumber: "MDC/CD/93021",
      experienceYears: 15,
      rating: 4.9,
      status: "APPROVED"
    }
  ]);

  // 5. Map Doctors to Specialties
  await knex("doctorSpecialties").insert([
    {
      doctorId: userIds.drSmith,
      specialtyId: specialtyIds.generalMedicine
    },
    {
      doctorId: userIds.drDavis,
      specialtyId: specialtyIds.cardiology
    }
  ]);

  // 6. Seed Patients
  await knex("patients").insert([
    {
      id: userIds.patientJohn,
      dob: new Date("1990-05-15"),
      gender: "Male",
      bloodGroup: "O+",
      allergies: "Penicillin",
      emergencyContactName: "Jane Doe",
      emergencyContactPhone: "+233240000004"
    },
    {
      id: userIds.patientJane,
      dob: new Date("1993-08-20"),
      gender: "Female",
      bloodGroup: "A-",
      allergies: "Nuts, Dust",
      emergencyContactName: "John Doe",
      emergencyContactPhone: "+233240000003"
    }
  ]);

  // 7. Seed Admins
  await knex("admins").insert([
    {
      id: userIds.systemAdmin
    }
  ]);
}
