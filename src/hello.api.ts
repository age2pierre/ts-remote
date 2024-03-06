import { setTimeout } from "node:timers/promises";

export async function greet(arg: { name: string }): Promise<string> {
  await setTimeout(1000);
  return "Hello " + arg.name + " " + Math.round(Math.random() * 100);
}

export async function adieu(arg: { foo: number }): Promise<string | number> {
  await setTimeout(1000);
  if (arg.foo < 0) {
    return 42;
  }
  return "Farwell ";
}
