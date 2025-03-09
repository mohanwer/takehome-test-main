import { Knex } from "knex";
import { Voter } from "../db/types";

export const isSearchableField = (field: string): boolean => {
	return Object.values(SearchFields).toString().includes(field);
};

export enum SearchFields {
	firstName = "firstName",
	lastName = "lastName",
	address1 = "address1",
	address2 = "address2",
	city = "city",
	state = "state",
	zip = "zip",
}

const FieldToColumnMap: Record<SearchFields, string> = {
	firstName: "first_name",
	lastName: "last_name",
	address1: "address1",
	address2: "address2",
	city: "city",
	state: "state",
	zip: "zip",
};

export const searchDbForField = (
	query: Knex.QueryBuilder,
	field: SearchFields,
	value: string
): void => {
	const column = FieldToColumnMap[field];

	if (field === SearchFields.firstName || field === SearchFields.lastName) {
		nameSearch(query, column, value);
	} else if (field === SearchFields.address1) {
		addressOneSearch(query, value);
	} else if (field === SearchFields.address2) {
		addressTwoSearch(query, value);
	} else if (field === SearchFields.city) {
		fuzzyMatch(query, column, value);
	} else if (field === SearchFields.zip) {
		fuzzyMatch(query, column, value, 1);
	} else if (field === SearchFields.state) {
		exactMatch(query, column, value);
	}
};

export const fuzzyMatch = (
	query: Knex.QueryBuilder,
	column: string,
	value: string,
	distance: number = 2
): void => {
	query
		.whereRaw(
			`(${column} like ? or levenshtein(?, ${column}) <= ${distance})`,
			[`${value}%`, value]
		)
		.orderByRaw(`levenshtein(?, ${column})`, [value]);
};

export const exactMatch = (
	query: Knex.QueryBuilder,
	column: string,
	value: string
): void => {
	query.where(column, value);
};

export const beginsWith = (
	query: Knex.QueryBuilder,
	column: string,
	value: string
): void => {
	query.whereLike(column, `${value}%`);
};

export const endsWith = (
	query: Knex.QueryBuilder,
	column: string,
	value: string
): void => {
	query.whereLike(column, `%${value}`);
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
		const columnName: string = FieldToColumnMap[searchField];
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

// If first/last name only have 2 or fewer characters, searches using begins with.
// Otherwise, performs a fuzzy search.
export const nameSearch = (
	query: Knex.QueryBuilder,
	column: string,
	value: string
): void => {
	if (value.length < 3) {
		beginsWith(query, column, value);
	} else {
		fuzzyMatch(query, column, value);
	}
};

// Checks if the address1 input only starts with a number.
// If so, uses a starts with search; otherwise, perform fuzzy.
export const addressOneSearch = (
	query: Knex.QueryBuilder,
	value: string
): void => {
	const column = FieldToColumnMap[SearchFields.address1];
	if (addressOnlyHasNumber(value)) {
		beginsWith(query, column, value);
	} else {
		fuzzyMatch(query, column, value);
	}
};

// If address2 is only a number then performs a begins with. Otherwise, performs fuzzy match.
export const addressTwoSearch = (
	query: Knex.QueryBuilder,
	value: string
): void => {
	const column = FieldToColumnMap[SearchFields.address2];
	if (addressOnlyHasNumber(value)) {
		endsWith(query, column, value);
	} else {
		fuzzyMatch(query, column, value);
	}
};

export const addressOnlyHasNumber = (value: string) => {
	const splitValue = value.split(" ");
	return splitValue.length === 1 && isNumber(value);
};

function isNumber(value: string) {
	return !isNaN(Number(value));
}
