import {
  createResource,
  type Component,
  // onMount,
  // createSignal,
} from "solid-js";

import { greet } from "./hello.api";

import dataJson from "./data.json";

const App: Component = () => {
  const [data] = createResource(dataJson, greet);
  return <h1>{data() ?? "Hello ..."}</h1>;

  // const [avg, setAvg] = createSignal<undefined | number>();
  // onMount(async () => {
  //   let totalTime = 0;
  //   for (let i = 0; i < 100; i++) {
  //     const startTime = performance.now();
  //     await greet(dataJson);
  //     const endTime = performance.now();
  //     totalTime += endTime - startTime;
  //   }
  //   const averageTime = totalTime / 100;
  //   setAvg(averageTime);
  // });
  // return <h1>{avg()?.toFixed(2) ?? "Hello ..."}</h1>;
};

export default App;
