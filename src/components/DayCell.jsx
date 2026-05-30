import React, { useState, useRef, useCallback } from "react";
import { useVacation, VACATION_STATES, VACATION_LABELS, VACATION_CYCLE, VACATION_DAYS } from "../context/VacationContext";
import { getHolidayName } from "../data/holidays";

const VAC_ICONS = {
  FULL: "🌴",
  AM_HALF: "☀️",
  PM_HALF: "🌙",
  QUARTER: "⚡",
};

const NEXT_STATE_LABELS = {
  NONE: "클릭하면 종일 휴가",
  FULL: "클릭하면 오전 반차",
  AM_HALF: "클릭하면 오후 반차",
  PM_HALF: "클릭하면 반반차",
  QUARTER: "클릭하면 초기화",
};

export default function DayCell({ year, month, day }) {
  const { toggleDay, clearDay, getDayState, getDateKey } = useVacation();
  const [showMenu, setShowMenu] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const [rippleKey, setRippleKey] = useState(null);
  const rippleRef = useRef(null);

  const dateKey = getDateKey(year, month, day);
  const state = getDayState(dateKey);
  const holidayName = getHolidayName(year, month, day);

  const today = new Date();
  const isToday =
    today.getFullYear() === year &&
    today.getMonth() + 1 === month &&
    today.getDate() === day;

  const dow = new Date(year, month - 1, day).getDay(); // 0=일, 6=토
  const isSat = dow === 6;
  const isSun = dow === 0;
  const isHoliday = !!holidayName;

  // 다음 상태 미리보기
  const nextLabel = NEXT_STATE_LABELS[state];

  const handleClick = useCallback(
    (e) => {
      // Ripple
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setRippleKey({ x, y, id: Date.now() });
      toggleDay(dateKey);
    },
    [dateKey, toggleDay]
  );

  const handleContextMenu = useCallback(
    (e) => {
      e.preventDefault();
      setMenuPos({ x: e.clientX, y: e.clientY });
      setShowMenu(true);
    },
    []
  );

  const handleClear = () => {
    clearDay(dateKey);
    setShowMenu(false);
  };

  // 컨텍스트 메뉴 닫기 (바깥 클릭)
  const handleOverlayClick = () => setShowMenu(false);

  const cellClass = [
    "day-cell",
    isSat ? "sat" : "",
    isSun ? "sun" : "",
    isHoliday ? "holiday" : "",
    isToday ? "today" : "",
    state !== VACATION_STATES.NONE ? `vac-${state}` : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <div
        className={cellClass}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        role="button"
        aria-label={`${month}월 ${day}일${holidayName ? ` (${holidayName})` : ""}${state !== VACATION_STATES.NONE ? ` - ${VACATION_LABELS[state]}` : ""}`}
      >
        {/* 휴가 오버레이 */}
        <div className="vac-overlay" />

        {/* 날짜 숫자 */}
        <span className="day-num">{day}</span>

        {/* 공휴일명 */}
        {holidayName && <span className="holiday-name">{holidayName}</span>}

        {/* 휴가 아이콘 */}
        {state !== VACATION_STATES.NONE && (
          <span className="vac-icon">{VAC_ICONS[state]}</span>
        )}

        {/* 툴팁 */}
        <div className="day-tooltip">
          {state !== VACATION_STATES.NONE && (
            <span style={{ color: "var(--violet-light)", marginRight: 4 }}>
              {VACATION_LABELS[state]} ({VACATION_DAYS[state]}일)
            </span>
          )}
          <span style={{ color: "var(--text-muted)" }}>{nextLabel}</span>
        </div>

        {/* Ripple */}
        {rippleKey && (
          <span
            key={rippleKey.id}
            className="ripple"
            style={{ left: rippleKey.x, top: rippleKey.y }}
            onAnimationEnd={() => setRippleKey(null)}
          />
        )}
      </div>

      {/* 컨텍스트 메뉴 */}
      {showMenu && (
        <>
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 999,
            }}
            onClick={handleOverlayClick}
          />
          <div
            className="context-menu"
            style={{ left: menuPos.x, top: menuPos.y }}
          >
            <div className="context-menu-item" onClick={handleOverlayClick}>
              📅 {month}월 {day}일
            </div>
            {state !== VACATION_STATES.NONE && (
              <div
                className="context-menu-item danger"
                onClick={handleClear}
              >
                ✕ 휴가 취소
              </div>
            )}
            {VACATION_CYCLE.filter((s) => s !== VACATION_STATES.NONE && s !== state).map(
              (s) => (
                <div
                  key={s}
                  className="context-menu-item"
                  onClick={() => {
                    clearDay(dateKey);
                    // 특정 상태로 직접 설정하기 위해 toggleDay를 사이클만큼 호출
                    // 대신 clearDay 후 toggleDay 반복
                    const targetIdx = VACATION_CYCLE.indexOf(s);
                    for (let i = 0; i < targetIdx; i++) toggleDay(dateKey);
                    setShowMenu(false);
                  }}
                >
                  {VAC_ICONS[s]} {VACATION_LABELS[s]} 설정
                </div>
              )
            )}
          </div>
        </>
      )}
    </>
  );
}
