import "server-only";
import { Resend } from "resend";
import { formatPrice } from "@/lib/utils";
import type { Payload } from "payload";

type OrderItem = {
  name?: string | null;
  price?: number | null;
  quantity?: number | null;
  variantName?: string | null;
  variantValue?: string | null;
};

type OrderLike = {
  id?: string | number;
  orderNumber?: string | null;
  email?: string | null;
  phone?: string | null;
  total?: number | null;
  subtotal?: number | null;
  shipping?: number | null;
  notes?: string | null;
  items?: OrderItem[] | null;
  shippingAddress?: {
    firstName?: string | null;
    lastName?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    postalCode?: string | null;
    country?: string | null;
  } | null;
};

function customerName(order: OrderLike): string {
  const first = order.shippingAddress?.firstName?.trim() ?? "";
  const last = order.shippingAddress?.lastName?.trim() ?? "";
  return [first, last].filter(Boolean).join(" ") || "—";
}

function formatAddress(order: OrderLike): string {
  const a = order.shippingAddress;
  if (!a) return "—";
  return [a.address, a.city, a.state, a.postalCode, a.country]
    .map((v) => (typeof v === "string" ? v.trim() : ""))
    .filter(Boolean)
    .join(", ");
}

function formatItemsPlain(items: OrderItem[] | null | undefined): string {
  if (!items?.length) return "—";
  return items
    .map((item, i) => {
      const qty = item.quantity ?? 1;
      const price = formatPrice(Number(item.price ?? 0) * qty);
      const variant = [item.variantName, item.variantValue].filter(Boolean).join(": ");
      const name = item.name ?? "Товар";
      return `${i + 1}. ${name}${variant ? ` (${variant})` : ""} × ${qty} — ${price}`;
    })
    .join("\n");
}

function buildTelegramMessage(order: OrderLike): string {
  const lines = [
    "🛒 *Новый заказ*",
    "",
    `*№* \`${order.orderNumber ?? order.id ?? "—"}\``,
    `*Клиент:* ${escapeMarkdown(customerName(order))}`,
    `*Телефон:* ${escapeMarkdown(order.phone || order.email || "—")}`,
    `*Адрес:* ${escapeMarkdown(formatAddress(order))}`,
    "",
    "*Товары:*",
    escapeMarkdown(formatItemsPlain(order.items)),
    "",
    `*Итого:* ${escapeMarkdown(formatPrice(Number(order.total ?? 0)))}`,
  ];

  if (order.notes?.trim()) {
    lines.push("", `*Комментарий:* ${escapeMarkdown(order.notes.trim())}`);
  }

  return lines.join("\n");
}

function escapeMarkdown(text: string): string {
  return text.replace(/([_*`\[\]])/g, "\\$1");
}

function buildEmailHtml(order: OrderLike): string {
  const rows =
    order.items
      ?.map((item) => {
        const qty = item.quantity ?? 1;
        const lineTotal = formatPrice(Number(item.price ?? 0) * qty);
        const variant = [item.variantName, item.variantValue].filter(Boolean).join(": ");
        return `<tr>
          <td style="padding:8px;border-bottom:1px solid #eee">${escapeHtml(item.name ?? "Товар")}${
            variant ? `<br/><span style="color:#666;font-size:12px">${escapeHtml(variant)}</span>` : ""
          }</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${qty}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${escapeHtml(lineTotal)}</td>
        </tr>`;
      })
      .join("") ?? "";

  return `<!doctype html>
<html>
<body style="font-family:system-ui,-apple-system,sans-serif;color:#111;line-height:1.45">
  <h2 style="margin:0 0 12px">Новый заказ ${escapeHtml(String(order.orderNumber ?? ""))}</h2>
  <p style="margin:0 0 8px"><strong>Клиент:</strong> ${escapeHtml(customerName(order))}</p>
  <p style="margin:0 0 8px"><strong>Телефон:</strong> ${escapeHtml(order.phone || order.email || "—")}</p>
  <p style="margin:0 0 16px"><strong>Адрес:</strong> ${escapeHtml(formatAddress(order))}</p>
  <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
    <thead>
      <tr>
        <th style="text-align:left;padding:8px;border-bottom:2px solid #ddd">Товар</th>
        <th style="text-align:center;padding:8px;border-bottom:2px solid #ddd">Кол-во</th>
        <th style="text-align:right;padding:8px;border-bottom:2px solid #ddd">Сумма</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <p style="margin:0 0 8px;font-size:18px"><strong>Итого: ${escapeHtml(
    formatPrice(Number(order.total ?? 0)),
  )}</strong></p>
  ${
    order.notes?.trim()
      ? `<p style="margin:16px 0 0"><strong>Комментарий:</strong> ${escapeHtml(order.notes.trim())}</p>`
      : ""
  }
</body>
</html>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function sendTelegram(chatIds: string[], text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  if (!token) {
    console.warn("[order-notifications] TELEGRAM_BOT_TOKEN не задан — Telegram пропущен");
    return;
  }
  if (!chatIds.length) return;

  await Promise.allSettled(
    chatIds.map(async (chatId) => {
      const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "Markdown",
          disable_web_page_preview: true,
        }),
      });
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        console.error(`[order-notifications] Telegram chat ${chatId}: ${res.status} ${body}`);
      }
    }),
  );
}

async function sendEmails(emails: string[], order: OrderLike): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_EMAIL?.trim();
  if (!apiKey) {
    console.warn("[order-notifications] RESEND_API_KEY не задан — email пропущен");
    return;
  }
  if (!from) {
    console.warn("[order-notifications] RESEND_FROM_EMAIL не задан — email пропущен");
    return;
  }
  if (!emails.length) return;

  const resend = new Resend(apiKey);
  const subject = `Новый заказ ${order.orderNumber ?? ""}`.trim();
  const html = buildEmailHtml(order);

  await Promise.allSettled(
    emails.map(async (to) => {
      const { error } = await resend.emails.send({
        from,
        to,
        subject,
        html,
      });
      if (error) {
        console.error(`[order-notifications] Resend ${to}:`, error);
      }
    }),
  );
}

export async function notifyNewOrder(payload: Payload, order: OrderLike): Promise<void> {
  try {
    const settings = await payload.findGlobal({ slug: "shop-settings" });
    const notifications = settings.orderNotifications as
      | {
          telegramChats?: { chatId?: string | null }[] | null;
          emails?: { email?: string | null }[] | null;
        }
      | null
      | undefined;

    const chatIds = (notifications?.telegramChats ?? [])
      .map((row) => row.chatId?.trim())
      .filter((id): id is string => Boolean(id));

    const emails = (notifications?.emails ?? [])
      .map((row) => row.email?.trim().toLowerCase())
      .filter((email): email is string => Boolean(email));

    if (!chatIds.length && !emails.length) {
      return;
    }

    await Promise.all([
      sendTelegram(chatIds, buildTelegramMessage(order)),
      sendEmails(emails, order),
    ]);
  } catch (err) {
    console.error("[order-notifications] Ошибка отправки уведомлений:", err);
  }
}
