import { useState, useRef } from "react";

// ── Tokens ───────────────────────────────────────────────────
const C = {
  bg:      "#0f1117",
  surface: "#161b27",
  card:    "#1a2035",
  border:  "#1e2740",
  border2: "#253050",
  text:    "#e8eaf2",
  muted:   "#5a6585",
  subtle:  "#2a3550",
  indigo:  "#6366f1",
  indigoDim:"#6366f118",
  green:   "#22c55e",
  greenDim:"#22c55e18",
  red:     "#f43f5e",
  redDim:  "#f43f5e18",
  amber:   "#f59e0b",
  amberDim:"#f59e0b18",
};

const DAYS_PT = [
  { key: "mon", label: "Segunda-feira" },
  { key: "tue", label: "Terça-feira" },
  { key: "wed", label: "Quarta-feira" },
  { key: "thu", label: "Quinta-feira" },
  { key: "fri", label: "Sexta-feira" },
  { key: "sat", label: "Sábado" },
  { key: "sun", label: "Domingo" },
];

const HOUR_OPTIONS = Array.from({ length: 29 }, (_, i) => {
  const h = Math.floor(i / 2) + 7;
  const m = i % 2 === 0 ? "00" : "30";
  return `${String(h).padStart(2,"0")}:${m}`;
});

const PLANS = [
  { id: "free",       name: "Free",       price: "R$ 0",    features: ["1 barbeiro","50 agend./mês","Página pública"],  current: false },
  { id: "pro",        name: "Pro",        price: "R$ 79",   features: ["Barbeiros ilimitados","Agend. ilimitados","Notificações WhatsApp","Relatórios"], current: true },
  { id: "enterprise", name: "Enterprise", price: "R$ 199",  features: ["Tudo do Pro","Multi-unidades","API de integração","Suporte prioritário"], current: false },
];

// ── Estado inicial ────────────────────────────────────────────
const INITIAL = {
  name:        "Estilo & Tradição",
  slug:        "estilo-e-tradicao",
  phone:       "(11) 98765-4321",
  email:       "contato@estilotradicao.com.br",
  address:     "Rua das Flores, 142",
  city:        "São Paulo",
  state:       "SP",
  zip:         "01310-100",
  description: "Barbearia premium no coração de São Paulo. Especialistas em cortes clássicos e modernos desde 2018.",
  instagram:   "@estilotradicao",
  website:     "estilotradicao.com.br",
  workingHours: {
    mon: { open: "08:00", close: "20:00", active: true  },
    tue: { open: "08:00", close: "20:00", active: true  },
    wed: { open: "08:00", close: "20:00", active: true  },
    thu: { open: "08:00", close: "20:00", active: true  },
    fri: { open: "08:00", close: "20:00", active: true  },
    sat: { open: "08:00", close: "18:00", active: true  },
    sun: { open: "09:00", close: "13:00", active: false },
  },
  notifications: {
    whatsapp:    true,
    email:       true,
    reminder24h: true,
    reminder1h:  false,
    onCancel:    true,
    onNew:       true,
  },
  booking: {
    allowOnline:     true,
    advanceDays:     30,
    minNoticeHours:  2,
    autoConfirm:     false,
    showPrices:      true,
    allowCancellation: true,
    cancelNoticeHours: 4,
  },
};

// ── Ícones ────────────────────────────────────────────────────
const Icon = ({ n, size = 16 }) => {
  const paths = {
    building:   <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>,
    clock:      <><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></>,
    bell:       <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></>,
    calendar:   <><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></>,
    credit:     <><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></>,
    shield:     <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></>,
    upload:     <><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></>,
    check:      <><polyline points="20 6 9 17 4 12"/></>,
    x:          <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
    link:       <><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></>,
    instagram:  <><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></>,
    globe:      <><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></>,
    copy:       <><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></>,
    alert:      <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>,
    trash:      <><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></>,
    star:       <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" fill="currentColor" stroke="none"/>,
  };
  return (
    <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.6"
         strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      {paths[n]}
    </svg>
  );
};

