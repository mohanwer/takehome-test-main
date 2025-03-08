import express, { Express, Request, Response } from "express";
import pool, { knex, knexQuery, withTransaction } from "./db";
import { wrapAsyncRoute } from "./expressUtil";
import cors from "cors";
import { getVoterById } from "./voterRepo";
import { errorToResponse, InvalidParamsError, VoterNotFoundError } from "./errors";
import { validate as uuidValidate } from 'uuid';
import { addVoterTag, getTagsForVoterId } from "./tagService";

// Construct an Express app and add middleware to parse JSON requests and
// add CORS headers
export const app: Express = express();
app.use(express.json());
app.use(cors());

const port = process.env.PORT || 9099;

// TODO [Part 1]: Implement these three routes to load a voter by ID and
// add/remove tags.
app.get(
  "/voters/:id",
  wrapAsyncRoute(async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id || !uuidValidate(id)) {
      throw new InvalidParamsError(['id']);
    };
    await withTransaction(async client => {
      const voter = await getVoterById(client, id);
      if (!voter) {
        throw new VoterNotFoundError(id);
      }
      const tags = await getTagsForVoterId(client, id);
      res.json({ voter: voter, tags: tags });
    });
  })
);

app.post(
  "/voters/:id/addTag",
  wrapAsyncRoute(async (req: Request, res: Response) => {
    // TODO: fill this in to actually query the database and add the tag to
    // the voter with the given ID
    const params = req.params;
    const invalidParams = [];
    if (!params.voterId || !uuidValidate(params.voterId)) {
      invalidParams.push('voterId');
    }
    if (!params.tagName || params.tagName.length <= 2) {
      invalidParams.push('tagName');
    }
    if (invalidParams.length > 0) {
      throw new InvalidParamsError(invalidParams);
    }
    const { tagName, voterId } = params;

    await withTransaction(async client => {
      const voter = await getVoterById(client, voterId);
      if (!voter) {
        throw new VoterNotFoundError(voterId);
      }
      await addVoterTag(client, { voterId, tagName });
      const tags = await getTagsForVoterId(client, voterId);
      res.json({ voter: voter, tags: tags });
    });
  })
);

app.post(
  "/voters/:id/removeTag",
  wrapAsyncRoute(async (req: Request, res: Response) => {
    // TODO: fill this in to actually query the database and remove the tag
    // from the voter with the given ID
    res.json({
      id: req.params.id,
      firstName: "John",
      lastName: "Doe",
      address1: "123 Main St",
      address2: "Apt 1",
      city: "San Francisco",
      state: "CA",
      zip: "94105",
      tags: ["A", "B", "C"],
    });
  })
);

// Mock search endpoint
app.get(
  "/search",
  wrapAsyncRoute(async (req: Request, res: Response) => {
    // TODO [Part 3]: fill this in to actually query the database and find matching
    // contacts
    const exampleDBQuery = await pool.query("SELECT * FROM voter LIMIT 20");

    // This is an example of how to use the knexQuery helper to run a Knex query --
    // totally up to you whether you want to write raw SQL like the example above,
    // or use Knex like this.
    const exampleDBQuery2 = await knexQuery(
      knex("voter").select("*").limit(20).offset(20)
    );

    const allRows = exampleDBQuery.rows.concat(exampleDBQuery2);

    res.json({
      matches: allRows.map((row) => ({
        voter: {
          id: row.id,
          firstName: row.first_name,
          lastName: row.last_name,
          address1: row.address1,
          address2: row.address2,
          city: row.city,
          state: row.state,
          zip: row.zip,
        },
        confidence: 0.9,
      })),
    });
  })
);

app.use(errorToResponse);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
