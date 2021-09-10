import "../styles/globals.css";
import type { AppProps } from "next/app";
import Amplify from "aws-amplify";
import { AuthProvider } from "../client/app/AuthProvider";

// this should only be run once, on startup
Amplify.configure({
  ssr: true,
  Auth: {
    userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID,
    userPoolWebClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
  },
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}
export default MyApp;
