// In-memory data store for VetBox
// Provides instant high-fidelity local functionality when offline / in preview mode,
// and maps directly to the PostgreSQL schema and Supabase RLS structures.

import {
  Profile,
  VeterinarianProfile,
  Clinic,
  Pet,
  PetVetLink,
  MedicalVisit,
  VaccinationRecord,
  VaccinationPlan,
  Medication,
  Reminder,
  Article,
  Notification,
  AuditLog,
  Prescription,
  PrescriptionItem,
} from "../types/database.types";

export interface MockStoreState {
  currentProfile: Profile;
  profiles: Profile[];
  veterinarians: VeterinarianProfile[];
  clinics: Clinic[];
  pets: Pet[];
  links: PetVetLink[];
  visits: MedicalVisit[];
  vaccinations: VaccinationRecord[];
  vaccinationPlans: VaccinationPlan[];
  medications: Medication[];
  prescriptions: Prescription[];
  reminders: Reminder[];
  articles: Article[];
  notifications: Notification[];
  auditLogs: AuditLog[];
}

// Initial mock state mirroring seed.sql
const initialProfiles: Profile[] = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    role: "owner",
    full_name: "أحمد محمود القاضي",
    phone: "01012345678",
    avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    governorate: "Cairo",
    city: "Maadi",
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z",
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    role: "owner",
    full_name: "سارة عبد الرحمن",
    phone: "01198765432",
    avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
    governorate: "Giza",
    city: "Dokki",
    created_at: "2024-02-01T10:00:00Z",
    updated_at: "2024-02-01T10:00:00Z",
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    role: "veterinarian",
    full_name: "د. يوسف الشناوي",
    phone: "01234567890",
    avatar_url: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=200&q=80",
    governorate: "Cairo",
    city: "New Cairo",
    created_at: "2023-11-10T10:00:00Z",
    updated_at: "2023-11-10T10:00:00Z",
  },
  {
    id: "44444444-4444-4444-4444-444444444444",
    role: "veterinarian",
    full_name: "د. مريم النجار",
    phone: "01055554433",
    avatar_url: "https://images.unsplash.com/photo-1594824813583-ce58f1f503e9?auto=format&fit=crop&w=200&q=80",
    governorate: "Giza",
    city: "Sheikh Zayed",
    created_at: "2024-01-05T10:00:00Z",
    updated_at: "2024-01-05T10:00:00Z",
  },
  {
    id: "55555555-5555-5555-5555-555555555555",
    role: "admin",
    full_name: "إدارة منصة فيت بوكس",
    phone: "01000000001",
    avatar_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80",
    governorate: "Cairo",
    city: "Nasr City",
    created_at: "2023-10-01T10:00:00Z",
    updated_at: "2023-10-01T10:00:00Z",
  },
];

const initialVeterinarians: VeterinarianProfile[] = [
  {
    id: "33333333-3333-3333-3333-333333333333",
    license_number: "EGY-VET-48920",
    years_of_experience: 12,
    specializations: ["small_animals", "surgery", "orthopedics"],
    education: "بكالوريوس طب بيطري - جامعة القاهرة، ماجستير جراحة الحيوانات الصغيرة",
    bio: "طبيب بيطري استشاري متخصص في جراحة العظام والأنسجة الرخوة للحيوانات الأليفة، عضو الجمعية المصرية لطب وجراحة الحيوانات الصغيرة.",
    verification_status: "verified",
    verified_at: "2023-11-15T12:00:00Z",
    consultation_fee: 350,
    emergency_available: true,
    clinic_affiliation_name: "مستشفى النيل البيطري التخصصي",
    created_at: "2023-11-10T10:00:00Z",
    updated_at: "2023-11-10T10:00:00Z",
    profile: initialProfiles[2],
  },
  {
    id: "44444444-4444-4444-4444-444444444444",
    license_number: "EGY-VET-51204",
    years_of_experience: 8,
    specializations: ["feline_medicine", "dermatology", "preventive_care"],
    education: "بكالوريوس طب وجراحة بيطرية - جامعة عين شمس، دبلوم الأمراض الجلدية",
    bio: "أخصائية طب وجراحة القطط والأمراض الجلدية والحساسية، مع اهتمام خاص بالرعاية الوقائية والتغذية العلاجية للقطط والكلاب.",
    verification_status: "verified",
    verified_at: "2024-01-10T14:00:00Z",
    consultation_fee: 280,
    emergency_available: false,
    clinic_affiliation_name: "عيادة واحة الأليف البيطرية",
    created_at: "2024-01-05T10:00:00Z",
    updated_at: "2024-01-05T10:00:00Z",
    profile: initialProfiles[3],
  },
];

