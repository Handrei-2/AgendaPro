import { useState, useRef, useEffect } from "react";

// ── Tokens ────────────────────────────────────────────────────
const C = {
  bg:       "#09090b",
  surface:  "#0f1015",
  card:     "#13141a",
  border:   "#1c1e28",
  border2:  "#252830",
  text:     "#f1f1f5",
  muted:    "#52546a",
  subtle:   "#1e2030",
  indigo:   "#6366f1",
  violet:   "#8b5cf6",
  emerald:  "#10b981",
  amber:    "#f59e0b",
  rose:     "#f43f5e",
  sky:      "#0ea5e9",
};

// ── Barbeiros com cores ───────────────────────────────────────
const BARBERS = [
  { id: "all",  name: "Todos",          color: C.indigo,  bg: "#6366f115" },
  { id: "b1",   name: "Lucas",          color: "#a78bfa", bg: "#a78bfa15" },
  { id: "b2",   name: "Marcos",         color: C.emerald, bg: "#10b98115" },
  { id: "b3",   name: "Diego",          color: C.amber,   bg: "#f59e0b15" },
];

// ── Status config ─────────────────────────────────────────────
const STATUS = {
  scheduled:   { label: "Agendado",      color: C.indigo,  bg: "#6366f122" },
  confirmed:   { label: "Confirmado",    color: C.emerald, bg: "#10b98122" },
  in_progress: { label: "Em andamento",  color: C.amber,   bg: "#f59e0b22" },
  completed:   { label: "Concluído",     color: "#52546a", bg: "#52546a22" },
  cancelled:   { label: "Cancelado",     color: C.rose,    bg: "#f43f5e22" },
};

// ── Gera semana atual ─────────────────────────────────────────
const getWeek = (baseDate) => {
  const d = new Date(baseDate);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // segunda
  d.setDate(diff);
  return Array.from({ length: 7 }, (_, i) => {
    const nd = new Date(d);
    nd.setDate(d.getDate() + i);
    return nd;
  });
};

const DAY_NAMES  = ["Seg","Ter","Qua","Qui","Sex","Sáb","Dom"];
const MONTH_NAMES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho",
                     "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

// ── Agendamentos mock ─────────────────────────────────────────
const today = new Date();
const todayStr = today.toISOString().split("T")[0];

const mkDate = (dOffset, hour, min = 0) => {
  const d = new Date(today);
  d.setDate(today.getDate() + dOffset);
  d.setHours(hour, min, 0, 0);
  return d;
};

