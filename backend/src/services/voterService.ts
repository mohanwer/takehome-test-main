import { PoolClient } from "pg";
import { Voter as DbVoter } from "../db/types";

export interface Voter {
  id: string;
  firstName: string;
  lastName: string;
  address1: string;
  address2: string | null;
  city: string;
  state: string;
  zip: string;
}

export interface UpdateVoter {
  id: string;
  firstName: string;
  lastName: string;
  address1: string;
  address2: string | null;
  city: string;
  state: string;
  zip: string;
}

interface NewVoter {
  firstName: string;
  lastName: string;
  address1: string;
  address2: string | null;
  city: string;
  state: string;
  zip: string;
}


// SQL Constants
const QUERY_VOTER_BY_ID = "SELECT * FROM voter WHERE id = $1 for update";
const INSERT_VOTER = `
    INSERT INTO voter (first_name, last_name, address1, address2, city, state, zip)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
`;
const UPDATE_VOTER = `
    UPDATE voter
    SET first_name = $2,
        last_name  = $3,
        address1   = $4,
        address2   = $5,
        city       = $6,
        state      = $7,
        zip        = $8
    WHERE id = $1
    RETURNING *;
`;
const DELETE_VOTER = "DELETE FROM voter WHERE id = $1";


const mapDbRowToVoter = (dbRow: DbVoter): Voter => ({
  id: dbRow.id,
  firstName: dbRow.first_name,
  lastName: dbRow.last_name,
  address1: dbRow.address1,
  address2: dbRow.address2,
  city: dbRow.city,
  state: dbRow.state,
  zip: dbRow.zip
});

// Exported Functions
export const getVoterById = async (
  db: PoolClient,
  id: string
): Promise<Voter | null> => {
  const result = await db.query<DbVoter>(QUERY_VOTER_BY_ID, [id]);
  return result.rows.length === 0 ? null : mapDbRowToVoter(result.rows[0]);
};

export const updateVoter = async (
  db: PoolClient,
  voter: UpdateVoter
): Promise<Voter> => {
  const result = await db.query<DbVoter>(UPDATE_VOTER, [
    voter.id,
    voter.firstName,
    voter.lastName,
    voter.address1,
    voter.address2,
    voter.city,
    voter.state,
    voter.zip,
  ]);
  return mapDbRowToVoter(result.rows[0]);
}

export const createVoter = async (
  db: PoolClient,
  voter: NewVoter
): Promise<Voter> => {
  const result = await db.query<DbVoter>(INSERT_VOTER, [
    voter.firstName,
    voter.lastName,
    voter.address1,
    voter.address2,
    voter.city,
    voter.state,
    voter.zip,
  ]);
  return mapDbRowToVoter(result.rows[0]);
};

export const deleteVoter = async (db: PoolClient, id: string): Promise<void> => {
  await db.query(DELETE_VOTER, [id]);
};