const initialClinics: Clinic[] = [
  {
    id: "a0000000-0000-0000-0000-000000000001",
    name: "Nile Veterinary Specialty Hospital",
    name_ar: "مستشفى النيل البيطري التخصصي",
    clinic_type: "hospital",
    phone: "0227508900",
    emergency_phone: "01234567890",
    email: "contact@nilevethospital.eg",
    address: "شارع التسعين الشمالي، التجمع الخامس، القاهرة الجديدة",
    governorate: "Cairo",
    city: "New Cairo",
    latitude: 30.0254,
    longitude: 31.4721,
    services: ["جراحة متقدمة", "أشعة سينية وسونار", "عناية مركزة 24 ساعة", "معمل تحاليل فوري", "إقامة وتطعيمات"],
    species_treated: ["كلاب", "قطط", "طيور", "حيوانات أليفة صغيرة"],
    is_emergency_247: true,
    is_verified: true,
    cover_image_url: "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=1200&q=80",
    created_at: "2023-09-01T10:00:00Z",
    updated_at: "2023-09-01T10:00:00Z",
  },
  {
    id: "a0000000-0000-0000-0000-000000000002",
    name: "Pet Oasis Veterinary Clinic",
    name_ar: "عيادة واحة الأليف البيطرية",
    clinic_type: "clinic",
    phone: "0238514230",
    emergency_phone: "01055554433",
    email: "info@petoasisegypt.com",
    address: "ميدان الحصري، المحور المركزي، الشيخ زايد، الجيزة",
    governorate: "Giza",
    city: "Sheikh Zayed",
    latitude: 30.0521,
    longitude: 30.9852,
    services: ["كشف وفحص عام", "تطعيمات دورية", "طب الأسنان", "عناية وجلاقة", "أمراض جلدية"],
    species_treated: ["كلاب", "قطط", "أرانب"],
    is_emergency_247: false,
    is_verified: true,
    cover_image_url: "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=1200&q=80",
    created_at: "2023-10-15T10:00:00Z",
    updated_at: "2023-10-15T10:00:00Z",
  },
  {
    id: "a0000000-0000-0000-0000-000000000003",
    name: "Maadi Vet Center",
    name_ar: "مركز المعادي للرعاية البيطرية",
    clinic_type: "clinic",
    phone: "0223589120",
    emergency_phone: "01122334455",
    email: "maadivet@gmail.com",
    address: "شارع 9، دجلة، المعادي، القاهرة",
    governorate: "Cairo",
    city: "Maadi",
    latitude: 29.9602,
    longitude: 31.2825,
    services: ["كشف شامل", "تحاليل معملية", "تركيب شريحة إلكترونية", "شهادات سفر دولية"],
    species_treated: ["كلاب", "قطط", "طيور"],
    is_emergency_247: false,
    is_verified: true,
    cover_image_url: "https://images.unsplash.com/photo-1599443015574-be5fe8a05783?auto=format&fit=crop&w=1200&q=80",
    created_at: "2023-11-01T10:00:00Z",
    updated_at: "2023-11-01T10:00:00Z",
  },
  {
    id: "a0000000-0000-0000-0000-000000000004",
    name: "Alexandria Equine & Livestock Clinic",
    name_ar: "عيادة الإسكندرية للخيول والماشية",
    clinic_type: "center",
    phone: "034298100",
    emergency_phone: "01088776655",
    email: "alex.equine@gmail.com",
    address: "طريق برج العرب، كينج مريوط، الإسكندرية",
    governorate: "Alexandria",
    city: "Borg El Arab",
    latitude: 31.0125,
    longitude: 29.7423,
    services: ["طب الخيول والعرج", "صحة قطعان الماشية", "وحدة بيطرية متنقلة للمزارع", "جراحة التوليد والتناسليات"],
    species_treated: ["خيول", "أبقار/عجول", "أغنام", "ماعز"],
    is_emergency_247: true,
    is_verified: true,
    cover_image_url: "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=1200&q=80",
    created_at: "2023-12-05T10:00:00Z",
    updated_at: "2023-12-05T10:00:00Z",
  },
];

const initialPets: Pet[] = [
  {
    id: "b0000000-0000-0000-0000-000000000001",
    owner_id: "11111111-1111-1111-1111-111111111111",
    name: "روكي (Rocky)",
    species: "dog",
    breed: "جيرمن شيبرد (German Shepherd)",
    gender: "male",
    birth_date: "2022-04-15",
    is_age_estimated: false,
    weight_kg: 32.5,
    weight_recorded_at: "2024-11-10",
    color: "أسود مع تان (Black & Tan)",
    microchip_number: "900182001928374",
    identifying_marks: "علامة بيضاء صغيرة في الصدر",
    photo_url: "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?auto=format&fit=crop&w=600&q=80",
    is_spayed_neutered: true,
    species_attributes: {
      activity_level: "عالي جداً",
      diet: "دراي فود عالي البروتين مع مكملات مفاصل",
    },
    is_deceased: false,
    created_at: "2024-01-16T10:00:00Z",
    updated_at: "2024-11-10T10:00:00Z",
  },
  {
    id: "b0000000-0000-0000-0000-000000000002",
    owner_id: "11111111-1111-1111-1111-111111111111",
    name: "لونا (Luna)",
    species: "cat",
    breed: "شيرازي رومي (Persian Mix)",
    gender: "female",
    birth_date: "2023-08-10",
    is_age_estimated: false,
    weight_kg: 3.8,
    weight_recorded_at: "2024-10-10",
    color: "أبيض ناصع مع عيون عسلية",
    microchip_number: "900182001928555",
    identifying_marks: "شعر طويل كثيف جداً",
    photo_url: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80",
    is_spayed_neutered: false,
    species_attributes: {
      indoor_only: true,
      hairball_care: true,
    },
    is_deceased: false,
    created_at: "2024-01-16T11:00:00Z",
    updated_at: "2024-10-10T10:00:00Z",
  },
  {
    id: "b0000000-0000-0000-0000-000000000003",
    owner_id: "22222222-2222-2222-2222-222222222222",
    name: "زعفرانة (Zaafarana)",
    species: "horse",
    breed: "خيول عربية أصيلة (Arabian)",
    gender: "female",
    birth_date: "2019-02-20",
    is_age_estimated: false,
    weight_kg: 430.0,
    weight_recorded_at: "2024-09-01",
    color: "رمادي كستنائي (Chestnut)",
    microchip_number: "EGY-EAU-2019-041",
    identifying_marks: "غرة بيضاء في الجبين وثلاث قوائم بيضاء",
    photo_url: "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=600&q=80",
    is_spayed_neutered: false,
    species_attributes: {
      studbook_id: "EGY-WAHO-8841",
      discipline: "قفز حواجز وترويض",
    },
    is_deceased: false,
    created_at: "2024-02-05T10:00:00Z",
    updated_at: "2024-09-01T10:00:00Z",
  },
  {
    id: "b0000000-0000-0000-0000-000000000004",
    owner_id: "22222222-2222-2222-2222-222222222222",
    name: "تويتي (Tweety)",
    species: "bird",
    breed: "كوكتيل (Cockatiel)",
    gender: "male",
    birth_date: null,
    is_age_estimated: true,
    estimated_age_months: 18,
    weight_kg: 0.09,
    weight_recorded_at: "2024-08-15",
    color: "رمادي مع خدود برتقالية وتاج أصفر",
    microchip_number: null,
    identifying_marks: "حلقة معدنية في الساق اليمنى رقم EG-22",
    photo_url: "https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&w=600&q=80",
    is_spayed_neutered: false,
    species_attributes: {
      cage_type: "قفص طيران واسع",
      vocalization: "تغريد مستمر وصفير ألحان",
    },
    is_deceased: false,
    created_at: "2024-03-01T10:00:00Z",
    updated_at: "2024-08-15T10:00:00Z",
  },
];

