"use client";

import { useState } from "react";
import { Button, useAuth } from "@payloadcms/ui";

export function YoulaImportButton() {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

      const response = await fetch("/api/globals/youla-import/sync", {
        method: "POST",
        credentials: "include",
        headers: {
          Authorization: `JWT ${token}`,
          "Content-Type": "application/json",
        },
      });

      const payload = (await response.json()) as {
        success?: boolean;
        message?: string;
        error?: string;
      };

      if (!response.ok || !payload.success) {
        throw new Error(payload.error ?? payload.message ?? "Не удалось выполнить импорт");
      }

      setMessage(payload.message ?? "Импорт завершён");
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
