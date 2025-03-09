import {AppSettings} from "./settings";
import {Pool} from "pg";
import express, {Express} from "express";
import cors from "cors";
import voterRoutes from "./voterRoutes";
import searchRoutes from "./searchRoutes";
import {errorToResponse} from "./errors";

export interface ExpressA extends Express {
  locals: {
    dbPool: Pool;
    appPort: number;
  };
}


export const createApp = (settings: AppSettings): ExpressA => {
  const pool = new Pool({
    ...settings.db,
  });

  const app = express();
  app.locals = {
    dbPool: pool,
    appPort: settings.app.port,
  }
  app.use(express.json());
  app.use(cors());
  app.use("/voters", voterRoutes);
  app.use("/search", searchRoutes);
  app.use(errorToResponse);

  app.on("shutdown", async() => {
    await pool.end();
  })

  return app as ExpressA;
}