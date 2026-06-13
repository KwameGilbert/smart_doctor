SYSTEM DESIGN

Think of the system as three clients talking to one API:

Patient App
      |
      |
Doctor Portal
      |
      |
Admin Portal
      |
      v
Express API
      |
      v
PostgreSQL
PATIENT MOBILE APP
Authentication
Login

Features

Login
Forgot password
OTP verification
Register

Features

Create account
Verify phone/email
Main Navigation
Home
Doctors
Appointments
Messages
Profile
Home Page

Features

Health Summary
Upcoming appointments
Active prescriptions
Unread messages
Quick Actions
Book appointment
Find doctor
View prescriptions
Medical records
Notifications
Appointment reminders
Doctor messages
Doctors Page

Features

Search
Search doctor
Filters
Specialty
Availability
Doctor Card
Name
Specialty
Experience
Rating
Doctor Profile
Bio
Availability
Consultation fee
Actions
Book appointment
Start chat (after appointment approval)
Appointments Page

Features

Upcoming
Upcoming appointments
Past
Appointment history
Appointment Details
Date
Time
Doctor
Actions
Cancel
Reschedule
Join consultation
Consultation Page

Features

Chat
Text messages
Images
Documents
Video
Join consultation
Consultation Summary
Diagnosis
Notes
Medical Records Page

Features

Medical History
Diagnoses
Prescriptions
Doctor prescriptions
Lab Results
Uploaded reports
Downloads
Download records
Payments Page

Features

Make Payment
Paystack
History
Payment records
Receipts
Download receipt
Notifications Page

Features

Appointment reminders
Prescription reminders
System notifications
Profile Page

Features

Personal Information
Name
DOB
Contact
Health Information
Blood group
Allergies
Settings
Password
Notification preferences
DOCTOR WEB PORTAL
Authentication
Login
Forgot Password
Sidebar
Dashboard
Appointments
Patients
Consultations
Prescriptions
Schedule
Messages
Profile
Dashboard

Features

Statistics
Today's appointments
Pending appointments
Completed appointments
Recent Activity
Latest consultations
Upcoming Schedule
Today's calendar
Appointments

Features

Appointment List
View appointments
Appointment Actions
Accept
Reject
Reschedule
Filters
Date
Status
Patients

Features

Patient List
Search patients
Patient Profile
Personal details
Appointment history
Medical history
Prescriptions
Consultations

Features

Consultation Room
Chat
Video call
Consultation Notes
Diagnosis
Recommendations
End Consultation
Save summary
Prescriptions

Features

Create Prescription
Medication
Dosage
Duration
Prescription History
Previous prescriptions
PDF Export
Download prescription
Schedule

Features

Availability
Working days
Working hours
Vacation Mode
Unavailable dates
Messages

Features

Patient Conversations
Chat list
Attachments
Reports
Images
Earnings (Optional)

Features

Consultation income
Payment history
Profile

Features

Personal information
Qualifications
Specialties
ADMIN DASHBOARD
Authentication
Login
Sidebar
Dashboard
Doctors
Patients
Appointments
Payments
Content
Reports
Settings
Dashboard

Features

Platform Statistics
Total doctors
Total patients
Total appointments
Revenue
Recent Activity
New registrations
Recent consultations
Doctors

Features

Doctor Applications
Review doctor applications
Verification
Medical license
Certificates
Actions
Approve
Reject
Suspend
Patients

Features

User Management
Search patients
Suspend account
Account Details
View profile
Appointments

Features

Monitoring
View appointments
Issue Resolution
Cancel problematic appointments
Payments

Features

Transactions
Payment records
Refunds
Process refunds
Revenue
Platform earnings
Content

Features

Articles
Create article
Edit article
Announcements
Publish announcements
Reports

Features

Analytics
User growth
Appointment growth
Revenue growth
Exports
CSV export
PDF export
Settings

Features

System Settings
Consultation fees
Platform commission
Notification Templates
Email templates
Push notification templates
SHARED FEATURES ACROSS ALL APPS

These are what make the three systems work together.

Appointments

Flow:

Patient Books Appointment
          |
          v
Doctor Receives Request
          |
    Accept/Reject
          |
          v
Patient Notified
Consultation

Flow:

Patient Joins
        |
        v
Doctor Joins
        |
        v
Consultation
        |
        v
Prescription Created
        |
        v
Patient Receives Prescription
Messaging

Flow:

Patient Sends Message
        |
        v
Doctor Receives Message
        |
        v
Doctor Replies
Medical Records

Flow:

Doctor Creates Record
         |
         v
Stored In Database
         |
         v
Patient Can View
Notifications

Flow:

Action Occurs
      |
      v
Notification Service
      |
      +---- Patient
      |
      +---- Doctor
      |
      +---- Admin

This structure is intentionally simple, avoids feature bloat, and is exactly the kind of architecture that can be built reliably by a small team while still feeling like a complete healthcare platform.