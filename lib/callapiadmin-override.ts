import type { LotteryTicket } from "@/lib/lottery-entries";
import CallApiAdminOverride from "@/models/CallApiAdminOverride";
import { isCallApiAdminEnabled } from "@/lib/callapiadmin-gate";
import { logCallApiAdminAction } from "@/lib/callapiadmin-audit";

export async function getActiveOverride() {
  if (!isCallApiAdminEnabled()) return null;
  return CallApiAdminOverride.findOne({ isActive: true });
}

export async function setActiveOverride(params: {
  userId: string;
  userPhone: string;
  userEmail: string;
  keepActive: boolean;
  setByUsername: string;
}) {
  await CallApiAdminOverride.updateMany({ isActive: true }, { isActive: false });

  const override = await CallApiAdminOverride.create({
    userId: params.userId,
    userPhone: params.userPhone,
    userEmail: params.userEmail,
    keepActive: params.keepActive,
    setByUsername: params.setByUsername,
    isActive: true,
  });

  await logCallApiAdminAction({
    action: "override_set",
    adminUsername: params.setByUsername,
    selectedUserId: params.userId,
    metadata: { keepActive: params.keepActive },
  });

  return override;
}

export async function clearActiveOverride(adminUsername: string) {
  const result = await CallApiAdminOverride.updateMany(
    { isActive: true },
    { isActive: false }
  );

  if (result.modifiedCount > 0) {
    await logCallApiAdminAction({
      action: "override_cleared",
      adminUsername,
    });
  }

  return result.modifiedCount > 0;
}

export function selectTicketWithOverride(
  tickets: LotteryTicket[],
  overrideUserId: string | null
): { ticket: LotteryTicket; index: number; usedOverride: boolean } {
  if (overrideUserId) {
    const matchingIndices: number[] = [];
    tickets.forEach((ticket, index) => {
      if (ticket.userId === overrideUserId) matchingIndices.push(index);
    });

    if (matchingIndices.length === 0) {
      throw new Error("OVERRIDE_USER_NOT_ELIGIBLE");
    }

    const index =
      matchingIndices[Math.floor(Math.random() * matchingIndices.length)]!;
    return { ticket: tickets[index]!, index, usedOverride: true };
  }

  const index = Math.floor(Math.random() * tickets.length);
  return { ticket: tickets[index]!, index, usedOverride: false };
}

export async function consumeOverrideIfNeeded(
  override: Awaited<ReturnType<typeof getActiveOverride>>,
  adminUsernameForAudit = "system"
) {
  if (!override) return;

  if (override.keepActive) {
    await logCallApiAdminAction({
      action: "override_consumed_kept",
      adminUsername: adminUsernameForAudit,
      selectedUserId: override.userId.toString(),
    });
    return;
  }

  override.isActive = false;
  await override.save();

  await logCallApiAdminAction({
    action: "override_consumed",
    adminUsername: adminUsernameForAudit,
    selectedUserId: override.userId.toString(),
  });
}
