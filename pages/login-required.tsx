import { useContext } from "react";
import { AuthContext } from "../client/app/AuthProvider";
import { GuardAuthenticated } from "../client/components/GuardAuthenticated";

export default function LoginRequiredPage() {
  const { logout } = useContext(AuthContext);

  return (
    <GuardAuthenticated>
      <p>
        You are logged in, which is good because authentication is required to
        view this page.
      </p>
      <p>
        <button onClick={() => logout()}>Logout</button>
      </p>
    </GuardAuthenticated>
  );
}
