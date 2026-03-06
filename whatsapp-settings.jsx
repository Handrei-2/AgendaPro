import { useState, useEffect, useRef } from "react";

// ── Tokens ────────────────────────────────────────────────────
const C = {
  bg:        "#070709",
  surface:   "#0d0e12",
  card:      "#111318",
  border:    "#1a1d26",
  border2:   "#222530",
  text:      "#eceef5",
  muted:     "#4a4e66",
  subtle:    "#181b25",
  green:     "#25d366",  // WhatsApp green
  greenDim:  "#25d36618",
  greenGlow: "#25d36633",
  indigo:    "#6366f1",
  indigoDim: "#6366f118",
  amber:     "#f59e0b",
  amberDim:  "#f59e0b15",
  red:       "#f43f5e",
  redDim:    "#f43f5e15",
  blue:      "#3b82f6",
};

// ── Variáveis de template disponíveis ────────────────────────
const VARS = {
  "{{cliente}}":   "Nome do cliente",
  "{{servico}}":   "Nome do serviço",
  "{{barbeiro}}":  "Nome do barbeiro",
  "{{data}}":      "Data do agendamento",
  "{{hora}}":      "Hora do agendamento",
  "{{empresa}}":   "Nome da empresa",
  "{{link}}":      "Link para cancelar",
};

// ── Templates padrão ─────────────────────────────────────────
const DEFAULT_TEMPLATES = [
  {
    id: "confirmation",
    name: "Confirmação de agendamento",
    trigger: "Ao criar agendamento",
    icon: "✅",
    active: true,
    message: `Olá, *{{cliente}}*! 👋

Seu agendamento foi confirmado na *{{empresa}}*.

📋 *Serviço:* {{servico}}
💈 *Barbeiro:* {{barbeiro}}
📅 *Data:* {{data}}
⏰ *Hora:* {{hora}}

Para cancelar, acesse: {{link}}

Até lá! ✂️`,
  },
  {
    id: "reminder_24h",
    name: "Lembrete 24 horas antes",
    trigger: "24h antes do horário",
    icon: "⏰",
    active: true,
    message: `Oi, *{{cliente}}*! 😊

Lembrando que amanhã você tem um agendamento na *{{empresa}}*.

💈 *Barbeiro:* {{barbeiro}}
⏰ *Hora:* {{hora}}

Te esperamos! Se precisar cancelar: {{link}}`,
  },
  {
    id: "reminder_1h",
    name: "Lembrete 1 hora antes",
    trigger: "1h antes do horário",
    icon: "🔔",
    active: false,
    message: `*{{cliente}}*, daqui a 1 hora é sua vez! 💈

📍 *{{empresa}}*
⏰ *{{hora}}* com *{{barbeiro}}*

A gente te espera! 🤙`,
  },
  {
    id: "cancellation",
    name: "Cancelamento",
    trigger: "Ao cancelar agendamento",
    icon: "❌",
    active: true,
    message: `Olá, *{{cliente}}*.

Seu agendamento foi *cancelado*.

📅 *{{data}}* às *{{hora}}*
💈 {{barbeiro}} — {{servico}}

Para remarcar, acesse: {{link}}

Qualquer dúvida, estamos aqui! 😊`,
  },
  {
    id: "completion",
    name: "Pós-atendimento",
    trigger: "Ao concluir atendimento",
    icon: "⭐",
    active: false,
    message: `Obrigado pela visita, *{{cliente}}*! 🙏

Foi um prazer te atender na *{{empresa}}*.

Que tal deixar uma avaliação? Sua opinião nos ajuda muito! ⭐

Até a próxima! ✂️`,
  },
];

// ── Ícones ────────────────────────────────────────────────────
const Ic = ({ n, size = 16 }) => {
  const d = {
    check:    <polyline points="20 6 9 17 4 12"/>,
    x:        <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
    send:     <><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></>,
    phone:    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.65 3.32C1.64 2.18 2.47 1.15 3.62 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>,
    copy:     <><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></>,
    refresh:  <><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></>,
    link:     <><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></>,
    eye:      <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>,
    edit:     <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>,
    bell:     <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></>,
    alert:    <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>,
    zap:      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>,
    logs:     <><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></>,
  };
  return (
    <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.7"
         strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      {d[n]}
    </svg>
  );
};

// ── WhatsApp logo SVG ─────────────────────────────────────────
const WALogo = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={C.green}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

