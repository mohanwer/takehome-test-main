CREATE EXTENSION citext;

-- Reset
DROP TABLE IF EXISTS voter_tag;
DROP TABLE IF EXISTS voter;
DROP TABLE IF EXISTS tag;

-- Database schema
CREATE TABLE voter (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT,
    last_name TEXT,
    address1 TEXT,
    address2 TEXT,
    city TEXT,
    state TEXT,
    zip TEXT
);

CREATE TABLE tag (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name CITEXT UNIQUE
);

CREATE TABLE voter_tag (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    voter_id UUID REFERENCES voter(id),
    tag_id UUID REFERENCES tag(id),
    UNIQUE(voter_id, tag_id)
);