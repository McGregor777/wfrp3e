import DiceHelper from "../../dice/DiceHelper.js";

/**
 * Provides the data and general interaction with Actor Sheets - Abstract class.
 * WFRP3CharacterSheet provides the general interaction and data organization shared among all actor sheets, as this is an abstract class, inherited by either Character or NPC specific actor sheet classes. When rendering an actor sheet, getData() is called, which is a large and key that prepares the actor data for display, processing the raw data and items and compiling them into data to display on the sheet. Additionally, this class contains all the main events that respond to sheet interaction in activateListeners()
 * @see WFRP3CharacterSheet - Data and main computation model (this.actor)
 */
export default class WFRP3ECharacterSheet extends ActorSheet
{
	/** @override */
	static get defaultOptions()
	{
		return mergeObject(super.defaultOptions,
		{
			template: "systems/wfrp3e/templates/character-sheet.html",
			width: 932,
			height: 800,
			classes: ["wfrp3e", "sheet", "actor", "character", "character-sheet"],
			tabs:
			[
				{group: "primary", navSelector: ".character-sheet-primary-tabs", contentSelector: ".character-sheet-body", initial: "characteristics"},
				{group: "careers", navSelector: ".character-sheet-career-tabs", contentSelector: ".character-sheet-careers"},
				{group: "talents", navSelector: ".character-sheet-talent-tabs", contentSelector: ".character-sheet-talents", initial: "focus"},
				{group: "actions", navSelector: ".character-sheet-action-tabs", contentSelector: ".character-sheet-actions", initial: "melee"}
			]
		});
	}

	/**
	* Provides the data to the template when rendering the actor sheet
	* This is called when rendering the sheet, where it calls the base actor class to organize, process, and prepare all actor data for display.
	* @returns {Object} data Data given to the template when rendering
	*/
	getData()
	{
		const data = super.getData();

		data.items = this.constructItemLists(data);

		this.options.tabs[1].initial = data.items.careers.find(career => career.system.current);

		data.items["diseases"].forEach((disease) => disease.symptomDescription = game.i18n.localize(CONFIG.WFRP3E.disease.symptoms.descriptions[disease.system.symptom]));

		console.log(this)

		return data;
	}

	/**
	 * Returns items sorted by type.
	 * @param data {Object} The Actor data
	 */
	constructItemLists(data)
	{
		const sortedItems = data.items.sort(function(a, b)
		{
			if(a.name < b.name)
				return -1;
			else if(a.name > b.name)
				return 1;
			else
				return 0;
		});

		const actions = sortedItems.filter(item => item.type === "action");
		const talents = sortedItems.filter(item => item.type === "talent");

		const items =
		{
			skills: sortedItems.filter(item => item.type === "skill"),
			careers: data.items.filter(item => item.type === "career"),
			talents:
			{
				focus: talents.filter(item => item.system.type === "focus"),
				reputation: talents.filter(item => item.system.type === "reputation"),
				tactic: talents.filter(item => item.system.type === "tactic"),
				faith: talents.filter(item => item.system.type === "faith"),
				order: talents.filter(item => item.system.type === "order"),
				trick: talents.filter(item => item.system.type === "trick")
			},
			abilities: sortedItems.filter(item => item.type === "ability"),
			actions:
			{
				melee: actions.filter(item => item.system.conservative.type === "melee"),
				ranged: actions.filter(item => item.system.conservative.type === "ranged"),
				support: actions.filter(item => item.system.conservative.type === "support"),
				blessing: actions.filter(item => item.system.conservative.type === "blessing"),
				spell: actions.filter(item => item.system.conservative.type === "spell")
			},
			conditions: sortedItems.filter(item => item.type === "condition"),
			diseases: sortedItems.filter(item => item.type === "disease"),
			insanities: sortedItems.filter(item => item.type === "insanity"),
			miscasts: sortedItems.filter(item => item.type === "miscast"),
			mutations: sortedItems.filter(item => item.type === "mutation"),
			criticalWounds: sortedItems.filter(item => item.type === "criticalWound"),
			weapons: sortedItems.filter(item => item.type === "weapon"),
			armours: sortedItems.filter(item => item.type === "armour"),
			money: sortedItems.filter(item => item.type === "money"),
			trappings: sortedItems.filter(item => item.type === "trapping")
		};

		return items;
	}

	/**
	 * Activate event listeners using the prepared sheet HTML.
	 * @param html {HTML} The prepared HTML object ready to be rendered into the DOM.
	 */
	activateListeners(html)
	{
		super.activateListeners(html);

		html.find(".item-edit-link").click(this._onItemEdit.bind(this));
		html.find(".item-delete-link").click(this._onItemDelete.bind(this));
		html.find(".item-name-link").mousedown(this._onItemClick.bind(this));
		html.find(".skill-training-level-input").change(this._onChangeSkillTrainingLevel.bind(this));
		html.find(".flip-link").mousedown(this._onFlipClick.bind(this));
		html.find(".quantity-link").mousedown(this._onQuantityClick.bind(this));
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
	 * Handles clicks on an Item edit button.
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
	 * Handles clicks on an Item delete button.
	 * @param event {MouseEvent}
	 * @private
	 */
	_onItemDelete(event)
	{
		const li = $(event.currentTarget).parents(".item")
		const itemId = li.attr("data-item-id");

		renderTemplate("systems/wfrp3e/templates/dialogs/delete-item-dialog.html").then(html =>
		{
			new Dialog(
			{
				title: "Delete Confirmation",
				content: html,
				buttons:
				{
					Yes:
					{
						icon: '<span class="fa fa-check"></span>',
						label: "Yes",
						callback: async dlg =>
						{
							await this.actor.deleteEmbeddedDocuments("Item", [itemId]);
							li.slideUp(200, () => this.render(false));
						}
					},
					cancel:
					{
						icon: '<span class="fas fa-times"></span>',
						label: "Cancel"
					},
				},
				default: "Yes"
			}).render(true)
		});
	}

	/**
	 * Handles clicks on an Item button.
	 * @param event {MouseEvent}
	 * @private
	 */
	async _onItemClick(event)
	{
		// Get clicked Item
		const clickedItemId = this._getItemId(event);
		const clickedItem = this.actor.items.get(clickedItemId);

		switch(event.button)
		{
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
	 * Handles clicks on a Trapping's quantity button.
	 * @param event {MouseEvent}
	 * @private
	 */
	_onQuantityClick(event)
	{
		// Get clicked Item and Item's quantity
		const clickedItemId = this._getItemId(event);
		const clickedItem = this.actor.items.get(clickedItemId);
		let quantity = clickedItem.data.data.quantity;

		switch(event.button)
		{
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
	 * Handles clicks on a Skill's training level checkbox.
	 * @param event {MouseEvent}
	 * @private
	 */
	async _onChangeSkillTrainingLevel(event)
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
	 * Handles clicks on a sheet's flip button.
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
}