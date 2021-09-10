import { ReactNode, useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { AuthContext } from "../app/AuthProvider";

type GuardAuthenticatedProps = {
  children: ReactNode;
};

export function GuardAuthenticated({ children }: GuardAuthenticatedProps) {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const router = useRouter();
  const { isLoggedIn } = useContext(AuthContext);

  useEffect(() => {
    if (isRedirecting) return;

    if (!isLoggedIn) {
      setIsRedirecting(true);
      router.push("/login");
    }
  }, [isLoggedIn]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoggedIn) {
    return <>{children}</>;
  } else {
    return null;
  }
}
