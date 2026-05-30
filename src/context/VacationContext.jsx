import React, { createContext, useContext, useReducer, useEffect } from "react";

// 휴가 상태 사이클
// NONE → FULL → AM_HALF → PM_HALF → QUARTER → NONE
export const VACATION_STATES = {
  NONE: "NONE",
  FULL: "FULL",         // 종일 (1.0일)
  AM_HALF: "AM_HALF",  // 오전 반차 (0.5일)
  PM_HALF: "PM_HALF",  // 오후 반차 (0.5일)
  QUARTER: "QUARTER",  // 반반차 (0.25일)
};

export const VACATION_DAYS = {
  NONE: 0,
  FULL: 1,
  AM_HALF: 0.5,
  PM_HALF: 0.5,
  QUARTER: 0.25,
};

export const VACATION_CYCLE = [
  VACATION_STATES.NONE,
  VACATION_STATES.FULL,
  VACATION_STATES.AM_HALF,
  VACATION_STATES.PM_HALF,
  VACATION_STATES.QUARTER,
];

export const VACATION_LABELS = {
  NONE: "없음",
  FULL: "종일",
  AM_HALF: "오전 반차",
  PM_HALF: "오후 반차",
  QUARTER: "반반차",
};

function loadFromStorage(year) {
  try {
    const raw = localStorage.getItem(`vacation_data_${year}`);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function loadSettings() {
  try {
    const raw = localStorage.getItem("vacation_settings");
    return raw ? JSON.parse(raw) : { totalDays: 15 };
  } catch {
    return { totalDays: 15 };
  }
}

function saveToStorage(year, data) {
  localStorage.setItem(`vacation_data_${year}`, JSON.stringify(data));
}

function saveSettings(settings) {
  localStorage.setItem("vacation_settings", JSON.stringify(settings));
}

const currentYear = new Date().getFullYear();

// 초기 테마 로드
const loadTheme = () => {
  try {
    const raw = localStorage.getItem("vacation_theme");
    return raw || "dark";
  } catch {
    return "dark";
  }
};

const initialState = {
  year: currentYear,
  vacationData: loadFromStorage(currentYear),
  settings: loadSettings(),
  theme: loadTheme(),
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_YEAR": {
      const newYear = action.payload;
      return {
        ...state,
        year: newYear,
        vacationData: loadFromStorage(newYear),
      };
    }
    case "TOGGLE_DAY": {
      const { dateKey } = action.payload;
      const current = state.vacationData[dateKey] || VACATION_STATES.NONE;
      const idx = VACATION_CYCLE.indexOf(current);
      const next = VACATION_CYCLE[(idx + 1) % VACATION_CYCLE.length];
      const newData =
        next === VACATION_STATES.NONE
          ? (() => {
              const d = { ...state.vacationData };
              delete d[dateKey];
              return d;
            })()
          : { ...state.vacationData, [dateKey]: next };
      saveToStorage(state.year, newData);
      return { ...state, vacationData: newData };
    }
    case "CLEAR_DAY": {
      const { dateKey } = action.payload;
      const newData = { ...state.vacationData };
      delete newData[dateKey];
      saveToStorage(state.year, newData);
      return { ...state, vacationData: newData };
    }
    case "CLEAR_ALL": {
      saveToStorage(state.year, {});
      return { ...state, vacationData: {} };
    }
    case "SET_TOTAL_DAYS": {
      const settings = { ...state.settings, totalDays: action.payload };
      saveSettings(settings);
      return { ...state, settings };
    }
    case "TOGGLE_THEME": {
      const nextTheme = state.theme === "dark" ? "light" : "dark";
      localStorage.setItem("vacation_theme", nextTheme);
      return { ...state, theme: nextTheme };
    }
    default:
      return state;
  }
}

const VacationContext = createContext(null);

export function VacationProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    // <body> 태그에 data-theme="dark/light" 속성 설정
    document.body.setAttribute("data-theme", state.theme);
  }, [state.theme]);

  const setYear = (year) => dispatch({ type: "SET_YEAR", payload: year });
  const toggleDay = (dateKey) => dispatch({ type: "TOGGLE_DAY", payload: { dateKey } });
  const clearDay = (dateKey) => dispatch({ type: "CLEAR_DAY", payload: { dateKey } });
  const clearAll = () => dispatch({ type: "CLEAR_ALL" });
  const setTotalDays = (days) => dispatch({ type: "SET_TOTAL_DAYS", payload: days });
  const toggleTheme = () => dispatch({ type: "TOGGLE_THEME" });

  const usedDays = Object.values(state.vacationData).reduce(
    (sum, s) => sum + (VACATION_DAYS[s] || 0),
    0
  );

  const monthlyUsed = Array.from({ length: 12 }, (_, i) => {
    const month = String(i + 1).padStart(2, "0");
    return Object.entries(state.vacationData)
      .filter(([key]) => key.startsWith(`${state.year}-${month}`))
      .reduce((sum, [, s]) => sum + (VACATION_DAYS[s] || 0), 0);
  });

  const getDateKey = (year, month, day) =>
    `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const getDayState = (dateKey) =>
    state.vacationData[dateKey] || VACATION_STATES.NONE;

  return (
    <VacationContext.Provider
      value={{
        year: state.year,
        vacationData: state.vacationData,
        settings: state.settings,
        theme: state.theme,
        usedDays,
        monthlyUsed,
        setYear,
        toggleDay,
        clearDay,
        clearAll,
        setTotalDays,
        toggleTheme,
        getDateKey,
        getDayState,
        currentYear,
      }}
    >
      {children}
    </VacationContext.Provider>
  );
}

export function useVacation() {
  const ctx = useContext(VacationContext);
  if (!ctx) throw new Error("useVacation must be used within VacationProvider");
  return ctx;
}
