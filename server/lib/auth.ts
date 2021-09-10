import { withSSRContext } from "aws-amplify";
import { decode } from "jsonwebtoken";
import {
  GetServerSidePropsContext,
  NextApiHandler,
  NextApiRequest,
  NextApiResponse,
} from "next";

// wraps an API handler, checks auth before running it
export function CheckAuth(handler: NextApiHandler) {
  return (req: NextApiRequest, res: NextApiResponse) => {
    const fail = () => {
      res
        .status(401)
        .json({ error: "not-authorized", message: "Not authoirzed." });
    };

    const accessToken = req?.headers?.authorization;

    if (!accessToken) return fail();

    try {
      const now = Math.floor(Date.now() / 1000);

      const accessTokenDecoded = decode(accessToken, { complete: true });

      if (!accessTokenDecoded?.payload?.username) {
        return fail();
      }

      const expiresAt = accessTokenDecoded?.payload?.exp;

      if (!expiresAt || expiresAt <= now) {
        return fail();
      }
    } catch (err) {
      return fail();
    }

    return handler(req, res);
  };
}

export async function getAccessToken(
  ctx: GetServerSidePropsContext
): Promise<string | null> {
  const ssr = withSSRContext({ req: ctx.req });

  try {
    return (await ssr.Auth.currentAuthenticatedUser()).signInUserSession
      .getAccessToken()
      .getJwtToken();
  } catch (err) {
    console.log(err);
    return null;
  }
}
