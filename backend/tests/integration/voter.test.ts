import request from 'supertest';
import { app } from '../../src/server';
import { configDotenv } from "dotenv";
import { afterAll, beforeAll } from "@jest/globals";
import { createVoter, deleteVoter } from "../../src/voterRepo";
import { faker } from '@faker-js/faker';
import pool from "../../src/db";

configDotenv({ path: '.env.test' })

describe('voter get endpoint', () => {
  let voterId: string;

  beforeAll(
    async () => {
      const client = await pool.connect();
      let result = await createVoter(
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
      voterId = result.id;
      client.release();
    }
  );

  afterAll(
    async () => {
      const client = await pool.connect();
      await deleteVoter(client, voterId);
    }
  )

  it('gets voter by id', async () => {
    const response = await request(app).get(`/voters/${voterId}`).send();
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id', voterId);
  })

  it('returns 400 if voter id is not uuid', async () => {
    const invalidVoterId = '123';
    const response = await request(app).get(`/voters/${invalidVoterId}`).send();
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('type', 'InvalidParamsError');
    expect(response.body).toHaveProperty('invalidFields', ['id']);
  })

  it('returns 404 if voter not found', async () => {
    const invalidVoterId = '00000000-0000-0000-0000-000000000000';
    const response = await request(app).get(`/voters/${invalidVoterId}`).send();
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('type', 'VoterNotFoundError');
    expect(response.body).toHaveProperty('voterId', invalidVoterId);
  })
})