const initialLinks: PetVetLink[] = [
  {
    id: "link-001",
    pet_id: "b0000000-0000-0000-0000-000000000001",
    vet_id: "33333333-3333-3333-3333-333333333333",
    status: "accepted",
    permission_scope: "full_clinical_access",
    requested_by: "11111111-1111-1111-1111-111111111111",
    notes: "الطبيب المعالج الأساسي لمتابعة العظام والتطعيمات الدورية.",
    created_at: "2024-01-20T10:00:00Z",
    updated_at: "2024-01-21T10:00:00Z",
    pet: initialPets[0],
    vet: initialVeterinarians[0],
  },
  {
    id: "link-002",
    pet_id: "b0000000-0000-0000-0000-000000000002",
    vet_id: "44444444-4444-4444-4444-444444444444",
    status: "accepted",
    permission_scope: "full_clinical_access",
    requested_by: "11111111-1111-1111-1111-111111111111",
    notes: "المتابعة الدورية والفحص السنوي والجلدية.",
    created_at: "2024-01-22T10:00:00Z",
    updated_at: "2024-01-23T10:00:00Z",
    pet: initialPets[1],
    vet: initialVeterinarians[1],
  },
];

const initialVisits: MedicalVisit[] = [
  {
    id: "c0000000-0000-0000-0000-000000000001",
    pet_id: "b0000000-0000-0000-0000-000000000001",
    vet_id: "33333333-3333-3333-3333-333333333333",
    clinic_id: "a0000000-0000-0000-0000-000000000001",
    created_by: "33333333-3333-3333-3333-333333333333",
    author_role: "veterinarian",
    visit_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    visit_type: "routine_checkup",
    visit_reason: "فحص دوري شامل وإعطاء الجرعة التنشيطية للتطعيم السنوي",
    presenting_complaints: "الكلب بصحة ونشاط ممتاز، لا توجد شكوى من الجهاز الهضمي أو التنفسي.",
    clinical_examination: "الأغشية المخاطية وردية رطبة، نبضات القلب منتظمة وخالية من النفخات، تنفس هادئ وطبيعي، المفاصل سليمة بدون ألم عند التحريك، العقد الليمفاوية طبيعية.",
    diagnosis: "حالة صحية ممتازة مع وزن مثالي لسلالة الجيرمن شيبرد (32.5 كجم).",
    treatment_plan: "إعطاء تطعيم السعار والتطعيم الثماني، وصف أقراص وقاية دورية ضد الديدان وحشرات القراد والبراغيث.",
    temperature_celsius: 38.6,
    heart_rate_bpm: 92,
    respiratory_rate_bpm: 22,
    is_verified_diagnosis: true,
    next_appointment_date: "2025-05-10",
    follow_up_recommendations: "إعادة الفحص ومتابعة الوزن بعد 6 أشهر، أو عند ملاحظة أي تغير في النشاط أو الشهية.",
    status: "finalized",
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    pet: initialPets[0],
    vet: initialVeterinarians[0],
    clinic: initialClinics[0],
  },
  {
    id: "c0000000-0000-0000-0000-000000000002",
    pet_id: "b0000000-0000-0000-0000-000000000002",
    vet_id: "44444444-4444-4444-4444-444444444444",
    clinic_id: "a0000000-0000-0000-0000-000000000002",
    created_by: "44444444-4444-4444-4444-444444444444",
    author_role: "veterinarian",
    visit_date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    visit_type: "emergency",
    visit_reason: "حكة جلدية شديدة وتساقط شعر في منطقة الرقبة وأعلى الظهر",
    presenting_complaints: "لاحظ المربي هرشاً مستمراً لمدة 3 أيام مع ظهور احمرار موضعي خفيف.",
    clinical_examination: "وجود بقع حمراء مع قشور خفيفة خلف الأذنين وأعلى العنق، فحص مصباح وود خالي من الفطريات الشائعة.",
    diagnosis: "التهاب جلدي تحسسي ناتج عن لدغ البراغيث (Flea Allergy Dermatitis).",
    treatment_plan: "استخدام أمبولات حماية موضعية، مع لوشن مهدئ للجلد لمدة 5 أيام، ونظام غذائي هيبوالرجينيك.",
    temperature_celsius: 38.8,
    heart_rate_bpm: 140,
    respiratory_rate_bpm: 28,
    is_verified_diagnosis: true,
    follow_up_recommendations: "استكمال دورة العلاج الموضعي وتنظيف المفروشات في المنزل جيداً لمنع إعادة العدوى.",
    status: "finalized",
    created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    pet: initialPets[1],
    vet: initialVeterinarians[1],
    clinic: initialClinics[1],
  },
];

const initialVaccinations: VaccinationRecord[] = [
  {
    id: "d0000000-0000-0000-0000-000000000001",
    pet_id: "b0000000-0000-0000-0000-000000000001",
    visit_id: "c0000000-0000-0000-0000-000000000001",
    administered_by_vet_id: "33333333-3333-3333-3333-333333333333",
    created_by: "33333333-3333-3333-3333-333333333333",
    vaccine_name: "Nobivac Rabies",
    target_diseases: "السعار (Rabies)",
    administration_date: "2024-11-10",
    next_due_date: "2025-11-10",
    batch_number: "B89201A",
    manufacturer: "MSD Animal Health",
    route_of_administration: "حقن تحت الجلد (SC)",
    notes: "تم الحقن تحت الجلد في الكتف الأيسر بدون أي تفاعلات تحسسية فورية.",
    is_verified_by_vet: true,
    created_at: "2024-11-10T10:00:00Z",
    administering_vet: initialVeterinarians[0],
  },
  {
    id: "d0000000-0000-0000-0000-000000000002",
    pet_id: "b0000000-0000-0000-0000-000000000001",
    visit_id: "c0000000-0000-0000-0000-000000000001",
    administered_by_vet_id: "33333333-3333-3333-3333-333333333333",
    created_by: "33333333-3333-3333-3333-333333333333",
    vaccine_name: "Nobivac DHPPi + L4",
    target_diseases: "البارفو، الديستمبر، التهاب الكبد الوبائي، الليبتوسبيرا (8-way)",
    administration_date: "2024-11-10",
    next_due_date: "2025-11-10",
    batch_number: "V10499C",
    manufacturer: "MSD Animal Health",
    route_of_administration: "حقن تحت الجلد (SC)",
    notes: "الجرعة السنوية المنشطة.",
    is_verified_by_vet: true,
    created_at: "2024-11-10T10:00:00Z",
    administering_vet: initialVeterinarians[0],
  },
  {
    id: "d0000000-0000-0000-0000-000000000003",
    pet_id: "b0000000-0000-0000-0000-000000000002",
    visit_id: "c0000000-0000-0000-0000-000000000002",
    administered_by_vet_id: "44444444-4444-4444-4444-444444444444",
    created_by: "44444444-4444-4444-4444-444444444444",
    vaccine_name: "Purevax RCP FeLV",
    target_diseases: "طاعون القطط (Panleukopenia)، الكاليسي، الهربس، سرطان الدم السنوري",
    administration_date: "2024-10-10",
    next_due_date: "2025-10-10",
    batch_number: "FR-88912",
    manufacturer: "Boehringer Ingelheim",
    route_of_administration: "حقن تحت الجلد (SC)",
    notes: "تطعيم رباعي سنوي بدون مادة مساعدة لتقليل خطر الورم الليفي.",
    is_verified_by_vet: true,
    created_at: "2024-10-10T10:00:00Z",
    administering_vet: initialVeterinarians[1],
  },
];

