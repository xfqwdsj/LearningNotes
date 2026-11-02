"use client";

import { useSyncExternalStore, type ReactNode } from "react";

const subscribe = () => () => {};
const clientReady = () => true;
const serverReady = () => false;

/** False during SSR and the hydration pass, then true after the client mounts. */
export function useClientReady(): boolean {
  return useSyncExternalStore(subscribe, clientReady, serverReady);
}

export function ClientReady({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback: ReactNode;
}) {
  return useClientReady() ? children : fallback;
}
