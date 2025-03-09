import {configDotenv} from "dotenv";
import request from "supertest";
import {beforeAll} from "@jest/globals";
import {createAppSettingsFromEnv} from "../../src/settings";
import {createApp} from "../../src/app";
import {Express} from "express";

describe("Search", () => {

  let app: Express;

  beforeAll(() => {
    // The development data is easier to test against as opposed to making
    // test data in the integration tests.
    configDotenv({path: ".env"});
    const settings = createAppSettingsFromEnv();
    app = createApp(settings);
  })

  it("finds first name matches", async() => {
    const response = await request(app).get("/search?firstName=desm").send();
    expect(response.status).toBe(200);
    const body = response.body;
    expect(body).toHaveProperty("matches");
    const voters = body.matches;
    expect(voters.length).toBeGreaterThan(1);
  })

  it('finds first and last name matches', async() => {
    const response = await request(app).get("/search?firstName=desmo&lastName=B").send();
    expect(response.status).toBe(200);
    const body = response.body;
    expect(body).toHaveProperty("matches");
    const voters = body.matches;
    expect(voters.length).toBe(1);
  })
})