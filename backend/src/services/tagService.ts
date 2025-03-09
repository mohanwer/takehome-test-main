import { PoolClient } from "pg";
import { Tag as DbTag, VoterTag as DbVoterTag } from "../db/types";

export interface Tag {
  tagId: string;
  name: string;
}

export interface VoterTag {
  voterTagId: string;
  name: string;
}

export interface AddVoterTag {
  voterId: string;
  name: string;
}

// Centralize SQL queries for readability
const SqlQueries = {
  QUERY_TAG_BY_NAME: "SELECT id, name FROM tag WHERE name = $1",
  QUERY_VOTER_TAG_BY_VOTER_ID: `
    SELECT voter_tag.id as voter_tag_id, tag.name
    FROM tag
    JOIN voter_tag ON tag.id = voter_tag.tag_id
    WHERE voter_tag.voter_id = $1`,
  QUERY_ALL_TAGS: "SELECT id, name FROM tag",
  QUERY_VOTER_TAGS_BY_VOTER_ID: `
    SELECT id, voter_id, tag_id
    FROM voter_tag
    WHERE voter_id = $1 AND tag_id = $2`,
  INSERT_TAG: "INSERT INTO tag (name) VALUES ($1) RETURNING id",
  INSERT_VOTER_TAG: "INSERT INTO voter_tag (voter_id, tag_id) VALUES ($1, $2) RETURNING id",
  DELETE_VOTER_TAG_BY_ID: "DELETE FROM voter_tag WHERE id = $1",
  DELETE_VOTER_TAG_BY_TAG_ID: "DELETE FROM voter_tag WHERE tag_id = $1",
  DELETE_TAG_BY_ID: "DELETE FROM tag WHERE id = $1",
};

// Utility to query a single row and handle absence
const queryUniqueRow = async <T>(
  db: PoolClient,
  query: string,
  params: any[]
): Promise<T | null> => {
  const result = await db.query(query, params);
  return (result.rowCount ?? 0) > 0 ? result.rows[0] : null;
};

// Fetch tag by name
export const getTagByName = async (
  db: PoolClient,
  name: string
): Promise<Tag | null> => {
  const tag = await queryUniqueRow<DbTag>(
    db,
    SqlQueries.QUERY_TAG_BY_NAME,
    [name]
  );
  return tag ? { tagId: tag.id, name } : null;
};

// Add a tag if it doesn't exist
export const addTag = async (db: PoolClient, name: string): Promise<Tag> => {
  const tag = await getTagByName(db, name);
  if (tag) return tag;

  const result = await db.query(SqlQueries.INSERT_TAG, [name]);
  return { tagId: result.rows[0].id, name };
};

// Fetch all voter tags by voter ID
export const getVoterTagsByVoterId = async (
  db: PoolClient,
  voterId: string
): Promise<VoterTag[]> => {
  const tagsResult = await db.query(SqlQueries.QUERY_VOTER_TAG_BY_VOTER_ID, [
    voterId,
  ]);
  return tagsResult.rows.map((row) => ({
    voterTagId: row.voter_tag_id,
    name: row.name,
  }));
};

// Fetch all tags
export const getAllTags = async (db: PoolClient): Promise<Tag[]> => {
  const tagsResult = await db.query<DbTag>(SqlQueries.QUERY_ALL_TAGS);
  return tagsResult.rows.map((tag) => ({ tagId: tag.id, name: tag.name }));
};

// Add a voter tag
export const addVoterTag = async (
  db: PoolClient,
  { voterId, name }: AddVoterTag
): Promise<VoterTag> => {
  const tag = await addTag(db, name);

  const existingVoterTagResult = await queryUniqueRow<DbVoterTag>(
    db,
    SqlQueries.QUERY_VOTER_TAGS_BY_VOTER_ID,
    [voterId, tag.tagId]
  );

  if (existingVoterTagResult) {
    return {
      voterTagId: existingVoterTagResult.id,
      name,
    };
  }

  const insertResult = await db.query(SqlQueries.INSERT_VOTER_TAG, [
    voterId,
    tag.tagId,
  ]);
  return { voterTagId: insertResult.rows[0].id, name };
};

// Remove a voter tag by ID
export const removeVoterTag = async (
  db: PoolClient,
  voterTagId: string
): Promise<void> => {
  await db.query(SqlQueries.DELETE_VOTER_TAG_BY_ID, [voterTagId]);
};

// Delete a tag and associated voter tags
export const deleteTag = async (
  db: PoolClient,
  tagId: string
): Promise<void> => {
  await db.query(SqlQueries.DELETE_VOTER_TAG_BY_TAG_ID, [tagId]);
  await db.query(SqlQueries.DELETE_TAG_BY_ID, [tagId]);
};