// ── Componentes base ──────────────────────────────────────────
const Label = ({ children, hint }) => (
  <div style={{ marginBottom: "6px" }}>
    <span style={{ fontSize: "11px", fontWeight: "700", color: C.muted,
                   letterSpacing: "0.09em", textTransform: "uppercase" }}>
      {children}
    </span>
    {hint && <span style={{ fontSize: "11px", color: C.muted, marginLeft: "6px", textTransform: "none",
                            letterSpacing: 0, fontWeight: "400" }}>— {hint}</span>}
  </div>
);

const Input = ({ value, onChange, placeholder, prefix, suffix, mono }) => (
  <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
    {prefix && (
      <span style={{ position: "absolute", left: "13px", color: C.muted, fontSize: "13px",
                     pointerEvents: "none", userSelect: "none" }}>{prefix}</span>
    )}
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
           style={{
             width: "100%", padding: `10px ${suffix ? "80px" : "14px"} 10px ${prefix ? "42px" : "14px"}`,
             background: C.surface, border: `1px solid ${C.border}`, borderRadius: "10px",
             color: C.text, fontSize: "13px", outline: "none", transition: "border 0.2s",
             fontFamily: mono ? "'DM Mono', monospace" : "inherit",
           }}
           onFocus={e => e.target.style.borderColor = C.indigo}
           onBlur={e  => e.target.style.borderColor = C.border}
    />
    {suffix && (
      <span style={{ position: "absolute", right: "13px", color: C.muted, fontSize: "12px" }}>{suffix}</span>
    )}
  </div>
);

const Textarea = ({ value, onChange, placeholder, rows = 3 }) => (
  <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
            style={{
              width: "100%", padding: "10px 14px", resize: "vertical",
              background: C.surface, border: `1px solid ${C.border}`, borderRadius: "10px",
              color: C.text, fontSize: "13px", outline: "none", transition: "border 0.2s",
              fontFamily: "inherit", lineHeight: 1.6,
            }}
            onFocus={e => e.target.style.borderColor = C.indigo}
            onBlur={e  => e.target.style.borderColor = C.border}
  />
);

const Select = ({ value, onChange, options }) => (
  <select value={value} onChange={e => onChange(e.target.value)}
          style={{
            width: "100%", padding: "10px 14px",
            background: C.surface, border: `1px solid ${C.border}`, borderRadius: "10px",
            color: C.text, fontSize: "13px", outline: "none", cursor: "pointer",
            appearance: "none",
          }}>
    {options.map(o => <option key={o} value={o}>{o}</option>)}
  </select>
);

const Toggle = ({ value, onChange, label, sub }) => (
  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px" }}>
    <div>
      <p style={{ fontSize: "13px", fontWeight: "600", color: C.text }}>{label}</p>
      {sub && <p style={{ fontSize: "11px", color: C.muted, marginTop: "2px" }}>{sub}</p>}
    </div>
    <button onClick={() => onChange(!value)} style={{
      width: "44px", height: "24px", borderRadius: "12px", border: "none",
      background: value ? C.indigo : C.subtle, position: "relative",
      transition: "background 0.25s", flexShrink: 0, cursor: "pointer",
    }}>
      <div style={{
        position: "absolute", top: "3px", left: value ? "23px" : "3px",
        width: "18px", height: "18px", borderRadius: "50%",
        background: "white", transition: "left 0.25s",
        boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
      }}/>
    </button>
  </div>
);

const NumberInput = ({ value, onChange, min, max, suffix }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
    <button onClick={() => onChange(Math.max(min ?? 0, value - 1))}
            style={{ width: "30px", height: "30px", borderRadius: "8px", border: `1px solid ${C.border}`,
                     background: C.surface, color: C.text, fontSize: "16px", display: "flex",
                     alignItems: "center", justifyContent: "center" }}>−</button>
    <span style={{ minWidth: "32px", textAlign: "center", fontWeight: "700",
                   fontSize: "14px", color: C.text }}>{value}</span>
    <button onClick={() => onChange(Math.min(max ?? 999, value + 1))}
            style={{ width: "30px", height: "30px", borderRadius: "8px", border: `1px solid ${C.border}`,
                     background: C.surface, color: C.text, fontSize: "16px", display: "flex",
                     alignItems: "center", justifyContent: "center" }}>+</button>
    {suffix && <span style={{ fontSize: "12px", color: C.muted }}>{suffix}</span>}
  </div>
);

