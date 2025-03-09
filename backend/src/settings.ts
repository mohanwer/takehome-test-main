import { SettingsNotFoundError } from "./errors";

export interface AppSettings {
	db: {
		host: string;
		port: number;
		user: string;
		password: string;
		database: string;
		// These are intentionally required. We should always set these in a production
		// environment to sensible values.
		maxConnections: number;
		idleTimeoutMillis: number;
		connectionTimeoutMillis: number;
	};
	app: {
		port: number;
	};
}

const getEnv = (envVarName: string): string => {
	const value = process.env[envVarName];
	if (!value) {
		throw new SettingsNotFoundError(envVarName);
	}
	return value;
};

export const createAppSettingsFromEnv = (): AppSettings => {
	return {
		db: {
			host: getEnv("PGHOST"),
			port: parseInt(getEnv("PGPORT")),
			user: getEnv("PGUSER"),
			password: getEnv("PGPASSWORD"),
			database: getEnv("PGDATABASE"),
			maxConnections: parseInt(process.env["PGMAXCONNECTIONS"] || "20"),
			idleTimeoutMillis: parseInt(
				process.env["PGIDLETIMEOUTMILLIS"] || "30000"
			),
			connectionTimeoutMillis: parseInt(
				process.env["PGCONNECTIONTIMEOUTMILLIS"] || "2000"
			),
		},
		app: {
			port: parseInt(process.env.PORT || "9099"),
		},
	};
};