const initialVaccinationPlans: VaccinationPlan[] = [
  {
    id: "e0000000-0000-0000-0000-000000000001",
    pet_id: "b0000000-0000-0000-0000-000000000001",
    prescribed_by_vet_id: "33333333-3333-3333-3333-333333333333",
    vaccine_name: "تطعيم كينل كوف (Bordetella KC)",
    target_disease: "سعال الكلاب وبيوت الإيواء",
    recommended_date: "2025-01-15",
    dose_number: 1,
    total_doses: 1,
    notes: "موصى به قبل دخول موسم الشتاء والتواجد في أماكن تجمع الكلاب أو التدريب.",
    status: "planned",
    created_at: "2024-11-10T10:00:00Z",
  },
];

const initialMedications: Medication[] = [
  {
    id: "f0000000-0000-0000-0000-000000000001",
    pet_id: "b0000000-0000-0000-0000-000000000001",
    visit_id: "c0000000-0000-0000-0000-000000000001",
    prescribed_by_vet_id: "33333333-3333-3333-3333-333333333333",
    created_by: "33333333-3333-3333-3333-333333333333",
    medication_name: "NexGard Spectra (30-60kg)",
    dosage: "قرص واحد قابل للمضغ",
    frequency: "مرة كل 30 يوماً",
    start_date: "2024-11-10",
    end_date: "2025-05-10",
    is_ongoing: true,
    instructions_warnings: "يعطى مع أو بعد الوجبة، يقي من ديدان القلب والقراد وحشرات البراغيث.",
    status: "active",
    created_at: "2024-11-10T10:00:00Z",
  },
];

const initialPrescriptions: Prescription[] = [
  {
    id: "rx-001",
    rx_number: "VB-RX-2024-0891",
    pet_id: "b0000000-0000-0000-0000-000000000001",
    pet_name: "روكي (Rocky)",
    pet_species: "كلب (German Shepherd)",
    pet_breed: "جيرمن شيبرد",
    owner_id: "11111111-1111-1111-1111-111111111111",
    owner_name: "أحمد محمود القاضي",
    owner_phone: "01012345678",
    veterinarian_id: "33333333-3333-3333-3333-333333333333",
    veterinarian_name: "د. يوسف الشناوي",
    veterinarian_license: "EGY-VET-48920",
    clinic_name: "مستشفى النيل البيطري التخصصي",
    clinic_phone: "0227508900",
    clinic_address: "شارع التسعين الشمالي، التجمع الخامس، القاهرة الجديدة",
    diagnosis: "التهاب المفاصل التنكسي الحاد (Osteoarthritis) مع إجهاد عضلي في الورك الأيمن",
    clinical_notes: "الراحة التامة لمدة 10 أيام مع تجنب القفز وصعود السلالم، ومراجعة العيادة في حالة عدم تحسن حركة المشي.",
    issue_date: "2024-11-10",
    valid_until: "2024-12-10",
    items: [
      {
        id: "rxi-001",
        medication_name: "ريماديل (Rimadyl - Carprofen)",
        dosage: "75 ملغ (قرص واحد)",
        frequency: "كل 12 ساعة بعد الطعام مباشرة",
        duration: "14 يوماً",
        instructions: "مسكن ومضاد التهاب غير ستيرويدي، يمنع إعطاؤه على معدة فارغة",
      },
      {
        id: "rxi-002",
        medication_name: "مكمل دعم المفاصل (Cosequin DS Plus MSM)",
        dosage: "قرصان قابلة للمضغ",
        frequency: "مرة واحدة يومياً صباحاً",
        duration: "30 يوماً",
        instructions: "لدعم مرونة الغضاريف وتجديد السائل المفصلي",
      },
      {
        id: "rxi-003",
        medication_name: "نيكسجارد سبيكترا (NexGard Spectra 30-60kg)",
        dosage: "قرص واحد للمضغ",
        frequency: "جرعة شهرية وقائية",
        duration: "شهر واحد",
        instructions: "للوقاية من البراغيث والقراد وديدان القلب والأمعاء",
      },
    ],
    qr_verification_code: "https://vetbox.eg/verify/rx/VB-RX-2024-0891",
    status: "active",
    created_at: "2024-11-10T11:30:00Z",
  },
  {
    id: "rx-002",
    rx_number: "VB-RX-2024-1044",
    pet_id: "b0000000-0000-0000-0000-000000000002",
    pet_name: "لونا (Luna)",
    pet_species: "قطة (Persian Mix)",
    pet_breed: "شيرازي رومي",
    owner_id: "11111111-1111-1111-1111-111111111111",
    owner_name: "أحمد محمود القاضي",
    owner_phone: "01012345678",
    veterinarian_id: "44444444-4444-4444-4444-444444444444",
    veterinarian_name: "د. هبة رضوان",
    veterinarian_license: "EGY-VET-51204",
    clinic_name: "عيادة واحة الأليف البيطرية",
    clinic_phone: "0238514230",
    clinic_address: "ميدان الحصري، الشيخ زايد، الجيزة",
    diagnosis: "حساسية أذن والتهاب أذن خارجية فطري طفيف (Otitis Externa)",
    clinical_notes: "تنظيف صوان الأذن بلطف بمحلول ملحي معقم قبل وضع القطرات بربع ساعة.",
    issue_date: "2024-10-20",
    valid_until: "2024-11-20",
    items: [
      {
        id: "rxi-004",
        medication_name: "قطرة أذن أوتوماكس (Otomax Ear Drops)",
        dosage: "4 قطرات في الأذن المصابة",
        frequency: "مرتان يومياً صباحاً ومساءً",
        duration: "7 أيام متواصلة",
        instructions: "تدليك قاعدة الأذن بلطف لضمان وصول الدواء للقناة السمعية",
      },
      {
        id: "rxi-005",
        medication_name: "أوميجا 3 للقطط (Omega-3 Feline Derma Care)",
        dosage: "1 مل بالفم",
        frequency: "مرة واحدة يومياً",
        duration: "30 يوماً",
        instructions: "تخلط مع الوجبة الرطبة لتحسين صحة الجلد والفرو",
      },
    ],
    qr_verification_code: "https://vetbox.eg/verify/rx/VB-RX-2024-1044",
    status: "dispensed",
    created_at: "2024-10-20T14:15:00Z",
  },
];

