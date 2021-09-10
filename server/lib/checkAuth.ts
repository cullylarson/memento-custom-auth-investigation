import { decode } from "jsonwebtoken";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

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
