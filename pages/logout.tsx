import { useContext, useEffect } from "react";
import { useRouter } from "next/router";
import { AuthContext } from "../client/app/AuthProvider";

export default function LogoutPage() {
  const router = useRouter();
  const { logout } = useContext(AuthContext);

  useEffect(() => {
    (async () => {
      await logout();
      router.replace("/");
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
