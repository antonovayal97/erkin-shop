import type { GlobalConfig } from "payload";
import { executeYoulaImport } from "@/lib/youla/run-import-handler";

export const YoulaImport: GlobalConfig = {
  slug: "youla-import",
  label: "Импорт Youla",
  admin: {
    group: "Импорт",
  },
  access: {
    read: ({ req }) => req.user?.role === "admin",
    update: ({ req }) => req.user?.role === "admin",
  },
  endpoints: [
    {
      path: "/sync",
      method: "post",
      handler: async (req) => {
        if (!req.user) {
          return Response.json(
            {
              success: false,
              error:
                "Сессия не распознана. Проверьте NEXT_PUBLIC_SERVER_URL на VPS (должен быть ваш https://домен) и перелогиньтесь.",
            },
            { status: 403 },
          );
        }

        if (req.user.role !== "admin") {
          return Response.json(
            { success: false, error: "Доступ запрещён: нужна роль admin у пользователя" },
            { status: 403 },
          );
        }

        try {
          const { message, stats } = await executeYoulaImport(req.payload);
          return Response.json({ success: true, message, stats });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Неизвестная ошибка импорта";

          await req.payload.updateGlobal({
            slug: "youla-import",
            data: {
              syncStatus: "error",
              syncMessage: errorMessage,
              lastSyncAt: new Date().toISOString(),
            },
          });

          return Response.json({ success: false, error: errorMessage }, { status: 500 });
        }
      },
    },
  ],
  fields: [
    {
      name: "storeUrl",
      type: "text",
      required: true,
      defaultValue: "https://youla.ru/store/6658996c2ca0aa09e3cafccf",
      admin: {
        description: "Ссылка на магазин Youla для парсинга",
      },
    },
    {
      name: "syncStatus",
      type: "select",
      defaultValue: "idle",
      options: [
        { label: "Ожидание", value: "idle" },
        { label: "Выполняется", value: "running" },
        { label: "Успешно", value: "success" },
        { label: "С ошибками", value: "completed_with_errors" },
        { label: "Ошибка", value: "error" },
      ],
      admin: {
        readOnly: true,
      },
    },
    {
      name: "lastSyncAt",
      type: "date",
      admin: {
        readOnly: true,
        date: {
          pickerAppearance: "dayAndTime",
        },
      },
    },
    {
      name: "syncMessage",
      type: "textarea",
      admin: {
        readOnly: true,
        description: "Статус и результат последнего импорта",
      },
    },
    {
      name: "lastStats",
      type: "json",
      admin: {
        readOnly: true,
      },
    },
    {
      name: "syncAction",
      type: "ui",
      admin: {
        components: {
          Field: "@/components/admin/YoulaImportButton#YoulaImportButton",
        },
      },
    },
  ],
};
