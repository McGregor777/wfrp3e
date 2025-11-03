import {spawn} from "child_process";
import logger from "fancy-log";
import {compilePack, extractPack} from "@foundryvtt/foundryvtt-cli";
import Config from "@foundryvtt/foundryvtt-cli/config.mjs";
import fs from "fs";
import gulp from "gulp";
import prefix from "gulp-autoprefixer";
import less from "gulp-less";
import yaml from "js-yaml";
import path from "path";

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

/**
 * Launches Foundry VTT.
 * @param {string} world The world to launch Foundry VTT with.
 * @param {string} [adminKey] The admin key to secure Foundry VTT's Setup screen with.
 * @param {boolean} [demo] Launch Foundry VTT in demo mode.
 * @param {number} [port] The port to launch Foundry VTT on.
 * @param {boolean} [noupnp] Disable UPnP port forwarding.
 * @param {boolean} [noupdate] Disable automatic update checking.
 */
function launchWorld(world, adminKey = null, demo = false, port = 30000, noupnp = false, noupdate = false)
{
	// Determine the installation path
	const installPath = Config.instance.get("installPath");
	if(!installPath) {
		console.error("The installation path is not set. Use `configure set installPath <path>` to set it. "
			+ "Install paths look like `C:/Program Files/Foundry Virtual Tabletop`");
		process.exitCode = 1;
		return;
	}

	// Determine the data path
	const dataPath = Config.instance.get("dataPath");
	if(!dataPath) {
		console.error("The data path is not set. Use `configure set dataPath <path>` to set it. "
			+ "Data paths look like `C:/Users/Example/AppData/Local/FoundryVTT/Data`");
		process.exitCode = 1;
		return;
	}

	// Figure out if we are running the fvtt application or nodejs version
	const electronPath = path.normalize(path.join(installPath, "resources", "app", "main.js")),
		  nodePath = path.normalize(path.join(installPath, "main.js")),
		  fvttPath = fs.existsSync(electronPath) ? electronPath : nodePath;

	if(!fs.existsSync(fvttPath)) {
		console.error("Unable to find a valid launch path at '%s' or '%s'.", nodePath, electronPath);
		process.exitCode = 1;
		return;
	}

	// Launch Foundry VTT
	const foundry = spawn("node", [
		fvttPath,
		`--dataPath=${dataPath}`,
		`--port=${port}`,
		demo,
		world,
		noupnp,
		noupdate,
		adminKey
	]);

	foundry.stdout.on("data", data => console.log(data.toString()));
	foundry.stderr.on("data", data => console.error(data.toString()));
	foundry.on("close", code => console.log(`Foundry VTT exited with code ${code}`));
}

export default gulp.series(gulp.parallel(compileLess), watchUpdates);
export const build = gulp.parallel(compileLess, /*javascript.compile, */compilePacks);
export const css = gulp.series(compileLess);
export const compile = gulp.series(compilePacks);
export const extract = gulp.series(extractPacks);
export const init = gulp.series(initialize);
export const launch = gulp.series(launchWorld);
export const watch = gulp.series(gulp.parallel(compileLess), watchUpdates);
