/**
 * Centralized list of API endpoints for the Smart Doctor application.
 * These match the routing structure of the Node.js/Express backend.
 */
export const API_ENDPOINTS = {
  // Authentication Routes
  AUTH: {
    REGISTER: "/auth/register",
    VERIFY: "/auth/verify",
    RESEND_OTP: "/auth/resend-otp",
    LOGIN: "/auth/login",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
  },

  // User Profile Routes
  USERS: {
    ME: "/users/me",
    PROFILE: "/users/profile",
    HOME: "/users/home",
    DIRECTORY: "/users/doctors",
    DOCTOR_DETAIL: (id: string) => `/users/doctors/${id}`,
    UPDATE: (id: string) => `/users/${id}`,
  },

  // Specialties
  SPECIALTIES: {
    LIST: "/specialties",
    DETAIL: (id: string) => `/specialties/${id}`,
  },

  // Doctors / Availability
  DOCTORS: {
    AVAILABILITY: "/doctors/availability",
    UNAVAILABILITY: "/doctors/unavailability",
    GET_AVAILABLE_SLOTS: (doctorId: string) => `/doctors/${doctorId}/available-slots`,
  },

  // Appointments
  APPOINTMENTS: {
    CREATE: "/appointments",
    LIST: "/appointments",
    DETAIL: (id: string) => `/appointments/${id}`,
    CANCEL: (id: string) => `/appointments/${id}/cancel`,
    RESCHEDULE: (id: string) => `/appointments/${id}/reschedule`,
  },

  // Consultations & Messages
  CONSULTATIONS: {
    LIST: "/consultations",
    VIDEO: "/consultations/video",
    MESSAGES: "/consultations/messages",
  },

  // Medical Records & Prescriptions
  MEDICAL_RECORDS: {
    LIST: "/medical-records",
    CREATE: "/medical-records",
    DETAIL: (id: string) => `/medical-records/${id}`,
  },
  PRESCRIPTIONS: {
    LIST: "/prescriptions",
    DETAIL: (id: string) => `/prescriptions/${id}`,
  },

  // Reviews
  REVIEWS: {
    CREATE: "/reviews",
    LIST_BY_DOCTOR: (doctorId: string) => `/reviews/doctor/${doctorId}`,
  },

  // Notifications
  NOTIFICATIONS: {
    LIST: "/notifications",
    READ: (id: string) => `/notifications/${id}/read`,
    READ_ALL: "/notifications/read-all",
    CLEAR_ALL: "/notifications",
    DELETE: (id: string) => `/notifications/${id}`,
  },

  // General Upload
  UPLOAD: "/upload",
} as const;
