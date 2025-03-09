import { Knex } from "knex";
import { Voter } from "../db/types";

export enum SearchFields {
  FirstName = "firstName",
  LastName = "lastName",
  Address1 = "address1",
  Address2 = "address2",
  City = "city",
  State = "state",
  Zip = "zip",
}

const FIELD_TO_COLUMN_MAP: Record<SearchFields, string> = {
  [SearchFields.FirstName]: "first_name",
  [SearchFields.LastName]: "last_name",
  [SearchFields.Address1]: "address1",
  [SearchFields.Address2]: "address2",
  [SearchFields.City]: "city",
  [SearchFields.State]: "state",
  [SearchFields.Zip]: "zip",
};

const NAME_SEARCH_LENGTH_LIMIT = 3;
const DEFAULT_FUZZY_DISTANCE = 2;

export const isSearchableField = (field: string): boolean =>
  Object.values(SearchFields).includes(field as SearchFields);

export const searchDbForField = (
  query: Knex.QueryBuilder,
  field: SearchFields,
  value: string
): void => {
  const dbColumn = FIELD_TO_COLUMN_MAP[field];
  const fieldSearchHandlers: Record<SearchFields, () => void> = {
    [SearchFields.FirstName]: () => nameSearch(query, dbColumn, value),
    [SearchFields.LastName]: () => nameSearch(query, dbColumn, value),
    [SearchFields.Address1]: () => addressSearch(query, dbColumn, value, false),
    [SearchFields.Address2]: () => addressSearch(query, dbColumn, value, true),
    [SearchFields.City]: () => fuzzyMatch(query, dbColumn, value),
    [SearchFields.Zip]: () => fuzzyMatch(query, dbColumn, value, 1),
    [SearchFields.State]: () => exactMatch(query, dbColumn, value),
  };

  fieldSearchHandlers[field]?.();
};

export const fuzzyMatch = (
  query: Knex.QueryBuilder,
  dbColumn: string,
  value: string,
  distance: number = DEFAULT_FUZZY_DISTANCE
): void => {
  query
    .whereRaw(
      `(${dbColumn} LIKE ? OR levenshtein(?, ${dbColumn}) <= ?)`,
      [`${value}%`, value, distance]
    )
    .orderByRaw(`levenshtein(?, ${dbColumn})`, [value]);
};

export const exactMatch = (
  query: Knex.QueryBuilder,
  dbColumn: string,
  value: string
): void => {
  query.where(dbColumn, value);
};

export const beginsWith = (
  query: Knex.QueryBuilder,
  dbColumn: string,
  value: string
): void => {
  query.whereLike(dbColumn, `${value}%`);
};

const isAddressOnlyNumber = (value: string): boolean =>
  value.split(" ").length === 1 && !isNaN(Number(value));

const addressSearch = (
  query: Knex.QueryBuilder,
  dbColumn: string,
  value: string,
  allowEndsWith: boolean
): void => {
  if (isAddressOnlyNumber(value)) {
    (allowEndsWith ? query.whereLike(dbColumn, `%${value}`) : beginsWith(query, dbColumn, value));
  } else {
    fuzzyMatch(query, dbColumn, value);
  }
};

export const nameSearch = (
  query: Knex.QueryBuilder,
  dbColumn: string,
  value: string
): void => {
  value.length < NAME_SEARCH_LENGTH_LIMIT
    ? beginsWith(query, dbColumn, value)
    : fuzzyMatch(query, dbColumn, value);
};


const wordConfidence = (
  word1: string,
  word2: string,
  i: number,
  j: number,
  matches: number
): number => {
  if (i > word1.length - 1 || j > word2.length - 1) {
    return matches;
  }
  if (word1[i].toLowerCase() !== word2[j].toLowerCase()) {
    return Math.max(
      wordConfidence(word1, word2, i, j + 1, matches),
      wordConfidence(word1, word2, i + 1, j, matches)
    );
  }
  return wordConfidence(word1, word2, i + 1, j + 1, matches + 1);
};

export const rowConfidence = (
  row: Voter,
  searchParams: [searchField: SearchFields, searchValue: string][]
) => {
  let confidenceSummation = 0;
  let maxConfidenceSummation = 0;

  for (const [searchField, searchValue] of searchParams) {
    const columnName: string = FIELD_TO_COLUMN_MAP[searchField];
    const rowValue = row[columnName as keyof Voter];
    let searchI = 0,
      rowI = 0;

    confidenceSummation += wordConfidence(
      searchValue,
      rowValue,
      searchI,
      rowI,
      0
    );
    maxConfidenceSummation += Math.max(searchValue.length, rowValue.length);
  }

  return Math.round((confidenceSummation / maxConfidenceSummation) * 100) / 100;
};