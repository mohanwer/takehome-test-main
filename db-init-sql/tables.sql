-- Extensions
CREATE EXTENSION citext;
CREATE EXTENSION fuzzystrmatch;

-- Reset
DROP TABLE IF EXISTS voter_tag;
DROP TABLE IF EXISTS voter;
DROP TABLE IF EXISTS tag;

-- Database schema
CREATE TABLE voter (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name CITEXT,
    last_name CITEXT,
    address1 CITEXT,
    address2 CITEXT,
    city CITEXT,
    state CITEXT,
    zip TEXT,
    UNIQUE(first_name, last_name, address1, address2, city, state, zip)
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