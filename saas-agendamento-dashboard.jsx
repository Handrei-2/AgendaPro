import { useState } from "react";

// ── Dados de exemplo ────────────────────────────────────────
const COMPANY = { name: "Estilo & Tradição", plan: "PRO" };

const TODAY_APPOINTMENTS = [
  { id: 1, time: "09:00", client: "Rafael Mendes", service: "Corte + Barba", barber: "Lucas", duration: 60, status: "confirmed", avatar: "RM" },
  { id: 2, time: "10:00", client: "Pedro Alves", service: "Corte", barber: "Marcos", duration: 30, status: "scheduled", avatar: "PA" },
  { id: 3, time: "11:00", client: "João Costa", service: "Barba", barber: "Lucas", duration: 30, status: "in_progress", avatar: "JC" },
  { id: 4, time: "13:30", client: "Carlos Lima", service: "Corte + Barba", barber: "Diego", duration: 60, status: "scheduled", avatar: "CL" },
  { id: 5, time: "14:30", client: "André Santos", service: "Corte", barber: "Marcos", duration: 30, status: "scheduled", avatar: "AS" },
  { id: 6, time: "15:30", client: "Felipe Torres", service: "Corte + Barba", barber: "Lucas", duration: 60, status: "scheduled", avatar: "FT" },
];

const BARBERS = [
  { id: 1, name: "Lucas Ferreira", role: "Barbeiro Sênior", appointments: 4, avatar: "LF", color: "#7C3AED" },
  { id: 2, name: "Marcos Oliveira", role: "Barbeiro", appointments: 3, avatar: "MO", color: "#059669" },
  { id: 3, name: "Diego Santos", role: "Barbeiro", appointments: 2, avatar: "DS", color: "#D97706" },
];

const SERVICES = [
  { id: 1, name: "Corte", duration: 30, price: 35 },
  { id: 2, name: "Barba", duration: 30, price: 25 },
  { id: 3, name: "Corte + Barba", duration: 60, price: 55 },
  { id: 4, name: "Hidratação", duration: 45, price: 40 },
];

const STATUS_CONFIG = {
  confirmed:    { label: "Confirmado",   bg: "bg-emerald-500/10", text: "text-emerald-400", dot: "bg-emerald-400" },
  scheduled:    { label: "Agendado",     bg: "bg-blue-500/10",    text: "text-blue-400",    dot: "bg-blue-400"    },
  in_progress:  { label: "Em andamento", bg: "bg-amber-500/10",   text: "text-amber-400",   dot: "bg-amber-400"   },
  completed:    { label: "Concluído",    bg: "bg-slate-500/10",   text: "text-slate-400",   dot: "bg-slate-400"   },
  cancelled:    { label: "Cancelado",    bg: "bg-red-500/10",     text: "text-red-400",      dot: "bg-red-400"    },
};

// ── Ícones SVG ──────────────────────────────────────────────
const Icon = ({ name, size = 20 }) => {
  const icons = {
    grid: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
    calendar: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,
    users: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    scissors: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4L8.12 15.88M14.47 14.48L20 20M8.12 8.12L12 12"/></svg>,
    chart: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M3 3v18h18"/><path d="M7 16l4-4 4 4 4-8"/></svg>,
    settings: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
    plus: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>,
    clock: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
    trending: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M23 6l-9.5 9.5-5-5L1 18"/><path d="M17 6h6v6"/></svg>,
    bell: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
    x: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>,
    check: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>,
    menu: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M3 12h18M3 6h18M3 18h18"/></svg>,
    dollar: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  };
  return icons[name] || null;
};

// ── Componentes auxiliares ────────────────────────────────────
const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.scheduled;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

const Avatar = ({ initials, color = "#7C3AED", size = "md" }) => {
  const s = size === "sm" ? "w-8 h-8 text-xs" : size === "lg" ? "w-12 h-12 text-base" : "w-9 h-9 text-sm";
  return (
    <div className={`${s} rounded-xl flex items-center justify-center font-bold text-white flex-shrink-0`}
         style={{ backgroundColor: color + "33", border: `1px solid ${color}44`, color }}>
      {initials}
    </div>
  );
};

