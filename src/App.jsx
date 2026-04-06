import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { LogOut, Plus, Check, Users, Send, History, X, Bell, Save, Trash2, ChevronLeft, ChevronRight, LayoutDashboard, ClipboardList, Edit3, Eye, AlertCircle, Menu, BookOpen } from "lucide-react";

const font = `'DM Sans', system-ui, sans-serif`;
const today = new Date().toISOString().slice(0, 10);
const COLORS = ["#2563eb","#10b981","#f59e0b","#ef4444","#8b5cf6","#ec4899","#06b6d4","#84cc16","#f97316","#6366f1"];
const CRIME_SEP = "; ";

const sortCrimes = (arr) => [...new Set(arr)].filter(Boolean).sort((a, b) => {
  const na = parseInt(a.match(/\d+/)?.[0] || "9999");
  const nb = parseInt(b.match(/\d+/)?.[0] || "9999");
  return na - nb;
});
const parseCrimes = (str) => str ? str.split(CRIME_SEP).filter(Boolean) : [];
const joinCrimes = (arr) => arr.join(CRIME_SEP);

const INIT_OPTS = {
  tipo_procedimento: ["IP","APF","TC","Processo","Cautelar","MPU","Queixa"],
  tipo_manifestacao: ["Análise","Denúncia","Arquivamento","Diligência","Manifestação","Razões","Contrarrazões","Memorial","ANPP","Transação","Impugnação","Ciência","Prazo","Petição Apelação","Juízo de retratação","Continuação"],
  grau_correcao: ["Nada","Pequena alteração","Refiz algumas partes","Refiz","Pedi para refazer"],
  crime: [],
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
    { id: 1, numero_procedimento: "1500910-98.2025.8.26.0608", tipo_procedimento: "APF", tipo_manifestacao: "Denúncia", crime: "121; 129, § 13", data_vista: "2026-03-28", num_folhas: 45, urgente: true, estagiaria_id: "e1", data_entrega: today, hora_entrega: "09:30", status: "pendente", obs_detalhadas: null },
    { id: 2, numero_procedimento: "1508321-70.2025.8.26.0196", tipo_procedimento: "TC", tipo_manifestacao: "Arquivamento", crime: "147", data_vista: "2026-03-30", num_folhas: null, urgente: false, estagiaria_id: "e2", data_entrega: today, hora_entrega: "10:15", status: "precisa_correcao", obs_detalhadas: "Revisar o fundamento do arquivamento, citar o art. 28 CPP." },
  ],
  registros: [
    { id: 1, data_trabalho: today, numero_procedimento: "1503933-27.2025.8.26.0196", tipo_procedimento: "IP", data_vista: "2026-03-28", num_folhas: null, crime: "147, § 1", tipo_manifestacao: "Análise", responsavel: "Igor", grau_correcao: null, obs_breves: "Falei com o Dr.", obs_detalhadas: "Análise completa do procedimento.", acompanhar: false, complicado: false, feedback_tipo: null, feedback_dado: false, entrega_id: null },
  ],
  backlog: [{ id: 1, data: today, pecas_corrigir: 4, pecas_minhas: 2, pecas_estagiarias: 4, diario_lido: false, diario_obs: "" }],
  crimes: sortCrimes(["147, § 1","129, § 13","171","157","121","33, Lei 11.343/06","155, § 4º","180","147"]),
};

const S = {
  page: { fontFamily: font, minHeight: "100vh", display: "flex", background: "#f1f5f9", color: "#1e293b", fontSize: 14 },
  sidebar: { width: 230, background: "#0f172a", color: "#e2e8f0", display: "flex", flexDirection: "column", padding: "20px 0", flexShrink: 0, minHeight: "100vh" },
  logo: { padding: "0 20px 20px", fontSize: 17, fontWeight: 700, letterSpacing: "-0.02em", color: "#fff", borderBottom: "1px solid #1e293b" },
  navItem: (a) => ({ display: "flex", alignItems: "center", gap: 10, padding: "10px 20px", cursor: "pointer", fontSize: 13, fontWeight: a ? 600 : 400, background: a ? "#1e293b" : "transparent", color: a ? "#fff" : "#94a3b8", borderLeft: a ? "3px solid #3b82f6" : "3px solid transparent" }),
  main: { flex: 1, padding: "20px 28px", overflowY: "auto", maxHeight: "100vh" },
  mainMobile: { flex: 1, padding: "14px 14px", overflowY: "auto" },
  card: { background: "#fff", borderRadius: 10, padding: 18, boxShadow: "0 1px 3px rgba(0,0,0,0.06)", marginBottom: 14 },
  statCard: (c) => ({ background: "#fff", borderRadius: 10, padding: "14px 18px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", borderLeft: `4px solid ${c}`, flex: 1, minWidth: 130 }),
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
  };
}

function useIsMobile() {
  const [m, setM] = useState(typeof window !== "undefined" ? window.innerWidth < 768 : false);
  useEffect(() => {
    const fn = () => setM(window.innerWidth < 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return m;
}

/* ─── TOAST ─── */
function Toasts({ items }) {
  const clr = { info: "#2563eb", success: "#10b981", warning: "#f59e0b", error: "#ef4444" };
  return (
    <div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 9999, display: "flex", flexDirection: "column", gap: 8, maxWidth: 320 }}>
      {items.map((t) => (
        <div key={t.id} style={{ background: clr[t.type] || clr.info, color: "#fff", borderRadius: 8, padding: "10px 16px", fontSize: 13, fontWeight: 600, boxShadow: "0 4px 14px rgba(0,0,0,0.2)", lineHeight: 1.4 }}>
          {t.msg}
        </div>
      ))}
    </div>
  );
}

/* ─── CRIME MULTI-SELECT ─── */
function CrimeMultiSelect({ value, onChange, options }) {
  const selected = parseCrimes(value);
  const toggle = (c) => {
    const next = selected.includes(c) ? selected.filter((x) => x !== c) : [...selected, c];
    onChange(joinCrimes(next));
  };
  return (
    <div>
      <div style={{ border: "1px solid #e2e8f0", borderRadius: 6, maxHeight: 150, overflowY: "auto", background: "#fff" }}>
        {options.length === 0
          ? <div style={{ padding: "10px 12px", fontSize: 12, color: "#94a3b8" }}>Nenhum crime cadastrado. Administrador deve cadastrar crimes no Dashboard.</div>
          : options.map((c) => (
            <label key={c} style={{ display: "flex", alignItems: "center", gap: 7, padding: "5px 10px", cursor: "pointer", fontSize: 12.5, borderBottom: "1px solid #f8fafc" }}>
              <input type="checkbox" checked={selected.includes(c)} onChange={() => toggle(c)} style={{ cursor: "pointer", accentColor: "#2563eb" }} />
              {c}
            </label>
          ))}
      </div>
      {selected.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 6 }}>
          {selected.map((c) => (
            <span key={c} style={{ background: "#dbeafe", color: "#1e40af", borderRadius: 99, padding: "2px 8px", fontSize: 11, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}>
              {c} <X size={10} style={{ cursor: "pointer" }} onClick={() => toggle(c)} />
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── MODAL / FIELD / DYNSELECT ─── */
function Modal({ title, onClose, children }) {
  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modal} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700 }}>{title}</h3>
          <X size={16} style={{ cursor: "pointer", color: "#94a3b8" }} onClick={onClose} />
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children, style: st }) {
  return (
    <div style={{ marginBottom: 10, ...st }}>
      <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: "#64748b", marginBottom: 3 }}>{label}</label>
      {children}
    </div>
  );
}

function DynSelect({ value, onChange, options, onAdd, placeholder, style: st }) {
  const [adding, setAdding] = useState(false);
  const [nv, setNv] = useState("");
  if (adding) return (
    <div style={{ display: "flex", gap: 4, ...st }}>
      <input style={{ ...S.input, flex: 1 }} value={nv} onChange={(e) => setNv(e.target.value)} placeholder="Novo valor..." autoFocus
        onKeyDown={(e) => { if (e.key === "Enter" && nv.trim()) { onAdd(nv.trim()); onChange(nv.trim()); setAdding(false); setNv(""); } if (e.key === "Escape") { setAdding(false); setNv(""); } }} />
      <button style={S.btn("success")} onClick={() => { if (nv.trim()) { onAdd(nv.trim()); onChange(nv.trim()); setAdding(false); setNv(""); } }}><Check size={13} /></button>
      <button style={S.btn("ghost")} onClick={() => { setAdding(false); setNv(""); }}><X size={13} /></button>
    </div>
  );
  return (
    <select style={{ ...S.select, width: "100%", ...st }} value={value} onChange={(e) => { if (e.target.value === "__add") setAdding(true); else onChange(e.target.value); }}>
      <option value="">{placeholder || "Selecione..."}</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
      <option value="__add">+ Adicionar novo...</option>
    </select>
  );
}

