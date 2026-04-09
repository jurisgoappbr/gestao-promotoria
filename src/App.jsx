import { useState, useEffect, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { LogOut, Plus, Check, Users, FileText, Send, History, X, Search, Bell, Save, Trash2, ChevronLeft, ChevronRight, LayoutDashboard, ClipboardList, Edit3, AlertTriangle, Eye, Sunrise, Sunset, TrendingDown } from "lucide-react";

const font = `'DM Sans', system-ui, sans-serif`;
const today = new Date().toISOString().slice(0, 10);
const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16", "#f97316", "#6366f1"];

const INIT_OPTS = {
  tipo_procedimento: ["IP", "APF", "TC", "Processo", "Cautelar", "MPU", "Queixa"],
  tipo_manifestacao: ["Análise", "Denúncia", "Arquivamento", "Diligência", "Manifestação", "Razões", "Contrarrazões", "Memorial", "ANPP", "Transação", "Impugnação", "Ciência", "Prazo", "Petição Apelação", "Juízo de retratação", "Continuação"],
  grau_correcao: ["Nada", "Pequena alteração", "Refiz algumas partes", "Refiz", "Pedi para refazer"],
};

const MOCK = {
  profile: { id: "admin-1", nome: "Igor", email: "igor@mp.sp.gov.br", papel: "admin" },
  estagiarias: [
    { id: "e1", nome: "Isadora", email: "isadora@email.com", papel: "estagiaria", tipo_estagiaria: "graduacao", carga_horaria_diaria: 4, ativo: true },
    { id: "e2", nome: "Beatriz", email: "beatriz@email.com", papel: "estagiaria", tipo_estagiaria: "pos", carga_horaria_diaria: 6, ativo: true },
    { id: "e3", nome: "Sophia", email: "sophia@email.com", papel: "estagiaria", tipo_estagiaria: "graduacao", carga_horaria_diaria: 4, ativo: true },
    { id: "e4", nome: "Luna", email: "luna@email.com", papel: "estagiaria", tipo_estagiaria: "voluntaria", carga_horaria_diaria: 3, ativo: true },
    { id: "e5", nome: "Maria Fernanda", email: "mf@email.com", papel: "estagiaria", tipo_estagiaria: "pos", carga_horaria_diaria: 6, ativo: true },
    { id: "e6", nome: "Maria Clara", email: "mc@email.com", papel: "estagiaria", tipo_estagiaria: "graduacao", carga_horaria_diaria: 4, ativo: false },
  ],
  entregas: [
    { id: 1, numero_procedimento: "1500910-98.2025.8.26.0608", tipo_procedimento: "APF", tipo_manifestacao: "Denúncia", crime: "129, § 13", data_vista: "2026-03-28", num_folhas: 45, urgente: true, estagiaria_id: "e1", data_entrega: today, hora_entrega: "09:30", status: "pendente" },
    { id: 2, numero_procedimento: "1508321-70.2025.8.26.0196", tipo_procedimento: "TC", tipo_manifestacao: "Arquivamento", crime: "147", data_vista: "2026-03-30", num_folhas: null, urgente: false, estagiaria_id: "e6", data_entrega: today, hora_entrega: "10:15", status: "pendente" },
  ],
  registros: [
    { id: 1, data_trabalho: today, numero_procedimento: "1503933-27.2025.8.26.0196", tipo_procedimento: "IP", data_vista: "2026-03-28", num_folhas: null, crime: "147, § 1", tipo_manifestacao: "Análise", responsavel: "Igor", grau_correcao: null, obs_breves: "Falei com o Dr.", obs_detalhadas: null, acompanhar: false, complicado: false, feedback_tipo: null, feedback_dado: false, entrega_id: null },
    { id: 2, data_trabalho: today, numero_procedimento: "1501106-97.2026.8.26.0393", tipo_procedimento: "IP", data_vista: "2026-03-30", num_folhas: null, crime: "157", tipo_manifestacao: "Manifestação", responsavel: "Igor", grau_correcao: null, obs_breves: "Temporária e busca domiciliar", obs_detalhadas: null, acompanhar: true, complicado: false, feedback_tipo: null, feedback_dado: false, entrega_id: null },
  ],
  backlog: [
    { id: 1, data: today, momento: "inicio", pecas_corrigir: 4, pecas_minhas: 2, pecas_estagiarias: 4 },
    { id: 2, data: today, momento: "fim",    pecas_corrigir: 1, pecas_minhas: 0, pecas_estagiarias: 2 },
  ],
  crimes: ["147, § 1", "129, § 13", "129, § 13; 147, § 1", "171", "157", "121", "33, Lei 11.343/06", "155, § 4º", "180", "147"],
};

const S = {
  page: { fontFamily: font, minHeight: "100vh", display: "flex", background: "#f1f5f9", color: "#1e293b", fontSize: 14 },
  sidebar: { width: 230, background: "#0f172a", color: "#e2e8f0", display: "flex", flexDirection: "column", padding: "20px 0", flexShrink: 0, minHeight: "100vh" },
  logo: { padding: "0 20px 20px", fontSize: 17, fontWeight: 700, letterSpacing: "-0.02em", color: "#fff", borderBottom: "1px solid #1e293b" },
  navItem: (a) => ({ display: "flex", alignItems: "center", gap: 10, padding: "10px 20px", cursor: "pointer", fontSize: 13, fontWeight: a ? 600 : 400, background: a ? "#1e293b" : "transparent", color: a ? "#fff" : "#94a3b8", borderLeft: a ? "3px solid #3b82f6" : "3px solid transparent" }),
  main: { flex: 1, padding: "20px 28px", overflowY: "auto", maxHeight: "100vh" },
  card: { background: "#fff", borderRadius: 10, padding: 18, boxShadow: "0 1px 3px rgba(0,0,0,0.06)", marginBottom: 14 },
  statCard: (c) => ({ background: "#fff", borderRadius: 10, padding: "14px 18px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", borderLeft: `4px solid ${c}`, flex: 1, minWidth: 155 }),
  input: { width: "100%", padding: "7px 10px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 13, fontFamily: font, outline: "none", background: "#fff", boxSizing: "border-box" },
  select: { padding: "7px 10px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 13, fontFamily: font, background: "#fff", cursor: "pointer", boxSizing: "border-box" },
  btn: (v = "primary") => ({ padding: "7px 14px", borderRadius: 6, border: "none", fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: font, display: "inline-flex", alignItems: "center", gap: 5, ...(v === "primary" ? { background: "#2563eb", color: "#fff" } : v === "success" ? { background: "#10b981", color: "#fff" } : v === "danger" ? { background: "#ef4444", color: "#fff" } : v === "warn" ? { background: "#f59e0b", color: "#fff" } : { background: "#e2e8f0", color: "#475569" }) }),
  th: { padding: "8px 10px", textAlign: "left", fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", borderBottom: "2px solid #e2e8f0", whiteSpace: "nowrap" },
  td: { padding: "8px 10px", borderBottom: "1px solid #f1f5f9", fontSize: 12.5, verticalAlign: "middle" },
  badge: (c, bg) => ({ display: "inline-block", padding: "2px 7px", borderRadius: 99, fontSize: 10.5, fontWeight: 600, color: c, background: bg, whiteSpace: "nowrap" }),
  h1: { fontSize: 20, fontWeight: 700, marginBottom: 4, letterSpacing: "-0.02em" },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 },
  modal: { background: "#fff", borderRadius: 12, padding: 22, width: 520, maxWidth: "92vw", maxHeight: "85vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" },
  demoBanner: { background: "#fef3c7", color: "#92400e", padding: "6px 20px", fontSize: 11.5, fontWeight: 600, textAlign: "center" },
};

const fmtDate = (d) => d ? new Date(d + "T12:00:00").toLocaleDateString("pt-BR") : "—";
const shiftDay = (d, n) => { const x = new Date(d + "T12:00:00"); x.setDate(x.getDate() + n); return x.toISOString().slice(0, 10); };
const getEstName = (id, list) => list.find((e) => e.id === id)?.nome || "—";

function createApi(url, key) {
  const h = (t) => ({ apikey: key, Authorization: `Bearer ${t || key}`, "Content-Type": "application/json", Prefer: "return=representation" });
  return {
    login: async (em, pw) => (await fetch(`${url}/auth/v1/token?grant_type=password`, { method: "POST", headers: { apikey: key, "Content-Type": "application/json" }, body: JSON.stringify({ email: em, password: pw }) })).json(),
    signup: async (em, pw) => (await fetch(`${url}/auth/v1/signup`, { method: "POST", headers: { apikey: key, "Content-Type": "application/json" }, body: JSON.stringify({ email: em, password: pw }) })).json(),
    get: async (tbl, t, q = "") => (await fetch(`${url}/rest/v1/${tbl}?${q}`, { headers: h(t) })).json(),
    post: async (tbl, d, t) => (await fetch(`${url}/rest/v1/${tbl}`, { method: "POST", headers: h(t), body: JSON.stringify(d) })).json(),
    patch: async (tbl, id, d, t) => (await fetch(`${url}/rest/v1/${tbl}?id=eq.${id}`, { method: "PATCH", headers: h(t), body: JSON.stringify(d) })).json(),
    del: async (tbl, id, t) => fetch(`${url}/rest/v1/${tbl}?id=eq.${id}`, { method: "DELETE", headers: h(t) }),
    upsert: async (tbl, d, t) => (await fetch(`${url}/rest/v1/${tbl}`, { method: "POST", headers: { ...h(t), Prefer: "return=representation,resolution=merge-duplicates" }, body: JSON.stringify(d) })).json(),
  };
}

function Modal({ title, onClose, children }) {
  return (<div style={S.overlay} onClick={onClose}><div style={S.modal} onClick={(e) => e.stopPropagation()}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
      <h3 style={{ fontSize: 15, fontWeight: 700 }}>{title}</h3>
      <X size={16} style={{ cursor: "pointer", color: "#94a3b8" }} onClick={onClose} />
    </div>{children}</div></div>);
}
function Field({ label, children, style: st }) {
  return (<div style={{ marginBottom: 10, ...st }}><label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: "#64748b", marginBottom: 3 }}>{label}</label>{children}</div>);
}
function DynSelect({ value, onChange, options, onAdd, placeholder, style: st }) {
  const [adding, setAdding] = useState(false);
  const [nv, setNv] = useState("");
  if (adding) return (<div style={{ display: "flex", gap: 4, ...st }}>
    <input style={{ ...S.input, flex: 1 }} value={nv} onChange={(e) => setNv(e.target.value)} placeholder="Novo valor..." autoFocus onKeyDown={(e) => { if (e.key === "Enter" && nv.trim()) { onAdd(nv.trim()); onChange(nv.trim()); setAdding(false); setNv(""); } if (e.key === "Escape") { setAdding(false); setNv(""); } }} />
    <button style={S.btn("success")} onClick={() => { if (nv.trim()) { onAdd(nv.trim()); onChange(nv.trim()); setAdding(false); setNv(""); } }}><Check size={13} /></button>
    <button style={S.btn("ghost")} onClick={() => { setAdding(false); setNv(""); }}><X size={13} /></button>
  </div>);
  return (<select style={{ ...S.select, width: "100%", ...st }} value={value} onChange={(e) => { if (e.target.value === "__add") setAdding(true); else onChange(e.target.value); }}>
    <option value="">{placeholder || "Selecione..."}</option>
    {options.map((o) => <option key={o} value={o}>{o}</option>)}
    <option value="__add">+ Adicionar novo...</option>
  </select>);
}
function CrimeInput({ value, onChange, suggestions }) {
  const lid = useMemo(() => "cr" + Math.random().toString(36).slice(2, 7), []);
  return (<><input list={lid} style={S.input} value={value} onChange={(e) => onChange(e.target.value)} placeholder="Ex: 129, § 13" /><datalist id={lid}>{suggestions.map((s) => <option key={s} value={s} />)}</datalist></>);
}

/* ─── BACKLOG CARD ─── */
function BacklogCard({ backlog, setBacklog, selectedDate, api, token, demo }) {
  const empty = { pecas_corrigir: "", pecas_minhas: "", pecas_estagiarias: "" };

  // Estado local para edição — inicializado com o que já existe no banco
  const blInicio = backlog.find((b) => b.data === selectedDate && b.momento === "inicio");
  const blFim    = backlog.find((b) => b.data === selectedDate && b.momento === "fim");

  const [localInicio, setLocalInicio] = useState({ pecas_corrigir: blInicio?.pecas_corrigir ?? "", pecas_minhas: blInicio?.pecas_minhas ?? "", pecas_estagiarias: blInicio?.pecas_estagiarias ?? "" });
  const [localFim,    setLocalFim]    = useState({ pecas_corrigir: blFim?.pecas_corrigir ?? "",    pecas_minhas: blFim?.pecas_minhas ?? "",    pecas_estagiarias: blFim?.pecas_estagiarias ?? "" });
  const [savingInicio, setSavingInicio] = useState(false);
  const [savingFim,    setSavingFim]    = useState(false);
  const [savedInicio,  setSavedInicio]  = useState(false);
  const [savedFim,     setSavedFim]     = useState(false);

  // Sincroniza estado local quando a data muda ou o backlog é atualizado externamente
  useEffect(() => {
    const i = backlog.find((b) => b.data === selectedDate && b.momento === "inicio");
    const f = backlog.find((b) => b.data === selectedDate && b.momento === "fim");
    setLocalInicio({ pecas_corrigir: i?.pecas_corrigir ?? "", pecas_minhas: i?.pecas_minhas ?? "", pecas_estagiarias: i?.pecas_estagiarias ?? "" });
    setLocalFim({    pecas_corrigir: f?.pecas_corrigir ?? "", pecas_minhas: f?.pecas_minhas ?? "", pecas_estagiarias: f?.pecas_estagiarias ?? "" });
  }, [selectedDate, backlog.length]);

  const saveMomento = async (momento) => {
    const local = momento === "inicio" ? localInicio : localFim;
    const setSaving = momento === "inicio" ? setSavingInicio : setSavingFim;
    const setSaved  = momento === "inicio" ? setSavedInicio  : setSavedFim;
    const payload = {
      data: selectedDate,
      momento,
      pecas_corrigir:    parseInt(local.pecas_corrigir)    || 0,
      pecas_minhas:      parseInt(local.pecas_minhas)      || 0,
      pecas_estagiarias: parseInt(local.pecas_estagiarias) || 0,
    };
    setSaving(true);
    const ex = backlog.find((b) => b.data === selectedDate && b.momento === momento);
    if (!demo) {
      try {
        if (ex) {
          await api.patch("backlog", ex.id, { pecas_corrigir: payload.pecas_corrigir, pecas_minhas: payload.pecas_minhas, pecas_estagiarias: payload.pecas_estagiarias }, token);
          setBacklog(backlog.map((b) => (b.data === selectedDate && b.momento === momento) ? { ...b, ...payload } : b));
        } else {
          const result = await api.post("backlog", payload, token);
          const row = Array.isArray(result) ? result[0] : result;
          setBacklog([...backlog, row]);
        }
      } catch (e) {
        if (ex) {
          setBacklog(backlog.map((b) => (b.data === selectedDate && b.momento === momento) ? { ...b, ...payload } : b));
        } else {
          setBacklog([...backlog, { ...payload, id: Date.now() }]);
        }
      }
    } else {
      if (ex) {
        setBacklog(backlog.map((b) => (b.data === selectedDate && b.momento === momento) ? { ...b, ...payload } : b));
      } else {
        setBacklog([...backlog, { ...payload, id: Date.now() }]);
      }
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const hasInicio = !!blInicio;
  const hasFim    = !!blFim;

  // Calcula delta usando os valores salvos no backlog (não o estado local)
  const delta = (field) => {
    if (!hasInicio || !hasFim) return null;
    return (blFim[field] ?? 0) - (blInicio[field] ?? 0);
  };

  const DeltaBadge = ({ field }) => {
    const d = delta(field);
    if (d === null) return <span style={{ fontSize: 10, color: "#cbd5e1" }}>—</span>;
    const neg = d < 0; const zer = d === 0;
    return (
      <span style={{ fontSize: 10.5, fontWeight: 700, padding: "1px 6px", borderRadius: 99, background: neg ? "#d1fae5" : zer ? "#f1f5f9" : "#fee2e2", color: neg ? "#065f46" : zer ? "#64748b" : "#991b1b" }}>
        {neg ? `▼ ${Math.abs(d)}` : zer ? "=" : `▲ ${d}`}
      </span>
    );
  };

  const fields = [
    { key: "pecas_corrigir",    label: "Corrigir" },
    { key: "pecas_minhas",      label: "Minhas" },
    { key: "pecas_estagiarias", label: "Estagiárias" },
  ];

  const Section = ({ momento, label, icon: Icon, color, local, setLocal, saving, saved }) => (
    <div style={{ flex: 1, minWidth: 200 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 8, fontSize: 11.5, fontWeight: 700, color, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        <Icon size={13} /> {label}
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        {fields.map((f) => (
          <Field key={f.key} label={f.label} style={{ marginBottom: 0, flex: 1 }}>
            <input
              type="number" min="0"
              style={{ ...S.input, textAlign: "center" }}
              value={local[f.key]}
              onChange={(e) => setLocal({ ...local, [f.key]: e.target.value })}
              placeholder="0"
            />
          </Field>
        ))}
      </div>
      <button
        style={{ ...S.btn(saved ? "success" : "primary"), fontSize: 11, padding: "5px 10px", width: "100%", justifyContent: "center" }}
        onClick={() => saveMomento(momento)}
        disabled={saving}
      >
        {saving ? "Salvando..." : saved ? <><Check size={12} /> Salvo</> : <><Save size={12} /> Salvar {label}</>}
      </button>
    </div>
  );

  return (
    <div style={{ ...S.card, padding: "14px 16px" }}>
      <div style={{ fontSize: 11.5, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>Backlog</div>
      <div style={{ display: "flex", gap: 18, flexWrap: "wrap", alignItems: "flex-start" }}>
        <Section momento="inicio" label="Início do dia" icon={Sunrise} color="#f59e0b" local={localInicio} setLocal={setLocalInicio} saving={savingInicio} saved={savedInicio} />

        {/* Divisor */}
        <div style={{ width: 1, background: "#e2e8f0", alignSelf: "stretch", marginTop: 20 }} />

        <Section momento="fim" label="Fim do dia" icon={Sunset} color="#6366f1" local={localFim} setLocal={setLocalFim} saving={savingFim} saved={savedFim} />

        {/* Delta — só aparece quando ambos os snapshots estão salvos no banco */}
        {(hasInicio || hasFim) && (
          <div style={{ minWidth: 140 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 8, fontSize: 11.5, fontWeight: 700, color: "#10b981", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              <TrendingDown size={13} /> Balanço
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, paddingTop: 2 }}>
              {fields.map((f) => (
                <div key={f.key} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 11, color: "#94a3b8", flex: 1 }}>{f.label}</span>
                  <DeltaBadge field={f.key} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Resumo textual quando ambos preenchidos */}
      {hasInicio && hasFim && (() => {
        const totalI = (blInicio.pecas_corrigir || 0) + (blInicio.pecas_minhas || 0) + (blInicio.pecas_estagiarias || 0);
        const totalF = (blFim.pecas_corrigir || 0) + (blFim.pecas_minhas || 0) + (blFim.pecas_estagiarias || 0);
        const diff = totalF - totalI;
        if (totalI === 0 && totalF === 0) return null;
        return (
          <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid #f1f5f9", fontSize: 12, color: "#475569" }}>
            Pendências totais: <strong>{totalI}</strong> → <strong>{totalF}</strong>
            {diff !== 0 && (
              <span style={{ marginLeft: 6, fontWeight: 700, color: diff < 0 ? "#10b981" : "#ef4444" }}>
                ({diff < 0 ? `${Math.abs(diff)} a menos` : `${diff} a mais`})
              </span>
            )}
          </div>
        );
      })()}
    </div>
  );
}

function ConfigScreen({ onConnect, onDemo }) {
  const [url, setUrl] = useState(""); const [key, setKey] = useState("");
  return (<div style={{ ...S.page, alignItems: "center", justifyContent: "center", background: "#0f172a" }}>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
    <div style={{ background: "#fff", borderRadius: 16, padding: 36, width: 400, maxWidth: "90vw", textAlign: "center" }}>
      <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 4, letterSpacing: "-0.03em" }}>Gestão da Promotoria</div>
      <div style={{ fontSize: 12.5, color: "#64748b", marginBottom: 24 }}>4ª PJ Criminal — Franca/SP</div>
      <Field label="Supabase URL"><input style={S.input} placeholder="https://xyz.supabase.co" value={url} onChange={(e) => setUrl(e.target.value)} /></Field>
      <Field label="Supabase Anon Key"><input style={S.input} placeholder="eyJhbGciOi..." value={key} onChange={(e) => setKey(e.target.value)} /></Field>
      <button style={{ ...S.btn("primary"), width: "100%", justifyContent: "center", padding: "9px", marginBottom: 10, opacity: url && key ? 1 : 0.5 }} disabled={!url || !key} onClick={() => onConnect(url, key)}>Conectar ao Supabase</button>
      <button style={{ ...S.btn("ghost"), width: "100%", justifyContent: "center", padding: "9px" }} onClick={onDemo}>Modo Demonstração</button>
    </div></div>);
}

function AuthScreen({ api, onAuth }) {
  const [mode, setMode] = useState("login");
  const [f, setF] = useState({ email: "", pw: "", nome: "", tipo: "graduacao", carga: "4" });
  const [err, setErr] = useState(""); const [loading, setLoading] = useState(false);
  const upd = (k, v) => setF({ ...f, [k]: v });
  const submit = async () => {
    setErr(""); setLoading(true);
    try {
      if (mode === "login") {
        const r = await api.login(f.email, f.pw);
        if (r.error || r.message) { setErr(r.error_description || r.message || "Erro no login"); setLoading(false); return; }
        const userId = r.user?.id;
        if (!userId) { setErr("Resposta inesperada do servidor"); setLoading(false); return; }
        const p = await api.get("profiles", r.access_token, `id=eq.${userId}`);
        const prof = Array.isArray(p) ? p[0] : null;
        if (!prof) { setErr("Perfil não encontrado. Verifique se o cadastro foi concluído."); setLoading(false); return; }
        onAuth(r.access_token, r.user, prof);
      } else {
        const r = await api.signup(f.email, f.pw);
        if (r.error || r.message) { setErr(r.error_description || r.message || "Erro no registro"); setLoading(false); return; }
        const tok = r.access_token || (await api.login(f.email, f.pw)).access_token;
        const uid = r.user?.id || r.id;
        if (!uid || !tok) { setErr("Erro ao criar conta. Tente fazer login."); setLoading(false); return; }
        await api.post("profiles", { id: uid, nome: f.nome, email: f.email, papel: "estagiaria", tipo_estagiaria: f.tipo, carga_horaria_diaria: parseFloat(f.carga) }, tok);
        const p = await api.get("profiles", tok, `id=eq.${uid}`);
        const prof = Array.isArray(p) ? p[0] : null;
        if (!prof) { setErr("Perfil criado mas não encontrado. Tente fazer login."); setLoading(false); return; }
        onAuth(tok, { id: uid }, prof);
      }
    } catch (e) { setErr("Erro: " + e.message); }
    setLoading(false);
  };
  return (<div style={{ ...S.page, alignItems: "center", justifyContent: "center", background: "#0f172a" }}>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
    <div style={{ background: "#fff", borderRadius: 16, padding: 36, width: 400, maxWidth: "90vw" }}>
      <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 18, textAlign: "center" }}>{mode === "login" ? "Entrar" : "Registro — Estagiária"}</div>
      {mode === "register" && <Field label="Nome completo"><input style={S.input} value={f.nome} onChange={(e) => upd("nome", e.target.value)} /></Field>}
      <Field label="E-mail"><input style={S.input} type="email" value={f.email} onChange={(e) => upd("email", e.target.value)} /></Field>
      <Field label="Senha"><input style={S.input} type="password" value={f.pw} onChange={(e) => upd("pw", e.target.value)} /></Field>
      {mode === "register" && <><Field label="Tipo"><select style={{ ...S.select, width: "100%" }} value={f.tipo} onChange={(e) => upd("tipo", e.target.value)}>
        <option value="graduacao">Graduação (4h)</option><option value="pos">Pós-Graduação (6h)</option><option value="voluntaria">Voluntária</option>
      </select></Field>
      <Field label="Carga horária/dia"><input style={S.input} type="number" step="0.5" min="1" max="8" value={f.carga} onChange={(e) => upd("carga", e.target.value)} /></Field></>}
      {err && <div style={{ color: "#ef4444", fontSize: 12, marginBottom: 10 }}>{err}</div>}
      <button style={{ ...S.btn("primary"), width: "100%", justifyContent: "center", padding: "9px", marginBottom: 10 }} onClick={submit} disabled={loading}>{loading ? "Aguarde..." : mode === "login" ? "Entrar" : "Registrar"}</button>
      <div style={{ textAlign: "center", fontSize: 12.5, color: "#64748b" }}>
        {mode === "login" ? <span>Nova estagiária? <a href="#" style={{ color: "#2563eb" }} onClick={() => { setMode("register"); setErr(""); }}>Registre-se</a></span> : <span>Já tem conta? <a href="#" style={{ color: "#2563eb" }} onClick={() => { setMode("login"); setErr(""); }}>Entrar</a></span>}
      </div></div></div>);
}

function Sidebar({ papel, active, setActive, nome, pendCount, onLogout }) {
  const tabs = papel === "admin" ? [{ key: "dia", icon: ClipboardList, label: "Dia de Trabalho" }, { key: "dash", icon: LayoutDashboard, label: "Dashboard" }, { key: "est", icon: Users, label: "Estagiárias" }] : [{ key: "registrar", icon: Send, label: "Registrar Entrega" }, { key: "historico", icon: History, label: "Meu Histórico" }];
  return (<div style={S.sidebar}>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
    <div style={S.logo}>Gestão Promotoria</div>
    <div style={{ padding: "14px 20px 6px", fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>Menu</div>
    {tabs.map((t) => (<div key={t.key} style={S.navItem(active === t.key)} onClick={() => setActive(t.key)}>
      <t.icon size={15} /><span>{t.label}</span>
      {t.key === "dia" && pendCount > 0 && <span style={{ marginLeft: "auto", background: "#f59e0b", color: "#fff", borderRadius: 99, padding: "1px 6px", fontSize: 10, fontWeight: 700 }}>{pendCount}</span>}
    </div>))}
    <div style={{ marginTop: "auto", padding: "14px 20px", borderTop: "1px solid #1e293b" }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{nome}</div>
      <div style={{ fontSize: 11, color: "#64748b", marginBottom: 8 }}>{papel === "admin" ? "Promotor" : "Estagiária"}</div>
      <div style={{ ...S.navItem(false), padding: "4px 0" }} onClick={onLogout}><LogOut size={13} /><span style={{ fontSize: 12 }}>Sair</span></div>
    </div></div>);
}

/* ─── ADMIN: DIA DE TRABALHO ─── */
function DiaTrabalho({ registros, setRegistros, entregas, setEntregas, backlog, setBacklog, opts, setOpts, crimes, setCrimes, estagiarias, selectedDate, setSelectedDate, api, token, demo }) {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [corrigindo, setCorrigindo] = useState(null);
  const empty = { numero_procedimento: "", tipo_procedimento: "", data_vista: "", num_folhas: "", crime: "", tipo_manifestacao: "", responsavel: "Igor", grau_correcao: "", obs_breves: "", obs_detalhadas: "", acompanhar: false, complicado: false, feedback_tipo: "", feedback_dado: false };
  const [form, setForm] = useState(empty);
  const upd = (k, v) => setForm({ ...form, [k]: v });
  const dayRegs = registros.filter((r) => r.data_trabalho === selectedDate);
  const pendentes = entregas.filter((e) => e.status === "pendente").sort((a, b) => (b.urgente ? 1 : 0) - (a.urgente ? 1 : 0));

  const addOpt = async (campo, valor) => {
    if (!demo) try { await api.post("opcoes", { campo, valor }, token); } catch (e) {}
  };

  const saveReg = async () => {
    if (!form.numero_procedimento || !form.tipo_procedimento || !form.tipo_manifestacao) return;
    if (form.crime && !crimes.includes(form.crime)) setCrimes([...crimes, form.crime]);
    const clean = {
      numero_procedimento: form.numero_procedimento,
      tipo_procedimento: form.tipo_procedimento,
      tipo_manifestacao: form.tipo_manifestacao,
      responsavel: form.responsavel,
      data_vista: form.data_vista || null,
      num_folhas: form.num_folhas ? parseInt(form.num_folhas) : null,
      crime: form.crime || null,
      grau_correcao: form.grau_correcao || null,
      obs_breves: form.obs_breves || null,
      obs_detalhadas: form.obs_detalhadas || null,
      acompanhar: form.acompanhar,
      complicado: form.complicado,
      feedback_tipo: form.feedback_tipo || null,
      feedback_dado: form.feedback_tipo ? form.feedback_dado : false,
    };
    if (editId) {
      if (!demo) try { await api.patch("registros", editId, clean, token); } catch (e) {}
      setRegistros(registros.map((r) => r.id === editId ? { ...r, ...clean } : r));
      setEditId(null);
    } else {
      const payload = { ...clean, data_trabalho: selectedDate, entrega_id: corrigindo?.id || null };
      if (!demo) {
        try {
          const [result] = await api.post("registros", payload, token);
          setRegistros([...registros, result]);
          if (corrigindo) {
            await api.patch("entregas", corrigindo.id, { status: "corrigido" }, token);
            setEntregas(entregas.map((e) => e.id === corrigindo.id ? { ...e, status: "corrigido" } : e));
          }
        } catch (e) { setRegistros([...registros, { ...payload, id: Date.now() }]); }
      } else {
        setRegistros([...registros, { ...payload, id: Date.now() }]);
        if (corrigindo) setEntregas(entregas.map((e) => e.id === corrigindo.id ? { ...e, status: "corrigido" } : e));
      }
    }
    setForm(empty); setShowForm(false); setCorrigindo(null);
  };

  const startCorr = (ent) => { setCorrigindo(ent); setForm({ ...empty, numero_procedimento: ent.numero_procedimento, tipo_procedimento: ent.tipo_procedimento, tipo_manifestacao: ent.tipo_manifestacao, crime: ent.crime || "", data_vista: ent.data_vista || "", num_folhas: ent.num_folhas || "", responsavel: getEstName(ent.estagiaria_id, estagiarias) }); setShowForm(true); };
  const startEdit = (r) => { setEditId(r.id); setForm({ numero_procedimento: r.numero_procedimento, tipo_procedimento: r.tipo_procedimento, data_vista: r.data_vista || "", num_folhas: r.num_folhas || "", crime: r.crime || "", tipo_manifestacao: r.tipo_manifestacao, responsavel: r.responsavel, grau_correcao: r.grau_correcao || "", obs_breves: r.obs_breves || "", obs_detalhadas: r.obs_detalhadas || "", acompanhar: r.acompanhar, complicado: r.complicado, feedback_tipo: r.feedback_tipo || "", feedback_dado: r.feedback_dado || false }); setShowForm(true); };

  const delReg = async (id) => {
    const r = registros.find((x) => x.id === id);
    if (!demo) {
      try {
        await api.del("registros", id, token);
        if (r?.entrega_id) await api.patch("entregas", r.entrega_id, { status: "pendente" }, token);
      } catch (e) {}
    }
    if (r?.entrega_id) setEntregas(entregas.map((e) => e.id === r.entrega_id ? { ...e, status: "pendente" } : e));
    setRegistros(registros.filter((x) => x.id !== id));
  };

  const nomes = ["Igor", ...estagiarias.filter((e) => e.ativo).map((e) => e.nome)];

  return (<div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
      <div>
        <h1 style={S.h1}>Dia de Trabalho</h1>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
          <ChevronLeft size={18} style={{ cursor: "pointer", color: "#64748b" }} onClick={() => setSelectedDate(shiftDay(selectedDate, -1))} />
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} style={{ ...S.input, width: "auto", fontWeight: 600, textAlign: "center" }} />
          <ChevronRight size={18} style={{ cursor: "pointer", color: "#64748b" }} onClick={() => setSelectedDate(shiftDay(selectedDate, 1))} />
          {selectedDate !== today && <button style={{ ...S.btn("ghost"), fontSize: 11, padding: "4px 8px" }} onClick={() => setSelectedDate(today)}>Hoje</button>}
        </div>
      </div>
      <button style={S.btn("primary")} onClick={() => { setForm(empty); setEditId(null); setCorrigindo(null); setShowForm(true); }}><Plus size={14} /> Novo Registro</button>
    </div>

    {/* Backlog Card extraído como componente próprio */}
    <BacklogCard
      backlog={backlog}
      setBacklog={setBacklog}
      selectedDate={selectedDate}
      api={api}
      token={token}
      demo={demo}
    />

    {pendentes.length > 0 && <div style={{ ...S.card, borderLeft: "4px solid #f59e0b" }}>
      <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}><Bell size={14} color="#f59e0b" /> Pendentes de Correção ({pendentes.length})</h3>
      {pendentes.map((e) => (<div key={e.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: "1px solid #f8fafc" }}>
        <div style={{ fontSize: 12.5 }}><span style={{ fontWeight: 600 }}>{getEstName(e.estagiaria_id, estagiarias)}</span><span style={{ color: "#64748b" }}> — {e.tipo_manifestacao} — </span><span style={{ fontFamily: "monospace", fontSize: 11.5 }}>{e.numero_procedimento}</span><span style={{ color: "#94a3b8", marginLeft: 6, fontSize: 11 }}>{fmtDate(e.data_entrega)} {e.hora_entrega}</span>{e.urgente && <span style={{ ...S.badge("#991b1b", "#fee2e2"), marginLeft: 6 }}>URGENTE</span>}</div>
        <button style={S.btn("warn")} onClick={() => startCorr(e)}><Edit3 size={12} /> Corrigir</button>
      </div>))}
    </div>}
    <div style={S.card}>
      <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Registros — {fmtDate(selectedDate)} ({dayRegs.length})</h3>
      {dayRegs.length === 0 ? <div style={{ color: "#94a3b8", fontSize: 13, textAlign: "center", padding: 20 }}>Nenhum registro neste dia</div>
        : <div style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
          <thead><tr><th style={S.th}>Número</th><th style={S.th}>Tipo</th><th style={S.th}>Vista</th><th style={S.th}>Crime</th><th style={S.th}>Manifestação</th><th style={S.th}>Resp.</th><th style={S.th}>Correção</th><th style={S.th}>Obs.</th><th style={S.th}>Flags</th><th style={S.th}></th></tr></thead>
          <tbody>{dayRegs.map((r) => (<tr key={r.id} style={{ background: r.responsavel !== "Igor" ? "#f0f9ff" : "transparent" }}>
            <td style={{ ...S.td, fontFamily: "monospace", fontSize: 11 }}>{r.numero_procedimento}</td>
            <td style={S.td}><span style={S.badge("#1e40af", "#dbeafe")}>{r.tipo_procedimento}</span></td>
            <td style={{ ...S.td, fontSize: 12 }}>{fmtDate(r.data_vista)}</td>
            <td style={{ ...S.td, fontSize: 12, maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.crime || "—"}</td>
            <td style={S.td}><span style={S.badge("#065f46", "#d1fae5")}>{r.tipo_manifestacao}</span></td>
            <td style={{ ...S.td, fontWeight: r.responsavel === "Igor" ? 400 : 600, color: r.responsavel === "Igor" ? "#64748b" : "#1e293b" }}>{r.responsavel}</td>
            <td style={S.td}>{r.grau_correcao ? <span style={S.badge(r.grau_correcao === "Nada" ? "#065f46" : r.grau_correcao.includes("refazer") ? "#991b1b" : "#92400e", r.grau_correcao === "Nada" ? "#d1fae5" : r.grau_correcao.includes("refazer") ? "#fee2e2" : "#fef3c7")}>{r.grau_correcao}</span> : "—"}</td>
            <td style={{ ...S.td, fontSize: 11.5, maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={r.obs_detalhadas || r.obs_breves || ""}>{r.obs_breves || "—"}</td>
            <td style={S.td}>{r.acompanhar && <span style={{ ...S.badge("#1e40af", "#dbeafe"), marginRight: 3 }}>AC</span>}{r.complicado && <span style={{ ...S.badge("#991b1b", "#fee2e2"), marginRight: 3 }}>!</span>}{r.feedback_tipo && <span style={S.badge(r.feedback_dado ? "#065f46" : "#92400e", r.feedback_dado ? "#d1fae5" : "#fef3c7")}>{r.feedback_tipo === "elogio" ? "👍" : "👎"}{r.feedback_dado ? " ✓" : ""}</span>}</td>
            <td style={S.td}><div style={{ display: "flex", gap: 4 }}><Edit3 size={13} style={{ cursor: "pointer", color: "#94a3b8" }} onClick={() => startEdit(r)} /><Trash2 size={13} style={{ cursor: "pointer", color: "#94a3b8" }} onClick={() => delReg(r.id)} /></div></td>
          </tr>))}</tbody></table></div>}
    </div>
    {showForm && <Modal title={corrigindo ? "Corrigir Entrega" : editId ? "Editar Registro" : "Novo Registro"} onClose={() => { setShowForm(false); setCorrigindo(null); setEditId(null); setForm(empty); }}>
      <Field label="Número do procedimento *"><input style={S.input} value={form.numero_procedimento} onChange={(e) => upd("numero_procedimento", e.target.value)} placeholder="0000000-00.0000.0.00.0000" /></Field>
      <div style={{ display: "flex", gap: 10 }}>
        <Field label="Tipo procedimento *" style={{ flex: 1 }}><DynSelect value={form.tipo_procedimento} onChange={(v) => upd("tipo_procedimento", v)} options={opts.tipo_procedimento} onAdd={(v) => { setOpts({ ...opts, tipo_procedimento: [...opts.tipo_procedimento, v] }); addOpt("tipo_procedimento", v); }} /></Field>
        <Field label="Data da vista" style={{ flex: 1 }}><input type="date" style={S.input} value={form.data_vista} onChange={(e) => upd("data_vista", e.target.value)} /></Field>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <Field label="Crime" style={{ flex: 2 }}><CrimeInput value={form.crime} onChange={(v) => upd("crime", v)} suggestions={crimes} /></Field>
        <Field label="Folhas" style={{ flex: 1 }}><input type="number" style={S.input} value={form.num_folhas} onChange={(e) => upd("num_folhas", e.target.value)} /></Field>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <Field label="Tipo manifestação *" style={{ flex: 1 }}><DynSelect value={form.tipo_manifestacao} onChange={(v) => upd("tipo_manifestacao", v)} options={opts.tipo_manifestacao} onAdd={(v) => { setOpts({ ...opts, tipo_manifestacao: [...opts.tipo_manifestacao, v] }); addOpt("tipo_manifestacao", v); }} /></Field>
        <Field label="Responsável" style={{ flex: 1 }}><select style={{ ...S.select, width: "100%" }} value={form.responsavel} onChange={(e) => upd("responsavel", e.target.value)}>{nomes.map((n) => <option key={n} value={n}>{n}</option>)}</select></Field>
      </div>
      {form.responsavel !== "Igor" && <Field label="Grau da correção"><DynSelect value={form.grau_correcao} onChange={(v) => upd("grau_correcao", v)} options={opts.grau_correcao} onAdd={(v) => { setOpts({ ...opts, grau_correcao: [...opts.grau_correcao, v] }); addOpt("grau_correcao", v); }} placeholder="Selecione o grau..." /></Field>}
      {form.responsavel !== "Igor" && <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
        <Field label="Feedback" style={{ flex: 1 }}><select style={{ ...S.select, width: "100%" }} value={form.feedback_tipo} onChange={(e) => upd("feedback_tipo", e.target.value)}>
          <option value="">Nenhum</option><option value="elogio">Elogiar</option><option value="critica">Criticar</option>
        </select></Field>
        {form.feedback_tipo && <Field label="Dado?" style={{ flex: 0 }}><label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12.5, cursor: "pointer", whiteSpace: "nowrap", padding: "7px 0" }}><input type="checkbox" checked={form.feedback_dado} onChange={(e) => upd("feedback_dado", e.target.checked)} /> Feito</label></Field>}
      </div>}
      <Field label="Observações breves"><input style={S.input} value={form.obs_breves} onChange={(e) => upd("obs_breves", e.target.value)} placeholder="Nada, Refiz, Orientei..." /></Field>
      <Field label="Observações detalhadas"><textarea style={{ ...S.input, minHeight: 50, resize: "vertical" }} value={form.obs_detalhadas} onChange={(e) => upd("obs_detalhadas", e.target.value)} /></Field>
      <div style={{ display: "flex", gap: 16, marginBottom: 10 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12.5, cursor: "pointer" }}><input type="checkbox" checked={form.acompanhar} onChange={(e) => upd("acompanhar", e.target.checked)} /> Acompanhar</label>
        <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12.5, cursor: "pointer" }}><input type="checkbox" checked={form.complicado} onChange={(e) => upd("complicado", e.target.checked)} /> Complicado</label>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
        <button style={S.btn("ghost")} onClick={() => { setShowForm(false); setCorrigindo(null); setEditId(null); setForm(empty); }}>Cancelar</button>
        <button style={S.btn("primary")} onClick={saveReg}><Save size={13} /> {editId ? "Salvar" : corrigindo ? "Registrar Correção" : "Registrar"}</button>
      </div>
    </Modal>}
  </div>);
}

/* ─── ADMIN: DASHBOARD ─── */
function Dash({ registros, entregas, estagiarias, backlog }) {
  const [periodo, setPeriodo] = useState("mes");
  const [refDate, setRefDate] = useState(today);
  const range = useMemo(() => {
    const d = new Date(refDate + "T12:00:00"); const y = d.getFullYear(), m = d.getMonth();
    if (periodo === "mes") return { s: `${y}-${String(m+1).padStart(2,"0")}-01`, e: `${y}-${String(m+1).padStart(2,"0")}-31` };
    if (periodo === "bimestre") { const sm = m%2===0?m:m-1; return { s: `${y}-${String(sm+1).padStart(2,"0")}-01`, e: `${y}-${String(sm+2).padStart(2,"0")}-31` }; }
    if (periodo === "semestre") { const sm = m<6?0:6; return { s: `${y}-${String(sm+1).padStart(2,"0")}-01`, e: `${y}-${String(sm+6).padStart(2,"0")}-31` }; }
    return { s: `${y}-01-01`, e: `${y}-12-31` };
  }, [periodo, refDate]);
  const fil = registros.filter((r) => r.data_trabalho >= range.s && r.data_trabalho <= range.e);
  const igorR = fil.filter((r) => r.responsavel === "Igor"); const estR = fil.filter((r) => r.responsavel !== "Igor");
  const byManif = useMemo(() => { const m={}; fil.forEach((r)=>{m[r.tipo_manifestacao]=(m[r.tipo_manifestacao]||0)+1;}); return Object.entries(m).map(([n,v])=>({name:n,value:v})).sort((a,b)=>b.value-a.value); }, [fil]);
  const byCrime = useMemo(() => { const m={}; fil.forEach((r)=>{if(r.crime){m[r.crime]=(m[r.crime]||0)+1;}}); return Object.entries(m).map(([n,v])=>({name:n,value:v})).sort((a,b)=>b.value-a.value).slice(0,10); }, [fil]);
  const byResp = useMemo(() => { const m={}; fil.forEach((r)=>{m[r.responsavel]=(m[r.responsavel]||0)+1;}); return Object.entries(m).map(([n,v])=>({name:n,value:v})).sort((a,b)=>b.value-a.value); }, [fil]);
  const byDay = useMemo(() => { const m={}; fil.forEach((r)=>{m[r.data_trabalho]=(m[r.data_trabalho]||0)+1;}); return Object.entries(m).map(([d,v])=>({data:fmtDate(d),total:v})).sort((a,b)=>a.data.localeCompare(b.data)); }, [fil]);
  const byCorr = useMemo(() => { const m={}; estR.forEach((r)=>{if(r.grau_correcao)m[r.grau_correcao]=(m[r.grau_correcao]||0)+1;}); return Object.entries(m).map(([n,v])=>({name:n,value:v})); }, [estR]);
  const stats = [{ l: "Total Registros", v: fil.length, c: "#2563eb" },{ l: "Trabalho Próprio", v: igorR.length, c: "#10b981" },{ l: "Correções", v: estR.length, c: "#f59e0b" },{ l: "Pendentes", v: entregas.filter((e)=>e.status==="pendente").length, c: "#ef4444" }];
  return (<div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
      <h1 style={S.h1}>Dashboard</h1>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <select style={S.select} value={periodo} onChange={(e) => setPeriodo(e.target.value)}><option value="mes">Mensal</option><option value="bimestre">Bimestral</option><option value="semestre">Semestral</option><option value="ano">Anual</option></select>
        <input type="date" style={{ ...S.input, width: "auto" }} value={refDate} onChange={(e) => setRefDate(e.target.value)} />
      </div>
    </div>
    <div style={{ fontSize: 12, color: "#64748b", marginBottom: 12 }}>Período: {fmtDate(range.s)} a {fmtDate(range.e)}</div>
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>{stats.map((s) => (<div key={s.l} style={S.statCard(s.c)}><div style={{ fontSize: 10.5, color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>{s.l}</div><div style={{ fontSize: 26, fontWeight: 700, marginTop: 2 }}>{s.v}</div></div>))}</div>
    <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 14 }}>
      <div style={{ ...S.card, flex: 1, minWidth: 300 }}><h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Por Responsável</h3><ResponsiveContainer width="100%" height={200}><BarChart data={byResp}><XAxis dataKey="name" fontSize={11}/><YAxis fontSize={11}/><Tooltip/><Bar dataKey="value" radius={[4,4,0,0]}>{byResp.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}</Bar></BarChart></ResponsiveContainer></div>
      <div style={{ ...S.card, flex: 1, minWidth: 260 }}><h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Por Tipo de Manifestação</h3><ResponsiveContainer width="100%" height={200}><PieChart><Pie data={byManif.slice(0,8)} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} fontSize={10} label={({name,value})=>`${name} (${value})`}>{byManif.slice(0,8).map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}</Pie><Tooltip/></PieChart></ResponsiveContainer></div>
    </div>
    <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 14 }}>
      <div style={{ ...S.card, flex: 1, minWidth: 300 }}><h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Crimes Mais Frequentes</h3><ResponsiveContainer width="100%" height={200}><BarChart data={byCrime} layout="vertical"><XAxis type="number" fontSize={11}/><YAxis type="category" dataKey="name" fontSize={10} width={120}/><Tooltip/><Bar dataKey="value" fill="#8b5cf6" radius={[0,4,4,0]}/></BarChart></ResponsiveContainer></div>
      <div style={{ ...S.card, flex: 1, minWidth: 260 }}><h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Grau de Correção</h3><ResponsiveContainer width="100%" height={200}><PieChart><Pie data={byCorr} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} fontSize={10} label={({name,value})=>`${name} (${value})`}>{byCorr.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}</Pie><Tooltip/></PieChart></ResponsiveContainer></div>
    </div>
    <div style={S.card}><h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Volume por Dia</h3><ResponsiveContainer width="100%" height={180}><LineChart data={byDay}><XAxis dataKey="data" fontSize={10}/><YAxis fontSize={11}/><Tooltip/><Line type="monotone" dataKey="total" stroke="#2563eb" strokeWidth={2} dot={{r:3}}/></LineChart></ResponsiveContainer></div>
  </div>);
}

