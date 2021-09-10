import type { NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useContext } from "react";
import { AuthContext } from "../client/app/AuthProvider";

function LogOutInMessage() {
  const { isLoggedIn, logout, user } = useContext(AuthContext);

  if (isLoggedIn) {
    return (
      <p>
        Logged in ({user!.username} | {user!.name} | {user!.email}).{" "}
        <button onClick={() => logout()}>Logout</button>
      </p>
    );
  } else {
    return <Link href="/login">Login</Link>;
  }
}

const Home: NextPage = () => {
  return (
    <>
      <p>
        <Link href="/login-required">Protected Page</Link> |{" "}
        <Link href="/dummies">Dummies (Protected)</Link> |{" "}
        <Link href="/dummies-ssr">Dummies SSR (Protected)</Link> |{" "}
        <Link href="/no-login">Public Page</Link>
      </p>

      <LogOutInMessage />
    </>
  );
};

export default Home;