// ── Modal de Novo Agendamento ─────────────────────────────────
const NewAppointmentModal = ({ onClose }) => {
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState({ service: null, barber: null, time: null });
  const TIMES = ["09:00","09:30","10:00","10:30","11:00","11:30","14:00","14:30","15:00","15:30","16:00","16:30"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
      <div className="w-full max-w-lg rounded-2xl overflow-hidden" style={{ background: "#161b27", border: "1px solid #1e2535" }}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: "#1e2535" }}>
          <div>
            <h2 className="text-white font-semibold text-lg">Novo Agendamento</h2>
            <p className="text-sm mt-0.5" style={{ color: "#64748b" }}>
              {step === 1 ? "Escolha o serviço" : step === 2 ? "Escolha o barbeiro" : "Escolha o horário"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              {[1,2,3].map(i => (
                <div key={i} className="rounded-full transition-all duration-300"
                     style={{ width: i <= step ? "20px" : "6px", height: "6px",
                              backgroundColor: i <= step ? "#6366f1" : "#1e2535" }} />
              ))}
            </div>
            <button onClick={onClose} className="p-2 rounded-lg transition-colors hover:bg-white/5" style={{ color: "#64748b" }}>
              <Icon name="x" size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 1 && (
            <div className="grid grid-cols-2 gap-3">
              {SERVICES.map(s => (
                <button key={s.id} onClick={() => { setSelected(p => ({...p, service: s})); setStep(2); }}
                        className="p-4 rounded-xl text-left transition-all duration-200 hover:scale-105"
                        style={{ background: selected.service?.id === s.id ? "#6366f120" : "#0d1117",
                                 border: `1px solid ${selected.service?.id === s.id ? "#6366f1" : "#1e2535"}` }}>
                  <p className="font-medium text-sm" style={{ color: "#e2e8f0" }}>{s.name}</p>
                  <p className="text-xs mt-1" style={{ color: "#64748b" }}>{s.duration}min · R$ {s.price}</p>
                </button>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-3">
              {BARBERS.map(b => (
                <button key={b.id} onClick={() => { setSelected(p => ({...p, barber: b})); setStep(3); }}
                        className="flex items-center gap-4 p-4 rounded-xl transition-all duration-200 hover:scale-[1.01]"
                        style={{ background: selected.barber?.id === b.id ? "#6366f120" : "#0d1117",
                                 border: `1px solid ${selected.barber?.id === b.id ? "#6366f1" : "#1e2535"}` }}>
                  <Avatar initials={b.avatar} color={b.color} size="lg" />
                  <div>
                    <p className="font-medium text-sm" style={{ color: "#e2e8f0" }}>{b.name}</p>
                    <p className="text-xs" style={{ color: "#64748b" }}>{b.appointments} agend. hoje</p>
                  </div>
                  {selected.barber?.id === b.id && <span className="ml-auto text-indigo-400"><Icon name="check" size={18} /></span>}
                </button>
              ))}
            </div>
          )}

          {step === 3 && (
            <div>
              <p className="text-sm mb-4 font-medium" style={{ color: "#94a3b8" }}>Horários disponíveis — Hoje</p>
              <div className="grid grid-cols-4 gap-2">
                {TIMES.map(t => (
                  <button key={t} onClick={() => setSelected(p => ({...p, time: t}))}
                          className="py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105"
                          style={{ background: selected.time === t ? "#6366f1" : "#0d1117",
                                   color: selected.time === t ? "white" : "#94a3b8",
                                   border: `1px solid ${selected.time === t ? "#6366f1" : "#1e2535"}` }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 pb-6">
          <button onClick={() => step > 1 ? setStep(s => s-1) : onClose()}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium transition-colors hover:bg-white/5"
                  style={{ color: "#64748b" }}>
            {step > 1 ? "Voltar" : "Cancelar"}
          </button>
          {step === 3 && selected.time && (
            <button onClick={onClose}
                    className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                    style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "white" }}>
              Confirmar Agendamento
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Telas ───────────────────────────────────────────────────
const DashboardScreen = ({ onNew }) => {
  const stats = [
    { label: "Agendamentos hoje", value: "12", sub: "+3 vs ontem", icon: "calendar", color: "#6366f1" },
    { label: "Receita do dia",    value: "R$620", sub: "R$410 confirmado", icon: "dollar",   color: "#10b981" },
    { label: "Clientes ativos",  value: "248", sub: "+12 este mês",  icon: "users",    color: "#f59e0b" },
    { label: "Taxa de conclusão",value: "94%",  sub: "Acima da média",  icon: "trending", color: "#8b5cf6" },
  ];

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>
        {stats.map((s, i) => (
          <div key={i} className="p-5 rounded-2xl" style={{ background: "#161b27", border: "1px solid #1e2535" }}>
            <div className="flex items-start justify-between mb-4">
              <div className="p-2.5 rounded-xl" style={{ background: s.color + "20" }}>
                <span style={{ color: s.color }}><Icon name={s.icon} size={18} /></span>
              </div>
              <span className="text-xs px-2 py-1 rounded-full" style={{ background: "#10b98115", color: "#10b981" }}>
                {s.sub}
              </span>
            </div>
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-xs mt-1" style={{ color: "#64748b" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Agenda do dia */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "#161b27", border: "1px solid #1e2535" }}>
        <div className="flex items-center justify-between p-5" style={{ borderBottom: "1px solid #1e2535" }}>
          <div>
            <h3 className="font-semibold text-white">Agenda de Hoje</h3>
            <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>
              {TODAY_APPOINTMENTS.length} agendamentos
            </p>
          </div>
          <button onClick={onNew} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "white" }}>
            <Icon name="plus" size={14} /> Novo
          </button>
        </div>
        <div className="divide-y" style={{ borderColor: "#1e2535" }}>
          {TODAY_APPOINTMENTS.map(appt => (
            <div key={appt.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.02] transition-colors">
              <span className="font-mono text-sm w-12 flex-shrink-0" style={{ color: "#6366f1" }}>{appt.time}</span>
              <Avatar initials={appt.avatar} color="#6366f1" size="sm" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-white truncate">{appt.client}</p>
                <p className="text-xs truncate" style={{ color: "#64748b" }}>{appt.service} · {appt.barber}</p>
              </div>
              <StatusBadge status={appt.status} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const BarbersScreen = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <h2 className="text-white font-semibold text-lg">Barbeiros</h2>
      <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "white" }}>
        <Icon name="plus" size={14} /> Adicionar
      </button>
    </div>
    {BARBERS.map(b => (
      <div key={b.id} className="p-5 rounded-2xl" style={{ background: "#161b27", border: "1px solid #1e2535" }}>
        <div className="flex items-center gap-4">
          <Avatar initials={b.avatar} color={b.color} size="lg" />
          <div className="flex-1">
            <p className="font-semibold text-white">{b.name}</p>
            <p className="text-sm" style={{ color: "#64748b" }}>{b.role}</p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-white">{b.appointments}</p>
            <p className="text-xs" style={{ color: "#64748b" }}>hoje</p>
          </div>
        </div>
        <div className="flex gap-2 mt-4 flex-wrap">
          {["Corte","Barba","Corte + Barba"].map(s => (
            <span key={s} className="text-xs px-2.5 py-1 rounded-full" style={{ background: b.color + "15", color: b.color, border: `1px solid ${b.color}30` }}>
              {s}
            </span>
          ))}
        </div>
      </div>
    ))}
  </div>
);

const ServicesScreen = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <h2 className="text-white font-semibold text-lg">Serviços</h2>
      <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "white" }}>
        <Icon name="plus" size={14} /> Novo serviço
      </button>
    </div>
    {SERVICES.map(s => (
      <div key={s.id} className="flex items-center gap-4 p-5 rounded-2xl" style={{ background: "#161b27", border: "1px solid #1e2535" }}>
        <div className="p-3 rounded-xl" style={{ background: "#6366f115" }}>
          <span style={{ color: "#6366f1" }}><Icon name="scissors" size={18} /></span>
        </div>
        <div className="flex-1">
          <p className="font-semibold text-white">{s.name}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#1e2535", color: "#94a3b8" }}>
              <Icon name="clock" size={10} /> {s.duration} min
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="font-semibold text-white">R$ {s.price}</p>
          <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>por serviço</p>
        </div>
      </div>
    ))}
  </div>
);

// ── App Principal ─────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard",  icon: "grid"     },
  { id: "agenda",    label: "Agenda",     icon: "calendar" },
  { id: "barbeiros", label: "Barbeiros",  icon: "users"    },
  { id: "servicos",  label: "Serviços",   icon: "scissors" },
  { id: "config",    label: "Config",     icon: "settings" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showModal, setShowModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderScreen = () => {
    switch (activeTab) {
      case "dashboard": return <DashboardScreen onNew={() => setShowModal(true)} />;
      case "barbeiros": return <BarbersScreen />;
      case "servicos":  return <ServicesScreen />;
      default: return (
        <div className="flex flex-col items-center justify-center h-64 rounded-2xl" style={{ background: "#161b27", border: "1px solid #1e2535" }}>
          <p style={{ color: "#64748b" }}>Em construção</p>
        </div>
      );
    }
  };

  return (
    <div style={{ background: "#0d1117", minHeight: "100vh", fontFamily: "'DM Sans', system-ui, sans-serif", color: "#e2e8f0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1e2535; border-radius: 4px; }
        button { cursor: pointer; border: none; background: none; font-family: inherit; }
        .divide-y > * + * { border-top: 1px solid #1e2535; }
      `}</style>

      <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>

        {/* Sidebar */}
        <aside style={{
          width: "240px", flexShrink: 0, background: "#161b27",
          borderRight: "1px solid #1e2535", display: "flex", flexDirection: "column",
          padding: "24px 16px", gap: "8px",
          transform: sidebarOpen ? "translateX(0)" : undefined,
        }}>
          {/* Logo */}
          <div style={{ padding: "8px 12px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon name="scissors" size={16} />
              </div>
              <div>
                <p style={{ fontSize: "13px", fontWeight: "700", color: "#e2e8f0", lineHeight: 1 }}>{COMPANY.name}</p>
                <p style={{ fontSize: "10px", color: "#6366f1", marginTop: "3px", letterSpacing: "0.1em" }}>PLANO {COMPANY.plan}</p>
              </div>
            </div>
          </div>

          {/* Nav items */}
          <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
            <p style={{ fontSize: "10px", color: "#64748b", letterSpacing: "0.1em", padding: "0 12px", marginBottom: "8px" }}>MENU</p>
            {NAV_ITEMS.map(item => {
              const active = activeTab === item.id;
              return (
                <button key={item.id} onClick={() => setActiveTab(item.id)}
                        style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 12px",
                                 borderRadius: "10px", fontSize: "13px", fontWeight: "500", transition: "all 0.15s",
                                 background: active ? "#6366f120" : "transparent",
                                 color: active ? "#818cf8" : "#64748b",
                                 border: active ? "1px solid #6366f130" : "1px solid transparent" }}>
                  <Icon name={item.icon} size={16} />
                  {item.label}
                  {active && <div style={{ marginLeft: "auto", width: "4px", height: "4px", borderRadius: "50%", background: "#6366f1" }} />}
                </button>
              );
            })}
          </nav>

          {/* User */}
          <div style={{ padding: "12px", borderRadius: "12px", background: "#0d1117", border: "1px solid #1e2535" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#6366f120",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: "#6366f1", fontSize: "11px", fontWeight: "700" }}>AD</div>
              <div>
                <p style={{ fontSize: "12px", fontWeight: "600", color: "#e2e8f0" }}>Admin</p>
                <p style={{ fontSize: "10px", color: "#64748b" }}>admin@barbearia.com</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Topbar */}
          <header style={{ padding: "16px 24px", borderBottom: "1px solid #1e2535", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
            <div>
              <h1 style={{ fontSize: "18px", fontWeight: "700", color: "#e2e8f0" }}>
                {NAV_ITEMS.find(n => n.id === activeTab)?.label}
              </h1>
              <p style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button style={{ position: "relative", padding: "8px", borderRadius: "10px", background: "#161b27",
                               border: "1px solid #1e2535", color: "#64748b", display: "flex" }}>
                <Icon name="bell" size={18} />
                <span style={{ position: "absolute", top: "6px", right: "6px", width: "7px", height: "7px",
                               borderRadius: "50%", background: "#6366f1", border: "2px solid #161b27" }} />
              </button>
              <button onClick={() => setShowModal(true)}
                      style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 16px",
                               borderRadius: "10px", fontSize: "13px", fontWeight: "600",
                               background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "white" }}>
                <Icon name="plus" size={14} /> Agendar
              </button>
            </div>
          </header>

          {/* Content */}
          <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
            {renderScreen()}
          </div>
        </main>
      </div>

      {showModal && <NewAppointmentModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
