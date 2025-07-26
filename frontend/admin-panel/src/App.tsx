import { PocketBaseProvider, usePocketBase } from "@/lib/paasible";
import { PaasibleApiProvider } from "@/lib/paasible";
import { LoginPage } from "./pages/auth/login";
import { BrowserRouter, Route, Routes, useNavigate } from "react-router";
import { DashboardPage } from "./pages/app/pages/dashboard";
import { AppLayout } from "./pages/app";
import { useEffect } from "react";
import { SignUpPage } from "./pages/auth/signup";
import { AuthLayout } from "./pages/auth/layout";

const Main = () => {
  const navigate = useNavigate();
  const pb = usePocketBase();

  useEffect(() => {
    if (!pb.authStore.isValid) {
      navigate("/auth");

      return;
    }

    navigate("/app");
  });

  return null;
};

const AppInner = () => {
  const pb = usePocketBase();

  return (
    <PaasibleApiProvider
      config={{
        host: import.meta.env.PROD ? "/" : "http://127.0.0.1:8090",
        pb,
      }}
    >
      <Routes>
        <Route path="/" element={<Main />} />

        <Route path="auth" element={<AuthLayout />}>
          <Route index path="signin" element={<LoginPage />} />
          <Route index path="signup" element={<SignUpPage />} />
        </Route>

        <Route path="app" element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
        </Route>
      </Routes>
    </PaasibleApiProvider>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <PocketBaseProvider
        host={import.meta.env.PROD ? "/" : "http://127.0.0.1:8090"}
      >
        <AppInner />
      </PocketBaseProvider>
    </BrowserRouter>
  );
};

export default App;
