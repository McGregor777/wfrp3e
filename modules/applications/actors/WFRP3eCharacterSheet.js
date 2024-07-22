import WFRP3eActorSheet from "./WFRP3eActorSheet.js";
import {capitalize} from "../../helpers.js";

/** @inheritDoc */
export default class WFRP3eCharacterSheet extends WFRP3eActorSheet
{
	/** @inheritDoc */
	static get defaultOptions()
	{
		return {
			...super.defaultOptions,
			width: 920,
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
			talentSocketsByType: this._buildTalentSocketsList()
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
	_buildTalentSocketsList()
	{
		let talentSocketsByType = {};

		["any", ...Object.keys(CONFIG.WFRP3e.talentTypes), "insanity"].forEach(talentType => {
			talentSocketsByType[talentType] = {};
		});

		if(this.actor.system.currentCareer) {
			this.actor.system.currentCareer.system.talentSockets.forEach((talentSocketName, index) => {
				// Find a potential Talent that would be socketed in that Talent Socket.
				const talent = this.actor.itemTypes.talent.find(talent => talent.system.talentSocket === "career_" + this.actor.system.currentCareer._id + "_" + index);

				talentSocketsByType[talentSocketName]["career_" + this.actor.system.currentCareer._id + "_" + index] =
					this.actor.system.currentCareer.name + (talent
						? " - " + game.i18n.format("TALENT.TakenSocket", {
								type: game.i18n.localize(`TALENT.TYPE.${capitalize(talentSocketName)}`),
								talent: talent.name
							})
						: " - " + game.i18n.format("TALENT.AvailableSocket", {
								type: game.i18n.localize(`TALENT.TYPE.${capitalize(talentSocketName)}`)
							}));
			});
		}

		if(this.actor.system.currentParty) {
			this.actor.system.currentParty.system.talentSockets.forEach((talentSocketName, index) => {
				let talent = null;

				for(const member of this.actor.system.currentParty.memberActors) {
					// Find a potential Talent that would be socketed in that Talent Socket.
					talent = member.itemTypes.talent.find(talent => talent.system.talentSocket === "party_" + this.actor.system.currentParty._id + "_" + index);

					if(talent)
						break;
				}

				talentSocketsByType[talentSocketName]["party_" + this.actor.system.currentParty._id + "_" + index] =
					this.actor.system.currentParty.name + (talent
						? " - " +
							game.i18n.format("TALENT.TakenSocket", {
								type: game.i18n.localize(`TALENT.TYPE.${capitalize(talentSocketName)}`),
								talent: talent.name
							})
						: " - " +
						game.i18n.format("TALENT.AvailableSocket", {
							type: game.i18n.localize(`TALENT.TYPE.${capitalize(talentSocketName)}`)
						}));
			});
		}

		for(const talentType of Object.keys(CONFIG.WFRP3e.talentTypes))
			Object.assign(talentSocketsByType[talentType], talentSocketsByType["any"]);

		return talentSocketsByType;
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