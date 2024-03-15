import { setTimeout } from "node:timers/promises";
import { contextStorage } from "./context.back";

export type Dude = {
  _id: string;
  index: number;
  guid: string;
  isActive: boolean;
  balance: string;
  picture: string;
  age: number;
  eyeColor: string;
  name: string;
  gender: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  about: string;
  registered: string;
  latitude: number;
  longitude: number;
  tags: string[];
  friends: {
    id: number;
    name: string;
  }[];
  greeting: string;
  favoriteFruit: string;
};

export async function greet(dudes: Dude[]): Promise<{ msg: string }> {
  const ctx = contextStorage.getStore()
  await setTimeout(1000);
  return { msg: `Hello ${dudes[0].name} !! requestId ${ctx?.requestId}` };
}