// ── Seção card ────────────────────────────────────────────────
const Section = ({ title, icon, children, action }) => (
  <div style={{
    background: C.card, border: `1px solid ${C.border}`, borderRadius: "16px",
    overflow: "hidden", marginBottom: "16px",
    animation: "fadeIn 0.4s ease both",
  }}>
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "18px 24px", borderBottom: `1px solid ${C.border}`,
      background: `linear-gradient(90deg, ${C.indigoDim}, transparent)`,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ color: C.indigo }}><Icon n={icon} size={15}/></span>
        <span style={{ fontSize: "14px", fontWeight: "700", color: C.text }}>{title}</span>
      </div>
      {action}
    </div>
    <div style={{ padding: "24px" }}>{children}</div>
  </div>
);

const Grid = ({ cols = 2, children }) => (
  <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: "16px" }}>
    {children}
  </div>
);

const Field = ({ children }) => <div>{children}</div>;

const Divider = () => <div style={{ height: "1px", background: C.border, margin: "20px 0" }}/>;

// ── Toast ─────────────────────────────────────────────────────
const Toast = ({ show, message, type = "success" }) => (
  <div style={{
    position: "fixed", bottom: "24px", right: "24px", zIndex: 999,
    display: "flex", alignItems: "center", gap: "10px",
    padding: "12px 18px", borderRadius: "12px",
    background: type === "success" ? C.greenDim : C.redDim,
    border: `1px solid ${type === "success" ? C.green : C.red}44`,
    color: type === "success" ? C.green : C.red,
    fontSize: "13px", fontWeight: "600",
    transform: show ? "translateY(0)" : "translateY(80px)",
    opacity: show ? 1 : 0,
    transition: "all 0.3s ease",
    boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
  }}>
    <Icon n={type === "success" ? "check" : "x"} size={15}/>
    {message}
  </div>
);