/* ─── INTERN: REGISTRAR ENTREGA ─── */
function InternReg({ entregas, setEntregas, opts, setOpts, crimes, setCrimes, userId, api, token, demo }) {
  const [form, setForm] = useState({ numero_procedimento: "", tipo_procedimento: "", tipo_manifestacao: "", crime: "", data_vista: "", num_folhas: "", urgente: false });
  const [ok, setOk] = useState(false);
  const upd = (k, v) => setForm({ ...form, [k]: v });
  const submit = async () => {
    if (!form.numero_procedimento || !form.tipo_procedimento || !form.tipo_manifestacao) return;
    if (form.crime && !crimes.includes(form.crime)) setCrimes([...crimes, form.crime]);
    const now = new Date();
    const payload = { numero_procedimento: form.numero_procedimento, tipo_procedimento: form.tipo_procedimento, tipo_manifestacao: form.tipo_manifestacao, crime: form.crime || null, data_vista: form.data_vista || null, num_folhas: form.num_folhas ? parseInt(form.num_folhas) : null, urgente: form.urgente, estagiaria_id: userId, data_entrega: today, hora_entrega: now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }), status: "pendente" };
    if (!demo) {
      try { const [result] = await api.post("entregas", payload, token); setEntregas([...entregas, result]); } catch (e) { setEntregas([...entregas, { ...payload, id: Date.now() }]); }
    } else { setEntregas([...entregas, { ...payload, id: Date.now() }]); }
    setForm({ numero_procedimento: "", tipo_procedimento: "", tipo_manifestacao: "", crime: "", data_vista: "", num_folhas: "", urgente: false }); setOk(true); setTimeout(() => setOk(false), 3000);
  };
  return (<div>
    <h1 style={S.h1}>Registrar Entrega</h1>
    <p style={{ color: "#64748b", fontSize: 13, marginBottom: 16 }}>Informe a peça que você elaborou</p>
    {ok && <div style={{ ...S.card, borderLeft: "4px solid #10b981", background: "#f0fdf4", display: "flex", alignItems: "center", gap: 8 }}><Check size={16} color="#10b981"/><span style={{ fontWeight: 600, color: "#065f46", fontSize: 13 }}>Entrega registrada!</span></div>}
    <div style={{ ...S.card, maxWidth: 480 }}>
      <Field label="Número do procedimento *"><input style={S.input} value={form.numero_procedimento} onChange={(e) => upd("numero_procedimento", e.target.value)} placeholder="0000000-00.0000.0.00.0000" /></Field>
      <Field label="Tipo do procedimento *"><DynSelect value={form.tipo_procedimento} onChange={(v) => upd("tipo_procedimento", v)} options={opts.tipo_procedimento} onAdd={(v) => setOpts({ ...opts, tipo_procedimento: [...opts.tipo_procedimento, v] })} /></Field>
      <Field label="Tipo de manifestação *"><DynSelect value={form.tipo_manifestacao} onChange={(v) => upd("tipo_manifestacao", v)} options={opts.tipo_manifestacao} onAdd={(v) => setOpts({ ...opts, tipo_manifestacao: [...opts.tipo_manifestacao, v] })} /></Field>
      <Field label="Crime apurado"><CrimeInput value={form.crime} onChange={(v) => upd("crime", v)} suggestions={crimes} /></Field>
      <div style={{ display: "flex", gap: 10 }}>
        <Field label="Data da vista" style={{ flex: 1 }}><input type="date" style={S.input} value={form.data_vista} onChange={(e) => upd("data_vista", e.target.value)} /></Field>
        <Field label="Nº de folhas" style={{ flex: 1 }}><input type="number" style={S.input} value={form.num_folhas} onChange={(e) => upd("num_folhas", e.target.value)} /></Field>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 10 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12.5, cursor: "pointer", color: "#ef4444", fontWeight: form.urgente ? 700 : 400 }}><input type="checkbox" checked={form.urgente} onChange={(e) => upd("urgente", e.target.checked)} /> Urgente</label>
        <span style={{ fontSize: 12, color: "#94a3b8" }}>Registrado em: <strong>{new Date().toLocaleString("pt-BR")}</strong></span>
      </div>
      <button style={{ ...S.btn("primary"), width: "100%", justifyContent: "center", padding: "9px" }} onClick={submit} disabled={!form.numero_procedimento||!form.tipo_procedimento||!form.tipo_manifestacao}><Send size={13}/> Registrar Entrega</button>
    </div></div>);
}

