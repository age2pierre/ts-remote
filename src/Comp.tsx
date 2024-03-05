import { createIs } from "typia";

type Foo = {
  bar: number;
};

const isFoo = createIs<Foo>();

export default () => {
  return (
    <ul>
      <li>{`should be false => ${isFoo({ toto: 42 })}`} </li>
      <li>{`should be true => ${isFoo({ bar: 42 })}`} </li>
    </ul>
  );
};
