import { useState, useEffect, useRef } from "react";

// ── Paleta & Tokens ──────────────────────────────────────────
const C = {
  bg:       "#0a0a0b",
  surface:  "#111114",
  card:     "#16161a",
  border:   "#1e1e24",
  border2:  "#2a2a32",
  text:     "#f0eff4",
  muted:    "#6b6b7a",
  subtle:   "#3a3a44",
  green:    "#00d084",
  greenDim: "#00d08418",
  red:      "#ff4d6d",
  redDim:   "#ff4d6d18",
  gold:     "#f5c842",
  goldDim:  "#f5c84218",
  blue:     "#4f8ef7",
  blueDim:  "#4f8ef718",
  purple:   "#a78bfa",
};

// ── Dados mock ───────────────────────────────────────────────
const MONTHS = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

const REVENUE_DATA = {
  "7d": [
    { label: "Seg", revenue: 420, appointments: 8 },
    { label: "Ter", revenue: 380, appointments: 7 },
    { label: "Qua", revenue: 590, appointments: 11 },
    { label: "Qui", revenue: 510, appointments: 9 },
    { label: "Sex", revenue: 740, appointments: 14 },
    { label: "Sáb", revenue: 860, appointments: 16 },
    { label: "Dom", revenue: 0, appointments: 0 },
  ],
  "30d": Array.from({ length: 30 }, (_, i) => ({
    label: `${i + 1}`,
    revenue: Math.round(200 + Math.random() * 600 + Math.sin(i / 3) * 150),
    appointments: Math.round(4 + Math.random() * 12),
  })),
  "12m": MONTHS.map((m, i) => ({
    label: m,
    revenue: Math.round(8000 + Math.sin(i / 2) * 3000 + i * 400),
    appointments: Math.round(120 + Math.sin(i / 2) * 40 + i * 5),
  })),
};

const SERVICES_RANK = [
  { name: "Corte + Barba", revenue: 4340, pct: 100, count: 62, color: C.gold },
  { name: "Corte Clássico", revenue: 2520, pct: 58, count: 72, color: C.blue },
  { name: "Barba",         revenue: 1575, pct: 36, count: 45, color: C.purple },
  { name: "Hidratação",    revenue: 880,  pct: 20, count: 16, color: C.green },
  { name: "Pigmentação",   revenue: 640,  pct: 15, count: 8,  color: C.red },
];

const BARBERS_RANK = [
  { name: "Lucas Ferreira", initials: "LF", revenue: 4180, appointments: 76, avg: 55, color: "#b45309" },
  { name: "Marcos Oliveira",initials: "MO", revenue: 3620, appointments: 68, avg: 53, color: "#065f46" },
  { name: "Diego Santos",   initials: "DS", revenue: 2155, appointments: 43, avg: 50, color: "#1e40af" },
];

const TRANSACTIONS = [
  { id: 1,  date: "Hoje 17:30", client: "Rafael Mendes",  service: "Corte + Barba", barber: "Lucas",  value: 70, status: "paid" },
  { id: 2,  date: "Hoje 16:00", client: "Pedro Alves",    service: "Corte",          barber: "Marcos", value: 45, status: "paid" },
  { id: 3,  date: "Hoje 14:30", client: "João Costa",     service: "Barba",           barber: "Diego",  value: 35, status: "paid" },
  { id: 4,  date: "Hoje 13:00", client: "Carlos Lima",    service: "Hidratação",      barber: "Lucas",  value: 55, status: "paid" },
  { id: 5,  date: "Hoje 11:00", client: "André Santos",   service: "Corte + Barba",   barber: "Marcos", value: 70, status: "cancelled" },
  { id: 6,  date: "Ontem 18:00",client: "Felipe Torres",  service: "Corte",            barber: "Diego",  value: 45, status: "paid" },
  { id: 7,  date: "Ontem 16:30",client: "Bruno Lima",     service: "Pigmentação",      barber: "Lucas",  value: 80, status: "paid" },
  { id: 8,  date: "Ontem 15:00",client: "Mateus Silva",   service: "Corte + Barba",   barber: "Marcos", value: 70, status: "paid" },
];

