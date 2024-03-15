import { serialize, deserialize } from "seroval";
import { router } from "../index.back";
import { ParsingParamsError, SendingResponseError } from "./errors";

export function registerHandler<F extends (...args: any[]) => any>(
  handler: F,
  remoteName: string,
  isParams: (arg: unknown) => arg is Parameters<F>
): void {
  console.log("registerHandler (seroval) => " + remoteName + " init !");
  router.post("/" + remoteName, async (req, res) => {
    const parsedParams = deserialize(await req.text());
    if (!isParams(parsedParams)) {
      throw new ParsingParamsError();
    }
    const result = await handler(...parsedParams);
    const strRes = serialize(result);

    const sent = res.status(200).send(strRes);

    if (!sent) {
      throw new SendingResponseError();
    }
  });
}