const RAW_APPOINTMENTS = [
  { id:1,  barberId:"b1", client:"Rafael Mendes",   service:"Corte + Barba", start: mkDate(0,  9, 0),  duration:60, status:"in_progress" },
  { id:2,  barberId:"b2", client:"Pedro Alves",     service:"Corte",         start: mkDate(0, 10, 0),  duration:30, status:"confirmed"   },
  { id:3,  barberId:"b3", client:"João Costa",      service:"Barba",         start: mkDate(0, 10,30),  duration:30, status:"scheduled"   },
  { id:4,  barberId:"b1", client:"Carlos Lima",     service:"Corte + Barba", start: mkDate(0, 11, 0),  duration:60, status:"scheduled"   },
  { id:5,  barberId:"b2", client:"André Santos",    service:"Corte",         start: mkDate(0, 13,30),  duration:30, status:"scheduled"   },
  { id:6,  barberId:"b1", client:"Felipe Torres",   service:"Hidratação",    start: mkDate(0, 14, 0),  duration:45, status:"scheduled"   },
  { id:7,  barberId:"b3", client:"Bruno Lima",      service:"Corte + Barba", start: mkDate(0, 15, 0),  duration:60, status:"scheduled"   },
  { id:8,  barberId:"b2", client:"Mateus Silva",    service:"Barba",         start: mkDate(0, 16, 0),  duration:30, status:"scheduled"   },
  { id:9,  barberId:"b1", client:"Lucas Rocha",     service:"Corte",         start: mkDate(1,  9, 0),  duration:30, status:"scheduled"   },
  { id:10, barberId:"b2", client:"Gabriel Costa",   service:"Corte + Barba", start: mkDate(1, 10, 0),  duration:60, status:"scheduled"   },
  { id:11, barberId:"b3", client:"Victor Alves",    service:"Barba",         start: mkDate(1, 11,30),  duration:30, status:"scheduled"   },
  { id:12, barberId:"b1", client:"Daniel Ferreira", service:"Hidratação",    start: mkDate(1, 14, 0),  duration:45, status:"scheduled"   },
  { id:13, barberId:"b2", client:"Paulo Mendes",    service:"Corte",         start: mkDate(2,  9,30),  duration:30, status:"scheduled"   },
  { id:14, barberId:"b1", client:"Ricardo Lima",    service:"Corte + Barba", start: mkDate(2, 11, 0),  duration:60, status:"scheduled"   },
  { id:15, barberId:"b3", client:"Fernando Costa",  service:"Corte",         start: mkDate(3,  9, 0),  duration:30, status:"scheduled"   },
  { id:16, barberId:"b2", client:"Rodrigo Silva",   service:"Barba",         start: mkDate(3, 13, 0),  duration:30, status:"scheduled"   },
  { id:17, barberId:"b1", client:"Thiago Rocha",    service:"Corte + Barba", start: mkDate(4, 10, 0),  duration:60, status:"scheduled"   },
  { id:18, barberId:"b2", client:"Alexandre Neto",  service:"Corte",         start: mkDate(4, 15,30),  duration:30, status:"scheduled"   },
  { id:19, barberId:"b3", client:"Marcelo Dias",    service:"Hidratação",    start: mkDate(5,  9, 0),  duration:45, status:"scheduled"   },
  { id:20, barberId:"b1", client:"Gustavo Freitas", service:"Corte",         start: mkDate(5, 11, 0),  duration:30, status:"scheduled"   },
  { id:21, barberId:"b0", client:"Henrique Lima",   service:"Corte + Barba", start: mkDate(-1,14, 0),  duration:60, status:"completed"   },
  { id:22, barberId:"b2", client:"Caio Santos",     service:"Barba",         start: mkDate(-1,10, 0),  duration:30, status:"completed"   },
];

// Normaliza: garante que `start` é Date
const APPOINTMENTS = RAW_APPOINTMENTS.map(a => ({
  ...a,
  end: new Date(a.start.getTime() + a.duration * 60000),
  dateStr: a.start.toISOString().split("T")[0],
  barber: BARBERS.find(b => b.id === a.barberId) || BARBERS[1],
}));

// ── Horas exibidas ────────────────────────────────────────────
const HOURS = Array.from({ length: 14 }, (_, i) => i + 7); // 07h–20h
const SLOT_H = 60; // px por hora

// ── Ícones ────────────────────────────────────────────────────
const Ic = ({ n, size = 16 }) => {
  const p = {
    left:  <polyline points="15 18 9 12 15 6"/>,
    right: <polyline points="9 18 15 12 9 6"/>,
    plus:  <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
    today: <><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></>,
    week:  <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></>,
    day:   <><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/></>,
    x:     <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
    edit:  <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>,
    trash: <><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></>,
    clock: <><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></>,
    user:  <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
    check: <polyline points="20 6 9 17 4 12"/>,
  };
  return (
    <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.7"
         strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      {p[n]}
    </svg>
  );
};

