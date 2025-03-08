import request from 'supertest';
import { app } from '../../src/server';
import { configDotenv } from "dotenv";
import { afterAll, beforeAll } from "@jest/globals";
import { createVoter, deleteVoter, Voter } from "../../src/voterService";
import { faker } from '@faker-js/faker';
import { withTransaction } from "../../src/db";
import { addTag, deleteTag, Tag } from '../../src/tagService';

configDotenv({ path: '.env.test' })

describe('add tag endpoint', () => {
  let voter: Voter;
  let tag: Tag;

  beforeAll(
    async () => {
      await withTransaction(async client => {
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
      });
    }
  );

  afterAll(
    async () => {
      await withTransaction(async client => {
        await deleteVoter(client, voter.id);
        await deleteTag(client, tag.tagId);
      });
    }
  )

  it('adds existing tag to voter', async () => {
    const response = await request(app).post(`/voters/${voter.id}/addTag`).send({ name: tag.name });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('voter');
    expect(response.body).toHaveProperty('tags');
    expect(response.body.tags).toContainEqual({ voterTagId: expect.any(String), name: tag.name });
  });

  it('adds new tag to voter', async () => {
    const tagName = faker.lorem.word(3);
    const response = await request(app).post(`/voters/${voter.id}/addTag`).send({ name: tagName });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('voter');
    expect(response.body).toHaveProperty('tags');
    expect(response.body.tags).toContainEqual({ voterTagId: expect.any(String), name: tagName });
  });

  it('returns 400 if voter id is not uuid', async () => {
    const response = await request(app).post(`/voters/123/addTag`).send({ name: tag.name });
    expect(response.status).toBe(400)
    expect(response.body).toHaveProperty('type', 'InvalidParamsError');
    expect(response.body).toHaveProperty('invalidFields', ['id']);
  });

  it('returns 400 if tag is 2 or less characters', async () => {
    const name = faker.lorem.word(2);
    const response = await request(app).post(`/voters/${voter.id}/addTag`).send({ name });
    expect(response.status).toBe(400)
    expect(response.body).toHaveProperty('type', 'InvalidParamsError');
    expect(response.body).toHaveProperty('invalidFields', ['name']);
  });

})