export type UserRole = "owner" | "veterinarian" | "admin";
export type VetVerificationStatus = "unverified" | "pending" | "verified" | "rejected";
export type PetGender = "male" | "female" | "unknown";
export type ConnectionStatus = "pending" | "accepted" | "rejected" | "revoked";
export type MedicalAuthorRole = "veterinarian" | "owner" | "imported";
export type VisitStatus = "draft" | "finalized" | "amended";
export type ReminderType = "vaccination" | "medication" | "visit_followup" | "deworming" | "hygiene" | "general";

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  phone?: string | null;
  avatar_url?: string | null;
  governorate: string;
  city?: string | null;
  created_at: string;
  updated_at: string;
}

export interface VeterinarianProfile {
  id: string; // references Profile.id
  profile?: Profile;
  license_number?: string | null;
  syndicate_card_url?: string | null;
  years_of_experience: number;
  specializations: string[];
  education?: string | null;
  bio?: string | null;
  verification_status: VetVerificationStatus;
  verified_at?: string | null;
  verified_by?: string | null;
  rejection_reason?: string | null;
  consultation_fee: number;
  emergency_available: boolean;
  clinic_affiliation_name?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Clinic {
  id: string;
  name: string;
  name_ar?: string | null;
  clinic_type: "clinic" | "hospital" | "center" | "mobile_unit";
  phone: string;
  emergency_phone?: string | null;
  email?: string | null;
  address: string;
  governorate: string;
  city: string;
  latitude?: number | null;
  longitude?: number | null;
  opening_hours?: Record<string, string> | null;
  services: string[];
  species_treated: string[];
  is_emergency_247: boolean;
  is_verified: boolean;
  cover_image_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClinicMembership {
  id: string;
  clinic_id: string;
  vet_id: string;
  role: string;
  created_at: string;
}

export interface Pet {
  id: string;
  owner_id: string;
  owner?: Profile;
  name: string;
  species: "dog" | "cat" | "rabbit" | "bird" | "horse" | "cattle" | "sheep" | "goat" | "exotic";
  breed?: string | null;
  gender: PetGender;
  birth_date?: string | null;
  is_age_estimated: boolean;
  estimated_age_months?: number | null;
  weight_kg?: number | null;
  weight_recorded_at?: string | null;
  color?: string | null;
  microchip_number?: string | null;
  identifying_marks?: string | null;
  photo_url?: string | null;
  is_spayed_neutered: boolean;
  species_attributes?: Record<string, any>;
  is_deceased: boolean;
  created_at: string;
  updated_at: string;
}

export interface PetVetLink {
  id: string;
  pet_id: string;
  pet?: Pet;
  vet_id: string;
  vet?: VeterinarianProfile & { profile?: Profile };
  status: ConnectionStatus;
  permission_scope: "read_only" | "full_clinical_access";
  requested_by: string;
  responded_at?: string | null;
  revoked_at?: string | null;
  revoked_by?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface MedicalVisit {
  id: string;
  pet_id: string;
  pet?: Pet;
  vet_id?: string | null;
  vet?: VeterinarianProfile & { profile?: Profile };
  clinic_id?: string | null;
  clinic?: Clinic;
  created_by: string;
  creator?: Profile;
  author_role: MedicalAuthorRole;
  visit_date: string;
  visit_type: "routine_checkup" | "emergency" | "follow_up" | "surgery" | "vaccination" | "home_visit" | "owner_observation";
  visit_reason: string;
  presenting_complaints?: string | null;
  clinical_examination?: string | null;
  diagnosis?: string | null;
  treatment_plan?: string | null;
  temperature_celsius?: number | null;
  heart_rate_bpm?: number | null;
  respiratory_rate_bpm?: number | null;
  is_verified_diagnosis: boolean;
  next_appointment_date?: string | null;
  follow_up_recommendations?: string | null;
  status: VisitStatus;
  amendment_reason?: string | null;
  created_at: string;
  updated_at: string;
}

export interface MedicalEntry {
  id: string;
  pet_id: string;
  visit_id?: string | null;
  created_by: string;
  author_role: MedicalAuthorRole;
  entry_type: "symptom" | "diagnosis" | "treatment" | "lab_result" | "imaging" | "surgery" | "weight_log" | "note";
  title: string;
  description: string;
  event_date: string;
  is_verified_by_vet: boolean;
  verified_by_vet_id?: string | null;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface VaccinationRecord {
  id: string;
  pet_id: string;
  visit_id?: string | null;
  administered_by_vet_id?: string | null;
  administering_vet?: VeterinarianProfile & { profile?: Profile };
  created_by: string;
  vaccine_name: string;
  target_diseases?: string | null;
  administration_date: string;
  next_due_date?: string | null;
  batch_number?: string | null;
  manufacturer?: string | null;
  route_of_administration?: string;
  notes?: string | null;
  is_verified_by_vet: boolean;
  document_url?: string | null;
  created_at: string;
}

export interface VaccinationPlan {
  id: string;
  pet_id: string;
  prescribed_by_vet_id: string;
  prescribing_vet?: VeterinarianProfile & { profile?: Profile };
  vaccine_name: string;
  target_disease?: string | null;
  recommended_date: string;
  dose_number: number;
  total_doses: number;
  notes?: string | null;
  status: "planned" | "administered" | "cancelled" | "rescheduled";
  administered_record_id?: string | null;
  created_at: string;
}

export interface Medication {
  id: string;
  pet_id: string;
  visit_id?: string | null;
  prescribed_by_vet_id?: string | null;
  prescribing_vet?: VeterinarianProfile & { profile?: Profile };
  created_by: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  start_date: string;
  end_date?: string | null;
  is_ongoing: boolean;
  instructions_warnings?: string | null;
  status: "active" | "completed" | "discontinued";
  created_at: string;
}

export interface Reminder {
  id: string;
  pet_id: string;
  pet_name?: string;
  user_id: string;
  reminder_type: ReminderType;
  title: string;
  due_date: string;
  due_time?: string | null;
  is_completed: boolean;
  completed_at?: string | null;
  reference_id?: string | null;
  created_at: string;
}

export interface Attachment {
  id: string;
  pet_id: string;
  visit_id?: string | null;
  uploaded_by: string;
  file_name: string;
  file_size_bytes: number;
  mime_type: string;
  storage_path: string;
  category: "lab_report" | "x_ray" | "prescription" | "vaccination_card" | "general_document";
  title: string;
  notes?: string | null;
  is_private: boolean;
  created_at: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  category: string;
  species_target: string;
  cover_image_url?: string | null;
  author_id?: string | null;
  author?: Profile;
  reviewer_id?: string | null;
  reviewer?: VeterinarianProfile & { profile?: Profile };
  is_published: boolean;
  read_time_minutes: number;
  references_list?: Array<{ title: string; url?: string; year?: string }>;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: "connection_request" | "connection_accepted" | "visit_added" | "vaccination_due" | "medication_reminder" | "system";
  link?: string | null;
  is_read: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id?: string | null;
  user?: Profile;
  action: string;
  resource_type: string;
  resource_id?: string | null;
  metadata?: Record<string, any>;
  ip_address?: string | null;
  created_at: string;
}


export interface PrescriptionItem {
  id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string | null;
}

export interface Prescription {
  id: string;
  rx_number: string;
  pet_id: string;
  pet_name: string;
  pet_species: string;
  pet_breed?: string | null;
  owner_id: string;
  owner_name: string;
  owner_phone: string;
  veterinarian_id: string;
  veterinarian_name: string;
  veterinarian_license: string;
  clinic_name: string;
  clinic_phone?: string | null;
  clinic_address?: string | null;
  diagnosis: string;
  clinical_notes?: string | null;
  issue_date: string;
  valid_until: string;
  items: PrescriptionItem[];
  qr_verification_code: string;
  status: "active" | "dispensed" | "expired";
  created_at: string;
}
