import { FetchError } from 'src/types/common';
import { Locale } from 'src/types/Locale';

/**
 * General fetch wrapper
 * @param url string | URL
 * @param options RequestInit
 * @returns Parsed JSON response
 * @throws FetchError if response is not OK
 */

export async function fetcher<T = any>(
  url: string | URL,
  options?: RequestInit,
  lang?: string | Locale,
): Promise<T> {
  const resp = await fetch(url, options);

  let respObj: any = null;

  respObj = await resp.json();

  // try {
  //   respObj = await resp.json();
  // } catch (e: unknown) {
  //   // ignore JSON parse errors
  // }

  if (!resp.ok) {
    const err: FetchError = new Error(respObj?.message || 'Request failed');
    err.status = resp.status;
    err.details = respObj;
    throw err;
  }

  return respObj as T;
}
