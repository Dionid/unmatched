import { BrowserRouter, Route, Routes, useNavigate } from "react-router";
import { DashboardPage } from "./pages/app/pages/dashboard";
import { AppLayout } from "./pages/app";
import { useEffect } from "react";

const Main = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/app");
  }, [navigate]);

  return null
};

const AppInner = () => {

  return (
    <Routes>
      <Route path="/" element={<Main />} />

      {/* <Route path="auth" element={<AuthLayout />}>
        <Route index path="signin" element={<LoginPage />} />
        <Route index path="signup" element={<SignUpPage />} />
      </Route> */}

      <Route path="app" element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
      </Route>
    </Routes>
  );
};

const App = () => {
  return (
    <BrowserRouter>
        <AppInner />
    </BrowserRouter>
  );
};

export default App;
