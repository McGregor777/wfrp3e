import {capitalize} from "../../helpers.js";

/**
 * Provides the data and general interaction with Actor Sheets - Abstract class.
 * WFRP3CharacterSheet provides the general interaction and data organization shared among all actors sheets, as this is an abstract class, inherited by either Character or NPC specific actors sheet classes. When rendering an actors sheet, getData() is called, which is a large and key that prepares the actors data for display, processing the raw data and items and compiling them into data to display on the sheet. Additionally, this class contains all the main events that respond to sheet interaction in activateListeners()
 * @see WFRP3CharacterSheet - Data and main computation model (this.actors)
 */
export default class WFRP3eCharacterSheet extends ActorSheet
{
	/** @inheritDoc */
	static get defaultOptions()
	{
		return {
			...super.defaultOptions,
			template: "systems/wfrp3e/templates/applications/actors/character-sheet.hbs",
			width: 932,
			height: 815,
			classes: ["wfrp3e", "sheet", "actor", "character", "character-sheet"],
			dragDrop: [{dragSelector: ".item", dropSelector: null}],
			tabs: [
				{group: "primary", navSelector: ".primary-tabs", contentSelector: ".character-sheet-body", initial: "characteristics"},
				{group: "careers", navSelector: ".character-sheet-career-tabs", contentSelector: ".character-sheet-careers"},
				{group: "talents", navSelector: ".character-sheet-talent-tabs", contentSelector: ".character-sheet-talents", initial: "focus"},
				{group: "actions", navSelector: ".character-sheet-action-tabs", contentSelector: ".character-sheet-actions", initial: "melee"},
				{group: "abilities", navSelector: ".character-sheet-ability-tabs", contentSelector: ".character-sheet-abilities", initial: "ability"}
			]
		};
	}

	/** @inheritDoc */
	getData()
	{
		const data = {
			...super.getData(),
			actionTypes: CONFIG.WFRP3e.actionTypes,
			conditionDurations: CONFIG.WFRP3e.conditionDurations,
			characteristics: CONFIG.WFRP3e.characteristics,
			diseaseSymptoms: CONFIG.WFRP3e.disease.symptoms,
			origins: Object.values(CONFIG.WFRP3e.availableRaces).reduce((origins, race) => {
				Object.entries(race.origins).forEach(origin => origins[origin[0]] = origin[1]);
				return origins;
			}, {}),
			stances: CONFIG.WFRP3e.stances,
			symbols: CONFIG.WFRP3e.symbols,
			talentTypes: CONFIG.WFRP3e.talentTypes,
			weaponGroups: CONFIG.WFRP3e.weapon.groups,
			weaponQualities: CONFIG.WFRP3e.weapon.qualities,
			weaponRanges: CONFIG.WFRP3e.weapon.ranges,
			talentSocketsByType: this._buildTalentSocketsList()
		};
		data.items = this._buildItemLists(data.items);

		this.options.tabs[1].initial = this.actor.system.currentCareer?._id;

		// Add basic skills to the Character.
		if(this.actor.type === "character" && data.items.skills.length === 0) {
			new Dialog({
				title: game.i18n.localize("APPLICATION.TITLE.BasicSkillsAdding"),
				content: "<p>" + game.i18n.format("APPLICATION.DESCRIPTION.BasicSkillsAdding", {actor: this.actor.name}) + "</p>",
				buttons: {
					confirm: {
						icon: '<span class="fa fa-check"></span>',
						label: game.i18n.localize("APPLICATION.BUTTON.BasicSkillsAdding"),
						callback: async dlg => {
							const basicSkills = await game.packs.get("wfrp3e.items").getDocuments({type: "skill", system: {advanced: false}});

							await Item.createDocuments(basicSkills, {parent: this.actor});
						}
					},
					cancel: {
						icon: '<span class="fas fa-xmark"></span>',
						label: game.i18n.localize("Ignore")
					},
				},
				default: 'confirm'
			}).render(true);
		}

		console.log(data)

		return data;
	}

