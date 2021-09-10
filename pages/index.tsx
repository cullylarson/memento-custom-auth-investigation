import type { NextPage } from "next";
import Link from "next/link";
import { useContext } from "react";
import { AuthContext } from "../client/app/AuthProvider";

const Home: NextPage = () => {
  const { isLoggedIn, logout } = useContext(AuthContext);

  if (isLoggedIn) {
    return (
      <p>
        Logged in. <button onClick={() => logout()}>Logout</button>
      </p>
    );
  } else {
    return <Link href="/login">Login</Link>;
  }
};

export default Home;
