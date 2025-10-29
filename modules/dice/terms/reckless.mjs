import Die from "./die.mjs";

/** @inheritDoc */
export default class RecklessDie extends Die
{
	constructor(termData = {})
	{
		termData.faces = 10;
		super(termData);
	}

	/** @inheritDoc */
	static DENOMINATION = "r";

	static NAME = "reckless";
}