/* ─── CONFIG / AUTH ─── */
function ConfigScreen({ onConnect, onDemo }) {
  const [url, setUrl] = useState(""); const [key, setKey] = useState("");
  return (
    <div style={{ ...S.page, alignItems: "center", justifyContent: "center", background: "#0f172a" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <div style={{ background: "#fff", borderRadius: 16, padding: 36, width: 400, maxWidth: "90vw", textAlign: "center" }}>
        <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 4, letterSpacing: "-0.03em" }}>Gestão da Promotoria</div>
        <div style={{ fontSize: 12.5, color: "#64748b", marginBottom: 24 }}>4ª PJ Criminal — Franca/SP</div>
        <Field label="Supabase URL"><input style={S.input} placeholder="https://xyz.supabase.co" value={url} onChange={(e) => setUrl(e.target.value)} /></Field>
        <Field label="Supabase Anon Key"><input style={S.input} placeholder="eyJhbGciOi..." value={key} onChange={(e) => setKey(e.target.value)} /></Field>
        <button style={{ ...S.btn("primary"), width: "100%", justifyContent: "center", padding: "9px", marginBottom: 10, opacity: url && key ? 1 : 0.5 }} disabled={!url || !key} onClick={() => onConnect(url, key)}>Conectar ao Supabase</button>
        <button style={{ ...S.btn("ghost"), width: "100%", justifyContent: "center", padding: "9px" }} onClick={onDemo}>Modo Demonstração</button>
      </div>
    </div>
  );
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
        if (!prof) { setErr("Perfil não encontrado."); setLoading(false); return; }
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
  return (
    <div style={{ ...S.page, alignItems: "center", justifyContent: "center", background: "#0f172a" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <div style={{ background: "#fff", borderRadius: 16, padding: 36, width: 400, maxWidth: "90vw" }}>
        <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 18, textAlign: "center" }}>{mode === "login" ? "Entrar" : "Registro — Estagiária"}</div>
        {mode === "register" && <Field label="Nome completo"><input style={S.input} value={f.nome} onChange={(e) => upd("nome", e.target.value)} /></Field>}
        <Field label="E-mail"><input style={S.input} type="email" value={f.email} onChange={(e) => upd("email", e.target.value)} /></Field>
        <Field label="Senha"><input style={S.input} type="password" value={f.pw} onChange={(e) => upd("pw", e.target.value)} /></Field>
        {mode === "register" && (<>
          <Field label="Tipo"><select style={{ ...S.select, width: "100%" }} value={f.tipo} onChange={(e) => upd("tipo", e.target.value)}>
            <option value="graduacao">Graduação (4h)</option><option value="pos">Pós-Graduação (6h)</option><option value="voluntaria">Voluntária</option>
          </select></Field>
          <Field label="Carga horária/dia"><input style={S.input} type="number" step="0.5" min="1" max="8" value={f.carga} onChange={(e) => upd("carga", e.target.value)} /></Field>
        </>)}
        {err && <div style={{ color: "#ef4444", fontSize: 12, marginBottom: 10 }}>{err}</div>}
        <button style={{ ...S.btn("primary"), width: "100%", justifyContent: "center", padding: "9px", marginBottom: 10 }} onClick={submit} disabled={loading}>{loading ? "Aguarde..." : mode === "login" ? "Entrar" : "Registrar"}</button>
        <div style={{ textAlign: "center", fontSize: 12.5, color: "#64748b" }}>
          {mode === "login" ? <span>Nova estagiária? <a href="#" style={{ color: "#2563eb" }} onClick={() => { setMode("register"); setErr(""); }}>Registre-se</a></span> : <span>Já tem conta? <a href="#" style={{ color: "#2563eb" }} onClick={() => { setMode("login"); setErr(""); }}>Entrar</a></span>}
        </div>
      </div>
    </div>
  );
}

