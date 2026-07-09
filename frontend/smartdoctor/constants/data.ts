import { Ionicons } from "@expo/vector-icons";

export interface Review {
  id: string;
  name: string;
  date: string;
  rating: number;
  text: string;
  image: string;
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
}

export const DUMMY_REVIEWS_1: Review[] = [
  {
    id: "1",
    name: "Rita Yeboah",
    date: "Jan 22, 2025",
    rating: 4,
    text: "It has been a pleasure working with his consistently excellent doctor who is beloved and trusted and by patients, trainees and peers alike.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150",
  },
  {
    id: "2",
    name: "Maya Thompson",
    date: "March 15, 2025",
    rating: 5,
    text: "Working with Dr. Smith has been amazing. His commitment to patient care earns him the trust and respect of patients, students, and colleagues alike.",
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
  },
  {
    id: "2",
    name: "Dr. Robert Chen",
    specialty: "Pediatrician",
    rating: 4.8,
    reviews: 96,
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=200",
    experience: "12 Years",
    patients: "+500",
    about: "Dr. Robert Chen is a board-certified Pediatrician who specializes in the care of infants, children, and adolescents. He believes in a preventive approach to healthcare and works closely with parents.",
    doctorIdCode: "RC2041",
    avgSessionTime: "25 min",
    prescriptionType: "Offline",
    contracts: "BlueCross, Aetna",
    reviewsList: DUMMY_REVIEWS_2,
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
