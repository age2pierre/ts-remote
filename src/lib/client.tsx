import { Primitive, Resolved } from "typia";

export function factoryProtoRemoteCall<F extends (arg: any) => any>(
  remoteName: string,
  paramsEncoder: (input: {
    params: Resolved<Parameters<F>[0]>;
  }) => Uint8Array,
  responseParser: (
    input: Uint8Array
  ) => { response: Awaited<ReturnType<F>> } | null
): (param0: Parameters<F>[0]) => Promise<Awaited<ReturnType<F>>> {
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
    return parsedResponse.response as any;
  };
}

export function factoryRemoteCall<F extends (...args: any[]) => any>(
  remoteName: string,
  paramsEncoder: (input: Parameters<F>) => string,
  responseParser: (input: string) => Primitive<Awaited<ReturnType<F>>> | null
): (...params: Parameters<F>) => Promise<Awaited<ReturnType<F>>> {
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
