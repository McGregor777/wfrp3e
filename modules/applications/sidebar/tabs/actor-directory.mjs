/** @inheritDoc */
export default class ActorDirectory extends foundry.applications.sidebar.tabs.ActorDirectory
{
	/** @inheritDoc */
	static DEFAULT_OPTIONS = {actions: {generateCharacter: this.#generateCharacter}};

	/** @inheritDoc */
	static PARTS = {
		...super.PARTS,
		header: {template: "systems/wfrp3e/templates/sidebar/directory/actor/header.hbs"}
	};

	/**
	 * Starts the generation of a new character.
	 * @returns {Promise<void>}
	 * @private
	 */
	static async #generateCharacter()
	{
		await new wfrp3e.applications.sidebar.apps.CharacterGenerator.start();
	}
}
