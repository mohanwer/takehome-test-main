import knexConstructor, {Knex} from "knex";
import {Pool, PoolClient} from "pg";


export async function withTransaction(
  pool: Pool, fn: (client: PoolClient, ...args: any[]) => Promise<any>,
  ...args: any[]
) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client, ...args);
    await client.query("COMMIT");
    return result;
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

// Helper to run a Knex query using our connection pool
export async function knexQuery(pool: Pool, query: Knex.QueryBuilder): Promise<any> {
  const client = await pool.connect();

  try {
    return await query.connection(client);
    ``
  } finally {
    client.release();
  }
}

export const knex = knexConstructor({
  client: "pg",
});
