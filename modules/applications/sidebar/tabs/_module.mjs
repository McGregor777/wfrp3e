import ActorDirectory from "./actor-directory.mjs";
import ChatLog from "./chat.mjs";
import CombatTracker from "./combat-tracker.mjs";

export {ActorDirectory, ChatLog, CombatTracker};

export function configureTabs()
{
	CONFIG.ui.actors = ActorDirectory;
	CONFIG.ui.chat = ChatLog;
	CONFIG.ui.combat = CombatTracker;
}
