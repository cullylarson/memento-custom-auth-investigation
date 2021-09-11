import useSWR, { SWRResponse } from "swr";
import { getLoadingStatus, useFetcher } from "../lib/fetcher";

type Dummy = {
  id: string;
  title: string;
  description: string;
};

export const endpointPath = "/api/dummy";

export const useDummies = () => {
  const fetcher = useFetcher();

  const key = endpointPath;

  const { data, error }: SWRResponse<Dummy[], Error> = useSWR(key, fetcher);

  return {
    dummies: data || null,
    error,
    status: getLoadingStatus(key, data, error),
  };
};