/* ─── SIDEBAR ─── */
function Sidebar({ papel, active, setActive, nome, pendCount, onLogout, isMobile, onClose }) {
  const tabs = papel === "admin"
    ? [{ key: "dia", icon: ClipboardList, label: "Dia de Trabalho" }, { key: "dash", icon: LayoutDashboard, label: "Dashboard" }, { key: "est", icon: Users, label: "Estagiárias" }]
    : [{ key: "registrar", icon: Send, label: "Registrar Entrega" }, { key: "historico", icon: History, label: "Meu Histórico" }];
  const handleNav = (key) => { setActive(key); if (isMobile && onClose) onClose(); };
  return (
    <div style={S.sidebar}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <div style={S.logo}>Gestão Promotoria</div>
      <div style={{ padding: "14px 20px 6px", fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>Menu</div>
      {tabs.map((t) => (
        <div key={t.key} style={S.navItem(active === t.key)} onClick={() => handleNav(t.key)}>
          <t.icon size={15} /><span>{t.label}</span>
          {t.key === "dia" && pendCount > 0 && <span style={{ marginLeft: "auto", background: "#f59e0b", color: "#fff", borderRadius: 99, padding: "1px 6px", fontSize: 10, fontWeight: 700 }}>{pendCount}</span>}
        </div>
      ))}
      <div style={{ marginTop: "auto", padding: "14px 20px", borderTop: "1px solid #1e293b" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{nome}</div>
        <div style={{ fontSize: 11, color: "#64748b", marginBottom: 8 }}>{papel === "admin" ? "Promotor" : "Estagiária"}</div>
        <div style={{ ...S.navItem(false), padding: "4px 0" }} onClick={onLogout}><LogOut size={13} /><span style={{ fontSize: 12 }}>Sair</span></div>
      </div>
    </div>
  );
}

/* ─── ADMIN: DIA DE TRABALHO ─── */
function DiaTrabalho({ registros, setRegistros, entregas, setEntregas, backlog, setBacklog, opts, setOpts, estagiarias, selectedDate, setSelectedDate, api, token, demo, addToast }) {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [corrigindo, setCorrigindo] = useState(null);
  const [pedirCorrecaoEnt, setPedirCorrecaoEnt] = useState(null);
  const [motivo, setMotivo] = useState("");
  const [diarioObsLocal, setDiarioObsLocal] = useState("");

  const empty = { numero_procedimento: "", tipo_procedimento: "", data_vista: "", num_folhas: "", crime: "", tipo_manifestacao: "", responsavel: "Igor", grau_correcao: "", obs_breves: "", obs_detalhadas: "", acompanhar: false, complicado: false, feedback_tipo: "", feedback_dado: false };
  const [form, setForm] = useState(empty);
  const upd = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const dayRegs = registros.filter((r) => r.data_trabalho === selectedDate);
  const pendentes = entregas.filter((e) => e.status === "pendente").sort((a, b) => (b.urgente ? 1 : 0) - (a.urgente ? 1 : 0));
  const dayBL = backlog.find((b) => b.data === selectedDate) || { pecas_corrigir: 0, pecas_minhas: 0, pecas_estagiarias: 0, diario_lido: false, diario_obs: "" };

  useEffect(() => { setDiarioObsLocal(dayBL.diario_obs || ""); }, [selectedDate, dayBL.diario_obs]);

  const updateBL = async (fld, val) => {
    const processed = fld === "diario_lido" ? Boolean(val) : fld === "diario_obs" ? String(val) : parseInt(val) || 0;
    const ex = backlog.find((b) => b.data === selectedDate);
    if (ex) {
      const updated = { ...ex, [fld]: processed };
      setBacklog(backlog.map((b) => b.data === selectedDate ? updated : b));
      if (!demo) try { await api.patch("backlog", ex.id, { [fld]: processed }, token); } catch (e) {}
    } else {
      const newBL = { data: selectedDate, pecas_corrigir: 0, pecas_minhas: 0, pecas_estagiarias: 0, diario_lido: false, diario_obs: "", [fld]: processed };
      if (!demo) {
        try { const [r] = await api.post("backlog", newBL, token); setBacklog([...backlog, r]); } catch (e) { setBacklog([...backlog, { ...newBL, id: Date.now() }]); }
      } else { setBacklog([...backlog, { ...newBL, id: Date.now() }]); }
    }
  };

  const addOpt = async (campo, valor) => {
    if (!demo) try { await api.post("opcoes", { campo, valor }, token); } catch (e) {}
  };

  const saveReg = async () => {
    if (!form.numero_procedimento || !form.tipo_procedimento || !form.tipo_manifestacao) return;
    const clean = {
      numero_procedimento: form.numero_procedimento, tipo_procedimento: form.tipo_procedimento,
      tipo_manifestacao: form.tipo_manifestacao, responsavel: form.responsavel,
      data_vista: form.data_vista || null, num_folhas: form.num_folhas ? parseInt(form.num_folhas) : null,
      crime: form.crime || null, grau_correcao: form.grau_correcao || null,
      obs_breves: form.obs_breves || null, obs_detalhadas: form.obs_detalhadas || null,
      acompanhar: form.acompanhar, complicado: form.complicado,
      feedback_tipo: form.feedback_tipo || null, feedback_dado: form.feedback_tipo ? form.feedback_dado : false,
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
            await api.patch("entregas", corrigindo.id, { status: "corrigido", obs_detalhadas: clean.obs_detalhadas || null }, token);
            setEntregas(entregas.map((e) => e.id === corrigindo.id ? { ...e, status: "corrigido", obs_detalhadas: clean.obs_detalhadas || null } : e));
          }
        } catch (e) { setRegistros([...registros, { ...payload, id: Date.now() }]); }
      } else {
        setRegistros([...registros, { ...payload, id: Date.now() }]);
        if (corrigindo) setEntregas(entregas.map((e) => e.id === corrigindo.id ? { ...e, status: "corrigido", obs_detalhadas: clean.obs_detalhadas || null } : e));
      }
    }
    setForm(empty); setShowForm(false); setCorrigindo(null);
  };

  const confirmarPedirCorrecao = async () => {
    const entId = pedirCorrecaoEnt;
    const patch = { status: "precisa_correcao", obs_detalhadas: motivo || null };
    if (!demo) try { await api.patch("entregas", entId, patch, token); } catch (e) {}
    setEntregas(entregas.map((e) => e.id === entId ? { ...e, ...patch } : e));
    setPedirCorrecaoEnt(null); setMotivo("");
  };

  const startCorr = (ent) => { setCorrigindo(ent); setForm({ ...empty, numero_procedimento: ent.numero_procedimento, tipo_procedimento: ent.tipo_procedimento, tipo_manifestacao: ent.tipo_manifestacao, crime: ent.crime || "", data_vista: ent.data_vista || "", num_folhas: ent.num_folhas || "", responsavel: getEstName(ent.estagiaria_id, estagiarias) }); setShowForm(true); };
  const startEdit = (r) => { setEditId(r.id); setForm({ numero_procedimento: r.numero_procedimento, tipo_procedimento: r.tipo_procedimento, data_vista: r.data_vista || "", num_folhas: r.num_folhas || "", crime: r.crime || "", tipo_manifestacao: r.tipo_manifestacao, responsavel: r.responsavel, grau_correcao: r.grau_correcao || "", obs_breves: r.obs_breves || "", obs_detalhadas: r.obs_detalhadas || "", acompanhar: r.acompanhar, complicado: r.complicado, feedback_tipo: r.feedback_tipo || "", feedback_dado: r.feedback_dado || false }); setShowForm(true); };

  const delReg = async (id) => {
    const r = registros.find((x) => x.id === id);
    if (!demo) {
      try { await api.del("registros", id, token); if (r?.entrega_id) await api.patch("entregas", r.entrega_id, { status: "pendente", obs_detalhadas: null }, token); } catch (e) {}
    }
    if (r?.entrega_id) setEntregas(entregas.map((e) => e.id === r.entrega_id ? { ...e, status: "pendente", obs_detalhadas: null } : e));
    setRegistros(registros.filter((x) => x.id !== id));
  };

  const nomes = ["Igor", ...estagiarias.filter((e) => e.ativo).map((e) => e.nome)];
  const crimeOpts = opts.crime || [];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
        <div>
          <h1 style={S.h1}>Dia de Trabalho</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
            <ChevronLeft size={18} style={{ cursor: "pointer", color: "#64748b" }} onClick={() => setSelectedDate(shiftDay(selectedDate, -1))} />
            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} style={{ ...S.input, width: "auto", fontWeight: 600 }} />
            <ChevronRight size={18} style={{ cursor: "pointer", color: "#64748b" }} onClick={() => setSelectedDate(shiftDay(selectedDate, 1))} />
            {selectedDate !== today && <button style={{ ...S.btn("ghost"), fontSize: 11, padding: "4px 8px" }} onClick={() => setSelectedDate(today)}>Hoje</button>}
          </div>
        </div>
        <button style={S.btn("primary")} onClick={() => { setForm(empty); setEditId(null); setCorrigindo(null); setShowForm(true); }}><Plus size={14} /> Novo Registro</button>
      </div>

      {/* Backlog + Diário Oficial */}
      <div style={S.card}>
        <div style={{ display: "flex", gap: 14, alignItems: "flex-end", flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#64748b", whiteSpace: "nowrap", alignSelf: "center" }}>Backlog:</span>
          <Field label="Corrigir" style={{ marginBottom: 0, flex: 1, minWidth: 70 }}><input type="number" min="0" style={{ ...S.input, textAlign: "center" }} value={dayBL.pecas_corrigir} onChange={(e) => updateBL("pecas_corrigir", e.target.value)} /></Field>
          <Field label="Minhas" style={{ marginBottom: 0, flex: 1, minWidth: 70 }}><input type="number" min="0" style={{ ...S.input, textAlign: "center" }} value={dayBL.pecas_minhas} onChange={(e) => updateBL("pecas_minhas", e.target.value)} /></Field>
          <Field label="Estagiárias" style={{ marginBottom: 0, flex: 1, minWidth: 70 }}><input type="number" min="0" style={{ ...S.input, textAlign: "center" }} value={dayBL.pecas_estagiarias} onChange={(e) => updateBL("pecas_estagiarias", e.target.value)} /></Field>
        </div>
        <div style={{ borderTop: "1px solid #f1f5f9", marginTop: 14, paddingTop: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <BookOpen size={14} color="#8b5cf6" />
            <span style={{ fontSize: 12, fontWeight: 700, color: "#64748b" }}>Diário Oficial</span>
            <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 12.5 }}>
              <input type="checkbox" checked={dayBL.diario_lido || false} onChange={(e) => updateBL("diario_lido", e.target.checked)} style={{ accentColor: "#10b981", width: 15, height: 15 }} />
              <span style={{ color: dayBL.diario_lido ? "#10b981" : "#64748b", fontWeight: dayBL.diario_lido ? 700 : 400 }}>{dayBL.diario_lido ? "Lido ✓" : "Pendente"}</span>
            </label>
          </div>
          <textarea style={{ ...S.input, minHeight: 40, resize: "vertical", fontSize: 12 }} placeholder="Observações sobre o Diário Oficial..." value={diarioObsLocal} onChange={(e) => setDiarioObsLocal(e.target.value)} onBlur={() => { if (diarioObsLocal !== (dayBL.diario_obs || "")) updateBL("diario_obs", diarioObsLocal); }} />
        </div>
      </div>

      {/* Pendentes */}
      {pendentes.length > 0 && (
        <div style={{ ...S.card, borderLeft: "4px solid #f59e0b" }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}><Bell size={14} color="#f59e0b" /> Pendentes de Revisão ({pendentes.length})</h3>
          {pendentes.map((e) => (
            <div key={e.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: "1px solid #f8fafc", flexWrap: "wrap", gap: 6 }}>
              <div style={{ fontSize: 12.5 }}>
                <span style={{ fontWeight: 600 }}>{getEstName(e.estagiaria_id, estagiarias)}</span>
                <span style={{ color: "#64748b" }}> — {e.tipo_manifestacao} — </span>
                <span style={{ fontFamily: "monospace", fontSize: 11.5 }}>{e.numero_procedimento}</span>
                <span style={{ color: "#94a3b8", marginLeft: 6, fontSize: 11 }}>{fmtDate(e.data_entrega)} {e.hora_entrega}</span>
                {e.urgente && <span style={{ ...S.badge("#991b1b", "#fee2e2"), marginLeft: 6 }}>URGENTE</span>}
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button style={{ ...S.btn("ghost"), fontSize: 11, padding: "5px 8px" }} onClick={() => { setPedirCorrecaoEnt(e.id); setMotivo(""); }}><AlertCircle size={12} /> Pedir Correção</button>
                <button style={S.btn("warn")} onClick={() => startCorr(e)}><Edit3 size={12} /> Corrigir</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Registros do dia */}
      <div style={S.card}>
        <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Registros — {fmtDate(selectedDate)} ({dayRegs.length})</h3>
        {dayRegs.length === 0
          ? <div style={{ color: "#94a3b8", fontSize: 13, textAlign: "center", padding: 20 }}>Nenhum registro neste dia</div>
          : <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
              <thead><tr>
                <th style={S.th}>Número</th><th style={S.th}>Tipo</th><th style={S.th}>Vista</th>
                <th style={S.th}>Crime</th><th style={S.th}>Manifestação</th><th style={S.th}>Resp.</th>
                <th style={S.th}>Correção</th><th style={S.th}>Obs.</th><th style={S.th}>Flags</th><th style={S.th}></th>
              </tr></thead>
              <tbody>{dayRegs.map((r) => (
                <tr key={r.id} style={{ background: r.responsavel !== "Igor" ? "#f0f9ff" : "transparent" }}>
                  <td style={{ ...S.td, fontFamily: "monospace", fontSize: 11 }}>{r.numero_procedimento}</td>
                  <td style={S.td}><span style={S.badge("#1e40af", "#dbeafe")}>{r.tipo_procedimento}</span></td>
                  <td style={{ ...S.td, fontSize: 12 }}>{fmtDate(r.data_vista)}</td>
                  <td style={{ ...S.td, fontSize: 12, maxWidth: 120 }}>
                    {r.crime ? parseCrimes(r.crime).map((c) => <span key={c} style={{ ...S.badge("#5b21b6", "#ede9fe"), marginRight: 2, marginBottom: 2, display: "inline-block" }}>{c}</span>) : "—"}
                  </td>
                  <td style={S.td}><span style={S.badge("#065f46", "#d1fae5")}>{r.tipo_manifestacao}</span></td>
                  <td style={{ ...S.td, fontWeight: r.responsavel === "Igor" ? 400 : 600 }}>{r.responsavel}</td>
                  <td style={S.td}>{r.grau_correcao ? <span style={S.badge(r.grau_correcao === "Nada" ? "#065f46" : r.grau_correcao.includes("refazer") ? "#991b1b" : "#92400e", r.grau_correcao === "Nada" ? "#d1fae5" : r.grau_correcao.includes("refazer") ? "#fee2e2" : "#fef3c7")}>{r.grau_correcao}</span> : "—"}</td>
                  <td style={{ ...S.td, fontSize: 11.5, maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={r.obs_detalhadas || r.obs_breves || ""}>{r.obs_breves || "—"}</td>
                  <td style={S.td}>{r.acompanhar && <span style={{ ...S.badge("#1e40af", "#dbeafe"), marginRight: 3 }}>AC</span>}{r.complicado && <span style={{ ...S.badge("#991b1b", "#fee2e2"), marginRight: 3 }}>!</span>}{r.feedback_tipo && <span style={S.badge(r.feedback_dado ? "#065f46" : "#92400e", r.feedback_dado ? "#d1fae5" : "#fef3c7")}>{r.feedback_tipo === "elogio" ? "👍" : "👎"}{r.feedback_dado ? " ✓" : ""}</span>}</td>
                  <td style={S.td}><div style={{ display: "flex", gap: 4 }}><Edit3 size={13} style={{ cursor: "pointer", color: "#94a3b8" }} onClick={() => startEdit(r)} /><Trash2 size={13} style={{ cursor: "pointer", color: "#94a3b8" }} onClick={() => delReg(r.id)} /></div></td>
                </tr>
              ))}</tbody>
            </table>
          </div>}
      </div>

      {/* Modal: pedir correção */}
      {pedirCorrecaoEnt && (
        <Modal title="Solicitar Correção" onClose={() => { setPedirCorrecaoEnt(null); setMotivo(""); }}>
          <Field label="Motivo da correção (ficará visível para a estagiária)">
            <textarea style={{ ...S.input, minHeight: 80, resize: "vertical" }} value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Descreva o que precisa ser corrigido..." autoFocus />
          </Field>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 4 }}>
            <button style={S.btn("ghost")} onClick={() => { setPedirCorrecaoEnt(null); setMotivo(""); }}>Cancelar</button>
            <button style={S.btn("danger")} onClick={confirmarPedirCorrecao}><AlertCircle size={13} /> Solicitar Correção</button>
          </div>
        </Modal>
      )}

      {/* Modal: registro */}
      {showForm && (
        <Modal title={corrigindo ? "Corrigir Entrega" : editId ? "Editar Registro" : "Novo Registro"} onClose={() => { setShowForm(false); setCorrigindo(null); setEditId(null); setForm(empty); }}>
          <Field label="Número do procedimento *"><input style={S.input} value={form.numero_procedimento} onChange={(e) => upd("numero_procedimento", e.target.value)} placeholder="0000000-00.0000.0.00.0000" /></Field>
          <div style={{ display: "flex", gap: 10 }}>
            <Field label="Tipo procedimento *" style={{ flex: 1 }}><DynSelect value={form.tipo_procedimento} onChange={(v) => upd("tipo_procedimento", v)} options={opts.tipo_procedimento} onAdd={(v) => { setOpts((o) => ({ ...o, tipo_procedimento: [...o.tipo_procedimento, v] })); addOpt("tipo_procedimento", v); }} /></Field>
            <Field label="Data da vista" style={{ flex: 1 }}><input type="date" style={S.input} value={form.data_vista} onChange={(e) => upd("data_vista", e.target.value)} /></Field>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Field label="Tipo manifestação *" style={{ flex: 1 }}><DynSelect value={form.tipo_manifestacao} onChange={(v) => upd("tipo_manifestacao", v)} options={opts.tipo_manifestacao} onAdd={(v) => { setOpts((o) => ({ ...o, tipo_manifestacao: [...o.tipo_manifestacao, v] })); addOpt("tipo_manifestacao", v); }} /></Field>
            <Field label="Responsável" style={{ flex: 1 }}><select style={{ ...S.select, width: "100%" }} value={form.responsavel} onChange={(e) => upd("responsavel", e.target.value)}>{nomes.map((n) => <option key={n} value={n}>{n}</option>)}</select></Field>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Field label="Folhas" style={{ flex: 1 }}><input type="number" style={S.input} value={form.num_folhas} onChange={(e) => upd("num_folhas", e.target.value)} /></Field>
          </div>
          <Field label="Crimes apurados">{crimeOpts.length > 0 ? <CrimeMultiSelect value={form.crime} onChange={(v) => upd("crime", v)} options={crimeOpts} /> : <div style={{ fontSize: 12, color: "#94a3b8", padding: "6px 0" }}>Cadastre crimes no Dashboard para selecioná-los aqui.</div>}</Field>
          {form.responsavel !== "Igor" && <Field label="Grau da correção"><DynSelect value={form.grau_correcao} onChange={(v) => upd("grau_correcao", v)} options={opts.grau_correcao} onAdd={(v) => { setOpts((o) => ({ ...o, grau_correcao: [...o.grau_correcao, v] })); addOpt("grau_correcao", v); }} placeholder="Selecione o grau..." /></Field>}
          {form.responsavel !== "Igor" && (
            <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
              <Field label="Feedback" style={{ flex: 1 }}><select style={{ ...S.select, width: "100%" }} value={form.feedback_tipo} onChange={(e) => upd("feedback_tipo", e.target.value)}>
                <option value="">Nenhum</option><option value="elogio">Elogiar</option><option value="critica">Criticar</option>
              </select></Field>
              {form.feedback_tipo && <Field label="Dado?" style={{ flex: 0 }}><label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12.5, cursor: "pointer", whiteSpace: "nowrap", padding: "7px 0" }}><input type="checkbox" checked={form.feedback_dado} onChange={(e) => upd("feedback_dado", e.target.checked)} /> Feito</label></Field>}
            </div>
          )}
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
        </Modal>
      )}
    </div>
  );
}

/* ─── ADMIN: DASHBOARD ─── */
function Dash({ registros, entregas, estagiarias, backlog, opts, setOpts, api, token, demo }) {
  const [periodo, setPeriodo] = useState("mes");
  const [refDate, setRefDate] = useState(today);
  const [newCrime, setNewCrime] = useState("");

  const addOpt = async (campo, valor) => {
    if (!demo) try { await api.post("opcoes", { campo, valor }, token); } catch (e) {}
  };

  const addCrime = async () => {
    const v = newCrime.trim();
    if (!v || (opts.crime || []).includes(v)) return;
    const updated = sortCrimes([...(opts.crime || []), v]);
    setOpts((o) => ({ ...o, crime: updated }));
    await addOpt("crime", v);
    setNewCrime("");
  };

  const removeCrime = async (c) => {
    setOpts((o) => ({ ...o, crime: (o.crime || []).filter((x) => x !== c) }));
    if (!demo) try { await fetch(`${api._url}/rest/v1/opcoes?campo=eq.crime&valor=eq.${encodeURIComponent(c)}`, { method: "DELETE", headers: { apikey: api._key, Authorization: `Bearer ${token}` } }); } catch (e) {}
  };

  const range = useMemo(() => {
    const d = new Date(refDate + "T12:00:00"); const y = d.getFullYear(), m = d.getMonth();
    if (periodo === "mes") return { s: `${y}-${String(m + 1).padStart(2, "0")}-01`, e: `${y}-${String(m + 1).padStart(2, "0")}-31` };
    if (periodo === "bimestre") { const sm = m % 2 === 0 ? m : m - 1; return { s: `${y}-${String(sm + 1).padStart(2, "0")}-01`, e: `${y}-${String(sm + 2).padStart(2, "0")}-31` }; }
    if (periodo === "semestre") { const sm = m < 6 ? 0 : 6; return { s: `${y}-${String(sm + 1).padStart(2, "0")}-01`, e: `${y}-${String(sm + 6).padStart(2, "0")}-31` }; }
    return { s: `${y}-01-01`, e: `${y}-12-31` };
  }, [periodo, refDate]);

  const fil = registros.filter((r) => r.data_trabalho >= range.s && r.data_trabalho <= range.e);
  const igorR = fil.filter((r) => r.responsavel === "Igor");
  const estR = fil.filter((r) => r.responsavel !== "Igor");
  const byManif = useMemo(() => { const m = {}; fil.forEach((r) => { m[r.tipo_manifestacao] = (m[r.tipo_manifestacao] || 0) + 1; }); return Object.entries(m).map(([n, v]) => ({ name: n, value: v })).sort((a, b) => b.value - a.value); }, [fil]);
  const byCrime = useMemo(() => {
    const m = {};
    fil.forEach((r) => { if (r.crime) parseCrimes(r.crime).forEach((c) => { m[c] = (m[c] || 0) + 1; }); });
    return Object.entries(m).map(([n, v]) => ({ name: n, value: v })).sort((a, b) => b.value - a.value).slice(0, 10);
  }, [fil]);
  const byResp = useMemo(() => { const m = {}; fil.forEach((r) => { m[r.responsavel] = (m[r.responsavel] || 0) + 1; }); return Object.entries(m).map(([n, v]) => ({ name: n, value: v })).sort((a, b) => b.value - a.value); }, [fil]);
  const byDay = useMemo(() => { const m = {}; fil.forEach((r) => { m[r.data_trabalho] = (m[r.data_trabalho] || 0) + 1; }); return Object.entries(m).map(([d, v]) => ({ data: fmtDate(d), total: v })).sort((a, b) => a.data.localeCompare(b.data)); }, [fil]);
  const byCorr = useMemo(() => { const m = {}; estR.forEach((r) => { if (r.grau_correcao) m[r.grau_correcao] = (m[r.grau_correcao] || 0) + 1; }); return Object.entries(m).map(([n, v]) => ({ name: n, value: v })); }, [estR]);
  const stats = [{ l: "Total Registros", v: fil.length, c: "#2563eb" }, { l: "Trabalho Próprio", v: igorR.length, c: "#10b981" }, { l: "Correções", v: estR.length, c: "#f59e0b" }, { l: "Pendentes", v: entregas.filter((e) => e.status === "pendente").length, c: "#ef4444" }];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
        <h1 style={S.h1}>Dashboard</h1>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <select style={S.select} value={periodo} onChange={(e) => setPeriodo(e.target.value)}>
            <option value="mes">Mensal</option><option value="bimestre">Bimestral</option><option value="semestre">Semestral</option><option value="ano">Anual</option>
          </select>
          <input type="date" style={{ ...S.input, width: "auto" }} value={refDate} onChange={(e) => setRefDate(e.target.value)} />
        </div>
      </div>
      <div style={{ fontSize: 12, color: "#64748b", marginBottom: 12 }}>Período: {fmtDate(range.s)} a {fmtDate(range.e)}</div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>{stats.map((s) => (<div key={s.l} style={S.statCard(s.c)}><div style={{ fontSize: 10.5, color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>{s.l}</div><div style={{ fontSize: 26, fontWeight: 700, marginTop: 2 }}>{s.v}</div></div>))}</div>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 14 }}>
        <div style={{ ...S.card, flex: 1, minWidth: 280 }}><h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Por Responsável</h3><ResponsiveContainer width="100%" height={200}><BarChart data={byResp}><XAxis dataKey="name" fontSize={11} /><YAxis fontSize={11} /><Tooltip /><Bar dataKey="value" radius={[4, 4, 0, 0]}>{byResp.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Bar></BarChart></ResponsiveContainer></div>
        <div style={{ ...S.card, flex: 1, minWidth: 260 }}><h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Por Tipo de Manifestação</h3><ResponsiveContainer width="100%" height={200}><PieChart><Pie data={byManif.slice(0, 8)} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} fontSize={10} label={({ name, value }) => `${name} (${value})`}>{byManif.slice(0, 8).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div>
      </div>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 14 }}>
        <div style={{ ...S.card, flex: 1, minWidth: 280 }}><h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Crimes Mais Frequentes</h3><ResponsiveContainer width="100%" height={200}><BarChart data={byCrime} layout="vertical"><XAxis type="number" fontSize={11} /><YAxis type="category" dataKey="name" fontSize={10} width={110} /><Tooltip /><Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} /></BarChart></ResponsiveContainer></div>
        <div style={{ ...S.card, flex: 1, minWidth: 260 }}><h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Grau de Correção</h3><ResponsiveContainer width="100%" height={200}><PieChart><Pie data={byCorr} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} fontSize={10} label={({ name, value }) => `${name} (${value})`}>{byCorr.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div>
      </div>
      <div style={S.card}><h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Volume por Dia</h3><ResponsiveContainer width="100%" height={180}><LineChart data={byDay}><XAxis dataKey="data" fontSize={10} /><YAxis fontSize={11} /><Tooltip /><Line type="monotone" dataKey="total" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} /></LineChart></ResponsiveContainer></div>

      {/* Gestão de Crimes */}
      <div style={S.card}>
        <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ background: "#ede9fe", color: "#5b21b6", borderRadius: 6, padding: "2px 8px", fontSize: 11 }}>Crimes</span>
          Gerenciar Crimes Apurados
        </h3>
        <p style={{ fontSize: 12, color: "#64748b", marginBottom: 12 }}>Lista gerenciada por você. As estagiárias selecionam a partir desta lista ao registrar entregas. Ordenada numericamente.</p>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <input style={{ ...S.input, flex: 1 }} value={newCrime} onChange={(e) => setNewCrime(e.target.value)} placeholder="Ex: 155, § 4º ou 33, Lei 11.343/06" onKeyDown={(e) => e.key === "Enter" && addCrime()} />
          <button style={S.btn("primary")} onClick={addCrime}><Plus size={13} /> Adicionar</button>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {(opts.crime || []).length === 0 && <span style={{ fontSize: 12, color: "#94a3b8" }}>Nenhum crime cadastrado.</span>}
          {(opts.crime || []).map((c) => (
            <span key={c} style={{ background: "#ede9fe", color: "#5b21b6", borderRadius: 99, padding: "4px 10px", fontSize: 12, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 5 }}>
              {c}
              <X size={11} style={{ cursor: "pointer", opacity: 0.6 }} onClick={() => removeCrime(c)} />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── INTERN: REGISTRAR ENTREGA ─── */
function InternReg({ entregas, setEntregas, opts, setOpts, userId, api, token, demo, addToast }) {
  const [form, setForm] = useState({ numero_procedimento: "", tipo_procedimento: "", tipo_manifestacao: "", crime: "", data_vista: "", num_folhas: "", urgente: false });
  const [ok, setOk] = useState(false);
  const upd = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.numero_procedimento || !form.tipo_procedimento || !form.tipo_manifestacao) return;
    const now = new Date();
    const payload = { numero_procedimento: form.numero_procedimento, tipo_procedimento: form.tipo_procedimento, tipo_manifestacao: form.tipo_manifestacao, crime: form.crime || null, data_vista: form.data_vista || null, num_folhas: form.num_folhas ? parseInt(form.num_folhas) : null, urgente: form.urgente, estagiaria_id: userId, data_entrega: today, hora_entrega: now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }), status: "pendente", obs_detalhadas: null };
    if (!demo) {
      try { const [result] = await api.post("entregas", payload, token); setEntregas([...entregas, result]); } catch (e) { setEntregas([...entregas, { ...payload, id: Date.now() }]); }
    } else { setEntregas([...entregas, { ...payload, id: Date.now() }]); }
    setForm({ numero_procedimento: "", tipo_procedimento: "", tipo_manifestacao: "", crime: "", data_vista: "", num_folhas: "", urgente: false });
    setOk(true); setTimeout(() => setOk(false), 3000);
    if (addToast) addToast("✅ Entrega registrada com sucesso!", "success");
  };

  const crimeOpts = opts.crime || [];

  return (
    <div>
      <h1 style={S.h1}>Registrar Entrega</h1>
      <p style={{ color: "#64748b", fontSize: 13, marginBottom: 16 }}>Informe a peça que você elaborou</p>
      {ok && <div style={{ ...S.card, borderLeft: "4px solid #10b981", background: "#f0fdf4", display: "flex", alignItems: "center", gap: 8 }}><Check size={16} color="#10b981" /><span style={{ fontWeight: 600, color: "#065f46", fontSize: 13 }}>Entrega registrada!</span></div>}
      <div style={{ ...S.card, maxWidth: 500 }}>
        <Field label="Número do procedimento *"><input style={S.input} value={form.numero_procedimento} onChange={(e) => upd("numero_procedimento", e.target.value)} placeholder="0000000-00.0000.0.00.0000" /></Field>
        <Field label="Tipo do procedimento *"><DynSelect value={form.tipo_procedimento} onChange={(v) => upd("tipo_procedimento", v)} options={opts.tipo_procedimento} onAdd={(v) => setOpts((o) => ({ ...o, tipo_procedimento: [...o.tipo_procedimento, v] }))} /></Field>
        <Field label="Tipo de manifestação *"><DynSelect value={form.tipo_manifestacao} onChange={(v) => upd("tipo_manifestacao", v)} options={opts.tipo_manifestacao} onAdd={(v) => setOpts((o) => ({ ...o, tipo_manifestacao: [...o.tipo_manifestacao, v] }))} /></Field>
        <Field label="Crimes apurados"><CrimeMultiSelect value={form.crime} onChange={(v) => upd("crime", v)} options={crimeOpts} /></Field>
        <div style={{ display: "flex", gap: 10 }}>
          <Field label="Data da vista" style={{ flex: 1 }}><input type="date" style={S.input} value={form.data_vista} onChange={(e) => upd("data_vista", e.target.value)} /></Field>
          <Field label="Nº de folhas" style={{ flex: 1 }}><input type="number" style={S.input} value={form.num_folhas} onChange={(e) => upd("num_folhas", e.target.value)} /></Field>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 10 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12.5, cursor: "pointer", color: "#ef4444", fontWeight: form.urgente ? 700 : 400 }}><input type="checkbox" checked={form.urgente} onChange={(e) => upd("urgente", e.target.checked)} /> Urgente</label>
          <span style={{ fontSize: 12, color: "#94a3b8" }}>{new Date().toLocaleString("pt-BR")}</span>
        </div>
        <button style={{ ...S.btn("primary"), width: "100%", justifyContent: "center", padding: "9px" }} onClick={submit} disabled={!form.numero_procedimento || !form.tipo_procedimento || !form.tipo_manifestacao}><Send size={13} /> Registrar Entrega</button>
      </div>
    </div>
  );
}

