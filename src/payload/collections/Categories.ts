import { CollectionConfig } from "payload";

export const Categories: CollectionConfig = {
  slug: "categories",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "slug", "active"],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      admin: {
        description: "URL-friendly identifier (e.g. headphones)",
      },
    },
    {
      name: "youlaId",
      type: "text",
      unique: true,
      index: true,
      admin: {
        description: "ID категории на Youla (заполняется автоматически при импорте)",
        readOnly: true,
      },
    },
    {
      name: "description",
      type: "textarea",
    },
    {
      name: "active",
      type: "checkbox",
      required: true,
      defaultValue: true,
      admin: {
        description: "Показывать категорию на сайте. Снятие галочки скрывает категорию из списков, её страница и все её товары отдают 404 / не показываются. Не меняется при импорте с Youla.",
      },
    },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "parent",
      type: "relationship",
      relationTo: "categories",
      admin: {
        description: "Parent category for nested categories",
      },
    },
    {
      name: "seo",
      type: "group",
      fields: [
        { name: "title", type: "text" },
        { name: "description", type: "textarea" },
      ],
    },
  ],
};
