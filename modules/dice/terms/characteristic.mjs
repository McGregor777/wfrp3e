import Die from "./die.mjs";

/** @inheritDoc */
export default class CharacteristicDie extends Die
{
	constructor(termData = {})
	{
		termData.faces = 8;
		super(termData);
	}

	/** @inheritDoc */
	static DENOMINATION = "a";

	static NAME = "characteristic";
}
