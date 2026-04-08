import React, { useState, useEffect, useMemo, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { LogOut, Plus, Check, Users, FileText, Send, History, X, Search, Bell, Save, Trash2, ChevronLeft, ChevronRight, LayoutDashboard, ClipboardList, Edit3, AlertTriangle, Eye } from "lucide-react";

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
  backlog: [{ data: today, pecas_corrigir: 4, pecas_minhas: 2, pecas_estagiarias: 4 }],
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
    refresh: async (refreshToken) => (await fetch(`${url}/auth/v1/token?grant_type=refresh_token`, { method: "POST", headers: { apikey: key, "Content-Type": "application/json" }, body: JSON.stringify({ refresh_token: refreshToken }) })).json(),
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
function CrimeInput({ value, onChange, suggestions, onAdd }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const ref = useRef(null);

  // sync external value changes
  useEffect(() => { setQuery(value); }, [value]);

  // close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = query.trim()
    ? suggestions.filter((s) => s.toLowerCase().includes(query.toLowerCase()))
    : suggestions;
  const isNew = query.trim() && !suggestions.map(s=>s.toLowerCase()).includes(query.trim().toLowerCase());

  const select = (s) => { onChange(s); setQuery(s); setOpen(false); };
  const handleAdd = () => { if (query.trim() && onAdd) { onAdd(query.trim()); onChange(query.trim()); setOpen(false); } };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <div style={{ display: "flex", alignItems: "center", border: "1px solid #e2e8f0", borderRadius: 6, background: "#fff", overflow: "hidden", boxShadow: open ? "0 0 0 2px #bfdbfe" : "none" }}>
        <input
          style={{ ...S.input, border: "none", boxShadow: "none", flex: 1 }}
          value={query}
          placeholder="Buscar ou adicionar crime..."
          onChange={(e) => { setQuery(e.target.value); onChange(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
        />
        {query && <span style={{ paddingRight: 8, color: "#94a3b8", cursor: "pointer", fontSize: 14 }} onClick={() => { setQuery(""); onChange(""); setOpen(false); }}>×</span>}
      </div>
      {open && (filtered.length > 0 || isNew) && (
        <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 200, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", marginTop: 4, maxHeight: 220, overflowY: "auto" }}>
          {filtered.map((s) => (
            <div key={s} onMouseDown={() => select(s)} style={{ padding: "8px 12px", fontSize: 13, cursor: "pointer", borderBottom: "1px solid #f8fafc", background: s === value ? "#eff6ff" : "#fff", color: s === value ? "#1d4ed8" : "#1e293b", fontWeight: s === value ? 600 : 400 }}
              onMouseEnter={(e) => { if (s !== value) e.currentTarget.style.background = "#f8fafc"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = s === value ? "#eff6ff" : "#fff"; }}>
              {s}
            </div>
          ))}
          {isNew && (
            <div onMouseDown={handleAdd} style={{ padding: "8px 12px", fontSize: 13, cursor: "pointer", color: "#2563eb", fontWeight: 600, display: "flex", alignItems: "center", gap: 6, borderTop: filtered.length > 0 ? "1px solid #e2e8f0" : "none", background: "#f0f9ff" }}>
              <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Adicionar "{query.trim()}" ao sistema
            </div>
          )}
        </div>
      )}
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
        onAuth(r.access_token, { ...r.user, refresh_token: r.refresh_token }, prof);
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
  const [obsPopup, setObsPopup] = useState(null); // { breves, detalhadas }
  const empty = { numero_procedimento: "", tipo_procedimento: "", data_vista: "", num_folhas: "", crime: "", tipo_manifestacao: "", responsavel: "Igor", grau_correcao: "", obs_breves: "", obs_detalhadas: "", acompanhar: false, complicado: false, feedback_tipo: "", feedback_dado: false };
  const [form, setForm] = useState(empty);
  const upd = (k, v) => setForm({ ...form, [k]: v });
  const dayRegs = registros.filter((r) => r.data_trabalho === selectedDate);
  const pendentes = entregas.filter((e) => e.status === "pendente" || e.status === "refazer" || e.status === "refeito").sort((a, b) => (b.urgente ? 1 : 0) - (a.urgente ? 1 : 0));
  const dayBL = backlog.find((b) => b.data === selectedDate) || { pecas_corrigir: 0, pecas_minhas: 0, pecas_estagiarias: 0 };

  const updateBL = async (fld, val) => {
    const v = parseInt(val) || 0;
    const ex = backlog.find((b) => b.data === selectedDate);
    if (ex) {
      const updated = { ...ex, [fld]: v };
      setBacklog(backlog.map((b) => b.data === selectedDate ? updated : b));
      if (!demo) try { await api.patch("backlog", ex.id, { [fld]: v }, token); } catch (e) {}
    } else {
      const newBL = { data: selectedDate, pecas_corrigir: 0, pecas_minhas: 0, pecas_estagiarias: 0, [fld]: v };
      if (!demo) {
        try { const [r] = await api.post("backlog", newBL, token); setBacklog([...backlog, r]); } catch (e) { setBacklog([...backlog, { ...newBL, id: Date.now() }]); }
      } else { setBacklog([...backlog, { ...newBL, id: Date.now() }]); }
    }
  };

  const addOpt = async (campo, valor) => {
    if (!demo) try { await api.post("opcoes", { campo, valor }, token); } catch (e) {}
  };

  const saveReg = async (refazer = false) => {
    if (!form.numero_procedimento || !form.tipo_procedimento || !form.tipo_manifestacao) return;
    if (form.crime && !crimes.includes(form.crime)) {
      setCrimes([...crimes, form.crime]);
      if (!demo) try { await api.post("opcoes", { campo: "crime", valor: form.crime }, token); } catch (e) {}
    }
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
            const novoStatus = refazer ? "refazer" : "corrigido";
            await api.patch("entregas", corrigindo.id, { status: novoStatus }, token);
            setEntregas(entregas.map((e) => e.id === corrigindo.id ? { ...e, status: novoStatus } : e));
          }
        } catch (e) { alert("Falha ao salvar no banco. Verifique sua conexão e tente novamente."); return; }
      } else {
        setRegistros([...registros, { ...payload, id: Date.now() }]);
        if (corrigindo) { const novoStatus = refazer ? "refazer" : "corrigido"; setEntregas(entregas.map((e) => e.id === corrigindo.id ? { ...e, status: novoStatus } : e)); }
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
    <div style={{ ...S.card, display: "flex", gap: 14, alignItems: "center", padding: "12px 16px" }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: "#64748b", whiteSpace: "nowrap" }}>Backlog:</span>
      <Field label="Corrigir" style={{ marginBottom: 0, flex: 1 }}><input type="number" min="0" style={{ ...S.input, textAlign: "center" }} value={dayBL.pecas_corrigir} onChange={(e) => updateBL("pecas_corrigir", e.target.value)} /></Field>
      <Field label="Minhas" style={{ marginBottom: 0, flex: 1 }}><input type="number" min="0" style={{ ...S.input, textAlign: "center" }} value={dayBL.pecas_minhas} onChange={(e) => updateBL("pecas_minhas", e.target.value)} /></Field>
      <Field label="Estagiárias" style={{ marginBottom: 0, flex: 1 }}><input type="number" min="0" style={{ ...S.input, textAlign: "center" }} value={dayBL.pecas_estagiarias} onChange={(e) => updateBL("pecas_estagiarias", e.target.value)} /></Field>
    </div>
    {pendentes.length > 0 && <div style={{ ...S.card, borderLeft: "4px solid #f59e0b" }}>
      <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}><Bell size={14} color="#f59e0b" /> Pendentes de Correção ({pendentes.length})</h3>
      {pendentes.map((e) => (<div key={e.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: "1px solid #f8fafc" }}>
        <div style={{ fontSize: 12.5 }}><span style={{ fontWeight: 600 }}>{getEstName(e.estagiaria_id, estagiarias)}</span><span style={{ color: "#64748b" }}> — {e.tipo_manifestacao} — </span><span style={{ fontFamily: "monospace", fontSize: 11.5 }}>{e.numero_procedimento}</span><span style={{ color: "#94a3b8", marginLeft: 6, fontSize: 11 }}>{fmtDate(e.data_entrega)} {e.hora_entrega}</span>{e.urgente && <span style={{ ...S.badge("#991b1b", "#fee2e2"), marginLeft: 6 }}>URGENTE</span>}{e.status === "refazer" && <span style={{ ...S.badge("#fff", "#7c3aed"), marginLeft: 6 }}>↩ REFAZER</span>}{e.status === "refeito" && <><span style={{ ...S.badge("#fff", "#7c3aed"), marginLeft: 6 }}>↩ REFAZER</span><span style={{ ...S.badge("#fff", "#059669"), marginLeft: 4 }}>✓ REFEITO</span></>}</div>
        <button style={S.btn("warn")} onClick={() => startCorr(e)}><Edit3 size={12} /> Corrigir</button>
      </div>))}
    </div>}
    <div style={S.card}>
      <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Registros — {fmtDate(selectedDate)} ({dayRegs.length})</h3>
      {dayRegs.length === 0 ? <div style={{ color: "#94a3b8", fontSize: 13, textAlign: "center", padding: 20 }}>Nenhum registro neste dia</div>
        : <div style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
          <thead><tr><th style={S.th}>Número</th><th style={S.th}>Tipo</th><th style={S.th}>Vista</th><th style={S.th}>Crime</th><th style={S.th}>Manifestação</th><th style={S.th}>Resp.</th><th style={S.th}>Correção</th><th style={S.th}>Observações</th><th style={S.th}>Flags</th><th style={S.th}></th></tr></thead>
          <tbody>{dayRegs.map((r) => (<tr key={r.id} style={{ background: r.responsavel !== "Igor" ? "#f0f9ff" : "transparent" }}>
            <td style={{ ...S.td, fontFamily: "monospace", fontSize: 11 }}>{r.numero_procedimento}</td>
            <td style={S.td}><span style={S.badge("#1e40af", "#dbeafe")}>{r.tipo_procedimento}</span></td>
            <td style={{ ...S.td, fontSize: 12 }}>{fmtDate(r.data_vista)}</td>
            <td style={{ ...S.td, fontSize: 12, maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.crime || "—"}</td>
            <td style={S.td}><span style={S.badge("#065f46", "#d1fae5")}>{r.tipo_manifestacao}</span></td>
            <td style={{ ...S.td, fontWeight: r.responsavel === "Igor" ? 400 : 600, color: r.responsavel === "Igor" ? "#64748b" : "#1e293b" }}>{r.responsavel}</td>
            <td style={S.td}>{r.grau_correcao ? <span style={S.badge(r.grau_correcao === "Nada" ? "#065f46" : r.grau_correcao.includes("refazer") ? "#991b1b" : "#92400e", r.grau_correcao === "Nada" ? "#d1fae5" : r.grau_correcao.includes("refazer") ? "#fee2e2" : "#fef3c7")}>{r.grau_correcao}</span> : "—"}</td>
            <td style={{ ...S.td, maxWidth: 160 }}>
              {(r.obs_breves || r.obs_detalhadas) ? (
                <div style={{ display: "flex", alignItems: "center", gap: 5, cursor: "pointer" }} onClick={() => setObsPopup({ breves: r.obs_breves, detalhadas: r.obs_detalhadas })}>
                  <span style={{ fontSize: 11.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 120, display: "inline-block" }}>{r.obs_breves || r.obs_detalhadas}</span>
                  <span style={{ color: "#2563eb", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>▾</span>
                </div>
              ) : "—"}
            </td>
            <td style={S.td}>{r.acompanhar && <span style={{ ...S.badge("#1e40af", "#dbeafe"), marginRight: 3 }}>AC</span>}{r.complicado && <span style={{ ...S.badge("#991b1b", "#fee2e2"), marginRight: 3 }}>!</span>}{r.feedback_tipo && <span style={S.badge(r.feedback_dado ? "#065f46" : "#92400e", r.feedback_dado ? "#d1fae5" : "#fef3c7")}>{r.feedback_tipo === "elogio" ? "👍" : "👎"}{r.feedback_dado ? " ✓" : ""}</span>}</td>
            <td style={S.td}><div style={{ display: "flex", gap: 4 }}><Edit3 size={13} style={{ cursor: "pointer", color: "#94a3b8" }} onClick={() => startEdit(r)} /><Trash2 size={13} style={{ cursor: "pointer", color: "#94a3b8" }} onClick={() => delReg(r.id)} /></div></td>
          </tr>))}</tbody></table></div>}
    </div>
    {obsPopup && <Modal title="Observações" onClose={() => setObsPopup(null)}>
      {obsPopup.breves && <div style={{ marginBottom: obsPopup.detalhadas ? 12 : 0 }}>
        <div style={{ fontSize: 10.5, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 4 }}>Resumo</div>
        <div style={{ fontSize: 13, color: "#1e293b", background: "#f8fafc", borderRadius: 6, padding: "8px 12px" }}>{obsPopup.breves}</div>
      </div>}
      {obsPopup.detalhadas && <div>
        <div style={{ fontSize: 10.5, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 4 }}>Detalhadas</div>
        <div style={{ fontSize: 13, color: "#1e293b", background: "#f8fafc", borderRadius: 6, padding: "8px 12px", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{obsPopup.detalhadas}</div>
      </div>}
    </Modal>}
    {showForm && <Modal title={corrigindo ? "Corrigir Entrega" : editId ? "Editar Registro" : "Novo Registro"} onClose={() => { setShowForm(false); setCorrigindo(null); setEditId(null); setForm(empty); }}>
      <Field label="Número do procedimento *"><input style={S.input} value={form.numero_procedimento} onChange={(e) => upd("numero_procedimento", e.target.value)} placeholder="0000000-00.0000.0.00.0000" /></Field>
      <div style={{ display: "flex", gap: 10 }}>
        <Field label="Tipo procedimento *" style={{ flex: 1 }}><DynSelect value={form.tipo_procedimento} onChange={(v) => upd("tipo_procedimento", v)} options={opts.tipo_procedimento} onAdd={(v) => { setOpts({ ...opts, tipo_procedimento: [...opts.tipo_procedimento, v] }); addOpt("tipo_procedimento", v); }} /></Field>
        <Field label="Data da vista" style={{ flex: 1 }}><input type="date" style={S.input} value={form.data_vista} onChange={(e) => upd("data_vista", e.target.value)} /></Field>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <Field label="Crime" style={{ flex: 2 }}><CrimeInput value={form.crime} onChange={(v) => upd("crime", v)} suggestions={crimes} onAdd={(v) => { if (!crimes.includes(v)) setCrimes([...crimes, v]); addOpt("crime", v); }} /></Field>
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
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, flexWrap: "wrap" }}>
        <button style={S.btn("ghost")} onClick={() => { setShowForm(false); setCorrigindo(null); setEditId(null); setForm(empty); }}>Cancelar</button>
        {corrigindo && <button style={{ ...S.btn("danger"), gap: 6 }} onClick={() => { if (!form.obs_detalhadas?.trim()) { alert("Preencha as Observações detalhadas explicando o que deve ser refeito."); return; } saveReg(true); }} title="Devolve a tarefa para a estagiária refazer">↩ Pedir para Refazer</button>}
        <button style={S.btn("primary")} onClick={() => saveReg(false)}><Save size={13} /> {editId ? "Salvar" : corrigindo ? "Registrar Correção" : "Registrar"}</button>
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
function InternReg({ entregas, setEntregas, opts, setOpts, crimes, setCrimes, userId, api, token, demo, callWithRefresh }) {
  const [form, setForm] = useState({ numero_procedimento: "", tipo_procedimento: "", tipo_manifestacao: "", crime: "", data_vista: "", num_folhas: "", urgente: false });
  const [ok, setOk] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState("");
  const upd = (k, v) => setForm({ ...form, [k]: v });
  const submit = async () => {
    if (!form.numero_procedimento || !form.tipo_procedimento || !form.tipo_manifestacao) return;
    setSaving(true); setSaveErr("");
    if (form.crime && !crimes.includes(form.crime)) {
      setCrimes([...crimes, form.crime]);
      if (!demo) try { await api.post("opcoes", { campo: "crime", valor: form.crime }, token); } catch (e) {}
    }
    const now = new Date();
    const payload = { numero_procedimento: form.numero_procedimento, tipo_procedimento: form.tipo_procedimento, tipo_manifestacao: form.tipo_manifestacao, crime: form.crime || null, data_vista: form.data_vista || null, num_folhas: form.num_folhas ? parseInt(form.num_folhas) : null, urgente: form.urgente, estagiaria_id: userId, data_entrega: today, hora_entrega: now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }), status: "pendente" };
    if (!demo) {
      try {
        const doPost = (tok) => api.post("entregas", payload, tok);
        const result = callWithRefresh ? await callWithRefresh(doPost) : await doPost(token);
        const saved = Array.isArray(result) ? result[0] : result;
        if (!saved || saved.error || saved.message) throw new Error(saved?.message || "Erro ao salvar");
        setEntregas([...entregas, saved]);
        setForm({ numero_procedimento: "", tipo_procedimento: "", tipo_manifestacao: "", crime: "", data_vista: "", num_folhas: "", urgente: false });
        setOk(true); setTimeout(() => setOk(false), 4000);
      } catch (e) {
        setSaveErr("Falha ao salvar no banco de dados. Verifique sua conexão e tente novamente.");
      }
    } else {
      setEntregas([...entregas, { ...payload, id: Date.now() }]);
      setForm({ numero_procedimento: "", tipo_procedimento: "", tipo_manifestacao: "", crime: "", data_vista: "", num_folhas: "", urgente: false });
      setOk(true); setTimeout(() => setOk(false), 4000);
    }
    setSaving(false);
  };
  return (<div>
    <h1 style={S.h1}>Registrar Entrega</h1>
    <p style={{ color: "#64748b", fontSize: 13, marginBottom: 16 }}>Informe a peça que você elaborou</p>
    {ok && <div style={{ ...S.card, borderLeft: "4px solid #10b981", background: "#f0fdf4", display: "flex", alignItems: "center", gap: 8 }}><Check size={16} color="#10b981"/><span style={{ fontWeight: 600, color: "#065f46", fontSize: 13 }}>Entrega registrada com sucesso!</span></div>}
    {saveErr && <div style={{ ...S.card, borderLeft: "4px solid #ef4444", background: "#fef2f2", display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontWeight: 600, color: "#991b1b", fontSize: 13 }}>⚠️ {saveErr}</span></div>}
    <div style={{ ...S.card, maxWidth: 480 }}>
      <Field label="Número do procedimento *"><input style={S.input} value={form.numero_procedimento} onChange={(e) => upd("numero_procedimento", e.target.value)} placeholder="0000000-00.0000.0.00.0000" /></Field>
      <Field label="Tipo do procedimento *"><DynSelect value={form.tipo_procedimento} onChange={(v) => upd("tipo_procedimento", v)} options={opts.tipo_procedimento} onAdd={(v) => setOpts({ ...opts, tipo_procedimento: [...opts.tipo_procedimento, v] })} /></Field>
      <Field label="Tipo de manifestação *"><DynSelect value={form.tipo_manifestacao} onChange={(v) => upd("tipo_manifestacao", v)} options={opts.tipo_manifestacao} onAdd={(v) => setOpts({ ...opts, tipo_manifestacao: [...opts.tipo_manifestacao, v] })} /></Field>
      <Field label="Crime apurado"><CrimeInput value={form.crime} onChange={(v) => upd("crime", v)} suggestions={crimes} onAdd={(v) => { if (!crimes.includes(v)) { setCrimes([...crimes, v]); if (!demo) try { api.post("opcoes", { campo: "crime", valor: v }, token); } catch(e) {} } }} /></Field>
      <div style={{ display: "flex", gap: 10 }}>
        <Field label="Data da vista" style={{ flex: 1 }}><input type="date" style={S.input} value={form.data_vista} onChange={(e) => upd("data_vista", e.target.value)} /></Field>
        <Field label="Nº de folhas" style={{ flex: 1 }}><input type="number" style={S.input} value={form.num_folhas} onChange={(e) => upd("num_folhas", e.target.value)} /></Field>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 10 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12.5, cursor: "pointer", color: "#ef4444", fontWeight: form.urgente ? 700 : 400 }}><input type="checkbox" checked={form.urgente} onChange={(e) => upd("urgente", e.target.checked)} /> Urgente</label>
        <span style={{ fontSize: 12, color: "#94a3b8" }}>Registrado em: <strong>{new Date().toLocaleString("pt-BR")}</strong></span>
      </div>
      <button style={{ ...S.btn("primary"), width: "100%", justifyContent: "center", padding: "9px", opacity: saving ? 0.7 : 1 }} onClick={submit} disabled={saving||!form.numero_procedimento||!form.tipo_procedimento||!form.tipo_manifestacao}><Send size={13}/> {saving ? "Salvando..." : "Registrar Entrega"}</button>
    </div></div>);
}

/* ─── INTERN: HISTÓRICO ─── */
function InternHist({ entregas, setEntregas, registros, userId, api, token, demo }) {
  const [obsPopup, setObsPopup] = useState(null);
  const mine = entregas.filter((e) => e.estagiaria_id === userId).sort((a, b) => (b.data_entrega + b.hora_entrega).localeCompare(a.data_entrega + a.hora_entrega));
  const regByEntrega = useMemo(() => {
    const m = {};
    (registros || []).forEach((r) => { if (r.entrega_id) m[r.entrega_id] = r; });
    return m;
  }, [registros]);
  return (<div>
    <h1 style={S.h1}>Meu Histórico</h1>
    <p style={{ color: "#64748b", fontSize: 13, marginBottom: 14 }}>{mine.length} entregas</p>
    <div style={{ ...S.card, overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse", minWidth: 750 }}>
      <thead><tr><th style={S.th}>Data</th><th style={S.th}>Hora</th><th style={S.th}>Procedimento</th><th style={S.th}>Tipo</th><th style={S.th}>Manifestação</th><th style={S.th}>Status</th><th style={S.th}>Observações do promotor</th></tr></thead>
      <tbody>{mine.map((e) => {
        const reg = regByEntrega[e.id];
        const obsdet = reg?.obs_detalhadas || null;
        return (<tr key={e.id}>
          <td style={S.td}>{fmtDate(e.data_entrega)}</td>
          <td style={{...S.td,fontFamily:"monospace",fontSize:12}}>{e.hora_entrega}</td>
          <td style={{...S.td,fontFamily:"monospace",fontSize:11}}>{e.numero_procedimento}</td>
          <td style={S.td}><span style={S.badge("#1e40af","#dbeafe")}>{e.tipo_procedimento}</span></td>
          <td style={S.td}><span style={S.badge("#065f46","#d1fae5")}>{e.tipo_manifestacao}</span></td>
          <td style={S.td}>
            {e.status==="pendente" && <span style={S.badge("#92400e","#fef3c7")}>Pendente</span>}
            {e.status==="corrigido" && <span style={S.badge("#065f46","#d1fae5")}>Corrigido ✓</span>}
            {e.status==="refeito" && <span style={S.badge("#065f46","#d1fae5")}>Refeito ✓</span>}
            {e.status==="refazer" && <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              <span style={{ ...S.badge("#fff","#7c3aed") }}>↩ Refazer</span>
              <button style={{ fontSize: 11, padding: "3px 8px", borderRadius: 99, border: "1.5px solid #059669", background: "transparent", color: "#059669", fontWeight: 600, cursor: "pointer", fontFamily: font }} onClick={async () => {
                if (!demo) try { await api.patch("entregas", e.id, { status: "refeito" }, token); } catch(err) { alert("Erro ao atualizar. Tente novamente."); return; }
                setEntregas(entregas.map((x) => x.id === e.id ? { ...x, status: "refeito" } : x));
              }}>✓ Refeito</button>
            </div>}
          </td>
          <td style={{ ...S.td, maxWidth: 210 }}>
            {obsdet ? (
              <div style={{ display: "flex", alignItems: "center", gap: 5, cursor: "pointer" }} onClick={() => setObsPopup(obsdet)}>
                <span style={{ fontSize: 11.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 170, display: "inline-block" }}>{obsdet}</span>
                <span style={{ color: "#2563eb", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>▾</span>
              </div>
            ) : "—"}
          </td>
        </tr>);
      })}
      {mine.length===0&&<tr><td colSpan={7} style={{...S.td,textAlign:"center",color:"#94a3b8",padding:24}}>Nenhuma entrega registrada</td></tr>}</tbody>
    </table></div>
    {obsPopup && <Modal title="Observação do promotor" onClose={() => setObsPopup(null)}>
      <div style={{ fontSize: 13, color: "#1e293b", background: "#f8fafc", borderRadius: 6, padding: "12px 14px", whiteSpace: "pre-wrap", lineHeight: 1.7 }}>{obsPopup}</div>
    </Modal>}
  </div>);
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

const SESSION_KEY = "gestao_promotoria_session";

export default function App() {
  const [screen, setScreen] = useState("loading");
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

  // Helper: try call, if JWT expired refresh token and retry once
  const callWithRefresh = async (fn) => {
    try {
      const result = await fn(token);
      if (result && (result.message === "JWT expired" || result.error === "invalid_jwt")) {
        throw new Error("JWT expired");
      }
      return result;
    } catch (e) {
      if (e.message === "JWT expired" || String(e).includes("JWT")) {
        try {
          const saved = localStorage.getItem(SESSION_KEY);
          const { refreshTok, url, key } = saved ? JSON.parse(saved) : {};
          if (!refreshTok) throw new Error("no refresh token");
          const refreshApi = (url && key) ? createApi(url, key) : ENV_API;
          const r = await refreshApi.refresh(refreshTok);
          if (!r.access_token) throw new Error("refresh failed");
          const newTok = r.access_token;
          setToken(newTok);
          try { const s = JSON.parse(localStorage.getItem(SESSION_KEY)); s.tok = newTok; s.refreshTok = r.refresh_token || refreshTok; localStorage.setItem(SESSION_KEY, JSON.stringify(s)); } catch (_) {}
          return await fn(newTok);
        } catch (_) {
          // Refresh failed — force logout
          try { localStorage.removeItem(SESSION_KEY); } catch (_) {}
          setScreen("auth"); setProfile(null); setToken("");
          alert("Sua sessão expirou. Por favor, faça login novamente.");
          throw e;
        }
      }
      throw e;
    }
  };

  const loadData = async (apiRef, tok, papel) => {
    setLoading(true);
    try {
      const [regs, ents, profs, optsData, bl] = await Promise.all([
        papel === "admin"
          ? apiRef.get("registros", tok, "order=data_trabalho.desc")
          : apiRef.get("registros", tok, "entrega_id=not.is.null&select=id,entrega_id,obs_breves,obs_detalhadas,crime"),
        apiRef.get("entregas", tok, "order=data_entrega.desc"),
        papel === "admin" ? apiRef.get("profiles", tok, "papel=eq.estagiaria&order=nome.asc") : Promise.resolve([]),
        apiRef.get("opcoes", tok, "order=campo.asc,valor.asc"),
        papel === "admin" ? apiRef.get("backlog", tok, "order=data.desc") : Promise.resolve([]),
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
      (Array.isArray(optsData) ? optsData : []).forEach((o) => { if (o.campo === "crime") crimeSet.add(o.valor); });
      setCrimes([...crimeSet]);
    } catch (e) { console.error("Erro ao carregar dados:", e); }
    setLoading(false);
  };

  // Restore session on mount
  useEffect(() => {
    const tryRestore = async () => {
      try {
        const saved = localStorage.getItem(SESSION_KEY);
        if (saved) {
          const { url, key, tok, prof } = JSON.parse(saved);
          if (tok && prof) {
            const restoredApi = (url && key) ? createApi(url, key) : ENV_API;
            if (!restoredApi) { setScreen(ENV_API ? "auth" : "config"); return; }
            // Validate token with a lightweight query before restoring
            const check = await restoredApi.get("profiles", tok, `id=eq.${prof.id}`);
            if (!Array.isArray(check) || check.length === 0) {
              // Token expired or invalid — clear session and go to login
              localStorage.removeItem(SESSION_KEY);
              setScreen(ENV_API ? "auth" : "config");
              return;
            }
            setApi(restoredApi);
            setToken(tok);
            setProfile(prof);
            setActiveTab(prof.papel === "admin" ? "dia" : "registrar");
            setScreen("app");
            await loadData(restoredApi, tok, prof.papel);
            return;
          }
        }
      } catch (e) { localStorage.removeItem(SESSION_KEY); }
      setScreen(ENV_API ? "auth" : "config");
    };
    tryRestore();
  }, []); // eslint-disable-line

  const startDemo = () => { setDemo(true); setProfile(MOCK.profile); setRegistros(MOCK.registros); setEntregas(MOCK.entregas); setEstagiarias(MOCK.estagiarias); setBacklog(MOCK.backlog); setCrimes(MOCK.crimes); setActiveTab("dia"); setScreen("app"); };
  const connect = (url, key) => { const a = createApi(url, key); setApi(a); setScreen("auth"); };

  const onAuth = async (tok, usr, prof) => {
    setToken(tok); setProfile(prof);
    setActiveTab(prof.papel === "admin" ? "dia" : "registrar");
    setScreen("app");
    try { localStorage.setItem(SESSION_KEY, JSON.stringify({ url: ENV_URL || "", key: ENV_KEY || "", tok, refreshTok: usr?.refresh_token || "", prof })); } catch (e) {}
    await loadData(api, tok, prof.papel);
  };
  const logout = () => {
    try { localStorage.removeItem(SESSION_KEY); } catch (e) {}
    setScreen(demo ? "config" : "auth"); setDemo(false); setProfile(null); setToken(""); setRegistros([]); setEntregas([]); setBacklog([]); setViewAs(null);
  };
  const pendCount = entregas.filter((e) => e.status === "pendente").length;
  const handleViewAs = (id) => { setViewAs(id); setActiveTab("registrar"); };
  const exitViewAs = () => { setViewAs(null); setActiveTab("est"); };
  const currentPapel = viewAs ? "estagiaria" : profile?.papel;
  const currentNome = viewAs ? getEstName(viewAs, estagiarias) : profile?.nome;

  if (screen === "loading") return (<div style={{ ...S.page, alignItems: "center", justifyContent: "center" }}><link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" /><div style={{ fontSize: 16, color: "#64748b" }}>Carregando...</div></div>);
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
        {currentPapel==="estagiaria"&&activeTab==="registrar"&&<InternReg entregas={entregas} setEntregas={setEntregas} opts={opts} setOpts={setOpts} crimes={crimes} setCrimes={setCrimes} userId={viewAs || profile.id} api={api} token={token} demo={demo} callWithRefresh={callWithRefresh}/>}
        {currentPapel==="estagiaria"&&activeTab==="historico"&&<InternHist entregas={entregas} setEntregas={setEntregas} registros={registros} userId={viewAs || profile.id} api={api} token={token} demo={demo}/>}
      </div>
    </div>
  </div>);
}