/* ─── INTERN: HISTÓRICO ─── */
function InternHist({ entregas, userId }) {
  const mine = entregas.filter((e) => e.estagiaria_id === userId).sort((a, b) => (b.data_entrega + b.hora_entrega).localeCompare(a.data_entrega + a.hora_entrega));
  return (<div>
    <h1 style={S.h1}>Meu Histórico</h1>
    <p style={{ color: "#64748b", fontSize: 13, marginBottom: 14 }}>{mine.length} entregas</p>
    <div style={S.card}><table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead><tr><th style={S.th}>Data</th><th style={S.th}>Hora</th><th style={S.th}>Procedimento</th><th style={S.th}>Tipo</th><th style={S.th}>Manifestação</th><th style={S.th}>Status</th></tr></thead>
      <tbody>{mine.map((e) => (<tr key={e.id}><td style={S.td}>{fmtDate(e.data_entrega)}</td><td style={{...S.td,fontFamily:"monospace",fontSize:12}}>{e.hora_entrega}</td><td style={{...S.td,fontFamily:"monospace",fontSize:11}}>{e.numero_procedimento}</td><td style={S.td}><span style={S.badge("#1e40af","#dbeafe")}>{e.tipo_procedimento}</span></td><td style={S.td}><span style={S.badge("#065f46","#d1fae5")}>{e.tipo_manifestacao}</span></td><td style={S.td}>{e.status==="pendente"?<span style={S.badge("#92400e","#fef3c7")}>Pendente</span>:<span style={S.badge("#065f46","#d1fae5")}>Corrigido</span>}</td></tr>))}
      {mine.length===0&&<tr><td colSpan={6} style={{...S.td,textAlign:"center",color:"#94a3b8",padding:24}}>Nenhuma entrega registrada</td></tr>}</tbody>
    </table></div></div>);
}