/* ─── INTERN: HISTÓRICO ─── */
function InternHist({ entregas, userId, api, token, demo, setEntregas, addToast }) {
  const mine = entregas.filter((e) => e.estagiaria_id === userId).sort((a, b) => (b.data_entrega + b.hora_entrega).localeCompare(a.data_entrega + a.hora_entrega));

  const marcarCorrigido = async (entId) => {
    if (!demo) try { await api.patch("entregas", entId, { status: "pendente" }, token); } catch (e) {}
    setEntregas(entregas.map((e) => e.id === entId ? { ...e, status: "pendente" } : e));
    if (addToast) addToast("✅ Correção enviada! O promotor foi notificado.", "success");
  };

  const statusBadge = (e) => {
    if (e.status === "corrigido") return <span style={S.badge("#065f46", "#d1fae5")}>Corrigido</span>;
    if (e.status === "precisa_correcao") return <span style={S.badge("#991b1b", "#fee2e2")}>⚠️ Corrigir!</span>;
    return <span style={S.badge("#92400e", "#fef3c7")}>Pendente</span>;
  };

  return (
    <div>
      <h1 style={S.h1}>Meu Histórico</h1>
      <p style={{ color: "#64748b", fontSize: 13, marginBottom: 14 }}>{mine.length} entregas</p>
      <div style={S.card}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 560 }}>
            <thead><tr>
              <th style={S.th}>Data</th><th style={S.th}>Procedimento</th><th style={S.th}>Manifestação</th>
              <th style={S.th}>Crimes</th><th style={S.th}>Status</th><th style={S.th}>Observação do Promotor</th>
            </tr></thead>
            <tbody>
              {mine.map((e) => (
                <>
                  <tr key={e.id} style={{ background: e.status === "precisa_correcao" ? "#fff7ed" : "transparent" }}>
                    <td style={S.td}>{fmtDate(e.data_entrega)} <span style={{ color: "#94a3b8", fontSize: 11 }}>{e.hora_entrega}</span></td>
                    <td style={{ ...S.td, fontFamily: "monospace", fontSize: 11 }}>{e.numero_procedimento}</td>
                    <td style={S.td}><span style={S.badge("#065f46", "#d1fae5")}>{e.tipo_manifestacao}</span></td>
                    <td style={{ ...S.td, maxWidth: 160 }}>
                      {e.crime ? parseCrimes(e.crime).map((c) => <span key={c} style={{ ...S.badge("#5b21b6", "#ede9fe"), marginRight: 2, marginBottom: 2, display: "inline-block" }}>{c}</span>) : "—"}
                    </td>
                    <td style={S.td}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        {statusBadge(e)}
                        {e.status === "precisa_correcao" && (
                          <button style={{ ...S.btn("success"), fontSize: 11, padding: "4px 8px", marginTop: 4 }} onClick={() => marcarCorrigido(e.id)}><Check size={11} /> Enviei a Correção</button>
                        )}
                      </div>
                    </td>
                    <td style={{ ...S.td, fontSize: 12, color: "#5b21b6", fontStyle: e.obs_detalhadas ? "italic" : "normal", maxWidth: 200 }}>
                      {e.obs_detalhadas || <span style={{ color: "#cbd5e1" }}>—</span>}
                    </td>
                  </tr>
                </>
              ))}
              {mine.length === 0 && <tr><td colSpan={6} style={{ ...S.td, textAlign: "center", color: "#94a3b8", padding: 24 }}>Nenhuma entrega registrada</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ─── ADMIN: ESTAGIÁRIAS ─── */
const TIPOS_EST = [{ value: "graduacao", label: "Graduação" }, { value: "pos", label: "Pós-Graduação" }, { value: "voluntaria", label: "Voluntária" }];
const getTipoLabel = (v) => TIPOS_EST.find((t) => t.value === v)?.label || v || "—";

function EstagiariaTab({ estagiarias, setEstagiarias, registros, entregas, onViewAs, api, token, demo }) {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const empty = { nome: "", email: "", tipo_estagiaria: "graduacao", carga_horaria_diaria: "4" };
  const [form, setForm] = useState(empty);
  const upd = (k, v) => setForm((f) => ({ ...f, [k]: v }));

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

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
        <div><h1 style={S.h1}>Estagiárias</h1><p style={{ color: "#64748b", fontSize: 13 }}>{estagiarias.filter((e) => e.ativo).length} ativas de {estagiarias.length}</p></div>
        <button style={S.btn("primary")} onClick={() => { setForm(empty); setEditId(null); setShowForm(true); }}><Plus size={14} /> Nova Estagiária</button>
      </div>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        {estagiarias.map((e) => {
          const regs = registros.filter((r) => r.responsavel === e.nome);
          const ents = entregas.filter((x) => x.estagiaria_id === e.id);
          const graded = regs.filter((r) => r.grau_correcao);
          const nada = graded.filter((r) => r.grau_correcao === "Nada").length;
          return (
            <div key={e.id} style={{ ...S.card, flex: "1 1 260px", maxWidth: 360, opacity: e.ativo ? 1 : 0.55 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 10 }}>
                <div><div style={{ fontSize: 15, fontWeight: 700 }}>{e.nome}</div><div style={{ fontSize: 12, color: "#64748b" }}>{e.email || "—"}</div></div>
                <span style={e.ativo ? S.badge("#065f46", "#d1fae5") : S.badge("#991b1b", "#fee2e2")}>{e.ativo ? "Ativa" : "Inativa"}</span>
              </div>
              <div style={{ display: "flex", gap: 16, fontSize: 12, color: "#475569", marginBottom: 10 }}>
                <span><strong>Tipo:</strong> {getTipoLabel(e.tipo_estagiaria)}</span>
                <span><strong>Horas/dia:</strong> {e.carga_horaria_diaria}h</span>
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                {[{ v: regs.length, l: "Correções", c: "#2563eb" }, { v: graded.length > 0 ? Math.round(nada / graded.length * 100) + "%" : "—", l: "Sem correção", c: "#10b981" }, { v: ents.filter((x) => x.status === "pendente").length, l: "Pendentes", c: "#f59e0b" }, { v: ents.filter((x) => x.status === "precisa_correcao").length, l: "Corrigir", c: "#ef4444" }].map((s) => (
                  <div key={s.l} style={{ flex: 1, background: "#f8fafc", borderRadius: 8, padding: "7px 6px", textAlign: "center" }}>
                    <div style={{ fontSize: 17, fontWeight: 700, color: s.c }}>{s.v}</div>
                    <div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase" }}>{s.l}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 6, justifyContent: "flex-end", flexWrap: "wrap" }}>
                <button style={{ ...S.btn("ghost"), fontSize: 11, padding: "5px 8px" }} onClick={() => onViewAs(e.id)}><Eye size={12} /> Visualizar como</button>
                <button style={{ ...S.btn("ghost"), fontSize: 11, padding: "5px 8px" }} onClick={() => startEdit(e)}><Edit3 size={12} /> Editar</button>
                <button style={{ ...S.btn(e.ativo ? "danger" : "success"), fontSize: 11, padding: "5px 8px" }} onClick={() => toggleAtivo(e.id)}>{e.ativo ? "Desativar" : "Reativar"}</button>
              </div>
            </div>
          );
        })}
      </div>
      {showForm && (
        <Modal title={editId ? "Editar Estagiária" : "Nova Estagiária"} onClose={() => { setShowForm(false); setEditId(null); setForm(empty); }}>
          <Field label="Nome *"><input style={S.input} value={form.nome} onChange={(e) => upd("nome", e.target.value)} /></Field>
          <Field label="E-mail"><input style={S.input} type="email" value={form.email} onChange={(e) => upd("email", e.target.value)} /></Field>
          <div style={{ display: "flex", gap: 10 }}>
            <Field label="Tipo" style={{ flex: 1 }}><select style={{ ...S.select, width: "100%" }} value={form.tipo_estagiaria} onChange={(e) => upd("tipo_estagiaria", e.target.value)}>{TIPOS_EST.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}</select></Field>
            <Field label="Carga horária/dia" style={{ flex: 1 }}><input style={S.input} type="number" step="0.5" min="1" max="8" value={form.carga_horaria_diaria} onChange={(e) => upd("carga_horaria_diaria", e.target.value)} /></Field>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 4 }}>
            <button style={S.btn("ghost")} onClick={() => { setShowForm(false); setEditId(null); setForm(empty); }}>Cancelar</button>
            <button style={S.btn("primary")} onClick={saveEst}><Save size={13} /> {editId ? "Salvar" : "Cadastrar"}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ─── MAIN APP ─── */
const ENV_URL = import.meta.env.VITE_SUPABASE_URL || "";
const ENV_KEY = import.meta.env.VITE_SUPABASE_KEY || "";
const ENV_API = ENV_URL && ENV_KEY ? createApi(ENV_URL, ENV_KEY) : null;

const LS_TOKEN = "gp_token";
const LS_PROFILE = "gp_profile";

export default function App() {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Restore session from localStorage
  const savedToken = localStorage.getItem(LS_TOKEN) || "";
  const savedProfile = (() => { try { return JSON.parse(localStorage.getItem(LS_PROFILE)); } catch { return null; } })();
  const hasSession = savedToken && savedProfile && ENV_API;

  const [screen, setScreen] = useState(hasSession ? "app" : ENV_API ? "auth" : "config");
  const [api, setApi] = useState(ENV_API);
  const [token, setToken] = useState(savedToken);
  const [profile, setProfile] = useState(savedProfile);
  const [demo, setDemo] = useState(false);
  const [activeTab, setActiveTab] = useState("");
  const [selectedDate, setSelectedDate] = useState(today);
  const [viewAs, setViewAs] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);

  const [registros, setRegistros] = useState([]);
  const [entregas, setEntregas] = useState([]);
  const [estagiarias, setEstagiarias] = useState([]);
  const [backlog, setBacklog] = useState([]);
  const [opts, setOpts] = useState(INIT_OPTS);

  // Refs for polling
  const prevPendentesRef = useRef(new Set());
  const prevPCRef = useRef(new Set());
  const estagiariasRef = useRef([]);
  useEffect(() => { estagiariasRef.current = estagiarias; }, [estagiarias]);

  const addToast = useCallback((msg, type = "info") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 5000);
  }, []);

  const loadData = async (apiRef, tok, papel) => {
    setLoading(true);
    try {
      const [regs, ents, profs, optsData, bl] = await Promise.all([
        papel === "admin" ? apiRef.get("registros", tok, "order=data_trabalho.desc") : Promise.resolve([]),
        apiRef.get("entregas", tok, papel === "admin" ? "order=data_entrega.desc,hora_entrega.desc" : `estagiaria_id=eq.${(await apiRef.get("profiles", tok, "")).find?.((p) => p)?.id || "x"}&order=data_entrega.desc`),
        papel === "admin" ? apiRef.get("profiles", tok, "papel=eq.estagiaria&order=nome.asc") : Promise.resolve([]),
        apiRef.get("opcoes", tok, "order=campo.asc,valor.asc"),
        papel === "admin" ? apiRef.get("backlog", tok, "order=data.desc") : Promise.resolve([]),
      ]);
      setRegistros(Array.isArray(regs) ? regs : []);
      setEntregas(Array.isArray(ents) ? ents : []);
      setEstagiarias(Array.isArray(profs) ? profs : []);
      setBacklog(Array.isArray(bl) ? bl : []);
      const optsMap = { ...INIT_OPTS, crime: [] };
      (Array.isArray(optsData) ? optsData : []).forEach((o) => {
        if (o.campo === "crime") {
          if (!optsMap.crime.includes(o.valor)) optsMap.crime.push(o.valor);
        } else if (optsMap[o.campo] && !optsMap[o.campo].includes(o.valor)) {
          optsMap[o.campo].push(o.valor);
        }
      });
      optsMap.crime = sortCrimes(optsMap.crime);
      setOpts(optsMap);
      // Init polling refs
      const entsArr = Array.isArray(ents) ? ents : [];
      prevPendentesRef.current = new Set(entsArr.filter((e) => e.status === "pendente").map((e) => e.id));
      prevPCRef.current = new Set(entsArr.filter((e) => e.status === "precisa_correcao").map((e) => e.id));
    } catch (e) { console.error("Erro ao carregar dados:", e); }
    setLoading(false);
  };

  // Polling (15s)
  useEffect(() => {
    if (!profile || demo || !api || !token) return;
    const poll = async () => {
      try {
        const q = profile.papel === "admin"
          ? "order=data_entrega.desc,hora_entrega.desc"
          : `estagiaria_id=eq.${profile.id}&order=data_entrega.desc`;
        const ents = await api.get("entregas", token, q);
        if (!Array.isArray(ents)) return;

        if (profile.papel === "admin") {
          const newPend = new Set(ents.filter((e) => e.status === "pendente").map((e) => e.id));
          const newPC = new Set(ents.filter((e) => e.status === "precisa_correcao").map((e) => e.id));
          [...newPend].filter((id) => !prevPendentesRef.current.has(id)).forEach((id) => {
            const e = ents.find((x) => x.id === id);
            if (!e) return;
            const wasPC = prevPCRef.current.has(id);
            addToast(wasPC ? `✅ ${getEstName(e.estagiaria_id, estagiariasRef.current)} enviou a correção` : `📥 Nova entrega de ${getEstName(e.estagiaria_id, estagiariasRef.current)}`, wasPC ? "success" : "info");
          });
          prevPendentesRef.current = newPend;
          prevPCRef.current = newPC;
        } else {
          const myPC = new Set(ents.filter((e) => e.status === "precisa_correcao").map((e) => e.id));
          [...myPC].filter((id) => !prevPCRef.current.has(id)).forEach(() => {
            addToast("⚠️ Uma entrega sua precisa ser corrigida!", "warning");
          });
          prevPCRef.current = myPC;
        }
        setEntregas(ents);
      } catch (e) {}
    };
    const interval = setInterval(poll, 15000);
    return () => clearInterval(interval);
  }, [profile?.id, profile?.papel, token, demo]);

  const startDemo = () => {
    setDemo(true); setProfile(MOCK.profile); setRegistros(MOCK.registros);
    setEntregas(MOCK.entregas); setEstagiarias(MOCK.estagiarias); setBacklog(MOCK.backlog);
    setOpts({ ...INIT_OPTS, crime: MOCK.crimes });
    prevPendentesRef.current = new Set(MOCK.entregas.filter((e) => e.status === "pendente").map((e) => e.id));
    prevPCRef.current = new Set(MOCK.entregas.filter((e) => e.status === "precisa_correcao").map((e) => e.id));
    setActiveTab("dia"); setScreen("app");
  };

  // On mount: if session was restored from localStorage, load data
  useEffect(() => {
    if (!hasSession) return;
    const prof = savedProfile;
    setActiveTab(prof.papel === "admin" ? "dia" : "registrar");
    if (prof.papel === "admin") {
      loadData(ENV_API, savedToken, "admin");
    } else {
      (async () => {
        setLoading(true);
        try {
          const [ents, optsData] = await Promise.all([
            ENV_API.get("entregas", savedToken, `estagiaria_id=eq.${prof.id}&order=data_entrega.desc`),
            ENV_API.get("opcoes", savedToken, "order=campo.asc,valor.asc"),
          ]);
          setEntregas(Array.isArray(ents) ? ents : []);
          const optsMap = { ...INIT_OPTS, crime: [] };
          (Array.isArray(optsData) ? optsData : []).forEach((o) => {
            if (o.campo === "crime") { if (!optsMap.crime.includes(o.valor)) optsMap.crime.push(o.valor); }
            else if (optsMap[o.campo] && !optsMap[o.campo].includes(o.valor)) optsMap[o.campo].push(o.valor);
          });
          optsMap.crime = sortCrimes(optsMap.crime);
          setOpts(optsMap);
          prevPCRef.current = new Set((Array.isArray(ents) ? ents : []).filter((e) => e.status === "precisa_correcao").map((e) => e.id));
        } catch (e) {}
        setLoading(false);
      })();
    }
  }, []);

  const connect = (url, key) => { setApi(createApi(url, key)); setScreen("auth"); };

  const onAuth = async (tok, usr, prof) => {
    setToken(tok); setProfile(prof);
    localStorage.setItem(LS_TOKEN, tok);
    localStorage.setItem(LS_PROFILE, JSON.stringify(prof));
    setActiveTab(prof.papel === "admin" ? "dia" : "registrar");
    setScreen("app");
    // For estagiária, load their own entregas properly
    if (prof.papel !== "admin") {
      setLoading(true);
      try {
        const [ents, optsData] = await Promise.all([
          api.get("entregas", tok, `estagiaria_id=eq.${prof.id}&order=data_entrega.desc`),
          api.get("opcoes", tok, "order=campo.asc,valor.asc"),
        ]);
        setEntregas(Array.isArray(ents) ? ents : []);
        const optsMap = { ...INIT_OPTS, crime: [] };
        (Array.isArray(optsData) ? optsData : []).forEach((o) => {
          if (o.campo === "crime") { if (!optsMap.crime.includes(o.valor)) optsMap.crime.push(o.valor); }
          else if (optsMap[o.campo] && !optsMap[o.campo].includes(o.valor)) optsMap[o.campo].push(o.valor);
        });
        optsMap.crime = sortCrimes(optsMap.crime);
        setOpts(optsMap);
        prevPCRef.current = new Set((Array.isArray(ents) ? ents : []).filter((e) => e.status === "precisa_correcao").map((e) => e.id));
      } catch (e) {}
      setLoading(false);
    } else {
      await loadData(api, tok, prof.papel);
    }
  };

  const logout = () => {
    localStorage.removeItem(LS_TOKEN);
    localStorage.removeItem(LS_PROFILE);
    setScreen(demo ? "config" : "auth"); setDemo(false); setProfile(null); setToken("");
    setRegistros([]); setEntregas([]); setBacklog([]); setViewAs(null); setSidebarOpen(false);
  };
  const pendCount = entregas.filter((e) => e.status === "pendente").length;
  const handleViewAs = (id) => { setViewAs(id); setActiveTab("registrar"); setSidebarOpen(false); };
  const exitViewAs = () => { setViewAs(null); setActiveTab("est"); };
  const currentPapel = viewAs ? "estagiaria" : profile?.papel;
  const currentNome = viewAs ? getEstName(viewAs, estagiarias) : profile?.nome;

  if (screen === "config") return <ConfigScreen onConnect={connect} onDemo={startDemo} />;
  if (screen === "auth") return <AuthScreen api={api} onAuth={onAuth} />;
  if (loading) return (
    <div style={{ ...S.page, alignItems: "center", justifyContent: "center" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <div style={{ fontSize: 16, color: "#64748b" }}>Carregando dados...</div>
    </div>
  );

  return (
    <div style={{ ...S.page, flexDirection: "column" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* Mobile top bar */}
      {isMobile && (
        <div style={{ background: "#0f172a", color: "#fff", display: "flex", alignItems: "center", padding: "10px 16px", gap: 12, position: "sticky", top: 0, zIndex: 100, flexShrink: 0 }}>
          <button onClick={() => setSidebarOpen(true)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", padding: 0, display: "flex" }}><Menu size={20} /></button>
          <span style={{ fontWeight: 700, fontSize: 15 }}>Gestão Promotoria</span>
          {pendCount > 0 && <span style={{ background: "#f59e0b", color: "#fff", borderRadius: 99, padding: "2px 8px", fontSize: 11, fontWeight: 700, marginLeft: "auto" }}>{pendCount} pendente{pendCount > 1 ? "s" : ""}</span>}
        </div>
      )}

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Sidebar overlay (mobile) */}
        {isMobile && sidebarOpen && (
          <div style={{ position: "fixed", inset: 0, zIndex: 200 }}>
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)" }} onClick={() => setSidebarOpen(false)} />
            <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 230, zIndex: 201 }}>
              <Sidebar papel={currentPapel} active={activeTab} setActive={setActiveTab} nome={currentNome} pendCount={pendCount} onLogout={viewAs ? exitViewAs : logout} isMobile={true} onClose={() => setSidebarOpen(false)} />
            </div>
          </div>
        )}

        {/* Sidebar (desktop) */}
        {!isMobile && (
          <Sidebar papel={currentPapel} active={activeTab} setActive={setActiveTab} nome={currentNome} pendCount={pendCount} onLogout={viewAs ? exitViewAs : logout} isMobile={false} />
        )}

        {/* Main content */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {demo && !viewAs && <div style={S.demoBanner}>Modo demonstração — dados fictícios</div>}
          {viewAs && <div style={{ ...S.demoBanner, background: "#dbeafe", color: "#1e40af" }}>Visualizando como: {getEstName(viewAs, estagiarias)} — <span style={{ textDecoration: "underline", cursor: "pointer" }} onClick={exitViewAs}>voltar ao admin</span></div>}
          <div style={isMobile ? S.mainMobile : S.main}>
            {currentPapel === "admin" && activeTab === "dia" && <DiaTrabalho registros={registros} setRegistros={setRegistros} entregas={entregas} setEntregas={setEntregas} backlog={backlog} setBacklog={setBacklog} opts={opts} setOpts={setOpts} estagiarias={estagiarias} selectedDate={selectedDate} setSelectedDate={setSelectedDate} api={api} token={token} demo={demo} addToast={addToast} />}
            {currentPapel === "admin" && activeTab === "dash" && <Dash registros={registros} entregas={entregas} estagiarias={estagiarias} backlog={backlog} opts={opts} setOpts={setOpts} api={api} token={token} demo={demo} />}
            {currentPapel === "admin" && activeTab === "est" && <EstagiariaTab estagiarias={estagiarias} setEstagiarias={setEstagiarias} registros={registros} entregas={entregas} onViewAs={handleViewAs} api={api} token={token} demo={demo} />}
            {currentPapel === "estagiaria" && activeTab === "registrar" && <InternReg entregas={entregas} setEntregas={setEntregas} opts={opts} setOpts={setOpts} userId={viewAs || profile.id} api={api} token={token} demo={demo} addToast={addToast} />}
            {currentPapel === "estagiaria" && activeTab === "historico" && <InternHist entregas={entregas} userId={viewAs || profile.id} api={api} token={token} demo={demo} setEntregas={setEntregas} addToast={addToast} />}
          </div>
        </div>
      </div>

      <Toasts items={toasts} />
    </div>
  );
}
