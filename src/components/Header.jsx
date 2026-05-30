import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useVacation } from "../context/VacationContext";

export default function Header() {
  const { year, setYear, currentYear, theme, toggleTheme } = useVacation();
  const navigate = useNavigate();

  const handlePrev = () => setYear(year - 1);
  const handleNext = () => setYear(year + 1);

  return (
    <header className="header">
      <div className="header-inner">
        {/* 로고 */}
        <a className="header-logo" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
          <span className="logo-icon">🌴</span>
          <span>휴가 플래너</span>
        </a>

        {/* 네비게이션 */}
        <nav className="header-nav">
          <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            📅 월별 달력
          </NavLink>
          <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            📊 대시보드
          </NavLink>
          <NavLink to="/yearly" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            🗓️ 연간 달력
          </NavLink>
        </nav>

        {/* 연도 선택 및 테마 스위처 */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div className="year-selector">
            <button className="year-btn" onClick={handlePrev} aria-label="이전 연도">‹</button>
            <div className="year-display">
              <span className="year-num">{year}</span>
              {year === currentYear && (
                <span className="year-badge">현재</span>
              )}
            </div>
            <button className="year-btn" onClick={handleNext} aria-label="다음 연도">›</button>
          </div>

          <button
            className="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label="테마 전환"
            title="테마 전환"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
        </div>
      </div>
    </header>
  );
}