/* ─── ADMIN: ESTAGIÁRIAS ─── */
const TIPOS_EST = [{ value: "graduacao", label: "Graduação" }, { value: "pos", label: "Pós-Graduação" }, { value: "voluntaria", label: "Voluntária" }];
const getTipoLabel = (v) => TIPOS_EST.find((t) => t.value === v)?.label || v || "—";

function EstagiariaTab({ estagiarias, setEstagiarias, registros, entregas, onViewAs, api, token, demo }) {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const empty = { nome: "", email: "", tipo_estagiaria: "graduacao", carga_horaria_diaria: "4" };
  const [form, setForm] = useState(empty);
  const upd = (k, v) => setForm({ ...form, [k]: v });

  const saveEst = async () => {
    if (!form.nome) return;
    if (editId) {
      const patch = { nome: form.nome, email: form.email, tipo_estagiaria: form.tipo_estagiaria, carga_horaria_diaria: parseFloat(form.carga_horaria_diaria) };
      if (!demo) try { await api.patch("profiles", editId, patch, token); } catch (e) {}
      setEstagiarias(estagiarias.map((e) => e.id === editId ? { ...e, ...patch } : e));
    } else {
      const newE = { id: "e" + Date.now(), nome: form.nome, email: form.email, papel: "estagiaria", tipo_estagiaria: form.tipo_estagiaria, carga_horaria_diaria: parseFloat(form.carga_horaria_diaria), ativo: true };
      setEstagiarias([...estagiarias, newE]);
    }
    setForm(empty); setShowForm(false); setEditId(null);
  };

  const startEdit = (e) => { setEditId(e.id); setForm({ nome: e.nome, email: e.email || "", tipo_estagiaria: e.tipo_estagiaria, carga_horaria_diaria: String(e.carga_horaria_diaria) }); setShowForm(true); };

  const toggleAtivo = async (id) => {
    const est = estagiarias.find((e) => e.id === id);
    if (!demo) try { await api.patch("profiles", id, { ativo: !est.ativo }, token); } catch (e) {}
    setEstagiarias(estagiarias.map((e) => e.id === id ? { ...e, ativo: !e.ativo } : e));
  };

  return (<div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
      <div><h1 style={S.h1}>Estagiárias</h1><p style={{ color: "#64748b", fontSize: 13 }}>{estagiarias.filter((e) => e.ativo).length} ativas de {estagiarias.length}</p></div>
      <button style={S.btn("primary")} onClick={() => { setForm(empty); setEditId(null); setShowForm(true); }}><Plus size={14} /> Nova Estagiária</button>
    </div>
    <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
      {estagiarias.map((e) => {
        const regs = registros.filter((r) => r.responsavel === e.nome);
        const ents = entregas.filter((x) => x.estagiaria_id === e.id);
        const graded = regs.filter((r) => r.grau_correcao);
        const nada = graded.filter((r) => r.grau_correcao === "Nada").length;
        return (<div key={e.id} style={{ ...S.card, flex: "1 1 280px", maxWidth: 360, opacity: e.ativo ? 1 : 0.5 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 10 }}>
            <div><div style={{ fontSize: 15, fontWeight: 700 }}>{e.nome}</div><div style={{ fontSize: 12, color: "#64748b" }}>{e.email || "—"}</div></div>
            <span style={e.ativo ? S.badge("#065f46", "#d1fae5") : S.badge("#991b1b", "#fee2e2")}>{e.ativo ? "Ativa" : "Inativa"}</span>
          </div>
          <div style={{ display: "flex", gap: 16, fontSize: 12, color: "#475569", marginBottom: 10 }}>
            <span><strong>Tipo:</strong> {getTipoLabel(e.tipo_estagiaria)}</span>
            <span><strong>Horas/dia:</strong> {e.carga_horaria_diaria}h</span>
          </div>
          <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
            <div style={{ flex: 1, background: "#f8fafc", borderRadius: 8, padding: "8px 10px", textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#2563eb" }}>{regs.length}</div>
              <div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase" }}>Correções</div>
            </div>
            <div style={{ flex: 1, background: "#f8fafc", borderRadius: 8, padding: "8px 10px", textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#10b981" }}>{graded.length > 0 ? Math.round(nada / graded.length * 100) + "%" : "—"}</div>
              <div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase" }}>Sem correção</div>
            </div>
            <div style={{ flex: 1, background: "#f8fafc", borderRadius: 8, padding: "8px 10px", textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#f59e0b" }}>{ents.filter((x) => x.status === "pendente").length}</div>
              <div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase" }}>Pendentes</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
            <button style={{ ...S.btn("ghost"), fontSize: 11, padding: "5px 8px" }} onClick={() => onViewAs(e.id)}><Eye size={12} /> Visualizar como</button>
            <button style={{ ...S.btn("ghost"), fontSize: 11, padding: "5px 8px" }} onClick={() => startEdit(e)}><Edit3 size={12} /> Editar</button>
            <button style={{ ...S.btn(e.ativo ? "danger" : "success"), fontSize: 11, padding: "5px 8px" }} onClick={() => toggleAtivo(e.id)}>{e.ativo ? "Desativar" : "Reativar"}</button>
          </div>
        </div>);
      })}
    </div>
    {showForm && <Modal title={editId ? "Editar Estagiária" : "Nova Estagiária"} onClose={() => { setShowForm(false); setEditId(null); setForm(empty); }}>
      <Field label="Nome *"><input style={S.input} value={form.nome} onChange={(e) => upd("nome", e.target.value)} /></Field>
      <Field label="E-mail"><input style={S.input} type="email" value={form.email} onChange={(e) => upd("email", e.target.value)} /></Field>
      <div style={{ display: "flex", gap: 10 }}>
        <Field label="Tipo" style={{ flex: 1 }}><select style={{ ...S.select, width: "100%" }} value={form.tipo_estagiaria} onChange={(e) => upd("tipo_estagiaria", e.target.value)}>
          {TIPOS_EST.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select></Field>
        <Field label="Carga horária/dia" style={{ flex: 1 }}><input style={S.input} type="number" step="0.5" min="1" max="8" value={form.carga_horaria_diaria} onChange={(e) => upd("carga_horaria_diaria", e.target.value)} /></Field>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 4 }}>
        <button style={S.btn("ghost")} onClick={() => { setShowForm(false); setEditId(null); setForm(empty); }}>Cancelar</button>
        <button style={S.btn("primary")} onClick={saveEst}><Save size={13} /> {editId ? "Salvar" : "Cadastrar"}</button>
      </div>
    </Modal>}
  </div>);
}

/* ─── MAIN APP ─── */
const ENV_URL = import.meta.env.VITE_SUPABASE_URL || "";
const ENV_KEY = import.meta.env.VITE_SUPABASE_KEY || "";
const ENV_API = ENV_URL && ENV_KEY ? createApi(ENV_URL, ENV_KEY) : null;

export default function App() {
  const [screen, setScreen] = useState(ENV_API ? "auth" : "config");
  const [api, setApi] = useState(ENV_API);
  const [token, setToken] = useState("");
  const [profile, setProfile] = useState(null);
  const [demo, setDemo] = useState(false);
  const [activeTab, setActiveTab] = useState("");
  const [selectedDate, setSelectedDate] = useState(today);
  const [viewAs, setViewAs] = useState(null);
  const [loading, setLoading] = useState(false);

  const [registros, setRegistros] = useState([]);
  const [entregas, setEntregas] = useState([]);
  const [estagiarias, setEstagiarias] = useState([]);
  const [backlog, setBacklog] = useState([]);
  const [opts, setOpts] = useState(INIT_OPTS);
  const [crimes, setCrimes] = useState([]);

  const loadData = async (apiRef, tok, papel) => {
    setLoading(true);
    try {
      const [regs, ents, profs, optsData, bl] = await Promise.all([
        papel === "admin" ? apiRef.get("registros", tok, "order=data_trabalho.desc") : Promise.resolve([]),
        apiRef.get("entregas", tok, "order=data_entrega.desc"),
        papel === "admin" ? apiRef.get("profiles", tok, "papel=eq.estagiaria&order=nome.asc") : Promise.resolve([]),
        apiRef.get("opcoes", tok, "order=campo.asc,valor.asc"),
        // Busca ambos os momentos; ordena por data e momento para consistência
        papel === "admin" ? apiRef.get("backlog", tok, "order=data.desc,momento.asc") : Promise.resolve([]),
      ]);
      setRegistros(Array.isArray(regs) ? regs : []);
      setEntregas(Array.isArray(ents) ? ents : []);
      setEstagiarias(Array.isArray(profs) ? profs : []);
      setBacklog(Array.isArray(bl) ? bl : []);
      const optsMap = { tipo_procedimento: [...INIT_OPTS.tipo_procedimento], tipo_manifestacao: [...INIT_OPTS.tipo_manifestacao], grau_correcao: [...INIT_OPTS.grau_correcao] };
      (Array.isArray(optsData) ? optsData : []).forEach((o) => {
        if (optsMap[o.campo] && !optsMap[o.campo].includes(o.valor)) optsMap[o.campo].push(o.valor);
      });
      setOpts(optsMap);
      const crimeSet = new Set();
      (Array.isArray(regs) ? regs : []).forEach((r) => { if (r.crime) crimeSet.add(r.crime); });
      (Array.isArray(ents) ? ents : []).forEach((e) => { if (e.crime) crimeSet.add(e.crime); });
      setCrimes([...crimeSet]);
    } catch (e) { console.error("Erro ao carregar dados:", e); }
    setLoading(false);
  };

  const startDemo = () => { setDemo(true); setProfile(MOCK.profile); setRegistros(MOCK.registros); setEntregas(MOCK.entregas); setEstagiarias(MOCK.estagiarias); setBacklog(MOCK.backlog); setCrimes(MOCK.crimes); setActiveTab("dia"); setScreen("app"); };
  const connect = (url, key) => { const a = createApi(url, key); setApi(a); setScreen("auth"); };

  const onAuth = async (tok, usr, prof) => {
    setToken(tok); setProfile(prof);
    setActiveTab(prof.papel === "admin" ? "dia" : "registrar");
    setScreen("app");
    await loadData(api, tok, prof.papel);
  };
  const logout = () => { setScreen(demo ? "config" : "auth"); setDemo(false); setProfile(null); setToken(""); setRegistros([]); setEntregas([]); setBacklog([]); setViewAs(null); };
  const pendCount = entregas.filter((e) => e.status === "pendente").length;
  const handleViewAs = (id) => { setViewAs(id); setActiveTab("registrar"); };
  const exitViewAs = () => { setViewAs(null); setActiveTab("est"); };
  const currentPapel = viewAs ? "estagiaria" : profile?.papel;
  const currentNome = viewAs ? getEstName(viewAs, estagiarias) : profile?.nome;

  if (screen === "config") return <ConfigScreen onConnect={connect} onDemo={startDemo} />;
  if (screen === "auth") return <AuthScreen api={api} onAuth={onAuth} />;
  if (loading) return (<div style={{ ...S.page, alignItems: "center", justifyContent: "center" }}><link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" /><div style={{ fontSize: 16, color: "#64748b" }}>Carregando dados...</div></div>);
  return (<div style={S.page}>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
    <Sidebar papel={currentPapel} active={activeTab} setActive={setActiveTab} nome={currentNome} pendCount={pendCount} onLogout={viewAs ? exitViewAs : logout} />
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      {demo && !viewAs && <div style={S.demoBanner}>Modo demonstração — dados fictícios</div>}
      {viewAs && <div style={{ ...S.demoBanner, background: "#dbeafe", color: "#1e40af" }}>Visualizando como: {getEstName(viewAs, estagiarias)} — <span style={{ textDecoration: "underline", cursor: "pointer" }} onClick={exitViewAs}>voltar ao admin</span></div>}
      <div style={S.main}>
        {currentPapel==="admin"&&activeTab==="dia"&&<DiaTrabalho registros={registros} setRegistros={setRegistros} entregas={entregas} setEntregas={setEntregas} backlog={backlog} setBacklog={setBacklog} opts={opts} setOpts={setOpts} crimes={crimes} setCrimes={setCrimes} estagiarias={estagiarias} selectedDate={selectedDate} setSelectedDate={setSelectedDate} api={api} token={token} demo={demo}/>}
        {currentPapel==="admin"&&activeTab==="dash"&&<Dash registros={registros} entregas={entregas} estagiarias={estagiarias} backlog={backlog}/>}
        {currentPapel==="admin"&&activeTab==="est"&&<EstagiariaTab estagiarias={estagiarias} setEstagiarias={setEstagiarias} registros={registros} entregas={entregas} onViewAs={handleViewAs} api={api} token={token} demo={demo}/>}
        {currentPapel==="estagiaria"&&activeTab==="registrar"&&<InternReg entregas={entregas} setEntregas={setEntregas} opts={opts} setOpts={setOpts} crimes={crimes} setCrimes={setCrimes} userId={viewAs || profile.id} api={api} token={token} demo={demo}/>}
        {currentPapel==="estagiaria"&&activeTab==="historico"&&<InternHist entregas={entregas} userId={viewAs || profile.id}/>}
      </div>
    </div>
  </div>);
}
