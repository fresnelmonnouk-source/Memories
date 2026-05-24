// Types matching Supabase schema. Regenerate via : npm run db:types

export type TattooStyle =
  | 'fine_line' | 'blackwork' | 'neo_traditional' | 'japanese'
  | 'realism'   | 'geometric' | 'minimalist'      | 'tribal'  | 'other'

export type BodyZone =
  | 'forearm' | 'full_arm' | 'shoulder' | 'back' | 'chest'
  | 'thigh'   | 'calf'     | 'ankle'    | 'ribs' | 'neck' | 'hand' | 'other'

export type TryoutStatus = 'pending' | 'generating' | 'done' | 'failed' | 'flagged'
export type BookingStatus = 'new' | 'contacted' | 'confirmed' | 'completed' | 'cancelled'

export type Artist = {
  id: string
  slug: string
  name: string
  bio: string | null
  years_experience: number
  primary_style: TattooStyle | null
  styles: TattooStyle[]
  portrait_url: string | null
  instagram: string | null
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export type Tattoo = {
  id: string
  slug: string
  name: string
  description: string | null
  style: TattooStyle | null
  size_label: string | null
  base_price_eur: number | null
  image_url: string
  thumbnail_url: string | null
  tags: string[]
  artist_id: string | null
  is_featured: boolean
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export type Realisation = {
  id: string
  slug: string
  title: string
  description: string | null
  artist_id: string | null
  style: TattooStyle | null
  body_zone: BodyZone | null
  image_url: string
  thumbnail_url: string | null
  realized_at: string | null
  is_featured: boolean
  is_active: boolean
  display_order: number
  created_at: string
}

export type Tryout = {
  id: string
  session_token: string
  body_wide_path: string | null
  body_close_path: string | null
  tattoo_id: string | null
  custom_tattoo_path: string | null
  body_zone: BodyZone | null
  size_label: string | null
  result_wide_path: string | null
  result_close_path: string | null
  status: TryoutStatus
  error_message: string | null
  moderation_passed: boolean | null
  moderation_reason: string | null
  generation_ms: number | null
  model_used: string | null
  prompt_used: string | null
  ip_address: string | null
  user_agent: string | null
  email: string | null
  created_at: string
  completed_at: string | null
  expires_at: string
}

export type Booking = {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  preferred_artist_id: string | null
  body_zone: BodyZone | null
  project_description: string | null
  tryout_id: string | null
  status: BookingStatus
  internal_notes: string | null
  confirmation_token: string
  ip_address: string | null
  user_agent: string | null
  created_at: string
  updated_at: string
  contacted_at: string | null
  confirmed_at: string | null
}

export type RateLimit = {
  ip_address: string
  tryout_count: number
  upload_count: number
  first_seen_at: string
  last_seen_at: string
  blocked_until: string | null
}

// Database type compatible avec le générique supabase-js v2 (GenericSchema).
// Doit inclure Views / Functions / Enums / CompositeTypes, sinon les requêtes
// `.from(...)` résolvent en `never`.
export interface Database {
  public: {
    Tables: {
      artists:      { Row: Artist;      Insert: Partial<Artist>;      Update: Partial<Artist>;      Relationships: [] }
      tattoos:      { Row: Tattoo;      Insert: Partial<Tattoo>;      Update: Partial<Tattoo>;      Relationships: [] }
      realisations: { Row: Realisation; Insert: Partial<Realisation>; Update: Partial<Realisation>; Relationships: [] }
      tryouts:      { Row: Tryout;      Insert: Partial<Tryout>;      Update: Partial<Tryout>;      Relationships: [] }
      bookings:     { Row: Booking;     Insert: Partial<Booking>;     Update: Partial<Booking>;     Relationships: [] }
      rate_limits:  { Row: RateLimit;   Insert: Partial<RateLimit>;   Update: Partial<RateLimit>;   Relationships: [] }
    }
    Views: { [_ in never]: never }
    Functions: {
      cleanup_expired_tryouts: { Args: Record<PropertyKey, never>; Returns: number }
      bump_rate_limit: { Args: { p_ip: string; p_kind: string }; Returns: undefined }
    }
    Enums: {
      tattoo_style: TattooStyle
      body_zone: BodyZone
      tryout_status: TryoutStatus
      booking_status: BookingStatus
    }
    CompositeTypes: { [_ in never]: never }
  }
}
