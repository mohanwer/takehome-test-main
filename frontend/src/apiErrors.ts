export class ApiError extends Error {
  constructor(message: string, name: string = "ApiError") {
    super(message);
    this.name = name;
  }
}

export class InvalidParamsError extends ApiError {
  public readonly validationsFailed: string[];
  public readonly validationsJoined: string;

  constructor(message: string, validationsFailed: string[]) {
    super(message, "InvalidParamsError");
    this.validationsFailed = validationsFailed;
    this.validationsJoined = validationsFailed.join(" ");
  }
}

export class VoterNotFoundError extends ApiError {
  public readonly voterId: string;

  constructor(message: string, voterId: string) {
    super(message, "VoterNotFoundError");
    this.voterId = voterId;
  }
}

export class ServerError extends ApiError {
  constructor(message: string) {
    super(message, "ServerError");
  }
}