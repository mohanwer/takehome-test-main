import express, { Request, Response } from "express";
import { wrapAsyncRoute } from "../expressUtil";
import { validate as uuidValidate } from "uuid";
import { InvalidParamsError, VoterNotFoundError } from "../errors";
import { withTransaction } from "../db/db";
import { deleteVoter, getVoterById, updateVoter, UpdateVoter } from "../services/voterService";
import {
  addVoterTag,
  getAllTags, getTagsContainingText,
  getVoterTagsByVoterId,
  removeVoterTag, removeVoterTagByVoterId,
} from "../services/tagService";

const router = express.Router();

const INVALID_ID_MSG = "id must be a valid uuid";
const INVALID_NAME_MSG = "name must be 2 or more characters";
const INVALID_VOTER_TAG_ID_MSG = "voterTagId must be a valid uuid";
const INVALID_VOTER_ID = "voterId must be a valid uuid";

const validateGetVoterId = (req: Request): void => {
  const { id } = req.params;
  if (!id || !uuidValidate(id)) {
    throw new InvalidParamsError([INVALID_VOTER_ID]);
  }
};

const validateAddTag = (req: Request): void => {
  const { params, body } = req;
  const invalidParams = [];

  if (!params.id || !uuidValidate(params.id)) {
    invalidParams.push(INVALID_ID_MSG);
  }
  if (!body.name || body.name.length <= 2) {
    invalidParams.push(INVALID_NAME_MSG);
  }
  if (invalidParams.length > 0) {
    throw new InvalidParamsError(invalidParams);
  }
};

const validateRemoveTag = (req: Request): void => {
  const { params, body } = req;
  const invalidParams = [];

  if (!params.id || !uuidValidate(params.id)) {
    invalidParams.push(INVALID_ID_MSG);
  }
  if (!body.voterTagId || !uuidValidate(body.voterTagId)) {
    invalidParams.push(INVALID_VOTER_TAG_ID_MSG);
  }
  if (invalidParams.length > 0) {
    throw new InvalidParamsError(invalidParams);
  }
};

const validateUpdateVoter = (req: Request): void => {
  const { params, body } = req;
  const invalidParams = [];
  if (!params.id || !uuidValidate(params.id)) {
    invalidParams.push(INVALID_ID_MSG);
  }
  const attributes = ['lastName', 'address1', 'address2', 'city', 'state', 'zip'];
  attributes.forEach(attr => {
    if (!body[attr] || body[attr].length < 2) {
      invalidParams.push(`${attr} must be 2 or more characters`);
    }
  });
  if (!body.firstName) {
    invalidParams.push('firstName must be 1 or more characters');
  }
  if (invalidParams.length > 0) {
    throw new InvalidParamsError(invalidParams);
  }
}

router.get(
  "/tags",
  wrapAsyncRoute(async (req: Request, res: Response) => {
    const { dbPool } = req.app.locals;
    await withTransaction(dbPool, async (client) => {
      const allTags = await getAllTags(client);
      res.json({ tags: allTags });
    });
  })
);

router.get(
  "/tags/search",
  wrapAsyncRoute(async (req: Request, res: Response) => {
    const { dbPool } = req.app.locals;

    const text = (req.query.text as string) ?? '';
    await withTransaction(dbPool, async (client) => {
      const tags = await getTagsContainingText(client, text);
      res.json({ tags: tags });
    });
  })
)

router.get(
  "/:id",
  wrapAsyncRoute(async (req: Request, res: Response) => {
    validateGetVoterId(req);

    const { id } = req.params;
    const { dbPool } = req.app.locals;

    await withTransaction(dbPool, async (client) => {
      const voter = await getVoterById(client, id);
      if (!voter) {
        throw new VoterNotFoundError(id);
      }
      const tags = await getVoterTagsByVoterId(client, id);
      res.json({ voter: voter, tags: tags });
    });
  })
);

router.post(
  "/:id/addTag",
  wrapAsyncRoute(async (req: Request, res: Response) => {
    validateAddTag(req);

    const { params, body } = req;
    const { dbPool } = req.app.locals;
    const tagName = body.name,
      voterId = params.id;

    await withTransaction(dbPool, async (client) => {
      const voter = await getVoterById(client, voterId);
      if (!voter) {
        throw new VoterNotFoundError(voterId);
      }
      const tag = await addVoterTag(client, { voterId, name: tagName });
      res.json({ ...tag });
    });
  })
);

router.post(
  "/:id/removeTag",
  wrapAsyncRoute(async (req: Request, res: Response) => {
    validateRemoveTag(req);

    const { params, body } = req;
    const voterTagId = body.voterTagId,
      voterId = params.id;
    const { dbPool } = req.app.locals;

    await withTransaction(dbPool, async (client) => {
      const voter = await getVoterById(client, voterId);
      if (!voter) {
        throw new VoterNotFoundError(voterId);
      }
      await removeVoterTag(client, voterTagId);
      res.json({ voterTagId });
    });
  })
);

router.post(
  "/:id/update",
  wrapAsyncRoute(async (req: Request, res: Response) => {
    validateUpdateVoter(req);
    const { params, body } = req;
    const { dbPool } = req.app.locals;
    const voterId = params.id;
    const { firstName, lastName, address1, address2, city, state, zip } = body;
    await withTransaction(dbPool, async (client) => {
      const voter = await getVoterById(client, voterId);
      if (!voter) {
        throw new VoterNotFoundError(voterId);
      }
      const voterForUpdate: UpdateVoter = {
        id: voterId, firstName, lastName, address1, address2, city, state, zip
      }
      const update = await updateVoter(client, voterForUpdate);
      return res.json(update);
    })
  })
)

router.delete(
  "/:id",
  wrapAsyncRoute(async (req: Request, res: Response) => {
    validateGetVoterId(req);
    const { id } = req.params;
    const { dbPool } = req.app.locals;
    await withTransaction(dbPool, async (client) => {
      const voter = await getVoterById(client, id);
      if (!voter) {
        throw new VoterNotFoundError(id);
      }
      await removeVoterTagByVoterId(client, id);
      await deleteVoter(client, id);
    })
    res.json({ id });
  })
)

export default router;
