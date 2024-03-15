import type { Resolved } from "typia";
import { webserver } from "../index.back";
import { ParsingParamsError, SendingResponseError } from "./errors";

export function registerHandler<F extends (arg: any) => any>(
  handler: F,
  remoteName: string,
  parseParams: (
    input: Uint8Array
  ) => { params: Resolved<Parameters<F>[0]> } | null,
  bufferizeResponse: (input: { response: Awaited<ReturnType<F>> }) => Uint8Array
): void {
  console.log("registerHandler (proto) => " + remoteName + " init !");
  webserver.post("/ts-remote/" + remoteName, async (req, res) => {
    const parsedReq = parseParams(await req.buffer());
    if (!parsedReq) {
      throw new ParsingParamsError();
    }
    const result = await handler(parsedReq.params);
    const strRes = bufferizeResponse({ response: result });

    const sent = res.status(200).send(strRes);

    if (!sent) {
      throw new SendingResponseError();
    }
  });
}
