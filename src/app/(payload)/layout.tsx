import type { ServerFunctionClient } from "payload";
import { handleServerFunctions, RootLayout } from "@payloadcms/next/layouts";
import "@payloadcms/next/css";
import React from "react";

import config from "@payload-config";
import { importMap } from "./admin/importMap.js";

type Args = {
  children: React.ReactNode;
};

const serverFunction: ServerFunctionClient = async function (args) {
  "use server";
  return handleServerFunctions({
    ...args,
    config,
    importMap,
  });
};

export default function Layout({ children }: Args) {
  return (
    <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
      {children}
    </RootLayout>
  );
}
