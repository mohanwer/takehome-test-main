import knexConstructor, {Knex} from "knex";
import {Pool, PoolClient} from "pg";


export async function withTransaction(
  fn: (client: PoolClient, ...args: any[]) => Promise<any>,
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

// Construct a Postgres connection pool
const pool = new Pool({
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Helper to run a Knex query using our connection pool
export async function knexQuery(query: Knex.QueryBuilder): Promise<any> {
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

export default pool;
