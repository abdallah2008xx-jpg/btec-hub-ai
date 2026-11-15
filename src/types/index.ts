export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
}

export interface StudentProfile {
  id: string;
  user_id: string;
  full_name: string;
  student_id?: string;
  specialization_id?: string;
  qualification_id?: string;
  preferred_language: "ar" | "en";
  ai_usage_today: number;
  ai_usage_total: number;
  created_at: string;
}

export interface Specialization {
  id: string;
  name_ar: string;
  name_en: string;
  code: string;
  description_ar?: string;
  description_en?: string;
}

export interface Qualification {
  id: string;
  name_ar: string;
  name_en: string;
  level: string;
  specialization_id: string;
}

export interface Unit {
  id: string;
  title_ar: string;
  title_en: string;
  unit_number: number;
  qualification_id: string;
  description_ar?: string;
  description_en?: string;
}

export interface Assignment {
  id: string;
  title: string;
  unit_id?: string;
  student_id: string;
  file_id?: string;
  raw_text?: string;
  parsed_data?: ParsedAssignment;
  status: "pending" | "in_progress" | "completed";
  created_at: string;
  updated_at: string;
}

export interface ParsedAssignment {
  title: string;
  qualification?: string;
  specialization?: string;
  units: ParsedUnit[];
  submission_requirements?: string[];
  deadline?: string;
}

export interface ParsedUnit {
  unit_number?: string;
  title: string;
  activities: Activity[];
}

export interface Activity {
  id: string;
  assignment_id: string;
  title: string;
  description?: string;
  activity_number?: string;
  criteria: AssessmentCriteria[];
}

export interface AssessmentCriteria {
  id: string;
  activity_id?: string;
  assignment_id: string;
  code: string;
  level: "pass" | "merit" | "distinction";
  description: string;
  evidence_required?: string;
  is_completed: boolean;
}

export interface Conversation {
  id: string;
  student_id: string;
  assignment_id?: string;
  title: string;
  mode: AIMode;
  messages_count: number;
  created_at: string;
  updated_at: string;
  last_message?: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  metadata?: Record<string, unknown>;
  tokens_used?: number;
  created_at: string;
}

export interface UploadedFile {
  id: string;
  student_id: string;
  assignment_id?: string;
  file_name: string;
  file_size: number;
  file_type: string;
  storage_path: string;
  extracted_text?: string;
  processing_status: "pending" | "processing" | "done" | "error";
  created_at: string;
}

export interface ReviewReport {
  id: string;
  student_id: string;
  assignment_id: string;
  report_file_id: string;
  ai_review: ReviewResult;
  created_at: string;
}

export interface ReviewResult {
  overall_summary: string;
  criteria_coverage: CriteriaCoverage[];
  missing_sections: string[];
  improvement_suggestions: string[];
  strengths: string[];
  estimated_grade?: string;
}

export interface CriteriaCoverage {
  criteria_code: string;
  criteria_description: string;
  level: "pass" | "merit" | "distinction";
  found: boolean;
  evidence_found?: string;
  feedback?: string;
}

export interface AIUsage {
  id: string;
  student_id: string;
  conversation_id?: string;
  mode: AIMode;
  tokens_input: number;
  tokens_output: number;
  model: string;
  created_at: string;
}

export type AIMode =
  | "general"
  | "explain_assignment"
  | "solve_with_me"
  | "explain_criteria"
  | "improve_writing"
  | "review_report"
  | "research_assistant"
  | "study_mode";

export interface KnowledgeDocument {
  id: string;
  title: string;
  content: string;
  source_url?: string;
  unit_id?: string;
  qualification_id?: string;
  specialization_id?: string;
  embedding?: number[];
  created_at: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}
