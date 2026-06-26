const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;

async function sendTelegramMessage(text: string) {
  const chatId = process.env.TELEGRAM_CHAT_ID;
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token || !chatId) return;

  try {
    await fetch(TELEGRAM_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
      }),
    });
  } catch {
    // Notification failure should not break the main action
  }
}

export async function notifyNewPlace(placeName: string, submittedBy: string) {
  await sendTelegramMessage(
    `📍 <b>New Place Submitted</b>\n\n` +
    `<b>Place:</b> ${placeName}\n` +
    `<b>By:</b> ${submittedBy}\n\n` +
    `⏳ Waiting for your approval in Admin Panel → Places`
  );
}

export async function notifyPlaceUpdated(placeName: string, submittedBy: string) {
  await sendTelegramMessage(
    `✏️ <b>Place Updated (Needs Re-approval)</b>\n\n` +
    `<b>Place:</b> ${placeName}\n` +
    `<b>By:</b> ${submittedBy}\n\n` +
    `⏳ Waiting for your approval in Admin Panel → Places`
  );
}

export async function notifyNewReview(placeName: string, reviewerName: string, rating: number) {
  const stars = "⭐".repeat(Math.min(rating, 5));
  await sendTelegramMessage(
    `💬 <b>New Review Posted</b>\n\n` +
    `<b>Place:</b> ${placeName}\n` +
    `<b>By:</b> ${reviewerName}\n` +
    `<b>Rating:</b> ${stars} (${rating}/5)\n\n` +
    `Check it in Admin Panel → Reviews`
  );
}

export async function notifyNewReport(placeName: string, reason: string, reportedBy: string) {
  await sendTelegramMessage(
    `🚨 <b>Place Reported</b>\n\n` +
    `<b>Place:</b> ${placeName}\n` +
    `<b>Reason:</b> ${reason}\n` +
    `<b>Reported by:</b> ${reportedBy}\n\n` +
    `Check it in Admin Panel → Reports`
  );
}

export async function notifyRewardRedeemed(
  rewardName: string,
  coinCost: number,
  userName: string,
  userEmail: string,
  city: string,
  state: string
) {
  await sendTelegramMessage(
    `🎁 <b>Reward Redeemed!</b>\n\n` +
    `<b>Reward:</b> ${rewardName}\n` +
    `<b>Coins spent:</b> ${coinCost} 🪙\n` +
    `<b>By:</b> ${userName} (${userEmail})\n` +
    `<b>Delivery city:</b> ${city}, ${state}\n\n` +
    `Process it in Admin Panel → Rewards`
  );
}
