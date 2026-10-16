export type UserRole = 'client' | 'barman' | 'manager';

export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: UserRole;
  avatar?: string;
  created_at: string;
}

export type CardStatus = 'active' | 'blocked' | 'unassigned';

export interface NFCCard {
  id: string;
  card_uuid: string;
  assigned_user_id: string | null;
  status: CardStatus;
  issued_at: string;
}

export interface DiscountRule {
  id: string;
  name: string;
  discount_percentage: number;
  valid_days: number[]; // 0=Sunday, 1=Monday, ..., 6=Saturday
  start_time: string; // HH:MM
  end_time: string; // HH:MM
  is_active: boolean;
  description: string;
}

export interface VisitLog {
  id: string;
  card_id: string;
  client_id: string;
  barman_id: string;
  discount_applied: number;
  scanned_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  event_date: string;
  created_by_manager_id: string;
  created_at: string;
  target: 'all' | 'vip' | 'regular';
}

export interface ScanResult {
  valid: boolean;
  discount: string;
  discount_percentage: number;
  client_name: string;
  client_phone: string;
  client_avatar: string;
  card_uuid: string;
  total_visits: number;
  rule_name: string;
  message: string;
}