// ── Ícones SVG ───────────────────────────────────────────────
const Icon = ({ n, size = 16, stroke = 1.5 }) => {
  const d = {
    up:       <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>,
    down:     <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/>,
    dollar:   <><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></>,
    calendar: <><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></>,
    users:    <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
    scissors: <><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4L8.12 15.88M14.47 14.48L20 20M8.12 8.12L12 12"/></>,
    chart:    <><path d="M3 3v18h18"/><path d="M7 16l4-4 4 4 4-8"/></>,
    filter:   <><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></>,
    download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>,
    arrow:    <><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></>,
    star:     <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>,
  };
  return (
    <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth={stroke}
         strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      {d[n]}
    </svg>
  );
};

// ── Gráfico de barras custom ─────────────────────────────────
const BarChart = ({ data, period }) => {
  const [hovered, setHovered] = useState(null);
  const maxVal = Math.max(...data.map(d => d.revenue), 1);

  const visibleData = period === "30d"
    ? data.filter((_, i) => i % 3 === 0 || i === data.length - 1).slice(-10)
    : data;

  return (
    <div style={{ width: "100%", height: "180px", position: "relative" }}>
      {/* Grade horizontal */}
      {[0, 25, 50, 75, 100].map(pct => (
        <div key={pct} style={{
          position: "absolute", left: 0, right: 0,
          bottom: `${pct}%`, borderTop: `1px solid ${C.border}`,
        }} />
      ))}

      {/* Barras */}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", alignItems: "flex-end", gap: "6px", padding: "0 4px",
      }}>
        {visibleData.map((d, i) => {
          const h = d.revenue === 0 ? 2 : Math.max((d.revenue / maxVal) * 100, 4);
          const isHov = hovered === i;
          return (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column",
                                   alignItems: "center", gap: "6px", height: "100%",
                                   justifyContent: "flex-end" }}>
              {/* Tooltip */}
              {isHov && (
                <div style={{
                  position: "absolute", bottom: `${h + 2}%`,
                  background: C.text, color: C.bg, padding: "4px 8px",
                  borderRadius: "6px", fontSize: "11px", fontWeight: "700",
                  whiteSpace: "nowrap", pointerEvents: "none", zIndex: 10,
                  transform: "translateX(-50%)", left: "50%",
                }}>
                  R${d.revenue}
                </div>
              )}
              <div
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  width: "100%", height: `${h}%`,
                  borderRadius: "5px 5px 2px 2px",
                  background: d.revenue === 0
                    ? C.border
                    : isHov
                      ? `linear-gradient(180deg, ${C.gold}, ${C.gold}99)`
                      : `linear-gradient(180deg, ${C.gold}cc, ${C.gold}44)`,
                  transition: "all 0.15s",
                  cursor: "pointer",
                  boxShadow: isHov ? `0 0 16px ${C.gold}44` : "none",
                }}
              />
              <span style={{
                fontSize: period === "30d" ? "8px" : "10px",
                color: C.muted, whiteSpace: "nowrap",
              }}>{d.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Mini sparkline ───────────────────────────────────────────
const Sparkline = ({ data, color, height = 36, width = 80 }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      <defs>
        <linearGradient id={`sg-${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polygon
        points={`0,${height} ${pts} ${width},${height}`}
        fill={`url(#sg-${color.replace("#","")})`}
      />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
};

// ── Donut chart ──────────────────────────────────────────────
const DonutChart = ({ data }) => {
  const total = data.reduce((s, d) => s + d.revenue, 0);
  let cumPct = 0;
  const R = 44, cx = 56, cy = 56, stroke = 12;
  const circ = 2 * Math.PI * R;
  const segments = data.map(d => {
    const pct = d.revenue / total;
    const seg = { ...d, pct, offset: cumPct };
    cumPct += pct;
    return seg;
  });

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
      <svg width="112" height="112" style={{ flexShrink: 0 }}>
        <circle cx={cx} cy={cy} r={R} fill="none" stroke={C.border} strokeWidth={stroke}/>
        {segments.map((s, i) => (
          <circle key={i} cx={cx} cy={cy} r={R} fill="none"
                  stroke={s.color} strokeWidth={stroke}
                  strokeDasharray={`${s.pct * circ} ${circ}`}
                  strokeDashoffset={-s.offset * circ + circ / 4}
                  strokeLinecap="butt"
                  style={{ transition: "all 0.4s ease", opacity: 0.9 }}/>
        ))}
        <text x={cx} y={cy - 6} textAnchor="middle" fill={C.text} fontSize="13" fontWeight="800">
          R${(total/1000).toFixed(1)}k
        </text>
        <text x={cx} y={cy + 10} textAnchor="middle" fill={C.muted} fontSize="9">
          TOTAL
        </text>
      </svg>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
        {data.slice(0, 4).map((d, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "2px",
                          background: d.color, flexShrink: 0 }}/>
            <span style={{ fontSize: "11px", color: C.muted, flex: 1,
                           whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {d.name}
            </span>
            <span style={{ fontSize: "11px", color: C.text, fontWeight: "700", fontVariantNumeric: "tabular-nums" }}>
              {Math.round(d.revenue / total * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Componentes auxiliares ───────────────────────────────────
const StatCard = ({ label, value, sub, subUp, sparkData, color, icon, delay = 0 }) => (
  <div style={{
    background: C.card, border: `1px solid ${C.border}`, borderRadius: "16px",
    padding: "20px", display: "flex", flexDirection: "column", gap: "12px",
    animation: `fadeUp 0.5s ease ${delay}ms both`,
    position: "relative", overflow: "hidden",
  }}>
    <div style={{
      position: "absolute", top: 0, right: 0, width: "80px", height: "80px",
      background: `radial-gradient(circle at top right, ${color}12, transparent 70%)`,
    }}/>
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
      <div style={{ padding: "8px", borderRadius: "10px", background: `${color}18`, color }}>
        <Icon n={icon} size={16}/>
      </div>
      <div style={{
        display: "flex", alignItems: "center", gap: "4px", fontSize: "11px",
        fontWeight: "700", color: subUp ? C.green : C.red,
        background: subUp ? C.greenDim : C.redDim,
        padding: "3px 8px", borderRadius: "100px",
      }}>
        <Icon n={subUp ? "up" : "down"} size={10}/> {sub}
      </div>
    </div>
    <div>
      <p style={{ fontSize: "26px", fontWeight: "800", color: C.text,
                  fontFamily: "'Syne', sans-serif", lineHeight: 1 }}>{value}</p>
      <p style={{ fontSize: "12px", color: C.muted, marginTop: "4px" }}>{label}</p>
    </div>
    {sparkData && (
      <Sparkline data={sparkData} color={color} width={120} height={32}/>
    )}
  </div>
);

const Badge = ({ status }) => {
  const cfg = status === "paid"
    ? { label: "Pago", bg: C.greenDim, color: C.green }
    : { label: "Cancelado", bg: C.redDim, color: C.red };
  return (
    <span style={{
      fontSize: "10px", fontWeight: "700", padding: "3px 8px", borderRadius: "100px",
      background: cfg.bg, color: cfg.color, letterSpacing: "0.05em",
    }}>{cfg.label}</span>
  );
};

// ── Período selector ─────────────────────────────────────────
const PeriodTabs = ({ value, onChange }) => (
  <div style={{
    display: "flex", background: C.surface, border: `1px solid ${C.border}`,
    borderRadius: "10px", padding: "3px", gap: "2px",
  }}>
    {[["7d","7 dias"],["30d","30 dias"],["12m","12 meses"]].map(([v, label]) => (
      <button key={v} onClick={() => onChange(v)} style={{
        padding: "6px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: "600",
        border: "none", transition: "all 0.2s",
        background: value === v ? C.gold : "transparent",
        color: value === v ? C.bg : C.muted,
        cursor: "pointer",
      }}>{label}</button>
    ))}
  </div>
);

// ── App ──────────────────────────────────────────────────────
export default function ReportsPage() {
  const [period, setPeriod] = useState("30d");
  const [animKey, setAnimKey] = useState(0);

  const data = REVENUE_DATA[period];
  const totalRevenue = data.reduce((s, d) => s + d.revenue, 0);
  const totalAppts   = data.reduce((s, d) => s + d.appointments, 0);
  const avgTicket    = totalAppts > 0 ? Math.round(totalRevenue / totalAppts) : 0;
  const cancellations = TRANSACTIONS.filter(t => t.status === "cancelled").length;

  useEffect(() => { setAnimKey(k => k + 1); }, [period]);

  const sparkRevenue = REVENUE_DATA["30d"].filter((_,i) => i % 4 === 0).map(d => d.revenue);
  const sparkAppts   = REVENUE_DATA["30d"].filter((_,i) => i % 4 === 0).map(d => d.appointments);

  return (
    <div style={{
      minHeight: "100vh", background: C.bg,
      fontFamily: "'DM Sans', system-ui, sans-serif", color: C.text,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        button { cursor: pointer; font-family: inherit; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${C.border2}; border-radius: 4px; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes countUp {
          from { opacity: 0; transform: scale(0.8); }
          to   { opacity: 1; transform: scale(1); }
        }
        .row-hover:hover { background: ${C.surface} !important; }
        .tab-btn:hover { color: ${C.text} !important; }
      `}</style>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 24px" }}>

        {/* ── Header ── */}
        <div style={{
          display: "flex", alignItems: "flex-start", justifyContent: "space-between",
          marginBottom: "32px", flexWrap: "wrap", gap: "16px",
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
              <div style={{ padding: "8px", borderRadius: "10px", background: C.goldDim, color: C.gold }}>
                <Icon n="chart" size={18}/>
              </div>
              <h1 style={{ fontSize: "24px", fontWeight: "800", fontFamily: "'Syne', sans-serif",
                           letterSpacing: "-0.02em" }}>
                Relatórios & Financeiro
              </h1>
            </div>
            <p style={{ color: C.muted, fontSize: "13px" }}>
              Estilo & Tradição · Atualizado agora há pouco
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <PeriodTabs value={period} onChange={setPeriod}/>
            <button style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "9px 16px", borderRadius: "10px", fontSize: "12px", fontWeight: "600",
              background: C.card, border: `1px solid ${C.border}`, color: C.muted,
            }}>
              <Icon n="download" size={14}/> Exportar
            </button>
          </div>
        </div>

        {/* ── KPI Cards ── */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px", marginBottom: "24px",
        }} key={`kpi-${animKey}`}>
          <StatCard label="Receita do período" value={`R$ ${totalRevenue.toLocaleString("pt-BR")}`}
                    sub="12% vs anterior" subUp icon="dollar" color={C.gold} sparkData={sparkRevenue} delay={0}/>
          <StatCard label="Agendamentos" value={totalAppts} sub="8% vs anterior"
                    subUp icon="calendar" color={C.blue} sparkData={sparkAppts} delay={80}/>
          <StatCard label="Ticket médio" value={`R$ ${avgTicket}`} sub="3% vs anterior"
                    subUp icon="arrow" color={C.green} sparkData={sparkRevenue.map(v => v/8)} delay={160}/>
          <StatCard label="Cancelamentos" value={cancellations} sub="2 vs anterior"
                    subUp={false} icon="users" color={C.red} delay={240}/>
        </div>

        {/* ── Gráfico principal + Donut ── */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 340px", gap: "16px", marginBottom: "24px",
        }}>
          {/* Gráfico de receita */}
          <div style={{
            background: C.card, border: `1px solid ${C.border}`, borderRadius: "16px",
            padding: "24px", animation: "fadeUp 0.5s ease 100ms both",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between",
                          alignItems: "flex-start", marginBottom: "24px" }}>
              <div>
                <p style={{ fontSize: "14px", fontWeight: "700", color: C.text }}>Receita por período</p>
                <p style={{ fontSize: "12px", color: C.muted, marginTop: "2px" }}>
                  Total: <span style={{ color: C.gold, fontWeight: "700" }}>
                    R$ {totalRevenue.toLocaleString("pt-BR")}
                  </span>
                </p>
              </div>
              <div style={{ display: "flex", gap: "16px" }}>
                {[["Receita", C.gold], ["Agendamentos", C.blue]].map(([l, c]) => (
                  <div key={l} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "2px", background: c }}/>
                    <span style={{ fontSize: "11px", color: C.muted }}>{l}</span>
                  </div>
                ))}
              </div>
            </div>
            <BarChart data={data} period={period} key={`chart-${period}`}/>
          </div>

          {/* Donut */}
          <div style={{
            background: C.card, border: `1px solid ${C.border}`, borderRadius: "16px",
            padding: "24px", animation: "fadeUp 0.5s ease 180ms both",
          }}>
            <p style={{ fontSize: "14px", fontWeight: "700", color: C.text, marginBottom: "4px" }}>
              Mix de serviços
            </p>
            <p style={{ fontSize: "12px", color: C.muted, marginBottom: "20px" }}>
              Receita por categoria
            </p>
            <DonutChart data={SERVICES_RANK}/>
          </div>
        </div>

        {/* ── Ranking barbeiros + Ranking serviços ── */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px",
        }}>
          {/* Barbeiros */}
          <div style={{
            background: C.card, border: `1px solid ${C.border}`, borderRadius: "16px",
            padding: "24px", animation: "fadeUp 0.5s ease 200ms both",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
              <Icon n="star" size={14} stroke={0}/>
              <p style={{ fontSize: "14px", fontWeight: "700", color: C.text }}>Ranking barbeiros</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {BARBERS_RANK.map((b, i) => (
                <div key={b.name}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                    <div style={{ position: "relative" }}>
                      <div style={{
                        width: "38px", height: "38px", borderRadius: "10px", flexShrink: 0,
                        background: `${b.color}22`, border: `1.5px solid ${b.color}44`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "12px", fontWeight: "800", color: b.color,
                      }}>{b.initials}</div>
                      {i === 0 && (
                        <div style={{
                          position: "absolute", top: "-6px", right: "-6px", width: "16px", height: "16px",
                          borderRadius: "50%", background: C.gold, color: C.bg,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "9px", fontWeight: "900",
                        }}>1</div>
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: "13px", fontWeight: "700", color: C.text }}>{b.name}</span>
                        <span style={{ fontSize: "13px", fontWeight: "800", color: C.gold,
                                       fontFamily: "'Syne', sans-serif" }}>
                          R${b.revenue.toLocaleString("pt-BR")}
                        </span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "2px" }}>
                        <span style={{ fontSize: "11px", color: C.muted }}>{b.appointments} atendimentos</span>
                        <span style={{ fontSize: "11px", color: C.muted }}>Ø R${b.avg}</span>
                      </div>
                    </div>
                  </div>
                  {/* Barra de progresso */}
                  <div style={{ height: "3px", background: C.border, borderRadius: "2px" }}>
                    <div style={{
                      height: "100%", borderRadius: "2px",
                      width: `${(b.revenue / BARBERS_RANK[0].revenue) * 100}%`,
                      background: `linear-gradient(90deg, ${b.color}, ${b.color}88)`,
                      transition: "width 0.6s ease",
                    }}/>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Serviços */}
          <div style={{
            background: C.card, border: `1px solid ${C.border}`, borderRadius: "16px",
            padding: "24px", animation: "fadeUp 0.5s ease 260ms both",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
              <Icon n="scissors" size={14}/>
              <p style={{ fontSize: "14px", fontWeight: "700", color: C.text }}>Serviços mais rentáveis</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {SERVICES_RANK.map((s, i) => (
                <div key={s.name}>
                  <div style={{ display: "flex", justifyContent: "space-between",
                                alignItems: "center", marginBottom: "6px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "11px", fontWeight: "800", color: C.muted,
                                     width: "16px", fontFamily: "'Syne', sans-serif" }}>
                        {i + 1}
                      </span>
                      <span style={{ fontSize: "13px", fontWeight: "600", color: C.text }}>{s.name}</span>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: "13px", fontWeight: "800", color: s.color,
                                     fontFamily: "'Syne', sans-serif" }}>
                        R${s.revenue.toLocaleString("pt-BR")}
                      </span>
                      <span style={{ fontSize: "10px", color: C.muted, marginLeft: "6px" }}>
                        ({s.count}x)
                      </span>
                    </div>
                  </div>
                  <div style={{ height: "4px", background: C.border, borderRadius: "2px" }}>
                    <div style={{
                      height: "100%", borderRadius: "2px",
                      width: `${s.pct}%`,
                      background: s.color,
                      opacity: 0.8,
                      transition: "width 0.6s ease",
                    }}/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Transações recentes ── */}
        <div style={{
          background: C.card, border: `1px solid ${C.border}`, borderRadius: "16px",
          overflow: "hidden", animation: "fadeUp 0.5s ease 300ms both",
        }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "20px 24px", borderBottom: `1px solid ${C.border}`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Icon n="dollar" size={14}/>
              <p style={{ fontSize: "14px", fontWeight: "700", color: C.text }}>Transações recentes</p>
            </div>
            <button style={{
              display: "flex", alignItems: "center", gap: "6px", fontSize: "12px",
              fontWeight: "600", color: C.muted, background: "none", border: "none",
            }}>
              <Icon n="filter" size={12}/> Filtrar
            </button>
          </div>

          {/* Cabeçalho */}
          <div style={{
            display: "grid", gridTemplateColumns: "1.5fr 1.2fr 1fr 0.8fr 0.6fr",
            padding: "10px 24px", borderBottom: `1px solid ${C.border}`,
          }}>
            {["Cliente", "Serviço", "Barbeiro", "Valor", "Status"].map(h => (
              <span key={h} style={{ fontSize: "10px", fontWeight: "700", color: C.muted,
                                     textTransform: "uppercase", letterSpacing: "0.1em" }}>{h}</span>
            ))}
          </div>

          {/* Linhas */}
          {TRANSACTIONS.map((t, i) => (
            <div key={t.id} className="row-hover" style={{
              display: "grid", gridTemplateColumns: "1.5fr 1.2fr 1fr 0.8fr 0.6fr",
              padding: "13px 24px", borderBottom: i < TRANSACTIONS.length - 1 ? `1px solid ${C.border}` : "none",
              transition: "background 0.15s", cursor: "default",
              background: "transparent",
            }}>
              <div>
                <p style={{ fontSize: "13px", fontWeight: "600", color: C.text }}>{t.client}</p>
                <p style={{ fontSize: "11px", color: C.muted, marginTop: "1px" }}>{t.date}</p>
              </div>
              <span style={{ fontSize: "12px", color: C.muted, alignSelf: "center" }}>{t.service}</span>
              <span style={{ fontSize: "12px", color: C.muted, alignSelf: "center" }}>{t.barber}</span>
              <span style={{
                fontSize: "14px", fontWeight: "800", alignSelf: "center",
                fontFamily: "'Syne', sans-serif",
                color: t.status === "cancelled" ? C.muted : C.text,
                textDecoration: t.status === "cancelled" ? "line-through" : "none",
              }}>
                R$ {t.value}
              </span>
              <div style={{ alignSelf: "center" }}>
                <Badge status={t.status}/>
              </div>
            </div>
          ))}

          {/* Footer */}
          <div style={{
            padding: "14px 24px", borderTop: `1px solid ${C.border}`,
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <span style={{ fontSize: "12px", color: C.muted }}>
              Mostrando {TRANSACTIONS.length} transações
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "12px", color: C.muted }}>
                Total período:
              </span>
              <span style={{
                fontSize: "16px", fontWeight: "800", color: C.gold,
                fontFamily: "'Syne', sans-serif",
              }}>
                R$ {TRANSACTIONS.filter(t => t.status === "paid").reduce((s, t) => s + t.value, 0)}
              </span>
            </div>
          </div>
        </div>

        {/* ── Métricas adicionais ── */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginTop: "24px",
        }}>
          {[
            {
              label: "Hora de pico", value: "14h–16h", sub: "maior concentração de atendimentos",
              color: C.purple, bars: [3,5,4,8,12,14,10,7,5,4,6,8,14,16,12,8,5,3],
            },
            {
              label: "Dia mais lucrativo", value: "Sábado", sub: "média de R$ 860 por sábado",
              color: C.green, bars: [2,4,5,6,5,9,0,2,4,5,6,5,9,0,2,4,5,9],
            },
            {
              label: "Taxa de retorno", value: "68%", sub: "clientes que voltaram no mês",
              color: C.blue, bars: [40,45,50,55,58,60,62,63,65,66,67,68,68,68,68,68,68,68],
            },
          ].map((m, i) => (
            <div key={i} style={{
              background: C.card, border: `1px solid ${C.border}`, borderRadius: "16px",
              padding: "20px", animation: `fadeUp 0.5s ease ${320 + i * 60}ms both`,
            }}>
              <p style={{ fontSize: "12px", color: C.muted, marginBottom: "4px" }}>{m.label}</p>
              <p style={{ fontSize: "22px", fontWeight: "800", color: C.text,
                          fontFamily: "'Syne', sans-serif", marginBottom: "2px" }}>{m.value}</p>
              <p style={{ fontSize: "11px", color: C.muted, marginBottom: "12px" }}>{m.sub}</p>
              <Sparkline data={m.bars} color={m.color} width={200} height={40}/>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
