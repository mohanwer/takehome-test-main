import request from 'supertest';
import { app } from '../../src/server';
import { configDotenv } from "dotenv";
import { afterAll, beforeAll } from "@jest/globals";
import { createVoter, deleteVoter, Voter } from "../../src/voterRepo";
import { faker } from '@faker-js/faker';
import pool from "../../src/db";
import { addTag, deleteTag, Tag } from '../../src/tagService';

configDotenv({ path: '.env.test' })

describe('add tag endpoint', () => {
  let voter: Voter;
  let tag: Tag;

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
      tag = await addTag(client, faker.lorem.word());
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

  it('adds existing tag to voter', async () => {
    const response = await request(app).post(`/voters/${voter.id}/addTag`).send({ tagName: tag.name });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('voter');
    expect(response.body).toHaveProperty('tags');
    expect(response.body.tags).toContainEqual({ voterTagId: expect.any(String), name: tag.name });
  })
})