import { Ionicons } from "@expo/vector-icons";

export interface Review {
  id: string;
  name: string;
  date: string;
  rating: number;
  text: string;
  image: string;
}

export interface ExperienceItem {
  role: string;
  hospital: string;
  period: string;
  description: string;
}

export interface EducationItem {
  degree: string;
  institution: string;
  year: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviews: number;
  image: string;
  experience: string;
  patients: string;
  about: string;
  doctorIdCode: string;
  avgSessionTime: string;
  prescriptionType: string;
  contracts: string;
  reviewsList: Review[];
  experienceList: ExperienceItem[];
  educationList: EducationItem[];
}

export const DUMMY_REVIEWS_1: Review[] = [
  {
    id: "1",
    name: "Rita Yeboah",
    date: "Jan 22, 2025",
    rating: 4,
    text: "It has been a pleasure working with this consistently excellent doctor who is beloved and trusted by patients, trainees and peers alike.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150",
  },
  {
    id: "2",
    name: "Maya Thompson",
    date: "March 15, 2025",
    rating: 5,
    text: "Working with Dr. Rita has been amazing. Her commitment to patient care earns her the trust and respect of patients, students, and colleagues alike.",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150",
  },
];

export const DUMMY_REVIEWS_2: Review[] = [
  {
    id: "3",
    name: "Lila Thompson",
    date: "March 20, 2025",
    rating: 5,
    text: "Working with this amazing doctor has been a joy. Highly recommend for any concerns.",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=150",
  },
];

export const TOP_DOCTORS: Doctor[] = [
  {
    id: "1",
    name: "Dr. Rita Yeboah",
    specialty: "Cardiologist",
    rating: 4.9,
    reviews: 124,
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=200",
    experience: "10 Years",
    patients: "+1K",
    about: "Dr. Rita Yeboah is a highly skilled Cardiologist with over 10 years of experience in diagnosing and treating cardiovascular diseases. She is dedicated to providing compassionate and comprehensive care to her patients.",
    doctorIdCode: "RY1001",
    avgSessionTime: "30 min",
    prescriptionType: "Online & Offline",
    contracts: "All Insurance",
    reviewsList: DUMMY_REVIEWS_1,
    experienceList: [
      {
        role: "Senior Cardiologist",
        hospital: "Korle Bu Teaching Hospital",
        period: "2020 - Present",
        description: "Led the cardiovascular care unit, performed diagnostic procedures, managed complex inpatient and outpatient cardiology care.",
      },
      {
        role: "Cardiologist",
        hospital: "Greater Accra Regional Hospital",
        period: "2016 - 2020",
        description: "Diagnosed and treated patients with cardiovascular diseases, specialized in echocardiography and stress tests.",
      },
      {
        role: "Resident in Internal Medicine",
        hospital: "Komfo Anokye Teaching Hospital",
        period: "2013 - 2016",
        description: "Completed comprehensive residency training in general internal medicine and clinical cardiology rotations.",
      },
    ],
    educationList: [
      {
        degree: "Fellowship in Cardiology",
        institution: "West African College of Physicians",
        year: "2016",
      },
      {
        degree: "Doctor of Medicine (M.D.)",
        institution: "University of Ghana Medical School",
        year: "2012",
      },
      {
        degree: "B.Sc. in Human Biology",
        institution: "Kwame Nkrumah University of Science and Technology",
        year: "2009",
      },
    ],
  },
  {
    id: "2",
    name: "Dr. Samuel Mensah",
    specialty: "Pediatrician",
    rating: 4.8,
    reviews: 96,
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=200",
    experience: "12 Years",
    patients: "+500",
    about: "Dr. Samuel Mensah is a board-certified Pediatrician who specializes in the care of infants, children, and adolescents. He believes in a preventive approach to healthcare and works closely with parents.",
    doctorIdCode: "SM2041",
    avgSessionTime: "25 min",
    prescriptionType: "Offline",
    contracts: "BlueCross, Aetna",
    reviewsList: DUMMY_REVIEWS_2,
    experienceList: [
      {
        role: "Head of Pediatrics",
        hospital: "37 Military Hospital",
        period: "2019 - Present",
        description: "Overseeing pediatric services, managing the ward staff, and providing specialist pediatric consultations.",
      },
      {
        role: "Consultant Pediatrician",
        hospital: "Greater Accra Regional Hospital (Ridge)",
        period: "2014 - 2019",
        description: "Provided child health clinical services, managed routine immunizations and developmental screenings.",
      },
      {
        role: "Pediatric Resident",
        hospital: "Korle Bu Teaching Hospital",
        period: "2011 - 2014",
        description: "Completed training in general pediatrics, neonatal intensive care, and pediatric emergency medicine.",
      },
    ],
    educationList: [
      {
        degree: "Fellowship in Pediatrics",
        institution: "Ghana College of Physicians and Surgeons",
        year: "2014",
      },
      {
        degree: "Doctor of Medicine (M.D.)",
        institution: "University of Ghana Medical School",
        year: "2010",
      },
    ],
  },
  {
    id: "3",
    name: "Dr. Emma Watson",
    specialty: "Dermatologist",
    rating: 4.9,
    reviews: 142,
    image: "https://images.unsplash.com/photo-1594824813573-246434de83fb?q=80&w=200",
    experience: "8 Years",
    patients: "+800",
    about: "Dr. Emma Watson is a renowned Dermatologist with expertise in medical, surgical, and cosmetic dermatology. She is passionate about helping patients achieve healthy, beautiful skin.",
    doctorIdCode: "EW3092",
    avgSessionTime: "20 min",
    prescriptionType: "Online",
    contracts: "All Insurance",
    reviewsList: DUMMY_REVIEWS_1,
    experienceList: [
      {
        role: "Consultant Dermatologist",
        hospital: "Skin & Beauty Clinic",
        period: "2021 - Present",
        description: "Providing specialised services in acne treatment, anti-aging therapies, skin cancer screenings, and cosmetic procedures.",
      },
      {
        role: "Dermatologist",
        hospital: "The Trust Hospital",
        period: "2018 - 2021",
        description: "Treated common and rare skin diseases, performed biopsies, cryotherapy, and minor skin surgeries.",
      },
      {
        role: "Dermatology Resident",
        hospital: "Korle Bu Teaching Hospital",
        period: "2015 - 2018",
        description: "Completed clinical training in outpatient skin clinics, phototherapy sessions, and inpatient consults.",
      },
    ],
    educationList: [
      {
        degree: "Master of Medicine in Dermatology",
        institution: "University of Ghana",
        year: "2018",
      },
      {
        degree: "Bachelor of Medicine and Surgery (MBChB)",
        institution: "Kwame Nkrumah University of Science and Technology",
        year: "2014",
      },
    ],
  },
];

