import Datastore from "nedb";
import fs from "fs";
import gulp from "gulp";
import logger from "fancy-log";
import mergeStream from "merge-stream";
import path from "path";
import prefix from "gulp-autoprefixer";
import less from "gulp-less";
import through2 from "through2";
import yargs from "yargs";

/**
 * Parsed arguments passed in through the command line.
 * @type {object}
 */
const parsedArgs = yargs(process.argv).argv;

/**
 * Folder where the compiled compendium packs should be located relative to the
 * base 5e system folder.
 * @type {string}
 */
const PACK_DESTINATION = "packs";

/**
 * Folder where source JSON files should be located relative to the 5e system folder.
 * @type {string}
 */
const PACK_SOURCE = "packs/source";

/**
 * Cache of DBs so they aren't loaded repeatedly when determining IDs.
 * @type {Object<string,Datastore>}
 */
const DB_CACHE = {};

/**
 * Compiles Less files into CSS files.
 * @returns {any}
 */
function compileLess()
{
	return gulp.src("./styles/less/wfrp3e.less")
		.pipe(less())
		.pipe(prefix({cascade: false}))
		.pipe(gulp.dest("./styles"));
}

/**
 * Watches for any update in Less files and recompiles them into CSS files if updates happened.
 */
function watchUpdates()
{
	gulp.watch("./styles/less/**/*.less", compileLess);
}

/**
 * Removes unwanted flags, permissions, and other data from entries before extracting or compiling.
 * @param {object} data Data for a single entry to clean.
 * @param {object} [options]
 * @param {boolean} [options.clearSourceId] Should the core sourceId flag be deleted.
 */
function cleanPackEntry(data, {clearSourceId= true} = {})
{
	if(data.ownership)
		data.ownership = {default: 0};

	if(clearSourceId)
		delete data.flags?.core?.sourceId;

	if(typeof data.folder === "string")
		data.folder = null;

	delete data.flags?.importSource;
	delete data.flags?.exportSource;

	if(data._stats?.lastModifiedBy)
		data._stats.lastModifiedBy = "wfrp3ebuilder000";

	// Remove empty entries in flags
	if(!data.flags)
		data.flags = {};

	Object.entries(data.flags).forEach(([key, contents]) => {
		if(Object.keys(contents).length === 0 )
			delete data.flags[key];
	});

	if(data.system?.advances !== undefined)
		data.system.advances = {
			action: "",
			talent: "",
			skill: "",
			wound: "",
			open: ["", "", "", "", "", ""],
			careerTransition: {
				"cost": 0,
				"newCareer": ""
			},
			dedicationBonus: "",
			nonCareer: [{
				"cost": 0,
				"nature": ""
			}, {
				"cost": 0,
				"nature": ""
			}]
		};

	if(data.system?.stance?.current !== undefined)
		data.system.stance.current = 0;

	if(data.system?.completed !== undefined)
		data.system.completed = false;

	if(data.system?.current !== undefined)
		data.system.current = false;

	if(data.system?.fortunePool !== undefined)
		data.system.fortunePool = 0;

	if(data.system?.rechargeTokens !== undefined)
		data.system.rechargeTokens = 0;

	if(data.system?.specialisations !== undefined)
		data.system.specialisations = [];

	if(data.system?.talentSocket !== undefined)
		data.system.talentSocket = null;

	if(data.system?.trainingLevel !== undefined)
		data.system.trainingLevel = 0;

	// Remove mystery-man.svg from Actors
	if(["character", "npc"].includes(data.type) && data.img === "icons/svg/mystery-man.svg" ) {
		data.img = "";
		data.prototypeToken.texture.src = "";
	}

	if(data.effects)
		data.effects.forEach(i => cleanPackEntry(i, {clearSourceId: false}));

	if(data.items)
		data.items.forEach(i => cleanPackEntry(i, {clearSourceId: false}));

	if(data.label)
		data.label = cleanString(data.label);

	if(data.name)
		data.name = cleanString(data.name);

	data.sort = 0;
}

/**
 * Removes invisible whitespace characters and normalises single and double-quotes.
 * @param {string} str The string to be cleaned.
 * @returns {string} The cleaned string.
 */
function cleanString(str)
{
	return str.replace(/\u2060/gu, "").replace(/[‘’]/gu, "'").replace(/[“”]/gu, '"');
}

/**
 * Cleans and formats source JSON files, removing unnecessary permissions and flags
 * and adding the proper spacing.
 *
 * - `gulp cleanPacks` - Clean all source JSON files.
 * - `gulp cleanPacks --pack classes` - Only clean the source files for the specified compendium.
 * - `gulp cleanPacks --pack classes --name Barbarian` - Only clean a single item from the specified compendium.
 */
function cleanPacks()
{
	const packName = parsedArgs.pack;
	const entryName = parsedArgs.name?.toLowerCase();
	const folders = fs.readdirSync(PACK_SOURCE, {withFileTypes: true}).filter(file => file.isDirectory() && (!packName || (packName === file.name)));

	const packs = folders.map(folder => {
		logger.info(`Cleaning pack ${folder.name}`);

		return gulp.src(path.join(PACK_SOURCE, folder.name, "/**/*.json")).pipe(through2.obj(async (file, enc, callback) => {
			const json = JSON.parse(file.contents.toString());
			const name = json.name.toLowerCase();

			if(entryName && (entryName !== name))
				return callback(null, file);

			cleanPackEntry(json);

			if(!json._id)
				json._id = await determineId(json, folder.name);

			fs.rmSync(file.path, { force: true });
			fs.writeFileSync(file.path, `${JSON.stringify(json, null, 2)}\n`, { mode: 0o664 });
			callback(null, file);
		}));
	});

	return mergeStream(packs);
}

