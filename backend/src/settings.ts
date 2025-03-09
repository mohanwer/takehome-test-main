import { SettingsNotFoundError } from "./errors";

export interface AppSettings {
  db: {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
    maxConnections: number;
    idleTimeoutMillis: number;
    connectionTimeoutMillis: number;
  };
  app: {
    port: number;
  };
}

// Define default values for environment variables as constants
const DEFAULT_MAX_CONNECTIONS = 20;
const DEFAULT_IDLE_TIMEOUT_MS = 30000;
const DEFAULT_CONNECTION_TIMEOUT_MS = 2000;
const DEFAULT_APP_PORT = 9099;

// Helper function for required environment variables
const getRequiredEnv = (envVarName: string): string => {
  const value = process.env[envVarName];
  if (!value) {
    throw new SettingsNotFoundError(envVarName);
  }
  return value;
};

// Helper function for optional environment variables with default values
const getOptionalEnv = (envVarName: string, defaultValue: string): number => {
  return parseInt(process.env[envVarName] || defaultValue);
};

// Main function to create AppSettings from environment variables
export const createAppSettingsFromEnv = (): AppSettings => {
  return {
    db: {
      host: getRequiredEnv("PGHOST"),
      port: getOptionalEnv("PGPORT", "5432"),
      user: getRequiredEnv("PGUSER"),
      password: getRequiredEnv("PGPASSWORD"),
      database: getRequiredEnv("PGDATABASE"),
      maxConnections: getOptionalEnv("PGMAXCONNECTIONS", DEFAULT_MAX_CONNECTIONS.toString()),
      idleTimeoutMillis: getOptionalEnv("PGIDLETIMEOUTMILLIS", DEFAULT_IDLE_TIMEOUT_MS.toString()),
      connectionTimeoutMillis: getOptionalEnv("PGCONNECTIONTIMEOUTMILLIS", DEFAULT_CONNECTION_TIMEOUT_MS.toString()),
    },
    app: {
      port: getOptionalEnv("PORT", DEFAULT_APP_PORT.toString()),
    },
  };
};