import { Server } from "hyper-express";
import { Primitive } from "typia";

const webserver = new Server();

export class ParsingParamsError extends Error {}
export class SendingResponseError extends Error {}
export class UnexpectedAppError extends Error {}


export function registerHandler<F extends (...args: any[]) => any>(
  handler: F,
  remoteName: string,
  parseParams: (input: string) => Primitive<Parameters<F>> | null,
  stringifyResponse: (input: Awaited<ReturnType<F>>) => string
): void {
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
