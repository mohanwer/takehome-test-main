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

interface NewVoter {
  firstName: string;
  lastName: string;
  address1: string;
  address2: string | null;
  city: string;
  state: string;
  zip: string;
}

const QUERY_VOTER_BY_ID = "SELECT * FROM VOTER WHERE ID = $1";
const INSERT_VOTER = `
    INSERT INTO voter (first_name, last_name, address1, address2, city, state, zip)
    VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;
`;
const DELETE_VOTER = "DELETE FROM voter WHERE id = $1;";

export const getVoterById = async (
  db: PoolClient,
  id: string
): Promise<Voter | null> => {
  const result = await db.query<DbVoter>(QUERY_VOTER_BY_ID, [id]);

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    address1: row.address1,
    address2: row.address2,
    city: row.city,
    state: row.state,
    zip: row.zip,
  };
};

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

  const row = result.rows[0];
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    address1: row.address1,
    address2: row.address2,
    city: row.city,
    state: row.state,
    zip: row.zip,
  };
};

export const deleteVoter = async (
  db: PoolClient,
  id: string
): Promise<void> => {
  await db.query(DELETE_VOTER, [id]);
};
