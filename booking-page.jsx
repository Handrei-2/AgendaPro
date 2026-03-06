import { useState } from "react";

// ── Dados simulados da empresa (viriam da API: GET /api/public/[slug]) ──
const COMPANY = {
  name: "Estilo & Tradição",
  tagline: "Barbearia Premium desde 2018",
  address: "Rua das Flores, 142 — Centro, São Paulo",
  phone: "(11) 99999-0000",
  logoInitials: "E&T",
  workingHours: "Seg–Sex: 8h–20h  ·  Sáb: 8h–18h  ·  Dom: Fechado",
  rating: 4.9,
  totalReviews: 312,
};

const BARBERS = [
  { id: "b1", name: "Lucas Ferreira", role: "Master Barber", exp: "8 anos", initials: "LF", color: "#b45309", slots_today: 3 },
  { id: "b2", name: "Marcos Oliveira", role: "Barbeiro Sênior", exp: "5 anos", initials: "MO", color: "#065f46", slots_today: 5 },
  { id: "b3", name: "Diego Santos", role: "Barbeiro", exp: "3 anos", initials: "DS", color: "#1e40af", slots_today: 4 },
];

const SERVICES = [
  { id: "s1", name: "Corte Clássico", desc: "Navalha + acabamento perfeito", duration: 30, price: 45, icon: "✂" },
  { id: "s2", name: "Barba", desc: "Toalha quente + navalha", duration: 30, price: 35, icon: "🪒" },
  { id: "s3", name: "Corte + Barba", desc: "Experiência completa", duration: 60, price: 70, icon: "⚡", popular: true },
  { id: "s4", name: "Hidratação Capilar", desc: "Tratamento profissional", duration: 45, price: 55, icon: "✦" },
  { id: "s5", name: "Pigmentação de Barba", desc: "Cobertura de fios brancos", duration: 60, price: 80, icon: "◈" },
];

// Gera dias dos próximos 7 dias
const getDays = () => {
  const days = [];
  const names = ["DOM","SEG","TER","QUA","QUI","SEX","SÁB"];
  const months = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push({
      iso: d.toISOString().split("T")[0],
      dayName: names[d.getDay()],
      dayNum: d.getDate(),
      month: months[d.getMonth()],
      disabled: d.getDay() === 0, // domingo fechado
    });
  }
  return days;
};

const SLOTS = {
  b1: ["09:00","10:00","14:00","16:00","17:30"],
  b2: ["08:30","09:30","11:00","13:30","14:30","16:30","18:00"],
  b3: ["09:00","10:30","12:00","14:00","15:00","17:00"],
};

// ── Ícones ──────────────────────────────────────────────────
const ChevronRight = ({ size = 16 }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M9 18l6-6-6-6"/>
  </svg>
);
const ChevronLeft = ({ size = 16 }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M15 18l-6-6 6-6"/>
  </svg>
);
const Check = ({ size = 16 }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path d="M20 6L9 17l-5-5"/>
  </svg>
);
const Star = ({ size = 14, filled = true }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
  </svg>
);
const MapPin = ({ size = 14 }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);
const Clock = ({ size = 14 }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
  </svg>
);
const Phone = ({ size = 14 }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.65 3.32C1.64 2.18 2.47 1.15 3.62 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);
const Sparkle = ({ size = 16 }) => (
  <svg width={size} height={size} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2l2.4 7.2H22l-6.2 4.5 2.4 7.2L12 16.4l-6.2 4.5 2.4-7.2L2 9.2h7.6L12 2z"/>
  </svg>
);

