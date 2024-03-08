import { setTimeout } from "node:timers/promises";

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

export async function greet(dudes: Dude[]): Promise<string> {
  await setTimeout(1000);
  return `Hello ${dudes[0].name} !!`;
}

export async function adieu(dudes: Dude[]): Promise<string> {
  await setTimeout(1000);
  return `Adieu ${dudes[0].name} !!`;
}