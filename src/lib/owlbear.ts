import OBR from "@owlbear-rodeo/sdk";
import type { DualityResult } from "./types";
import { METADATA_KEYS } from "./types";

export const RUMBLE_CHAT_METADATA_KEY = "com.battle-system.friends/metadata_chatlog";
export const BONES_ROLL_METADATA_KEY = "com.battle-system.bones/metadata_bonesroll";
export const BONES_RESULT_METADATA_KEY = "com.battle-system.bones/metadata_logroll";

export function isOwlbearAvailable() {
  return OBR.isAvailable;
}

async function ensureReady() {
  if (!OBR.isAvailable || OBR.isReady) {
    return;
  }

  await new Promise<void>((resolve) => {
    OBR.onReady(resolve);
  });
}

export async function showOwlbearNotification(message: string, variant: "DEFAULT" | "ERROR" | "INFO" | "SUCCESS" | "WARNING" = "INFO") {
  if (!OBR.isAvailable) {
    return false;
  }

  await ensureReady();
  await OBR.notification.show(message, variant);
  return true;
}

export async function writeLastDualityResult(result: DualityResult) {
  if (!OBR.isAvailable) {
    return false;
  }

  await ensureReady();
  await OBR.player.setMetadata({
    [METADATA_KEYS.lastDualityResult]: {
      ...result,
      created: new Date().toISOString(),
    },
  });
  return true;
}

export async function sendRumbleChat(message: string) {
  if (!OBR.isAvailable) {
    return false;
  }

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
}

export function describeDiceIntegration() {
  return {
    rumble: `Rumble exposes chat and dice metadata through ${RUMBLE_CHAT_METADATA_KEY}; this toolkit sends formatted text to chat when available.`,
    bones: `Bones exposes dice roll metadata through ${BONES_ROLL_METADATA_KEY} and result metadata at ${BONES_RESULT_METADATA_KEY}; this toolkit does not hand off entered die values as a new roll.`,
  };
}
