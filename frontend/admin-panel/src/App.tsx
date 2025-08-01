import { BrowserRouter, Route, Routes, useNavigate } from "react-router";
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
      <Route path="app">
        <Route path=":roomId" element={<AppLayout />} />
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
