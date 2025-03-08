import { SettingsNotFoundError } from "./errors";

interface DbSettings {
  host: string;
  port: string;
  user: string;
  password: string;
  database: string;
  // These are intentionally required. We should always set these in a production
  // environment to sensible values.
  maxConnections: number;
  idleTimeoutMillis: number;
  connectionTimeoutMillis: number;
}

const getEnv = (envVarName: string): string => {
  const value = process.env[envVarName];
  if (!value) {
    throw new SettingsNotFoundError(envVarName);
  }
  return value;
}

export const createDbSettingsFromEnv = (): DbSettings => {
  return {
    host: getEnv('PGHOST'),
    port: getEnv('PGPORT'),
    user: getEnv('PGUSER'),
    password: getEnv('PGPASSWORD'),
    database: getEnv('PGDATABASE'),
    maxConnections: parseInt(getEnv('PGMAXCONNECTIONS') || '20'),
    idleTimeoutMillis: parseInt(getEnv('PGIDLETIMEOUTMILLIS') || '30000'),
    connectionTimeoutMillis: parseInt(getEnv('PGCONNECTIONTIMEOUTMILLIS') || '2000'),
  };
}
