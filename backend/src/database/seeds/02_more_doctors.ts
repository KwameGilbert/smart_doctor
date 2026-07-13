import { Knex } from "knex";
import crypto from "crypto";

export async function seed(knex: Knex): Promise<void> {
  // Pre-hashed password for 'password123' (using bcryptjs)
  const passwordHash = "$2a$10$Xm57uV7J/b3KjZ6pY7w8E.jZ8uV6mN8tFhOaN2v7T4wP9o7Kz.y2e";

  const specialties = [
    "34d1d888-f34f-4f33-bcbe-0e01d227361c", // General Medicine
    "e1b0b555-d14f-4d33-bcbe-8e01d227361a", // Cardiology
    "23c1c777-e24f-4e33-acbe-9e01d227361b", // Pediatrics
    "45e1e999-044f-4033-acbe-1e01d227361d", // Dermatology
  ];

  const firstNames = [
    "James", "John", "Robert", "Michael", "William", "David", "Richard", "Joseph",
    "Thomas", "Charles", "Christopher", "Daniel", "Matthew", "Anthony", "Mark",
    "Donald", "Steven", "Paul", "Andrew", "Joshua", "Mary", "Patricia", "Jennifer",
    "Linda", "Elizabeth", "Barbara", "Susan", "Jessica", "Sarah", "Karen", "Nancy",
    "Lisa", "Betty", "Margaret", "Sandra", "Ashley", "Kimberly", "Emily", "Donna",
    "Michelle"
  ];

  const lastNames = [
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Miller", "Davis", "Garcia",
    "Rodriguez", "Wilson", "Martinez", "Anderson", "Taylor", "Thomas", "Hernandez",
    "Moore", "Martin", "Jackson", "Thompson", "White", "Lopez", "Lee", "Gonzalez",
    "Harris", "Clark", "Lewis", "Robinson", "Walker", "Perez", "Hall"
  ];

  const bios = [
    "Experienced professional committed to delivering premium healthcare and patient-focused treatments.",
    "Dedicated to clinical excellence and compassionate healthcare services for all patients.",
    "Specialist practitioner focusing on advanced diagnosis, wellness, and preventive care.",
    "Striving to improve health outcomes through evidence-based treatments and holistic management.",
    "Passionate about medical research and integrating modern technology in daily patient treatments."
  ];

  const userInserts = [];
  const doctorInserts = [];
  const specialtyMaps = [];

  for (let i = 1; i <= 50; i++) {
    const doctorId = crypto.randomUUID();
    const firstName = firstNames[(i * 3) % firstNames.length];
    const lastName = lastNames[(i * 7) % lastNames.length];
    const email = `dr.${firstName.toLowerCase()}.${lastName.toLowerCase()}.${i}@smartdoctor.com`;
    const phoneNumber = `+2332410000${String(i).padStart(2, "0")}`;
    const bio = bios[i % bios.length];
    const fee = Math.floor(40 + (i % 6) * 20); // 40, 60, 80, 100, 120, 140
    const license = `MDC/LIC/8${String(100 + i)}`;
    const experience = 3 + (i % 22); // 3 to 24 years
    const rating = Math.round((4.4 + (i % 6) * 0.1) * 10) / 10; // 4.4 to 4.9
    const specialtyId = specialties[i % specialties.length];

    userInserts.push({
      id: doctorId,
      email,
      password: passwordHash,
      phoneNumber,
      firstName,
      lastName,
      role: "DOCTOR",
      isVerified: true
    });

    doctorInserts.push({
      id: doctorId,
      bio,
      consultationFee: fee,
      licenseNumber: license,
      experienceYears: experience,
      rating,
      status: "APPROVED"
    });

    specialtyMaps.push({
      doctorId,
      specialtyId
    });
  }

  // Insert in chunks to be database-friendly
  await knex("users").insert(userInserts);
  await knex("doctors").insert(doctorInserts);
  await knex("doctorSpecialties").insert(specialtyMaps);
  
  console.log(`Successfully seeded 50 additional doctors.`);
}
