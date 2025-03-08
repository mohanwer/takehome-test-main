import {PoolClient} from "pg"
import {DELETE_VOTER, INSERT_VOTER, SQL_STATEMENTS} from "./constants";

export interface Voter {
  id: string,
  firstName: string,
  lastName: string,
  address1: string,
  address2: string | null,
  city: string,
  state: string,
  zip: string,
}

interface NewVoter {
  firstName: string,
  lastName: string,
  address1: string,
  address2: string | null,
  city: string,
  state: string,
  zip: string,
}


export const getVoterById = async (db: PoolClient, id: string): Promise<Voter | null> => {
  const result = await db.query(SQL_STATEMENTS.VOTER_BY_ID, [id]);

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
}

export const createVoter = async (db: PoolClient, voter: NewVoter): Promise<Voter> => {
  const result = await db.query(INSERT_VOTER, [
      voter.firstName, voter.lastName, voter.address1, voter.address2, voter.city, voter.state, voter.zip
    ]
  )

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
}

export const deleteVoter = async (db: PoolClient, id: string): Promise<void> => {
  await db.query(DELETE_VOTER, [id]);
}