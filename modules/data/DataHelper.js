/**
 * The DataHelper provides methods to prepare Documents data.
 */
export default class DataHelper
{
	/**
	 * Cleans up a description by changing all "[[XXX]]" keywords with the corresponding symbols.
	 * @param description {String} The original description.
	 * @returns {String|false} The cleaned-up description, or false if the descriptions are identical.
	 * @private
	 */
	static _getCleanedupDescription(description)
	{
		const matches = [...description.matchAll(new RegExp(/\[\[(\w*)]]/, "g"))].reverse();
		let cleanedUpDescription = description;

		matches.forEach((match, index) => {
			const keyword = match[1].toLowerCase();
			let classes = "";

			if(keyword.startsWith("dchar"))
				classes = " dice characteristic";
			else if(keyword.startsWith("dchal"))
				classes = " dice challenge";
			else if(keyword.startsWith("dco"))
				classes = " dice conservative";
			else if(keyword.startsWith("df"))
				classes = " dice fortune";
			else if(keyword.startsWith("de"))
				classes = " dice expertise";
			else if(keyword.startsWith("dm"))
				classes = " dice misfortune";
			else if(keyword.startsWith("dre"))
				classes = " dice reckless";
			else if(keyword.startsWith("bo"))
				classes = " symbol boon";
			else if(keyword.startsWith("ba"))
				classes = " symbol bane";
			else if(keyword.startsWith("ch"))
				classes = " symbol challenge";
			else if(keyword.startsWith("cs"))
				classes = " symbol chaos-star";
			else if(keyword.startsWith("d"))
				classes = " symbol delay";
			else if(keyword.startsWith("e"))
				classes = " symbol exertion";
			else if(keyword.startsWith("rs"))
				classes = " symbol righteous-success";
			else if(keyword.startsWith("su"))
				classes = " symbol success";
			else if(keyword.startsWith("sc"))
				classes = " symbol sigmars-comet";

			cleanedUpDescription = cleanedUpDescription.slice(0, match.index) +
				'<span class="wfrp3e-font' + classes + '"></span>' +
				cleanedUpDescription.slice(match.index + match[0].length, cleanedUpDescription.length);
		});

		if(cleanedUpDescription === description)
			return false;

		return cleanedUpDescription;
	}
}