// ── Tooltip / Detail Card ─────────────────────────────────────
const AppointmentDetail = ({ appt, onClose, anchorRect }) => {
  const st = STATUS[appt.status];
  const barber = BARBERS.find(b => b.id === appt.barberId) || BARBERS[1];

  // posição inteligente
  const style = {
    position: "fixed",
    zIndex: 200,
    top:  Math.min(anchorRect.top, window.innerHeight - 320),
    left: anchorRect.right + 12,
    width: "280px",
  };
  if (anchorRect.right + 300 > window.innerWidth) {
    style.left = anchorRect.left - 292;
  }

  return (
    <>
      <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:199 }}/>
      <div style={{
        ...style,
        background: C.card,
        border: `1px solid ${C.border2}`,
        borderRadius: "16px",
        boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
        overflow: "hidden",
        animation: "popIn 0.2s ease",
      }}>
        {/* Cor do barbeiro no topo */}
        <div style={{ height: "4px", background: barber.color }}/>
        <div style={{ padding: "16px" }}>
          {/* Header */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"12px" }}>
            <div>
              <p style={{ fontSize:"15px", fontWeight:"800", color:C.text, lineHeight:1 }}>{appt.client}</p>
              <p style={{ fontSize:"12px", color:barber.color, marginTop:"4px", fontWeight:"600" }}>
                {barber.name}
              </p>
            </div>
            <button onClick={onClose} style={{ color:C.muted, background:"none", border:"none", padding:"2px" }}>
              <Ic n="x" size={15}/>
            </button>
          </div>

          {/* Info rows */}
          {[
            [<Ic n="user" size={12}/>,  appt.service],
            [<Ic n="clock" size={12}/>, `${appt.start.toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})} – ${appt.end.toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})} (${appt.duration}min)`],
          ].map(([icon, text], i) => (
            <div key={i} style={{ display:"flex", gap:"8px", alignItems:"center",
                                  marginBottom:"8px", color:C.muted }}>
              {icon}
              <span style={{ fontSize:"12px" }}>{text}</span>
            </div>
          ))}

          {/* Status */}
          <div style={{ display:"flex", alignItems:"center", gap:"8px", marginTop:"12px",
                        marginBottom:"14px" }}>
            <span style={{
              fontSize:"10px", fontWeight:"700", padding:"3px 10px", borderRadius:"100px",
              background: st.bg, color: st.color, letterSpacing:"0.06em",
            }}>{st.label}</span>
          </div>

          {/* Ações */}
          <div style={{ display:"flex", gap:"8px" }}>
            <button style={{
              flex:1, padding:"8px 0", borderRadius:"9px", fontSize:"12px", fontWeight:"700",
              background: C.indigoDim || "#6366f118", color: C.indigo, border:`1px solid ${C.indigo}30`,
            }}>
              <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"5px" }}>
                <Ic n="edit" size={12}/> Editar
              </span>
            </button>
            <button style={{
              flex:1, padding:"8px 0", borderRadius:"9px", fontSize:"12px", fontWeight:"700",
              background:"#f43f5e12", color: C.rose, border:`1px solid ${C.rose}30`,
            }}>
              <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"5px" }}>
                <Ic n="trash" size={12}/> Cancelar
              </span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// ── Bloco de agendamento ──────────────────────────────────────
const ApptBlock = ({ appt, top, height, width, left, onClick }) => {
  const barber = BARBERS.find(b => b.id === appt.barberId) || BARBERS[1];
  const st = STATUS[appt.status];
  const isCompact = height < 38;
  const isTiny    = height < 26;

  return (
    <div
      onClick={onClick}
      style={{
        position: "absolute",
        top:    `${top}px`,
        left:   `${left}%`,
        width:  `${width}%`,
        height: `${Math.max(height - 2, 18)}px`,
        background: barber.bg,
        borderLeft: `3px solid ${barber.color}`,
        borderRadius: "6px",
        padding: isTiny ? "2px 5px" : "5px 7px",
        cursor: "pointer",
        overflow: "hidden",
        transition: "filter 0.15s, transform 0.15s",
        zIndex: 2,
        boxSizing: "border-box",
      }}
      onMouseEnter={e => { e.currentTarget.style.filter = "brightness(1.3)"; e.currentTarget.style.transform = "scale(1.01)"; e.currentTarget.style.zIndex = 10; }}
      onMouseLeave={e => { e.currentTarget.style.filter = "brightness(1)";   e.currentTarget.style.transform = "scale(1)";    e.currentTarget.style.zIndex = 2; }}
    >
      {!isTiny && (
        <p style={{
          fontSize: isCompact ? "10px" : "11px",
          fontWeight: "700", color: barber.color,
          lineHeight: 1.2, whiteSpace: "nowrap",
          overflow: "hidden", textOverflow: "ellipsis",
          marginBottom: "1px",
        }}>
          {appt.client}
        </p>
      )}
      {!isCompact && (
        <p style={{
          fontSize: "10px", color: barber.color, opacity: 0.7,
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          lineHeight: 1.2,
        }}>
          {appt.service}
        </p>
      )}
      {appt.status === "in_progress" && (
        <div style={{
          position: "absolute", top: "4px", right: "5px",
          width: "6px", height: "6px", borderRadius: "50%",
          background: C.amber,
          boxShadow: `0 0 6px ${C.amber}`,
          animation: "pulse 1.5s infinite",
        }}/>
      )}
    </div>
  );
};

