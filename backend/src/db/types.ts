export interface Voter {
  id: string;
  first_name: string;
  last_name: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
}

export interface Tag {
  id: string;
  name: string;
}

export interface VoterTag {
  id: string;
  voter_id: string;
  tag_id: string;
}
