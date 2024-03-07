import { setTimeout } from "node:timers/promises";

export async function greet(arg: { name: string }): Promise<string> {
  await setTimeout(1000);
  return "Hello " + arg.name + " " + Math.round(Math.random() * 100);
}
