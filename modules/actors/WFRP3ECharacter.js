/**
 * Provides the main Actor data computation and organization.
 *
 * WFRP3Character contains all the preparation data and methods used for preparing an actor: going through each Owned Item, preparing them for display based on characteristics.
 *
 * @see   WFRP3CharacterSheet - Character sheet class
 */
export default class WFRP3ECharacter extends Actor
{
	/**
	 * Calculates simple dynamic data when actor is updated.
	 */
	prepareDerivedData()
	{
		this.calculateStanceMeter();
		super.prepareDerivedData();
	}

	/**
	 * Calculate stance meter.
	 */
	calculateStanceMeter()
	{
		let stanceMeter =
		{
			conservative: this.system.attributes.stance.conservative,
			reckless: this.system.attributes.stance.reckless
		};

		const currentCareer = this.itemTypes.career.find(career => career.system.current);

		if(currentCareer)
			stanceMeter =
			{
				conservative: this.system.attributes.stance.conservative + currentCareer.system.starting_stance.conservative_segments,
				reckless: this.system.attributes.stance.reckless + currentCareer.system.starting_stance.reckless_segments
			}

		this.stanceMeter = stanceMeter
	}
}