const initialReminders: Reminder[] = [
  {
    id: "10000000-0000-0000-0000-000000000001",
    pet_id: "b0000000-0000-0000-0000-000000000001",
    pet_name: "روكي (Rocky)",
    user_id: "11111111-1111-1111-1111-111111111111",
    reminder_type: "medication",
    title: "جرعة الوقاية الشهرية ضد القراد والديدان (NexGard)",
    due_date: "2024-12-10",
    due_time: "10:00",
    is_completed: false,
    created_at: "2024-11-10T10:00:00Z",
  },
  {
    id: "10000000-0000-0000-0000-000000000002",
    pet_id: "b0000000-0000-0000-0000-000000000001",
    pet_name: "روكي (Rocky)",
    user_id: "11111111-1111-1111-1111-111111111111",
    reminder_type: "vaccination",
    title: "تطعيم سعال الكلاب (Bordetella KC)",
    due_date: "2025-01-15",
    due_time: "11:00",
    is_completed: false,
    created_at: "2024-11-10T10:00:00Z",
  },
  {
    id: "10000000-0000-0000-0000-000000000003",
    pet_id: "b0000000-0000-0000-0000-000000000002",
    pet_name: "لونا (Luna)",
    user_id: "11111111-1111-1111-1111-111111111111",
    reminder_type: "hygiene",
    title: "جلسة تمشيط وإزالة كرات الشعر وتفقد الأذنين",
    due_date: "2024-11-28",
    due_time: "18:00",
    is_completed: false,
    created_at: "2024-11-15T10:00:00Z",
  },
];

