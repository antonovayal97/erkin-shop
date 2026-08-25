import type { GlobalConfig } from "payload";

export const ShopSettings: GlobalConfig = {
  slug: "shop-settings",
  label: "Настройки магазина",
  admin: {
    group: "Магазин",
  },
  access: {
    read: () => true,
    update: ({ req }) => req.user?.role === "admin",
  },
  fields: [
    {
      name: "phone",
      type: "text",
      label: "Телефон продавца",
      admin: {
        description: "Номер для кнопки «Позвонить продавцу». Например: +7 (914) 123-45-67",
        placeholder: "+7 (914) 123-45-67",
      },
    },
    {
      name: "orderNotifications",
      type: "group",
      label: "Уведомления о заказах",
      fields: [
        {
          name: "telegramChats",
          type: "array",
          label: "Telegram-чаты",
          labels: {
            singular: "Чат",
            plural: "Чаты",
          },
          admin: {
            description:
              "Chat ID получателей. Пользователь должен сначала написать боту /start. Chat ID можно узнать у @userinfobot.",
          },
          fields: [
            {
              name: "chatId",
              type: "text",
              required: true,
              label: "Chat ID",
              admin: {
                placeholder: "123456789",
              },
            },
            {
              name: "label",
              type: "text",
              label: "Подпись",
              admin: {
                placeholder: "Админ",
              },
            },
          ],
        },
        {
          name: "emails",
          type: "array",
          label: "Email для уведомлений",
          labels: {
            singular: "Email",
            plural: "Emails",
          },
          admin: {
            description: "Адреса, на которые уходит письмо о каждом новом заказе (через Resend).",
          },
          fields: [
            {
              name: "email",
              type: "email",
              required: true,
              label: "Email",
            },
            {
              name: "label",
              type: "text",
              label: "Подпись",
              admin: {
                placeholder: "Менеджер",
              },
            },
          ],
        },
      ],
    },
  ],
};
