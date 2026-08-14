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
}

export interface MediaFile {
  key: string;
  size: number;
  uploaded: string;
}
