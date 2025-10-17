import CharacterGenerator from "../../CharacterGenerator.js";

/** @inheritDoc */
export default class WFRP3eActorDirectory extends foundry.applications.sidebar.tabs.ActorDirectory
{
	/** @inheritDoc */
	static DEFAULT_OPTIONS = {actions: {generateCharacter: this.#generateCharacter}};

	/** @inheritDoc */
	static PARTS = {
		...super.PARTS,
		header: {template: "systems/wfrp3e/templates/sidebar/directory/actor/header.hbs"}
	};

	/**
	 * Starts the generation of a new WFRP3eCharacter.
	 * @returns {Promise<void>}
	 * @private
	 */
	static async #generateCharacter()
	{
		await new CharacterGenerator().render(true);
	}
}