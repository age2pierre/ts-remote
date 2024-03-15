import { serialize, deserialize } from "seroval";

export function factoryRemoteCall<
  Func extends (...args: any[]) => any,
  Res extends Awaited<ReturnType<Func>>
>(
  remoteName: string,
  isResponse: (arg: unknown) => arg is Res
): (...params: Parameters<Func>) => Promise<Res> {
  return async (...params: Parameters<Func>) => {
    const body = serialize(params);
    const response = await fetch("/ts-remote/" + remoteName, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
      },
      body,
    });

    if (!response.ok) {
      throw new Error("Network error");
    }
    const parsedResponse = deserialize(await response.text());
    if (!isResponse(parsedResponse)) {
      throw new Error("Error while parsing response, unexpected format");
    }
    return parsedResponse;
  };
}
