import logger from "fancy-log";
import fs from "fs";
import gulp from "gulp";
import prefix from "gulp-autoprefixer";
import less from "gulp-less";
import yaml from "js-yaml";
import path from "path";
import yargs from "yargs";
import {compilePack, extractPack} from "@foundryvtt/foundryvtt-cli";

/**
 * Folder where the compiled compendium packs should be located relative to the system folder.
 * @type {string}
 */
const PACK_DESTINATION = "packs/";

/**
 * Folder where source JSON files should be located relative to the system folder.
 * @type {string}
 */
const PACK_SOURCE = "packs/source/";

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
 * Compile the source JSON files into compendium packs.
 * - `gulp compile` - Compile all JSON files into their LevelDB files.
 * @param {String} [packName] The name of the pack to compile.
 * @returns {Promise<void>}
 */
async function compilePacks(packName = null)
{
	const system = JSON.parse(fs.readFileSync("./system.json", {encoding: "utf8"})),
		  packs = system.packs;

	if(packName !== null && packName.length !== 0)
		packs.filter(pack => pack.name === packName);

	for(const packInfo of packs) {
		logger.info(`Compiling pack ${packInfo.name}`);
		await compilePack(PACK_SOURCE + packInfo.name, packInfo.path);
	}
}

/**
 * Extract the contents of compendium packs to JSON files.
 * - `gulp extract` - Extract all compendium NEDB files into JSON files.
 * @param {String} [packName] The name of the pack to extract.
 */
async function extractPacks(packName)
{
	const system = JSON.parse(fs.readFileSync("./system.json", {encoding: "utf8"})),
		  packs = system.packs;

	if(packName !== null && packName.length !== 0)
		packs.filter(pack => pack.name === packName);

	for(const packInfo of packs) {
		logger.info(`Extracting pack ${packInfo.name}`);
		await extractPack(packInfo.path, PACK_SOURCE + packInfo.name);
	}
}

/**
 * Initializes the Foundry VTT system by creating symlinks to the Foundry VTT source files.
 * - `gulp init` - Initialize the Foundry VTT system.
 * @returns {Promise<void>}
 */
async function initialize()
{
	if(fs.existsSync("foundry-config.yaml")) {
		let fileRoot = "";
		try {
			const configFile = await fs.promises.readFile("foundry-config.yaml", "utf-8"),
				  foundryConfig = yaml.load(configFile),
				  // As of 13.338, the Node install is *not* nested but electron installs *are*.
				  nested = fs.existsSync(path.join(foundryConfig.installPath, "resources", "app"));

			fileRoot = nested
				? path.join(foundryConfig.installPath, "resources", "app")
				: foundryConfig.installPath;
		}
		catch(error) {
			console.error(`Error reading foundry-config.yaml: ${error}`);
		}

		try {
			await fs.promises.mkdir("foundry");
		}
		catch(error) {
			if(error.code !== "EEXIST")
				throw error;
		}

		// Javascript files
		for(const p of ["client", "common", "tsconfig.json"]) {
			try {
				await fs.promises.symlink(path.join(fileRoot, p), path.join("foundry", p));
			}
			catch(error) {
				if(error.code !== "EEXIST")
					throw error;
			}
		}

		// Language files
		try {
			await fs.promises.symlink(path.join(fileRoot, "public", "lang"), path.join("foundry", "lang"));
		}
		catch(error) {
			if(error.code !== "EEXIST")
				throw error;
		}
	}
}

export default gulp.series(gulp.parallel(compileLess), watchUpdates);
export const build = gulp.parallel(compileLess, /*javascript.compile, */compilePacks);
export const css = gulp.series(compileLess);
export const compile = gulp.series(compilePacks);
export const extract = gulp.series(extractPacks);
export const init = gulp.series(initialize);
export const watch = gulp.series(gulp.parallel(compileLess), watchUpdates);