import WFRP3eDie from "./WFRP3eDie.js";

/** @inheritDoc */
export default class ChallengeDie extends WFRP3eDie
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