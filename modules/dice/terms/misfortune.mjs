import Die from "./die.mjs";

/** @inheritDoc */
export default class MisfortuneDie extends Die
{
	constructor(termData = {})
	{
		termData.faces = 6;
		super(termData);
	}

	/** @inheritDoc */
	static DENOMINATION = "m";

	static NAME = "misfortune";
}