const initialArticles: Article[] = [
  {
    id: "20000000-0000-0000-0000-000000000001",
    slug: "essential-vaccinations-dogs-egypt",
    title: "دليل التطعيمات الأساسية للكلاب في مصر: المواعيد والأهمية الوقائية",
    summary: "تعرف على جدول التطعيمات الإلزامية والاختيارية لكلبك في مصر، وكيف تحميه من فيروسات البارفو، الديستمبر، وداء السعار القاتل.",
    body: `## أهمية التطعيمات الوقائية
تعتبر التطعيمات خط الدفاع الأول لحماية الكلاب في مصر من الأمراض الوبائية المنتشرة ذات معدلات النفوق المرتفعة، خاصة في الجراء الصغيرة.

### 1. التطعيم الثماني أو السباعي (DHPPi + L)
- **الأمراض المستهدفة:** البارفو، الديستمبر (الحمى المفرطة)، الالتهاب الكبدي الوبائي، والبارانفلونزا، والليبتوسبيرا.
- **التوقيت:** يبدأ في عمر 6 إلى 8 أسابيع، يعاد إعطاء جرعة تنشيطية بعد 3-4 أسابيع، ثم جرعة منشطة سنوية طوال حياة الكلب.

### 2. تطعيم داء السعار (Rabies Vaccine)
- **الإلزامية:** إلزامي قانونياً وطبياً لحماية الحيوان والإنسان.
- **التوقيت:** يؤخذ في عمر 3 أشهر وما بعده، ويكرر سنوياً بانتظام.

### نصائح طبية هامة قبل التطعيم:
1. يجب إجراء فحص إكلينيكي كامل والتأكد من خلو الحيوان من أي ارتفاع في درجة الحرارة.
2. إعطاء جرعة وقائية من مضادات الديدان قبل التطعيم بأسبوع لضمان كفاءة الجهاز المناعي.
3. الامتناع عن تحميم الكلب لمدة 48 ساعة بعد تلقي اللقاح تجنباً للإجهاد الحراري.`,
    category: "preventive_care",
    species_target: "dogs",
    cover_image_url: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=1200&q=80",
    is_published: true,
    read_time_minutes: 5,
    references_list: [
      { title: "WSAVA Vaccination Guidelines for Dogs and Cats", url: "https://wsava.org" },
      { title: "دليل الهيئة العامة للخدمات البيطرية المصرية", year: "2023" },
    ],
    created_at: "2024-01-10T10:00:00Z",
    updated_at: "2024-01-10T10:00:00Z",
    author: initialProfiles[2],
    reviewer: initialVeterinarians[0],
  },
  {
    id: "20000000-0000-0000-0000-000000000002",
    slug: "feline-urinary-tract-disease-guide",
    title: "أمراض المسالك البولية السفلية في القطط (FLUTD): الأسباب والوقاية العاجلة",
    summary: "شرح طبي مفصل لأعراض انسداد مجرى البول عند ذكور القطط، متى يعتبر الأمر طوارئ قصوى، وكيفية حماية قطتك عبر التغذية السليمة وشرب الماء.",
    body: `## ما هي متلازمة FLUTD؟
تصف متلازمة المسالك البولية السفلية في القطط مجموعة متنوعة من الحالات التي تصيب المثانة ومجرى البول، وأكثرها خطورة هو انسداد مجرى البول التام عند ذكور القطط بسبب البلورات والحصوات البولية.

### العلامات التحذيرية التي تستدعي زيارة الطوارئ فوراً:
- التردد المتكرر على صندوق الفضلات (Litter box) دون إخراج بول أو بنزول قطرات مدممة.
- الصراخ أو المواء المؤلم أثناء محاولة التبول.
- لعق مفرط لمنطقة الأعضاء التناسلية.
- الخمول وفقدان الشهية والقيء (مؤشر على ارتفاع اليوريا وتسمم البول).

### الوقاية المنزلية الفعالة:
1. **زيادة شرب الماء:** وفر نافورة مياه جارية واخلط الطعام الجاف بالطعام الرطب (Wet Food).
2. **التحكم في التوتر:** القطط حساسة جداً للتغيرات البيئية، وتوتر القطط يؤدي مباشرة لالتهاب المثانة المعقم (FIC).
3. **نظافة صندوق الفضلات:** حافظ على تنظيف الصندوق يومياً وبشكل دوري.`,
    category: "symptoms",
    species_target: "cats",
    cover_image_url: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=1200&q=80",
    is_published: true,
    read_time_minutes: 6,
    references_list: [
      { title: "ISFM Guidelines on Feline Idiopathic Cystitis", url: "https://icatcare.org" },
    ],
    created_at: "2024-02-14T10:00:00Z",
    updated_at: "2024-02-14T10:00:00Z",
    author: initialProfiles[3],
    reviewer: initialVeterinarians[1],
  },
  {
    id: "20000000-0000-0000-0000-000000000003",
    slug: "equine-colic-emergency-management",
    title: "مغص الخيل: دليلك للتعامل السريع والتشخيص الأولي لحين وصول الطبيب البيطري",
    summary: "المغص في الخيول هو حالة طوارئ حرجة قد تهدد حياة الحصان خلال ساعات. إليك الخطوات الطبية السليمة للتعامل الأولي.",
    body: `## لماذا يعتبر مغص الخيل حالة طارئة؟
الجهاز الهضمي للحصان فريد ومعقد؛ فالحصان لا يستطيع التقيؤ تشريحياً، وأي انحباس غازي أو التواء معوي يؤدي إلى ضغط شديد وألم حاد.

### علامات المغص المبكرة:
- ضرب الحصان الأرض بحوافره وتقليب رأسه باتجاه خاصرته.
- الرقود المفاجئ ومحاولة التدحرج المستمر على الأرض.
- تسارع معدل التنفس وزيادة التعرق بدون بذل جهد.
- غياب أصوات حركة الأمعاء الطبيعية عند وضع الأذن على جانبي البطن.

### ما يجب فعله فوراً:
1. **اتصل بالطبيب البيطري على الفور** ولا تنتظر تحسن الحالة ذاتياً.
2. **منع الحصان من التدحرج العنيف** لتجنب التواء الأمعاء الدقيقة أو انفجار المعدة، وذلك بالمشي الهادئ معه.
3. **أوقف كل الطعام والماء** لحين تقييم الطبيب البيطري للحالة.`,
    category: "emergency_care",
    species_target: "horses",
    cover_image_url: "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=1200&q=80",
    is_published: true,
    read_time_minutes: 7,
    references_list: [
      { title: "AAEP Guide to Colic in Horses", url: "https://aaep.org" },
    ],
    created_at: "2024-03-02T10:00:00Z",
    updated_at: "2024-03-02T10:00:00Z",
    author: initialProfiles[2],
  },
];

const initialNotifications: Notification[] = [
  {
    id: "notif-001",
    user_id: "11111111-1111-1111-1111-111111111111",
    title: "تأكيد ربط الطبيب البيطري",
    message: "وافق د. يوسف الشناوي على طلب الربط الطبي لحيوانك روكي.",
    type: "connection_accepted",
    link: "/owner/pets/b0000000-0000-0000-0000-000000000001",
    is_read: false,
    created_at: "2024-11-10T12:00:00Z",
  },
  {
    id: "notif-002",
    user_id: "11111111-1111-1111-1111-111111111111",
    title: "سجل كشف طبي جديد",
    message: "أضاف د. يوسف الشناوي تقرير الفحص الدوري وتطعيم السعار لـ روكي.",
    type: "visit_added",
    link: "/owner/pets/b0000000-0000-0000-0000-000000000001",
    is_read: true,
    created_at: "2024-11-10T13:30:00Z",
  },
];

const initialAuditLogs: AuditLog[] = [
  {
    id: "audit-001",
    user_id: "55555555-5555-5555-5555-555555555555",
    action: "VET_VERIFIED",
    resource_type: "veterinarian_profile",
    resource_id: "33333333-3333-3333-3333-333333333333",
    metadata: { reason: "اعتماد ترخيص نقابة الأطباء البيطريين EGY-VET-48920" },
    ip_address: "197.38.12.44",
    created_at: "2023-11-15T12:00:00Z",
  },
  {
    id: "audit-002",
    user_id: "11111111-1111-1111-1111-111111111111",
    action: "PET_CREATED",
    resource_type: "pets",
    resource_id: "b0000000-0000-0000-0000-000000000001",
    metadata: { pet_name: "روكي", species: "dog" },
    ip_address: "196.205.88.19",
    created_at: "2024-01-16T10:00:00Z",
  },
];

// Singleton store instance
class VetBoxStore {
  private state: MockStoreState = {
    currentProfile: initialProfiles[0], // Default logged-in user: Ahmed (Owner)
    profiles: initialProfiles,
    veterinarians: initialVeterinarians,
    clinics: initialClinics,
    pets: initialPets,
    links: initialLinks,
    visits: initialVisits,
    vaccinations: initialVaccinations,
    vaccinationPlans: initialVaccinationPlans,
    medications: initialMedications,
    prescriptions: initialPrescriptions,
    reminders: initialReminders,
    articles: initialArticles,
    notifications: initialNotifications,
    auditLogs: initialAuditLogs,
  };

  // State readers
  getCurrentProfile(): Profile {
    return this.state.currentProfile;
  }

  setCurrentRole(role: "owner" | "veterinarian" | "admin") {
    const profile = this.state.profiles.find((p) => p.role === role);
    if (profile) {
      this.state.currentProfile = profile;
    }
  }