/**
 * Attempts to find an existing matching ID for an item of this name, otherwise generates a new unique ID.
 * @param {object} data Data for the entry that needs an ID.
 * @param {string} pack Name of the pack to which this item belongs.
 * @returns {Promise<string>} Resolves once the ID is determined.
 */
function determineId(data, pack)
{
	const db_path = path.join(PACK_DESTINATION, `${pack}.db`);

	if(!DB_CACHE[db_path]) {
		DB_CACHE[db_path] = new Datastore({ filename: db_path, autoload: true });
		DB_CACHE[db_path].loadDatabase();
	}

	const db = DB_CACHE[db_path];

	return new Promise((resolve, reject) => {
		db.findOne({ name: data.name }, (err, entry) => {
			if(entry)
				resolve(entry._id);
			else
				resolve(db.createNewId());
		});
	});
}

/**
 * Compile the source JSON files into compendium packs.
 *
 * - `gulp compilePacks` - Compile all JSON files into their NEDB files.
 * - `gulp compilePacks --pack classes` - Only compile the specified pack.
 */
function compilePacks()
{
	const packName = parsedArgs.pack;
	// Determine which source folders to process
	const folders = fs.readdirSync(PACK_SOURCE, {withFileTypes: true}).filter(file => file.isDirectory() && ( !packName || (packName === file.name) ));

	const packs = folders.map(folder => {
		const filePath = path.join(PACK_DESTINATION, `${folder.name}.db`);

		fs.rmSync(filePath, {force: true});

		const db = fs.createWriteStream(filePath, { flags: "a", mode: 0o664 });
		const data = [];

		logger.info(`Compiling pack ${folder.name}`);

		return gulp.src(path.join(PACK_SOURCE, folder.name, "/**/*.json")).pipe(through2.obj((file, enc, callback) => {
			const json = JSON.parse(file.contents.toString());

			cleanPackEntry(json);
			data.push(json);
			callback(null, file);
			}, callback => {
				data.sort((lhs, rhs) => lhs._id > rhs._id ? 1 : -1);
				data.forEach(entry => db.write(`${JSON.stringify(entry)}\n`));
				callback();
			}
		));
	});

	return mergeStream(packs);
}

/**
 * Extract the contents of compendium packs to JSON files.
 *
 * - `gulp extractPacks` - Extract all compendium NEDB files into JSON files.
 * - `gulp extractPacks --pack classes` - Only extract the contents of the specified compendium.
 * - `gulp extractPacks --pack classes --name Barbarian` - Only extract a single item from the specified compendium.
 */
function extractPacks()
{
	const packName = parsedArgs.pack ?? "*";
	const entryName = parsedArgs.name?.toLowerCase();
	const packs = gulp.src(`${PACK_DESTINATION}/**/${packName}.db`).pipe(through2.obj((file, enc, callback) => {
		const filename = path.parse(file.path).name;
		const folder = path.join(PACK_SOURCE, filename);

		if(!fs.existsSync(folder))
			fs.mkdirSync(folder, {recursive: true, mode: 0o775});

		const db = new Datastore({filename: file.path, autoload: true});

		db.loadDatabase();
		db.find({}, (err, entries) => {
			entries.forEach(entry => {
				const name = entry.name.toLowerCase();

				if(entryName && (entryName !== name))
					return;

				cleanPackEntry(entry);

				const output = `${JSON.stringify(entry, null, 2)}\n`;
				const outputName = name.replace("'", "").replace(/[^a-z0-9]+/gi, " ").trim().replace(/\s+|-{2,}/g, "-");
				const subfolder = path.join(folder, _getSubfolderName(entry, filename));

				if(!fs.existsSync(subfolder))
					fs.mkdirSync(subfolder, {recursive: true, mode: 0o775});

				fs.writeFileSync(path.join(subfolder, `${outputName}.json`), output, {mode: 0o664});
			});
		});

		logger.info(`Extracting pack ${filename}`);
		callback(null, file);
	}));

	return mergeStream(packs);
}

/**
 * Determine a subfolder name based on which pack is being extracted.
 * @param {object} data  Data for the entry being extracted.
 * @param {string} pack  Name of the pack.
 * @returns {string}     Subfolder name the entry into which the entry should be created. An empty string if none.
 * @private
 */
function _getSubfolderName(data, pack)
{
	switch(pack) {
		case "actions":
			return data.system.conservative.type[0].toUpperCase() +
				data.system.conservative.type.slice(1, data.system.type)

		case "careers":
			if(data.system.advanced === true)
				return "Advanced";

			return "Basic";

		case "skills":
			if(data.system.advanced === true)
				return "advanced";

			return "basic";

		case "talents":
			return data.system.type[0].toUpperCase() +
				data.system.type.slice(1, data.system.type)

		default: return "";
	}
}

export default gulp.series(gulp.parallel(compileLess), watchUpdates);
export const watch = gulp.series(gulp.parallel(compileLess), watchUpdates);
export const css = gulp.series(compileLess);
export const clean = gulp.series(cleanPacks);
export const compile = gulp.series(compilePacks);
export const extract = gulp.series(extractPacks);
export const build = gulp.parallel(compileLess, /*javascript.compile, */compilePacks);

