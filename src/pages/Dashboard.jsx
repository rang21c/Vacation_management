import React, { useState } from "react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { useVacation, VACATION_LABELS, VACATION_DAYS, VACATION_STATES } from "../context/VacationContext";

const MONTH_SHORT = ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"];

const VAC_COLORS = {
  FULL: "#7c3aed",
  AM_HALF: "#4f46e5",
  PM_HALF: "#0ea5e9",
  QUARTER: "#10b981",
};
const VAC_ICONS = { FULL: "🌴", AM_HALF: "☀️", PM_HALF: "🌙", QUARTER: "⚡" };

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: "#1e2538",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 8,
        padding: "8px 14px",
        fontSize: "0.82rem",
        color: "#f0f4ff",
      }}>
        <div>{payload[0].name}: <strong>{payload[0].value}일</strong></div>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const {
    year, vacationData, settings, usedDays, monthlyUsed,
    setTotalDays, clearDay, clearAll,
  } = useVacation();

  const [totalInput, setTotalInput] = useState(settings.totalDays);
  const [confirmClear, setConfirmClear] = useState(false);

  const remaining = Math.max(0, settings.totalDays - usedDays);
  const over = Math.max(0, usedDays - settings.totalDays);

  // 도넛 차트 데이터
  const donutData = [
    { name: "사용", value: Math.min(usedDays, settings.totalDays) },
    { name: "잔여", value: remaining },
  ];
  if (over > 0) donutData[0] = { name: "초과", value: usedDays };

  const donutColors = over > 0
    ? ["#ef4444", "#1e2538"]
    : ["#7c3aed", "#1e2538"];

  // 바 차트 데이터
  const barData = MONTH_SHORT.map((name, i) => ({
    name,
    사용: monthlyUsed[i],
  }));

  // 휴가 목록 (월별 그룹)
  const grouped = {};
  Object.entries(vacationData).forEach(([key, state]) => {
    const [y, m, d] = key.split("-");
    if (parseInt(y) !== year) return;
    const monthKey = `${y}-${m}`;
    if (!grouped[monthKey]) grouped[monthKey] = [];
    grouped[monthKey].push({ key, day: parseInt(d), state });
  });
  const sortedMonths = Object.keys(grouped).sort();

  const handleTotalBlur = () => {
    const v = parseFloat(totalInput);
    if (!isNaN(v) && v > 0) setTotalDays(v);
    else setTotalInput(settings.totalDays);
  };

  // 1년 전체 휴가 리스트를 날짜 순으로 정렬하여 간격 계산용 배열 생성
  const allVacationsSorted = Object.entries(vacationData)
    .filter(([key]) => key.startsWith(`${year}-`))
    .map(([key, state]) => ({ key, date: new Date(key), state }))
    .sort((a, b) => a.date - b.date);

  // 각 휴가 간격(이전 휴가 대비 경과일수) 연산 매핑
  const vacationIntervals = {};
  allVacationsSorted.forEach((item, index) => {
    if (index === 0) {
      vacationIntervals[item.key] = null; // 첫 휴가는 비교군 없음
    } else {
      const prevDate = allVacationsSorted[index - 1].date;
      const diffTime = Math.abs(item.date - prevDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      vacationIntervals[item.key] = diffDays;
    }
  });

  return (
    <div className="page-content">
      <div className="page-title">
        <span className="icon">📊</span>
        <span>{year}년 휴가 대시보드</span>
      </div>

      <div className="dashboard-grid">
        {/* ── 통계 카드 ── */}
        <div className="glass-card dashboard-stats">
          {/* 총 휴가 설정 */}
          <div className="total-days-setting">
            <label htmlFor="total-days-input">총 부여 휴가</label>
            <input
              id="total-days-input"
              type="number"
              className="total-days-input"
              value={totalInput}
              min="1"
              max="365"
              step="0.5"
              onChange={(e) => setTotalInput(e.target.value)}
              onBlur={handleTotalBlur}
              onKeyDown={(e) => e.key === "Enter" && handleTotalBlur()}
            />
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>일</span>
          </div>

          {/* 도넛 차트 */}
          <div className="donut-wrapper">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={88}
                  paddingAngle={3}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                >
                  {donutData.map((entry, i) => (
                    <Cell key={i} fill={donutColors[i]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* 범례 */}
          <div className="legend">
            <div className="legend-item">
              <div className="legend-dot" style={{ background: donutColors[0] }} />
              {over > 0 ? "초과" : "사용"}: {usedDays}일
            </div>
            <div className="legend-item">
              <div className="legend-dot" style={{ background: "#1e2538", border: "1px solid rgba(255,255,255,0.15)" }} />
              잔여: {remaining}일
            </div>
          </div>

          {/* 수치 */}
          <div className="stat-list" style={{ marginTop: 20 }}>
            <div className="stat-item total">
              <span className="stat-label">📋 총 부여 휴가</span>
              <span className="stat-value">{settings.totalDays}일</span>
            </div>
            <div className="stat-item used">
              <span className="stat-label">🌴 사용한 휴가</span>
              <span className="stat-value">{usedDays}일</span>
            </div>
            <div className="stat-item remain" style={over > 0 ? { borderColor: "rgba(239,68,68,0.3)" } : {}}>
              <span className="stat-label">✅ 잔여 휴가</span>
              <span className="stat-value" style={over > 0 ? { color: "#f87171" } : {}}>
                {over > 0 ? `-${over}일 (초과!)` : `${remaining}일`}
              </span>
            </div>
          </div>
        </div>

        {/* ── 월별 바 차트 ── */}
        <div className="glass-card dashboard-chart">
          <div style={{ fontWeight: 600, marginBottom: 16 }}>📈 월별 휴가 사용 현황</div>
          <div className="bar-chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#475569", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#475569", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(124,58,237,0.08)" }} />
                <Bar dataKey="사용" fill="#7c3aed" radius={[4, 4, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* 상태별 범례 */}
          <div style={{ marginTop: 20, fontWeight: 600, marginBottom: 12, fontSize: "0.9rem" }}>
            🎨 상태별 안내
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {Object.entries(VACATION_LABELS)
              .filter(([s]) => s !== "NONE")
              .map(([state, label]) => (
                <div key={state} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "0.83rem" }}>
                  <div style={{
                    width: 28, height: 14, borderRadius: 4,
                    background: `${VAC_COLORS[state]}40`,
                    border: `1px solid ${VAC_COLORS[state]}80`,
                    flexShrink: 0,
                  }} />
                  <span style={{ color: "var(--text-secondary)" }}>
                    {VAC_ICONS[state]} {label}
                  </span>
                  <span style={{ marginLeft: "auto", color: "var(--text-muted)", fontSize: "0.78rem" }}>
                    {VACATION_DAYS[state]}일 차감
                  </span>
                </div>
              ))}
          </div>
          <div style={{ marginTop: 12, fontSize: "0.75rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
            💡 날짜 클릭으로 상태 순환 | 우클릭으로 즉시 취소
          </div>
        </div>

        {/* ── 휴가 목록 ── */}
        <div className="glass-card dashboard-list">
          <div className="vacation-list-header">
            <span className="vacation-list-title">📋 등록된 휴가 목록</span>
            <div style={{ display: "flex", gap: 8 }}>
              {confirmClear ? (
                <>
                  <button className="btn btn-danger" onClick={() => { clearAll(); setConfirmClear(false); }}>
                    ✕ 확인 (전체 삭제)
                  </button>
                  <button className="btn btn-ghost" onClick={() => setConfirmClear(false)}>
                    취소
                  </button>
                </>
              ) : (
                <button className="btn btn-ghost" onClick={() => setConfirmClear(true)}>
                  🗑️ 전체 초기화
                </button>
              )}
            </div>
          </div>

          {sortedMonths.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🌴</div>
              <p>등록된 휴가가 없습니다</p>
              <p style={{ fontSize: "0.8rem" }}>달력에서 날짜를 클릭해 휴가를 등록해 보세요</p>
            </div>
          ) : (
            sortedMonths.map((monthKey) => {
              const [y, m] = monthKey.split("-");
              const items = grouped[monthKey].sort((a, b) => a.day - b.day);
              const monthTotal = items.reduce((s, item) => s + (VACATION_DAYS[item.state] || 0), 0);

              return (
                <div className="month-group" key={monthKey}>
                  <div className="month-group-title">
                    {parseInt(m)}월
                    <span style={{ fontWeight: 400, color: "var(--violet-light)", marginLeft: 8 }}>
                      {monthTotal}일
                    </span>
                  </div>
                  {items.map(({ key, day, state }) => {
                    const gapDays = vacationIntervals[key];
                    return (
                      <div className="vacation-item" key={key}>
                        <div className="vacation-item-left">
                          <span className="vacation-item-date">
                            {y}년 {parseInt(m)}월 {day}일
                          </span>
                          {gapDays !== null && gapDays !== undefined && (
                            <span className="vac-interval-badge">
                              {gapDays}일 만에 휴가
                            </span>
                          )}
                        </div>
                        <div className="vacation-item-right">
                          <span className={`vac-badge ${state}`}>
                            {VAC_ICONS[state]} {VACATION_LABELS[state]}
                          </span>
                          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                            {VACATION_DAYS[state]}일
                          </span>
                          <button
                            className="delete-btn"
                            onClick={() => clearDay(key)}
                            aria-label="삭제"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
