import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/login";
import Dashboard from "../pages/Dashboard";

import ExamPage from "../pages/exam/ExamPage";
import ExamBuilderPage from "../pages/exam/ExamBuilderPage";

export default function AppRoutes() {
  return (
    <Routes>

      <Route path="/" element={<Navigate to="/login" />} />

      <Route path="/login" element={<Login />} />

      <Route path="/dashboard" element={<Dashboard />} />

      <Route path="/exam" element={<ExamPage />} />

      <Route path="/exam/:id" element={<ExamBuilderPage />} />

      <Route path="*" element={<h1>404 | Page Not Found</h1>} />

    </Routes>
  );
}
