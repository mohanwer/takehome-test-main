import request from "supertest";
import { afterAll, beforeAll } from "@jest/globals";
import {
  createVoter,
  deleteVoter,
  Voter,
} from "../../src/services/voterService";
import { faker } from "@faker-js/faker";
import { withTransaction } from "../../src/db/db";
import {
  addTag,
  addVoterTag,
  deleteTag,
  Tag,
  VoterTag,
} from "../../src/services/tagService";
import { createAppSettingsFromEnv } from "../../src/settings";
import { createApp, ExpressWithLocals } from "../../src/app";

describe("remove tag endpoint", () => {
  let voter: Voter;
  let tag: Tag;
  let voterTag: VoterTag;
  let app: ExpressWithLocals;

  beforeAll(async () => {
    const settings = createAppSettingsFromEnv();
    app = createApp(settings);
    await withTransaction(app.locals.dbPool, async (client) => {
      voter = await createVoter(client, {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        address1: faker.location.streetAddress(),
        address2: faker.location.secondaryAddress(),
        city: faker.location.city(),
        state: faker.location.state(),
        zip: faker.location.zipCode(),
      });
      tag = await addTag(client, faker.lorem.word(5));
      voterTag = await addVoterTag(client, {
        voterId: voter.id,
        name: tag.name,
      });
    });
  });

  afterAll(async () => {
    await withTransaction(app.locals.dbPool, async (client) => {
      await deleteVoter(client, voter.id);
      await deleteTag(client, tag.tagId);
    });
  });

  it("returns 200 if voter tag is removed", async () => {
    const response = await request(app)
      .post(`/voters/${voter.id}/removeTag`)
      .send({ voterTagId: voterTag.voterTagId });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("voterTagId", voterTag.voterTagId);
  });

  it("returns 400 if voter id is not uuid", async () => {
    const response = await request(app)
      .post(`/voters/123/removeTag`)
      .send({ voterTagId: voterTag.voterTagId });
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("type", "InvalidParamsError");
    expect(response.body).toHaveProperty("validationFailureReasons");
  });

  it("returns 400 if voter tag id is not uuid", async () => {
    const response = await request(app)
      .post(`/voters/${voter.id}/removeTag`)
      .send({ voterTagId: "abc" });
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("type", "InvalidParamsError");
    expect(response.body).toHaveProperty("validationFailureReasons");
  });

  it("returns 404 if voter tag not found", async () => {
    const invalidVoterId = "00000000-0000-0000-0000-000000000000";
    const response = await request(app)
      .post(`/voters/${invalidVoterId}/removeTag`)
      .send({ voterTagId: voterTag.voterTagId });
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("type", "VoterNotFoundError");
    expect(response.body).toHaveProperty("voterId", invalidVoterId);
  });
});
