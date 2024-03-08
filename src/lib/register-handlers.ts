import type { Primitive, Resolved } from "typia";
import { webserver } from "../index.back";

export class ParsingParamsError extends Error {}
export class SendingResponseError extends Error {}
export class UnexpectedAppError extends Error {}

export function registerHandler<F extends (...args: any[]) => any>(
  handler: F,
  remoteName: string,
  parseParams: (input: string) => Primitive<Parameters<F>> | null,
  stringifyResponse: (input: Awaited<ReturnType<F>>) => string
): void {
  console.log("registerHandler => " + remoteName + " init !");
  webserver.post("/ts-remote/" + remoteName, async (req, res) => {
    const parsedReq = parseParams(await req.text());
    if (!parsedReq) {
      throw new ParsingParamsError();
    }
    const result = await handler(...parsedReq);
    const strRes = stringifyResponse(result);

    const sent = res.status(200).send(strRes);

    if (!sent) {
      throw new SendingResponseError();
    }
  });
}

export function registerProtobufHandler<F extends (arg: any) => any>(
  handler: F,
  remoteName: string,
  parseParams: (
    input: Uint8Array
  ) => { params: Resolved<Parameters<F>[0]> } | null,
  bufferizeResponse: (input: { response: Awaited<ReturnType<F>> }) => Uint8Array
): void {
  console.log("registerProtobufHandler => " + remoteName + " init !");
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
