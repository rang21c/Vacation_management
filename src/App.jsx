import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { VacationProvider } from "./context/VacationContext";
import Header from "./components/Header";
import MonthlyCalendar from "./pages/MonthlyCalendar";
import Dashboard from "./pages/Dashboard";
import YearlyCalendar from "./pages/YearlyCalendar";

export default function App() {
  return (
    <VacationProvider>
      <BrowserRouter basename="/Vacation_management">
        <div className="app-layout">
          <Header />
          <Routes>
            <Route path="/" element={<MonthlyCalendar />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/yearly" element={<YearlyCalendar />} />
          </Routes>
        </div>
      </BrowserRouter>
    </VacationProvider>
  );
}