// ── Preview de mensagem no estilo WhatsApp ───────────────────
const WAPreview = ({ message, vars }) => {
  const rendered = message.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const map = {
      cliente: "João Silva", servico: "Corte + Barba", barbeiro: "Lucas",
      data: "Seg, 10 Mar", hora: "14:30", empresa: "Estilo & Tradição",
      link: "agend.app/cancel/abc123",
    };
    return `*${map[key] || key}*`;
  });

  // Converte *bold* para spans
  const parts = rendered.split(/(\*[^*]+\*)/g).map((part, i) =>
    part.startsWith("*") && part.endsWith("*")
      ? <strong key={i} style={{ fontWeight: 700 }}>{part.slice(1,-1)}</strong>
      : part
  );

  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;

  return (
    <div style={{
      background: "#0a1014",
      backgroundImage: "radial-gradient(circle at 20% 80%, #0d2818 0%, transparent 50%), radial-gradient(circle at 80% 20%, #0d2818 0%, transparent 50%)",
      borderRadius: "14px", padding: "20px 16px", minHeight: "200px",
      border: `1px solid #1a2e1a`,
      display: "flex", flexDirection: "column", justifyContent: "center",
      alignItems: "flex-end",
    }}>
      {/* Bubble */}
      <div style={{
        maxWidth: "85%", background: "#005c4b",
        borderRadius: "12px 2px 12px 12px",
        padding: "10px 12px 6px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
        position: "relative",
      }}>
        {/* Cauda */}
        <div style={{
          position: "absolute", top: 0, right: "-7px",
          width: 0, height: 0,
          borderLeft: "8px solid #005c4b",
          borderTop: "8px solid transparent",
        }}/>
        <p style={{
          fontSize: "13px", lineHeight: "1.6", color: "#e9edef",
          whiteSpace: "pre-wrap", wordBreak: "break-word",
          fontFamily: "'Segoe UI', system-ui, sans-serif",
        }}>
          {parts}
        </p>
        <div style={{
          display: "flex", justifyContent: "flex-end", gap: "4px",
          alignItems: "center", marginTop: "4px",
        }}>
          <span style={{ fontSize: "10px", color: "#8696a0" }}>{timeStr}</span>
          <svg width="16" height="11" viewBox="0 0 16 11" fill="#53bdeb">
            <path d="M11.071.653a.45.45 0 0 0-.631 0L4.993 6.1 2.561 3.658a.45.45 0 0 0-.631.641l2.748 2.748a.45.45 0 0 0 .63 0l5.763-5.762a.45.45 0 0 0 0-.632z"/>
            <path d="M15.071.653a.45.45 0 0 0-.631 0L8.993 6.1l-.748-.748a.45.45 0 0 0-.631.641l1.064 1.064a.45.45 0 0 0 .63 0l5.763-5.762a.45.45 0 0 0 0-.632z"/>
          </svg>
        </div>
      </div>
    </div>
  );
};