export const OTHER_DOCTORS: Doctor[] = [
  {
    id: "4",
    name: "Dr. James Wilson",
    specialty: "Neurologist",
    rating: 4.7,
    reviews: 88,
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=200",
    experience: "15 Years",
    patients: "+2K",
    about: "Dr. James Wilson is a Neurologist with a special interest in movement disorders and cognitive neurology. He is actively involved in clinical research and patient advocacy.",
    doctorIdCode: "JW4022",
    avgSessionTime: "45 min",
    prescriptionType: "Offline",
    contracts: "Medicare, Medicaid",
    reviewsList: DUMMY_REVIEWS_2,
    experienceList: [
      {
        role: "Chief of Neurology",
        hospital: "Korle Bu Teaching Hospital",
        period: "2016 - Present",
        description: "Head of neurology services, coordinating research programs, and managing specialized stroke and epilepsy clinics.",
      },
      {
        role: "Senior Consultant Neurologist",
        hospital: "Mayo Clinic",
        period: "2011 - 2016",
        description: "Diagnosed and treated neurological disorders, collaborated on clinical trials and advanced neuroimaging research.",
      },
      {
        role: "Consultant Neurologist",
        hospital: "University College Hospital",
        period: "2007 - 2011",
        description: "Provided inpatient consults, ran general neurology outpatient clinics, and taught clinical students.",
      },
    ],
    educationList: [
      {
        degree: "Fellowship in Neurology",
        institution: "West African College of Physicians",
        year: "2010",
      },
      {
        degree: "Doctor of Medicine (M.D.)",
        institution: "University of Ibadan",
        year: "2005",
      },
    ],
  },
  {
    id: "5",
    name: "Dr. Lisa Anderson",
    specialty: "Gynecologist",
    rating: 4.8,
    reviews: 110,
    image: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?q=80&w=200",
    experience: "9 Years",
    patients: "+1.5K",
    about: "Dr. Lisa Anderson provides comprehensive women's health services, including obstetrics and gynecology. She is committed to empowering women through education and personalized care.",
    doctorIdCode: "LA5011",
    avgSessionTime: "30 min",
    prescriptionType: "Online & Offline",
    contracts: "All Insurance",
    reviewsList: DUMMY_REVIEWS_1,
    experienceList: [
      {
        role: "Senior Gynecologist",
        hospital: "Nyaho Medical Centre",
        period: "2020 - Present",
        description: "Specializing in minimal access surgery, high-risk pregnancy care, and general gynecological health assessments.",
      },
      {
        role: "Consultant OB/GYN",
        hospital: "Greater Accra Regional Hospital (Ridge)",
        period: "2017 - 2020",
        description: "Provided comprehensive maternal care, managed labor and delivery wards, and ran antenatal clinics.",
      },
      {
        role: "Resident OB/GYN",
        hospital: "Korle Bu Teaching Hospital",
        period: "2014 - 2017",
        description: "Completed residency rotation in obstetrics, gynecology, and reproductive endocrinology.",
      },
    ],
    educationList: [
      {
        degree: "Fellowship in OB/GYN",
        institution: "West African College of Surgeons",
        year: "2017",
      },
      {
        degree: "Doctor of Medicine (M.D.)",
        institution: "University of Ghana Medical School",
        year: "2013",
      },
    ],
  },
  {
    id: "6",
    name: "Dr. Michael Chang",
    specialty: "Orthopedics",
    rating: 4.6,
    reviews: 74,
    image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=200",
    experience: "14 Years",
    patients: "+3K",
    about: "Dr. Michael Chang is an Orthopedic surgeon specializing in sports medicine and joint replacement. He utilizes minimally invasive techniques to accelerate recovery.",
    doctorIdCode: "MC6034",
    avgSessionTime: "40 min",
    prescriptionType: "Offline",
    contracts: "Cigna, UnitedHealthcare",
    reviewsList: DUMMY_REVIEWS_2,
    experienceList: [
      {
        role: "Head of Orthopedics",
        hospital: "Sweden Ghana Medical Centre",
        period: "2017 - Present",
        description: "Directing the orthopedics clinic, leading surgeries for knee/hip replacements, and managing rehabilitation programs.",
      },
      {
        role: "Orthopedic Surgeon",
        hospital: "Korle Bu Teaching Hospital",
        period: "2012 - 2017",
        description: "Performed reconstructive and trauma surgeries, ran weekly post-op outpatient follow-ups.",
      },
      {
        role: "Orthopedic Resident",
        hospital: "Komfo Anokye Teaching Hospital",
        period: "2009 - 2012",
        description: "Completed training in pediatric orthopedics, surgical ward management, and trauma emergency procedures.",
      },
    ],
    educationList: [
      {
        degree: "Fellowship in Orthopedic Surgery",
        institution: "West African College of Surgeons",
        year: "2012",
      },
      {
        degree: "Doctor of Medicine (M.D.)",
        institution: "Kwame Nkrumah University of Science and Technology",
        year: "2008",
      },
    ],
  },
];

