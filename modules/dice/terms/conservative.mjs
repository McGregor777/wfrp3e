import Die from "./die.mjs";

/** @inheritDoc */
export default class ConservativeDie extends Die
{
	constructor(termData = {})
	{
		termData.faces = 10;
		super(termData);
	}

	/** @inheritDoc */
	static DENOMINATION = "o";

	static NAME = "conservative";
}
