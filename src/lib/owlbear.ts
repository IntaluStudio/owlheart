import OBR from "@owlbear-rodeo/sdk";
import type { CharacterBuild, DualityResult, SharedRollEntry } from "./types";
import { METADATA_KEYS } from "./types";

export const RUMBLE_CHAT_METADATA_KEY = "com.battle-system.friends/metadata_chatlog";
export const BONES_ROLL_METADATA_KEY = "com.battle-system.bones/metadata_bonesroll";
export const BONES_RESULT_METADATA_KEY = "com.battle-system.bones/metadata_logroll";

const OBR_READY_TIMEOUT_MS = 5000;

export function isOwlbearAvailable() {
  return OBR.isAvailable;
}

async function ensureReady() {
  if (!OBR.isAvailable || OBR.isReady) {
    return;
  }

  await Promise.race([
    new Promise<void>((resolve) => {
      OBR.onReady(resolve);
    }),
    new Promise<void>((_, reject) =>
      setTimeout(
        () => reject(new Error("OBR did not become ready within the timeout period")),
        OBR_READY_TIMEOUT_MS,
      ),
    ),
  ]);
}

export async function showOwlbearNotification(message: string, variant: "DEFAULT" | "ERROR" | "INFO" | "SUCCESS" | "WARNING" = "INFO") {
  if (!OBR.isAvailable) {
    return false;
  }

  try {
    await ensureReady();
    await OBR.notification.show(message, variant);
    return true;
  } catch {
    return false;
  }
}

export async function writeLastDualityResult(result: DualityResult, label = "Duality Roll") {
  if (!OBR.isAvailable) {
    return false;
  }

  try {
    await ensureReady();
    await OBR.player.setMetadata({
      [METADATA_KEYS.lastDualityResult]: {
        ...result,
        created: new Date().toISOString(),
      },
    });
    await broadcastSharedRoll({
      label,
      resultText: result.label,
      total: result.total,
      outcome: result.outcome,
    });
    return true;
  } catch {
    return false;
  }
}

export async function broadcastSharedRoll(roll: Pick<SharedRollEntry, "label" | "resultText" | "total" | "outcome">) {
  if (!OBR.isAvailable) {
    return false;
  }

  try {
    await ensureReady();
    const playerName = await OBR.player.getName();
    const timestamp = Date.now();
    const entry: SharedRollEntry = {
      id: `${timestamp}:${Math.random().toString(36).slice(2, 8)}`,
      playerName: playerName || "OwlHeart",
      label: roll.label,
      resultText: roll.resultText,
      total: roll.total,
      outcome: roll.outcome,
      timestamp,
    };
    await OBR.room.setMetadata({ [METADATA_KEYS.sharedRoll]: entry });
    return true;
  } catch {
    return false;
  }
}

export async function subscribeToSharedRolls(onRoll: (roll: SharedRollEntry) => void) {
  if (!OBR.isAvailable) {
    return () => undefined;
  }

  try {
    await ensureReady();
    let lastSeenTimestamp = 0;
    return OBR.room.onMetadataChange((metadata) => {
      const roll = metadata[METADATA_KEYS.sharedRoll] as SharedRollEntry | undefined;
      if (roll && typeof roll.timestamp === "number" && roll.timestamp > lastSeenTimestamp) {
        lastSeenTimestamp = roll.timestamp;
        onRoll(roll);
      }
    });
  } catch {
    return () => undefined;
  }
}

function tokenStats(build: CharacterBuild) {
  return {
    characterId: build.id,
    characterName: build.name,
    hp: { current: build.status.markedHp, max: build.status.maxHp },
    stress: { current: build.status.markedStress, max: build.status.maxStress },
    hope: build.status.hope,
    updated: Date.now(),
  };
}

export async function linkSelectedTokenToCharacter(build: CharacterBuild) {
  if (!OBR.isAvailable) {
    return undefined;
  }

  try {
    await ensureReady();
    const selection = await OBR.player.getSelection();
    const tokenId = selection?.[0];
    if (!tokenId) {
      return undefined;
    }
    await updateLinkedTokenStats({ ...build, linkedTokenId: tokenId });
    return tokenId;
  } catch {
    return undefined;
  }
}

export async function updateLinkedTokenStats(build: CharacterBuild) {
  if (!OBR.isAvailable || !build.linkedTokenId) {
    return false;
  }

  try {
    await ensureReady();
    const stats = tokenStats(build);
    await OBR.scene.items.updateItems([build.linkedTokenId], (items) => {
      const item = items[0];
      if (!item) {
        return;
      }
      item.metadata[METADATA_KEYS.tokenStats] = stats;
      if ("text" in item && item.text && typeof item.text === "object") {
        (item.text as { plainText?: string }).plainText =
          `HP ${stats.hp.current}/${stats.hp.max} | Stress ${stats.stress.current}/${stats.stress.max} | Hope ${stats.hope}`;
      }
    });
    return true;
  } catch {
    return false;
  }
}

export async function sendRumbleChat(message: string) {
  if (!OBR.isAvailable) {
    return false;
  }

  try {
    await ensureReady();
    const senderName = await OBR.player.getName();
    await OBR.player.setMetadata({
      [RUMBLE_CHAT_METADATA_KEY]: {
        chatlog: message,
        created: new Date().toISOString(),
        sender: senderName || "Daggerheart Toolkit",
        targetId: "0000",
      },
    });
    return true;
  } catch {
    return false;
  }
}

export function describeDiceIntegration() {
  return {
    rumble: `Rumble exposes chat and dice metadata through ${RUMBLE_CHAT_METADATA_KEY}; this toolkit sends formatted text to chat when available.`,
    bones: `Bones exposes dice roll metadata through ${BONES_ROLL_METADATA_KEY} and result metadata at ${BONES_RESULT_METADATA_KEY}; this toolkit does not hand off entered die values as a new roll.`,
  };
}
