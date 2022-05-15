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
	}

	/**
	 * Calculate stance meter.
	 *
	 * @param data {Object}   The Actor data
	 */
	calculateStanceMeter()
	{
		let currentCareer = this.itemTypes.career.find(career => career.data.data.current);

		if(currentCareer)
		{
			this.data.totalStanceMeter =
			{
				conservative: this.data.data.attributes.stance.conservative + currentCareer.data.data.starting_stance.conservative_segments,
				reckless: this.data.data.attributes.stance.reckless + currentCareer.data.data.starting_stance.reckless_segments
			}
		}
	}
}