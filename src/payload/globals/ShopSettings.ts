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
  ],
};
