import { Primitive } from "typia";

export function factoryRemoteCall<Func extends (...args: any[]) => any>(
  remoteName: string,
  paramsEncoder: (input: Parameters<Func>) => string,
  responseParser: (input: string) => Primitive<Awaited<ReturnType<Func>>> | null
): (...params: Parameters<Func>) => Promise<Awaited<ReturnType<Func>>> {
  return async (...params) => {
    const body = paramsEncoder(params);
    const response = await fetch("/ts-remote/" + remoteName, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body,
    });

    if (!response.ok) {
      throw new Error("Network error");
    }
    const parsedResponse = responseParser(await response.text());
    if (!parsedResponse) {
      throw new Error("Error while parsing response, unexpected format");
    }
    return parsedResponse;
  };
}
