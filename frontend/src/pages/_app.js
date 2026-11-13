import { useEffect } from "react";
import "../styles/globals.css";
import useAuthStore from "../store/authStore";

export default function App({ Component, pageProps }) {
  const hydrate = useAuthStore((state) => state.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return <Component {...pageProps} />;
}
