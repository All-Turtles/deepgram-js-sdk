import crossFetch from "cross-fetch";
import { resolveHeadersConstructor } from "./helpers";
import type { Fetch } from "./types/Fetch";

export const resolveFetch = (): Fetch => {
  let _fetch: Fetch;
  if (typeof fetch === "undefined") {
    _fetch = crossFetch as unknown as Fetch;
  } else {
    _fetch = fetch;
  }
  return (...args) => _fetch(...args);
};

export const fetchWithAuth = (apiKey: string): Fetch => {
  const fetch = resolveFetch();
  const HeadersConstructor = resolveHeadersConstructor();

  return async (input, init) => {
    let headers = new HeadersConstructor(init?.headers);

    if (!headers.has("Authorization")) {
      // Customized by mmhmm to allow us to pass our access token
      // in the Authorization header using the standard "Bearer" prefix
      // instead of Deepgram's "Token" prefix.
      if (apiKey.startsWith("Bearer ")) {
        headers.set("Authorization", apiKey);
      } else {
        headers.set("Authorization", `Token ${apiKey}`);
      }
    }

    return fetch(input, { ...init, headers });
  };
};

export const resolveResponse = async () => {
  if (typeof Response === "undefined") {
    return (await import("cross-fetch")).Response;
  }

  return Response;
};