  getPets(ownerId?: string): Pet[] {
    if (ownerId) {
      return this.state.pets.filter((p) => p.owner_id === ownerId);
    }
    return this.state.pets;
  }

  getPetById(id: string): Pet | undefined {
    return this.state.pets.find((p) => p.id === id);
  }

  getVisitsByPet(petId: string): MedicalVisit[] {
    return this.state.visits
      .filter((v) => v.pet_id === petId)
      .sort((a, b) => new Date(b.visit_date).getTime() - new Date(a.visit_date).getTime());
  }

  getVaccinationsByPet(petId: string): VaccinationRecord[] {
    return this.state.vaccinations
      .filter((v) => v.pet_id === petId)
      .sort((a, b) => new Date(b.administration_date).getTime() - new Date(a.administration_date).getTime());
  }

  getVaccinationPlansByPet(petId: string): VaccinationPlan[] {
    return this.state.vaccinationPlans.filter((p) => p.pet_id === petId);
  }

  getMedicationsByPet(petId: string): Medication[] {
    return this.state.medications.filter((m) => m.pet_id === petId);
  }

  getPrescriptions(): Prescription[] {
    return this.state.prescriptions;
  }

  getPrescriptionsByPet(petId: string): Prescription[] {
    return this.state.prescriptions
      .filter((p) => p.pet_id === petId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  getPrescriptionsByOwner(ownerId: string): Prescription[] {
    return this.state.prescriptions
      .filter((p) => p.owner_id === ownerId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  getPrescriptionById(id: string): Prescription | undefined {
    return this.state.prescriptions.find((p) => p.id === id);
  }

  getPrescriptionByRxNumber(rxNumber: string): Prescription | undefined {
    return this.state.prescriptions.find((p) => p.rx_number.toLowerCase() === rxNumber.toLowerCase());
  }

  getReminders(userId?: string): Reminder[] {
    if (userId) {
      return this.state.reminders.filter((r) => r.user_id === userId);
    }
    return this.state.reminders;
  }

  getClinics(): Clinic[] {
    return this.state.clinics;
  }

  getClinicById(id: string): Clinic | undefined {
    return this.state.clinics.find((c) => c.id === id);
  }

  getVeterinarians(): VeterinarianProfile[] {
    return this.state.veterinarians;
  }

  getVeterinarianById(id: string): VeterinarianProfile | undefined {
    return this.state.veterinarians.find((v) => v.id === id);
  }

  getLinksForPet(petId: string): PetVetLink[] {
    return this.state.links.filter((l) => l.pet_id === petId);
  }

  getLinksForVet(vetId: string): PetVetLink[] {
    return this.state.links.filter((l) => l.vet_id === vetId);
  }

  getArticles(): Article[] {
    return this.state.articles.filter((a) => a.is_published);
  }

  getArticleBySlug(slug: string): Article | undefined {
    return this.state.articles.find((a) => a.slug === slug);
  }

  getNotifications(userId: string): Notification[] {
    return this.state.notifications.filter((n) => n.user_id === userId);
  }

  getAuditLogs(): AuditLog[] {
    return this.state.auditLogs;
  }

  getUsers(): Profile[] {
    return this.state.profiles;
  }

  // State mutations
  addPet(petData: Omit<Pet, "id" | "created_at" | "updated_at">): Pet {
    const newPet: Pet = {
      ...petData,
      id: "pet-" + Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.state.pets.unshift(newPet);

    // Add audit log
    this.logAudit({
      user_id: petData.owner_id,
      action: "PET_CREATED",
      resource_type: "pets",
      resource_id: newPet.id,
      metadata: { name: newPet.name, species: newPet.species },
    });

    return newPet;
  }

  updatePet(id: string, updates: Partial<Pet>): Pet | undefined {
    const index = this.state.pets.findIndex((p) => p.id === id);
    if (index === -1) return undefined;
    this.state.pets[index] = {
      ...this.state.pets[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    return this.state.pets[index];
  }

  addMedicalVisit(visitData: Omit<MedicalVisit, "id" | "created_at" | "updated_at">): MedicalVisit {
    const newVisit: MedicalVisit = {
      ...visitData,
      id: "visit-" + Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.state.visits.unshift(newVisit);

    // Also notify owner
    const pet = this.getPetById(visitData.pet_id);
    if (pet) {
      this.addNotification({
        user_id: pet.owner_id,
        title: "كشف طبي جديد",
        message: `تم تسجيل كشف طبي جديد لـ ${pet.name} بواسطة ${visitData.author_role === "veterinarian" ? "الطبيب المعالج" : "المربي"}.`,
        type: "visit_added",
        link: `/owner/pets/${pet.id}`,
      });
    }

    return newVisit;
  }

  addVaccinationRecord(record: Omit<VaccinationRecord, "id" | "created_at">): VaccinationRecord {
    const newRecord: VaccinationRecord = {
      ...record,
      id: "vac-" + Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString(),
    };
    this.state.vaccinations.unshift(newRecord);

    // If next due date provided, automatically schedule a reminder
    if (record.next_due_date) {
      const pet = this.getPetById(record.pet_id);
      if (pet) {
        this.addReminder({
          pet_id: pet.id,
          pet_name: pet.name,
          user_id: pet.owner_id,
          reminder_type: "vaccination",
          title: `تطعيم منشط: ${record.vaccine_name}`,
          due_date: record.next_due_date,
        });
      }
    }

    return newRecord;
  }

  addVaccinationPlan(plan: Omit<VaccinationPlan, "id" | "created_at">): VaccinationPlan {
    const newPlan: VaccinationPlan = {
      ...plan,
      id: "plan-" + Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString(),
    };
    this.state.vaccinationPlans.unshift(newPlan);
    return newPlan;
  }

  addMedication(med: Omit<Medication, "id" | "created_at">): Medication {
    const newMed: Medication = {
      ...med,
      id: "med-" + Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString(),
    };
    this.state.medications.unshift(newMed);
    return newMed;
  }

  addPrescription(prescription: Omit<Prescription, "id" | "created_at" | "rx_number" | "qr_verification_code"> & { rx_number?: string; qr_verification_code?: string }): Prescription {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const year = new Date().getFullYear();
    const rxNumber = prescription.rx_number || `VB-RX-${year}-${randomSuffix}`;
    const newPrescription: Prescription = {
      ...prescription,
      id: "rx-" + Math.random().toString(36).substring(2, 9),
      rx_number: rxNumber,
      qr_verification_code: prescription.qr_verification_code || `https://vetbox.eg/verify/rx/${rxNumber}`,
      created_at: new Date().toISOString(),
    };
    this.state.prescriptions.unshift(newPrescription);

    // Also populate medications table for each prescribed item
    newPrescription.items.forEach((item) => {
      this.addMedication({
        pet_id: newPrescription.pet_id,
        created_by: newPrescription.veterinarian_id,
        prescribed_by_vet_id: newPrescription.veterinarian_id,
        medication_name: item.medication_name,
        dosage: item.dosage,
        frequency: item.frequency,
        start_date: newPrescription.issue_date,
        is_ongoing: false,
        instructions_warnings: `المدة: ${item.duration}${item.instructions ? ` • ${item.instructions}` : ""}`,
        status: "active",
      });
    });

    // Notify owner
    this.addNotification({
      user_id: newPrescription.owner_id,
      title: "روشتة إلكترونية معتمدة جديدة 💊",
      message: `أصدر ${newPrescription.veterinarian_name} روشتة علاجية رسمية لـ ${newPrescription.pet_name} برقم ${rxNumber}.`,
      type: "system",
      link: `/owner/pets/${newPrescription.pet_id}`,
    });

    return newPrescription;
  }

  togglePrescriptionDispensed(id: string): Prescription | undefined {
    const rx = this.state.prescriptions.find((p) => p.id === id);
    if (!rx) return undefined;
    rx.status = rx.status === "dispensed" ? "active" : "dispensed";
    return rx;
  }

  addReminder(reminder: Omit<Reminder, "id" | "created_at" | "is_completed">): Reminder {
    const newReminder: Reminder = {
      ...reminder,
      id: "rem-" + Math.random().toString(36).substring(2, 9),
      is_completed: false,
      created_at: new Date().toISOString(),
    };
    this.state.reminders.unshift(newReminder);
    return newReminder;
  }

  toggleReminder(id: string): Reminder | undefined {
    const reminder = this.state.reminders.find((r) => r.id === id);
    if (!reminder) return undefined;
    reminder.is_completed = !reminder.is_completed;
    reminder.completed_at = reminder.is_completed ? new Date().toISOString() : null;
    return reminder;
  }

  createConnectionRequest(petId: string, vetId: string, requestedBy: string, notes?: string): PetVetLink {
    const existing = this.state.links.find((l) => l.pet_id === petId && l.vet_id === vetId);
    if (existing) {
      existing.status = "pending";
      existing.updated_at = new Date().toISOString();
      return existing;
    }

    const newLink: PetVetLink = {
      id: "link-" + Math.random().toString(36).substring(2, 9),
      pet_id: petId,
      vet_id: vetId,
      status: "pending",
      permission_scope: "full_clinical_access",
      requested_by: requestedBy,
      notes: notes || "طلب ربط طبي",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      pet: this.getPetById(petId),
      vet: this.getVeterinarianById(vetId),
    };
    this.state.links.unshift(newLink);

    // Notify vet
    const pet = this.getPetById(petId);
    this.addNotification({
      user_id: vetId,
      title: "طلب ربط حالة جديدة",
      message: `طلب المربي ربط ملف ${pet ? pet.name : "حيوان أليف"} بعيادتك.`,
      type: "connection_request",
      link: "/veterinarian/connection-requests",
    });

    return newLink;
  }

  updateConnectionStatus(linkId: string, status: "accepted" | "rejected" | "revoked", actorId: string): PetVetLink | undefined {
    const link = this.state.links.find((l) => l.id === linkId);
    if (!link) return undefined;

    link.status = status;
    link.updated_at = new Date().toISOString();
    if (status === "accepted" || status === "rejected") {
      link.responded_at = new Date().toISOString();
    }
    if (status === "revoked") {
      link.revoked_at = new Date().toISOString();
      link.revoked_by = actorId;
    }

    // Notify owner
    const pet = this.getPetById(link.pet_id);
    if (pet) {
      this.addNotification({
        user_id: pet.owner_id,
        title: status === "accepted" ? "تم قبول طلب الربط" : "تحديث حالة طلب الربط",
        message: status === "accepted"
          ? `تم اعتماد الربط الطبي لـ ${pet.name}. يمكن للطبيب الآن متابعة السجل الصحي.`
          : `تم تغيير حالة الربط إلى: ${status}.`,
        type: status === "accepted" ? "connection_accepted" : "system",
        link: `/owner/pets/${pet.id}`,
      });
    }

    return link;
  }

  addNotification(notif: Omit<Notification, "id" | "created_at" | "is_read">): Notification {
    const newNotif: Notification = {
      ...notif,
      id: "notif-" + Math.random().toString(36).substring(2, 9),
      is_read: false,
      created_at: new Date().toISOString(),
    };
    this.state.notifications.unshift(newNotif);
    return newNotif;
  }

  markNotificationAsRead(id: string) {
    const notif = this.state.notifications.find((n) => n.id === id);
    if (notif) notif.is_read = true;
  }

  updateVetVerification(vetId: string, status: "verified" | "rejected", reason?: string, adminId?: string): VeterinarianProfile | undefined {
    const vet = this.state.veterinarians.find((v) => v.id === vetId);
    if (!vet) return undefined;

    vet.verification_status = status;
    vet.rejection_reason = reason || null;
    vet.verified_at = status === "verified" ? new Date().toISOString() : null;
    vet.verified_by = adminId || "55555555-5555-5555-5555-555555555555";
    vet.updated_at = new Date().toISOString();

    this.logAudit({
      user_id: adminId || "55555555-5555-5555-5555-555555555555",
      action: status === "verified" ? "VET_VERIFIED" : "VET_REJECTED",
      resource_type: "veterinarian_profile",
      resource_id: vetId,
      metadata: { status, reason },
    });

    return vet;
  }

  logAudit(audit: Omit<AuditLog, "id" | "created_at">): AuditLog {
    const newAudit: AuditLog = {
      ...audit,
      id: "audit-" + Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString(),
    };
    this.state.auditLogs.unshift(newAudit);
    return newAudit;
  }
}

// Export singleton instance
export const store = new VetBoxStore();
