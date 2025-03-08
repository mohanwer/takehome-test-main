import {SQL_STATEMENTS} from "../src/constants";
import {PoolConfig} from "pg";

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

export const mockUserId = 'edee3f60-9d0e-42b8-b316-73d021ebd574'

export class MockClient {
  async query(queryTextOrConfig: string, values?: any[]) {
    if (queryTextOrConfig == SQL_STATEMENTS.VOTER_BY_ID && values && values[0] === mockUserId) {
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
      }
    }
    return {
      rows: []
    }
  }

  async end() {
  }

  async connect() {
  }

  // async copyFrom(queryText: string) {}
  // async copyTo(queryText: string) {}
  async pauseDrain() {
  }

  async resumeDrain() {
  }
}

export class MockPgPool {
  constructor(config?: PoolConfig) {
  }

  async connect() {
    return new MockClient();
  }
}