import type { Resolved } from "typia";
import { router } from "../index.back";
import { ParsingParamsError, SendingResponseError } from "./errors";

export function registerHandler<F extends (arg: any) => any>(
  handler: F,
  remoteName: string,
  parseParams: (
    input: Uint8Array
  ) => { params: Resolved<Parameters<F>[0]> } | null,
  encodeResponse: (input: { response: Awaited<ReturnType<F>> }) => Uint8Array
): void {
  console.log("registerHandler (proto) => " + remoteName + " init !");
  router.post("/" + remoteName, async (req, res) => {
    const parsedReq = parseParams(await req.buffer());
    if (!parsedReq) {
      throw new ParsingParamsError();
    }
    const result = await handler(parsedReq.params);
    const strRes = encodeResponse({ response: result });

    const sent = res.status(200).send(strRes);

    if (!sent) {
      throw new SendingResponseError();
    }
  });
}
