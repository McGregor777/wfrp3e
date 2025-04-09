import WFRP3eActorSheet from "./WFRP3eActorSheet.js";

/** @inheritDoc */
export default class WFRP3eCharacterSheet extends WFRP3eActorSheet
{
	/** @inheritDoc */
	static get defaultOptions()
	{
		return {
			...super.defaultOptions,
			width: 992,
			height: 840,
			classes: ["wfrp3e", "sheet", "actor", "character", "character-sheet"],
			tabs: [
				{group: "primary", navSelector: ".primary-tabs", contentSelector: ".character-sheet-body", initial: "characteristics"},
				{group: "careers", navSelector: ".character-sheet-career-tabs", contentSelector: ".character-sheet-careers"},
				{group: "talents", navSelector: ".character-sheet-talent-tabs", contentSelector: ".character-sheet-talents", initial: "focus"},
				{group: "actions", navSelector: ".action-tabs", contentSelector: ".actions", initial: "melee"},
				{group: "abilities", navSelector: ".ability-tabs", contentSelector: ".abilities", initial: "ability"}
			]
		};
	}

	/** @inheritDoc */
	getData()
	{
		this.options.tabs[1].initial = this.actor.system.currentCareer?._id;

		return {
			...super.getData(),
			socketsByType: this._buildSocketList()
		};
	}

	/** @inheritDoc */
	activateListeners(html)
	{
		super.activateListeners(html);

		html.find(".advance-checkbox").change(this._onAdvanceCheckboxChange.bind(this));
		html.find(".basic-skills-adding").click(this._onBasicSkillsAddingClick.bind(this));
		html.find(".current-career-input").click(this._onCurrentCareerInput.bind(this));
		html.find(".skill-training-level-input").change(this._onSkillTrainingLevelChange.bind(this));
	}

	/**
	 * Builds up the list of Talent Sockets available for the Actor by Talent type.
	 * @private
	 */
	_buildSocketList()
	{
		const socketsByType = Object.fromEntries(
			["any", ...Object.keys(CONFIG.WFRP3e.talentTypes), "insanity"].map(key => [key, {}])
		);

		this.actor.system.currentCareer?.system.sockets.forEach((socket, index) => {
			// Find a potential Item that would be socketed in that socket.
			const item = this.actor.items.search({
				filters: [{
					field: "system.socket",
					operator: "is_empty",
					negate: true
				}, {
					field: "system.socket",
					operator: "equals",
					negate: false,
					value: `${this.actor.system.currentCareer.uuid}_${index}`
				}]
			})[0];

			socketsByType[socket.type][this.actor.system.currentCareer.uuid + "_" + index] =
				this.actor.system.currentCareer.name + " - " + (item
					? game.i18n.format("TALENT.SOCKET.taken", {
						type: game.i18n.localize(`TALENT.TYPES.${socket.type}`),
						talent: item.name
					})
					: game.i18n.format("TALENT.SOCKET.available", {
						type: game.i18n.localize(`TALENT.TYPES.${socket.type}`)
					}));
		});

		this.actor.system.currentParty?.system.sockets.forEach((socket, index) => {
			let item = null;

			for(const member of this.actor.system.currentParty.memberActors) {
				// Find a potential Item that would be socketed in that socket.
				item = member.items.search({
					filters: [{
						field: "system.socket",
						operator: "is_empty",
						negate: true
					}, {
						field: "system.socket",
						operator: "equals",
						negate: false,
						value: `${this.actor.system.currentParty.uuid}_${index}`
					}]
				})[0];

				if(item)
					break;
			}

			socketsByType[socket.type][this.actor.system.currentParty.uuid + "_" + index] =
				this.actor.system.currentParty.name + " - " + (item
					? game.i18n.format("TALENT.SOCKET.taken", {
						type: game.i18n.localize(`TALENT.TYPES.${socket.type}`),
						talent: item.name
					})
					: game.i18n.format("TALENT.SOCKET.available", {
						type: game.i18n.localize(`TALENT.TYPES.${socket.type}`)
					}));
		});

		for(const itemType of Object.keys(CONFIG.WFRP3e.talentTypes))
			Object.assign(socketsByType[itemType], socketsByType["any"]);

		return socketsByType;
	}

	/**
	 * Performs follow-up operations after changes on advance checkbox.
	 * @param {Event} event
	 * @private
	 */
	_onAdvanceCheckboxChange(event)
	{
		const career = this._getItemById(event),
			  type = event.currentTarget.dataset.type;

		if(event.currentTarget.checked) {
			event.currentTarget.checked = false;
			this.actor.buyAdvance(career, type);
		}
		else
			this.actor.removeAdvance(career, type);
	}

	/**
	 * Performs follow-up operations after clicks on a basic skills adding button.
	 * @param {Event} event
	 * @private
	 */
	async _onBasicSkillsAddingClick(event)
	{
		await Item.createDocuments(
			await game.packs.get("wfrp3e.items").getDocuments({type: "skill", system: {advanced: false}}),
			{parent: this.actor}
		);
	}

	/**
	 * Performs follow-up operations after clicks on a Career sheet's current radiobox.
	 * @param {MouseEvent} event
	 * @private
	 */
	_onCurrentCareerInput(event)
	{
		this.actor.changeCurrentCareer(this._getItemById(event));
	}

	/**
	 * Performs follow-up operations after changes on a Skill's training level checkbox.
	 * @param {Event} event
	 * @private
	 */
	async _onSkillTrainingLevelChange(event)
	{
		event.preventDefault();

		const item = this._getItemById(event);

		if(event.target.defaultChecked)
			item.update({"system.trainingLevel": Number(event.target.value - 1)});
		else
			item.update({"system.trainingLevel": Number(event.target.value)});
	}
}