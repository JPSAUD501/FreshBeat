import { useEffect } from "preact/hooks";

interface RedirectProps {
  url: string
  delay: number
}

export default function Redirect({ url, delay }: RedirectProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      globalThis.location.href = url;
    }, delay);

    return () => clearTimeout(timer);
  }, [url, delay]);

  return <p>Redirecionando...</p>;
}