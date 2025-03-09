export type SearchParams = {
  firstName: string;
  lastName: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
};

export type Voter = {
  id: string;
  firstName: string;
  lastName: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
};

export type Tag = {
  tagId: string;
  name: string;
}

export type VoterTag = {
  voterTagId: string;
  name: string;
}

export type VoterResponse = {
  voter: Voter
  tags: VoterTag[]
}

export type GetAllTagsResult = {
  tags: {
    tagId: string;
    name: string;
  }[]
}

export type AddTagResult = {
  voterTagId: string;
  name: string;
}

export type RemoveTagResult = {
  voterTagId: string;
}

export type VoterSearchResult = {
  voter: Voter;
  confidence: number;
};
