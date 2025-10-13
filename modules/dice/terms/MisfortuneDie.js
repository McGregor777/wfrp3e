import WFRP3eDie from "./WFRP3eDie.js";

/** @inheritDoc */
export default class MisfortuneDie extends WFRP3eDie
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