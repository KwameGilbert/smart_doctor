import { Knex } from "knex";
import crypto from "crypto";

export async function seed(knex: Knex): Promise<void> {
  // 1. Delete existing data in reverse order of foreign key dependencies
  await knex("prescriptionItems").del();
  await knex("prescriptions").del();
  await knex("videoSessions").del();
  await knex("messages").del();
  await knex("consultations").del();
  await knex("transactions").del();
  await knex("payments").del();
  await knex("reviews").del();
  await knex("appointments").del();
  
  await knex("doctorVerifications").del();
  await knex("doctorSpecialties").del();
  await knex("doctorAvailabilities").del();
  await knex("doctorUnavailabilities").del();
  await knex("medicalRecords").del();
  await knex("specialties").del();
  
  await knex("otps").del();
  await knex("patients").del();
  await knex("doctors").del();
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
      avatarUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=200",
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
      avatarUrl: "https://images.unsplash.com/photo-1594824813573-246434de83fb?q=80&w=200",
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
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200",
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
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200",
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
      avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200",
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

  // 8. Seed Doctor Availabilities (Mon - Fri)
  const availabilities = [];
  const startTimes = ["09:00", "13:00"];
  const endTimes = ["12:00", "17:00"];

  for (let day = 1; day <= 5; day++) {
    // Dr. Smith Slots
    availabilities.push({
      id: crypto.randomUUID(),
      doctorId: userIds.drSmith,
      dayOfWeek: day,
      startTime: "09:00",
      endTime: "12:00",
      isAvailable: true
    });
    availabilities.push({
      id: crypto.randomUUID(),
      doctorId: userIds.drSmith,
      dayOfWeek: day,
      startTime: "13:30",
      endTime: "17:00",
      isAvailable: true
    });

    // Dr. Davis Slots
    availabilities.push({
      id: crypto.randomUUID(),
      doctorId: userIds.drDavis,
      dayOfWeek: day,
      startTime: "09:00",
      endTime: "12:00",
      isAvailable: true
    });
    availabilities.push({
      id: crypto.randomUUID(),
      doctorId: userIds.drDavis,
      dayOfWeek: day,
      startTime: "13:30",
      endTime: "17:00",
      isAvailable: true
    });
  }
  await knex("doctorAvailabilities").insert(availabilities);

  // 9. Seed Appointments
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setUTCHours(9, 30, 0, 0); // tomorrow at 09:30 UTC

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setUTCHours(10, 0, 0, 0); // yesterday at 10:00 UTC

  const apptIds = {
    appt1: "11111111-1111-1111-1111-111111111111",
    appt2: "22222222-2222-2222-2222-222222222222"
  };

  await knex("appointments").insert([
    {
      id: apptIds.appt1,
      patientId: userIds.patientJohn,
      doctorId: userIds.drDavis,
      dateTime: yesterday.toISOString(),
      status: "COMPLETED",
      reason: "Online Call|Routine blood check review",
      createdAt: yesterday.toISOString(),
      updatedAt: yesterday.toISOString()
    },
    {
      id: apptIds.appt2,
      patientId: userIds.patientJohn,
      doctorId: userIds.drDavis,
      dateTime: tomorrow.toISOString(),
      status: "PENDING",
      reason: "Online Call|Routine cardiologist consulting",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]);

  // 10. Seed Consultations
  const consultationId = "33333333-3333-3333-3333-333333333333";
  await knex("consultations").insert([
    {
      id: consultationId,
      appointmentId: apptIds.appt1,
      diagnosis: "Healthy recovery, stable cardiovascular parameters.",
      notes: "Checked blood lipid profile and standard markers. All normal.",
      recommendations: "Continue moderate exercise and cardiovascular friendly diet.",
      startedAt: yesterday.toISOString(),
      endedAt: new Date(yesterday.getTime() + 30 * 60 * 1000).toISOString()
    }
  ]);

  // 11. Seed Reviews
  await knex("reviews").insert([
    {
      id: "44444444-4444-4444-4444-444444444444",
      doctorId: userIds.drDavis,
      patientId: userIds.patientJohn,
      appointmentId: apptIds.appt1,
      rating: 5,
      comment: "Dr. Sarah Davis is extremely professional and helpful. Explains diagnosis parameters perfectly.",
      createdAt: yesterday.toISOString()
    }
  ]);

  // 12. Seed Medical Records
  await knex("medicalRecords").insert([
    {
      id: "55555555-5555-5555-5555-555555555555",
      patientId: userIds.patientJohn,
      doctorId: userIds.drDavis,
      recordType: "Blood Test",
      description: "Standard full lipid profile, complete blood count, biochemistry checks.",
      attachmentUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      recordDate: yesterday.toISOString(),
      createdAt: yesterday.toISOString()
    }
  ]);

  // 13. Seed Prescriptions
  const prescriptionId = "66666666-6666-6666-6666-666666666666";
  await knex("prescriptions").insert([
    {
      id: prescriptionId,
      consultationId: consultationId,
      patientId: userIds.patientJohn,
      doctorId: userIds.drDavis,
      notes: "Standard daily multivitamin supplements."
    }
  ]);

  // 14. Seed Prescription Items
  await knex("prescriptionItems").insert([
    {
      id: "77777777-7777-7777-7777-777777777777",
      prescriptionId: prescriptionId,
      medication: "Omega 3 Capsules",
      dosage: "1000mg",
      frequency: "Once Daily",
      duration: "30 Days",
      instructions: "Take with breakfast or morning meal."
    }
  ]);

  // 15. Seed Payments
  await knex("payments").insert([
    {
      id: "88888888-8888-8888-8888-888888888888",
      appointmentId: apptIds.appt1,
      patientId: userIds.patientJohn,
      amount: 120.00,
      status: "SUCCESSFUL",
      provider: "PAYSTACK",
      reference: "PAY-DB-SEED-12345"
    }
  ]);

  // 16. Seed Notifications
  await knex("notifications").insert([
    {
      id: "99999999-9999-9999-9999-999999999999",
      userId: userIds.patientJohn,
      title: "Appointment Booked Successfully",
      body: "Your cardiologist consulting appointment with Dr. Sarah Davis has been scheduled.",
      type: "APPOINTMENT",
      isRead: false
    }
  ]);
}
