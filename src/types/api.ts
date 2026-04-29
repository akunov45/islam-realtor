// ─── Auth ────────────────────────────────────────────────────────────────────

export type Role = 'buyer' | 'seller' | 'agent' | 'lawyer' | 'director' | 'superadmin'
export type Via = 'email' | 'phone'
export type OtpPurpose = 'login' | 'reset_password' | 'verify_phone'
export type LeadStatus = 'new' | 'in_progress' | 'won' | 'lost'
export type LeadSource = 'instagram' | 'manual' | 'telegram' | 'whatsapp'

export interface TokenPair {
  access: string
  refresh: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  first_name: string
  last_name?: string | undefined
  phone_number?: string | undefined
  role: 'buyer' | 'seller'
}

export interface SendOtpRequest {
  identifier: string
  via: Via
  purpose: OtpPurpose
}

export interface VerifyOtpRequest {
  identifier: string
  code: string
  via?: Via
  purpose?: OtpPurpose
}

export interface ResetPasswordRequest {
  reset_token: string
  new_password: string
}

export interface ChangePasswordRequest {
  old_password: string
  new_password: string
}

// ─── User / Profile ──────────────────────────────────────────────────────────

export interface AgentProfile {
  license_number?: string
  agency_name?: string
  experience_years?: number
  rating?: string
  created_at: string
  updated_at: string
}

export interface BuyerProfile {
  preferred_city?: string
  budget_min?: string | null
  budget_max?: string | null
  preferred_rooms?: number | null
  notes?: string
  created_at: string
  updated_at: string
}

export interface SellerProfile {
  created_at: string
  updated_at: string
}

export interface LawyerProfile {
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string
  phone_number?: string | null
  first_name: string
  last_name: string
  role: Role
  is_blocked: boolean
  is_active: boolean
  must_change_password: boolean
  date_joined: string
  buyer_profile?: BuyerProfile | null
  seller_profile?: SellerProfile | null
  agent_profile?: AgentProfile | null
  lawyer_profile?: LawyerProfile | null
}

export interface CreateStaffRequest {
  email: string
  role: Role
  first_name: string
  last_name?: string | undefined
}

// ─── Leads ───────────────────────────────────────────────────────────────────

export interface Lead {
  id: number
  external_id: string
  source: LeadSource
  username?: string | null
  first_name?: string | null
  last_name?: string | null
  full_name: string
  phone?: string | null
  email?: string | null
  status: LeadStatus
  score?: number
  is_active?: boolean
  tags: string[]
score_detail?: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export interface LeadDetail extends Lead {
  conversations?: Conversation[]
}

export interface PaginatedLeadList {
  count: number
  next?: string | null
  previous?: string | null
  results: Lead[]
}

// ─── Conversations & Messages ─────────────────────────────────────────────────

export interface Message {
  id: number
  content: string
  created_at: string
  [key: string]: unknown
}

export interface Conversation {
  id: number
  is_active: boolean
  created_at: string
  updated_at: string
  messages: Message[]
}

export interface PaginatedConversationList {
  count: number
  next?: string | null
  previous?: string | null
  results: Conversation[]
}