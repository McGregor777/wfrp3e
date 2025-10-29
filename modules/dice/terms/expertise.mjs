import Die from "./die.mjs";

/** @inheritDoc */
export default class ExpertiseDie extends Die
{
	constructor(termData = {})
	{
		termData.faces = 6;
		termData.modifiers = ["x3"]
		super(termData);
	}

	/** @inheritDoc */
	static DENOMINATION = "e";

	static NAME = "expertise";
}
