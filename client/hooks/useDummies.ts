import { useContext, useMemo } from "react";
import useSWR, { SWRResponse } from "swr";
import { AuthContext } from "../app/AuthProvider";
import { Fetcher, getLoadingStatus } from "../lib/fetcher";

type Dummy = {
  id: string;
  title: string;
  description: string;
};

export const useDummies = () => {
  const { getAccessToken } = useContext(AuthContext);

  const key = `/api/dummy`;

  const fetcher = useMemo(() => Fetcher(getAccessToken), [getAccessToken]);

  const { data, error }: SWRResponse<Dummy[], Error> = useSWR(key, fetcher);

  return {
    dummies: data || null,
    error,
    status: getLoadingStatus(key, data, error),
  };
};
