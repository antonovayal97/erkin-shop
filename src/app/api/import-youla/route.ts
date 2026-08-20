import { getPayloadClient } from "@/lib/payload";
import { executeYoulaImport } from "@/lib/youla/run-import-handler";

export const maxDuration = 600;
export const dynamic = "force-dynamic";

type AuthUser = {
  role?: string | null;
};

async function authorize(request: Request): Promise<{ ok: true } | { ok: false; error: string }> {
  const importSecret = process.env.IMPORT_SECRET;
  const providedSecret = request.headers.get("x-import-secret");

  if (importSecret && providedSecret === importSecret) {
    return { ok: true };
  }

  const payload = await getPayloadClient();
  const { user } = await payload.auth({ headers: request.headers });
  const role = (user as AuthUser | null)?.role;

  if (!user) {
    return {
      ok: false,
      error:
        "Сессия не распознана. Проверьте NEXT_PUBLIC_SERVER_URL (https://ваш-домен) и перелогиньтесь.",
    };
  }

  if (role !== "admin") {
    return { ok: false, error: "Доступ запрещён: нужна роль admin" };
  }

  return { ok: true };
}

async function readStatus() {
  const payload = await getPayloadClient();
  const global = await payload.findGlobal({ slug: "youla-import", overrideAccess: true });

  return {
    syncStatus: global.syncStatus ?? "idle",
    syncMessage: global.syncMessage ?? null,
    lastSyncAt: global.lastSyncAt ?? null,
    lastStats: global.lastStats ?? null,
  };
}

export async function GET(request: Request) {
  const auth = await authorize(request);
  if (!auth.ok) {
    return Response.json({ success: false, error: auth.error }, { status: 403 });
  }

  const status = await readStatus();
  return Response.json({ success: true, ...status });
}

export async function POST(request: Request) {
  const auth = await authorize(request);
  if (!auth.ok) {
    return Response.json({ success: false, error: auth.error }, { status: 403 });
  }

  const payload = await getPayloadClient();
  const current = await payload.findGlobal({ slug: "youla-import", overrideAccess: true });

  if (current.syncStatus === "running") {
    return Response.json(
      { success: false, error: "Импорт уже выполняется", syncStatus: "running" },
      { status: 409 },
    );
  }

  // Start in background so Nginx/proxy timeouts don't return an HTML 504 page.
  await payload.updateGlobal({
    slug: "youla-import",
    data: {
      syncStatus: "running",
      syncMessage: "Импорт запущен...",
    },
    overrideAccess: true,
  });

  void (async () => {
    try {
      // Fresh client — request-scoped cache may be gone after the response is sent.
      const bgPayload = await getPayloadClient();
      await executeYoulaImport(bgPayload);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Неизвестная ошибка импорта";
      try {
        const bgPayload = await getPayloadClient();
        await bgPayload.updateGlobal({
          slug: "youla-import",
          data: {
            syncStatus: "error",
            syncMessage: errorMessage,
            lastSyncAt: new Date().toISOString(),
          },
          overrideAccess: true,
        });
      } catch {
        // ignore secondary errors
      }
    }
  })();

  return Response.json({
    success: true,
    started: true,
    message: "Импорт запущен. Статус обновляется автоматически.",
    syncStatus: "running",
  });
}
