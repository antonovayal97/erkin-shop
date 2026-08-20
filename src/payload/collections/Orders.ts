import { CollectionConfig } from "payload";

export const Orders: CollectionConfig = {
  slug: "orders",
  admin: {
    useAsTitle: "orderNumber",
    defaultColumns: ["orderNumber", "status", "total", "customer", "createdAt"],
  },
  access: {
    read: ({ req }) => {
      if (req.user?.role === "admin") return true;
      return { "customer.value": { equals: req.user?.id } };
    },
    create: () => true,
    update: ({ req }) => req.user?.role === "admin",
    delete: ({ req }) => req.user?.role === "admin",
  },
  fields: [
    {
      name: "orderNumber",
      type: "text",
      required: true,
      unique: true,
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "pending",
      options: [
        { label: "Pending", value: "pending" },
        { label: "Processing", value: "processing" },
        { label: "Shipped", value: "shipped" },
        { label: "Delivered", value: "delivered" },
        { label: "Cancelled", value: "cancelled" },
        { label: "Refunded", value: "refunded" },
      ],
    },
    {
      name: "customer",
      type: "relationship",
      relationTo: "users",
    },
    {
      name: "email",
      type: "text",
      required: true,
      admin: {
        description: "Телефон или email клиента",
      },
    },
    {
      name: "phone",
      type: "text",
      admin: {
        description: "Мобильный телефон",
      },
    },
    {
      name: "items",
      type: "array",
      required: true,
      fields: [
        {
          name: "product",
          type: "relationship",
          relationTo: "products",
          required: true,
        },
        { name: "name", type: "text", required: true },
        { name: "price", type: "number", required: true },
        { name: "quantity", type: "number", required: true, min: 1 },
        { name: "variantName", type: "text" },
        { name: "variantValue", type: "text" },
      ],
    },
    {
      name: "shippingAddress",
      type: "group",
      fields: [
        { name: "firstName", type: "text", required: true },
        { name: "lastName", type: "text", required: true },
        { name: "address", type: "text", required: true },
        {
          name: "city",
          type: "text",
          required: true,
          defaultValue: "Якутск",
        },
        { name: "state", type: "text" },
        { name: "postalCode", type: "text" },
        {
          name: "country",
          type: "text",
          defaultValue: "Россия",
        },
      ],
    },
    {
      name: "subtotal",
      type: "number",
      required: true,
      min: 0,
    },
    {
      name: "shipping",
      type: "number",
      required: true,
      min: 0,
      defaultValue: 0,
    },
    {
      name: "discount",
      type: "number",
      min: 0,
      defaultValue: 0,
    },
    {
      name: "total",
      type: "number",
      required: true,
      min: 0,
    },
    {
      name: "paymentStatus",
      type: "select",
      defaultValue: "unpaid",
      options: [
        { label: "Unpaid", value: "unpaid" },
        { label: "Paid", value: "paid" },
        { label: "Refunded", value: "refunded" },
      ],
    },
    {
      name: "stripePaymentIntentId",
      type: "text",
      admin: { readOnly: true },
    },
    {
      name: "notes",
      type: "textarea",
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data, operation }) => {
        if (operation === "create" && data && !data.orderNumber) {
          data.orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
        }
        return data;
      },
    ],
  },
};
