import { usePocketBase } from "@/lib/paasible";
import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router";

export const AuthLayout = () => {
  const navigate = useNavigate();
  const pb = usePocketBase();

  useEffect(() => {
    if (pb.authStore.isValid) {
      navigate("/app");

      return;
    }

    if (!window.location.pathname.includes("/auth/signup")) {
      // If the user is not authenticated, redirect to the login page
      navigate("/auth/signin");
    }
  }, [pb.authStore.isValid, navigate]);

  return <Outlet />;
};
