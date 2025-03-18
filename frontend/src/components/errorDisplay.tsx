import { InvalidParamsError, ServerError, VoterNotFoundError } from "../apiErrors";
import { Typography } from "@mui/material";

export type DisplayErrors = InvalidParamsError | VoterNotFoundError | ServerError;

export function InvalidParamErrorDisplay(error: InvalidParamsError) {
  return error.validationsFailed.map((validation, idx) => (
    <Typography color="red" key={idx}>{validation}</Typography>
  ))
}

export function VoterNotFound(error: VoterNotFoundError) {
  return <Typography color="red">Voter with id {error.voterId} not found</Typography>
}

export function ServerErrorDisplay(error: ServerError) {
  return <Typography color="red">{error.message}</Typography>
}

export function DisplayErrorHelper({ error }: { error: DisplayErrors }) {
  if (error instanceof InvalidParamsError) {
    return InvalidParamErrorDisplay(error);
  } else if (error instanceof VoterNotFoundError) {
    return VoterNotFound(error);
  } else {
    return ServerErrorDisplay(error);
  }
}