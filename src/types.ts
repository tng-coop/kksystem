export interface Member {
  id: number;
  name: string;
  kananame: string;
  status: string;
  join_date: string;
  dob: string;
  address: string;
  address2?: string;
  send_dm?: number | boolean;
  phone: string;
  is_living?: number | boolean;
  postal?: string;
  email?: string;
  remarks?: string;
  department?: string;
  annual_fee_status?: string;
  is_cooperator?: number | boolean;
  cert_issued?: number | boolean;
  gender?: string;
  district?: string;
  delivery?: string;
  quit_date?: string;
  hope?: string;
  emergency_name?: string;
  emergency_zip?: string;
  emergency_address?: string;
  emergency_phone?: string;
}

export interface Contribution {
  id: number;
  member_id: number;
  pay_date: string;
  amount: number;
  type: string;
  notes: string;
}

export interface Stats {
  activeMembers: number;
  totalCapital: number;
}

