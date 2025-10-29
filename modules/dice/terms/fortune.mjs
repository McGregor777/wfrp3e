import Die from "./die.mjs";

/** @inheritDoc */
export default class FortuneDie extends Die
{
	constructor(termData = {})
	{
		termData.faces = 6;
		super(termData);
	}

	/** @inheritDoc */
	static DENOMINATION = "f";

	static NAME = "fortune";
}