	/** @inheritDoc */
	activateListeners(html)
	{
		super.activateListeners(html);

		html.find(".advance-checkbox").change(this._onAdvanceCheckboxChange.bind(this));

		html.find(".characteristic a").click(this._onCharacteristicLink.bind(this));

		html.find(".current-career-input").click(this._onCurrentCareerInput.bind(this));

		html.find(".impairment .token")
			.click(this._onImpairmentTokenLeftClick.bind(this))
			.contextmenu(this._onImpairmentTokenRightClick.bind(this));

		html.find(".flip-link").click(this._onFlipClick.bind(this));

		html.find(".item-roll-link").click(this._onItemRoll.bind(this));
		html.find(".item-expand-link").click(this._onItemExpandClick.bind(this));
		html.find(".item-edit-link").click(this._onItemEdit.bind(this));
		html.find(".item-delete-link").click(this._onItemDelete.bind(this));

		html.find(".item-name-link")
			.click(this._onItemLeftClick.bind(this))
			.contextmenu(this._onItemRightClick.bind(this));

		html.find(".item-input").change(this._onItemInput.bind(this));

		html.find(".quantity-link")
			.click(this._onQuantityLeftClick.bind(this))
			.contextmenu(this._onQuantityRightClick.bind(this));

		html.find(".recharge-token")
			.click(this._onRechargeTokenLeftClick.bind(this))
			.contextmenu(this._onRechargeTokenRightClick.bind(this));

		html.find(".skill-training-level-input").change(this._onSkillTrainingLevelChange.bind(this));
	}

