"use client";

import { useState } from "react";
import { Button, useAuth } from "@payloadcms/ui";

type ImportStatusResponse = {
  success?: boolean;
  started?: boolean;
  message?: string;
  error?: string;
  syncStatus?: string;
  syncMessage?: string | null;
};

async function readJson(response: Response): Promise<ImportStatusResponse> {
  const contentType = response.headers.get("content-type") ?? "";
  const text = await response.text();

  if (!contentType.includes("application/json")) {
    const preview = text.replace(/\s+/g, " ").slice(0, 180);
    throw new Error(
      `Сервер вернул HTML вместо JSON (HTTP ${response.status}). ` +
        `Обычно это 502/504 от Nginx при таймауте или неверный URL. ` +
        `Фрагмент: ${preview || "<пусто>"}`,
    );
  }

  try {
    return JSON.parse(text) as ImportStatusResponse;
  } catch {
    throw new Error(`Некорректный JSON (HTTP ${response.status}): ${text.slice(0, 180)}`);
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function YoulaImportButton() {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const authHeaders = (): HeadersInit => {
    if (!token) return {};
    return {
      Authorization: `JWT ${token}`,
      "Content-Type": "application/json",
    };
  };

  const handleSync = async () => {
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      if (!token) {
        throw new Error("Нет сессии. Выйдите и войдите в админку снова.");
      }

      if (user && "role" in user && user.role !== "admin") {
        throw new Error("Импорт доступен только администратору (role=admin).");
      }

      const startResponse = await fetch("/api/import-youla", {
        method: "POST",
        credentials: "include",
        headers: authHeaders(),
      });

      const startPayload = await readJson(startResponse);

      if (!startResponse.ok || !startPayload.success) {
        throw new Error(startPayload.error ?? startPayload.message ?? "Не удалось запустить импорт");
      }

      setMessage(startPayload.message ?? "Импорт запущен...");

      // Poll until background job finishes (avoids proxy HTML timeouts).
      for (let attempt = 0; attempt < 600; attempt += 1) {
        await sleep(2000);

        const statusResponse = await fetch("/api/import-youla", {
          method: "GET",
          credentials: "include",
          headers: authHeaders(),
          cache: "no-store",
        });

        const statusPayload = await readJson(statusResponse);

        if (!statusResponse.ok || !statusPayload.success) {
          throw new Error(statusPayload.error ?? "Не удалось получить статус импорта");
        }

        const syncStatus = statusPayload.syncStatus ?? "idle";
        const syncMessage = statusPayload.syncMessage ?? null;

        if (syncStatus === "running") {
          if (syncMessage) setMessage(syncMessage);
          continue;
        }

        if (syncStatus === "error") {
          throw new Error(syncMessage ?? "Импорт завершился с ошибкой");
        }

        setMessage(syncMessage ?? "Импорт завершён");
        return;
      }

      throw new Error("Импорт слишком долго выполняется. Обновите страницу и проверьте статус.");
    } catch (syncError) {
      setError(syncError instanceof Error ? syncError.message : "Ошибка импорта");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        padding: "16px",
        border: "1px solid var(--theme-elevation-150)",
        borderRadius: "8px",
        background: "var(--theme-elevation-50)",
      }}
    >
      <div>
        <strong style={{ display: "block", marginBottom: "4px" }}>Импорт с Youla</strong>
        <span style={{ color: "var(--theme-elevation-800)", fontSize: "14px" }}>
          Загрузит категории и товары из указанного магазина, обновит существующие и архивирует
          удалённые на Youla.
        </span>
      </div>

      <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
        <Button buttonStyle="primary" disabled={loading} onClick={handleSync}>
          {loading ? "Импорт выполняется..." : "Запустить импорт"}
        </Button>
      </div>

      {message ? (
        <p style={{ margin: 0, color: "var(--theme-success-500)", whiteSpace: "pre-wrap" }}>{message}</p>
      ) : null}
      {error ? (
        <p style={{ margin: 0, color: "var(--theme-error-500)", whiteSpace: "pre-wrap" }}>{error}</p>
      ) : null}
    </div>
  );
}
