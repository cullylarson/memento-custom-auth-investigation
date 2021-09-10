import { NextApiRequest, NextApiResponse } from "next";
import { CheckAuth } from "../../server/lib/auth";

const handler = CheckAuth((_req: NextApiRequest, res: NextApiResponse) => {
  return res.status(200).json([
    {
      id: "abc",
      title: "Something",
      description: "lorem ipsum",
    },
    {
      id: "def",
      title: "Hoops",
      description: "why?",
    },
    {
      id: "ghi",
      title: "Clues",
      description: "why not?",
    },
  ]);
});

export default handler;
