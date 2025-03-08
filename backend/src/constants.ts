export enum SQL_STATEMENTS {
  VOTER_BY_ID = "SELECT * FROM VOTER WHERE ID = $1",
}

export const INSERT_VOTER = `
    INSERT INTO voter (first_name, last_name, address1, address2, city, state, zip)
    VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;
`;

export const DELETE_VOTER = "DELETE FROM voter WHERE id = $1;"