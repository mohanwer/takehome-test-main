import request from "supertest";
import { afterAll, beforeAll } from "@jest/globals";
import {
	createVoter,
	deleteVoter,
	Voter,
} from "../../src/services/voterService";
import { faker } from "@faker-js/faker";
import { withTransaction } from "../../src/db/db";
import { addTag, deleteTag, Tag } from "../../src/services/tagService";
import { createAppSettingsFromEnv } from "../../src/settings";
import { createApp, ExpressWithLocals } from "../../src/app";

describe("add tag endpoint", () => {
	let voter: Voter;
	let tag: Tag;
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
		});
	});

	afterAll(async () => {
		await withTransaction(app.locals.dbPool, async (client) => {
			await deleteVoter(client, voter.id);
			await deleteTag(client, tag.tagId);
		});
	});

	it("adds existing tag to voter", async () => {
		const response = await request(app)
			.post(`/voters/${voter.id}/addTag`)
			.send({ name: tag.name });
		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty("voterTagId");
		expect(response.body).toHaveProperty("name");
	});

	it("adds new tag to voter", async () => {
		const tagName = faker.lorem.word(3);
		const response = await request(app)
			.post(`/voters/${voter.id}/addTag`)
			.send({ name: tagName });
		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty("voterTagId");
		expect(response.body).toHaveProperty("name");
	});

	it("returns 400 if voter id is not uuid", async () => {
		const response = await request(app)
			.post(`/voters/123/addTag`)
			.send({ name: tag.name });
		expect(response.status).toBe(400);
		expect(response.body).toHaveProperty("type", "InvalidParamsError");
		expect(response.body).toHaveProperty("validationFailureReasons");
	});

	it("returns 400 if tag is 2 or less characters", async () => {
		const name = faker.lorem.word(2);
		const response = await request(app)
			.post(`/voters/${voter.id}/addTag`)
			.send({ name });
		expect(response.status).toBe(400);
		expect(response.body).toHaveProperty("type", "InvalidParamsError");
		expect(response.body).toHaveProperty("validationFailureReasons");
	});
});
