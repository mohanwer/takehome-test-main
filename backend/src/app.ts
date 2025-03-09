import { AppSettings } from "./settings";
import { Pool, PoolConfig } from "pg";
import express, { Express } from "express";
import cors from "cors";
import voterRoutes from "./routes/voterRoutes";
import searchRoutes from "./routes/searchRoutes";
import { errorToResponse } from "./errors";

export interface ExpressWithLocals extends Express {
  locals: {
    dbPool: Pool;
    appPort: number;
  };
}

const ROUTES = {
  VOTERS: "/voters",
  SEARCH: "/search",
};

const setupMiddlewares = (app: Express) => {
  app.use(express.json());
  app.use(cors());

};

const setupShutdownHandler = (app: ExpressWithLocals, dbPool: Pool) => {
  app.on("shutdown", async () => {
    await dbPool.end();
  });
};

export const createApp = (settings: AppSettings): ExpressWithLocals => {
  const dbConfig: PoolConfig = { ...settings.db };
  const dbPool = new Pool(dbConfig);

  const app = express();

  app.locals = {
    dbPool,
    appPort: settings.app.port,
  };
  setupMiddlewares(app);
  app.use(ROUTES.VOTERS, voterRoutes);
  app.use(ROUTES.SEARCH, searchRoutes);
  app.use(errorToResponse);
  setupShutdownHandler(app as ExpressWithLocals, dbPool);

  return app as ExpressWithLocals;
};