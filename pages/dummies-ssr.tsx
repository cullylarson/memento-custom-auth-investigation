import { useContext } from "react";
import { GetServerSideProps } from "next";
import { SWRConfig } from "swr";
import { AuthContext } from "../client/app/AuthProvider";
import { ErrorMessage } from "../client/components/ErrorMessage";
import { GuardAuthenticated } from "../client/components/GuardAuthenticated";
import { useDummies, endpointPath } from "../client/hooks/useDummies";
import { Fetcher, LoadingStatus } from "../client/lib/fetcher";
import { getAccessToken } from "../server/lib/auth";

function Content() {
  const { dummies, status } = useDummies();
  const { logout } = useContext(AuthContext);

  if (status === LoadingStatus.LOADING) {
    return null;
  } else if (status === LoadingStatus.ERROR) {
    return <ErrorMessage>Something went wrong.</ErrorMessage>;
  }

  return (
    <>
      {dummies && dummies.length ? (
        <ul>
          {dummies.map((dummy) => (
            <li key={dummy.id}>{dummy.title}</li>
          ))}
        </ul>
      ) : (
        <em>No dummies</em>
      )}
      <p>
        <button onClick={() => logout()}>Logout</button>
      </p>
    </>
  );
}

type DummiesSsrPageProps = {
  fallback: Record<string, any>;
};

export default function DummiesSsrPage({ fallback }: DummiesSsrPageProps) {
  return (
    <GuardAuthenticated>
      <SWRConfig value={{ fallback }}>
        <Content />
      </SWRConfig>
    </GuardAuthenticated>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const dummies = await (async () => {
    try {
      return Fetcher(() => getAccessToken(ctx))(endpointPath);
    } catch (err) {
      return [];
    }
  })();

  return {
    props: {
      fallback: {
        [endpointPath]: dummies,
      },
    },
  };
};
