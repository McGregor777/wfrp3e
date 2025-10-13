import AbstractSelector from "./AbstractSelector.js";

/** @inheritDoc */
export default class TalentSelector extends AbstractSelector
{
	/** @inheritDoc */
	constructor(options = {})
	{
		super(options);

		this.talentTypes = Object.entries(CONFIG.WFRP3e.talentTypes).reduce((types, [key, value]) => {
			if(options.types.includes(key))
				types[key] = value;
			return types;
		}, {});
	}

	/** @inheritDoc */
	static DEFAULT_OPTIONS = {
		id: "talent-selector-{id}",
		classes: ["talent-selector"],
		window: {title: "TALENTSELECTOR.title"}
	};

	/** @inheritDoc */
	type = "talent";

	/** @inheritDoc */
	async _prepareContext(options)
	{
		return {
			...await super._prepareContext(options),
			buttons: [{type: "submit", icon: "fa-solid fa-check", label: "TALENTSELECTOR.ACTIONS.chooseTalent"}]
		};
	}

	/** @inheritDoc */
	async _preparePartContext(partId, context)
	{
		let partContext = await super._preparePartContext(partId, context);

		if(partId === "search")
			partContext.types = {all: "SELECTOR.all", ...this.talentTypes};

		return partContext;
	}

	/**
	 * Builds an array of WFRP3eTalents eligible for an advance, whether non-career or not.
	 * @param {WFRP3eActor} actor The WFRP3eActor buying the advance.
	 * @param {WFRP3eItem} career The WFRP3eCareer owning the advance.
	 * @param {Boolean} [nonCareerAdvance] Whether the advance is a non-career one or not.
	 * @returns {Promise<WFRP3eItem[]>}
	 */
	static async buildAdvanceOptionsList(actor, career, nonCareerAdvance = false)
	{
		const talentTypeFilter = ["focus", "reputation", "tactic", "tricks"].filter(type => {
				return career.system.sockets.map(socket => socket.type).includes(type) !== nonCareerAdvance;
			}),
			  ownedTalentNames = actor.itemTypes.talent.map(talent => talent.name);

		return game.packs.filter(pack => pack.documentName === "Item").reduce(async (talents, pack) => {
			return [
				...await talents,
				...await pack.getDocuments({type: "talent"})
					.then(foundTalents => foundTalents
						.filter(talent => talentTypeFilter.includes(talent.system.type)
							&& !ownedTalentNames.includes(talent.name)))
			];
		}, []);
	}
}