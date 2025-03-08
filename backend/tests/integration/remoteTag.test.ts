import request from 'supertest';
import { app } from '../../src/server';
import { configDotenv } from "dotenv";
import { afterAll, beforeAll } from "@jest/globals";
import { createVoter, deleteVoter, Voter } from "../../src/voterService";
import { faker } from '@faker-js/faker';
import pool from "../../src/db";
import {addTag, addVoterTag, deleteTag, Tag, VoterTag} from '../../src/tagService';

configDotenv({ path: '.env.test' })

describe('remove tag endpoint', () => {
  let voter: Voter;
  let tag: Tag;
  let voterTag: VoterTag;

  beforeAll(
    async () => {
      const client = await pool.connect();
      voter = await createVoter(
        client,
        {
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          address1: faker.location.streetAddress(),
          address2: faker.location.secondaryAddress(),
          city: faker.location.city(),
          state: faker.location.state(),
          zip: faker.location.zipCode(),
        }
      );
      tag = await addTag(client, faker.lorem.word(5));
      voterTag = await addVoterTag(client, {voterId: voter.id, name: tag.name});
      client.release();
    }
  );

  afterAll(
    async () => {
      const client = await pool.connect();
      await deleteVoter(client, voter.id);
      await deleteTag(client, tag.tagId);
      client.release();
    }
  )

  it('returns 200 if voter tag is removed', async () => {
    const response = await request(app).post(`/voters/${voter.id}/removeTag`).send({ voterTagId: voterTag.voterTagId });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('tags', []);
    expect(response.body).toHaveProperty('voter.id', voter.id);
  });

  it('returns 400 if voter id is not uuid', async () => {
    const response = await request(app).post(`/voters/123/removeTag`).send({ voterTagId: voterTag.voterTagId });
    expect(response.status).toBe(400)
    expect(response.body).toHaveProperty('type', 'InvalidParamsError');
    expect(response.body).toHaveProperty('invalidFields', ['id']);
  });

  it('returns 400 if voter tag id is not uuid', async () => {
    const response = await request(app).post(`/voters/${voter.id}/removeTag`).send({ voterTagId: 'abc' });
    expect(response.status).toBe(400)
    expect(response.body).toHaveProperty('type', 'InvalidParamsError');
    expect(response.body).toHaveProperty('invalidFields', ['voterTagId']);
  });

  it('returns 404 if voter tag not found', async () => {
    const invalidVoterId = '00000000-0000-0000-0000-000000000000';
    const response = await request(app).post(`/voters/${invalidVoterId}/removeTag`).send({ voterTagId: voterTag.voterTagId });
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('type', 'VoterNotFoundError');
    expect(response.body).toHaveProperty('voterId', invalidVoterId);
  })
})