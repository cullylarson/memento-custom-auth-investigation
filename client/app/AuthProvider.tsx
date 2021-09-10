import { createContext, ReactNode, useEffect, useState } from "react";
import { Auth } from "aws-amplify";
import { Loading } from "../components/Loading";
import { LoadingStatus } from "../lib/fetcher";

type User = {
  username: string;
  name: string;
  email: string;
};

type AuthorizePayload = {
  user: User;
  accessToken: string;
  refreshToken: string;
};

async function loginCognitoUser(
  username: string,
  password: string
): Promise<AuthorizePayload> {
  const user = await Auth.signIn(username, password);

  const idToken = user.signInUserSession.getIdToken();

  return {
    user: {
      username: idToken.payload["cognito:username"],
      name: idToken.payload.name,
      email: idToken.payload.email,
    },
    accessToken: user.signInUserSession.getAccessToken().getJwtToken(),
    refreshToken: user.signInUserSession.getRefreshToken().getToken(),
  };
}

type AuthContextProps = {
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
  user: User | null;
  isLoggedIn: boolean;
};

export const AuthContext = createContext<AuthContextProps>({
  login: async () => {},
  logout: async () => {},
  getAccessToken: async () => null,
  user: null,
  isLoggedIn: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loadingStatus, setLoadingStatus] = useState(LoadingStatus.LOADING);
  const [user, setUser] = useState<User | null>(null);

  const logout = async () => {
    await Auth.signOut();
    setUser(null);
  };

  const contextValue: AuthContextProps = {
    login: async (username, password) => {
      const result = await loginCognitoUser(username, password);

      setUser(result.user);
    },
    logout,
    getAccessToken: async () => {
      try {
        const result = await Auth.currentSession();
        return result.getAccessToken().getJwtToken();
      } catch (err) {
        await logout();
        return null;
      }
    },
    user,
    isLoggedIn: Boolean(user),
  };

  useEffect(() => {
    (async () => {
      try {
        const userCognito = await Auth.currentAuthenticatedUser();

        setUser({
          username: userCognito.username,
          name: userCognito.attributes.name,
          email: userCognito.attributes.email,
        });
        setLoadingStatus(LoadingStatus.SUCCESS);
      } catch (err) {
        // user isn't logged in
        setUser(null);
        setLoadingStatus(LoadingStatus.SUCCESS);
      }
    })();
  }, []);

  return (
    <AuthContext.Provider value={contextValue}>
      {loadingStatus === LoadingStatus.LOADING ? <Loading /> : children}
    </AuthContext.Provider>
  );
}
