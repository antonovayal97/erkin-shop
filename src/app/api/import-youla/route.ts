import { getPayloadClient } from "@/lib/payload";
import { executeYoulaImport } from "@/lib/youla/run-import-handler";

export const maxDuration = 600;

export async function POST(request: Request) {
  const importSecret = process.env.IMPORT_SECRET;
  const providedSecret = request.headers.get("x-import-secret");

  if (!importSecret || providedSecret !== importSecret) {
    return Response.json({ success: false, error: "Доступ запрещён" }, { status: 403 });
  }

  try {
    const payload = await getPayloadClient();
    const { message, stats } = await executeYoulaImport(payload);
    return Response.json({ success: true, message, stats });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Неизвестная ошибка импорта";

    try {
      const payload = await getPayloadClient();
      await payload.updateGlobal({
        slug: "youla-import",
        data: {
          syncStatus: "error",
          syncMessage: errorMessage,
          lastSyncAt: new Date().toISOString(),
        },
      });
    } catch {
      // ignore secondary errors while reporting primary failure
    }

    return Response.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
