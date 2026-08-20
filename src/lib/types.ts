export interface Event {
  id: number;
  event_name: string;
  club_name: string | null;
  event_type: string | null;
  event_for: string | null;
  poster_path: string | null;
  start_date_time: string;
  end_date_time: string;
  price_per_person: number | null;
  participation_type: string | null;
  event_venue: string | null;
  short_description: string | null;
  long_description: string | null;
  is_special_event: boolean | number;
  registration_link: string | null;
  team_size: string | null;
  faculty_coord_emp_id: string | null;
  faculty_coord_name: string | null;
  faculty_coord_mobile: string | null;
  faculty_coord_email: string | null;
}

export interface MediaFile {
  key: string;
  size: number;
  uploaded: string;
}

export type ActivityAction = "create" | "update" | "delete" | "restore";

export interface ActivityLog {
  id: number;
  entity_type: string;
  entity_id: number;
  entity_name: string | null;
  action: ActivityAction;
  changes: string | null;
  actor_id: string | null;
  actor_name: string | null;
  actor_email: string | null;
  created_at: string;
  undone: 0 | 1;
}
