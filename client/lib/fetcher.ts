import urlJoin from "url-join";

type Fetcher<T = any, B = any> = (
  path: string,
  options?: FetcherOptions<B>
) => Promise<T>;

type FetcherCurried = (getAccessToken: () => Promise<string | null>) => Fetcher;

export type FetcherOptions<Body = any> = {
  method?: string;
  headers?: Record<string, string>;
  body?: Body;
};

export enum LoadingStatus {
  READY = "ready", // status if useSWR key === null (which means: don't fetch)
  LOADING = "loading",
  ERROR = "error",
  SUCCESS = "success",
}

export function getLoadingStatus<A, D, E>(
  key: A | null,
  data: D,
  error: E,
  // useSWR returns a `isValidating` prop, which is true if the request is being
  // fetched for the first time or is being revalidated. Most of the time you
  // don't want to use this as an isLoading test because useSWR will return
  // stale data while it's revalidating, so your UI can go on rendering as
  // normal and not indicate that data is loading. So if you used isValidating
  // as your isLoading test, your UI would show a loading state even though
  // it has stale data to work with and doesn't need to show a loading state.
  // However, sometimes you may want to show a loading state while revalidating.
  // In that case, just pass isValidating as the isLoadingOverride value and
  // this function will return the LOADING state if it's true.
  isLoadingOverride: boolean | undefined = undefined
): LoadingStatus {
  if (key === null) return LoadingStatus.READY;
  else if (error) return LoadingStatus.ERROR;
  else if (isLoadingOverride === true) return LoadingStatus.LOADING;
  else if (!error && !data) return LoadingStatus.LOADING;
  else return LoadingStatus.SUCCESS;
}

const throwErrorWithStatus = (
  status: number,
  error: Error & { status?: number }
) => {
  error.status = status;
  throw error;
};

const handleFetchResponse = async (response: Response) => {
  const data = await response.json();

  if (response.ok) {
    // whatever is set in the data, if the response is OK, trust it's an
    // acceptable payload
    return data;
  }

  // this is how memento-api reports an error
  if (data?.error && data?.error?.toString) {
    throwErrorWithStatus(response.status, Error(data.error.toString()));
  } else {
    // at this point we don't have an error message, so just return something generic
    throwErrorWithStatus(
      response.status,
      Error("Something went wrong and this request could not be completed.")
    );
  }
};

const baseUrl = "http://localhost:3000";

export const Fetcher: FetcherCurried =
  (getAccessToken) =>
  async (path, { method = "GET", headers = {}, body = undefined } = {}) => {
    const url = urlJoin(baseUrl, path);

    const accessToken = await getAccessToken();

    if (accessToken) {
      headers = {
        ...headers,
        Authorization: accessToken,
      };
    }

    const response = await fetch(url, {
      method,
      body: body === undefined ? undefined : JSON.stringify(body),
      headers,
    });

    return handleFetchResponse(response);
  };
