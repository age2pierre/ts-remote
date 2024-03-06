import { createResource, type Component } from "solid-js";
import Comp from "./Comp";

import { greet } from "./hello.api";

const App: Component = () => {
  const [data] = createResource({ name: "foo" }, greet);

  return (
    <>
      <h1>{data() ?? "Hello ..."}</h1>
      <Comp />
    </>
  );
};

export default App;
