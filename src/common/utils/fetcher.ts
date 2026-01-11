import { FetchError } from 'src/types/common';
<<<<<<< HEAD
import { Locale } from 'src/types/Locale';
=======
// import { Locale } from 'src/types/Locale';
>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594

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
<<<<<<< HEAD
  lang?: string | Locale,
=======
  // lang?: string | Locale,
>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594
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
