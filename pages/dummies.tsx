import { useContext } from "react";
import { AuthContext } from "../client/app/AuthProvider";
import { ErrorMessage } from "../client/components/ErrorMessage";
import { GuardAuthenticated } from "../client/components/GuardAuthenticated";
import { useDummies } from "../client/hooks/useDummies";
import { LoadingStatus } from "../client/lib/fetcher";

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

export default function DummiesPage() {
  return (
    <GuardAuthenticated>
      <Content />
    </GuardAuthenticated>
  );
}
