import { useContext } from "react";
import { AuthContext } from "../client/app/AuthProvider";

export default function LoginRequiredPage() {
  const { isLoggedIn, logout } = useContext(AuthContext);

  return (
    <>
      <p>
        This page is not password protected. If you logout, you'll stay here.
      </p>
      {isLoggedIn ? (
        <p>
          <button onClick={() => logout()}>Logout</button>
        </p>
      ) : (
        <p>You aren't logged in.</p>
      )}
    </>
  );
}
