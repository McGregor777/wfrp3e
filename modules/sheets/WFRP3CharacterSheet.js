/**
 * Provides the data and general interaction with Actor Sheets - Abstract class.
 *
 * WFRP3CharacterSheet provides the general interaction and data organization shared among all actor sheets, as this is an abstract class, inherited by either Character or NPC specific actor sheet classes. When rendering an actor sheet, getData() is called, which is a large and key that prepares the actor data for display, processing the raw data and items and compiling them into data to display on the sheet. Additionally, this class contains all the main events that respond to sheet interaction in activateListeners().
 *
 * @see WFRP3CharacterSheet - Data and main computation model (this.actor)
 */
export default class WFRP3CharacterSheet extends ActorSheet
{
	/** @override */
	static get defaultOptions()
	{
		return mergeObject(super.defaultOptions,
		{
			template: "systems/wfrp3e/templates/character-sheet.html",
			width: 930,
			height: 800,
			classes: ["wfrp3e", "sheet", "character"],
			tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "main"}]
		});
	}

	/**
	* Provides the data to the template when rendering the actor sheet
	*
	* This is called when rendering the sheet, where it calls the base actor class to organize, process, and prepare all actor data for display.
	*
	* @returns {Object} data    Data given to the template when rendering
	*/
	getData()
	{
		const data = super.getData();

		data.config = CONFIG.WFRP3E;
		data.items = this.constructItemLists(data);

		return data;
	}

	/**
	 * Returns items sorted by type.
	 *
	 * @param data {Object}   The Actor data
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

		const actions = sortedItems.filter(i => i.type == "action");
		const talents = sortedItems.filter(i => i.type == "talent");

		const items =
		{
			skills: sortedItems.filter(i => i.type == "skill"),
			careers: data.items.filter(i => i.type == "career"),
			talents:
			{
				focus: talents.filter(i => i.system.type == "focus"),
				reputation: talents.filter(i => i.system.type == "reputation"),
				tactic: talents.filter(i => i.system.type == "tactic"),
				faith: talents.filter(i => i.system.type == "faith"),
				order: talents.filter(i => i.system.type == "order"),
				trick: talents.filter(i => i.system.type == "trick")
			},
			abilities: sortedItems.filter(i => i.type == "ability"),
			actions:
			{
				melee: actions.filter(i => i.system.conservative.type == "melee"),
				ranged: actions.filter(i => i.system.conservative.type == "ranged"),
				support: actions.filter(i => i.system.conservative.type == "support"),
				blessing: actions.filter(i => i.system.conservative.type == "blessing"),
				spell: actions.filter(i => i.system.conservative.type == "spell")
			},
			conditions: sortedItems.filter(i => i.type == "condition"),
			diseases: sortedItems.filter(i => i.type == "disease"),
			insanities: sortedItems.filter(i => i.type == "insanity"),
			mutations: sortedItems.filter(i => i.type == "mutations"),
			criticalWounds: sortedItems.filter(i => i.type == "criticalWound"),
			weapons: sortedItems.filter(i => i.type == "weapon"),
			armours: sortedItems.filter(i => i.type == "armour"),
			money: sortedItems.filter(i => i.type == "money"),
			trappings: sortedItems.filter(i => i.type == "trapping")
		};

		return items;
	}

	/**
	 * Activate event listeners using the prepared sheet HTML
	 *
	 * @param html {HTML} The prepared HTML object ready to be rendered into the DOM
	 */
	activateListeners(html)
	{
		super.activateListeners(html);

		html.find(".item_edit_link").click(this._onItemEdit.bind(this));
		html.find(".item_delete_link").click(this._onItemDelete.bind(this));
		html.find(".item_name_link").mousedown(this._onItemClick.bind(this));
		html.find(".skill_training_level_input").change(this._onChangeSkillTrainingLevel.bind(this));
		html.find(".item_type_tab").mousedown(this._onItemTypeTabClick.bind(this));
		html.find(".flip_link").mousedown(this._onFlipClick.bind(this));
		html.find(".quantity_link").mousedown(this._onQuantityClick.bind(this));
	} 

	_getItemId(event)
	{
		return $(event.currentTarget).parents(".item").attr("data-item-id");
	}

	_onItemEdit(event)
	{
		// Get clicked Item
		const clickedItemId = this._getItemId(event);
		const clickedItem = this.actor.items.get(clickedItemId);

		return clickedItem.sheet.render(true);
	}

	_onItemDelete(event)
	{
		const li = $(event.currentTarget).parents(".item")
		const itemId = li.attr("data-item-id");

		renderTemplate("systems/lotc/templates/dialogs/delete-item-dialog.html").then(html =>
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
		})
	}

	async _onItemClick(event)
	{
		// Get clicked Item
		const clickedItemId = this._getItemId(event);
		const clickedItem = this.actor.items.get(clickedItemId);

		switch(event.button)
		{
			// If left click...
			case 0:
				// If clicked Item is a skill or a weapon, start a test
				if(clickedItem.type == "skill" || clickedItem.type == "weapon")
					clickedItem.roll();
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

		clickedItem.update({"data.quantity": quantity});
	}

	async _onChangeSkillTrainingLevel(event)
	{
		event.preventDefault();

		// Get clicked Item
		const clickedItemId = $(event.currentTarget).parents("tr").attr("data-item-id");
		const clickedItem = this.actor.items.get(clickedItemId);

		if(event.target.defaultChecked)
			clickedItem.update({"system.training_level": Number(event.target.value - 1)});
		else
			clickedItem.update({"system.training_level": Number(event.target.value)});
	}

	async _onItemTypeTabClick(event)
	{
		event.preventDefault();

		const type = event.currentTarget.classList[1];
		const parent = $(event.currentTarget).parents(".tab_div");

		parent.find(".item_type_div.active").removeClass("active");
		parent.find(".item_type_div." + type).addClass("active");
	}

	async _onFlipClick(event)
	{
		event.preventDefault();

		const parent = $(event.currentTarget).parents(".item");
		const activeFace = parent.find(".face_div.active");
		const inactiveFace = parent.find(".face_div:not(.active)");

		activeFace.removeClass("active");
		inactiveFace.addClass("active");
	}
}