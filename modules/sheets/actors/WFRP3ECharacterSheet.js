import DiceHelper from "../../dice/DiceHelper.js";

/**
 * Provides the data and general interaction with Actor Sheets - Abstract class.
 * WFRP3CharacterSheet provides the general interaction and data organization shared among all actor sheets, as this is an abstract class, inherited by either Character or NPC specific actor sheet classes. When rendering an actor sheet, getData() is called, which is a large and key that prepares the actor data for display, processing the raw data and items and compiling them into data to display on the sheet. Additionally, this class contains all the main events that respond to sheet interaction in activateListeners()
 * @see WFRP3CharacterSheet - Data and main computation model (this.actor)
 */
export default class WFRP3ECharacterSheet extends ActorSheet
{
	/** @inheritDoc */
	static get defaultOptions()
	{
		return mergeObject(super.defaultOptions,
		{
			template: "systems/wfrp3e/templates/character-sheet.html",
			width: 932,
			height: 800,
			classes: ["wfrp3e", "sheet", "actor", "character", "character-sheet"],
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

		this.options.tabs[1].initial = this.actor.currentCareer?._id;

		data.items = this._buildItemLists(data);
		data.items["diseases"].forEach((disease) => disease.symptomDescription = game.i18n.localize(CONFIG.WFRP3E.disease.symptoms.descriptions[disease.system.symptom]));
		data.talentSocketsByType = this._buildTalentSocketsList();
		data.characteristics = CONFIG.WFRP3E.characteristics;
		data.conditionDurations = CONFIG.WFRP3E.conditionDurations;
		data.weaponGroups = CONFIG.WFRP3E.weapon.groups;
		data.weaponRanges = CONFIG.WFRP3E.weapon.ranges;

		// Add basic skills to the Character.
		if(actor.type === "character" && data.items.skills.length === 0) {
			new Dialog({
				title: game.i18n.localize("DIALOG.TITLE.BasicSkillsAdding"),
				content: "<p>" + game.i18n.format("DIALOG.DESCRIPTION.BasicSkillsAdding", {actor: actor.name}) + "</p>",
				buttons: {
					confirm: {
						icon: '<span class="fa fa-check"></span>',
						label: game.i18n.localize("DIALOG.BUTTON.AddBasicSkills"),
						callback: async dlg => {
							const basicSkills = await game.packs.get("wfrp3e.skills").getDocuments().then(skills => {
								return skills.filter(skill => !skill.system.advanced);
							});

							await Item.createDocuments(basicSkills, {parent: actor});
						}
					},
					cancel: {
						icon: '<span class="fas fa-times"></span>',
						label: game.i18n.localize("DIALOG.BUTTON.Ignore")
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
		html.find(".flip-link").mousedown(this._onFlipClick.bind(this));
		html.find(".quantity-link").mousedown(this._onQuantityClick.bind(this));
		html.find(".item-edit-link").click(this._onItemEdit.bind(this));
		html.find(".item-delete-link").click(this._onItemDelete.bind(this));
		html.find(".item-name-link").mousedown(this._onItemClick.bind(this));
		html.find(".item-input").change(this._onItemInput.bind(this));
		html.find(".recharge-token").mousedown(this._onRechargeTokenClick.bind(this));
		html.find(".skill-training-level-input").change(this._onSkillTrainingLevelChange.bind(this));
		html.find(".stance-meter-segment").click(this._onStanceMeterSegmentClick.bind(this));
	}

	/**
	 * Returns items sorted by type.
	 * @param data {Object} The Actor data
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
				melee: actions.filter(item => item.system.conservative.type === "melee"),
				ranged: actions.filter(item => item.system.conservative.type === "ranged"),
				support: actions.filter(item => item.system.conservative.type === "support"),
				blessing: actions.filter(item => item.system.conservative.type === "blessing"),
				spell: actions.filter(item => item.system.conservative.type === "spell")
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

		for(const talentType of Object.keys(CONFIG.WFRP3E.talentTypes)) {
			talentSocketsByType[talentType] = {};
		}

		if(this.actor.currentCareer) {
			this.actor.currentCareer.system.talentSockets.forEach((talentSocket, index) => {
				const talent = this.actor.itemTypes.talent.find(talent => talent.system.talentSocket === "career_" + this.actor.currentCareer._id + "_" + index);

				talentSocketsByType[talentSocket]["career_" + this.actor.currentCareer._id + "_" + index] = this.actor.currentCareer.name +
					(talent ? " (" + talent.name + ")" : " (" + game.i18n.localize("TALENT.FreeSocket") + ")");
			});
		}

		if(this.actor.currentParty) {
			this.actor.currentParty.system.talentSockets.forEach((talentSocket, index) => {
				let talent = null;

				for(const member of this.actor.currentParty.memberActors) {
					talent = member.itemTypes.talent.find(talent => talent.system.talentSocket === "party_" + this.actor.currentParty._id + "_" + index);

					if(talent)
						break;
				}

				talentSocketsByType[talentSocket]["party_" + this.actor.currentParty._id + "_" + index] = this.actor.currentParty.name +
					(talent ? " (" + (talent.actor ? talent.actor.name + " - " : "") + talent.name + ")" : " (" + game.i18n.localize("TALENT.FreeSocket") + ")");
			});
		}

		return talentSocketsByType;
	}

	/**
	 * Get an Item's id from a clicked element hierarchy.
	 * @param event {MouseEvent}
	 * @private
	 */
	_getItemId(event)
	{
		return $(event.currentTarget).parents(".item").attr("data-item-id");
	}

	/**
	 * Performs follow-up operations after clicks on a Career sheet's current radiobox.
	 * @param event {MouseEvent}
	 * @private
	 */
	_onCurrentCareerInput(event)
	{
		const career = this.actor.items.get(this._getItemId(event));

		career.update({"system.current": true});
	}

	/**
	 * Performs follow-up operations after clicks on a sheet's flip button.
	 * @param event {MouseEvent}
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
	 * @param event {MouseEvent}
	 * @private
	 */
	_onQuantityClick(event)
	{
		// Get clicked Item and Item's quantity
		const clickedItemId = this._getItemId(event);
		const clickedItem = this.actor.items.get(clickedItemId);
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
	 * @param event {MouseEvent}
	 * @private
	 */
	_onItemEdit(event)
	{
		// Get clicked Item
		const clickedItemId = this._getItemId(event);
		const clickedItem = this.actor.items.get(clickedItemId);

		return clickedItem.sheet.render(true);
	}

	/**
	 * Performs follow-up operations after clicks on an Item delete button.
	 * @param event {MouseEvent}
	 * @private
	 */
	_onItemDelete(event)
	{
		const li = $(event.currentTarget).parents(".item")
		const itemId = li.attr("data-item-id");
		const itemName = this.actor.items.get(itemId).name;

		new Dialog({
			title: game.i18n.localize("DIALOG.TITLE.DeleteItemConfirmation"),
			content: "<p>" + game.i18n.format("DIALOG.DESCRIPTION.DeleteItemConfirmation", {item: itemName}) + "</p>",
			buttons: {
				Yes: {
					icon: '<span class="fa fa-check"></span>',
					label: "Yes",
					callback: async dlg => {
						await this.actor.deleteEmbeddedDocuments("Item", [itemId]);
						li.slideUp(200, () => this.render(false));
					}
				},
				cancel: {
					icon: '<span class="fas fa-times"></span>',
					label: "Cancel"
				},
			},
			default: "Yes"
		}).render(true);
	}

	/**
	 * Performs follow-up operations after clicks on an Item button.
	 * @param event {MouseEvent}
	 * @private
	 */
	async _onItemClick(event)
	{
		// Get clicked Item
		const clickedItemId = this._getItemId(event);
		const clickedItem = this.actor.items.get(clickedItemId);

		switch(event.button) {
			// If left click...
			case 0:
				// If clicked Item is a skill or a weapon, prepare a check
				if(clickedItem.type === "skill")
					await DiceHelper.prepareSkillCheck(clickedItem);
				else if(clickedItem.type === "weapon")
					await DiceHelper.prepareSkillCheck(clickedItem);
				// Else, open the clicked Item's sheet
				else
					clickedItem.sheet.render(true);
				break;
			// If right click, open the clicked Item's sheet
			case 2:
				clickedItem.sheet.render(true);
				break;
		}
	}

	/**
	 * Performs follow-up operations after inputs on an Item.
	 * @param event {Event}
	 * @private
	 */
	_onItemInput(event)
	{
		const item = this.actor.items.get(this._getItemId(event));
		const property = event.currentTarget.name;
		let value = event.target.value;

		if(value === "on")
			value = true;

		item.update({[property]: value});
	}

	/**
	 * Performs follow-up operations after clicks on a Card's recharge token button.
	 * @param event {MouseEvent}
	 * @private
	 */
	_onRechargeTokenClick(event)
	{
		// Get clicked Item and Item's recharge tokens
		const clickedItemId = this._getItemId(event);
		const clickedItem = this.actor.items.get(clickedItemId);
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
	 * @param event {Event}
	 * @private
	 */
	async _onSkillTrainingLevelChange(event)
	{
		event.preventDefault();

		// Get clicked Item
		const clickedItemId = $(event.currentTarget).parents("tr").attr("data-item-id");
		const clickedItem = this.actor.items.get(clickedItemId);

		if(event.target.defaultChecked)
			clickedItem.update({"system.trainingLevel": Number(event.target.value - 1)});
		else
			clickedItem.update({"system.trainingLevel": Number(event.target.value)});
	}

	/**
	 * Performs follow-up operations after clicks on a Stance meter's segment.
	 * @param event {MouseEvent}
	 * @private
	 */
	async _onStanceMeterSegmentClick(event)
	{
		event.preventDefault();

		const newStanceValue = parseInt($(event.currentTarget).find("input")[0].value);

		this.actor.update({"system.attributes.stance.current": newStanceValue});
	}
}