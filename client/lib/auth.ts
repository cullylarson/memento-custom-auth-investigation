import { NextPageContext } from "next";
import { parseCookies, setCookie, destroyCookie } from "nookies";
import { decode } from "jsonwebtoken";

const authCookieNames = {
  details: "memento-auth-details",
  accessToken: "memento-auth-access-token",
  refreshToken: "memento-auth-refresh-token",
};

type AuthDetails = {
  rememberMe: boolean;
};

type AuthInfo = {
  details: AuthDetails | null;
  accessToken: string | null;
  refreshToken: string | null;
};

export type User = {
  username: string;
  name: string;
  email: string;
};

export type AuthSession = AuthInfo & {
  user: User | null;
  accessTokenExpiresAt: number | null;
  refreshTokenExpiresAt: number | null;
};

export function getAuthSession(
  ctx: NextPageContext | null = null
): AuthSession | null {
  const getDetails = (
    cookies: Record<string, string | object>
  ): AuthDetails => {
    const detailsRaw = cookies[authCookieNames.details] || null;

    return !detailsRaw
      ? null
      : typeof detailsRaw === "string"
      ? JSON.parse(detailsRaw)
      : detailsRaw;
  };

  const cookies = parseCookies(ctx);

  const info: AuthInfo = {
    details: cookies ? getDetails(cookies) : null,
    accessToken: cookies?.[authCookieNames.accessToken] || null,
    refreshToken: cookies?.[authCookieNames.refreshToken] || null,
  };

  return buildAuthSessionFromInfo(info);
}

function buildAuthSessionFromInfo({
  details,
  accessToken,
  refreshToken,
}: AuthInfo): AuthSession {
  // we can't verify the token (we could get the well-known keys, but they
  // could be easily changed by the user), but we just need some info. from
  // the token, nothing related to security
  const accessTokenDecoded = accessToken
    ? decode(accessToken, { complete: true })
    : null;
  const refreshTokenDecoded = refreshToken
    ? decode(refreshToken, { complete: true })
    : null;

  const user: User | null = accessTokenDecoded
    ? {
        username: accessTokenDecoded.payload["cognito:username"],
        name: accessTokenDecoded.payload.name,
        email: accessTokenDecoded.payload.email,
      }
    : null;

  return {
    details,
    accessToken,
    refreshToken,
    user,
    accessTokenExpiresAt: accessTokenDecoded?.payload?.exp || null,
    refreshTokenExpiresAt: refreshTokenDecoded?.payload?.exp || null,
  };
}

// if refresh is null, will attempt to retrieve it from current auth info
// if rememberMe is null, will attempt to retrieve it from current auth info
export const saveAuthSession = (
  {
    accessToken = null,
    refreshToken = null,
    rememberMe = false,
  }: {
    accessToken: string | null;
    refreshToken: string | null;
    rememberMe: boolean | null;
  },
  ctx: NextPageContext | null = null
) => {
  const authSession = getAuthSession(ctx);

  refreshToken = refreshToken || authSession?.refreshToken || null;

  rememberMe =
    rememberMe === null
      ? authSession?.details?.rememberMe || null
      : Boolean(rememberMe);

  const getCookieExpiresAt = (
    refreshToken: string | null,
    accessToken: string | null
  ) => {
    if (refreshToken) {
      const refreshTokenDecoded = decode(refreshToken, { complete: true });
      const refreshTokenExpiresAt = refreshTokenDecoded?.payload?.exp;

      return refreshTokenExpiresAt
        ? new Date(refreshTokenExpiresAt * 1000)
        : undefined;
    } else if (accessToken) {
      const accessTokenDecoded = decode(accessToken, { complete: true });
      const accessTokenExpiresAt = accessTokenDecoded?.payload?.exp;
      return accessTokenExpiresAt
        ? new Date(accessTokenExpiresAt * 1000)
        : undefined;
    } else {
      return undefined; // session cookie
    }
  };

  const cookieExpiresAt = rememberMe
    ? getCookieExpiresAt(refreshToken, accessToken)
    : undefined;

  const cookieValueDetails = JSON.stringify({ rememberMe });

  if (accessToken || refreshToken) {
    setCookie(ctx, authCookieNames.details, cookieValueDetails, {
      expires: cookieExpiresAt,
      path: "/",
    });
  }

  if (accessToken) {
    setCookie(ctx, authCookieNames.accessToken, accessToken, {
      expires: cookieExpiresAt,
      path: "/",
    });
  }

  if (refreshToken) {
    setCookie(ctx, authCookieNames.refreshToken, refreshToken, {
      expires: cookieExpiresAt,
      path: "/",
    });
  }

  return getAuthSession(ctx);
};

// cushion (in seconds) will be subtracted from expiresAt. This allows testing if a token expires "soon" and doing something
// like refreshing it, before it gets very close to expiring
export const tokenFresh = (expiresAt: number, cushion = 0) => {
  return Boolean(
    expiresAt && new Date().getTime() < (expiresAt - cushion) * 1000
  );
};
