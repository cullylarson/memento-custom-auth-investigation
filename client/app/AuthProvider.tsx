import { createContext, ReactNode, useEffect, useMemo, useState } from "react";
import { AuthSession, getAuthSession, tokenFresh, User } from "../lib/auth";

type AuthContextProps = {
  getAccessToken: () => Promise<string | null>;
  user: User | null;
  isLoggedIn: boolean;
};

export const AuthContext = createContext<AuthContextProps>({
  getAccessToken: async () => null,
  user: null,
  isLoggedIn: false,
});

// sort of mutex. make sure only one request is happening at a time
function SingletonP() {
  let active = false;
  let activeP: Promise<any> = Promise.resolve(null);

  return (f: (...args: any[]) => Promise<any>) =>
    (...args: any[]): Promise<any> => {
      if (active) return activeP;

      active = true;

      activeP = f
        .apply(null, args)
        .then((x: any) => {
          active = false;

          return x;
        })
        .catch((err: any) => {
          active = false;

          throw err;
        });

      return activeP;
    };
}

const refreshSingleton = SingletonP();

// It could be the case where multiple callers need a fresh access token at
// the same time. So we need to mutex this call.
const refresh = refreshSingleton(
  async (refreshToken: string): string | null => {
    // TODO -- left off
  }
);

async function getAccessToken(authSession: AuthSession | null) {
  const tokenCushion = 60; // 60 seconds

  if (!authSession) return null;

  // already have a current auth token
  if (
    authSession.accessToken &&
    authSession.accessTokenExpiresAt &&
    tokenFresh(authSession.accessTokenExpiresAt, tokenCushion)
  ) {
    return {
      didRefresh: false,
      accessToken: authSession.accessToken,
    };
  }
  // try to refresh
  else if (
    authSession.refreshToken &&
    authSession.refreshTokenExpiresAt &&
    tokenFresh(authSession.refreshTokenExpiresAt, tokenCushion)
  ) {
    return {
      didRefresh: true,
      accessToken: (await refresh()) as string,
    };
  } else {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [forceRefresh, setForceRefresh] = useState(0);

  const authSession = useMemo(() => {
    return getAuthSession();
  }, [forceRefresh]); // eslint-disable-line react-hooks/exhaustive-deps

  const [user, setUser] = useState(authSession?.user || null);

  useEffect(() => {
    setUser(authSession?.user || null);
  }, [authSession]);

  const contextValue: AuthContextProps = {
    getAccessToken: async () => {
      const result = await getAccessToken(authSession);

      if (!result) return null;

      const { didRefresh, accessToken } = result;

      if (didRefresh) {
        setForceRefresh((x) => x + 1);
      }

      return accessToken;
    },
    user,
    isLoggedIn: Boolean(user),
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}
