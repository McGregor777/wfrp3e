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
		return mergeObject(super.defaultOptions,
		{
			template: "systems/wfrp3e/templates/applications/actors/character-sheet.hbs",
			width: 932,
			height: 800,
			classes: ["wfrp3e", "sheet", "actor", "character", "character-sheet"],
			dragDrop: [{dragSelector: ".item", dropSelector: null}],
			tabs: [
				{group: "primary", navSelector: ".character-sheet-primary-tabs", contentSelector: ".character-sheet-body", initial: "characteristics"},
				{group: "careers", navSelector: ".character-sheet-career-tabs", contentSelector: ".character-sheet-careers"},
				{group: "talents", navSelector: ".character-sheet-talent-tabs", contentSelector: ".character-sheet-talents", initial: "focus"},
				{group: "actions", navSelector: ".character-sheet-action-tabs", contentSelector: ".character-sheet-actions", initial: "melee"}
			]
		});
	}

	/** @inheritDoc */
	getData()
	{
		const data = super.getData();
		const actor = this.actor;

		this.options.tabs[1].initial = this.actor.system.currentCareer?._id;

		data.actionTypes = CONFIG.WFRP3e.actionTypes;
		data.conditionDurations = CONFIG.WFRP3e.conditionDurations;
		data.characteristics = CONFIG.WFRP3e.characteristics;
		data.diseaseSymptoms = CONFIG.WFRP3e.disease.symptoms;
		data.stances = CONFIG.WFRP3e.stances;
		data.symbols = CONFIG.WFRP3e.symbols;
		data.weaponGroups = CONFIG.WFRP3e.weapon.groups;
		data.weaponQualities = CONFIG.WFRP3e.weapon.qualities;
		data.weaponRanges = CONFIG.WFRP3e.weapon.ranges;

		data.items = this._buildItemLists(data);
		data.talentSocketsByType = this._buildTalentSocketsList();

		// Add basic skills to the Character.
		if(actor.type === "character" && data.items.skills.length === 0) {
			new Dialog({
				title: game.i18n.localize("APPLICATION.TITLE.BasicSkillsAdding"),
				content: "<p>" + game.i18n.format("APPLICATION.DESCRIPTION.BasicSkillsAdding", {actor: actor.name}) + "</p>",
				buttons: {
					confirm: {
						icon: '<span class="fa fa-check"></span>',
						label: game.i18n.localize("APPLICATION.BUTTON.AddBasicSkills"),
						callback: async dlg => {
							const basicSkills = await game.packs.get("wfrp3e.items").getDocuments({type: "skill", system: {advanced: false}});

							await Item.createDocuments(basicSkills, {parent: actor});
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

		html.find(".current-career-input").click(this._onCurrentCareerInput.bind(this));

		html.find(".impairment .token")
			.click(this._onImpairmentTokenLeftClick.bind(this))
			.contextmenu(this._onImpairmentTokenRightClick.bind(this));

		html.find(".flip-link").mousedown(this._onFlipClick.bind(this));
		html.find(".quantity-link").mousedown(this._onQuantityClick.bind(this));
		html.find(".item-edit-link").click(this._onItemEdit.bind(this));
		html.find(".item-delete-link").click(this._onItemDelete.bind(this));
		html.find(".item-name-link").click(this._onItemLeftClick.bind(this));
		html.find(".item-name-link").contextmenu(this._onItemRightClick.bind(this));
		html.find(".item-input").change(this._onItemInput.bind(this));
		html.find(".recharge-token").mousedown(this._onRechargeTokenClick.bind(this));
		html.find(".skill-training-level-input").change(this._onSkillTrainingLevelChange.bind(this));
		html.find(".stance-meter-segment").click(this._onStanceMeterSegmentClick.bind(this));
	}

	/**
	 * Returns items sorted by type.
	 * @param {Object} data The Actor data
	 */
	_buildItemLists(data)
	{
		const sortedItems = data.items.sort(function(a, b) {
			if(a.name < b.name)
				return -1;
			else if(a.name > b.name)
				return 1;
			else
				return 0;
		});

		const actions = sortedItems.filter(item => item.type === "action");
		const talents = sortedItems.filter(item => item.type === "talent");

		const items = {
			abilities: sortedItems.filter(item => item.type === "ability"),
			actions: {
				melee: actions.filter(item => item.system.type === "melee"),
				ranged: actions.filter(item => item.system.type === "ranged"),
				support: actions.filter(item => item.system.type === "support"),
				blessing: actions.filter(item => item.system.type === "blessing"),
				spell: actions.filter(item => item.system.type === "spell")
			},
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
			talents: {
				focus: talents.filter(item => item.system.type === "focus"),
				reputation: talents.filter(item => item.system.type === "reputation"),
				tactic: talents.filter(item => item.system.type === "tactic"),
				faith: talents.filter(item => item.system.type === "faith"),
				order: talents.filter(item => item.system.type === "order"),
				trick: talents.filter(item => item.system.type === "trick")
			},
			trappings: sortedItems.filter(item => item.type === "trapping"),
			weapons: sortedItems.filter(item => item.type === "weapon")
		};

		return items;
	}

	/**
	 * Builds up the list of Talent Sockets available for the Actor by Talent type.
	 * @private
	 */
	_buildTalentSocketsList()
	{
		let talentSocketsByType = {};

		for(const talentType of Object.keys(CONFIG.WFRP3e.talentTypes)) {
			talentSocketsByType[talentType] = {};
		}

		if(this.actor.system.currentCareer) {
			this.actor.system.currentCareer.system.talentSockets.forEach((talentSocket, index) => {
				const talent = this.actor.itemTypes.talent.find(talent => talent.system.talentSocket === "career_" + this.actor.system.currentCareer._id + "_" + index);

				talentSocketsByType[talentSocket]["career_" + this.actor.system.currentCareer._id + "_" + index] = this.actor.system.currentCareer.name +
					(talent ? " (" + talent.name + ")" : " (" + game.i18n.localize("TALENT.FreeSocket") + ")");
			});
		}

		if(this.actor.system.currentParty) {
			this.actor.system.currentParty.system.talentSockets.forEach((talentSocket, index) => {
				let talent = null;

				for(const member of this.actor.system.currentParty.memberActors) {
					talent = member.itemTypes.talent.find(talent => talent.system.talentSocket === "party_" + this.actor.system.currentParty._id + "_" + index);

					if(talent)
						break;
				}

				talentSocketsByType[talentSocket]["party_" + this.actor.system.currentParty._id + "_" + index] = this.actor.system.currentParty.name +
					(talent ? " (" + (talent.actor ? talent.actor.name + " - " : "") + talent.name + ")" : " (" + game.i18n.localize("TALENT.FreeSocket") + ")");
			});
		}

		return talentSocketsByType;
	}

	/**
	 * Get an Item's id from a clicked element hierarchy.
	 * @param {MouseEvent} event
	 * @private
	 */
	_getItemId(event)
	{
		return $(event.currentTarget).parents(".item").attr("data-item-id");
	}

	/**
	 * Performs follow-up operations after clicks on a Career sheet's current radiobox.
	 * @param {MouseEvent} event
	 * @private
	 */
	_onCurrentCareerInput(event)
	{
		this.actor.items.get(this._getItemId(event)).update({"system.current": true});
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
	 * Performs follow-up operations after clicks on a Trapping's quantity button.
	 * @param {MouseEvent} event
	 * @private
	 */
	_onQuantityClick(event)
	{
		const clickedItem = this.actor.items.get(this._getItemId(event));
		let quantity = clickedItem.data.data.quantity;

		switch(event.button) {
			// If left click...
			case 0:
				// If ctrl key is pushed, add 10
				if(event.ctrlKey)
					quantity += 10;
				// Else, add 1
				else
					quantity++;
				break;
			// If right click...
			case 2:
				// If ctrl key is pushed, remove 10
				if(event.ctrlKey)
					quantity -= 10;
				// Else, remove 1
				else
					quantity--;
				// Floor quantity to 0
				if(quantity < 0)
					quantity = 0;
				break;
		}

		clickedItem.update({"system.quantity": quantity});
	}

	/**
	 * Performs follow-up operations after clicks on an Item edit button.
	 * @param {MouseEvent} event
	 * @private
	 */
	_onItemEdit(event)
	{
		return this.actor.items.get(this._getItemId(event)).sheet.render(true);
	}

	/**
	 * Performs follow-up operations after clicks on an Item delete button.
	 * @param {MouseEvent} event
	 * @private
	 */
	_onItemDelete(event)
	{
		const clickedItem = this.actor.items.get(this._getItemId(event));

		new Dialog({
			title: game.i18n.localize("APPLICATION.TITLE.DeleteItemConfirmation"),
			content: "<p>" + game.i18n.format("APPLICATION.DESCRIPTION.DeleteItemConfirmation", {item: clickedItem.name}) + "</p>",
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
		const options = {};
		const face = $(event.currentTarget).parents(".face").data("face");

		if(face)
			options.face = face;

		this.actor.items.get(this._getItemId(event)).useItem(options);
	}

	/**
	 * Performs follow-up operations after right-clicks on an Item button.
	 * @param {MouseEvent} event
	 * @private
	 */
	async _onItemRightClick(event)
	{
		this.actor.items.get(this._getItemId(event)).sheet.render(true);
	}

	/**
	 * Performs follow-up operations after inputs on an Item.
	 * @param {Event} event
	 * @private
	 */
	_onItemInput(event)
	{
		const item = this.actor.items.get(this._getItemId(event));
		const property = event.currentTarget.dataset.path;
		let value = event.target.value;

		if(value === "on")
			value = true;

		item.update({[property]: value});
	}

	/**
	 * Performs follow-up operations after clicks on a Card's recharge token button.
	 * @param {MouseEvent} event
	 * @private
	 */
	_onRechargeTokenClick(event)
	{
		const clickedItem = this.actor.items.get(this._getItemId(event));
		let rechargeTokens = clickedItem.system.rechargeTokens;

		switch(event.button) {
			// If left click...
			case 0:
				rechargeTokens++;
				break;
			// If right click...
			case 2:
				rechargeTokens--;
				// Floor recharge tokens to 0
				if(rechargeTokens < 0)
					rechargeTokens = 0;
				break;
		}

		clickedItem.update({"system.rechargeTokens": rechargeTokens});
	}

	/**
	 * Performs follow-up operations after clicks on a Skill's training level checkbox.
	 * @param {Event} event
	 * @private
	 */
	async _onSkillTrainingLevelChange(event)
	{
		event.preventDefault();

		const clickedItem = this.actor.items.get($(event.currentTarget).parents("tr").attr("data-item-id"));

		if(event.target.defaultChecked)
			clickedItem.update({"system.trainingLevel": Number(event.target.value - 1)});
		else
			clickedItem.update({"system.trainingLevel": Number(event.target.value)});
	}

	/**
	 * Performs follow-up operations after clicks on a Stance meter's segment.
	 * @param {MouseEvent} event
	 * @private
	 */
	async _onStanceMeterSegmentClick(event)
	{
		event.preventDefault();

		this.actor.update({"system.stance.current": parseInt($(event.currentTarget).find("input")[0].value)});
	}
}