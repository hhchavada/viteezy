"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { routes } from "@/components/constants/route";
import { hasAuthToken } from "@/lib/utils";

interface RequireAuthProps {
  children: React.ReactNode;
}

export default function RequireAuth({ children }: RequireAuthProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (hasAuthToken()) {
      setIsAuthorized(true);
      return;
    }

    router.replace(routes.login);
  }, [router]);

  if (!isAuthorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-quiz-start-page">
        <p className="font-saans text-base text-light-gray-color">
          Redirecting to login...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