// ── Indicador de etapa ───────────────────────────────────────
const StepIndicator = ({ current, steps }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "0" }}>
    {steps.map((s, i) => (
      <div key={i} style={{ display: "flex", alignItems: "center" }}>
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: "6px",
        }}>
          <div style={{
            width: "32px", height: "32px", borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "12px", fontWeight: "700", transition: "all 0.3s",
            background: i < current ? "#292524" : i === current ? "#292524" : "transparent",
            color: i < current ? "#d4a853" : i === current ? "#fff" : "#a8a29e",
            border: i < current ? "2px solid #292524" : i === current ? "2px solid #d4a853" : "2px solid #e7e5e4",
          }}>
            {i < current ? <Check size={14} /> : i + 1}
          </div>
          <span style={{
            fontSize: "9px", fontWeight: "600", letterSpacing: "0.08em", textTransform: "uppercase",
            color: i === current ? "#292524" : i < current ? "#78716c" : "#a8a29e",
          }}>{s}</span>
        </div>
        {i < steps.length - 1 && (
          <div style={{
            width: "60px", height: "1px", marginBottom: "18px",
            background: i < current ? "#d4a853" : "#e7e5e4",
            transition: "background 0.3s",
          }} />
        )}
      </div>
    ))}
  </div>
);

// ── Tela de Sucesso ──────────────────────────────────────────
const SuccessScreen = ({ booking, onNew }) => (
  <div style={{ textAlign: "center", padding: "48px 24px", animation: "fadeUp 0.5s ease" }}>
    <div style={{
      width: "80px", height: "80px", borderRadius: "50%",
      background: "linear-gradient(135deg, #d4a853, #b8860b)",
      display: "flex", alignItems: "center", justifyContent: "center",
      margin: "0 auto 24px", boxShadow: "0 20px 40px rgba(212,168,83,0.3)",
    }}>
      <Check size={36} />
    </div>
    <h2 style={{ fontSize: "28px", fontWeight: "800", color: "#292524", fontFamily: "'Playfair Display', serif", marginBottom: "8px" }}>
      Agendado com sucesso!
    </h2>
    <p style={{ color: "#78716c", marginBottom: "32px", fontSize: "15px" }}>
      Você receberá uma confirmação no WhatsApp
    </p>

    <div style={{
      background: "#fafaf9", border: "1px solid #e7e5e4", borderRadius: "16px",
      padding: "24px", maxWidth: "320px", margin: "0 auto 32px", textAlign: "left",
    }}>
      {[
        ["Serviço", booking.service?.name],
        ["Barbeiro", booking.barber?.name],
        ["Data", booking.day?.dayName + ", " + booking.day?.dayNum + " " + booking.day?.month],
        ["Horário", booking.slot],
        ["Total", `R$ ${booking.service?.price}`],
      ].map(([label, value]) => (
        <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0",
             borderBottom: "1px solid #f5f5f4" }}>
          <span style={{ color: "#a8a29e", fontSize: "13px" }}>{label}</span>
          <span style={{ color: "#292524", fontSize: "13px", fontWeight: "600" }}>{value}</span>
        </div>
      ))}
    </div>

    <button onClick={onNew} style={{
      padding: "14px 32px", borderRadius: "100px", fontSize: "14px", fontWeight: "700",
      background: "#292524", color: "white", border: "none", cursor: "pointer",
      letterSpacing: "0.05em",
    }}>
      Fazer outro agendamento
    </button>
  </div>
);

