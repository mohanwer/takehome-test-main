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

const QUERY_TAG_BY_NAME = "SELECT id, name FROM tag WHERE name = $1";
const QUERY_VOTER_TAG_BY_VOTER_ID = `SELECT voter_tag.id as voter_tag_id, tag.name
                                     FROM tag
                                              JOIN voter_tag ON tag.id = voter_tag.tag_id
                                     WHERE voter_tag.voter_id = $1`;
const QUERY_ALL_TAGS = "SELECT id, name FROM tag";
const QUERY_VOTER_TAGS_BY_VOTER_ID = `SELECT id, voter_id, tag_id
                                      FROM voter_tag
                                      WHERE voter_id = $1
                                        AND tag_id = $2`;

const INSERT_TAG = "INSERT INTO tag (name) VALUES ($1) RETURNING id";
const INSERT_VOTER_TAG =
	"INSERT INTO voter_tag (voter_id, tag_id) VALUES ($1, $2) RETURNING id";

const DELETE_VOTER_TAG_BY_ID = "DELETE FROM voter_tag WHERE id = $1";
const DELETE_VOTER_TAG_BY_TAG_ID = "DELETE FROM voter_tag WHERE tag_id = $1";
const DELETE_TAG_BY_ID = "DELETE FROM tag WHERE id = $1";

export const getTagByName = async (
	db: PoolClient,
	tagName: string
): Promise<null | Tag> => {
	const tagResult = await db.query<DbTag>(QUERY_TAG_BY_NAME, [tagName]);
	if (tagResult.rowCount === 0) {
		return null;
	}
	return {
		tagId: tagResult.rows[0].id,
		name: tagName,
	};
};

export const addTag = async (db: PoolClient, tagName: string): Promise<Tag> => {
	const tag = await getTagByName(db, tagName);
	if (tag) {
		return tag;
	}
	const insertResult = await db.query(INSERT_TAG, [tagName]);
	return {
		tagId: insertResult.rows[0].id,
		name: tagName,
	};
};

export const getVoterTagsByVoterId = async (
	db: PoolClient,
	voterId: string
): Promise<VoterTag[]> => {
	const tagsResult = await db.query(QUERY_VOTER_TAG_BY_VOTER_ID, [voterId]);
	return tagsResult.rows.map((row) => ({
		voterTagId: row.voter_tag_id,
		name: row.name,
	}));
};

export const getAllTags = async (db: PoolClient): Promise<Tag[]> => {
	const tagsResult = await db.query<DbTag>(QUERY_ALL_TAGS);
	return tagsResult.rows.map((row) => ({
		tagId: row.id,
		name: row.name,
	}));
};

export const addVoterTag = async (
	db: PoolClient,
	voterTag: AddVoterTag
): Promise<VoterTag> => {
	const { voterId, name } = voterTag;
	const tag = await addTag(db, name);
	const { tagId } = tag;
	const existingTag = await db.query<DbVoterTag>(QUERY_VOTER_TAGS_BY_VOTER_ID, [
		voterId,
		tagId,
	]);
	if (existingTag.rowCount === 1) {
		return {
			voterTagId: existingTag.rows[0].id,
			name: name,
		};
	}
	const insertResult = await db.query(INSERT_VOTER_TAG, [voterId, tagId]);
	return {
		voterTagId: insertResult.rows[0].id,
		name: name,
	};
};

export const removeVoterTag = async (
	db: PoolClient,
	voterTagId: string
): Promise<void> => {
	await db.query(DELETE_VOTER_TAG_BY_ID, [voterTagId]);
};

export const deleteTag = async (
	db: PoolClient,
	tagId: string
): Promise<void> => {
	await db.query(DELETE_VOTER_TAG_BY_TAG_ID, [tagId]);
	await db.query(DELETE_TAG_BY_ID, [tagId]);
};
