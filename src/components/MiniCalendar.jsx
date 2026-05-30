import React from "react";
import { useVacation, VACATION_STATES, VACATION_DAYS } from "../context/VacationContext";
import { getHolidayName } from "../data/holidays";

const DOW_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

export default function MiniCalendar({ month }) {
  const { year, getDayState, getDateKey, monthlyUsed } = useVacation();

  const monthUsed = monthlyUsed[month - 1];

  // 해당 월의 날짜 배열 생성
  const firstDow = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const today = new Date();

  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const monthNames = [
    "1월","2월","3월","4월","5월","6월",
    "7월","8월","9월","10월","11월","12월",
  ];

  return (
    <div className="glass-card mini-calendar">
      <div className="mini-cal-title">
        <span>{monthNames[month - 1]}</span>
        {monthUsed > 0 && (
          <span className="mini-month-used">🌴 {monthUsed}일 사용</span>
        )}
      </div>

      {/* 요일 헤더 */}
      <div className="mini-dow-row">
        {DOW_LABELS.map((d, i) => (
          <div
            key={d}
            className={`mini-dow ${i === 0 ? "sun" : i === 6 ? "sat" : ""}`}
          >
            {d}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="mini-grid">
        {cells.map((day, idx) => {
          if (day === null) {
            return <div key={`e-${idx}`} className="mini-day empty" />;
          }

          const dateKey = getDateKey(year, month, day);
          const state = getDayState(dateKey);
          const holidayName = getHolidayName(year, month, day);
          const dow = new Date(year, month - 1, day).getDay();
          const isSat = dow === 6;
          const isSun = dow === 0;
          const isHoliday = !!holidayName;
          const isToday =
            today.getFullYear() === year &&
            today.getMonth() + 1 === month &&
            today.getDate() === day;

          const cls = [
            "mini-day",
            isSat ? "sat" : "",
            isSun ? "sun" : "",
            isHoliday ? "holiday" : "",
            isToday ? "today" : "",
            state !== VACATION_STATES.NONE ? `vac-${state}` : "",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <div key={day} className={cls} title={holidayName || undefined}>
              <div className="mini-vac-overlay" />
              <span style={{ position: "relative", zIndex: 1 }}>{day}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
