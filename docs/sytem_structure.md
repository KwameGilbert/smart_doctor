Final System Structure
1. Patient Mobile App (React Native)

Used by patients only.

Modules
Authentication
Register
Login
OTP verification
Password reset
Profile
Personal information
Medical information
Emergency contacts
Doctor Discovery
Search doctors
Filter by specialty
View doctor profiles
Appointments
Book appointment
Reschedule
Cancel
Appointment history
Consultation
Chat
Video consultation
File sharing
Medical Records
Diagnoses
Prescriptions
Lab reports
Medical history
Payments
Paystack
Mobile Money
Card payments
Notifications
Appointment reminders
Medication reminders
Doctor messages
AI Assistant
Symptom checker
Health FAQs
Appointment guidance
2. Doctor Web Application

Built with React or preferably React.js.

Doctors generally work with larger screens and need to process more information at once.

Doctor Dashboard
Overview

Widgets:

Today's appointments
Upcoming consultations
Pending consultations
Revenue summary
Recent patients
Patient Management
Patient List
Search patients
Filter patients
View patient details
Patient Profile
Personal information
Consultation history
Prescriptions
Medical records
Uploaded reports
Appointment Management
Calendar view
Accept appointment
Reject appointment
Reschedule appointment
Consultation Center
Chat
Real-time messaging
File attachments
Video Consultation
Video calls
Consultation notes
Prescription Management
Create prescription
Edit prescription
Download PDF prescription
Prescription templates
Medical Records
Upload diagnosis
Upload reports
Update patient records
Availability Management
Set working days
Set consultation hours
Vacation mode
Earnings Dashboard
Revenue
Completed consultations
Withdrawal requests
3. Admin Dashboard

Built with React or React.js.

This is where platform management happens.

System Dashboard
Statistics
Total patients
Total doctors
Active consultations
Monthly revenue
New registrations
User Management
Patients
View patients
Suspend accounts
Verify accounts
Doctors
Approve doctors
Reject applications
Suspend doctors
Doctor Verification Workflow

Doctor submits:

Medical license
Certificates
Identification

Admin reviews:

Pending
  ↓
Approved
  ↓
Active Doctor

or

Pending
  ↓
Rejected
Consultation Monitoring
View consultation logs
View chat history (if legally permitted)
Monitor system activity
Content Management
Health articles
Announcements
FAQs
Terms and Conditions
Financial Management
Transactions
Refunds
Revenue reports
Commission management
Audit Logs

Track:

Login activity
Account changes
Record updates
Admin actions
Technology Stack
Frontend
Patient App
React Native
Expo
NativeWind
Zustand
React Query
Doctor Portal
React.js
TypeScript
Tailwind CSS
ShadCN UI
Admin Portal
React.js
TypeScript
Tailwind CSS
ShadCN UI
Backend
API
Node.js
Express.js
TypeScript
ORM
Prisma
Database
PostgreSQL
Authentication
JWT Access Tokens
Refresh Tokens
bcrypt
Real-Time Features
Socket.IO

Used for:

Chat
Notifications
Appointment updates
Video Calling

I would recommend:

Agora

for a student project because it is much easier than managing raw WebRTC infrastructure.

Storage
Cloudflare R2

or

AWS S3

Store:

Prescriptions
Medical reports
Doctor certificates
Patient uploads
Notifications
Firebase Cloud Messaging (FCM)

For:

Push notifications
Appointment reminders
Consultation alerts
Database Modules

Core entities:

users

patients
doctors
admins

doctor_specialties

appointments

consultations

messages

video_sessions

medical_records

prescriptions

prescription_items

doctor_availability

notifications

payments

transactions

doctor_verifications

documents

reviews

audit_logs

This architecture is clean because each user type gets the interface best suited to their workflow:

Patients → Mobile-first experience
Doctors → Productivity-focused web portal
Admins → Operations-focused web dashboard

It is also an excellent fit for React Native + React.js + Express + PostgreSQL + Prisma, which gives you a modern, scalable full-stack architecture.