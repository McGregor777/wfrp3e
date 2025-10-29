import Die from "./die.mjs";

/** @inheritDoc */
export default class ChallengeDie extends Die
{
	constructor(termData = {})
	{
		termData.faces = 8;
		super(termData);
	}

	/** @inheritDoc */
	static DENOMINATION = "h";

	static NAME = "challenge";
}