// ── App Principal ────────────────────────────────────────────
export default function BookingPage() {
  const [step, setStep] = useState(0);
  const [booking, setBooking] = useState({ service: null, barber: null, day: null, slot: null });
  const [form, setForm] = useState({ name: "", phone: "" });
  const [done, setDone] = useState(false);

  const days = getDays();
  const STEPS = ["Serviço", "Profissional", "Data & Hora", "Confirmação"];

  const select = (field, value) => {
    setBooking(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!form.name || !form.phone) return;
    setDone(true);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#fafaf9",
      fontFamily: "'DM Sans', system-ui, sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        button { cursor: pointer; font-family: inherit; }
        input { font-family: inherit; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        .slot-btn:hover { transform: scale(1.04); }
        .card-hover:hover { border-color: #d4a853 !important; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.08) !important; }
        .day-btn:hover:not([disabled]) { border-color: #d4a853 !important; }
      `}</style>

      {/* ── Header ── */}
      <header style={{
        background: "#292524",
        padding: "0 24px",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ maxWidth: "480px", margin: "0 auto", padding: "16px 0",
                      display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              width: "38px", height: "38px", borderRadius: "10px",
              background: "linear-gradient(135deg, #d4a853, #b8860b)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "11px", fontWeight: "900", color: "white", letterSpacing: "-0.5px",
            }}>
              E&T
            </div>
            <div>
              <p style={{ color: "white", fontSize: "15px", fontWeight: "700",
                          fontFamily: "'Playfair Display', serif", lineHeight: 1 }}>
                {COMPANY.name}
              </p>
              <p style={{ color: "#a8a29e", fontSize: "11px", marginTop: "3px" }}>
                {COMPANY.tagline}
              </p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#d4a853" }}>
            <Star size={13} />
            <span style={{ color: "white", fontSize: "13px", fontWeight: "700" }}>{COMPANY.rating}</span>
            <span style={{ color: "#78716c", fontSize: "12px" }}>({COMPANY.totalReviews})</span>
          </div>
        </div>
      </header>

      {/* ── Hero strip ── */}
      <div style={{
        background: "linear-gradient(135deg, #1c1917 0%, #292524 50%, #3c2a1e 100%)",
        padding: "28px 24px 32px",
        position: "relative", overflow: "hidden",
      }}>
        {/* Decorative lines */}
        <div style={{ position: "absolute", inset: 0, opacity: 0.06, backgroundImage:
          "repeating-linear-gradient(45deg, #d4a853 0, #d4a853 1px, transparent 0, transparent 50%)",
          backgroundSize: "20px 20px" }} />
        <div style={{ maxWidth: "480px", margin: "0 auto", position: "relative" }}>
          <p style={{ color: "#d4a853", fontSize: "11px", fontWeight: "700", letterSpacing: "0.2em",
                      textTransform: "uppercase", marginBottom: "8px" }}>
            ✦ Agende online, sem ligação
          </p>
          <h1 style={{ color: "white", fontSize: "30px", fontWeight: "900",
                       fontFamily: "'Playfair Display', serif", lineHeight: "1.15",
                       margin: "0 0 16px" }}>
            Reserve seu horário<br/>em 60 segundos
          </h1>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
            {[
              [<MapPin />, COMPANY.address.split("—")[1]?.trim() || COMPANY.address],
              [<Clock />, "Seg–Sáb"],
              [<Phone />, COMPANY.phone],
            ].map(([icon, text], i) => (
              <span key={i} style={{ display: "flex", alignItems: "center", gap: "5px",
                                     color: "#a8a29e", fontSize: "12px" }}>
                <span style={{ color: "#d4a85380" }}>{icon}</span>
                {text}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ maxWidth: "480px", margin: "0 auto", padding: "0 16px 80px" }}>

        {done ? (
          <div style={{ background: "white", borderRadius: "20px", marginTop: "-16px",
                        boxShadow: "0 4px 24px rgba(0,0,0,0.08)", overflow: "hidden" }}>
            <SuccessScreen booking={booking} onNew={() => { setDone(false); setStep(0); setBooking({ service: null, barber: null, day: null, slot: null }); setForm({ name: "", phone: "" }); }} />
          </div>
        ) : (
          <div style={{
            background: "white", borderRadius: "20px", marginTop: "-16px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.08)", overflow: "hidden",
            animation: "fadeUp 0.4s ease",
          }}>
            {/* Step indicator */}
            <div style={{ padding: "28px 24px 20px", borderBottom: "1px solid #f5f5f4",
                          display: "flex", justifyContent: "center" }}>
              <StepIndicator current={step} steps={STEPS} />
            </div>

            {/* ── STEP 0: Serviço ── */}
            {step === 0 && (
              <div style={{ padding: "24px", animation: "fadeUp 0.3s ease" }}>
                <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#1c1917",
                             fontFamily: "'Playfair Display', serif", marginBottom: "4px" }}>
                  Qual serviço?
                </h2>
                <p style={{ color: "#a8a29e", fontSize: "13px", marginBottom: "20px" }}>
                  Escolha o que você deseja fazer hoje
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {SERVICES.map(s => (
                    <button key={s.id} className="card-hover"
                            onClick={() => { select("service", s); setStep(1); }}
                            style={{
                              display: "flex", alignItems: "center", gap: "14px",
                              padding: "16px", borderRadius: "14px", textAlign: "left",
                              background: booking.service?.id === s.id ? "#fef9ee" : "#fafaf9",
                              border: `1.5px solid ${booking.service?.id === s.id ? "#d4a853" : "#e7e5e4"}`,
                              transition: "all 0.2s", position: "relative",
                            }}>
                      <div style={{
                        width: "44px", height: "44px", borderRadius: "12px", flexShrink: 0,
                        background: "#292524", display: "flex", alignItems: "center",
                        justifyContent: "center", fontSize: "18px",
                      }}>
                        {s.icon}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontWeight: "700", color: "#1c1917", fontSize: "14px" }}>{s.name}</span>
                          {s.popular && (
                            <span style={{
                              fontSize: "9px", fontWeight: "800", letterSpacing: "0.1em",
                              background: "linear-gradient(90deg, #d4a853, #b8860b)",
                              color: "white", padding: "2px 7px", borderRadius: "100px",
                            }}>POPULAR</span>
                          )}
                        </div>
                        <p style={{ color: "#a8a29e", fontSize: "12px", marginTop: "2px" }}>{s.desc}</p>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <p style={{ fontWeight: "800", color: "#1c1917", fontSize: "16px" }}>R${s.price}</p>
                        <p style={{ color: "#a8a29e", fontSize: "11px" }}>{s.duration}min</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── STEP 1: Barbeiro ── */}
            {step === 1 && (
              <div style={{ padding: "24px", animation: "fadeUp 0.3s ease" }}>
                <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#1c1917",
                             fontFamily: "'Playfair Display', serif", marginBottom: "4px" }}>
                  Escolha o profissional
                </h2>
                <p style={{ color: "#a8a29e", fontSize: "13px", marginBottom: "20px" }}>
                  Todos estão disponíveis para <strong style={{ color: "#292524" }}>{booking.service?.name}</strong>
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {BARBERS.map(b => (
                    <button key={b.id} className="card-hover"
                            onClick={() => { select("barber", b); setStep(2); }}
                            style={{
                              display: "flex", alignItems: "center", gap: "14px",
                              padding: "16px", borderRadius: "14px", textAlign: "left",
                              background: booking.barber?.id === b.id ? "#fef9ee" : "#fafaf9",
                              border: `1.5px solid ${booking.barber?.id === b.id ? "#d4a853" : "#e7e5e4"}`,
                              transition: "all 0.2s",
                            }}>
                      {/* Avatar com gradiente */}
                      <div style={{
                        width: "52px", height: "52px", borderRadius: "14px", flexShrink: 0,
                        background: `linear-gradient(135deg, ${b.color}22, ${b.color}44)`,
                        border: `2px solid ${b.color}33`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontWeight: "800", fontSize: "15px", color: b.color,
                      }}>
                        {b.initials}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: "700", color: "#1c1917", fontSize: "14px" }}>{b.name}</p>
                        <p style={{ color: "#78716c", fontSize: "12px", marginTop: "1px" }}>{b.role} · {b.exp}</p>
                        <div style={{ display: "flex", gap: "3px", marginTop: "6px" }}>
                          {[1,2,3,4,5].map(i => (
                            <span key={i} style={{ color: "#d4a853" }}><Star size={10} /></span>
                          ))}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <p style={{ fontSize: "20px", fontWeight: "800", color: "#292524",
                                    fontFamily: "'Playfair Display', serif" }}>{b.slots_today}</p>
                        <p style={{ color: "#a8a29e", fontSize: "10px" }}>horários<br/>disponíveis</p>
                      </div>
                    </button>
                  ))}
                </div>
                <button onClick={() => setStep(0)} style={{
                  marginTop: "16px", padding: "0", background: "none", border: "none",
                  color: "#a8a29e", fontSize: "13px", display: "flex", alignItems: "center", gap: "4px",
                }}>
                  <ChevronLeft size={14} /> Voltar
                </button>
              </div>
            )}

            {/* ── STEP 2: Data & Hora ── */}
            {step === 2 && (
              <div style={{ padding: "24px", animation: "fadeUp 0.3s ease" }}>
                <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#1c1917",
                             fontFamily: "'Playfair Display', serif", marginBottom: "4px" }}>
                  Quando?
                </h2>
                <p style={{ color: "#a8a29e", fontSize: "13px", marginBottom: "20px" }}>
                  Com <strong style={{ color: "#292524" }}>{booking.barber?.name}</strong>
                </p>

                {/* Dias */}
                <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px", marginBottom: "20px",
                              scrollbarWidth: "none" }}>
                  {days.map(d => (
                    <button key={d.iso} className="day-btn"
                            disabled={d.disabled}
                            onClick={() => select("day", d)}
                            style={{
                              flexShrink: 0, width: "58px", padding: "12px 0", borderRadius: "14px",
                              display: "flex", flexDirection: "column", alignItems: "center", gap: "4px",
                              background: booking.day?.iso === d.iso ? "#292524" : d.disabled ? "#f5f5f4" : "#fafaf9",
                              border: `1.5px solid ${booking.day?.iso === d.iso ? "#292524" : "#e7e5e4"}`,
                              color: booking.day?.iso === d.iso ? "white" : d.disabled ? "#d6d3d1" : "#292524",
                              transition: "all 0.2s",
                              cursor: d.disabled ? "not-allowed" : "pointer",
                            }}>
                      <span style={{ fontSize: "9px", fontWeight: "700", letterSpacing: "0.1em" }}>{d.dayName}</span>
                      <span style={{ fontSize: "22px", fontWeight: "800", fontFamily: "'Playfair Display', serif",
                                     lineHeight: 1 }}>{d.dayNum}</span>
                      <span style={{ fontSize: "9px", opacity: 0.6 }}>{d.month}</span>
                    </button>
                  ))}
                </div>

                {/* Slots de horário */}
                {booking.day ? (
                  <div>
                    <p style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "0.12em",
                                color: "#a8a29e", textTransform: "uppercase", marginBottom: "12px" }}>
                      Horários disponíveis
                    </p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
                      {(SLOTS[booking.barber?.id] || []).map(slot => (
                        <button key={slot} className="slot-btn"
                                onClick={() => select("slot", slot)}
                                style={{
                                  padding: "12px 0", borderRadius: "12px", fontSize: "13px",
                                  fontWeight: "700", transition: "all 0.15s",
                                  background: booking.slot === slot ? "#292524" : "#fafaf9",
                                  color: booking.slot === slot ? "white" : "#292524",
                                  border: `1.5px solid ${booking.slot === slot ? "#292524" : "#e7e5e4"}`,
                                }}>
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: "24px", textAlign: "center", color: "#a8a29e", fontSize: "13px",
                                background: "#fafaf9", borderRadius: "12px", border: "1px dashed #e7e5e4" }}>
                    ← Selecione uma data acima
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "24px" }}>
                  <button onClick={() => setStep(1)} style={{
                    padding: "0", background: "none", border: "none",
                    color: "#a8a29e", fontSize: "13px", display: "flex", alignItems: "center", gap: "4px",
                  }}>
                    <ChevronLeft size={14} /> Voltar
                  </button>
                  {booking.day && booking.slot && (
                    <button onClick={() => setStep(3)} style={{
                      padding: "12px 24px", borderRadius: "100px", fontSize: "13px", fontWeight: "700",
                      background: "#292524", color: "white", border: "none",
                      display: "flex", alignItems: "center", gap: "6px",
                    }}>
                      Continuar <ChevronRight size={14} />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* ── STEP 3: Confirmação ── */}
            {step === 3 && (
              <div style={{ padding: "24px", animation: "fadeUp 0.3s ease" }}>
                <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#1c1917",
                             fontFamily: "'Playfair Display', serif", marginBottom: "4px" }}>
                  Confirmar reserva
                </h2>
                <p style={{ color: "#a8a29e", fontSize: "13px", marginBottom: "20px" }}>
                  Revise os detalhes e preencha seus dados
                </p>

                {/* Resumo */}
                <div style={{
                  background: "#292524", borderRadius: "16px", padding: "20px", marginBottom: "20px",
                  position: "relative", overflow: "hidden",
                }}>
                  <div style={{ position: "absolute", top: "-20px", right: "-20px", width: "100px", height: "100px",
                                borderRadius: "50%", background: "#d4a85315" }} />
                  <div style={{ position: "absolute", top: "0", right: "0", padding: "10px", color: "#d4a853" }}>
                    <Sparkle size={18} />
                  </div>
                  {[
                    ["Serviço", booking.service?.name, `R$ ${booking.service?.price}`],
                    ["Profissional", booking.barber?.name, null],
                    ["Data", `${booking.day?.dayName}, ${booking.day?.dayNum} de ${booking.day?.month}`, null],
                    ["Horário", booking.slot, `${booking.service?.duration}min`],
                  ].map(([label, value, extra], i, arr) => (
                    <div key={label} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "10px 0",
                      borderBottom: i < arr.length - 1 ? "1px solid #3c3530" : "none",
                    }}>
                      <span style={{ color: "#78716c", fontSize: "12px" }}>{label}</span>
                      <div style={{ textAlign: "right" }}>
                        <span style={{ color: "white", fontSize: "13px", fontWeight: "600" }}>{value}</span>
                        {extra && <span style={{ color: "#d4a853", fontSize: "12px", marginLeft: "8px" }}>{extra}</span>}
                      </div>
                    </div>
                  ))}
                  <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "14px", marginTop: "4px",
                                borderTop: "1px solid #d4a85330" }}>
                    <span style={{ color: "#d4a853", fontSize: "12px", fontWeight: "700", letterSpacing: "0.08em" }}>TOTAL</span>
                    <span style={{ color: "#d4a853", fontSize: "20px", fontWeight: "900",
                                   fontFamily: "'Playfair Display', serif" }}>
                      R$ {booking.service?.price}
                    </span>
                  </div>
                </div>

                {/* Formulário */}
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
                  {[
                    { label: "Seu nome", placeholder: "João da Silva", key: "name", type: "text" },
                    { label: "WhatsApp", placeholder: "(11) 99999-0000", key: "phone", type: "tel" },
                  ].map(f => (
                    <div key={f.key}>
                      <label style={{ fontSize: "11px", fontWeight: "700", color: "#78716c",
                                      letterSpacing: "0.08em", textTransform: "uppercase",
                                      display: "block", marginBottom: "6px" }}>
                        {f.label}
                      </label>
                      <input
                        type={f.type}
                        placeholder={f.placeholder}
                        value={form[f.key]}
                        onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                        style={{
                          width: "100%", padding: "13px 16px", borderRadius: "12px",
                          border: "1.5px solid #e7e5e4", fontSize: "14px", color: "#1c1917",
                          background: "#fafaf9", outline: "none", transition: "border 0.2s",
                        }}
                        onFocus={e => e.target.style.borderColor = "#d4a853"}
                        onBlur={e => e.target.style.borderColor = "#e7e5e4"}
                      />
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={!form.name || !form.phone}
                  style={{
                    width: "100%", padding: "16px", borderRadius: "14px", fontSize: "15px",
                    fontWeight: "800", border: "none", transition: "all 0.2s",
                    background: form.name && form.phone
                      ? "linear-gradient(135deg, #292524, #1c1917)"
                      : "#e7e5e4",
                    color: form.name && form.phone ? "white" : "#a8a29e",
                    cursor: form.name && form.phone ? "pointer" : "not-allowed",
                    letterSpacing: "0.03em",
                  }}>
                  ✓ Confirmar Agendamento
                </button>
                <p style={{ textAlign: "center", color: "#a8a29e", fontSize: "11px", marginTop: "12px" }}>
                  Você receberá confirmação via WhatsApp
                </p>

                <button onClick={() => setStep(2)} style={{
                  display: "flex", alignItems: "center", gap: "4px", margin: "12px auto 0",
                  padding: "0", background: "none", border: "none",
                  color: "#a8a29e", fontSize: "13px",
                }}>
                  <ChevronLeft size={14} /> Voltar
                </button>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: "32px" }}>
          <p style={{ color: "#d6d3d1", fontSize: "11px" }}>
            Agendamento online por <strong style={{ color: "#a8a29e" }}>AgendaPro</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
