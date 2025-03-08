import {getVoterById} from "../src/voterRepo";
import {mockUserId} from "./mockDb";
import {Pool} from "pg";
import {SQL_STATEMENTS} from "../src/constants";

jest.mock("pg", () => {
  return {
    Pool: jest.fn().mockImplementation(() => ({
      connect: jest.fn().mockResolvedValue({
        query: jest.fn(async (queryTextOrConfig: string, values?: any[]) => {
          if (queryTextOrConfig === SQL_STATEMENTS.VOTER_BY_ID && values && values[0] === mockUserId) {
            return {
              rows: [{
                id: mockUserId,
                first_name: 'Desmond',
                last_name: 'Brown',
                address1: '19729 Mueller Grove',
                address2: 'Apt. 062',
                city: 'Port Morrischester',
                state: 'IN',
                zip: '18162'
              }]
            };
          }
          return {rows: []};
        }),
        release: jest.fn(),
      }),
      end: jest.fn(),
    })),
  };
});

describe("getVoterById", () => {

  it("should return a voter when found", async () => {
    const pool = new Pool();
    const client = await pool.connect();
    const result = await getVoterById(client, mockUserId);

  });

});