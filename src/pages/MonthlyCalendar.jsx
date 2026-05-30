import React, { useState } from "react";
import { useVacation } from "../context/VacationContext";
import DayCell from "../components/DayCell";

const MONTH_NAMES = [
  "1월","2월","3월","4월","5월","6월",
  "7월","8월","9월","10월","11월","12월",
];
const DOW_LABELS = ["일","월","화","수","목","금","토"];

function buildCalendarCells(year, month) {
  const firstDow = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

export default function MonthlyCalendar() {
  const { year, monthlyUsed, settings, usedDays } = useVacation();
  const currentMonth = new Date().getMonth() + 1;
  const [activeMonth, setActiveMonth] = useState(
    new Date().getFullYear() === year ? currentMonth : 1
  );

  const cells = buildCalendarCells(year, activeMonth);
  const monthUsed = monthlyUsed[activeMonth - 1];
  const remaining = settings.totalDays - usedDays;

  return (
    <div className="page-content">
      <div className="page-title">
        <span className="icon">📅</span>
        <span>{year}년 월별 달력</span>
      </div>

      {/* 월 탭 */}
      <div className="month-tabs" role="tablist">
        {MONTH_NAMES.map((name, i) => {
          const m = i + 1;
          const used = monthlyUsed[i];
          return (
            <button
              key={m}
              className={`month-tab ${activeMonth === m ? "active" : ""}`}
              onClick={() => setActiveMonth(m)}
              role="tab"
              aria-selected={activeMonth === m}
              id={`month-tab-${m}`}
            >
              {name}
              {used > 0 && (
                <span className="tab-badge">{used}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* 달력 */}
      <div className="glass-card calendar-wrapper">
        {/* 요일 헤더 */}
        <div className="calendar-header-row">
          {DOW_LABELS.map((d, i) => (
            <div
              key={d}
              className={`calendar-dow ${i === 0 ? "sun" : i === 6 ? "sat" : ""}`}
            >
              {d}
            </div>
          ))}
        </div>

        {/* 날짜 그리드 */}
        <div className="calendar-grid" role="grid" aria-label={`${year}년 ${activeMonth}월 달력`}>
          {cells.map((day, idx) =>
            day === null ? (
              <div key={`empty-${idx}`} className="day-cell empty" aria-hidden="true" />
            ) : (
              <DayCell
                key={`${year}-${activeMonth}-${day}`}
                year={year}
                month={activeMonth}
                day={day}
              />
            )
          )}
        </div>
      </div>

      {/* 월 요약 */}
      <div className="month-summary">
        <div className="month-summary-item">
          <div className="label">이 달 사용</div>
          <div className="value" style={{ color: "var(--violet-light)" }}>
            {monthUsed}일
          </div>
        </div>
        <div className="month-summary-item">
          <div className="label">연간 총 사용</div>
          <div className="value">{usedDays}일</div>
        </div>
        <div className="month-summary-item">
          <div className="label">총 부여 휴가</div>
          <div className="value">{settings.totalDays}일</div>
        </div>
        <div className="month-summary-item">
          <div className="label">잔여 휴가</div>
          <div
            className="value"
            style={{ color: remaining < 3 ? "var(--text-holiday)" : "var(--emerald)" }}
          >
            {remaining}일
          </div>
        </div>
      </div>
    </div>
  );
}
