/**
 * Make an API request to the backend. This function is a wrapper around the
 * fetch API that adds some default headers and error handling, and also
 * makes it easier to pass query parameters and JSON bodies.
 */

export default async function makeApiRequest<T>(
  path: string,
  {
    urlParams = {},
    method = "GET",
    additionalHeaders = {},
    jsonBody = null,
    fetchOptions = {},
  }: {
    urlParams?: Record<string, string>;
    method?: "GET" | "POST" | "PUT" | "DELETE";
    additionalHeaders?: Record<string, string>;
    jsonBody?: Record<string, unknown> | null;
    fetchOptions?: Partial<RequestInit>;
  } = {}
): Promise<T> {
  const contentTypeHeaders: Record<string, string> = jsonBody
    ? { "Content-Type": "application/json" }
    : {};

  const url = new URL(`${import.meta.env.VITE_API_URL}${path}`);
  Object.entries(urlParams).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  const fetchResult = await fetch(url, {
    method,
    headers: {
      ...contentTypeHeaders,
      ...additionalHeaders,
    },
    body: jsonBody ? JSON.stringify(jsonBody) : undefined,
    ...fetchOptions,
  });

  if (!fetchResult.ok) {
    let errorMessage = `Error ${fetchResult.status} ${fetchResult.statusText}`;
    try {
      const errorBodyParsed = await fetchResult.json();
      errorMessage = errorBodyParsed.message;
      if (errorBodyParsed.hasOwnProperty("type") && errorBodyParsed.type === "InvalidParamsError") {
        return Promise.reject(errorBodyParsed.validationFailureReasons.join(" "));
      }
    } catch (_error) {
      // ignore
    }

    throw new Error(errorMessage);
  }

  return await fetchResult.json();
}
