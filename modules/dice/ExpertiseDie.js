import WFRP3eDie from "./WFRP3eDie.js";

/** @inheritDoc */
export default class ExpertiseDie extends WFRP3eDie
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