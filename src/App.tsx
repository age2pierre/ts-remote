import { createResource, type Component } from "solid-js";

import { greet, adieu } from "./hello.api";

import dataJson from "./data.json";

const App: Component = () => {
  const [dataGreet] = createResource(dataJson, greet);
  const [dataAdieu] = createResource(dataJson, adieu);
  return (
    <>
      <h1>{dataGreet() ?? "Hello ..."}</h1>
      <h1>{dataAdieu() ?? "Adieu ..."}</h1>
    </>
  );
};

export default App;