	/**
	 * Returns items sorted by type.
	 * @param {Array} items The items owned by the Actor.
	 * @returns {Object} The sorted items owned by the Actor.
	 * @private
	 */
	_buildItemLists(items)
	{
		const basicTrait = game.i18n.localize("ACTION.TRAITS.Basic");
		const sortedItems = items.sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
		const actions = sortedItems.filter(item => item.type === "action").sort((a, b) => {
			if(a.system.conservative.traits.includes(basicTrait) && !b.system.conservative.traits.includes(basicTrait))
				return -1;
			else if(!a.system.conservative.traits.includes(basicTrait) && b.system.conservative.traits.includes(basicTrait))
				return 1
			else
				return 0;
		});
		const talents = sortedItems.filter(item => item.type === "talent");

		return {
			abilities: sortedItems.filter(item => item.type === "ability"),
			actions: Object.keys(CONFIG.WFRP3e.actionTypes).reduce((sortedActions, actionType) => {
				sortedActions[actionType] = actions.filter(action => action.system.type === actionType);
				return sortedActions;
			}, {}),
			armours: sortedItems.filter(item => item.type === "armour"),
			careers: sortedItems.filter(item => item.type === "career"),
			conditions: sortedItems.filter(item => item.type === "condition"),
			criticalWounds: sortedItems.filter(item => item.type === "criticalWound"),
			diseases: sortedItems.filter(item => item.type === "disease"),
			insanities: sortedItems.filter(item => item.type === "insanity"),
			miscasts: sortedItems.filter(item => item.type === "miscast"),
			money: sortedItems.filter(item => item.type === "money"),
			mutations: sortedItems.filter(item => item.type === "mutation"),
			skills: sortedItems.filter(item => item.type === "skill"),
			talents: Object.keys(CONFIG.WFRP3e.talentTypes).reduce((sortedTalents, talentType) => {
				sortedTalents[talentType] = talents.filter(talent => talent.system.type === talentType);
				return sortedTalents;
			}, {}),
			trappings: sortedItems.filter(item => item.type === "trapping"),
			weapons: sortedItems.filter(item => item.type === "weapon")
		};
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
	 * Get an Item's id from a clicked element hierarchy.
	 * @param {MouseEvent} event
	 * @private
	 */
	_getItemById(event)
	{
		return this.actor.items.get(event.currentTarget.dataset.itemId ?? $(event.currentTarget).parents(".item").data("itemId"));
	}

	/**
	 * Performs follow-up operations after changes on Advance checkbox.
	 * @param {Event} event
	 * @private
	 */
	_onAdvanceCheckboxChange(event)
	{
		if(this.actor.system.experience.current > 0) {
			const career = this._getItemById(event);

			if(event.currentTarget.checked) {
				event.currentTarget.checked = false;
				this.actor.buyAdvance(career, event.currentTarget.dataset.type);
			}
			else {
				const updates = {system: {advances: career.system.advances}};

				if(isNaN(event.currentTarget.dataset.type))
					updates.system.advances[event.currentTarget.dataset.type] = "";
				else
					updates.system.advances.open[event.currentTarget.dataset.type] = "";

				career.update(updates);
			}
		}
		else {
			event.currentTarget.checked = false;
			ui.notifications.warn(game.i18n.localize("CHARACTER.SHEET.NoExperienceLeft"));
		}
	}

	/**
	 * Performs follow-up operations after clicks on a Characteristic link.
	 * @param {MouseEvent} event
	 * @private
	 */
	_onCharacteristicLink(event)
	{
		this.actor.performCharacteristicCheck(event.currentTarget.dataset.characteristic);
	}

	/**
	 * Performs follow-up operations after clicks on a Career sheet's current radiobox.
	 * @param {MouseEvent} event
	 * @private
	 */
	_onCurrentCareerInput(event)
	{
		this._getItemById(event).update({"system.current": true});
	}

	/**
	 * Performs follow-up operations after left-clicks on an impairment token.
	 * @param {MouseEvent} event
	 * @private
	 */
	_onImpairmentTokenLeftClick(event)
	{
		this.actor.changeImpairment(event.currentTarget.dataset.impairment, 1);
	}

	/**
	 * Performs follow-up operations after right-clicks on an impairment token.
	 * @param {MouseEvent} event
	 * @private
	 */
	_onImpairmentTokenRightClick(event)
	{
		this.actor.changeImpairment(event.currentTarget.dataset.impairment, -1);
	}

	/**
	 * Performs follow-up operations after clicks on a sheet's flip button.
	 * @param {MouseEvent} event
	 * @private
	 */
	async _onFlipClick(event)
	{
		event.preventDefault();

		const parent = $(event.currentTarget).parents(".item");
		const activeFace = parent.find(".face.active");
		const inactiveFace = parent.find(".face:not(.active)");

		activeFace.removeClass("active");
		inactiveFace.addClass("active");
	}

	/**
	 * Performs follow-up operations after left-clicks on a Trapping's quantity button.
	 * @param {MouseEvent} event
	 * @private
	 */
	_onQuantityLeftClick(event)
	{
		const item = this._getItemById(event);

		item.update({"system.quantity": item.system.quantity + (event.ctrlKey ? 10 : 1)});
	}

	/**
	 * Performs follow-up operations after right-clicks on a Trapping's quantity button.
	 * @param {MouseEvent} event
	 * @private
	 */
	_onQuantityRightClick(event)
	{
		const item = this._getItemById(event);
		let quantity = item.system.quantity - (event.ctrlKey ? 10 : 1);

		// Floor quantity to 0
		if(quantity < 0)
			quantity = 0;

		item.update({"system.quantity": quantity});
	}

	/**
	 * Performs follow-up operations after clicks on an Item roll button.
	 * @param {MouseEvent} event
	 * @private
	 */
	_onItemRoll(event)
	{
		const options = {};
		const face = $(event.currentTarget).parents(".face").data("face");

		if(face)
			options.face = face;

		this._getItemById(event).useItem(options);
	}

	/**
	 * Performs follow-up operations after clicks on an Item edit button.
	 * @param {MouseEvent} event
	 * @private
	 */
	_onItemEdit(event)
	{
		return this._getItemById(event).sheet.render(true);
	}

	/**
	 * Performs follow-up operations after clicks on an Item delete button.
	 * @param {MouseEvent} event
	 * @private
	 */
	_onItemDelete(event)
	{
		const clickedItem = this._getItemById(event);

		new Dialog({
			title: game.i18n.localize("APPLICATION.TITLE.DeleteItem"),
			content: "<p>" + game.i18n.format("APPLICATION.DESCRIPTION.DeleteItem", {item: clickedItem.name}) + "</p>",
			buttons: {
				confirm: {
					icon: '<span class="fa fa-check"></span>',
					label: game.i18n.localize("Yes"),
					callback: async dlg => {
						await this.actor.deleteEmbeddedDocuments("Item", [clickedItem._id]);
						li.slideUp(200, () => this.render(false));
					}
				},
				cancel: {
					icon: '<span class="fas fa-xmark"></span>',
					label: game.i18n.localize("Cancel")
				},
			},
			default: "confirm"
		}).render(true);
	}

	/**
	 * Performs follow-up operations after left-clicks on an Item button.
	 * @param {MouseEvent} event
	 * @private
	 */
	async _onItemLeftClick(event)
	{
		event.stopPropagation();

		const options = {};
		const face = $(event.currentTarget).parents(".face").data("face");

		if(face)
			options.face = face;

		this._getItemById(event).useItem(options);
	}

	/**
	 * Performs follow-up operations after right-clicks on an Item button.
	 * @param {MouseEvent} event
	 * @private
	 */
	async _onItemRightClick(event)
	{
		this._getItemById(event).sheet.render(true);
	}

	/**
	 * Performs follow-up operations after inputs on an Item.
	 * @param {Event} event
	 * @private
	 */
	_onItemInput(event)
	{
		event.preventDefault();
		event.stopPropagation();

		const item = this._getItemById(event);
		const propertyPath = event.currentTarget.dataset.path;
		let value = event.target.value;

		if(event.currentTarget.type === "checkbox" && !event.currentTarget.checked)
			value = false;
		if(value === "on")
			value = true;

		// Additional process needed for updates on Arrays.
		let itemProperty = item;
		for(let i = 0, path = propertyPath.split('.'), length = path.length; i < length; i++)
			itemProperty = itemProperty[path[i]];

		if(itemProperty instanceof Array) {
			const index = event.currentTarget.dataset.index;
			const subProperty = event.currentTarget.dataset.property;

			subProperty ? itemProperty[index][subProperty] = value : itemProperty[index] = value;

			item.update({[propertyPath]: itemProperty});
		}
		else
			item.update({[propertyPath]: value});
	}

	/**
	 * Performs follow-up operations after left-clicks on a Card's recharge token button.
	 * @param {MouseEvent} event
	 * @private
	 */
	_onRechargeTokenLeftClick(event)
	{
		const item = this._getItemById(event);

		item.update({"system.rechargeTokens": item.system.rechargeTokens + 1});
	}

	/**
	 * Performs follow-up operations after right-clicks on a Card's recharge token button.
	 * @param {MouseEvent} event
	 * @private
	 */
	_onRechargeTokenRightClick(event)
	{
		const item = this._getItemById(event);
		let rechargeTokens = item.system.rechargeTokens - 1;

		// Floor recharge tokens to 0
		if(rechargeTokens < 0)
			rechargeTokens = 0;

		item.update({"system.rechargeTokens": rechargeTokens});
	}

	/**
	 * Performs follow-up operations after clicks on an item's expand button.
	 * @param {MouseEvent} event
	 * @private
	 */
	_onItemExpandClick(event)
	{
		event.preventDefault();
		event.stopPropagation();

		const itemElement = $(event.currentTarget).hasClass("item")
			? $(event.currentTarget)
			: $(event.currentTarget).parents(".item");
		const item = this._getItemById(event);

		if(itemElement.hasClass("expanded")) {
			// Toggle expansion for an item
			const details = itemElement.children(".details");

			details.slideUp(200, () => details.remove());

			itemElement.find(".item-expand-link .fas").removeClass("fa-chevron-up").addClass("fa-chevron-down");
		}
		else {
			// Add a div with the item's details below the row.
			const detailsElement = $(`<div class="details">${item.getDetails()}</div>`);

			itemElement.append(detailsElement.hide());
			detailsElement.slideDown(200);

			itemElement.find(".item-expand-link .fas").removeClass("fa-chevron-down").addClass("fa-chevron-up");
		}

		itemElement.toggleClass("expanded");
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