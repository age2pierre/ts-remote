import { AsyncLocalStorage } from "node:async_hooks";

export const contextStorage = new AsyncLocalStorage<TsRemoteContext>();

export interface TsRemoteContext {
  requestId: string;
}