// ── Upload de logo ────────────────────────────────────────────
const LogoUpload = ({ name }) => {
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState(null);
  const ref = useRef();

  const handleFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => setPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
      {/* Preview */}
      <div style={{
        width: "72px", height: "72px", borderRadius: "16px", flexShrink: 0,
        background: preview ? "transparent" : `linear-gradient(135deg, ${C.indigo}44, ${C.indigo}22)`,
        border: `2px dashed ${C.border2}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        overflow: "hidden", fontSize: "13px", fontWeight: "900",
        color: C.indigo, letterSpacing: "-0.5px",
      }}>
        {preview
          ? <img src={preview} style={{ width: "100%", height: "100%", objectFit: "cover" }}/>
          : name.split(" ").map(w => w[0]).slice(0,2).join("")
        }
      </div>

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
        onClick={() => ref.current?.click()}
        style={{
          flex: 1, padding: "16px", borderRadius: "12px", cursor: "pointer",
          border: `2px dashed ${dragging ? C.indigo : C.border}`,
          background: dragging ? C.indigoDim : C.surface,
          transition: "all 0.2s", textAlign: "center",
        }}
      >
        <input ref={ref} type="file" accept="image/*" style={{ display: "none" }}
               onChange={e => handleFile(e.target.files[0])}/>
        <div style={{ color: C.indigo, marginBottom: "4px" }}><Icon n="upload" size={18}/></div>
        <p style={{ fontSize: "12px", fontWeight: "600", color: C.text }}>
          {dragging ? "Solte aqui" : "Clique ou arraste a logo"}
        </p>
        <p style={{ fontSize: "11px", color: C.muted, marginTop: "2px" }}>PNG, JPG até 2MB</p>
      </div>
    </div>
  );
};

// ── Tabs de navegação ─────────────────────────────────────────
const TABS = [
  { id: "geral",         label: "Geral",          icon: "building" },
  { id: "horarios",      label: "Horários",        icon: "clock"    },
  { id: "notificacoes",  label: "Notificações",    icon: "bell"     },
  { id: "agendamento",   label: "Agendamento",     icon: "calendar" },
  { id: "plano",         label: "Plano",           icon: "star"     },
  { id: "perigo",        label: "Zona de Perigo",  icon: "alert"    },
];

// ── App ───────────────────────────────────────────────────────
export default function SettingsPage() {
  const [tab, setTab] = useState("geral");
  const [form, setForm] = useState(INITIAL);
  const [toast, setToast] = useState({ show: false, message: "" });
  const [copied, setCopied] = useState(false);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const setNotif = (key, val) => setForm(f => ({ ...f, notifications: { ...f.notifications, [key]: val } }));
  const setBooking = (key, val) => setForm(f => ({ ...f, booking: { ...f.booking, [key]: val } }));
  const setHour = (day, field, val) =>
    setForm(f => ({ ...f, workingHours: { ...f.workingHours, [day]: { ...f.workingHours[day], [field]: val } } }));

  const save = () => {
    setToast({ show: true, message: "Configurações salvas com sucesso!" });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 3000);
  };

  const copyLink = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const bookingUrl = `agendapro.app/${form.slug}`;

  return (
    <div style={{
      minHeight: "100vh", background: C.bg, color: C.text,
      fontFamily: "'DM Sans', system-ui, sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        button, select { cursor: pointer; font-family: inherit; }
        input, textarea, select { color: #e8eaf2 !important; }
        input::placeholder, textarea::placeholder { color: #5a6585 !important; }
        select option { background: #1a2035; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .nav-tab:hover { color: #e8eaf2 !important; background: #1e2740 !important; }
        .plan-card:hover { border-color: #6366f144 !important; transform: translateY(-2px); }
      `}</style>

      <div style={{ maxWidth: "920px", margin: "0 auto", padding: "32px 24px 80px" }}>

        {/* ── Cabeçalho ── */}
        <div style={{
          display: "flex", alignItems: "flex-start", justifyContent: "space-between",
          marginBottom: "28px", flexWrap: "wrap", gap: "16px",
        }}>
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: "800", letterSpacing: "-0.02em" }}>
              Configurações
            </h1>
            <p style={{ color: C.muted, fontSize: "13px", marginTop: "4px" }}>
              Gerencie as informações e preferências da sua empresa
            </p>
          </div>
          <button onClick={save} style={{
            display: "flex", alignItems: "center", gap: "8px",
            padding: "10px 22px", borderRadius: "10px", fontSize: "13px", fontWeight: "700",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "white", border: "none",
          }}>
            <Icon n="check" size={14}/> Salvar alterações
          </button>
        </div>

        {/* ── Link de agendamento ── */}
        <div style={{
          display: "flex", alignItems: "center", gap: "12px",
          padding: "14px 18px", borderRadius: "12px", marginBottom: "24px",
          background: C.indigoDim, border: `1px solid ${C.indigo}33`,
        }}>
          <Icon n="link" size={15}/>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: "11px", color: C.muted, marginBottom: "1px",
                        textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: "700" }}>
              Seu link de agendamento
            </p>
            <p style={{ fontSize: "13px", fontWeight: "600", color: C.indigo,
                        fontFamily: "'DM Mono', monospace" }}>
              {bookingUrl}
            </p>
          </div>
          <button onClick={copyLink} style={{
            display: "flex", alignItems: "center", gap: "6px", padding: "7px 14px",
            borderRadius: "8px", fontSize: "12px", fontWeight: "600",
            background: copied ? C.greenDim : C.surface,
            color: copied ? C.green : C.muted,
            border: `1px solid ${copied ? C.green + "44" : C.border}`,
            transition: "all 0.2s",
          }}>
            <Icon n={copied ? "check" : "copy"} size={12}/>
            {copied ? "Copiado!" : "Copiar"}
          </button>
        </div>

        {/* ── Layout com tabs laterais ── */}
        <div style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>

          {/* Sidebar de tabs */}
          <nav style={{
            width: "200px", flexShrink: 0,
            background: C.card, border: `1px solid ${C.border}`, borderRadius: "14px",
            padding: "8px", position: "sticky", top: "24px",
          }}>
            {TABS.map(t => (
              <button key={t.id} className="nav-tab"
                      onClick={() => setTab(t.id)}
                      style={{
                        display: "flex", alignItems: "center", gap: "10px",
                        width: "100%", padding: "10px 12px", borderRadius: "9px",
                        fontSize: "13px", fontWeight: "600", border: "none", textAlign: "left",
                        background: tab === t.id ? C.indigoDim : "transparent",
                        color: tab === t.id ? "#818cf8" : C.muted,
                        transition: "all 0.15s", marginBottom: "2px",
                        borderLeft: tab === t.id ? `3px solid ${C.indigo}` : "3px solid transparent",
                      }}>
                <Icon n={t.icon} size={14}/> {t.label}
              </button>
            ))}
          </nav>

          {/* Conteúdo */}
          <div style={{ flex: 1, minWidth: 0 }} key={tab}>

            {/* ──── GERAL ──── */}
            {tab === "geral" && (
              <>
                <Section title="Identidade da empresa" icon="building">
                  <LogoUpload name={form.name}/>
                  <Divider/>
                  <Grid>
                    <Field>
                      <Label>Nome da empresa</Label>
                      <Input value={form.name} onChange={v => set("name", v)} placeholder="Ex: Barbearia Silva"/>
                    </Field>
                    <Field>
                      <Label hint="usado na URL pública">Slug</Label>
                      <Input value={form.slug} onChange={v => set("slug", v.toLowerCase().replace(/\s+/g,"-"))}
                             prefix="/" mono/>
                    </Field>
                  </Grid>
                  <div style={{ marginTop: "16px" }}>
                    <Label>Descrição</Label>
                    <Textarea value={form.description} onChange={v => set("description", v)}
                              placeholder="Descreva sua barbearia..."/>
                  </div>
                </Section>

                <Section title="Contato" icon="globe">
                  <Grid>
                    <Field>
                      <Label>Telefone / WhatsApp</Label>
                      <Input value={form.phone} onChange={v => set("phone", v)} placeholder="(11) 99999-0000"/>
                    </Field>
                    <Field>
                      <Label>E-mail</Label>
                      <Input value={form.email} onChange={v => set("email", v)} placeholder="contato@empresa.com"/>
                    </Field>
                  </Grid>
                  <Divider/>
                  <Grid>
                    <Field>
                      <Label>Instagram</Label>
                      <Input value={form.instagram} onChange={v => set("instagram", v)} prefix="@"
                             placeholder="suabarbearia"/>
                    </Field>
                    <Field>
                      <Label>Site</Label>
                      <Input value={form.website} onChange={v => set("website", v)} prefix="https://"
                             placeholder="suabarbearia.com"/>
                    </Field>
                  </Grid>
                </Section>

                <Section title="Endereço" icon="building">
                  <div style={{ marginBottom: "16px" }}>
                    <Label>Logradouro</Label>
                    <Input value={form.address} onChange={v => set("address", v)} placeholder="Rua, número"/>
                  </div>
                  <Grid cols={3}>
                    <Field>
                      <Label>Cidade</Label>
                      <Input value={form.city} onChange={v => set("city", v)} placeholder="São Paulo"/>
                    </Field>
                    <Field>
                      <Label>Estado</Label>
                      <Input value={form.state} onChange={v => set("state", v)} placeholder="SP"/>
                    </Field>
                    <Field>
                      <Label>CEP</Label>
                      <Input value={form.zip} onChange={v => set("zip", v)} placeholder="00000-000"/>
                    </Field>
                  </Grid>
                </Section>
              </>
            )}

            {/* ──── HORÁRIOS ──── */}
            {tab === "horarios" && (
              <Section title="Horário de funcionamento" icon="clock"
                action={
                  <span style={{ fontSize: "11px", color: C.muted }}>
                    Aplicado a toda a empresa
                  </span>
                }>
                <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                  {DAYS_PT.map((day, i) => {
                    const h = form.workingHours[day.key];
                    return (
                      <div key={day.key} style={{
                        display: "grid", gridTemplateColumns: "1fr 120px 120px 80px",
                        alignItems: "center", gap: "12px",
                        padding: "14px 0",
                        borderBottom: i < DAYS_PT.length - 1 ? `1px solid ${C.border}` : "none",
                        opacity: h.active ? 1 : 0.4, transition: "opacity 0.2s",
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <button onClick={() => setHour(day.key, "active", !h.active)}
                                  style={{
                                    width: "36px", height: "20px", borderRadius: "10px", border: "none",
                                    background: h.active ? C.indigo : C.subtle, position: "relative",
                                    transition: "background 0.2s", flexShrink: 0,
                                  }}>
                            <div style={{
                              position: "absolute", top: "2px", left: h.active ? "18px" : "2px",
                              width: "16px", height: "16px", borderRadius: "50%",
                              background: "white", transition: "left 0.2s",
                            }}/>
                          </button>
                          <span style={{ fontSize: "13px", fontWeight: "600", color: C.text }}>
                            {day.label}
                          </span>
                        </div>
                        <div>
                          <Label>Abertura</Label>
                          <Select value={h.open} onChange={v => setHour(day.key, "open", v)} options={HOUR_OPTIONS}/>
                        </div>
                        <div>
                          <Label>Fechamento</Label>
                          <Select value={h.close} onChange={v => setHour(day.key, "close", v)} options={HOUR_OPTIONS}/>
                        </div>
                        <div style={{ textAlign: "center" }}>
                          <span style={{
                            fontSize: "10px", fontWeight: "700", padding: "3px 8px", borderRadius: "100px",
                            background: h.active ? C.indigoDim : C.subtle,
                            color: h.active ? C.indigo : C.muted,
                          }}>
                            {h.active
                              ? `${Math.round((parseInt(h.close) - parseInt(h.open))*1)}h`
                              : "Fechado"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div style={{
                  marginTop: "20px", padding: "14px", borderRadius: "10px",
                  background: C.amberDim, border: `1px solid ${C.amber}33`,
                  display: "flex", gap: "10px", alignItems: "flex-start",
                }}>
                  <span style={{ color: C.amber, flexShrink: 0 }}><Icon n="alert" size={14}/></span>
                  <p style={{ fontSize: "12px", color: C.amber, lineHeight: 1.5 }}>
                    Os horários de cada barbeiro podem ser configurados individualmente na seção de Barbeiros.
                    Estes horários definem o padrão geral da empresa.
                  </p>
                </div>
              </Section>
            )}

            {/* ──── NOTIFICAÇÕES ──── */}
            {tab === "notificacoes" && (
              <>
                <Section title="Canais de comunicação" icon="bell">
                  <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    <Toggle value={form.notifications.whatsapp}
                            onChange={v => setNotif("whatsapp", v)}
                            label="Notificações por WhatsApp"
                            sub="Envia mensagem automática ao cliente ao confirmar agendamento"/>
                    <Divider/>
                    <Toggle value={form.notifications.email}
                            onChange={v => setNotif("email", v)}
                            label="Notificações por e-mail"
                            sub="Envia e-mail de confirmação para o endereço cadastrado do cliente"/>
                  </div>
                </Section>

                <Section title="Lembretes automáticos" icon="clock">
                  <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    <Toggle value={form.notifications.reminder24h}
                            onChange={v => setNotif("reminder24h", v)}
                            label="Lembrete 24 horas antes"
                            sub="Envia lembrete no dia anterior ao agendamento"/>
                    <Divider/>
                    <Toggle value={form.notifications.reminder1h}
                            onChange={v => setNotif("reminder1h", v)}
                            label="Lembrete 1 hora antes"
                            sub="Envia lembrete 60 minutos antes do horário marcado"/>
                  </div>
                </Section>

                <Section title="Eventos" icon="bell">
                  <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    <Toggle value={form.notifications.onNew}
                            onChange={v => setNotif("onNew", v)}
                            label="Novo agendamento"
                            sub="Notifica o admin quando um cliente faz um novo agendamento online"/>
                    <Divider/>
                    <Toggle value={form.notifications.onCancel}
                            onChange={v => setNotif("onCancel", v)}
                            label="Cancelamento"
                            sub="Notifica barbeiro e admin quando um agendamento é cancelado"/>
                  </div>
                </Section>
              </>
            )}

            {/* ──── AGENDAMENTO ──── */}
            {tab === "agendamento" && (
              <>
                <Section title="Regras de agendamento online" icon="calendar">
                  <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    <Toggle value={form.booking.allowOnline}
                            onChange={v => setBooking("allowOnline", v)}
                            label="Permitir agendamento online"
                            sub="Habilita a página pública para os clientes agendarem"/>
                    <Divider/>
                    <Toggle value={form.booking.autoConfirm}
                            onChange={v => setBooking("autoConfirm", v)}
                            label="Confirmação automática"
                            sub="Confirma automaticamente novos agendamentos sem aprovação manual"/>
                    <Divider/>
                    <Toggle value={form.booking.showPrices}
                            onChange={v => setBooking("showPrices", v)}
                            label="Mostrar preços na página pública"
                            sub="Exibe os valores dos serviços para o cliente antes de agendar"/>
                  </div>
                </Section>

                <Section title="Antecedência" icon="clock">
                  <Grid>
                    <Field>
                      <Label hint="máximo de dias para frente">Janela de agendamento</Label>
                      <div style={{ marginTop: "8px" }}>
                        <NumberInput value={form.booking.advanceDays}
                                     onChange={v => setBooking("advanceDays", v)}
                                     min={1} max={90} suffix="dias"/>
                      </div>
                    </Field>
                    <Field>
                      <Label hint="antecedência mínima">Aviso prévio mínimo</Label>
                      <div style={{ marginTop: "8px" }}>
                        <NumberInput value={form.booking.minNoticeHours}
                                     onChange={v => setBooking("minNoticeHours", v)}
                                     min={0} max={48} suffix="horas"/>
                      </div>
                    </Field>
                  </Grid>
                </Section>

                <Section title="Cancelamento" icon="x">
                  <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    <Toggle value={form.booking.allowCancellation}
                            onChange={v => setBooking("allowCancellation", v)}
                            label="Permitir cancelamento pelo cliente"
                            sub="O cliente pode cancelar o agendamento diretamente pelo link"/>
                    {form.booking.allowCancellation && (
                      <>
                        <Divider/>
                        <Field>
                          <Label hint="mínimo de antecedência para cancelar">Prazo para cancelamento</Label>
                          <div style={{ marginTop: "8px" }}>
                            <NumberInput value={form.booking.cancelNoticeHours}
                                         onChange={v => setBooking("cancelNoticeHours", v)}
                                         min={0} max={48} suffix="horas antes"/>
                          </div>
                        </Field>
                      </>
                    )}
                  </div>
                </Section>
              </>
            )}

            {/* ──── PLANO ──── */}
            {tab === "plano" && (
              <Section title="Seu plano" icon="star">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "14px" }}>
                  {PLANS.map(p => (
                    <div key={p.id} className="plan-card"
                         style={{
                           padding: "20px", borderRadius: "14px", transition: "all 0.2s",
                           background: p.current ? C.indigoDim : C.surface,
                           border: `1.5px solid ${p.current ? C.indigo : C.border}`,
                           position: "relative",
                         }}>
                      {p.current && (
                        <div style={{
                          position: "absolute", top: "-10px", left: "50%", transform: "translateX(-50%)",
                          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                          color: "white", fontSize: "9px", fontWeight: "800",
                          padding: "3px 10px", borderRadius: "100px", letterSpacing: "0.1em",
                          whiteSpace: "nowrap",
                        }}>PLANO ATUAL</div>
                      )}
                      <p style={{ fontWeight: "800", fontSize: "16px", color: C.text,
                                  marginBottom: "4px" }}>{p.name}</p>
                      <p style={{ fontSize: "22px", fontWeight: "800", color: C.indigo,
                                  marginBottom: "16px" }}>
                        {p.price}<span style={{ fontSize: "12px", fontWeight: "400",
                                                color: C.muted }}>/mês</span>
                      </p>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px",
                                    marginBottom: "16px" }}>
                        {p.features.map(f => (
                          <div key={f} style={{ display: "flex", gap: "7px", alignItems: "flex-start" }}>
                            <span style={{ color: C.green, flexShrink: 0, marginTop: "1px" }}>
                              <Icon n="check" size={12}/>
                            </span>
                            <span style={{ fontSize: "12px", color: C.muted }}>{f}</span>
                          </div>
                        ))}
                      </div>
                      <button style={{
                        width: "100%", padding: "9px", borderRadius: "9px", fontSize: "12px",
                        fontWeight: "700", border: "none",
                        background: p.current
                          ? "transparent"
                          : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                        color: p.current ? C.muted : "white",
                        border: p.current ? `1px solid ${C.border}` : "none",
                        cursor: p.current ? "default" : "pointer",
                      }}>
                        {p.current ? "Plano atual" : "Fazer upgrade"}
                      </button>
                    </div>
                  ))}
                </div>
                <div style={{
                  marginTop: "20px", padding: "14px 18px", borderRadius: "10px",
                  background: C.surface, border: `1px solid ${C.border}`,
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: "600", color: C.text }}>
                      Próxima cobrança
                    </p>
                    <p style={{ fontSize: "12px", color: C.muted, marginTop: "2px" }}>
                      R$ 79,00 em 15 de Abril de 2026
                    </p>
                  </div>
                  <button style={{
                    padding: "8px 16px", borderRadius: "9px", fontSize: "12px", fontWeight: "600",
                    background: C.surface, border: `1px solid ${C.border}`, color: C.muted,
                  }}>
                    Gerenciar pagamento
                  </button>
                </div>
              </Section>
            )}

            {/* ──── ZONA DE PERIGO ──── */}
            {tab === "perigo" && (
              <Section title="Zona de perigo" icon="alert">
                <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                  {[
                    {
                      title: "Exportar todos os dados",
                      sub: "Baixe um arquivo ZIP com todos os agendamentos, clientes e relatórios.",
                      btnLabel: "Exportar dados",
                      btnColor: C.muted,
                      btnBg: C.surface,
                      borderColor: C.border,
                    },
                    {
                      title: "Pausar agendamentos online",
                      sub: "Desativa temporariamente a página pública. Clientes não conseguirão agendar.",
                      btnLabel: "Pausar página",
                      btnColor: C.amber,
                      btnBg: C.amberDim,
                      borderColor: C.amber + "33",
                    },
                    {
                      title: "Excluir todos os dados",
                      sub: "Remove permanentemente todos os clientes e agendamentos. Irreversível.",
                      btnLabel: "Excluir dados",
                      btnColor: C.red,
                      btnBg: C.redDim,
                      borderColor: C.red + "33",
                    },
                    {
                      title: "Encerrar conta",
                      sub: "Exclui sua empresa e todos os dados permanentemente. Esta ação não pode ser desfeita.",
                      btnLabel: "Encerrar conta",
                      btnColor: C.red,
                      btnBg: C.redDim,
                      borderColor: C.red + "44",
                      destructive: true,
                    },
                  ].map((item, i, arr) => (
                    <div key={i} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      gap: "16px", padding: "18px 0",
                      borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : "none",
                    }}>
                      <div>
                        <p style={{ fontSize: "13px", fontWeight: "700",
                                    color: item.destructive ? C.red : C.text }}>
                          {item.title}
                        </p>
                        <p style={{ fontSize: "12px", color: C.muted, marginTop: "3px",
                                    maxWidth: "400px", lineHeight: 1.5 }}>
                          {item.sub}
                        </p>
                      </div>
                      <button style={{
                        padding: "9px 16px", borderRadius: "9px", fontSize: "12px", fontWeight: "700",
                        background: item.btnBg, color: item.btnColor,
                        border: `1px solid ${item.borderColor}`,
                        whiteSpace: "nowrap", flexShrink: 0,
                      }}>
                        {item.btnLabel}
                      </button>
                    </div>
                  ))}
                </div>
              </Section>
            )}

          </div>
        </div>
      </div>

      <Toast show={toast.show} message={toast.message}/>
    </div>
  );
}
