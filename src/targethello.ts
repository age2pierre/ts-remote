import typiaJson from "typia/lib/json";
import { registerHandler } from "./server";
import { setTimeout } from "node:timers/promises";

export async function greet(arg: { name: string }): Promise<string> {
  await setTimeout(1000);
  return "Hello " + arg.name + " " + Math.round(Math.random() * 100);
}

{
  const parseParams = typiaJson.createIsParse<Parameters<typeof greet>>();
  const stringifyResponse =
    typiaJson.createStringify<Awaited<ReturnType<typeof greet>>>();
  registerHandler(greet, "hello-greet", parseParams, stringifyResponse);
}
