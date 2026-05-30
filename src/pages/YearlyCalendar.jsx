import React from "react";
import { useVacation } from "../context/VacationContext";
import MiniCalendar from "../components/MiniCalendar";

export default function YearlyCalendar() {
  const { year, usedDays, settings, monthlyUsed } = useVacation();
  const remaining = Math.max(0, settings.totalDays - usedDays);
  const peakMonth = monthlyUsed.indexOf(Math.max(...monthlyUsed)) + 1;

  return (
    <div className="page-content">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div className="page-title" style={{ margin: 0 }}>
          <span className="icon">🗓️</span>
          <span>{year}년 연간 달력</span>
        </div>
        <button
          className="btn btn-ghost"
          onClick={() => window.print()}
          style={{ printColorAdjust: "exact" }}
        >
          🖨️ 인쇄 / PDF 저장
        </button>
      </div>

      {/* 연간 요약 바 */}
      <div className="yearly-summary-bar">
        <div className="summary-seg">
          <span className="summary-label">📋 총 부여</span>
          <span className="summary-value">{settings.totalDays}일</span>
        </div>
        <div style={{ width: 1, height: 24, background: "var(--glass-border)" }} />
        <div className="summary-seg">
          <span className="summary-label">🌴 사용</span>
          <span className="summary-value" style={{ color: "var(--violet-light)" }}>{usedDays}일</span>
        </div>
        <div style={{ width: 1, height: 24, background: "var(--glass-border)" }} />
        <div className="summary-seg">
          <span className="summary-label">✅ 잔여</span>
          <span className="summary-value" style={{ color: remaining < 3 ? "var(--text-holiday)" : "var(--emerald)" }}>
            {remaining}일
          </span>
        </div>
        {usedDays > 0 && (
          <>
            <div style={{ width: 1, height: 24, background: "var(--glass-border)" }} />
            <div className="summary-seg">
              <span className="summary-label">📅 가장 많이 쓴 달</span>
              <span className="summary-value">{peakMonth}월 ({monthlyUsed[peakMonth - 1]}일)</span>
            </div>
          </>
        )}
      </div>

      {/* 12개월 미니 달력 */}
      <div className="yearly-grid">
        {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
          <MiniCalendar key={month} month={month} />
        ))}
      </div>

      {/* 범례 */}
      <div style={{ display: "flex", gap: 20, marginTop: 20, flexWrap: "wrap", justifyContent: "center" }}>
        {[
          { label: "종일", color: "var(--vac-full)", bg: "var(--vac-full-bg)" },
          { label: "오전 반차", color: "var(--vac-am)", bg: "var(--vac-am-bg)" },
          { label: "오후 반차", color: "var(--vac-pm)", bg: "var(--vac-pm-bg)" },
          { label: "반반차", color: "var(--vac-quarter)", bg: "var(--vac-quarter-bg)" },
        ].map(({ label, color, bg }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.8rem", color: "var(--text-secondary)" }}>
            <div style={{ width: 14, height: 14, borderRadius: 3, background: bg, border: `1px solid ${color}` }} />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}