// ── Calcula posição/largura para evitar sobreposição ──────────
const layoutAppts = (appts) => {
  // Agrupa por colunas que se sobrepõem
  const cols = [];
  const placed = appts.map(a => {
    let col = 0;
    while (cols[col] && cols[col].end > a.start) col++;
    cols[col] = a;
    return { ...a, col, maxCol: 1 };
  });
  // calcula maxCol
  placed.forEach(a => {
    let count = 1;
    placed.forEach(b => {
      if (b.id !== a.id && b.start < a.end && b.end > a.start) count++;
    });
    a.maxCol = count;
  });
  return placed;
};

// ── App ───────────────────────────────────────────────────────
export default function AgendaSemanal() {
  const [baseDate, setBaseDate] = useState(new Date());
  const [filterBarber, setFilterBarber] = useState("all");
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [anchorRect, setAnchorRect] = useState(null);
  const scrollRef = useRef();

  const week = getWeek(baseDate);

  // Scroll para hora atual ao montar
  useEffect(() => {
    if (scrollRef.current) {
      const nowMin = today.getHours() * 60 + today.getMinutes();
      const scrollTo = ((nowMin - 7 * 60) / 60) * SLOT_H - 80;
      scrollRef.current.scrollTop = Math.max(0, scrollTo);
    }
  }, []);

  const prevWeek = () => { const d = new Date(baseDate); d.setDate(d.getDate() - 7); setBaseDate(d); };
  const nextWeek = () => { const d = new Date(baseDate); d.setDate(d.getDate() + 7); setBaseDate(d); };
  const goToday  = () => setBaseDate(new Date());

  // Agendamentos filtrados por barbeiro
  const filteredAppts = APPOINTMENTS.filter(a =>
    filterBarber === "all" || a.barberId === filterBarber
  );

  // Agora como posição no grid
  const nowMinutes = (today.getHours() - 7) * 60 + today.getMinutes();
  const nowTop = (nowMinutes / 60) * SLOT_H;
  const todayColIndex = week.findIndex(d => d.toDateString() === today.toDateString());

  const headerMonth = `${MONTH_NAMES[week[0].getMonth()]} ${week[0].getFullYear()}`;

  return (
    <div style={{
      display: "flex", flexDirection: "column", height: "100vh",
      background: C.bg, fontFamily: "'DM Sans', system-ui, sans-serif", color: C.text,
      overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        button { cursor: pointer; font-family: inherit; border: none; background: none; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${C.border2}; border-radius: 4px; }
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes popIn  { from { opacity:0; transform:scale(0.94) } to { opacity:1; transform:scale(1) } }
        @keyframes pulse  { 0%,100% { opacity:1 } 50% { opacity:0.4 } }
      `}</style>

      {/* ── Topbar ── */}
      <header style={{
        display: "flex", alignItems: "center", gap: "16px", padding: "14px 20px",
        borderBottom: `1px solid ${C.border}`, flexShrink: 0,
        background: C.surface,
      }}>
        {/* Navegação de semana */}
        <div style={{ display:"flex", alignItems:"center", gap:"4px" }}>
          <button onClick={prevWeek} style={{
            width:"32px", height:"32px", borderRadius:"8px", display:"flex",
            alignItems:"center", justifyContent:"center", color:C.muted,
            border:`1px solid ${C.border}`, background: C.card,
          }}><Ic n="left" size={14}/></button>

          <button onClick={goToday} style={{
            padding:"6px 14px", borderRadius:"8px", fontSize:"12px", fontWeight:"700",
            border:`1px solid ${C.border}`, background:C.card, color:C.text,
            letterSpacing:"0.03em",
          }}>Hoje</button>

          <button onClick={nextWeek} style={{
            width:"32px", height:"32px", borderRadius:"8px", display:"flex",
            alignItems:"center", justifyContent:"center", color:C.muted,
            border:`1px solid ${C.border}`, background:C.card,
          }}><Ic n="right" size={14}/></button>
        </div>

        {/* Mês/Ano */}
        <h2 style={{ fontSize:"16px", fontWeight:"800", letterSpacing:"-0.02em", flex:1 }}>
          {headerMonth}
        </h2>

        {/* Filtro de barbeiros */}
        <div style={{ display:"flex", gap:"6px", alignItems:"center" }}>
          {BARBERS.map(b => (
            <button key={b.id} onClick={() => setFilterBarber(b.id)}
                    style={{
                      padding:"6px 14px", borderRadius:"100px", fontSize:"12px", fontWeight:"600",
                      transition:"all 0.2s",
                      background: filterBarber === b.id ? b.bg : "transparent",
                      color: filterBarber === b.id ? b.color : C.muted,
                      border: `1px solid ${filterBarber === b.id ? b.color + "44" : C.border}`,
                    }}>
              {b.name}
            </button>
          ))}
        </div>

        {/* Novo agendamento */}
        <button style={{
          display:"flex", alignItems:"center", gap:"6px", padding:"8px 16px",
          borderRadius:"9px", fontSize:"12px", fontWeight:"700",
          background:`linear-gradient(135deg, ${C.indigo}, ${C.violet})`, color:"white",
        }}>
          <Ic n="plus" size={13}/> Novo agendamento
        </button>
      </header>

      {/* ── Grid: header dos dias ── */}
      <div style={{
        display:"grid",
        gridTemplateColumns:"52px repeat(7, 1fr)",
        borderBottom:`1px solid ${C.border}`,
        flexShrink: 0,
        background: C.surface,
      }}>
        {/* Espaço do horário */}
        <div style={{ borderRight:`1px solid ${C.border}` }}/>

        {/* Dias */}
        {week.map((d, i) => {
          const isToday = d.toDateString() === today.toDateString();
          const apptCount = filteredAppts.filter(a => a.dateStr === d.toISOString().split("T")[0]).length;
          return (
            <div key={i} style={{
              padding:"12px 8px 10px", textAlign:"center",
              borderRight: i < 6 ? `1px solid ${C.border}` : "none",
              background: isToday ? `${C.indigo}08` : "transparent",
            }}>
              <p style={{
                fontSize:"10px", fontWeight:"700", letterSpacing:"0.12em",
                color: isToday ? C.indigo : C.muted, textTransform:"uppercase", marginBottom:"4px",
              }}>
                {DAY_NAMES[i]}
              </p>
              <div style={{
                width:"34px", height:"34px", borderRadius:"50%", margin:"0 auto",
                display:"flex", alignItems:"center", justifyContent:"center",
                background: isToday ? C.indigo : "transparent",
                boxShadow: isToday ? `0 0 12px ${C.indigo}66` : "none",
              }}>
                <span style={{
                  fontSize:"16px", fontWeight:"800",
                  color: isToday ? "white" : C.text,
                }}>{d.getDate()}</span>
              </div>
              {apptCount > 0 && (
                <div style={{ marginTop:"4px", display:"flex", justifyContent:"center", gap:"3px" }}>
                  {Array.from({ length: Math.min(apptCount, 4) }).map((_, j) => (
                    <div key={j} style={{
                      width:"4px", height:"4px", borderRadius:"50%",
                      background: isToday ? C.indigo : C.muted, opacity: 0.6,
                    }}/>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Grid de horários (scrollável) ── */}
      <div ref={scrollRef} style={{ flex:1, overflowY:"auto", position:"relative" }}>
        <div style={{
          display:"grid",
          gridTemplateColumns:"52px repeat(7, 1fr)",
          height: `${HOURS.length * SLOT_H}px`,
          position:"relative",
        }}>

          {/* Coluna de horas */}
          <div style={{ borderRight:`1px solid ${C.border}`, position:"relative", zIndex:1 }}>
            {HOURS.map(h => (
              <div key={h} style={{
                height:`${SLOT_H}px`, display:"flex", alignItems:"flex-start",
                justifyContent:"flex-end", paddingRight:"8px", paddingTop:"4px",
              }}>
                <span style={{ fontSize:"10px", color:C.muted, fontVariantNumeric:"tabular-nums" }}>
                  {String(h).padStart(2,"0")}:00
                </span>
              </div>
            ))}
          </div>

          {/* Colunas dos dias */}
          {week.map((d, dayIdx) => {
            const dateStr = d.toISOString().split("T")[0];
            const isToday = d.toDateString() === today.toDateString();
            const dayAppts = filteredAppts.filter(a => a.dateStr === dateStr);

            // Layout para evitar sobreposição
            const laidOut = layoutAppts(dayAppts);

            return (
              <div key={dayIdx} style={{
                borderRight: dayIdx < 6 ? `1px solid ${C.border}` : "none",
                position:"relative",
                background: isToday ? `${C.indigo}04` : "transparent",
              }}>
                {/* Linhas de hora */}
                {HOURS.map((h, hi) => (
                  <div key={h} style={{
                    position:"absolute", left:0, right:0,
                    top:`${hi * SLOT_H}px`, height:`${SLOT_H}px`,
                    borderTop:`1px solid ${C.border}`,
                    pointerEvents:"none",
                  }}>
                    {/* Linha de meia hora */}
                    <div style={{
                      position:"absolute", left:0, right:0, top:"50%",
                      borderTop:`1px dashed ${C.border}`, opacity:0.5,
                    }}/>
                  </div>
                ))}

                {/* Linha do "agora" */}
                {isToday && nowTop >= 0 && nowTop <= HOURS.length * SLOT_H && (
                  <div style={{
                    position:"absolute", left:0, right:0, top:`${nowTop}px`, zIndex:5,
                    pointerEvents:"none",
                  }}>
                    <div style={{
                      height:"2px",
                      background:`linear-gradient(90deg, ${C.rose}, ${C.rose}00)`,
                    }}/>
                    <div style={{
                      position:"absolute", left:"-5px", top:"-4px",
                      width:"10px", height:"10px", borderRadius:"50%",
                      background: C.rose,
                      boxShadow:`0 0 8px ${C.rose}`,
                    }}/>
                  </div>
                )}

                {/* Agendamentos */}
                {laidOut.map(appt => {
                  const startMin = (appt.start.getHours() - 7) * 60 + appt.start.getMinutes();
                  const topPx    = (startMin / 60) * SLOT_H;
                  const heightPx = (appt.duration / 60) * SLOT_H;
                  const colW     = 100 / appt.maxCol;
                  const leftPct  = appt.col * colW;

                  return (
                    <ApptBlock
                      key={appt.id}
                      appt={appt}
                      top={topPx}
                      height={heightPx}
                      width={colW - 1}
                      left={leftPct + 0.5}
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setAnchorRect(rect);
                        setSelectedAppt(appt);
                      }}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Rodapé: total do dia ── */}
      <div style={{
        display:"grid", gridTemplateColumns:"52px repeat(7, 1fr)",
        borderTop:`1px solid ${C.border}`, flexShrink:0,
        background: C.surface, padding:"0",
      }}>
        <div style={{ borderRight:`1px solid ${C.border}` }}/>
        {week.map((d, i) => {
          const dateStr = d.toISOString().split("T")[0];
          const dayAppts = filteredAppts.filter(a => a.dateStr === dateStr && a.status !== "cancelled");
          const revenue = dayAppts.reduce((s, a) => {
            const prices = { "Corte":45, "Barba":35, "Corte + Barba":70, "Hidratação":55, "Pigmentação":80 };
            return s + (prices[a.service] || 0);
          }, 0);
          const isToday = d.toDateString() === today.toDateString();
          return (
            <div key={i} style={{
              padding:"6px 8px", textAlign:"center",
              borderRight: i < 6 ? `1px solid ${C.border}` : "none",
              background: isToday ? `${C.indigo}08` : "transparent",
            }}>
              {dayAppts.length > 0 ? (
                <>
                  <p style={{ fontSize:"11px", fontWeight:"700", color: isToday ? C.indigo : C.text }}>
                    R$ {revenue}
                  </p>
                  <p style={{ fontSize:"9px", color:C.muted }}>
                    {dayAppts.length} atend.
                  </p>
                </>
              ) : (
                <p style={{ fontSize:"9px", color:C.muted }}>—</p>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Detail popup ── */}
      {selectedAppt && anchorRect && (
        <AppointmentDetail
          appt={selectedAppt}
          anchorRect={anchorRect}
          onClose={() => { setSelectedAppt(null); setAnchorRect(null); }}
        />
      )}
    </div>
  );
}
