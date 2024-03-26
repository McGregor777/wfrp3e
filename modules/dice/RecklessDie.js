import WFRP3eDie from "./WFRP3eDie.js";

/** @inheritDoc */
export default class RecklessDie extends WFRP3eDie
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