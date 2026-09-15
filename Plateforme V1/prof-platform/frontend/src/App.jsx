import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import client from "./api/client";
import Sidebar from "./components/Sidebar";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Classes from "./pages/Classes";
import ClasseDetail from "./pages/ClasseDetail";
import EleveDetail from "./pages/EleveDetail";
import Cours from "./pages/Cours";
import CoursDetail from "./pages/CoursDetail";
import Planning from "./pages/Planning";
import SeanceDetail from "./pages/SeanceDetail";

import Competences from "./pages/competences";
import Activites from "./pages/Activites";
import Evaluations from "./pages/Evaluations";
import Progression from "./pages/Progression";

import Teachers from "./pages/Teachers";
import Messages from "./pages/Messages";

function ProtectedApp() {
  return (
    <div className="app-shell app-shell-root">
      <Sidebar />

      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/teachers" element={<Teachers />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/classes" element={<Classes />} />
        <Route path="/classes/:id" element={<ClasseDetail />} />
        <Route path="/eleves/:id" element={<EleveDetail />} />
        <Route path="/cours" element={<Cours />} />
        <Route path="/cours/:id" element={<CoursDetail />} />
        <Route path="/planning" element={<Planning />} />
        <Route path="/seances/:id" element={<SeanceDetail />} />
        <Route path="/competences" element={<Competences />} />
        <Route path="/activites" element={<Activites />} />
        <Route path="/evaluations" element={<Evaluations />} />
        <Route path="/progression" element={<Progression />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      const session = JSON.parse(localStorage.getItem("teacher_session") || "null");
      return !!(session && session.id);
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const raw = localStorage.getItem("teacher_session");
    if (!raw) {
      setIsAuthenticated(false);
      return;
    }

    try {
      const session = JSON.parse(raw);
      if (!session || !session.id) {
        localStorage.removeItem("teacher_session");
        setIsAuthenticated(false);
        return;
      }

      client
        .get("/me", { params: { user_id: session.id } })
        .then(() => setIsAuthenticated(true))
        .catch(() => {
          localStorage.removeItem("teacher_session");
          setIsAuthenticated(false);
        });
    } catch {
      localStorage.removeItem("teacher_session");
      setIsAuthenticated(false);
    }
  }, []);

  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <BrowserRouter>
      <ProtectedApp />
    </BrowserRouter>
  );
}
