import express from "express";

export type ErrorTypes =
	| "ApplicationError"
	| "SettingsNotFoundError"
	| "VoterNotFoundError"
	| "InvalidParamsError"
	| "VoterTagAlreadyExistsError";

export abstract class ApplicationError extends Error {
	name: ErrorTypes;

	constructor(message: string) {
		super(message);
		this.name = "ApplicationError";
	}
}

export class SettingsNotFoundError extends ApplicationError {
	settingName: String;

	constructor(name: String) {
		super(`Required environment variable: ${name}`);
		this.settingName = name;
		this.name = "SettingsNotFoundError";
	}
}

export class VoterNotFoundError extends ApplicationError {
	voterId: String;

	constructor(id: String) {
		super(`Voter not found: ${id}`);
		this.voterId = id;
		this.name = "VoterNotFoundError";
	}
}

export class InvalidParamsError extends ApplicationError {
	validationFailureReasons: string[];

	constructor(failureReasons: string[]) {
		super("Invalid params");
		this.validationFailureReasons = failureReasons;
		this.name = "InvalidParamsError";
	}
}

export class VoterTagAlreadyExistsError extends ApplicationError {
	voterId: string;
	tagId: string;

	constructor(voterId: string, tagId: string) {
		super(`Voter already has tag ${tagId}`);
		this.voterId = voterId;
		this.tagId = tagId;
		this.name = "VoterTagAlreadyExistsError";
	}
}

export function errorToResponse(
	err: Error,
	req: express.Request,
	res: express.Response,
	next: express.NextFunction
) {
	if (err.name === "VoterNotFoundError") {
		res.status(404).send({
			message: err.message,
			type: err.name,
			voterId: (err as VoterNotFoundError).voterId,
		});
		return;
	} else if (err.name == "InvalidParamsError") {
		res.status(400).send({
			message: err.message,
			type: err.name,
			validationFailureReasons: (err as InvalidParamsError)
				.validationFailureReasons,
		});
	} else if (err.name === "VoterTagAlreadyExistsError") {
		res.status(400).send({
			message: err.message,
			type: err.name,
			voterId: (err as VoterTagAlreadyExistsError).voterId,
			tagId: (err as VoterTagAlreadyExistsError).tagId,
		});
	} else {
		console.log(err);
		res.status(500).send({ message: "Internal Server Error" });
	}
}