export const ALL_DOCTORS = [...TOP_DOCTORS, ...OTHER_DOCTORS];

export interface Specialty {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bg: string;
}

export const SPECIALTIES: Specialty[] = [
  { id: "1", name: "Cardiology", icon: "heart", color: "#EF4444", bg: "#FEF2F2" },
  { id: "2", name: "Pediatrics", icon: "body", color: "#3B82F6", bg: "#EFF6FF" },
  { id: "3", name: "Dermatology", icon: "sparkles", color: "#10B981", bg: "#ECFDF5" },
  { id: "4", name: "Neurology", icon: "pulse", color: "#8B5CF6", bg: "#F5F3FF" },
];

export interface ChatConversation {
  id: string;
  doctorId: string;
  lastMessage: string;
  time: string;
  unreadCount: number;
  online: boolean;
}

export const DOCTOR_CHATS: ChatConversation[] = [
  {
    id: "1",
    doctorId: "1", // Dr. Rita Yeboah
    lastMessage: "Hey Elton, make sure to take your meds on time!",
    time: "10:14 AM",
    unreadCount: 1,
    online: true,
  },
  {
    id: "2",
    doctorId: "2", // Dr. Samuel Mensah
    lastMessage: "You're welcome! Let me know if you need anything else.",
    time: "Yesterday",
    unreadCount: 0,
    online: false,
  },
  {
    id: "3",
    doctorId: "3", // Dr. Emma Watson
    lastMessage: "The rash looks much better. Keep applying the cream.",
    time: "June 18",
    unreadCount: 0,
    online: true,
  },
];

export interface MedicalRecord {
  id: string;
  name: string;
  date: string;
  size: string;
  type: "pdf" | "image";
}

export const DUMMY_MEDICAL_RECORDS: MedicalRecord[] = [
  {
    id: "rec-1",
    name: "Blood_Test_Report.pdf",
    date: "July 02, 2026",
    size: "1.2 MB",
    type: "pdf",
  },
  {
    id: "rec-2",
    name: "Cardiology_Prescription.pdf",
    date: "Jan 22, 2025",
    size: "340 KB",
    type: "pdf",
  },
  {
    id: "rec-3",
    name: "Chest_XRay_Scan.png",
    date: "Nov 15, 2024",
    size: "4.5 MB",
    type: "image",
  },
];