// ── Editor de template ────────────────────────────────────────
const TemplateEditor = ({ template, onSave, onClose }) => {
  const [msg, setMsg] = useState(template.message);
  const [tab, setTab] = useState("edit");
  const taRef = useRef();

  const insertVar = (v) => {
    const ta = taRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const newMsg = msg.slice(0, start) + v + msg.slice(end);
    setMsg(newMsg);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + v.length, start + v.length);
    }, 0);
  };

  return (
    <div style={{ position:"fixed", inset:0, zIndex:100, display:"flex",
                  alignItems:"center", justifyContent:"center", padding:"24px",
                  background:"rgba(0,0,0,0.75)", backdropFilter:"blur(8px)" }}>
      <div style={{
        width:"100%", maxWidth:"860px", maxHeight:"90vh",
        background:C.card, border:`1px solid ${C.border2}`, borderRadius:"20px",
        overflow:"hidden", display:"flex", flexDirection:"column",
        animation:"popIn 0.25s ease",
        boxShadow:"0 40px 80px rgba(0,0,0,0.6)",
      }}>
        {/* Header */}
        <div style={{
          display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"18px 24px", borderBottom:`1px solid ${C.border}`,
          background:`linear-gradient(90deg, ${C.greenDim}, transparent)`,
          flexShrink:0,
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
            <span style={{ fontSize:"20px" }}>{template.icon}</span>
            <div>
              <h3 style={{ fontSize:"15px", fontWeight:"800", color:C.text }}>{template.name}</h3>
              <p style={{ fontSize:"11px", color:C.muted, marginTop:"1px" }}>{template.trigger}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ color:C.muted, padding:"4px" }}><Ic n="x" size={16}/></button>
        </div>

        {/* Tabs */}
        <div style={{
          display:"flex", gap:"0", padding:"0 24px",
          borderBottom:`1px solid ${C.border}`, flexShrink:0,
        }}>
          {[["edit","Editar"],["preview","Pré-visualizar"]].map(([id,label]) => (
            <button key={id} onClick={() => setTab(id)} style={{
              padding:"12px 20px", fontSize:"13px", fontWeight:"600", border:"none",
              background:"transparent", cursor:"pointer",
              color: tab===id ? C.green : C.muted,
              borderBottom: tab===id ? `2px solid ${C.green}` : "2px solid transparent",
              transition:"all 0.15s",
            }}>{label}</button>
          ))}
        </div>

        {/* Corpo */}
        <div style={{ flex:1, overflow:"auto", padding:"24px" }}>
          {tab === "edit" ? (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 220px", gap:"20px", height:"100%" }}>
              {/* Textarea */}
              <div>
                <p style={{ fontSize:"11px", fontWeight:"700", color:C.muted, letterSpacing:"0.09em",
                            textTransform:"uppercase", marginBottom:"8px" }}>
                  Mensagem
                </p>
                <textarea
                  ref={taRef}
                  value={msg}
                  onChange={e => setMsg(e.target.value)}
                  rows={14}
                  style={{
                    width:"100%", padding:"14px", borderRadius:"12px", resize:"vertical",
                    background:C.surface, border:`1px solid ${C.border}`,
                    color:C.text, fontSize:"13px", lineHeight:"1.7",
                    outline:"none", fontFamily:"'DM Mono', monospace",
                    transition:"border 0.2s",
                  }}
                  onFocus={e => e.target.style.borderColor = C.green}
                  onBlur={e  => e.target.style.borderColor = C.border}
                />
                <p style={{ fontSize:"11px", color:C.muted, marginTop:"6px" }}>
                  Use <code style={{ color:C.green, fontSize:"11px" }}>*texto*</code> para negrito no WhatsApp.
                </p>
              </div>

              {/* Variáveis */}
              <div>
                <p style={{ fontSize:"11px", fontWeight:"700", color:C.muted, letterSpacing:"0.09em",
                            textTransform:"uppercase", marginBottom:"8px" }}>
                  Variáveis disponíveis
                </p>
                <div style={{ display:"flex", flexDirection:"column", gap:"6px" }}>
                  {Object.entries(VARS).map(([v, desc]) => (
                    <button key={v} onClick={() => insertVar(v)}
                            style={{
                              display:"flex", alignItems:"center", justifyContent:"space-between",
                              padding:"8px 10px", borderRadius:"8px", textAlign:"left",
                              background:C.surface, border:`1px solid ${C.border}`,
                              transition:"all 0.15s", cursor:"pointer",
                            }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = C.green; e.currentTarget.style.background = C.greenDim; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.surface; }}>
                      <div>
                        <code style={{ fontSize:"11px", color:C.green, fontFamily:"'DM Mono',monospace" }}>{v}</code>
                        <p style={{ fontSize:"10px", color:C.muted, marginTop:"1px" }}>{desc}</p>
                      </div>
                      <span style={{ fontSize:"10px", color:C.muted, flexShrink:0 }}>+ inserir</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ maxWidth:"400px", margin:"0 auto" }}>
              <p style={{ fontSize:"11px", color:C.muted, textAlign:"center",
                          marginBottom:"16px", letterSpacing:"0.06em", textTransform:"uppercase",
                          fontWeight:"700" }}>
                Visualização no WhatsApp
              </p>
              <WAPreview message={msg}/>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          display:"flex", justifyContent:"flex-end", gap:"10px",
          padding:"16px 24px", borderTop:`1px solid ${C.border}`, flexShrink:0,
        }}>
          <button onClick={onClose} style={{
            padding:"9px 20px", borderRadius:"9px", fontSize:"13px", fontWeight:"600",
            background:C.surface, border:`1px solid ${C.border}`, color:C.muted,
          }}>Cancelar</button>
          <button onClick={() => { onSave(msg); onClose(); }} style={{
            padding:"9px 20px", borderRadius:"9px", fontSize:"13px", fontWeight:"700",
            background:`linear-gradient(135deg, ${C.green}cc, ${C.green})`, color:"#000",
            border:"none",
          }}>
            <span style={{ display:"flex", alignItems:"center", gap:"6px" }}>
              <Ic n="check" size={13}/> Salvar template
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Log de envios ─────────────────────────────────────────────
const LOGS = [
  { id:1, type:"confirmation", client:"Rafael Mendes",  phone:"(11) 99999-0001", time:"14:32", status:"delivered" },
  { id:2, type:"reminder_24h", client:"Pedro Alves",    phone:"(11) 99999-0002", time:"09:00", status:"delivered" },
  { id:3, type:"confirmation", client:"João Costa",     phone:"(11) 99999-0003", time:"11:15", status:"delivered" },
  { id:4, type:"cancellation", client:"Carlos Lima",    phone:"(11) 99999-0004", time:"10:45", status:"failed"    },
  { id:5, type:"reminder_1h",  client:"André Santos",   phone:"(11) 99999-0005", time:"08:30", status:"delivered" },
  { id:6, type:"confirmation", client:"Felipe Torres",  phone:"(11) 99999-0006", time:"16:20", status:"delivered" },
];

const LOG_TYPES = {
  confirmation: { label:"Confirmação",  color:C.green  },
  reminder_24h: { label:"Lembrete 24h", color:C.blue   },
  reminder_1h:  { label:"Lembrete 1h",  color:C.indigo },
  cancellation: { label:"Cancelamento", color:C.red    },
  completion:   { label:"Pós-atend.",   color:C.amber  },
};

// ── Toggle ────────────────────────────────────────────────────
const Toggle = ({ value, onChange }) => (
  <button onClick={() => onChange(!value)} style={{
    width:"42px", height:"22px", borderRadius:"11px", border:"none", flexShrink:0,
    background: value ? C.green : C.border2, position:"relative", transition:"background 0.25s",
  }}>
    <div style={{
      position:"absolute", top:"3px", left: value ? "21px" : "3px",
      width:"16px", height:"16px", borderRadius:"50%", background:"white",
      transition:"left 0.25s", boxShadow:"0 1px 4px rgba(0,0,0,0.4)",
    }}/>
  </button>
);

// ── App ───────────────────────────────────────────────────────
export default function WhatsAppSettings() {
  const [tab, setTab] = useState("conexao");
  const [instanceId, setInstanceId] = useState("3A8F2C1B9D");
  const [token, setToken] = useState("••••••••••••••••••••••••••••••");
  const [showToken, setShowToken] = useState(false);
  const [connStatus, setConnStatus] = useState("disconnected"); // connected | connecting | disconnected
  const [qrVisible, setQrVisible] = useState(false);
  const [templates, setTemplates] = useState(DEFAULT_TEMPLATES);
  const [editingTpl, setEditingTpl] = useState(null);
  const [testPhone, setTestPhone] = useState("");
  const [sending, setSending] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);
  const [copiedId, setCopiedId] = useState(false);

  const showToast = (msg, type = "success") => {
    setToastMsg({ msg, type });
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleConnect = () => {
    setConnStatus("connecting");
    setQrVisible(true);
    setTimeout(() => { setConnStatus("connected"); setQrVisible(false); showToast("WhatsApp conectado com sucesso!"); }, 3000);
  };

  const handleDisconnect = () => {
    setConnStatus("disconnected");
    showToast("Instância desconectada.", "warning");
  };

  const handleTestSend = () => {
    if (!testPhone) return;
    setSending(true);
    setTimeout(() => { setSending(false); showToast(`Mensagem de teste enviada para ${testPhone}`); setTestPhone(""); }, 1800);
  };

  const copyId = () => {
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const toggleTemplate = (id) => {
    setTemplates(ts => ts.map(t => t.id === id ? { ...t, active: !t.active } : t));
  };

  const saveTemplate = (id, message) => {
    setTemplates(ts => ts.map(t => t.id === id ? { ...t, message } : t));
    showToast("Template salvo!");
  };

  const TABS = [
    { id:"conexao",   label:"Conexão",    icon:"phone"    },
    { id:"templates", label:"Templates",  icon:"edit"     },
    { id:"logs",      label:"Histórico",  icon:"logs"     },
    { id:"avancado",  label:"Avançado",   icon:"settings" },
  ];

  const statusCfg = {
    connected:    { label:"Conectado",    color:C.green,  bg:C.greenDim  },
    connecting:   { label:"Conectando…",  color:C.amber,  bg:C.amberDim  },
    disconnected: { label:"Desconectado", color:C.red,    bg:C.redDim    },
  }[connStatus];

  return (
    <div style={{
      minHeight:"100vh", background:C.bg, color:C.text,
      fontFamily:"'DM Sans', system-ui, sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        button { cursor:pointer; font-family:inherit; }
        input  { font-family:inherit; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-thumb { background:${C.border2}; border-radius:4px; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes popIn  { from{opacity:0;transform:scale(0.95)} to{opacity:1;transform:scale(1)} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        @keyframes pulse2 { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.85)} }
        @keyframes qrPulse{ 0%,100%{box-shadow:0 0 0 0 ${C.green}44} 50%{box-shadow:0 0 0 12px transparent} }
      `}</style>

      <div style={{ maxWidth:"900px", margin:"0 auto", padding:"32px 24px 80px" }}>

        {/* ── Header ── */}
        <div style={{
          display:"flex", alignItems:"flex-start", justifyContent:"space-between",
          marginBottom:"28px", flexWrap:"wrap", gap:"16px",
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:"14px" }}>
            <div style={{
              width:"48px", height:"48px", borderRadius:"14px",
              background:C.greenDim, border:`1px solid ${C.green}33`,
              display:"flex", alignItems:"center", justifyContent:"center",
            }}>
              <WALogo size={26}/>
            </div>
            <div>
              <h1 style={{ fontSize:"22px", fontWeight:"800", letterSpacing:"-0.02em" }}>
                WhatsApp Notifications
              </h1>
              <p style={{ fontSize:"13px", color:C.muted, marginTop:"2px" }}>
                Integração via Z-API · Estilo & Tradição
              </p>
            </div>
          </div>

          {/* Status badge */}
          <div style={{
            display:"flex", alignItems:"center", gap:"8px",
            padding:"8px 16px", borderRadius:"100px",
            background:statusCfg.bg, border:`1px solid ${statusCfg.color}33`,
          }}>
            <div style={{
              width:"8px", height:"8px", borderRadius:"50%",
              background:statusCfg.color,
              animation: connStatus === "connected" ? "pulse2 2s infinite" : connStatus === "connecting" ? "pulse2 0.8s infinite" : "none",
            }}/>
            <span style={{ fontSize:"12px", fontWeight:"700", color:statusCfg.color }}>
              {statusCfg.label}
            </span>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div style={{
          display:"flex", gap:"2px", padding:"4px",
          background:C.card, border:`1px solid ${C.border}`,
          borderRadius:"12px", marginBottom:"24px",
          width:"fit-content",
        }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              display:"flex", alignItems:"center", gap:"7px",
              padding:"8px 18px", borderRadius:"9px", fontSize:"13px", fontWeight:"600",
              border:"none", transition:"all 0.2s",
              background: tab===t.id ? C.greenDim : "transparent",
              color: tab===t.id ? C.green : C.muted,
            }}>
              <Ic n={t.icon} size={13}/>{t.label}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════════
            ABA: CONEXÃO
        ══════════════════════════════════════════ */}
        {tab === "conexao" && (
          <div style={{ animation:"fadeUp 0.3s ease" }}>

            {/* Card de conexão */}
            <div style={{
              background:C.card, border:`1px solid ${C.border}`, borderRadius:"18px",
              overflow:"hidden", marginBottom:"16px",
            }}>
              <div style={{
                padding:"20px 24px", borderBottom:`1px solid ${C.border}`,
                background:`linear-gradient(90deg, ${C.greenDim}, transparent)`,
                display:"flex", alignItems:"center", gap:"10px",
              }}>
                <WALogo size={16}/>
                <span style={{ fontWeight:"700", fontSize:"14px" }}>Instância Z-API</span>
                <span style={{
                  marginLeft:"auto", fontSize:"10px", fontWeight:"700",
                  padding:"2px 8px", borderRadius:"100px",
                  background:statusCfg.bg, color:statusCfg.color,
                }}>{statusCfg.label}</span>
              </div>

              <div style={{ padding:"24px", display:"flex", flexDirection:"column", gap:"16px" }}>
                {/* Instance ID */}
                <div>
                  <label style={{ fontSize:"11px", fontWeight:"700", color:C.muted,
                                  letterSpacing:"0.09em", textTransform:"uppercase",
                                  display:"block", marginBottom:"6px" }}>
                    Instance ID
                  </label>
                  <div style={{ display:"flex", gap:"8px" }}>
                    <input value={instanceId} onChange={e => setInstanceId(e.target.value)}
                           style={{
                             flex:1, padding:"10px 14px", borderRadius:"10px",
                             background:C.surface, border:`1px solid ${C.border}`,
                             color:C.text, fontSize:"13px", outline:"none",
                             fontFamily:"'DM Mono',monospace",
                           }}
                           onFocus={e => e.target.style.borderColor = C.green}
                           onBlur={e  => e.target.style.borderColor = C.border}
                    />
                    <button onClick={copyId} style={{
                      padding:"10px 14px", borderRadius:"10px", fontSize:"12px", fontWeight:"600",
                      background: copiedId ? C.greenDim : C.surface,
                      color: copiedId ? C.green : C.muted,
                      border:`1px solid ${copiedId ? C.green+"44" : C.border}`,
                      display:"flex", alignItems:"center", gap:"5px", transition:"all 0.2s",
                    }}>
                      <Ic n={copiedId ? "check" : "copy"} size={12}/>
                      {copiedId ? "Copiado" : "Copiar"}
                    </button>
                  </div>
                </div>

                {/* Token */}
                <div>
                  <label style={{ fontSize:"11px", fontWeight:"700", color:C.muted,
                                  letterSpacing:"0.09em", textTransform:"uppercase",
                                  display:"block", marginBottom:"6px" }}>
                    Token de autenticação
                  </label>
                  <div style={{ display:"flex", gap:"8px" }}>
                    <input
                      type={showToken ? "text" : "password"}
                      value={token} onChange={e => setToken(e.target.value)}
                      style={{
                        flex:1, padding:"10px 14px", borderRadius:"10px",
                        background:C.surface, border:`1px solid ${C.border}`,
                        color:C.text, fontSize:"13px", outline:"none",
                        fontFamily:"'DM Mono',monospace", letterSpacing: showToken ? "normal" : "0.2em",
                      }}
                      onFocus={e => e.target.style.borderColor = C.green}
                      onBlur={e  => e.target.style.borderColor = C.border}
                    />
                    <button onClick={() => setShowToken(s => !s)} style={{
                      padding:"10px 14px", borderRadius:"10px",
                      background:C.surface, border:`1px solid ${C.border}`,
                      color:C.muted, display:"flex", alignItems:"center",
                    }}><Ic n="eye" size={14}/></button>
                  </div>
                  <p style={{ fontSize:"11px", color:C.muted, marginTop:"6px" }}>
                    Encontre seu token em{" "}
                    <a href="#" style={{ color:C.green, textDecoration:"none" }}>
                      app.z-api.io → Instâncias → Token
                    </a>
                  </p>
                </div>

                {/* Botões de ação */}
                <div style={{ display:"flex", gap:"10px", paddingTop:"4px" }}>
                  {connStatus === "connected" ? (
                    <>
                      <button style={{
                        display:"flex", alignItems:"center", gap:"6px",
                        padding:"10px 18px", borderRadius:"10px", fontSize:"13px", fontWeight:"700",
                        background:C.redDim, color:C.red, border:`1px solid ${C.red}33`,
                      }} onClick={handleDisconnect}>
                        <Ic n="x" size={13}/> Desconectar
                      </button>
                      <button style={{
                        display:"flex", alignItems:"center", gap:"6px",
                        padding:"10px 18px", borderRadius:"10px", fontSize:"13px", fontWeight:"700",
                        background:C.surface, color:C.muted, border:`1px solid ${C.border}`,
                      }}>
                        <Ic n="refresh" size={13}/> Reconectar
                      </button>
                    </>
                  ) : (
                    <button onClick={handleConnect} style={{
                      display:"flex", alignItems:"center", gap:"8px",
                      padding:"11px 22px", borderRadius:"10px", fontSize:"13px", fontWeight:"700",
                      background:`linear-gradient(135deg, ${C.green}cc, ${C.green})`,
                      color:"#000", border:"none",
                    }}>
                      {connStatus === "connecting"
                        ? <><div style={{ width:"14px", height:"14px", border:"2px solid #000",
                                          borderTop:"2px solid transparent", borderRadius:"50%",
                                          animation:"spin 0.7s linear infinite" }}/> Conectando...</>
                        : <><WALogo size={14}/> Conectar via QR Code</>
                      }
                    </button>
                  )}
                </div>
              </div>

              {/* QR Code area */}
              {qrVisible && (
                <div style={{
                  borderTop:`1px solid ${C.border}`,
                  padding:"32px", textAlign:"center",
                  background:`radial-gradient(circle, ${C.greenDim} 0%, transparent 70%)`,
                }}>
                  <p style={{ fontSize:"13px", color:C.muted, marginBottom:"20px" }}>
                    Abra o WhatsApp → Dispositivos conectados → Adicionar dispositivo
                  </p>
                  {/* QR simulado */}
                  <div style={{
                    width:"160px", height:"160px", margin:"0 auto",
                    background:"white", borderRadius:"12px", padding:"12px",
                    display:"grid", gridTemplateColumns:"repeat(10,1fr)",
                    gap:"2px", animation:"qrPulse 1.5s infinite",
                  }}>
                    {Array.from({ length:100 }, (_,i) => {
                      const isEdge = i<10||i>89||i%10===0||i%10===9;
                      const rand = [12,13,23,24,34,45,55,56,66,44,32,67,78,88,47,58,69,41,52,63].includes(i);
                      return (
                        <div key={i} style={{
                          background: (isEdge || rand) ? "#000" : "transparent",
                          borderRadius:"1px",
                        }}/>
                      );
                    })}
                  </div>
                  <p style={{ fontSize:"11px", color:C.green, marginTop:"16px", fontWeight:"600" }}>
                    Aguardando leitura…
                  </p>
                </div>
              )}
            </div>

            {/* Teste de envio */}
            {connStatus === "connected" && (
              <div style={{
                background:C.card, border:`1px solid ${C.border}`, borderRadius:"16px",
                padding:"24px",
              }}>
                <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"16px" }}>
                  <span style={{ color:C.green }}><Ic n="send" size={14}/></span>
                  <span style={{ fontWeight:"700", fontSize:"14px" }}>Enviar mensagem de teste</span>
                </div>
                <div style={{ display:"flex", gap:"10px" }}>
                  <input
                    value={testPhone}
                    onChange={e => setTestPhone(e.target.value)}
                    placeholder="(11) 99999-0000"
                    style={{
                      flex:1, padding:"11px 14px", borderRadius:"10px",
                      background:C.surface, border:`1px solid ${C.border}`,
                      color:C.text, fontSize:"13px", outline:"none",
                    }}
                    onFocus={e => e.target.style.borderColor = C.green}
                    onBlur={e  => e.target.style.borderColor = C.border}
                  />
                  <button onClick={handleTestSend} disabled={!testPhone || sending} style={{
                    display:"flex", alignItems:"center", gap:"7px",
                    padding:"11px 20px", borderRadius:"10px", fontSize:"13px", fontWeight:"700",
                    background: testPhone && !sending ? `linear-gradient(135deg, ${C.green}cc, ${C.green})` : C.surface,
                    color: testPhone && !sending ? "#000" : C.muted,
                    border:`1px solid ${testPhone && !sending ? "transparent" : C.border}`,
                    transition:"all 0.2s",
                  }}>
                    {sending
                      ? <div style={{ width:"14px", height:"14px", border:"2px solid currentColor",
                                      borderTop:"2px solid transparent", borderRadius:"50%",
                                      animation:"spin 0.7s linear infinite" }}/>
                      : <Ic n="send" size={13}/>
                    }
                    {sending ? "Enviando…" : "Enviar teste"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════
            ABA: TEMPLATES
        ══════════════════════════════════════════ */}
        {tab === "templates" && (
          <div style={{ animation:"fadeUp 0.3s ease", display:"flex", flexDirection:"column", gap:"12px" }}>
            {templates.map(tpl => (
              <div key={tpl.id} style={{
                background:C.card, border:`1px solid ${tpl.active ? C.border2 : C.border}`,
                borderRadius:"16px", overflow:"hidden",
                opacity: tpl.active ? 1 : 0.6, transition:"opacity 0.2s",
              }}>
                <div style={{
                  display:"flex", alignItems:"center", gap:"12px",
                  padding:"16px 20px",
                }}>
                  <span style={{ fontSize:"22px", flexShrink:0 }}>{tpl.icon}</span>
                  <div style={{ flex:1 }}>
                    <p style={{ fontWeight:"700", fontSize:"14px", color:C.text }}>{tpl.name}</p>
                    <p style={{ fontSize:"11px", color:C.muted, marginTop:"2px" }}>{tpl.trigger}</p>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
                    <button
                      onClick={() => setEditingTpl(tpl)}
                      style={{
                        display:"flex", alignItems:"center", gap:"5px",
                        padding:"6px 12px", borderRadius:"8px", fontSize:"12px", fontWeight:"600",
                        background:C.surface, border:`1px solid ${C.border}`, color:C.muted,
                      }}>
                      <Ic n="edit" size={11}/> Editar
                    </button>
                    <Toggle value={tpl.active} onChange={() => toggleTemplate(tpl.id)}/>
                  </div>
                </div>

                {/* Preview da mensagem */}
                <div style={{
                  margin:"0 20px 16px",
                  padding:"12px 14px", borderRadius:"10px",
                  background:C.surface, border:`1px solid ${C.border}`,
                  maxHeight:"80px", overflow:"hidden", position:"relative",
                }}>
                  <p style={{
                    fontSize:"12px", color:C.muted, lineHeight:"1.6",
                    whiteSpace:"pre-wrap", fontFamily:"'DM Mono',monospace",
                    fontSize:"11px",
                  }}>
                    {tpl.message.slice(0, 120)}{tpl.message.length > 120 ? "…" : ""}
                  </p>
                  {/* Fade overlay */}
                  <div style={{
                    position:"absolute", bottom:0, left:0, right:0, height:"32px",
                    background:`linear-gradient(transparent, ${C.surface})`,
                  }}/>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ══════════════════════════════════════════
            ABA: LOGS
        ══════════════════════════════════════════ */}
        {tab === "logs" && (
          <div style={{ animation:"fadeUp 0.3s ease" }}>
            <div style={{
              background:C.card, border:`1px solid ${C.border}`, borderRadius:"16px",
              overflow:"hidden",
            }}>
              {/* Stats rápidas */}
              <div style={{
                display:"grid", gridTemplateColumns:"repeat(3,1fr)",
                borderBottom:`1px solid ${C.border}`,
              }}>
                {[
                  { label:"Enviadas hoje", value:"47", color:C.green },
                  { label:"Entregues",     value:"45", color:C.green },
                  { label:"Falhas",        value:"2",  color:C.red   },
                ].map((s,i) => (
                  <div key={i} style={{
                    padding:"16px 20px", textAlign:"center",
                    borderRight: i<2 ? `1px solid ${C.border}` : "none",
                  }}>
                    <p style={{ fontSize:"22px", fontWeight:"800", color:s.color }}>{s.value}</p>
                    <p style={{ fontSize:"11px", color:C.muted, marginTop:"2px" }}>{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Header tabela */}
              <div style={{
                display:"grid", gridTemplateColumns:"1.5fr 1fr 0.8fr 0.7fr 0.5fr",
                padding:"10px 20px", borderBottom:`1px solid ${C.border}`,
              }}>
                {["Cliente","Tipo","Telefone","Hora","Status"].map(h => (
                  <span key={h} style={{ fontSize:"10px", fontWeight:"700", color:C.muted,
                                        textTransform:"uppercase", letterSpacing:"0.1em" }}>{h}</span>
                ))}
              </div>

              {/* Linhas */}
              {LOGS.map((log, i) => {
                const lt = LOG_TYPES[log.type] || LOG_TYPES.confirmation;
                return (
                  <div key={log.id}
                       style={{
                         display:"grid", gridTemplateColumns:"1.5fr 1fr 0.8fr 0.7fr 0.5fr",
                         padding:"12px 20px", alignItems:"center",
                         borderBottom: i<LOGS.length-1 ? `1px solid ${C.border}` : "none",
                         transition:"background 0.15s",
                       }}
                       onMouseEnter={e => e.currentTarget.style.background = C.surface}
                       onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <span style={{ fontSize:"13px", fontWeight:"600", color:C.text }}>{log.client}</span>
                    <span style={{
                      fontSize:"10px", fontWeight:"700", padding:"2px 8px", borderRadius:"100px",
                      background:`${lt.color}18`, color:lt.color, letterSpacing:"0.04em",
                      width:"fit-content",
                    }}>{lt.label}</span>
                    <span style={{ fontSize:"12px", color:C.muted, fontFamily:"'DM Mono',monospace",
                                   fontSize:"11px" }}>{log.phone}</span>
                    <span style={{ fontSize:"12px", color:C.muted }}>{log.time}</span>
                    <span style={{
                      fontSize:"10px", fontWeight:"700",
                      color: log.status === "delivered" ? C.green : C.red,
                    }}>
                      {log.status === "delivered" ? "✓ OK" : "✗ Falha"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════
            ABA: AVANÇADO
        ══════════════════════════════════════════ */}
        {tab === "avancado" && (
          <div style={{ animation:"fadeUp 0.3s ease", display:"flex", flexDirection:"column", gap:"16px" }}>
            {/* Webhook */}
            <div style={{
              background:C.card, border:`1px solid ${C.border}`, borderRadius:"16px", padding:"24px",
            }}>
              <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"16px" }}>
                <span style={{ color:C.green }}><Ic n="link" size={14}/></span>
                <span style={{ fontWeight:"700", fontSize:"14px" }}>Webhook de status</span>
              </div>
              <p style={{ fontSize:"12px", color:C.muted, marginBottom:"12px", lineHeight:"1.6" }}>
                A Z-API enviará atualizações de entrega para esta URL. Configure em{" "}
                <code style={{ color:C.green, fontSize:"11px" }}>app.z-api.io → Webhooks</code>.
              </p>
              <div style={{
                display:"flex", alignItems:"center", gap:"8px",
                padding:"10px 14px", borderRadius:"10px",
                background:C.surface, border:`1px solid ${C.border}`,
              }}>
                <code style={{
                  flex:1, fontSize:"12px", color:C.green,
                  fontFamily:"'DM Mono',monospace",
                }}>
                  https://agendapro.app/api/webhooks/zapi
                </code>
                <button style={{ color:C.muted, display:"flex" }}><Ic n="copy" size={13}/></button>
              </div>
            </div>

            {/* Configurações de delay */}
            <div style={{
              background:C.card, border:`1px solid ${C.border}`, borderRadius:"16px", padding:"24px",
            }}>
              <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"16px" }}>
                <span style={{ color:C.green }}><Ic n="bell" size={14}/></span>
                <span style={{ fontWeight:"700", fontSize:"14px" }}>Timing de envio</span>
              </div>
              {[
                { label:"Delay entre mensagens", value:"3s", hint:"Evita bloqueio por spam" },
                { label:"Horário mínimo de envio", value:"08:00", hint:"Não envia antes deste horário" },
                { label:"Horário máximo de envio", value:"21:00", hint:"Não envia após este horário" },
              ].map((item,i) => (
                <div key={i} style={{
                  display:"flex", justifyContent:"space-between", alignItems:"center",
                  padding:"12px 0", borderBottom: i<2 ? `1px solid ${C.border}` : "none",
                }}>
                  <div>
                    <p style={{ fontSize:"13px", fontWeight:"600", color:C.text }}>{item.label}</p>
                    <p style={{ fontSize:"11px", color:C.muted, marginTop:"2px" }}>{item.hint}</p>
                  </div>
                  <span style={{
                    fontSize:"13px", fontWeight:"700", fontFamily:"'DM Mono',monospace",
                    padding:"5px 12px", borderRadius:"8px",
                    background:C.surface, border:`1px solid ${C.border}`, color:C.green,
                  }}>{item.value}</span>
                </div>
              ))}
            </div>

            {/* Alerta Z-API */}
            <div style={{
              padding:"14px 18px", borderRadius:"12px",
              background:C.amberDim, border:`1px solid ${C.amber}33`,
              display:"flex", gap:"10px", alignItems:"flex-start",
            }}>
              <span style={{ color:C.amber, flexShrink:0 }}><Ic n="alert" size={14}/></span>
              <p style={{ fontSize:"12px", color:C.amber, lineHeight:"1.6" }}>
                O número do WhatsApp deve estar em um celular com bateria e conexão estável. Reiniciar a instância frequentemente pode acionar proteções do WhatsApp.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Toast ── */}
      <div style={{
        position:"fixed", bottom:"24px", right:"24px", zIndex:300,
        display:"flex", alignItems:"center", gap:"10px",
        padding:"12px 18px", borderRadius:"12px",
        background: toastMsg?.type === "warning" ? C.amberDim : C.greenDim,
        border:`1px solid ${toastMsg?.type === "warning" ? C.amber+"44" : C.green+"44"}`,
        color: toastMsg?.type === "warning" ? C.amber : C.green,
        fontSize:"13px", fontWeight:"600",
        transform: toastMsg ? "translateY(0)" : "translateY(80px)",
        opacity: toastMsg ? 1 : 0,
        transition:"all 0.3s ease",
        boxShadow:"0 8px 32px rgba(0,0,0,0.5)",
        pointerEvents:"none",
      }}>
        <Ic n="check" size={14}/>
        {toastMsg?.msg}
      </div>

      {/* ── Modal de edição ── */}
      {editingTpl && (
        <TemplateEditor
          template={editingTpl}
          onSave={(msg) => saveTemplate(editingTpl.id, msg)}
          onClose={() => setEditingTpl(null)}
        />
      )}
    </div>
  );
}
