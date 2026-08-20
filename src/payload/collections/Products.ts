import { CollectionConfig } from "payload";

export const Products: CollectionConfig = {
  slug: "products",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "price", "category", "stock", "status"],
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
        description: "SEO-friendly URL slug (e.g. apple-iphone-17-pro)",
      },
    },
    {
      name: "youlaId",
      type: "text",
      unique: true,
      index: true,
      admin: {
        description: "ID объявления на Youla (заполняется автоматически при импорте)",
        readOnly: true,
      },
    },
    {
      name: "youlaUrl",
      type: "text",
      admin: {
        description: "Ссылка на объявление на Youla",
        readOnly: true,
      },
    },
    {
      name: "description",
      type: "richText",
    },
    {
      name: "shortDescription",
      type: "textarea",
      admin: {
        description: "Short description for product cards",
      },
    },
    {
      name: "price",
      type: "number",
      required: true,
      min: 0,
    },
    {
      name: "comparePrice",
      type: "number",
      min: 0,
      admin: {
        description: "Original price before discount",
      },
    },
    {
      name: "images",
      type: "array",
      fields: [
        {
          name: "image",
          type: "upload",
          relationTo: "media",
          required: true,
        },
      ],
      minRows: 1,
    },
    {
      name: "category",
      type: "relationship",
      relationTo: "categories",
      required: true,
    },
    {
      name: "brand",
      type: "text",
    },
    {
      name: "sku",
      type: "text",
      unique: true,
    },
    {
      name: "stock",
      type: "number",
      required: true,
      min: 0,
      defaultValue: 0,
    },
    {
      name: "variants",
      type: "array",
      fields: [
        { name: "name", type: "text", required: true },
        { name: "value", type: "text", required: true },
        { name: "priceModifier", type: "number", defaultValue: 0 },
        { name: "stock", type: "number", defaultValue: 0, min: 0 },
      ],
      admin: {
        description: "Product variants (e.g. colors, sizes)",
      },
    },
    {
      name: "attributes",
      type: "array",
      fields: [
        { name: "key", type: "text", required: true },
        { name: "value", type: "text", required: true },
      ],
      admin: {
        description: "Product specifications/attributes",
      },
    },
    {
      name: "tags",
      type: "array",
      fields: [{ name: "tag", type: "text" }],
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "draft",
      options: [
        { label: "Draft", value: "draft" },
        { label: "Published", value: "published" },
        { label: "Archived", value: "archived" },
      ],
    },
    {
      name: "featured",
      type: "checkbox",
      defaultValue: false,
    },
    {
      name: "seo",
      type: "group",
      fields: [
        { name: "title", type: "text" },
        { name: "description", type: "textarea" },
        { name: "keywords", type: "text" },
      ],
    },
  ],
};
