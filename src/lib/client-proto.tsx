import { Resolved } from "typia";

export function factoryRemoteCall<
  Func extends (arg: any) => any,
  Res extends Awaited<ReturnType<Func>>
>(
  remoteName: string,
  paramsEncoder: (input: { params: Resolved<Parameters<Func>[0]> }) => Uint8Array,
  responseParser: (input: Uint8Array) => { response: Res } | null
): (param0: Parameters<Func>[0]) => Promise<Res> {
  return async (param0) => {
    const body = paramsEncoder({ params: param0 });
    const response = await fetch("/ts-remote/" + remoteName, {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
      },
      body,
    });

    if (!response.ok) {
      throw new Error("Network error");
    }
    const parsedResponse = responseParser(
      new Uint8Array(await response.arrayBuffer())
    );
    if (!parsedResponse) {
      throw new Error("Error while parsing response, unexpected format");
    }
    return parsedResponse.response;
  };
}
