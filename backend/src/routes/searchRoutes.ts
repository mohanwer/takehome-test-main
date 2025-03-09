import express, { Request, Response } from "express";
import { wrapAsyncRoute } from "../expressUtil";
import { knex, knexQuery } from "../db/db";
import {
  rowConfidence,
  isSearchableField,
  searchDbForField,
  SearchFields,
} from "../services/searchService";
import { Voter } from "../db/types";
import { InvalidParamsError } from "../errors";

const router = express.Router();

const validateSearch = (req: Request): void => {
  const { query } = req;
  const invalidParams = [];
  for (const [key, value] of Object.entries(query)) {
    if (!isSearchableField(key)) {
      continue;
    }
    if (typeof value !== "string") {
      invalidParams.push(key);
    }
  }
  if (invalidParams.length > 0) {
    throw new InvalidParamsError(invalidParams);
  }
};

router.get(
  "",
  wrapAsyncRoute(async (req: Request, res: Response) => {
    validateSearch(req);

    const { dbPool } = req.app.locals;
    const query = knex("voter").select("*").limit(100);
    const reqQuery = req.query;
    const searchedKeyValues: [
      searchField: SearchFields,
      searchValue: string
    ][] = [];
    for (const [searchField, searchValue] of Object.entries(reqQuery)) {
      if (!searchValue) {
        continue;
      }

      searchDbForField(
        query,
        searchField as SearchFields,
        searchValue as string
      );
      searchedKeyValues.push([
        searchField as SearchFields,
        searchValue as string,
      ]);
    }
    const result: Voter[] = await knexQuery(dbPool, query);

    res.json({
      matches: result
        .map((row) => ({
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
          confidence: rowConfidence(row, searchedKeyValues),
        }))
        .sort((a, b) => b.confidence - a.confidence),
    });
  })
);

export default router;
