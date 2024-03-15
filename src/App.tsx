import { createResource, type Component } from "solid-js";

import { greet } from "./hello.api";

import dataJson from "./data.json";

const App: Component = () => {
  const [dataGreet] = createResource(dataJson, (data) => greet(data));
  return (
    <>
      <h1>{dataGreet()?.msg ?? "Hello ..."}</h1>
    </>
  );
};

export default App;
