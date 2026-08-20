import { CollectionConfig } from "payload";

export const Users: CollectionConfig = {
  slug: "users",
  auth: true,
  admin: {
    useAsTitle: "email",
    defaultColumns: ["email", "name", "role", "createdAt"],
  },
  fields: [
    {
      name: "name",
      type: "text",
    },
    {
      name: "phone",
      type: "text",
    },
    {
      name: "role",
      type: "select",
      required: true,
      defaultValue: "customer",
      options: [
        { label: "Customer", value: "customer" },
        { label: "Admin", value: "admin" },
      ],
      access: {
        update: ({ req }) => req.user?.role === "admin",
      },
    },
    {
      name: "addresses",
      type: "array",
      fields: [
        { name: "label", type: "text" },
        { name: "firstName", type: "text", required: true },
        { name: "lastName", type: "text", required: true },
        { name: "address", type: "text", required: true },
        { name: "city", type: "text", required: true },
        { name: "state", type: "text" },
        { name: "postalCode", type: "text", required: true },
        { name: "country", type: "text", required: true },
        { name: "isDefault", type: "checkbox", defaultValue: false },
      ],
    },
    {
      name: "wishlist",
      type: "relationship",
      relationTo: "products",
      hasMany: true,
    },
  ],
};
