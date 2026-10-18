const STORAGE_KEY = 'foco.tasks';
const ARCHIVE_KEY = 'foco.archive';
const PREFS_KEY = 'foco.prefs';
const WORKSPACES_KEY = 'foco.workspaces';
const HABITS_KEY = 'foco.habits';

const HABIT_TYPES = ['manual', 'auto_time'];
const HABIT_TYPE_LABEL = { manual: 'Manual (marcar feito)', auto_time: 'Meta de tempo' };
// paleta de cores dos habitos (reaproveita as 8 cores dos workspaces)
const HABIT_PALETTE = [
  '#6366f1', '#0ea5e9', '#10b981', '#f59e0b',
  '#f43f5e', '#8b5cf6', '#14b8a6', '#64748b'
];
// tempo assumido por dia concluido quando o habito nao tem tempo real registrado
const HABIT_DEFAULT_DAY_SECONDS = 1800;

const PRIORITIES = ['low', 'medium', 'high'];
const PRIORITY_LABEL = { low: 'Baixa', medium: 'Media', high: 'Alta' };
const PRIORITY_BADGE = {
  low: 'bg-slate-700 text-slate-300',
  medium: 'bg-amber-500/20 text-amber-300',
  high: 'bg-red-500/20 text-red-300'
};
const PRIORITY_WEIGHT = { low: 0, medium: 1, high: 2 };
const PRIORITY_DOT = { low: 'bg-slate-500', medium: 'bg-amber-500', high: 'bg-red-500' };
const PRIORITY_HEX = { low: '#64748b', medium: '#f59e0b', high: '#dc2626' };

const WS_PALETTE = [
  '#6366f1', '#0ea5e9', '#10b981', '#f59e0b',
  '#f43f5e', '#8b5cf6', '#14b8a6', '#64748b'
];
// Importancia padrao do workspace (base para a futura Matriz de Eisenhower).
const WORKSPACE_IMPORTANCE = ['important', 'not_important', 'variable'];
const WORKSPACE_IMPORTANCE_LABEL = {
  important: 'Importante',
  not_important: 'Nao importante',
  variable: 'Variavel'
};
const HEX_RE = /^#[0-9a-fA-F]{6}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

// Matriz de Eisenhower (aba Hoje): 4 quadrantes fixos, '1'..'4' (string, casa
// com o schema de task.matrixQuadrant). Override manual usa esses mesmos ids.
const MATRIX_QUADRANTS = ['1', '2', '3', '4'];
const QUADRANT_META = {
  1: { title: 'Fazer agora', dot: 'bg-red-500', border: 'border-red-500/40' },
  2: { title: 'Planejar', dot: 'bg-blue-500', border: 'border-blue-500/40' },
  3: { title: 'Resolver rapido', dot: 'bg-yellow-500', border: 'border-yellow-500/40' },
  4: { title: 'Deixar para depois', dot: 'bg-slate-500', border: 'border-slate-600/50' }
};

const CAL_VIEWS = ['month', 'week', 'day', 'ndays'];
const CAL_VIEW_LABEL = { month: 'Mes', week: 'Semana', day: 'Dia', ndays: 'N Dias' };
const HOUR_PX = 44; // altura de 1h na grade de Semana/Dia

const RECURRENCES = ['once', 'daily', 'weekly', 'monthly'];
const RECUR_LABEL = { once: 'Unica', daily: 'Diaria', weekly: 'Semanal', monthly: 'Mensal' };

// Recorrencia agora pode ser uma string simples (acima) OU um objeto:
//   { type: 'everyN', n: 3 }            -> a cada 3 dias
//   { type: 'weekdays', days: [1,3,5] } -> seg/qua/sex (0=Dom ... 6=Sab)
const WEEKDAY_LETTERS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const EVERY_N_MAX = 365;

// migracao: subtarefas antigas tinham "difficulty" (easy/medium/hard)
const DIFF_TO_PRIORITY = { easy: 'low', medium: 'medium', hard: 'high' };

// Abas do menu lateral
const VIEWS = ['today', 'tasks', 'agenda', 'activities', 'habits'];
const VIEW_META = {
  today: { label: 'Hoje', icon: 'Sun', title: 'Hoje' },
  tasks: { label: 'Tarefas', icon: 'ListTodo', title: 'Tarefas' },
  agenda: { label: 'Agenda', icon: 'CalendarDays', title: 'Agenda' },
  activities: { label: 'Atividades', icon: 'Activity', title: 'Atividades' },
  habits: { label: 'Habitos', icon: 'Repeat', title: 'Habitos' }
};

const TASK_GROUPS = ['priority', 'date'];
const TASK_GROUP_LABEL = { priority: 'Prioridade', date: 'Data' };

// Filtros exclusivos do Modo Widget (independentes da tela cheia)
const WIDGET_TIME_FILTERS = ['today', 'next3', 'week', 'all'];
const WIDGET_TIME_LABEL = {
  today: 'Apenas hoje',
  next3: 'Proximos 3 dias',
  week: 'Esta semana',
  all: 'Todas as pendencias'
};
const WIDGET_TIME_HORIZON = { next3: 3, week: 7 };

// Instalacao nova: so o workspace master "Geral" (indeletavel). Nao mexe em
// workspaces ja salvos por usuarios existentes — loadWorkspaces so cai aqui
// quando o localStorage esta vazio/invalido.
const DEFAULT_WORKSPACES = [{ id: 'general', name: 'Geral', color: '#64748b', importance: 'variable' }];

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const LONG_BREAK_EVERY = 4; // a cada 4 ciclos de foco, a pausa e longa
const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

const form = document.getElementById('task-form');
const input = document.getElementById('task-input');
const taskStartEl = document.getElementById('task-start');
const taskEndEl = document.getElementById('task-end');
const taskDateEl = document.getElementById('task-date');
const taskDateRow = document.getElementById('task-date-row');
const recurSelect = document.getElementById('recur-select');
const recurCustomEl = document.getElementById('recur-custom');
const taskPrioEl = document.getElementById('task-prio');
const taskWsEl = document.getElementById('task-ws');
const taskWsRow = document.getElementById('task-ws-row');
const taskHabitEl = document.getElementById('task-habit');
const taskHabitRow = document.getElementById('task-habit-row');
const taskDetailsBtn = document.getElementById('task-details-btn');
const taskDetailsPanel = document.getElementById('task-details');
const taskDetailsClearBtn = document.getElementById('task-details-clear');
const widgetCfgBtn = document.getElementById('widget-cfg-btn');
const list = document.getElementById('task-list');
const dashboard = document.getElementById('dashboard');
const focusView = document.getElementById('focus-view');
const sidebarEl = document.getElementById('sidebar');
const contentMainEl = document.getElementById('content-main');
const appHeader = document.getElementById('app-header');
const viewTitleEl = document.getElementById('view-title');
const subtitleEl = document.getElementById('app-subtitle');
const headerActionEl = document.getElementById('header-action');
const contextBar = document.getElementById('context-bar');
const footerEl = document.getElementById('app-footer');

let tasks = loadList(STORAGE_KEY);
let archive = loadList(ARCHIVE_KEY);
let workspaces = loadWorkspaces();
let habits = loadHabits();
let prefs = loadPrefs();
// garante que o workspace atual ainda existe
if (!workspaces.some((w) => w.id === prefs.workspace)) prefs.workspace = workspaces[0].id;

let state = { view: VIEWS.includes(prefs.view) ? prefs.view : 'today' }; // + 'archive' | 'focus'
let wsOpen = false; // dropdown de workspace aberto
let draggedId = null;
let overlayMode = false; // modo widget/sobreposicao (janela pequena e translucida)
let maximized = false;
let calRef = null; // data-ancora "YYYY-MM-DD" do calendario; null = hoje
let lastLayout = null; // ultimo layout renderizado (para re-render so quando muda)

const timer = {
  taskId: null,
  subId: null, // quando o foco e de uma subtarefa especifica
  phase: 'focus', // 'focus' | 'break'
  isLong: false,
  cycle: 0, // ciclos de foco concluidos nesta sessao
  running: false,
  remaining: 0, // segundos
  endsAt: null, // timestamp de termino quando rodando
  segStart: null // inicio do trecho de foco em andamento (para somar timeSpentSeconds)
};
let tickHandle = null;
let audioCtx = null;
// Tarefa "fantasma" de um foco iniciado direto de um habito (nunca vai pro
// localStorage). Vive so enquanto o Modo Foco esta ativo.
let ephemeralFocusTask = null;

// Tarefa ativa no Modo Foco — a fantasma do habito, se houver; senao a real.
function currentFocusTask() {
  if (ephemeralFocusTask && ephemeralFocusTask.id === timer.taskId) return ephemeralFocusTask;
  return getTask(timer.taskId);
}

/* ---------------- persistencia ---------------- */

function loadList(key) {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map(normalizeTask) : [];
  } catch (err) {
    console.error('Falha ao ler "' + key + '" do localStorage:', err);
    return [];
  }
}

// Numero finito >= 0, senao 0 (aceita fracao — usado para segundos).
function num0(v) {
  return Number.isFinite(v) && v >= 0 ? v : 0;
}

// Garante que tarefas de fases anteriores ganhem os campos novos.
function normalizeTask(t) {
  t = t || {};
  return {
    id: t.id || crypto.randomUUID(),
    text: String(t.text || ''),
    done: Boolean(t.done),
    priority: PRIORITIES.includes(t.priority) ? t.priority : 'medium',
    today: Boolean(t.today),
    collapsed: t.collapsed === undefined ? true : Boolean(t.collapsed),
    dueDate: typeof t.dueDate === 'string' && DATE_RE.test(t.dueDate) ? t.dueDate : null,
    startTime: typeof t.startTime === 'string' && TIME_RE.test(t.startTime) ? t.startTime : null,
    endTime: typeof t.endTime === 'string' && TIME_RE.test(t.endTime) ? t.endTime : null,
    recurrence: normalizeRecurrence(t.recurrence),
    recurrenceCount:
      typeof t.recurrenceCount === 'number' && t.recurrenceCount >= 0
        ? Math.floor(t.recurrenceCount)
        : 0,
    nextOccurrence:
      typeof t.nextOccurrence === 'string' && DATE_RE.test(t.nextOccurrence)
        ? t.nextOccurrence
        : null,
    history: Array.isArray(t.history)
      ? t.history.filter((d) => typeof d === 'string' && DATE_RE.test(d)).slice(-90)
      : [],
    subtasks: Array.isArray(t.subtasks) ? t.subtasks.map(normalizeSub) : [],
    // pomodoros / timeSpentSeconds = contadores do CICLO atual (zerados quando
    // uma tarefa recorrente renova). Os *Total acumulam pela vida toda da tarefa
    // e nunca sao zerados — base do tracker de produtividade.
    pomodoros: typeof t.pomodoros === 'number' && t.pomodoros >= 0 ? Math.floor(t.pomodoros) : 0,
    pomodorosTotal: Math.floor(
      num0(t.pomodorosTotal != null ? t.pomodorosTotal : t.pomodoros)
    ),
    timeSpentSeconds: num0(t.timeSpentSeconds),
    timeSpentTotalSeconds: num0(
      t.timeSpentTotalSeconds != null ? t.timeSpentTotalSeconds : t.timeSpentSeconds
    ),
    workspace: typeof t.workspace === 'string' && t.workspace ? t.workspace : 'general',
    // vinculo opcional a um habito (tempo de foco alimenta o painel de habitos)
    habitId: typeof t.habitId === 'string' && t.habitId ? t.habitId : null,
    // override manual do quadrante na futura Matriz de Eisenhower (null = automatico,
    // calculado a partir da importancia do workspace + urgencia do prazo). So schema
    // por enquanto — a matriz e o drag-and-drop ainda nao existem.
    matrixQuadrant: typeof t.matrixQuadrant === 'string' && t.matrixQuadrant ? t.matrixQuadrant : null,
    createdAt: t.createdAt || Date.now(),
    completedAt: typeof t.completedAt === 'number' ? t.completedAt : null
  };
}

function normalizeSub(s) {
  s = s || {};
  return {
    id: s.id || crypto.randomUUID(),
    text: String(s.text || ''),
    done: Boolean(s.done),
    dueDate: typeof s.dueDate === 'string' && DATE_RE.test(s.dueDate) ? s.dueDate : null,
    // horario proprio do passo (ex.: reagendado via drag-and-drop na Agenda)
    startTime: typeof s.startTime === 'string' && TIME_RE.test(s.startTime) ? s.startTime : null,
    // termino proprio do passo (ex.: redimensionado via arraste na Agenda) —
    // mesmo padrao do endTime da tarefa.
    endTime: typeof s.endTime === 'string' && TIME_RE.test(s.endTime) ? s.endTime : null,
    // mesma logica das tarefas: sempre tem prioridade, padrao "media"
    priority: PRIORITIES.includes(s.priority)
      ? s.priority
      : DIFF_TO_PRIORITY[s.difficulty] || 'medium',
    pomodoros: typeof s.pomodoros === 'number' && s.pomodoros >= 0 ? Math.floor(s.pomodoros) : 0,
    timeSpentSeconds: num0(s.timeSpentSeconds)
  };
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error('Falha ao salvar "' + key + '" no localStorage:', err);
  }
}

// Guarda: tarefas "fantasma" do foco sem atrito (habit.ephemeral) nunca vao pro
// localStorage, mesmo que uma delas vaze pro array por engano.
const saveTasks = () => save(STORAGE_KEY, tasks.filter((t) => !t.ephemeral));
const saveArchive = () => save(ARCHIVE_KEY, archive);

function clampInt(value, lo, hi, dflt) {
  const n = Math.round(Number(value));
  return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : dflt;
}

function loadPrefs() {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return {
      view: VIEWS.includes(parsed.view) ? parsed.view : 'today',
      workspace:
        typeof parsed.workspace === 'string' && parsed.workspace ? parsed.workspace : 'general',
      taskGroup: TASK_GROUPS.includes(parsed.taskGroup) ? parsed.taskGroup : 'priority',
      calView: CAL_VIEWS.includes(parsed.calView) ? parsed.calView : 'month',
      calNDays: clampInt(parsed.calNDays, 2, 14, 3), // visao "N Dias" da agenda
      wideLayout: parsed.wideLayout === undefined ? true : Boolean(parsed.wideLayout),
      widgetTimeFilter: WIDGET_TIME_FILTERS.includes(parsed.widgetTimeFilter)
        ? parsed.widgetTimeFilter
        : 'today',
      // 'general' = visao master (todas as tarefas), igual a tela cheia.
      // Migra o antigo 'all' para 'general'.
      widgetWorkspaceFilter:
        typeof parsed.widgetWorkspaceFilter === 'string' &&
        parsed.widgetWorkspaceFilter &&
        parsed.widgetWorkspaceFilter !== 'all'
          ? parsed.widgetWorkspaceFilter
          : 'general',
      focusMin: clampInt(parsed.focusMin, 1, 180, 25),
      breakMin: clampInt(parsed.breakMin, 1, 60, 5)
    };
  } catch {
    return {
      view: 'today',
      workspace: 'general',
      taskGroup: 'priority',
      calView: 'month',
      calNDays: 3,
      wideLayout: true,
      widgetTimeFilter: 'today',
      widgetWorkspaceFilter: 'general',
      focusMin: 25,
      breakMin: 5
    };
  }
}

function savePrefs() {
  save(PREFS_KEY, prefs);
}

/* ---------------- workspaces ---------------- */

function loadWorkspaces() {
  try {
    const raw = localStorage.getItem(WORKSPACES_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (Array.isArray(parsed) && parsed.length) {
      const cleaned = parsed
        .filter((w) => w && typeof w.id === 'string' && typeof w.name === 'string')
        .map((w, i) => ({
          id: w.id,
          name: w.name,
          color: HEX_RE.test(w.color) ? w.color : WS_PALETTE[i % WS_PALETTE.length],
          // migracao: workspaces existentes sem essa prop caem em "variavel"
          importance: WORKSPACE_IMPORTANCE.includes(w.importance) ? w.importance : 'variable'
        }));
      if (cleaned.length) return cleaned;
    }
  } catch (err) {
    console.error('Falha ao ler workspaces:', err);
  }
  return DEFAULT_WORKSPACES.map((w) => ({ ...w }));
}

function wsColor(id) {
  const w = workspaces.find((x) => x.id === (id || 'general'));
  return (w && w.color) || '#64748b';
}

// Cor de um bloco no calendario: por workspace na visao Geral, por prioridade dentro de um workspace.
function entryColor(task) {
  return isMasterWorkspace() ? wsColor(task.workspace) : PRIORITY_HEX[task.priority];
}

function setWorkspaceColor(id, hex) {
  const w = workspaces.find((x) => x.id === id);
  if (!w || !HEX_RE.test(hex)) return;
  w.color = hex;
  saveWorkspaces();
  render();
}

function saveWorkspaces() {
  save(WORKSPACES_KEY, workspaces);
}

function currentWorkspace() {
  return workspaces.find((w) => w.id === prefs.workspace) || workspaces[0];
}

function setWorkspace(id) {
  if (!workspaces.some((w) => w.id === id)) return;
  prefs.workspace = id;
  wsOpen = false;
  closeDetails(); // o popover de criacao depende do workspace ativo
  collapseAll();
  savePrefs();
  render();
}

// Recolhe todas as tarefas (usado ao navegar entre abas/workspaces).
function collapseAll() {
  let changed = false;
  for (const t of tasks) {
    if (!t.collapsed) {
      t.collapsed = true;
      changed = true;
    }
  }
  if (changed) saveTasks();
}

function slugify(text) {
  const s = String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // remove acentos
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return s || 'ws';
}

function addWorkspace(name, color, importance) {
  const trimmed = String(name || '').trim();
  if (!trimmed) return;
  const base = slugify(trimmed);
  let id = base;
  let n = 2;
  while (workspaces.some((w) => w.id === id)) id = base + '-' + n++;
  const c = HEX_RE.test(color) ? color : WS_PALETTE[workspaces.length % WS_PALETTE.length];
  const imp = WORKSPACE_IMPORTANCE.includes(importance) ? importance : 'variable';
  workspaces.push({ id, name: trimmed, color: c, importance: imp });
  saveWorkspaces();
  prefs.workspace = id;
  wsOpen = false;
  savePrefs();
  render();
  toast('Workspace "' + trimmed + '" criado');
}

function updateWorkspace(id, patch) {
  const w = workspaces.find((x) => x.id === id);
  if (!w) return;
  const name = String((patch && patch.name) || '').trim();
  if (name) w.name = name;
  if (HEX_RE.test(patch && patch.color)) w.color = patch.color;
  if (WORKSPACE_IMPORTANCE.includes(patch && patch.importance)) w.importance = patch.importance;
  saveWorkspaces();
  render();
  toast('Workspace "' + w.name + '" atualizado');
}

// Exclui um workspace. "Geral" e a visao master e nunca pode ser excluido.
// Tarefas (ativas e arquivadas) vinculadas ao workspace excluido voltam pro
// "Geral" — o schema de tarefa nao aceita workspace nulo (sempre um id valido).
function removeWorkspace(id) {
  if (id === 'general') return;
  const w = workspaces.find((x) => x.id === id);
  if (!w) return;
  const confirmed = window.confirm('Deseja excluir este workspace?');
  // O dialogo nativo do Electron pode tirar o foco da janela (BrowserWindow sem
  // moldura); sem isso, o proximo input focado programaticamente (ex.: ao abrir
  // o modal de novo workspace) fica "travado" ate o usuario clicar na janela.
  window.focus();
  if (!confirmed) return;
  workspaces = workspaces.filter((x) => x.id !== id);
  saveWorkspaces();
  let tasksTouched = false;
  for (const t of tasks) if (t.workspace === id) { t.workspace = 'general'; tasksTouched = true; }
  if (tasksTouched) saveTasks();
  let archiveTouched = false;
  for (const t of archive) if (t.workspace === id) { t.workspace = 'general'; archiveTouched = true; }
  if (archiveTouched) saveArchive();
  if (prefs.workspace === id) {
    prefs.workspace = 'general';
    savePrefs();
  }
  render();
  toast('Workspace "' + w.name + '" excluido');
}

/* ---------------- modal: criar/editar workspace ---------------- */

function closeWorkspaceModal() {
  const el = document.getElementById('workspace-modal-backdrop');
  if (el) el.remove();
  document.removeEventListener('keydown', onWorkspaceModalKey);
}

function onWorkspaceModalKey(e) {
  if (e.key === 'Escape') closeWorkspaceModal();
}

// existing: workspace sendo editado, ou undefined/null para criar um novo.
function openWorkspaceModal(existing) {
  if (document.getElementById('workspace-modal-backdrop')) return;
  const editing = existing && workspaces.some((w) => w.id === existing.id) ? existing : null;

  const backdrop = document.createElement('div');
  backdrop.id = 'workspace-modal-backdrop';
  backdrop.className = 'fixed inset-0 z-[60] bg-slate-950/70 flex items-center justify-center p-4';
  backdrop.addEventListener('mousedown', (e) => {
    if (e.target === backdrop) closeWorkspaceModal();
  });

  const card = document.createElement('div');
  card.className =
    'w-full max-w-sm rounded-xl border border-slate-700 bg-slate-900 shadow-2xl p-5 space-y-4';

  const title = document.createElement('div');
  title.className = 'text-sm font-semibold text-slate-100';
  title.textContent = editing ? 'Editar workspace' : 'Novo workspace';

  const field = (labelText, controlEl) => {
    const w = document.createElement('div');
    w.className = 'space-y-1';
    const l = document.createElement('div');
    l.className = 'text-xs text-slate-400';
    l.textContent = labelText;
    w.append(l, controlEl);
    return w;
  };
  const ctlCls =
    'w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm ' +
    'text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500';

  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.placeholder = 'Ex.: Trabalho';
  nameInput.className = ctlCls;
  // reset explicito: o campo e sempre recriado do zero aqui, mas garante que
  // nenhum estado residual (disabled/readonly de uma sessao anterior) sobreviva
  nameInput.value = editing ? editing.name : '';
  nameInput.disabled = false;
  nameInput.readOnly = false;

  // ---- cor: paleta de swatches + input nativo p/ cor livre ----
  let color = editing && HEX_RE.test(editing.color)
    ? editing.color
    : WS_PALETTE[workspaces.length % WS_PALETTE.length];
  const swatches = document.createElement('div');
  swatches.className = 'flex flex-wrap items-center gap-2';
  const colorInput = document.createElement('input');
  colorInput.type = 'color';
  colorInput.title = 'Escolher cor livre';
  colorInput.className = 'h-6 w-8 rounded border border-slate-700 bg-slate-800 cursor-pointer';
  const paintSwatches = () => {
    for (const sw of swatches.querySelectorAll('button[data-hex]')) {
      sw.style.boxShadow = sw.dataset.hex === color ? '0 0 0 2px #0f172a, 0 0 0 4px ' + color : 'none';
    }
    colorInput.value = color;
  };
  for (const hex of WS_PALETTE) {
    const sw = document.createElement('button');
    sw.type = 'button';
    sw.dataset.hex = hex;
    sw.className = 'h-6 w-6 rounded-md transition-transform hover:scale-110';
    sw.style.background = hex;
    sw.addEventListener('click', () => {
      color = hex;
      paintSwatches();
    });
    swatches.appendChild(sw);
  }
  colorInput.addEventListener('input', () => {
    color = colorInput.value;
    paintSwatches();
  });
  swatches.appendChild(colorInput);
  paintSwatches();

  // ---- importancia padrao (base p/ a futura Matriz de Eisenhower) ----
  const impSelect = document.createElement('select');
  impSelect.className = ctlCls;
  for (const imp of WORKSPACE_IMPORTANCE) {
    const o = document.createElement('option');
    o.value = imp;
    o.textContent = WORKSPACE_IMPORTANCE_LABEL[imp];
    impSelect.appendChild(o);
  }
  impSelect.value =
    editing && WORKSPACE_IMPORTANCE.includes(editing.importance) ? editing.importance : 'variable';

  const actions = document.createElement('div');
  actions.className = 'flex justify-end gap-2 pt-1';
  const cancel = document.createElement('button');
  cancel.type = 'button';
  cancel.textContent = 'Cancelar';
  cancel.className =
    'text-xs px-3 py-1.5 rounded-md text-slate-400 hover:bg-slate-800 transition-colors';
  cancel.addEventListener('click', closeWorkspaceModal);
  const saveBtn = document.createElement('button');
  saveBtn.type = 'button';
  saveBtn.textContent = 'Salvar';
  saveBtn.className =
    'text-xs font-medium px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white transition-colors';
  const submit = () => {
    const name = nameInput.value.trim();
    if (!name) {
      nameInput.focus();
      return;
    }
    if (editing) {
      updateWorkspace(editing.id, { name, color, importance: impSelect.value });
    } else {
      addWorkspace(name, color, impSelect.value);
    }
    closeWorkspaceModal();
  };
  saveBtn.addEventListener('click', submit);
  nameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') submit();
  });

  actions.append(cancel, saveBtn);
  card.append(
    title,
    field('Nome', nameInput),
    field('Cor', swatches),
    field('Importancia', impSelect),
    actions
  );
  backdrop.appendChild(card);
  document.body.appendChild(backdrop);
  // window.focus() reclama o foco do SO antes de focar o campo — necessario
  // pra digitar funcionar logo apos um confirm()/prompt() nativo do Electron
  // (ex.: acabou de excluir outro workspace). O requestAnimationFrame extra e
  // um reforco defensivo pro caso do foco sincrono ainda nao "pegar".
  window.focus();
  nameInput.focus();
  requestAnimationFrame(() => nameInput.focus());
  document.addEventListener('keydown', onWorkspaceModalKey);
}

/* ---------------- modal: configuracoes (backup) ---------------- */

// Chaves de localStorage que compoem o estado inteiro do app — tudo que um
// backup precisa cobrir pra restaurar o Foco por completo em outra maquina.
const BACKUP_KEYS = [STORAGE_KEY, ARCHIVE_KEY, PREFS_KEY, WORKSPACES_KEY, HABITS_KEY];

// Gera um arquivo .json com todo o localStorage do app e dispara o download.
function exportBackup() {
  const payload = { app: 'foco', exportedAt: new Date().toISOString(), data: {} };
  for (const key of BACKUP_KEYS) {
    const raw = localStorage.getItem(key);
    if (raw === null) continue;
    try {
      payload.data[key] = JSON.parse(raw);
    } catch {
      // valor corrompido no localStorage: pula essa chave, nao trava o backup inteiro
    }
  }
  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'foco_backup_' + todayISO() + '.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  toast('Backup exportado');
}

// Abre o seletor de arquivo, le o .json escolhido, valida e restaura no
// localStorage — substitui TODOS os dados atuais, entao confirma antes.
function importBackup() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.addEventListener('change', () => {
    const file = input.files && input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      let parsed;
      try {
        parsed = JSON.parse(String(reader.result));
      } catch {
        toast('Arquivo de backup invalido (JSON malformado)');
        return;
      }
      const data = parsed && typeof parsed === 'object' ? parsed.data : null;
      // checagem defensiva minima: precisa ser um objeto com pelo menos
      // tarefas ou workspaces reconheciveis, senao nao injeta lixo no app.
      const looksValid =
        data &&
        typeof data === 'object' &&
        (Array.isArray(data[STORAGE_KEY]) || Array.isArray(data[WORKSPACES_KEY]));
      if (!looksValid) {
        toast('Arquivo de backup invalido ou incompleto');
        return;
      }
      const confirmed = window.confirm(
        'Atencao: Isso apagara os dados atuais e restaurara o backup selecionado. Deseja continuar?'
      );
      // mesmo cuidado pos-confirm() das outras janelas sem moldura (fase 14.20)
      window.focus();
      if (!confirmed) return;
      for (const key of BACKUP_KEYS) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          localStorage.setItem(key, JSON.stringify(data[key]));
        }
      }
      location.reload();
    };
    reader.readAsText(file);
  });
  input.click();
}

function closeSettingsModal() {
  const el = document.getElementById('settings-modal-backdrop');
  if (el) el.remove();
  document.removeEventListener('keydown', onSettingsModalKey);
}

function onSettingsModalKey(e) {
  if (e.key === 'Escape') closeSettingsModal();
}

function openSettingsModal() {
  if (document.getElementById('settings-modal-backdrop')) return;

  const backdrop = document.createElement('div');
  backdrop.id = 'settings-modal-backdrop';
  backdrop.className = 'fixed inset-0 z-[60] bg-slate-950/70 flex items-center justify-center p-4';
  backdrop.addEventListener('mousedown', (e) => {
    if (e.target === backdrop) closeSettingsModal();
  });

  const card = document.createElement('div');
  card.className =
    'w-full max-w-sm rounded-xl border border-slate-700 bg-slate-900 shadow-2xl p-5 space-y-4';

  const title = document.createElement('div');
  title.className = 'text-sm font-semibold text-slate-100';
  title.textContent = 'Configuracoes';

  const desc = document.createElement('div');
  desc.className = 'text-xs text-slate-400 leading-relaxed';
  desc.textContent =
    'O Foco guarda tudo localmente neste computador. Exporte um backup de vez em quando ' +
    'pra nao perder nada se o cache for limpo ou o app for desinstalado.';

  const actionBtnCls =
    'w-full flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors';

  const exportBtn = document.createElement('button');
  exportBtn.type = 'button';
  exportBtn.className = actionBtnCls + ' bg-indigo-600 hover:bg-indigo-500 text-white';
  exportBtn.append(icon('Download', { size: 15 }), document.createTextNode('Exportar Backup'));
  exportBtn.addEventListener('click', exportBackup);

  const importBtn = document.createElement('button');
  importBtn.type = 'button';
  importBtn.className =
    actionBtnCls + ' bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700';
  importBtn.append(icon('Upload', { size: 15 }), document.createTextNode('Importar Backup'));
  importBtn.addEventListener('click', importBackup);

  const actions = document.createElement('div');
  actions.className = 'flex justify-end pt-1';
  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.textContent = 'Fechar';
  closeBtn.className =
    'text-xs px-3 py-1.5 rounded-md text-slate-400 hover:bg-slate-800 transition-colors';
  closeBtn.addEventListener('click', closeSettingsModal);
  actions.appendChild(closeBtn);

  card.append(title, desc, exportBtn, importBtn, actions);
  backdrop.appendChild(card);
  document.body.appendChild(backdrop);
  window.focus();
  document.addEventListener('keydown', onSettingsModalKey);
}

// Filtro global. "Geral" e a visao master: mostra TUDO, de todos os workspaces.
function isMasterWorkspace() {
  return prefs.workspace === 'general';
}
function inWorkspace(item) {
  if (isMasterWorkspace()) return true;
  return (item.workspace || 'general') === prefs.workspace;
}
function visibleTasks() {
  return tasks.filter(inWorkspace);
}
function visibleArchive() {
  return archive.filter(inWorkspace);
}

/* ---------------- habitos ---------------- */

// history: { 'YYYY-MM-DD': { done: boolean, value: segundos } }
function normalizeHabit(h, idx) {
  h = h || {};
  const type = HABIT_TYPES.includes(h.type) ? h.type : 'manual';
  const history = {};
  if (h.history && typeof h.history === 'object') {
    for (const k of Object.keys(h.history)) {
      if (!DATE_RE.test(k)) continue;
      const e = h.history[k] || {};
      history[k] = { done: Boolean(e.done), value: num0(e.value) };
    }
  }
  return {
    id: typeof h.id === 'string' && h.id ? h.id : crypto.randomUUID(),
    name: String(h.name || '').trim() || 'Habito',
    type,
    target: type === 'auto_time' && Number.isFinite(h.target) && h.target > 0 ? Math.round(h.target) : null,
    color: HEX_RE.test(h.color) ? h.color : HABIT_PALETTE[(idx || 0) % HABIT_PALETTE.length],
    history,
    // quadro de post-its (notas soltas, posicao livre) da pagina de detalhes.
    // migracao: a antiga "notes" (string unica) vira o 1o post-it, se houver.
    postIts: Array.isArray(h.postIts)
      ? h.postIts
          .filter((p) => p && typeof p.id === 'string' && p.id)
          .map((p) => ({
            id: p.id,
            text: typeof p.text === 'string' ? p.text : '',
            x: Number.isFinite(p.x) ? p.x : 20,
            y: Number.isFinite(p.y) ? p.y : 20
          }))
      : typeof h.notes === 'string' && h.notes.trim()
      ? [{ id: 'p1', text: h.notes, x: 20, y: 20 }]
      : [],
    createdAt: typeof h.createdAt === 'number' ? h.createdAt : Date.now()
  };
}

function loadHabits() {
  try {
    const raw = localStorage.getItem(HABITS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map((h, i) => normalizeHabit(h, i)) : [];
  } catch (err) {
    console.error('Falha ao ler habitos:', err);
    return [];
  }
}

const saveHabits = () => save(HABITS_KEY, habits);

function getHabit(id) {
  return habits.find((h) => h.id === id);
}

function habitDoneOn(habit, iso) {
  const e = habit.history[iso];
  return Boolean(e && e.done);
}

function habitTargetSeconds(type, targetMinutes) {
  return type === 'auto_time' ? Math.max(1, Math.round(Number(targetMinutes) || 30)) * 60 : null;
}

function addHabit(name, type, targetMinutes, color) {
  const trimmed = String(name || '').trim();
  if (!trimmed) return;
  const t = HABIT_TYPES.includes(type) ? type : 'manual';
  habits.push(
    normalizeHabit(
      {
        name: trimmed,
        type: t,
        target: habitTargetSeconds(t, targetMinutes),
        color: HEX_RE.test(color) ? color : undefined,
        history: {},
        createdAt: Date.now()
      },
      habits.length
    )
  );
  saveHabits();
  render();
  toast('Habito "' + trimmed + '" criado');
}

function updateHabit(id, patch) {
  const habit = getHabit(id);
  if (!habit) return;
  const name = String(patch.name || '').trim();
  if (name) habit.name = name;
  if (HABIT_TYPES.includes(patch.type)) habit.type = patch.type;
  habit.target = habitTargetSeconds(habit.type, patch.targetMinutes);
  if (HEX_RE.test(patch.color)) habit.color = patch.color;
  saveHabits();
  render();
}

function removeHabit(id) {
  const habit = getHabit(id);
  if (!habit) return;
  const confirmed = window.confirm('Excluir o habito "' + habit.name + '"? O historico sera perdido.');
  // O dialogo nativo do Electron pode tirar o foco da janela (BrowserWindow sem
  // moldura); sem isso, o proximo input focado programaticamente fica "travado"
  // ate o usuario clicar na janela (mesmo fix aplicado em removeWorkspace).
  window.focus();
  if (!confirmed) return;
  habits = habits.filter((h) => h.id !== id);
  saveHabits();
  // limpa vinculos orfaos: qualquer tarefa (ativa ou arquivada) que apontava
  // para este habito perde o habitId.
  let tasksTouched = false;
  for (const t of tasks) if (t.habitId === id) { t.habitId = null; tasksTouched = true; }
  if (tasksTouched) saveTasks();
  let archiveTouched = false;
  for (const t of archive) if (t.habitId === id) { t.habitId = null; archiveTouched = true; }
  if (archiveTouched) saveArchive();
  render();
}

// Alterna a conclusao de uma data especifica no history do habito. Ao marcar
// manualmente como feito (false -> true), abre um mini-modal perguntando quanto
// tempo foi dedicado — so nesse fluxo manual; a conclusao automatica do auto_time
// (routeFocusTimeToHabit) nao passa por aqui, entao nunca abre o modal.
// OBS: window.prompt() nao funciona no Electron (falha silenciosa, sem dialogo) —
// por isso o modal proprio abaixo, no mesmo padrao visual do modal de habito.
function toggleHabitDay(id, iso) {
  const habit = getHabit(id);
  if (!habit || !DATE_RE.test(iso) || iso > todayISO()) return; // nao marca o futuro
  if (habitDoneOn(habit, iso)) {
    delete habit.history[iso];
    saveHabits();
    render();
    return;
  }
  const existingSeconds = num0((habit.history[iso] || {}).value);
  const defaultMinutes = existingSeconds > 0 ? Math.round((existingSeconds / 60) * 10) / 10 : '';
  openHabitTimeModal(defaultMinutes, (minutes) => {
    const h = getHabit(id); // re-busca: o habito pode ter sido excluido enquanto o modal estava aberto
    if (!h) return;
    h.history[iso] = { done: true, value: Math.round(minutes * 60) };
    saveHabits();
    render();
  });
}

/* ---------------- modal: tempo dedicado ao marcar um habito manualmente ---------------- */

function closeHabitTimeModal() {
  const el = document.getElementById('habit-time-modal-backdrop');
  if (el) el.remove();
  document.removeEventListener('keydown', onHabitTimeModalKey);
}

function onHabitTimeModalKey(e) {
  if (e.key === 'Escape') closeHabitTimeModal();
}

// Pergunta quantos minutos foram dedicados ao habito hoje. defaultMinutes (numero
// ou '') vem pre-preenchido quando o dia ja tinha tempo real (ex.: do Modo Foco),
// pra nao apagar esse tempo sem querer. onConfirm(minutes) so roda se o usuario
// confirmar; cancelar/fechar nao chama nada.
function openHabitTimeModal(defaultMinutes, onConfirm) {
  if (document.getElementById('habit-time-modal-backdrop')) return;

  const backdrop = document.createElement('div');
  backdrop.id = 'habit-time-modal-backdrop';
  backdrop.className = 'fixed inset-0 z-[60] bg-slate-950/70 flex items-center justify-center p-4';
  backdrop.addEventListener('mousedown', (e) => {
    if (e.target === backdrop) closeHabitTimeModal();
  });

  const card = document.createElement('div');
  card.className =
    'w-full max-w-xs rounded-xl border border-slate-700 bg-slate-900 shadow-2xl p-5 space-y-3';

  const label = document.createElement('div');
  label.className = 'text-xs text-slate-400';
  label.textContent = 'Quanto tempo (em minutos) voce dedicou a este habito?';

  // type="text" (nao "number") de proposito: um <input type="number"> recusa
  // digitar/atribuir virgula decimal (comum no pt-BR, ex.: "1,5"), o que quebraria
  // o parse abaixo. inputmode="decimal" ainda traz o teclado numerico no mobile.
  const input = document.createElement('input');
  input.type = 'text';
  input.inputMode = 'decimal';
  input.placeholder = '0';
  input.value = defaultMinutes === '' ? '' : String(defaultMinutes);
  input.className =
    'w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm ' +
    'text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500';

  const actions = document.createElement('div');
  actions.className = 'flex justify-end gap-2 pt-1';
  const cancel = document.createElement('button');
  cancel.type = 'button';
  cancel.textContent = 'Cancelar';
  cancel.className = 'text-xs px-3 py-1.5 rounded-md text-slate-400 hover:bg-slate-800 transition-colors';
  cancel.addEventListener('click', closeHabitTimeModal);
  const confirmBtn = document.createElement('button');
  confirmBtn.type = 'button';
  confirmBtn.textContent = 'Salvar';
  confirmBtn.className =
    'text-xs font-medium px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white transition-colors';
  const submit = () => {
    const raw = input.value.trim().replace(',', '.');
    const minutes = parseFloat(raw);
    closeHabitTimeModal();
    onConfirm(Number.isFinite(minutes) && minutes > 0 ? minutes : 0);
  };
  confirmBtn.addEventListener('click', submit);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submit();
    }
  });

  actions.append(cancel, confirmBtn);
  card.append(label, input, actions);
  backdrop.appendChild(card);
  document.body.appendChild(backdrop);
  input.focus();
  input.select();
  document.addEventListener('keydown', onHabitTimeModalKey);
}

// Varre o history de hoje para tras. currentStreak nao quebra se HOJE estiver em
// branco (ainda da tempo); quebra em qualquer dia vazio de ontem para tras.
function habitStreaks(habit) {
  const cursor = fromISO(todayISO());
  let current = 0;
  if (!habitDoneOn(habit, toISO(cursor))) cursor.setDate(cursor.getDate() - 1);
  let guard = 0;
  while (habitDoneOn(habit, toISO(cursor)) && guard++ < 5000) {
    current++;
    cursor.setDate(cursor.getDate() - 1);
  }

  const doneDays = Object.keys(habit.history)
    .filter((k) => habit.history[k] && habit.history[k].done)
    .sort();
  let best = 0;
  let run = 0;
  let prev = null;
  for (const iso of doneDays) {
    if (prev) {
      const nd = fromISO(prev);
      nd.setDate(nd.getDate() + 1);
      run = toISO(nd) === iso ? run + 1 : 1;
    } else {
      run = 1;
    }
    if (run > best) best = run;
    prev = iso;
  }
  return { current, best: Math.max(best, current) };
}

/* ---------------- datas ---------------- */

function todayISO() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
}

const WEEKDAYS_FULL = [
  'Domingo', 'Segunda', 'Terca', 'Quarta', 'Quinta', 'Sexta', 'Sabado'
];

// Rotulo "inteligente" do prazo na lista: Anteontem / Ontem / Hoje / Amanha /
// nome do dia (proximos 6 dias) / DD/MM (fora dessa janela).
function formatDueSmart(iso) {
  const today = todayISO();
  if (iso === today) return 'Hoje';
  const base = fromISO(today);
  const target = fromISO(iso);
  const diff = Math.round((startOfDay(target) - startOfDay(base)) / 86400000);
  if (diff === -1) return 'Ontem';
  if (diff === -2) return 'Anteontem';
  if (diff === 1) return 'Amanha';
  if (diff >= 2 && diff <= 7) return WEEKDAYS_FULL[target.getDay()];
  const [, m, d] = iso.split('-');
  return pad2(d) + '/' + pad2(m);
}

// Tarefa pendente com prazo estritamente anterior a hoje.
function isOverdue(task) {
  return !task.done && Boolean(task.dueDate) && task.dueDate < todayISO();
}

// Tarefa pendente que vence exatamente hoje.
function isDueToday(task) {
  return !task.done && task.dueDate === todayISO();
}

// Preenche um botao de prazo (tarefa ou subtarefa): cor + rotulo + icone de
// alerta quando esta no passado.
function fillDueChip(btn, iso, isDone) {
  const past = !isDone && iso < todayISO();
  btn.replaceChildren();
  btn.className =
    'shrink-0 inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded tabular-nums ' +
    (isDone
      ? 'bg-slate-700 text-slate-400'
      : past
        ? 'bg-red-500/25 text-red-200 ring-1 ring-red-500/40 font-medium'
        : iso === todayISO()
          ? 'bg-amber-500/20 text-amber-300'
          : 'bg-slate-700 text-slate-300');
  if (past) btn.appendChild(icon('TriangleAlert', { size: 11 }));
  btn.appendChild(document.createTextNode(formatDueSmart(iso)));
}

function toISO(dt) {
  const p = (n) => String(n).padStart(2, '0');
  return dt.getFullYear() + '-' + p(dt.getMonth() + 1) + '-' + p(dt.getDate());
}

function fromISO(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatDayMonth(iso) {
  const [, m, d] = iso.split('-');
  return Number(d) + '/' + Number(m);
}

/* ---------------- recorrencia (regras simples + personalizadas) ---------------- */

// Aceita string legada ou objeto; devolve sempre um valor valido ('once' se invalido).
function normalizeRecurrence(r) {
  if (typeof r === 'string') return RECURRENCES.includes(r) ? r : 'once';
  if (r && typeof r === 'object') {
    if (r.type === 'everyN') {
      const n = Math.floor(Number(r.n));
      return Number.isFinite(n) && n >= 1 && n <= EVERY_N_MAX ? { type: 'everyN', n } : 'once';
    }
    if (r.type === 'weekdays') {
      const days = Array.isArray(r.days)
        ? [...new Set(r.days.map(Number).filter((d) => Number.isInteger(d) && d >= 0 && d <= 6))].sort(
            (a, b) => a - b
          )
        : [];
      return days.length ? { type: 'weekdays', days } : 'once';
    }
  }
  return 'once';
}

function isRecurring(r) {
  return r != null && r !== 'once';
}

function recurrenceEquals(a, b) {
  if (typeof a === 'string' || typeof b === 'string') return a === b;
  if (!a || !b || a.type !== b.type) return false;
  if (a.type === 'everyN') return a.n === b.n;
  if (a.type === 'weekdays') return a.days.length === b.days.length && a.days.every((d, i) => d === b.days[i]);
  return false;
}

// Etiqueta amigavel: 'Semanal', 'A cada 3 dias', 'Seg, Qua, Sex', 'Todos os dias'...
function recurrenceLabel(r) {
  if (typeof r === 'string') return RECUR_LABEL[r] || 'Unica';
  if (r && r.type === 'everyN') return r.n === 1 ? 'Diaria' : 'A cada ' + r.n + ' dias';
  if (r && r.type === 'weekdays') {
    if (r.days.length === 7) return 'Todos os dias';
    return r.days.map((d) => WEEKDAYS[d]).join(', ');
  }
  return 'Unica';
}

// Ajusta "iso" para a primeira data valida da regra (so muda para 'weekdays').
function alignToRecurrence(iso, r) {
  if (!r || typeof r === 'string' || r.type !== 'weekdays' || !r.days.length) return iso;
  const set = new Set(r.days);
  const dt = fromISO(iso);
  let guard = 0;
  while (!set.has(dt.getDay()) && guard++ < 7) dt.setDate(dt.getDate() + 1);
  return toISO(dt);
}

// Proxima data de uma tarefa recorrente a partir de "iso".
function advanceDate(iso, recurrence) {
  const dt = fromISO(iso);
  if (recurrence === 'daily') {
    dt.setDate(dt.getDate() + 1);
  } else if (recurrence === 'weekly') {
    dt.setDate(dt.getDate() + 7);
  } else if (recurrence === 'monthly') {
    const day = dt.getDate();
    dt.setDate(1);
    dt.setMonth(dt.getMonth() + 1);
    const lastDay = new Date(dt.getFullYear(), dt.getMonth() + 1, 0).getDate();
    dt.setDate(Math.min(day, lastDay));
  } else if (recurrence && recurrence.type === 'everyN') {
    dt.setDate(dt.getDate() + recurrence.n);
  } else if (recurrence && recurrence.type === 'weekdays' && recurrence.days.length) {
    const set = new Set(recurrence.days);
    let guard = 0;
    do {
      dt.setDate(dt.getDate() + 1);
    } while (!set.has(dt.getDay()) && guard++ < 8);
  } else {
    dt.setDate(dt.getDate() + 1); // fallback defensivo
  }
  return toISO(dt);
}

function completedToday(t) {
  return t.completedAt != null && toISO(new Date(t.completedAt)) === todayISO();
}

function timeToMin(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}
function pad2(n) {
  return String(n).padStart(2, '0');
}
// #rrggbb + alpha (0..1) -> #rrggbbaa
function hexAlpha(hex, alpha) {
  const a = Math.round(Math.max(0, Math.min(1, alpha)) * 255);
  return hex + pad2(a.toString(16));
}
function startOfDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function calAnchor() {
  return calRef ? fromISO(calRef) : startOfDay(new Date());
}

// "Tarefas de hoje": pendentes (estrela / vencendo hoje / atrasadas) e tambem
// as que foram concluidas hoje, para aparecerem riscadas como confirmacao.
function isTodayTask(t) {
  if (t.done) return completedToday(t);
  if (t.today) return true;
  return Boolean(t.dueDate) && t.dueDate <= todayISO();
}

/* ---------------- filtros exclusivos do Modo Widget ---------------- */

// A tarefa cabe no filtro de tempo do widget? O widget NUNCA mostra concluidas —
// e uma visao estrita de pendencias. A estrela de "foco do dia" sempre entra.
function widgetTimeMatch(t, filter) {
  if (t.done) return false;
  if (filter === 'all') return true;
  if (t.today) return true;
  if (!t.dueDate) return false;
  const today = todayISO();
  if (filter === 'today') return t.dueDate <= today;
  const days = WIDGET_TIME_HORIZON[filter] || 0;
  const b = fromISO(today);
  const horizon = toISO(new Date(b.getFullYear(), b.getMonth(), b.getDate() + days));
  return t.dueDate <= horizon;
}

// Lista do widget: filtros proprios (tempo + workspace), independentes da tela cheia.
// 'Geral' e a visao master (mesma logica de inWorkspace/isMasterWorkspace): nao
// filtra por workspace e mostra tudo, inclusive tarefas de ITA/Pessoal/etc.
function widgetTasks() {
  const wf = prefs.widgetWorkspaceFilter;
  const specific = wf !== 'general' && workspaces.some((w) => w.id === wf) ? wf : null;
  return tasks.filter((t) => {
    if (specific && (t.workspace || 'general') !== specific) return false;
    return widgetTimeMatch(t, prefs.widgetTimeFilter);
  });
}

function byPriorityThenDue(a, b) {
  const w = PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority];
  if (w !== 0) return w;
  const da = a.dueDate || '9999-99-99';
  const db = b.dueDate || '9999-99-99';
  if (da !== db) return da < db ? -1 : 1;
  return a.createdAt - b.createdAt;
}

let toastTimer = null;
function toast(message) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = message;
  el.style.opacity = '1';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.style.opacity = '0';
  }, 2400);
}

/* ---------------- acoes: tarefas ---------------- */

function getTask(id) {
  return tasks.find((t) => t.id === id);
}

function addTask(text, opts = {}) {
  const trimmed = text.trim();
  if (!trimmed) return;
  const rec = normalizeRecurrence(opts.recurrence);
  const startTime = opts.startTime || null;
  const endTime = opts.endTime || null;
  // Tarefa recorrente sem data comeca hoje, para ja aparecer no calendario/hoje.
  // Idem para tarefa com horario definido (precisa de um dia na agenda).
  const hasTime = TIME_RE.test(startTime || '');
  let due = opts.dueDate || (isRecurring(rec) || hasTime ? todayISO() : null);
  if (due) due = alignToRecurrence(due, rec); // ex.: 'Seg/Qua/Sex' cai no proximo dia valido
  const priority = PRIORITIES.includes(opts.priority) ? opts.priority : 'medium';
  const ws = workspaces.some((w) => w.id === opts.workspace) ? opts.workspace : prefs.workspace;
  const habitId = habits.some((h) => h.id === opts.habitId) ? opts.habitId : null;
  tasks.push(
    normalizeTask({
      text: trimmed,
      recurrence: rec,
      dueDate: due,
      startTime,
      endTime,
      priority,
      workspace: ws, // contexto atual, ou o escolhido no popover quando em "Geral"
      habitId,
      createdAt: Date.now()
    })
  );
  saveTasks();
  render();
}

function setTaskTimes(id, start, end) {
  const task = getTask(id);
  if (!task) return;
  const nextStart = TIME_RE.test(start || '') ? start : null;
  const nextEnd = TIME_RE.test(end || '') ? end : null;
  if (nextStart === task.startTime && nextEnd === task.endTime) return; // nada mudou
  task.startTime = nextStart;
  task.endTime = nextEnd;
  if (task.startTime && !task.dueDate) task.dueDate = todayISO();
  saveTasks();
  render();
}

function toggleTask(id) {
  const task = getTask(id);
  if (!task) return;

  if (isRecurring(task.recurrence)) {
    if (task.done) reopenRecurringCycle(task);
    else completeRecurringCycle(task);
    return;
  }

  task.done = !task.done;
  task.completedAt = task.done ? Date.now() : null;
  saveTasks();
  render();
}

// Avanca a tarefa recorrente para a proxima ocorrencia >= hoje e zera o ciclo
// (subtarefas, pomodoros e tempo do ciclo). Os totais de vida sao preservados.
function activateNextOccurrence(task, fromDate) {
  const today = todayISO();
  let next = advanceDate(fromDate, task.recurrence);
  let guard = 0;
  while (next < today && guard++ < 400) next = advanceDate(next, task.recurrence);
  task.done = false;
  task.completedAt = null;
  task.dueDate = next;
  task.nextOccurrence = null;
  task.pomodoros = 0;
  task.timeSpentSeconds = 0;
  for (const s of task.subtasks) {
    s.done = false;
    s.pomodoros = 0;
    s.timeSpentSeconds = 0;
  }
  return next;
}

// Conclui o ciclo ATUAL de uma tarefa recorrente.
//  - No prazo: fica riscada hoje e renova no dia seguinte (ver rolloverRecurring).
//  - Atrasada: renovacao IMEDIATA — calcula a proxima ocorrencia e ja atualiza o
//    dueDate na tela, sem esperar a meia-noite.
function completeRecurringCycle(task) {
  const cycleDate = task.dueDate || todayISO();
  task.history.push(cycleDate);
  if (task.history.length > 90) task.history = task.history.slice(-90);
  task.recurrenceCount = (task.recurrenceCount || 0) + 1;
  task.completedAt = Date.now();

  if (cycleDate < todayISO()) {
    const next = activateNextOccurrence(task, cycleDate);
    saveTasks();
    render();
    toast('Concluida — proximo prazo ' + formatDayMonth(next));
  } else {
    task.done = true;
    task.nextOccurrence = advanceDate(cycleDate, task.recurrence);
    saveTasks();
    render();
    toast('Concluida — proxima em ' + formatDayMonth(task.nextOccurrence));
  }
}

// "Pular": perdeu o prazo e nao vai fazer este ciclo. Avanca o dueDate para a
// proxima ocorrencia SEM registrar conclusao (nada de history/recurrenceCount).
function skipRecurringCycle(id) {
  const task = getTask(id);
  if (!task || !isRecurring(task.recurrence)) return;
  const next = activateNextOccurrence(task, task.dueDate || todayISO());
  saveTasks();
  render();
  toast('Ciclo pulado — proximo prazo ' + formatDayMonth(next));
}

// Desfaz a conclusao do ciclo atual (clicou sem querer).
function reopenRecurringCycle(task) {
  task.done = false;
  task.completedAt = null;
  const cycleDate = task.dueDate || todayISO();
  if (task.history[task.history.length - 1] === cycleDate) task.history.pop();
  task.recurrenceCount = Math.max(0, task.recurrenceCount - 1);
  task.nextOccurrence = null;
  saveTasks();
  render();
}

// No DIA SEGUINTE a conclusao de uma recorrente, ativa a proxima ocorrencia:
// desmarca tudo (inclusive subtarefas) e ja mostra o prazo real futuro na lista.
function rolloverRecurring() {
  const today = todayISO();
  let changed = false;
  for (const task of tasks) {
    if (!isRecurring(task.recurrence) || !task.done || task.completedAt == null) continue;
    const completedDay = toISO(new Date(task.completedAt));
    if (today <= completedDay) continue; // ainda e o mesmo dia da conclusao

    let next = task.nextOccurrence || advanceDate(task.dueDate || today, task.recurrence);
    let guard = 0;
    while (next < today && guard++ < 400) next = advanceDate(next, task.recurrence);

    task.done = false;
    task.completedAt = null;
    task.dueDate = next;
    task.nextOccurrence = null;
    // nova instancia do ciclo: nasce zerada. Os totais de vida (pomodorosTotal /
    // timeSpentTotalSeconds) e o historico de datas ficam preservados.
    task.pomodoros = 0;
    task.timeSpentSeconds = 0;
    for (const s of task.subtasks) {
      s.done = false;
      s.pomodoros = 0;
      s.timeSpentSeconds = 0;
    }
    changed = true;
  }
  if (changed) saveTasks();
  return changed;
}

function scheduleMidnightRollover() {
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 20);
  setTimeout(
    () => {
      if (rolloverRecurring()) render();
      scheduleMidnightRollover();
    },
    Math.max(1000, next - now)
  );
}

function setRecurrence(id, r) {
  const task = getTask(id);
  if (!task) return;
  const rec = normalizeRecurrence(r);
  if (recurrenceEquals(task.recurrence, rec)) return;
  task.recurrence = rec;
  if (rec === 'once') {
    task.nextOccurrence = null;
  } else {
    const today = todayISO();
    const base = task.dueDate && task.dueDate >= today ? task.dueDate : today;
    task.dueDate = alignToRecurrence(base, rec);
    task.nextOccurrence = null;
  }
  saveTasks();
  render();
}

function removeTask(id) {
  tasks = tasks.filter((t) => t.id !== id);
  saveTasks();
  render();
}

function editTaskText(id, text) {
  const task = getTask(id);
  if (!task) return;
  const trimmed = text.trim();
  if (trimmed) task.text = trimmed;
  saveTasks();
  render();
}

function setPriority(id, p) {
  const task = getTask(id);
  if (!task || !PRIORITIES.includes(p) || task.priority === p) return;
  task.priority = p;
  saveTasks();
  render();
}

function setDueDate(id, iso) {
  const task = getTask(id);
  if (!task) return;
  task.dueDate = iso && DATE_RE.test(iso) ? iso : null;
  saveTasks();
  render();
}

function toggleToday(id) {
  const task = getTask(id);
  if (!task) return;
  const next = !task.today;
  for (const t of tasks) t.today = false; // no maximo uma tarefa como foco do dia
  task.today = next;
  saveTasks();
  render();
}

// Transfere a tarefa para outro workspace.
function setTaskWorkspace(id, wsId) {
  const task = getTask(id);
  const ws = workspaces.find((w) => w.id === wsId);
  if (!task || !ws || task.workspace === wsId) return;
  task.workspace = wsId;
  saveTasks();
  render();
  toast('Movida para "' + ws.name + '"');
}

// Vincula (ou desvincula) a tarefa a um habito.
function setTaskHabit(id, habitId) {
  const task = getTask(id);
  if (!task) return;
  const hid = habits.some((h) => h.id === habitId) ? habitId : null;
  if ((task.habitId || null) === hid) return;
  task.habitId = hid;
  saveTasks();
  render();
  const h = getHabit(hid);
  toast(h ? 'Vinculada ao habito "' + h.name + '"' : 'Desvinculada do habito');
}

function toggleCollapse(id) {
  const task = getTask(id);
  if (!task) return;
  task.collapsed = !task.collapsed;
  saveTasks();
  render();
}

function moveTask(sourceId, targetId, placeBefore) {
  if (sourceId === targetId) return;
  const from = tasks.findIndex((t) => t.id === sourceId);
  if (from === -1) return;
  const [moved] = tasks.splice(from, 1);
  let to = tasks.findIndex((t) => t.id === targetId);
  if (to === -1) {
    tasks.push(moved);
  } else {
    if (!placeBefore) to += 1;
    tasks.splice(to, 0, moved);
  }
  saveTasks();
  render();
}

/* ---------------- acoes: subtarefas ---------------- */

function addSubtask(taskId, text) {
  const task = getTask(taskId);
  if (!task) return;
  const trimmed = text.trim();
  if (!trimmed) return;
  task.subtasks.push(normalizeSub({ text: trimmed }));
  task.collapsed = false;
  saveTasks();
  render();
}

function toggleSubtask(taskId, subId) {
  const task = getTask(taskId);
  if (!task) return;
  const sub = task.subtasks.find((s) => s.id === subId);
  if (!sub) return;
  sub.done = !sub.done;
  saveTasks();
  render();
}

function editSubtaskText(taskId, subId, text) {
  const task = getTask(taskId);
  if (!task) return;
  const sub = task.subtasks.find((s) => s.id === subId);
  if (!sub) return;
  const trimmed = text.trim();
  if (trimmed) sub.text = trimmed;
  saveTasks();
  render();
}

function removeSubtask(taskId, subId) {
  const task = getTask(taskId);
  if (!task) return;
  task.subtasks = task.subtasks.filter((s) => s.id !== subId);
  saveTasks();
  render();
}

function getSub(taskId, subId) {
  const task = getTask(taskId);
  return task ? task.subtasks.find((s) => s.id === subId) : null;
}

function setSubtaskDue(taskId, subId, iso) {
  const sub = getSub(taskId, subId);
  if (!sub) return;
  sub.dueDate = iso && DATE_RE.test(iso) ? iso : null;
  saveTasks();
  render();
}

// Reagenda uma tarefa (subId nulo) ou um passo dela pra uma nova data/hora —
// usado pelo drag-and-drop de blocos na Agenda (arrastar = mover). Preserva
// estritamente a duracao original (diferenca entre inicio/termino atuais, ou
// o padrao de 1h se nao houver termino gravado): mover um bloco nunca deve
// esticar/encolher ele — so redimensionar pelas alcas (resizeEntry) muda a
// duracao de verdade.
function rescheduleEntry(taskId, subId, iso, time) {
  if (!DATE_RE.test(iso || '') || !TIME_RE.test(time || '')) return;
  const entry = subId ? getSub(taskId, subId) : getTask(taskId);
  if (!entry) return;
  const oldStart = timeToMin(entry.startTime || time);
  const oldEnd = entry.endTime ? timeToMin(entry.endTime) : oldStart + 60;
  const durationMin = Math.max(1, oldEnd - oldStart);
  const newStart = timeToMin(time);
  const newEnd = Math.min(23 * 60 + 59, newStart + durationMin);
  entry.dueDate = iso;
  entry.startTime = time;
  entry.endTime = pad2(Math.floor(newEnd / 60)) + ':' + pad2(newEnd % 60);
  saveTasks();
  render();
}

// Redimensiona (ajusta duracao) uma tarefa (subId nulo) ou um passo dela —
// usado pelas alcas de redimensionar (topo/base) dos blocos da Agenda. Ao
// contrario de rescheduleEntry, nunca muda a data/dia — so os horarios.
function resizeEntry(taskId, subId, startTime, endTime) {
  if (!TIME_RE.test(startTime || '') || !TIME_RE.test(endTime || '')) return;
  if (timeToMin(endTime) <= timeToMin(startTime)) return;
  const entry = subId ? getSub(taskId, subId) : getTask(taskId);
  if (!entry) return;
  entry.startTime = startTime;
  entry.endTime = endTime;
  saveTasks();
  render();
}

function setSubtaskPriority(taskId, subId, p) {
  const sub = getSub(taskId, subId);
  if (!sub || !PRIORITIES.includes(p) || sub.priority === p) return;
  sub.priority = p;
  saveTasks();
  render();
}

/* ---------------- acoes: arquivo ---------------- */

function archiveDone() {
  // apenas as concluidas do workspace atual
  const done = tasks.filter((t) => t.done && inWorkspace(t));
  if (done.length === 0) return;
  const ids = new Set(done.map((t) => t.id));
  for (const t of done) {
    if (!t.completedAt) t.completedAt = Date.now();
    t.today = false;
    archive.unshift(t);
  }
  tasks = tasks.filter((t) => !ids.has(t.id));
  saveTasks();
  saveArchive();
  render();
}

function restoreTask(id) {
  const i = archive.findIndex((t) => t.id === id);
  if (i === -1) return;
  const [t] = archive.splice(i, 1);
  t.done = false;
  t.completedAt = null;
  tasks.push(t);
  saveArchive();
  saveTasks();
  render();
}

function deleteArchived(id) {
  archive = archive.filter((t) => t.id !== id);
  saveArchive();
  render();
}

function emptyArchive() {
  const mine = visibleArchive();
  if (mine.length === 0) return;
  const scope = isMasterWorkspace() ? 'todo o arquivo' : 'o arquivo de "' + currentWorkspace().name + '"';
  if (!window.confirm('Esvaziar ' + scope + '? Isso apaga o historico permanentemente.')) return;
  const ids = new Set(mine.map((t) => t.id));
  archive = archive.filter((t) => !ids.has(t.id));
  saveArchive();
  render();
}

/* ---------------- timer / modo foco ---------------- */

function phaseDuration() {
  if (timer.phase === 'focus') return prefs.focusMin * 60;
  return (timer.isLong ? prefs.breakMin * 3 : prefs.breakMin) * 60;
}

// Grava no localStorage o tempo real focado desde o ultimo flush. Chamado so em
// momentos-chave (pausar / terminar ciclo / sair do foco), nunca no tick.
function flushFocusTime() {
  const started = timer.segStart;
  timer.segStart = null;
  if (started == null) return;
  const secs = (Date.now() - started) / 1000;
  if (!(secs > 0)) return;
  const task = currentFocusTask();
  if (!task) return;
  task.timeSpentSeconds = num0(task.timeSpentSeconds) + secs;
  task.timeSpentTotalSeconds = num0(task.timeSpentTotalSeconds) + secs;
  if (timer.subId) {
    const sub = task.subtasks.find((s) => s.id === timer.subId);
    if (sub) sub.timeSpentSeconds = num0(sub.timeSpentSeconds) + secs;
  }
  if (!task.ephemeral) saveTasks();
  routeFocusTimeToHabit(task, secs);
}

// Se a tarefa focada esta vinculada a um habito, credita o mesmo tempo no
// history do habito (dia de hoje). Silencioso: sem toast, sem prompt.
// Habitos com meta diaria (habit.target) sao marcados como concluidos
// automaticamente quando o tempo acumulado hoje atinge a meta.
function routeFocusTimeToHabit(task, secs) {
  if (!task || !task.habitId || !(secs > 0)) return;
  const habit = getHabit(task.habitId);
  if (!habit) return;
  const iso = todayISO();
  const prev = habit.history[iso] || { done: false, value: 0 };
  const value = num0(prev.value) + secs;
  let done = Boolean(prev.done); // nunca reverte um "concluido" ja marcado
  if (!done && habit.target > 0 && value >= habit.target) done = true;
  const autoCompleted = done && !prev.done;
  habit.history[iso] = { done, value };
  saveHabits();
  // se a aba Habitos estiver aberta, mostra o check/streak na hora
  if (autoCompleted && state.view === 'habits') render();
}

function enterFocus(taskId, subId = null) {
  const task = getTask(taskId);
  if (!task) return;
  flushFocusTime(); // fecha qualquer trecho pendente da tarefa anterior
  ephemeralFocusTask = null;
  if (subId && !task.subtasks.some((s) => s.id === subId)) subId = null;
  timer.taskId = taskId;
  timer.subId = subId;
  timer.phase = 'focus';
  timer.isLong = false;
  timer.cycle = 0;
  timer.running = false;
  timer.endsAt = null;
  timer.remaining = phaseDuration();
  state.view = 'focus';
  render();
}

// Foco sem atrito: inicia o Modo Foco direto de um habito, sem criar tarefa.
// A tarefa fantasma so existe em memoria; o tempo focado e creditado ao habito
// pela mesma rota de routeFocusTimeToHabit.
function enterFocusHabit(habitId) {
  const habit = getHabit(habitId);
  if (!habit) return;
  flushFocusTime();
  ephemeralFocusTask = {
    id: 'temp-habit-' + habit.id,
    text: habit.name,
    habitId: habit.id,
    ephemeral: true,
    done: false,
    subtasks: [],
    pomodoros: 0,
    pomodorosTotal: 0,
    timeSpentSeconds: 0,
    timeSpentTotalSeconds: 0
  };
  timer.taskId = ephemeralFocusTask.id;
  timer.subId = null;
  timer.phase = 'focus';
  timer.isLong = false;
  timer.cycle = 0;
  timer.running = false;
  timer.endsAt = null;
  timer.remaining = phaseDuration();
  state.view = 'focus';
  render();
}

function exitFocus() {
  timerPause();
  timer.taskId = null;
  timer.subId = null;
  ephemeralFocusTask = null;
  state.view = VIEWS.includes(prefs.view) ? prefs.view : 'today';
  document.title = 'Foco';
  collapseAll();
  render();
}

function startTicking() {
  if (!tickHandle) tickHandle = setInterval(onTick, 250);
}

function stopTicking() {
  if (tickHandle) {
    clearInterval(tickHandle);
    tickHandle = null;
  }
}

function onTick() {
  if (!timer.running) return;
  const rem = (timer.endsAt - Date.now()) / 1000;
  if (rem <= 0) {
    completePhase();
    return;
  }
  timer.remaining = rem;
  paintTimer();
}

function timerStart() {
  if (timer.running) {
    timerPause();
    return;
  }
  timer.endsAt = Date.now() + timer.remaining * 1000;
  timer.running = true;
  if (timer.phase === 'focus') timer.segStart = Date.now();
  ensureNotifyPermission();
  startTicking();
  paintTimer();
}

function timerPause() {
  if (timer.running) {
    timer.remaining = Math.max(0, (timer.endsAt - Date.now()) / 1000);
  }
  flushFocusTime();
  timer.running = false;
  timer.endsAt = null;
  stopTicking();
  paintTimer();
}

function timerReset() {
  flushFocusTime();
  timer.running = false;
  timer.endsAt = null;
  stopTicking();
  timer.remaining = phaseDuration();
  paintTimer();
}

function timerSkip() {
  completePhase();
}

function completePhase() {
  stopTicking();
  flushFocusTime(); // fecha o trecho de foco antes de trocar de fase
  const task = currentFocusTask();

  if (timer.phase === 'focus') {
    if (task) {
      task.pomodoros = (task.pomodoros || 0) + 1;
      task.pomodorosTotal = num0(task.pomodorosTotal) + 1;
      if (timer.subId) {
        const sub = task.subtasks.find((s) => s.id === timer.subId);
        if (sub) sub.pomodoros = (sub.pomodoros || 0) + 1;
      }
      if (!task.ephemeral) saveTasks();
    }
    timer.cycle += 1;
    timer.isLong = timer.cycle % LONG_BREAK_EVERY === 0;
    timer.phase = 'break';
    notify('Ciclo de foco concluido', timer.isLong ? 'Hora da pausa longa.' : 'Hora da pausa.');
  } else {
    timer.phase = 'focus';
    timer.isLong = false;
    notify('Pausa encerrada', 'De volta ao foco.');
  }

  timer.running = false;
  timer.endsAt = null;
  timer.remaining = phaseDuration();
  beep();

  if (state.view === 'focus') render();
}

function setDurations(focusMin, breakMin) {
  prefs.focusMin = clampInt(focusMin, 1, 180, prefs.focusMin);
  prefs.breakMin = clampInt(breakMin, 1, 60, prefs.breakMin);
  savePrefs();
  if (!timer.running) timer.remaining = phaseDuration();
  render();
}

function ensureNotifyPermission() {
  try {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  } catch {
    /* ignora */
  }
}

function notify(title, body) {
  try {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, silent: true });
    }
  } catch {
    /* ignora */
  }
}

function beep() {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = 'sine';
    osc.frequency.value = 660;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.2, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
    osc.start(now);
    osc.stop(now + 0.45);
  } catch {
    /* audio indisponivel */
  }
}

function fmtClock(totalSec) {
  const s = Math.max(0, Math.ceil(totalSec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return String(m).padStart(2, '0') + ':' + String(r).padStart(2, '0');
}

// Icone + rotulo do botao principal do cronometro, conforme esteja rodando.
function paintStartBtn(btn) {
  btn.replaceChildren(
    icon(timer.running ? 'Pause' : 'Play', { size: 16, fill: 'currentColor', stroke: 0 }),
    document.createTextNode(timer.running ? 'Pausar' : 'Iniciar')
  );
}

function paintTimer() {
  const disp = document.getElementById('timer-display');
  if (disp) disp.textContent = fmtClock(timer.remaining);
  const btn = document.getElementById('timer-startbtn');
  if (btn) paintStartBtn(btn);
  document.title = state.view === 'focus' ? fmtClock(timer.remaining) + ' - Foco' : 'Foco';
}

/* ---------------- render ---------------- */

// modo foco > widget (sobreposicao) > aba do menu lateral (today/tasks/agenda/habits/archive)
function layoutMode() {
  if (state.view === 'focus') return 'focus';
  if (overlayMode) return 'widget';
  return state.view;
}

/* ---------------- icones (Lucide, carregado via CDN) ---------------- */

const SVG_NS = 'http://www.w3.org/2000/svg';

// Cria um <svg> a partir do icone Lucide "name" (PascalCase, ex.: 'ArrowLeft').
// opts: { size, stroke, fill, cls }. A cor vem de currentColor (classe do pai).
function icon(name, opts = {}) {
  const svg = document.createElementNS(SVG_NS, 'svg');
  const size = opts.size || 16;
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', size);
  svg.setAttribute('height', size);
  svg.setAttribute('fill', opts.fill || 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', opts.stroke || 2);
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('aria-hidden', 'true');
  svg.classList.add('ico');
  if (opts.cls) for (const c of opts.cls.split(/\s+/)) if (c) svg.classList.add(c);
  const L = window.lucide;
  const node = L && (L[name] || (L.icons && L.icons[name]));
  if (node) {
    for (const part of node) {
      const child = document.createElementNS(SVG_NS, part[0]);
      const attrs = part[1] || {};
      for (const k in attrs) child.setAttribute(k, attrs[k]);
      svg.appendChild(child);
    }
  }
  return svg;
}

// Substitui o conteudo de "el" por um icone (para botoes que alternam de estado).
function setBtnIcon(el, name, opts) {
  el.replaceChildren(icon(name, opts));
}

function mkBtn(label, onClick, iconName) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className =
    'text-xs transition-colors whitespace-nowrap' +
    (iconName ? ' inline-flex items-center gap-1' : '');
  if (iconName) b.appendChild(icon(iconName, { size: 13 }));
  b.appendChild(document.createTextNode(label));
  b.addEventListener('click', onClick);
  return b;
}

function setView(v) {
  if (v === 'archive') {
    state.view = 'archive';
  } else if (VIEWS.includes(v)) {
    state.view = v;
    prefs.view = v;
    savePrefs();
  } else {
    return;
  }
  wsOpen = false;
  closeChoiceMenu();
  collapseAll(); // ao trocar de aba, tudo volta recolhido
  render();
}

function dateHeadline() {
  const s = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function pickTodayFocus() {
  const items = visibleTasks().filter(isTodayTask);
  return items.find((t) => t.today && !t.done) || items.find((t) => !t.done) || null;
}

function render() {
  rolloverRecurring();
  document.body.classList.toggle('overlay-mode', overlayMode);
  const mode = layoutMode();
  const wasWidget = lastLayout === 'widget';
  lastLayout = mode;
  document.body.dataset.layout = mode;

  const isFocus = mode === 'focus';
  const isWidget = mode === 'widget';
  const isArchive = mode === 'archive';
  const isToday = mode === 'today';
  const isTasks = mode === 'tasks' || isWidget; // widget = lista essencial
  const isAgenda = mode === 'agenda';
  const isHabits = mode === 'habits';
  const isActivities = mode === 'activities';

  const useList = isTasks || isArchive;
  const useDash = isToday || isAgenda || isHabits || isActivities;
  const chromeOff = isFocus || isWidget;

  sidebarEl.classList.toggle('hidden', chromeOff);
  appHeader.classList.toggle('hidden', chromeOff);
  widgetCfgBtn.hidden = !isWidget; // botao de filtros so no Modo Widget
  if (wasWidget && !isWidget) closeChoiceMenu(); // fecha o popover de filtros ao sair do widget
  if (!isHabits) closeHabitModal(); // o modal de habito so vive na aba Habitos
  if (!isHabits) closeHabitTimeModal(); // idem p/ o modal de tempo dedicado
  if (!isHabits) closeHabitDetailsModal(); // idem p/ o modal de detalhes/notas
  if (chromeOff) closeWorkspaceModal(); // idem p/ o modal de workspace (sidebar some no foco/widget)
  if (chromeOff) closeSettingsModal(); // idem p/ o modal de configuracoes (tambem so vive na sidebar)
  // largura contida (centralizada) so no miolo das abas Hoje e Tarefas
  contentMainEl.classList.toggle('contained', !prefs.wideLayout && (isToday || mode === 'tasks'));
  const formActive = isTasks || isToday; // form principal nas abas Tarefas e Hoje (widget = lista essencial)
  form.classList.toggle('hidden', !formActive);
  if (!formActive) closeDetails(); // popover de detalhes so vive nas abas Tarefas/Hoje
  // na aba Hoje a data e sempre "hoje" (implicita) — o campo Data some do popover
  taskDateRow.hidden = isToday;
  // reavalia o brilho da engrenagem: um valor de data que ficou preso no campo
  // escondido (setado numa troca de aba) nao pode mais acender o indicador
  if (formActive) updateDetailsIndicator();
  contextBar.classList.toggle('hidden', !(mode === 'tasks'));
  list.classList.toggle('hidden', !useList);
  dashboard.classList.toggle('hidden', !useDash);
  footerEl.classList.toggle('hidden', chromeOff || isAgenda || isHabits || isActivities);
  focusView.classList.toggle('hidden', !isFocus);

  if (isFocus) {
    headerActionEl.innerHTML = '';
    contextBar.innerHTML = '';
    renderFocus();
    paintTimer();
    return;
  }

  if (isWidget) {
    list.innerHTML = '';
    renderTaskList({ compact: true });
    return;
  }

  renderSidebar();
  renderViewHeader(mode);

  if (isArchive) {
    renderFooter(true);
    list.innerHTML = '';
    renderArchive();
    return;
  }

  renderFooter(false);

  if (mode === 'tasks') {
    renderTasksContextBar();
    list.innerHTML = '';
    renderTaskList({ grouped: true });
  } else if (isToday) {
    dashboard.innerHTML = '';
    renderTodayView();
  } else if (isAgenda) {
    dashboard.innerHTML = '';
    renderAgendaView();
  } else if (isHabits) {
    dashboard.innerHTML = '';
    renderHabitsView();
  } else if (isActivities) {
    dashboard.innerHTML = '';
    renderActivitiesView();
  }
}

/* ---------------- menu lateral (sidebar) ---------------- */

function renderSidebar() {
  sidebarEl.innerHTML = '';

  const brand = document.createElement('div');
  brand.className = 'px-3 pt-3 pb-1 text-sm font-semibold tracking-tight text-slate-200';
  brand.textContent = 'Foco';
  sidebarEl.appendChild(brand);

  sidebarEl.appendChild(buildWorkspacePicker());

  const nav = document.createElement('nav');
  nav.className = 'flex-1 min-h-0 overflow-y-auto px-2 pt-1 pb-2 space-y-0.5';
  for (const key of VIEWS) {
    const meta = VIEW_META[key];
    const active = state.view === key;
    const b = document.createElement('button');
    b.type = 'button';
    b.className =
      'w-full flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors ' +
      (active ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800');
    const ic = document.createElement('span');
    ic.className = 'shrink-0 flex items-center justify-center w-4 ' + (active ? '' : 'opacity-80');
    ic.appendChild(icon(meta.icon, { size: 15 }));
    const lb = document.createElement('span');
    lb.textContent = meta.label;
    b.append(ic, lb);
    b.addEventListener('click', () => setView(key));
    nav.appendChild(b);
  }
  sidebarEl.appendChild(nav);

  const foot = document.createElement('div');
  foot.className = 'border-t border-slate-800 px-2 py-2';
  const active = state.view === 'archive';
  const arch = document.createElement('button');
  arch.type = 'button';
  arch.className =
    'w-full flex items-center justify-between rounded-md px-2.5 py-1.5 text-xs transition-colors ' +
    (active
      ? 'bg-slate-800 text-slate-200'
      : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300');
  const al = document.createElement('span');
  al.className = 'inline-flex items-center gap-2';
  al.append(icon('Archive', { size: 13 }), document.createTextNode('Arquivo'));
  const ac = document.createElement('span');
  ac.className = 'tabular-nums';
  ac.textContent = String(visibleArchive().length);
  arch.append(al, ac);
  arch.addEventListener('click', () => setView('archive'));
  foot.appendChild(arch);

  const settingsBtn = document.createElement('button');
  settingsBtn.type = 'button';
  settingsBtn.className =
    'w-full flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs transition-colors ' +
    'text-slate-500 hover:bg-slate-800 hover:text-slate-300';
  settingsBtn.append(icon('Settings', { size: 13 }), document.createTextNode('Configuracoes'));
  settingsBtn.addEventListener('click', () => openSettingsModal());
  foot.appendChild(settingsBtn);

  sidebarEl.appendChild(foot);
}

function buildWorkspacePicker() {
  const wrap = document.createElement('div');
  wrap.className = 'px-2 pb-2 relative';

  const cw = currentWorkspace();
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className =
    'w-full flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-medium ' +
    'bg-indigo-600/15 border border-indigo-500/50 text-indigo-100 ' +
    'hover:bg-indigo-600/25 hover:border-indigo-400/70 transition-colors';
  const dot = document.createElement('span');
  dot.className = 'shrink-0 h-2 w-2 rounded-full';
  dot.style.background = cw.color || '#64748b';
  const nm = document.createElement('span');
  nm.className = 'truncate flex-1 text-left';
  nm.textContent = cw.name;
  const ch = document.createElement('span');
  ch.className = 'shrink-0 text-indigo-300/70 flex items-center';
  ch.appendChild(icon(wsOpen ? 'ChevronUp' : 'ChevronDown', { size: 13 }));
  btn.append(dot, nm, ch);
  btn.addEventListener('click', () => {
    wsOpen = !wsOpen;
    renderSidebar();
  });
  wrap.appendChild(btn);

  if (!wsOpen) return wrap;

  const backdrop = document.createElement('div');
  backdrop.className = 'fixed inset-0 z-10';
  backdrop.addEventListener('click', () => {
    wsOpen = false;
    renderSidebar();
  });
  wrap.appendChild(backdrop);

  const menu = document.createElement('div');
  menu.className =
    'absolute left-2 right-2 mt-1 z-20 rounded-md border border-slate-700 bg-slate-900 shadow-xl py-1';
  for (const w of workspaces) {
    const row = document.createElement('div');
    row.className =
      'w-full flex items-center gap-1 px-2 py-1.5 text-xs transition-colors group/ws ' +
      (w.id === prefs.workspace ? 'text-indigo-300' : 'text-slate-300 hover:bg-slate-800');

    const cd = document.createElement('button');
    cd.type = 'button';
    cd.className = 'shrink-0 h-3 w-3 rounded-full border border-slate-600 hover:scale-110 transition-transform';
    cd.style.background = w.color || '#64748b';
    cd.title = 'Cor do workspace';
    cd.addEventListener('click', (e) => {
      e.stopPropagation();
      openColorMenu(cd, w.color, (hex) => setWorkspaceColor(w.id, hex));
    });

    const name = document.createElement('button');
    name.type = 'button';
    name.className = 'flex-1 min-w-0 flex items-center gap-1.5 text-left';
    if (w.id === prefs.workspace) name.appendChild(icon('Check', { size: 12 }));
    const nmLabel = document.createElement('span');
    nmLabel.className = 'truncate';
    nmLabel.textContent = w.name;
    name.appendChild(nmLabel);
    name.addEventListener('click', () => setWorkspace(w.id));

    row.append(cd, name);

    // acoes (editar/excluir) — aparecem no hover; "Geral" nao pode ser excluido
    const acts = document.createElement('div');
    acts.className =
      'shrink-0 flex items-center gap-0.5 opacity-0 group-hover/ws:opacity-100 focus-within:opacity-100 transition-opacity';
    const edit = document.createElement('button');
    edit.type = 'button';
    edit.title = 'Editar workspace';
    edit.className = 'flex items-center justify-center text-slate-500 hover:text-slate-300 transition-colors';
    edit.appendChild(icon('Pencil', { size: 12 }));
    edit.addEventListener('click', (e) => {
      e.stopPropagation();
      openWorkspaceModal(w);
    });
    acts.appendChild(edit);
    if (w.id !== 'general') {
      const del = document.createElement('button');
      del.type = 'button';
      del.title = 'Excluir workspace';
      del.className = 'flex items-center justify-center text-slate-500 hover:text-red-400 transition-colors';
      del.appendChild(icon('Trash2', { size: 12 }));
      del.addEventListener('click', (e) => {
        e.stopPropagation();
        removeWorkspace(w.id);
      });
      acts.appendChild(del);
    }
    row.appendChild(acts);

    menu.appendChild(row);
  }

  const sep = document.createElement('div');
  sep.className = 'my-1 border-t border-slate-800';
  menu.appendChild(sep);

  // criar novo: abre o modal completo (Nome, Cor, Importancia)
  const newBtn = document.createElement('button');
  newBtn.type = 'button';
  newBtn.className =
    'w-full flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-400 ' +
    'hover:text-slate-200 hover:bg-slate-800 transition-colors';
  newBtn.append(icon('Plus', { size: 13 }), document.createTextNode('Novo workspace'));
  newBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openWorkspaceModal();
  });
  menu.appendChild(newBtn);
  wrap.appendChild(menu);
  return wrap;
}

function widthToggleBtn() {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'mr-1 flex items-center text-slate-500 hover:text-slate-300 transition-colors';
  b.appendChild(icon(prefs.wideLayout ? 'ChevronsRightLeft' : 'ChevronsLeftRight', { size: 15 }));
  b.title = prefs.wideLayout ? 'Centralizar conteudo' : 'Largura total';
  b.addEventListener('click', () => {
    prefs.wideLayout = !prefs.wideLayout;
    savePrefs();
    render();
  });
  return b;
}

function renderViewHeader(mode) {
  headerActionEl.innerHTML = '';
  headerActionEl.appendChild(widthToggleBtn());

  const wsName = currentWorkspace().name;
  const wsLabel = isMasterWorkspace() ? 'todos os workspaces' : '"' + wsName + '"';

  if (mode === 'archive') {
    viewTitleEl.textContent = 'Arquivo';
    subtitleEl.textContent = 'Concluidas · ' + wsLabel + '.';
    const back = mkBtn('Voltar', () => setView(prefs.view), 'ArrowLeft');
    back.className = 'text-xs text-slate-400 hover:text-slate-200 transition-colors inline-flex items-center gap-1';
    headerActionEl.appendChild(back);
    return;
  }

  viewTitleEl.textContent = VIEW_META[mode].title;
  const pending = visibleTasks().filter((t) => !t.done).length;
  subtitleEl.textContent =
    mode === 'today'
      ? dateHeadline()
      : mode === 'tasks'
        ? pending + ' pendente(s) · ' + wsLabel
        : mode === 'agenda'
          ? 'Calendario · ' + wsLabel
          : mode === 'habits'
            ? 'Grade semanal · marque cada dia e mantenha a ofensiva'
            : 'Em breve.';

  if (mode === 'today') {
    const pick = pickTodayFocus();
    if (pick) {
      const b = mkBtn('Focar', () => enterFocus(pick.id), 'Play');
      b.className = 'text-xs text-indigo-400 hover:text-indigo-300 transition-colors inline-flex items-center gap-1';
      headerActionEl.appendChild(b);
    }
  } else if (mode === 'habits') {
    headerActionEl.appendChild(habitAddButton());
  }
}

function renderTasksContextBar() {
  contextBar.innerHTML = '';

  const grp = mkBtn('Agrupar: ' + TASK_GROUP_LABEL[prefs.taskGroup], () => {
    const i = TASK_GROUPS.indexOf(prefs.taskGroup);
    prefs.taskGroup = TASK_GROUPS[(i + 1) % TASK_GROUPS.length];
    savePrefs();
    render();
  });
  grp.className = 'text-slate-400 hover:text-slate-200 transition-colors';
  contextBar.appendChild(grp);

  const doneCount = visibleTasks().filter((t) => t.done).length;
  if (doneCount > 0) {
    const arch = mkBtn('Arquivar ' + doneCount + ' concluida(s)', archiveDone);
    arch.className = 'ml-auto text-slate-500 hover:text-slate-300 transition-colors';
    contextBar.appendChild(arch);
  }
}

function renderFooter(archiveView) {
  footerEl.innerHTML = '';

  if (archiveView) {
    const count = document.createElement('span');
    count.textContent = visibleArchive().length + ' arquivada(s)';

    const empty = mkBtn('Esvaziar arquivo', emptyArchive);
    empty.className = 'hover:text-red-400 transition-colors';

    footerEl.append(count, empty);
    return;
  }

  const items = visibleTasks();
  const pending = items.filter((t) => !t.done).length;
  const count = document.createElement('span');
  count.textContent = pending + ' pendente(s) · ' + items.length + ' no total';
  footerEl.append(count);
}

/* ---------------- render: aba Tarefas (lista agrupada) ---------------- */

function byDateThenCreated(a, b) {
  const da = a.dueDate || '9999-99-99';
  const db = b.dueDate || '9999-99-99';
  if (da !== db) return da < db ? -1 : 1;
  return a.createdAt - b.createdAt;
}

function groupByPriority(items) {
  const accent = { high: 'bg-red-500', medium: 'bg-amber-500', low: 'bg-slate-500' };
  const pending = items.filter((t) => !t.done);
  // "Atrasadas" sai das faixas de prioridade e vai fixo no topo.
  const overdue = pending.filter(isOverdue).sort(byDateThenCreated);
  const onTrack = pending.filter((t) => !isOverdue(t));
  const groups = [];
  if (overdue.length) groups.push({ label: 'Atrasadas', accent: 'bg-red-600', items: overdue });
  for (const p of ['high', 'medium', 'low']) {
    groups.push({
      label: PRIORITY_LABEL[p],
      accent: accent[p],
      items: onTrack.filter((t) => t.priority === p).sort(byDateThenCreated)
    });
  }
  const done = items.filter((t) => t.done).sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));
  if (done.length) groups.push({ label: 'Concluidas', accent: 'bg-emerald-600', items: done });
  return groups;
}

function groupByDate(items) {
  const today = todayISO();
  const t = fromISO(today);
  const tomorrow = toISO(new Date(t.getFullYear(), t.getMonth(), t.getDate() + 1));
  const weekEnd = toISO(new Date(t.getFullYear(), t.getMonth(), t.getDate() + 7));
  const b = { overdue: [], today: [], tomorrow: [], week: [], later: [], none: [], done: [] };
  for (const it of items) {
    if (it.done) b.done.push(it);
    else if (!it.dueDate) b.none.push(it);
    else if (it.dueDate < today) b.overdue.push(it);
    else if (it.dueDate === today) b.today.push(it);
    else if (it.dueDate === tomorrow) b.tomorrow.push(it);
    else if (it.dueDate <= weekEnd) b.week.push(it);
    else b.later.push(it);
  }
  const s = (arr) => arr.sort(byPriorityThenDue);
  return [
    { label: 'Atrasadas', accent: 'bg-red-600', items: s(b.overdue) },
    { label: 'Hoje', accent: 'bg-amber-500', items: s(b.today) },
    { label: 'Amanha', accent: 'bg-indigo-500', items: s(b.tomorrow) },
    { label: 'Esta semana', accent: 'bg-sky-500', items: s(b.week) },
    { label: 'Depois', accent: 'bg-slate-500', items: s(b.later) },
    { label: 'Sem prazo', accent: 'bg-slate-700', items: s(b.none) },
    {
      label: 'Concluidas',
      accent: 'bg-emerald-600',
      items: b.done.sort((x, y) => (y.completedAt || 0) - (x.completedAt || 0))
    }
  ];
}

// Classifica tarefas nos 4 quadrantes da Matriz de Eisenhower. Override manual
// (task.matrixQuadrant, fixado pelo drag-and-drop) tem prioridade sobre o
// calculo automatico.
function deriveMatrixQuadrants(list) {
  const q = { 1: [], 2: [], 3: [], 4: [] };
  for (const t of list) {
    if (MATRIX_QUADRANTS.includes(t.matrixQuadrant)) {
      q[t.matrixQuadrant].push(t);
      continue;
    }
    const urgent = isOverdue(t) || Boolean(t.startTime);
    const ws = workspaces.find((w) => w.id === t.workspace);
    const important = t.priority === 'high' || Boolean(t.habitId) || (ws && ws.importance === 'important');
    let quadrant;
    if (urgent && important) quadrant = 1; // Fazer agora
    else if (!urgent && important) quadrant = 2; // Planejar
    else if (urgent && !important) quadrant = 3; // Resolver rapido
    else quadrant = 4; // Deixar para depois
    q[quadrant].push(t);
  }
  return q;
}

// Fixa manualmente o quadrante de uma tarefa (override do calculo automatico
// de deriveMatrixQuadrants) — usado pelo drag-and-drop da Matriz.
function setTaskMatrixQuadrant(id, qid) {
  const task = getTask(id);
  const q = String(qid);
  if (!task || !MATRIX_QUADRANTS.includes(q) || task.matrixQuadrant === q) return;
  task.matrixQuadrant = q;
  saveTasks();
  render();
}

function groupHeader(label, count, accent) {
  const isOverdueGroup = label === 'Atrasadas';
  const li = document.createElement('li');
  li.className = 'pt-3 first:pt-0 flex items-center gap-2';
  const t = document.createElement('span');
  t.className =
    'text-[11px] font-semibold uppercase tracking-wide flex items-center gap-1 ' +
    (isOverdueGroup ? 'text-red-400' : 'text-slate-400');
  if (isOverdueGroup) {
    t.appendChild(icon('TriangleAlert', { size: 12 }));
  } else {
    const dot = document.createElement('span');
    dot.className = 'h-2 w-2 rounded-full shrink-0 ' + (accent || 'bg-slate-600');
    li.appendChild(dot);
  }
  t.appendChild(document.createTextNode(label));
  const c = document.createElement('span');
  c.className = 'text-[10px] tabular-nums ' + (isOverdueGroup ? 'text-red-400/70' : 'text-slate-600');
  c.textContent = String(count);
  li.append(t, c);
  return li;
}

function renderTaskList(opts) {
  opts = opts || {};

  // Modo widget: usa os filtros proprios (tempo + workspace), nunca visibleTasks().
  if (opts.compact) {
    const items = widgetTasks();
    if (items.length === 0) {
      list.appendChild(emptyRow('Nada dentro dos filtros do widget.'));
      return;
    }
    const sorted = [...items].sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      return byPriorityThenDue(a, b);
    });
    for (const t of sorted) list.appendChild(createTaskEl(t, { compactish: true }));
    return;
  }

  const items = visibleTasks();
  if (items.length === 0) {
    list.appendChild(emptyRow('Nada em "' + currentWorkspace().name + '" ainda.'));
    return;
  }

  const groups = prefs.taskGroup === 'date' ? groupByDate(items) : groupByPriority(items);
  let shown = 0;
  for (const g of groups) {
    if (g.items.length === 0) continue;
    list.appendChild(groupHeader(g.label, g.items.length, g.accent));
    for (const t of g.items) list.appendChild(createTaskEl(t, { detailed: true }));
    shown += g.items.length;
  }
  if (shown === 0) list.appendChild(emptyRow('Nada em "' + currentWorkspace().name + '" ainda.'));
}

function renderArchive() {
  const items = visibleArchive();
  if (items.length === 0) {
    list.appendChild(emptyRow('Nada arquivado em "' + currentWorkspace().name + '".'));
    return;
  }
  for (const task of items) {
    list.appendChild(createArchiveEl(task));
  }
}

/* ---------------- render: abas placeholder (Atividades / Habitos) ---------------- */

function placeholderView(iconName, titleText, bodyText) {
  const wrap = document.createElement('div');
  wrap.className =
    'h-full flex flex-col items-center justify-center text-center gap-3 text-slate-500 px-4';
  const ic = document.createElement('div');
  ic.className = 'opacity-60';
  ic.appendChild(icon(iconName, { size: 40, stroke: 1.5 }));
  const t = document.createElement('div');
  t.className = 'text-sm font-semibold text-slate-400';
  t.textContent = titleText;
  const p = document.createElement('div');
  p.className = 'text-xs max-w-[18rem] leading-relaxed';
  p.textContent = bodyText;
  wrap.append(ic, t, p);
  dashboard.appendChild(wrap);
}

function renderActivitiesView() {
  placeholderView(
    'Activity',
    'Atividades',
    'Em breve: painel de estatisticas de produtividade — tempo focado por tarefa, ' +
      'por dia e por workspace, a partir do tempo rastreado no Modo Foco.'
  );
}

/* ---------------- render: aba Habitos ---------------- */

// Botao "Novo habito" — no cabecalho geral da aba (mesmo lugar do de Tarefas).
function habitAddButton() {
  const b = document.createElement('button');
  b.type = 'button';
  b.className =
    'inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-md ' +
    'bg-indigo-600 hover:bg-indigo-500 text-white transition-colors';
  b.append(icon('Plus', { size: 13 }), document.createTextNode('Novo habito'));
  b.addEventListener('click', () => openHabitModal());
  return b;
}

function habitsEmptyState() {
  const wrap = document.createElement('div');
  wrap.className = 'flex flex-col items-center text-center gap-2.5 text-slate-500 py-10 px-4';
  wrap.appendChild(icon('Flame', { size: 34, stroke: 1.5 }));
  const t = document.createElement('div');
  t.className = 'text-sm font-semibold text-slate-400';
  t.textContent = 'Nenhum habito ainda';
  const p = document.createElement('div');
  p.className = 'text-xs max-w-[20rem] leading-relaxed';
  p.textContent =
    'Crie um habito e marque cada dia na grade semanal para construir sua ofensiva.';
  const cta = document.createElement('button');
  cta.type = 'button';
  cta.className =
    'mt-1 inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md ' +
    'bg-indigo-600 hover:bg-indigo-500 text-white transition-colors';
  cta.append(icon('Plus', { size: 14 }), document.createTextNode('Novo habito'));
  cta.addEventListener('click', () => openHabitModal());
  wrap.append(t, p, cta);
  return wrap;
}

// Ultimos 7 dias em ISO: [hoje-6 ... hoje] (hoje sempre a direita).
function habitWeekDays() {
  const base = fromISO(todayISO());
  const out = [];
  for (let i = 6; i >= 0; i--) {
    out.push(toISO(new Date(base.getFullYear(), base.getMonth(), base.getDate() - i)));
  }
  return out;
}

// Segundos "alocados" na semana: valor real do history quando existe, senao
// assume HABIT_DEFAULT_DAY_SECONDS por dia concluido (calculo aproximado ate o
// Pomodoro alimentar os habitos de verdade).
function habitWeekSeconds(habit) {
  let s = 0;
  for (const iso of habitWeekDays()) {
    const e = habit.history[iso];
    if (!e) continue;
    // tempo real acumulado (Modo Foco) tem prioridade; senao, para um dia
    // concluido sem valor, assume a estimativa por dia.
    if (e.value > 0) s += e.value;
    else if (e.done) s += habit.target || HABIT_DEFAULT_DAY_SECONDS;
  }
  return s;
}

function formatHM(sec) {
  const m = Math.round(sec / 60);
  const h = Math.floor(m / 60);
  const mm = m % 60;
  if (h > 0) return h + 'h' + (mm ? ' ' + mm + 'm' : '');
  return mm + 'm';
}

function habitWeekHeader() {
  const row = document.createElement('div');
  row.className = 'habits-week-row habits-week-head';
  row.appendChild(document.createElement('div')); // coluna nome
  row.appendChild(document.createElement('div')); // coluna streak
  const days = document.createElement('div');
  days.className = 'hb-week';
  const today = todayISO();
  for (const iso of habitWeekDays()) {
    const c = document.createElement('div');
    c.className = 'hb-daylabel' + (iso === today ? ' hb-daylabel-today' : '');
    c.textContent = WEEKDAY_LETTERS[fromISO(iso).getDay()];
    days.appendChild(c);
  }
  row.appendChild(days);
  row.appendChild(document.createElement('div')); // coluna acoes
  return row;
}

function habitRow(habit) {
  const { current } = habitStreaks(habit);
  const row = document.createElement('div');
  row.className = 'habits-week-row group/habit';

  // ---- nome (com pontinho da cor) ----
  const nameCell = document.createElement('div');
  nameCell.className = 'min-w-0 flex items-center gap-2';
  const dot = document.createElement('span');
  dot.className = 'shrink-0 h-2.5 w-2.5 rounded-sm';
  dot.style.background = habit.color;
  const nameInner = document.createElement('div');
  nameInner.className = 'min-w-0';
  const nm = document.createElement('button');
  nm.type = 'button';
  nm.className =
    'block max-w-full truncate text-sm font-medium text-slate-100 text-left hover:text-white transition-colors';
  nm.textContent = habit.name;
  nm.title = 'Ver detalhes do habito';
  nm.addEventListener('click', () => openHabitDetailsModal(habit));
  nameInner.appendChild(nm);
  if (habit.type === 'auto_time' && habit.target) {
    const sub = document.createElement('div');
    sub.className = 'text-[10px] text-slate-500 mt-0.5';
    sub.textContent = 'meta ' + Math.round(habit.target / 60) + ' min/dia';
    nameInner.appendChild(sub);
  }
  nameCell.append(dot, nameInner);
  row.appendChild(nameCell);

  // ---- streak (fogo laranja + numero) — só aparece a partir de 2 dias seguidos ----
  const streakCell = document.createElement('div');
  streakCell.className = 'flex items-center gap-1.5 tabular-nums';
  if (current >= 2) {
    streakCell.appendChild(icon('Flame', { size: 15, fill: 'currentColor', cls: 'text-orange-500' }));
    const num = document.createElement('span');
    num.className = 'text-sm font-semibold text-slate-200';
    num.textContent = String(current);
    streakCell.appendChild(num);
  }
  row.appendChild(streakCell);

  // ---- grade de 7 dias (botoes de acao, pintados com a cor do habito) ----
  const week = document.createElement('div');
  week.className = 'hb-week';
  const today = todayISO();
  for (const iso of habitWeekDays()) {
    const done = habitDoneOn(habit, iso);
    const cell = document.createElement('button');
    cell.type = 'button';
    cell.className = 'hb-cell ' + (done ? 'done' : 'pending');
    if (done) {
      cell.style.background = habit.color;
      cell.appendChild(icon('Check', { size: 18 }));
    }
    cell.title =
      formatDayMonth(iso) + (iso === today ? ' (hoje)' : '') + (done ? ' · concluido' : '');
    cell.addEventListener('click', () => toggleHabitDay(habit.id, iso));
    week.appendChild(cell);
  }
  row.appendChild(week);

  // ---- acoes (coluna fixa de 3.75rem, alinhada a direita) ----
  const acts = document.createElement('div');
  acts.className = 'flex items-center justify-end gap-1';

  // foco sem atrito: inicia o Modo Foco direto do habito — sempre visivel
  const play = document.createElement('button');
  play.type = 'button';
  play.title = 'Focar neste habito';
  play.className =
    'flex items-center justify-center h-6 w-6 rounded-md text-slate-500 ' +
    'hover:text-indigo-300 hover:bg-indigo-500/10 transition-colors';
  play.appendChild(icon('Play', { size: 13 }));
  play.addEventListener('click', () => enterFocusHabit(habit.id));

  // editar / excluir — aparecem no hover
  const hoverActs = document.createElement('div');
  hoverActs.className =
    'flex items-center gap-0.5 opacity-0 group-hover/habit:opacity-100 focus-within:opacity-100 transition-opacity';
  const edit = document.createElement('button');
  edit.type = 'button';
  edit.title = 'Editar habito';
  edit.className = 'flex items-center justify-center text-slate-600 hover:text-slate-300 transition-colors';
  edit.appendChild(icon('Pencil', { size: 13 }));
  edit.addEventListener('click', () => openHabitModal(habit));
  const del = document.createElement('button');
  del.type = 'button';
  del.title = 'Excluir habito';
  del.className = 'flex items-center justify-center text-slate-600 hover:text-red-400 transition-colors';
  del.appendChild(icon('Trash2', { size: 13 }));
  del.addEventListener('click', () => removeHabit(habit.id));
  hoverActs.append(edit, del);

  // editar/excluir a esquerda (surgem no hover), Play fixo na borda direita
  acts.append(hoverActs, play);
  row.appendChild(acts);

  return row;
}

// Coluna da direita: barras horizontais de tempo alocado na semana.
// Cada item e uma linha flex: [nome] [barra grossa que preenche] [tempo].
function habitAllocPanel() {
  const panel = document.createElement('div');
  panel.className = 'habit-panel';
  const title = document.createElement('div');
  title.className = 'habit-panel-title';
  title.textContent = 'Tempo alocado (semana)';
  panel.appendChild(title);

  const rows = habits
    .map((h) => ({ habit: h, secs: habitWeekSeconds(h) }))
    .sort((a, b) => b.secs - a.secs);
  const max = rows.reduce((m, r) => Math.max(m, r.secs), 0);

  if (max === 0) {
    const empty = document.createElement('div');
    empty.className = 'text-xs text-slate-500 leading-relaxed';
    empty.textContent = habits.length
      ? 'Nenhum tempo registrado nesta semana. Marque os dias na grade para alimentar o grafico.'
      : 'Crie habitos para ver o tempo alocado da semana.';
    panel.appendChild(empty);
    return panel;
  }

  const listEl = document.createElement('div');
  listEl.className = 'alloc-list';
  for (const { habit, secs } of rows) {
    const r = document.createElement('div');
    r.className = 'alloc-row';

    const nm = document.createElement('span');
    nm.className = 'alloc-name';
    nm.textContent = habit.name;
    nm.title = habit.name;

    const track = document.createElement('div');
    track.className = 'alloc-track';
    const fill = document.createElement('div');
    fill.className = 'alloc-fill';
    fill.style.width = Math.max(4, Math.round((secs / max) * 100)) + '%';
    // cor individual do habito (hex salvo no localStorage)
    fill.style.background = HEX_RE.test(habit.color) ? habit.color : '#6366f1';
    track.appendChild(fill);

    const val = document.createElement('span');
    val.className = 'alloc-time';
    val.textContent = formatHM(secs);

    r.append(nm, track, val);
    listEl.appendChild(r);
  }
  panel.appendChild(listEl);
  return panel;
}

function renderHabitsView() {
  const wrap = document.createElement('div');
  wrap.className = 'flex flex-col h-full min-h-0 min-w-0';

  const scroll = document.createElement('div');
  scroll.className = 'flex-1 min-h-0 min-w-0 overflow-y-auto pr-1';

  if (habits.length === 0) {
    const solo = document.createElement('div');
    solo.className = 'habit-panel max-w-lg';
    solo.appendChild(habitsEmptyState());
    scroll.appendChild(solo);
    wrap.appendChild(scroll);
    dashboard.appendChild(wrap);
    return;
  }

  const dash = document.createElement('div');
  dash.className = 'habits-dash';

  // ---- coluna esquerda: grade semanal ----
  const left = document.createElement('div');
  left.className = 'habit-panel';
  const leftTitle = document.createElement('div');
  leftTitle.className = 'habit-panel-title';
  leftTitle.textContent = 'Habitos da semana';
  left.appendChild(leftTitle);
  const gridScroll = document.createElement('div');
  gridScroll.className = 'habits-week-scroll -mx-1 px-1';
  const grid = document.createElement('div');
  grid.className = 'habits-week';
  grid.appendChild(habitWeekHeader());
  for (const habit of habits) grid.appendChild(habitRow(habit));
  gridScroll.appendChild(grid);
  left.appendChild(gridScroll);
  dash.appendChild(left);

  // ---- coluna direita: tempo alocado ----
  dash.appendChild(habitAllocPanel());

  scroll.appendChild(dash);
  wrap.appendChild(scroll);
  dashboard.appendChild(wrap);
}

/* ---------------- modal: novo habito ---------------- */

function closeHabitModal() {
  const el = document.getElementById('habit-modal-backdrop');
  if (el) el.remove();
  document.removeEventListener('keydown', onHabitModalKey);
}

function onHabitModalKey(e) {
  if (e.key === 'Escape') closeHabitModal();
}

function openHabitModal(existing) {
  if (document.getElementById('habit-modal-backdrop')) return;
  const editing = existing && getHabit(existing.id) ? existing : null;

  const backdrop = document.createElement('div');
  backdrop.id = 'habit-modal-backdrop';
  backdrop.className =
    'fixed inset-0 z-[60] bg-slate-950/70 flex items-center justify-center p-4';
  backdrop.addEventListener('mousedown', (e) => {
    if (e.target === backdrop) closeHabitModal();
  });

  const card = document.createElement('div');
  card.className =
    'w-full max-w-sm rounded-xl border border-slate-700 bg-slate-900 shadow-2xl p-5 space-y-4';

  const title = document.createElement('div');
  title.className = 'text-sm font-semibold text-slate-100';
  title.textContent = editing ? 'Editar habito' : 'Novo habito';

  const field = (labelText, controlEl) => {
    const w = document.createElement('div');
    w.className = 'space-y-1';
    const l = document.createElement('div');
    l.className = 'text-xs text-slate-400';
    l.textContent = labelText;
    w.append(l, controlEl);
    return w;
  };
  const ctlCls =
    'w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm ' +
    'text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500';

  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.placeholder = 'Ex.: Treino na Selfit';
  nameInput.className = ctlCls;
  nameInput.value = editing ? editing.name : '';

  const typeSelect = document.createElement('select');
  typeSelect.className = ctlCls;
  for (const tp of HABIT_TYPES) {
    const o = document.createElement('option');
    o.value = tp;
    o.textContent = HABIT_TYPE_LABEL[tp];
    typeSelect.appendChild(o);
  }
  typeSelect.value = editing ? editing.type : 'manual';

  const targetInput = document.createElement('input');
  targetInput.type = 'number';
  targetInput.min = '1';
  targetInput.max = '1440';
  targetInput.value = String(editing && editing.target ? Math.round(editing.target / 60) : 30);
  targetInput.className = ctlCls;
  const targetField = field('Alvo diario (minutos)', targetInput);
  targetField.hidden = typeSelect.value !== 'auto_time';
  typeSelect.addEventListener('change', () => {
    targetField.hidden = typeSelect.value !== 'auto_time';
  });

  // ---- seletor de cor: paleta de swatches + input nativo p/ cor livre
  // (mesmo padrao do modal de workspace) ----
  let color = editing && HEX_RE.test(editing.color)
    ? editing.color
    : HABIT_PALETTE[habits.length % HABIT_PALETTE.length];
  const swatches = document.createElement('div');
  swatches.className = 'flex flex-wrap items-center gap-2';
  const colorInput = document.createElement('input');
  colorInput.type = 'color';
  colorInput.title = 'Escolher cor livre';
  colorInput.className = 'h-6 w-8 rounded border border-slate-700 bg-slate-800 cursor-pointer';
  const paintSwatches = () => {
    for (const sw of swatches.querySelectorAll('button[data-hex]')) {
      sw.style.boxShadow = sw.dataset.hex === color ? '0 0 0 2px #0f172a, 0 0 0 4px ' + color : 'none';
    }
    colorInput.value = color;
  };
  for (const hex of HABIT_PALETTE) {
    const sw = document.createElement('button');
    sw.type = 'button';
    sw.dataset.hex = hex;
    sw.className = 'h-6 w-6 rounded-md transition-transform hover:scale-110';
    sw.style.background = hex;
    sw.addEventListener('click', () => {
      color = hex;
      paintSwatches();
    });
    swatches.appendChild(sw);
  }
  colorInput.addEventListener('input', () => {
    color = colorInput.value;
    paintSwatches();
  });
  swatches.appendChild(colorInput);
  paintSwatches();

  const actions = document.createElement('div');
  actions.className = 'flex justify-end gap-2 pt-1';
  const cancel = document.createElement('button');
  cancel.type = 'button';
  cancel.textContent = 'Cancelar';
  cancel.className =
    'text-xs px-3 py-1.5 rounded-md text-slate-400 hover:bg-slate-800 transition-colors';
  cancel.addEventListener('click', closeHabitModal);
  const create = document.createElement('button');
  create.type = 'button';
  create.textContent = editing ? 'Salvar' : 'Criar habito';
  create.className =
    'text-xs font-medium px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white transition-colors';
  const submit = () => {
    const name = nameInput.value.trim();
    if (!name) {
      nameInput.focus();
      return;
    }
    if (editing) {
      updateHabit(editing.id, {
        name,
        type: typeSelect.value,
        targetMinutes: targetInput.value,
        color
      });
    } else {
      addHabit(name, typeSelect.value, targetInput.value, color);
    }
    closeHabitModal();
  };
  create.addEventListener('click', submit);
  nameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') submit();
  });

  actions.append(cancel, create);
  card.append(
    title,
    field('Nome', nameInput),
    field('Tipo', typeSelect),
    targetField,
    field('Cor', swatches),
    actions
  );
  backdrop.appendChild(card);
  document.body.appendChild(backdrop);
  nameInput.focus();
  document.addEventListener('keydown', onHabitModalKey);
}

/* ---------------- modal: detalhes do habito (quadro de post-its) ---------------- */

// Garante que o texto de um post-it foi gravado antes de fechar/reler.
function flushPostItText(textarea) {
  const h = getHabit(textarea.dataset.habitId);
  const p = h && h.postIts.find((x) => x.id === textarea.dataset.postitId);
  if (!p || p.text === textarea.value) return;
  p.text = textarea.value;
  saveHabits();
}

function closeHabitDetailsModal() {
  const el = document.getElementById('habit-details-modal-backdrop');
  if (!el) return;
  // flush final de todos os post-its antes de fechar (o autosave ja roda a
  // cada tecla, isso e so uma rede de seguranca)
  for (const ta of el.querySelectorAll('textarea[data-postit-id]')) flushPostItText(ta);
  el.remove();
  document.removeEventListener('keydown', onHabitDetailsModalKey);
}

function onHabitDetailsModalKey(e) {
  if (e.key === 'Escape') closeHabitDetailsModal();
}

// Move um post-it livremente dentro do quadro (mousedown na alca -> mousemove
// no documento -> mouseup grava x/y). Clique/digitação na textarea nao inicia
// o arraste porque a alca e um elemento separado, fora da textarea.
function makePostItDraggable(handle, cardEl, boardEl, postIt, habitId) {
  let startX = 0;
  let startY = 0;
  let origLeft = 0;
  let origTop = 0;

  const onMouseMove = (e) => {
    const maxLeft = Math.max(0, boardEl.clientWidth - cardEl.offsetWidth);
    const maxTop = Math.max(0, boardEl.clientHeight - cardEl.offsetHeight);
    const left = Math.min(maxLeft, Math.max(0, origLeft + (e.clientX - startX)));
    const top = Math.min(maxTop, Math.max(0, origTop + (e.clientY - startY)));
    cardEl.style.left = left + 'px';
    cardEl.style.top = top + 'px';
  };
  const onMouseUp = () => {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    const h = getHabit(habitId);
    const p = h && h.postIts.find((x) => x.id === postIt.id);
    if (p) {
      p.x = parseInt(cardEl.style.left, 10) || 0;
      p.y = parseInt(cardEl.style.top, 10) || 0;
      saveHabits();
    }
  };
  handle.addEventListener('mousedown', (e) => {
    e.preventDefault();
    startX = e.clientX;
    startY = e.clientY;
    origLeft = cardEl.offsetLeft;
    origTop = cardEl.offsetTop;
    cardEl.style.zIndex = String(Date.now() % 1e6); // traz pra frente enquanto arrasta
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  });
}

// Monta o card de um post-it (alca de arrastar + excluir + textarea) e liga o
// arraste. boardEl e usado so pra calcular os limites do quadro.
function createPostItEl(postIt, habitId, boardEl) {
  const card = document.createElement('div');
  card.className = 'absolute w-[180px] h-[150px] rounded-md shadow-md flex flex-col overflow-hidden';
  card.style.left = postIt.x + 'px';
  card.style.top = postIt.y + 'px';
  card.style.background = '#fef08a';

  const handle = document.createElement('div');
  handle.className =
    'flex items-center justify-end h-5 px-1 shrink-0 cursor-grab active:cursor-grabbing';
  handle.style.background = 'rgba(0,0,0,0.08)';
  handle.title = 'Arraste para mover';

  const del = document.createElement('button');
  del.type = 'button';
  del.title = 'Excluir post-it';
  del.className =
    'flex items-center justify-center h-4 w-4 rounded text-[#78350f] hover:text-red-700 hover:bg-black/10 transition-colors';
  del.appendChild(icon('X', { size: 11 }));
  del.addEventListener('mousedown', (e) => e.stopPropagation()); // nao inicia o arraste
  del.addEventListener('click', () => {
    const h = getHabit(habitId);
    if (h) h.postIts = h.postIts.filter((p) => p.id !== postIt.id);
    saveHabits();
    card.remove();
  });
  handle.appendChild(del);

  const textarea = document.createElement('textarea');
  textarea.dataset.habitId = habitId;
  textarea.dataset.postitId = postIt.id;
  textarea.value = postIt.text;
  textarea.placeholder = 'Escreva aqui...';
  textarea.className =
    'flex-1 min-h-0 w-full resize-none border-0 bg-transparent text-[#422006] ' +
    'placeholder-[#78350f]/60 text-xs leading-snug p-2 focus:outline-none';
  textarea.addEventListener('mousedown', (e) => e.stopPropagation()); // clicar/digitar nao arrasta
  const autosave = () => flushPostItText(textarea);
  textarea.addEventListener('input', autosave);
  textarea.addEventListener('blur', autosave);

  card.append(handle, textarea);
  makePostItDraggable(handle, card, boardEl, postIt, habitId);
  return card;
}

// (Re)desenha todos os post-its do habito dentro do quadro.
function renderPostItBoard(boardEl, habit) {
  boardEl.innerHTML = '';
  for (const p of habit.postIts) boardEl.appendChild(createPostItEl(p, habit.id, boardEl));
}

// Cria um post-it vazio (posicao em cascata pra nao empilhar tudo no mesmo
// lugar) e ja injeta o card no quadro, sem redesenhar os demais.
function spawnPostIt(habit, boardEl) {
  const h = getHabit(habit.id);
  if (!h) return;
  const step = h.postIts.length % 6;
  const postIt = { id: crypto.randomUUID(), text: '', x: 20 + step * 24, y: 20 + step * 24 };
  h.postIts.push(postIt);
  saveHabits();
  const card = createPostItEl(postIt, h.id, boardEl);
  boardEl.appendChild(card);
  card.querySelector('textarea').focus();
}

// Calendario de contribuicoes (estilo GitHub) dos ultimos 365 dias do habito:
// 7 linhas (dias da semana) x colunas (semanas), do mais antigo ao mais recente.
// Sem dado = cinza escuro; concluido/com tempo = cor do habito (mais fraca se
// so parcial, cheia se bateu a meta do dia).
function generateContributionCalendar(habit) {
  const wrap = document.createElement('div');
  wrap.className = 'w-full overflow-x-auto pb-2 shrink-0';

  const grid = document.createElement('div');
  grid.style.display = 'grid';
  grid.style.gridAutoFlow = 'column';
  grid.style.gridTemplateRows = 'repeat(7, 1fr)';
  grid.style.gridAutoColumns = '12px';
  grid.style.gap = '4px';
  grid.style.width = 'max-content';

  const today = todayISO();
  const end = fromISO(today);
  const start = new Date(end.getFullYear(), end.getMonth(), end.getDate() - 364); // ~365 dias
  start.setDate(start.getDate() - start.getDay()); // alinha ao domingo anterior (colunas = semanas cheias)

  const cursor = new Date(start);
  while (cursor <= end) {
    const iso = toISO(cursor);
    const entry = habit.history[iso];
    const done = Boolean(entry && entry.done);
    const value = entry ? num0(entry.value) : 0;

    const cell = document.createElement('div');
    cell.style.width = '12px';
    cell.style.height = '12px';
    cell.style.borderRadius = '2px';

    let bg = '#1e293b'; // sem registro nesse dia
    let statusLabel = 'Sem registro';
    if (value > 0) {
      const target = habit.target || HABIT_DEFAULT_DAY_SECONDS;
      bg = hexAlpha(habit.color, value >= target ? 1 : 0.5); // parcial x meta batida
      statusLabel = formatHM(value);
    } else if (done) {
      bg = habit.color;
      statusLabel = 'Concluido';
    }
    cell.style.background = bg;

    const [y, m, d] = iso.split('-');
    cell.title = d + '/' + m + '/' + y + ': ' + statusLabel;

    grid.appendChild(cell);
    cursor.setDate(cursor.getDate() + 1);
  }

  wrap.appendChild(grid);
  return wrap;
}

// Pagina de detalhes do habito: calendario de contribuicoes dos ultimos 365
// dias + quadro de post-its livres (arrastaveis) pra anotacoes soltas.
function openHabitDetailsModal(habit) {
  if (document.getElementById('habit-details-modal-backdrop')) return;
  if (!getHabit(habit.id)) return; // habito pode ter sido excluido nesse meio tempo

  const backdrop = document.createElement('div');
  backdrop.id = 'habit-details-modal-backdrop';
  backdrop.className = 'fixed inset-0 z-[60] bg-slate-950/70 flex items-center justify-center p-4';
  backdrop.addEventListener('mousedown', (e) => {
    if (e.target === backdrop) closeHabitDetailsModal();
  });

  const card = document.createElement('div');
  card.className =
    'w-full max-w-4xl h-[80vh] rounded-xl border border-slate-700 bg-slate-900 shadow-2xl ' +
    'p-5 flex flex-col gap-3';

  const head = document.createElement('div');
  head.className = 'flex items-center justify-between gap-2 shrink-0';
  const titleWrap = document.createElement('div');
  titleWrap.className = 'flex items-center gap-2 min-w-0';
  const dot = document.createElement('span');
  dot.className = 'h-2.5 w-2.5 rounded-sm shrink-0';
  dot.style.background = habit.color;
  const title = document.createElement('div');
  title.className = 'text-sm font-semibold text-slate-100 truncate';
  title.textContent = habit.name;
  titleWrap.append(dot, title);
  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.title = 'Fechar';
  closeBtn.className =
    'shrink-0 flex items-center justify-center h-7 w-7 rounded-md text-slate-500 ' +
    'hover:text-slate-300 hover:bg-slate-800 transition-colors';
  closeBtn.appendChild(icon('X', { size: 15 }));
  closeBtn.addEventListener('click', closeHabitDetailsModal);
  head.append(titleWrap, closeBtn);

  const calLabel = document.createElement('div');
  calLabel.className = 'text-xs text-slate-400 shrink-0';
  calLabel.textContent = 'Consistencia (ultimos 12 meses)';
  const calendar = generateContributionCalendar(habit);

  const notesHead = document.createElement('div');
  notesHead.className = 'flex items-center justify-between gap-2 shrink-0';
  const label = document.createElement('div');
  label.className = 'text-xs text-slate-400';
  label.textContent = 'Notas';
  const addBtn = document.createElement('button');
  addBtn.type = 'button';
  addBtn.className =
    'inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-md ' +
    'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 transition-colors';
  addBtn.append(icon('Plus', { size: 12 }), document.createTextNode('Novo Post-it'));
  notesHead.append(label, addBtn);

  // quadro livre: post-its arrastaveis, posicao absoluta (x/y salvos por post-it)
  const board = document.createElement('div');
  board.id = 'postit-board';
  board.className = 'relative overflow-hidden flex-1 w-full rounded-lg border border-slate-700/60';
  board.style.minHeight = '400px';
  board.style.background = 'rgba(0,0,0,0.1)';
  addBtn.addEventListener('click', () => spawnPostIt(habit, board));

  card.append(head, calLabel, calendar, notesHead, board);
  backdrop.appendChild(card);
  document.body.appendChild(backdrop);
  renderPostItBoard(board, getHabit(habit.id));
  document.addEventListener('keydown', onHabitDetailsModalKey);
}

function emptyRow(text) {
  const li = document.createElement('li');
  li.className = 'text-sm text-slate-500 py-6 text-center';
  li.textContent = text;
  return li;
}

// Botao "Pular ciclo" de uma tarefa recorrente. withLabel: pilula com texto
// (faixa expandida); sem label: so o icone (acao rapida da linha atrasada).
function skipCycleBtn(task, withLabel) {
  const b = document.createElement('button');
  b.type = 'button';
  b.title = withLabel
    ? 'Pular este ciclo — avanca para a proxima data sem concluir'
    : 'Pular este ciclo (perdi o prazo)';
  b.addEventListener('click', () => skipRecurringCycle(task.id));
  b.appendChild(icon('SkipForward', { size: withLabel ? 12 : 14 }));
  if (withLabel) {
    b.appendChild(document.createTextNode('Pular'));
    b.className =
      'inline-flex items-center gap-1 shrink-0 text-[10px] px-1.5 py-0.5 rounded ' +
      'bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors';
  } else {
    b.className =
      'flex items-center rounded p-0.5 text-slate-500 hover:bg-slate-700 hover:text-slate-300 transition-colors';
  }
  return b;
}

// Botoes de metadados da tarefa (prazo, recorrencia, prioridade, estrela, remover).
// alwaysVisible: mostra sempre (visao "Lista" / faixa do widget) em vez de so no hover.
function taskControlButtons(task, alwaysVisible) {
  const hover = alwaysVisible
    ? ''
    : 'opacity-0 group-hover/task:opacity-100 focus:opacity-100';

  const due = document.createElement('button');
  due.type = 'button';
  if (task.dueDate) {
    fillDueChip(due, task.dueDate, task.done);
    due.title = 'Prazo: ' + task.dueDate + ' — clique para alterar';
  } else {
    due.className =
      'shrink-0 text-[10px] px-1 py-0.5 rounded text-slate-600 hover:text-slate-300 transition-opacity ' +
      hover;
    due.textContent = '+ prazo';
    due.title = 'Definir prazo';
  }
  due.addEventListener('click', () => startEditDue(task, due, due.parentElement));

  const rec = document.createElement('button');
  rec.type = 'button';
  if (isRecurring(task.recurrence)) {
    rec.className =
      'shrink-0 max-w-[9rem] truncate text-[10px] px-1.5 py-0.5 rounded font-medium bg-sky-500/20 text-sky-300';
    rec.textContent = recurrenceLabel(task.recurrence);
    rec.title =
      recurrenceLabel(task.recurrence) +
      (task.recurrenceCount ? ' · ' + task.recurrenceCount + ' ciclos' : '') +
      ' — clique para alterar';
  } else {
    rec.className =
      'shrink-0 flex items-center px-1 py-0.5 rounded text-slate-600 hover:text-slate-300 transition-opacity ' +
      hover;
    rec.appendChild(icon('Repeat', { size: 13 }));
    rec.title = 'Definir recorrencia';
  }
  rec.addEventListener('click', () =>
    openRecurrenceMenu(rec, task.recurrence, (v) => setRecurrence(task.id, v))
  );

  const pr = document.createElement('button');
  pr.type = 'button';
  pr.className =
    'shrink-0 text-[10px] px-1.5 py-0.5 rounded font-medium ' + PRIORITY_BADGE[task.priority];
  pr.textContent = PRIORITY_LABEL[task.priority];
  pr.title = 'Escolher prioridade';
  pr.addEventListener('click', () =>
    openChoiceMenu(pr, priorityChoices(), task.priority, (v) => setPriority(task.id, v))
  );

  const star = document.createElement('button');
  star.type = 'button';
  star.appendChild(icon('Star', { size: 14, fill: task.today ? 'currentColor' : 'none' }));
  star.className =
    'shrink-0 flex items-center ' +
    (task.today ? 'text-indigo-400' : 'text-slate-600 hover:text-slate-400');
  star.title = 'Marcar como foco de hoje';
  star.addEventListener('click', () => toggleToday(task.id));

  const del = document.createElement('button');
  del.type = 'button';
  del.appendChild(icon('Trash2', { size: 14 }));
  del.title = 'Remover tarefa';
  del.className =
    'shrink-0 flex items-center text-slate-600 hover:text-red-400 transition-opacity ' + hover;
  del.addEventListener('click', () => removeTask(task.id));

  return { due, rec, pr, star, del };
}

function createTaskEl(task, opts = {}) {
  // compact = modo widget ou barra lateral "Hoje"; detailed = visao "Apenas Lista"
  const compact = overlayMode || Boolean(opts.compactish);
  const detailed = Boolean(opts.detailed) && !compact;
  const manual = Boolean(opts.manual) && !compact;

  const li = document.createElement('li');
  li.dataset.id = task.id;
  li.className =
    'group/task rounded-md border ' +
    (compact ? 'px-2 py-1.5 ' : 'px-2.5 py-2 ') +
    (task.today ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-700 bg-slate-800') +
    (opts.matrix ? ' cursor-grab active:cursor-grabbing' : '');

  // Dentro da Matriz de Eisenhower, o proprio card da tarefa e arrastavel entre
  // quadrantes (override manual de matrixQuadrant). O checkbox/chevron/botoes
  // continuam clicaveis normalmente — draggable no <li> nao interfere no click.
  if (opts.matrix) {
    li.setAttribute('draggable', 'true');
    li.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', task.id);
      e.dataTransfer.effectAllowed = 'move';
      li.classList.add('opacity-50');
    });
    li.addEventListener('dragend', () => {
      li.classList.remove('opacity-50');
    });
  }

  const row = document.createElement('div');
  row.className = 'flex items-center gap-2';

  // alca de arrastar (somente modo manual, escondida no modo widget)
  if (manual && !compact) {
    const handle = document.createElement('span');
    handle.appendChild(icon('GripVertical', { size: 14 }));
    handle.title = 'Arraste para reordenar';
    handle.className =
      'cursor-grab text-slate-600 hover:text-slate-400 select-none shrink-0 flex items-center';
    handle.setAttribute('draggable', 'true');
    handle.addEventListener('dragstart', (e) => {
      draggedId = task.id;
      e.dataTransfer.effectAllowed = 'move';
      li.classList.add('opacity-50');
    });
    handle.addEventListener('dragend', () => {
      draggedId = null;
      li.classList.remove('opacity-50');
      clearDropIndicators();
    });
    row.appendChild(handle);
  }

  // chevron de colapsar/expandir
  const chevron = document.createElement('button');
  chevron.type = 'button';
  chevron.appendChild(icon(task.collapsed ? 'ChevronRight' : 'ChevronDown', { size: 14 }));
  chevron.className = 'shrink-0 flex items-center text-slate-500 hover:text-slate-300';
  chevron.title = task.collapsed ? 'Expandir passos' : 'Recolher passos';
  chevron.addEventListener('click', () => toggleCollapse(task.id));
  row.appendChild(chevron);

  // Area de conclusao. Para recorrente ATRASADA: dois botoes rapidos
  // (Concluir / Pular) no lugar do checkbox quadrado.
  if (isOverdue(task) && isRecurring(task.recurrence)) {
    const acts = document.createElement('div');
    acts.className = 'shrink-0 flex items-center gap-0.5';

    const doneBtn = document.createElement('button');
    doneBtn.type = 'button';
    doneBtn.title = 'Concluir este ciclo';
    doneBtn.className =
      'flex items-center rounded p-0.5 text-emerald-400 hover:bg-emerald-500/15 transition-colors';
    doneBtn.appendChild(icon('Check', { size: 15 }));
    doneBtn.addEventListener('click', () => toggleTask(task.id));

    acts.append(doneBtn, skipCycleBtn(task, false));
    row.appendChild(acts);
  } else {
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.done;
    checkbox.className = 'accent-indigo-500 shrink-0 cursor-pointer';
    checkbox.addEventListener('change', () => toggleTask(task.id));
    row.appendChild(checkbox);
  }

  // titulo (duplo-clique edita) + contador de subtarefas logo ao lado do nome
  const titleWrap = document.createElement('div');
  titleWrap.className = 'flex-1 min-w-0 flex items-center gap-1.5';

  const title = document.createElement('span');
  title.className =
    'min-w-0 text-sm break-words cursor-text ' +
    (task.done ? 'line-through text-slate-500' : 'text-slate-100');
  title.textContent = task.text;
  title.title = 'Clique duas vezes para editar';
  title.addEventListener('dblclick', () => {
    const editor = inlineTextEditor(
      task.text,
      'flex-1 bg-slate-900 border border-indigo-500 rounded px-2 py-1 text-sm focus:outline-none',
      (v) => editTaskText(task.id, v)
    );
    titleWrap.replaceChild(editor, title);
    editor.focus();
    editor.select();
  });
  titleWrap.appendChild(title);

  // contador de subtarefas: design proprio (contorno neutro + icone de checklist),
  // ancorado ao nome e destacado das etiquetas de metadados da direita
  if (task.subtasks.length > 0) {
    const doneCount = task.subtasks.filter((s) => s.done).length;
    const complete = doneCount === task.subtasks.length;
    const prog = document.createElement('span');
    prog.className =
      'shrink-0 inline-flex items-center gap-1 text-[10px] tabular-nums px-1.5 py-0.5 ' +
      'rounded border border-slate-700 bg-slate-900/60 ' +
      (complete ? 'text-emerald-400' : 'text-slate-400');
    prog.append(
      icon(complete ? 'ListChecks' : 'List', { size: 11 }),
      document.createTextNode(doneCount + '/' + task.subtasks.length)
    );
    prog.title = doneCount + ' de ' + task.subtasks.length + ' subtarefas concluidas';
    titleWrap.appendChild(prog);
  }

  row.appendChild(titleWrap);

  // contador de pomodoros
  if (task.pomodoros > 0) {
    const pom = document.createElement('span');
    pom.className = 'shrink-0 text-[10px] tabular-nums text-slate-400';
    pom.textContent = '🍅' + task.pomodoros;
    pom.title = task.pomodoros + ' ciclo(s) de foco concluido(s)';
    row.appendChild(pom);
  }

  // prazo, recorrencia, prioridade, estrela e remover.
  // No modo widget essas ferramentas vao para a faixa dentro do painel expandido.
  let widgetDel = null;
  if (!compact) {
    const { due, rec, pr, star, del } = taskControlButtons(task, detailed);
    row.append(due, rec, pr, star);
    widgetDel = del;
  }

  // entrar no modo foco (sempre visivel no modo widget e na visao Lista)
  const focusBtn = document.createElement('button');
  focusBtn.type = 'button';
  focusBtn.appendChild(icon('Play', { size: 15 }));
  focusBtn.title = 'Focar nesta tarefa';
  focusBtn.className =
    'shrink-0 flex items-center text-indigo-400 hover:text-indigo-300 transition-opacity ' +
    (task.today || compact || detailed
      ? ''
      : 'opacity-0 group-hover/task:opacity-100 focus:opacity-100');
  focusBtn.addEventListener('click', () => enterFocus(task.id));
  row.appendChild(focusBtn);

  if (widgetDel) row.appendChild(widgetDel);

  li.appendChild(row);

  // alvos de drop (somente modo manual, desativado no modo widget)
  if (manual) {
    li.addEventListener('dragover', (e) => {
      if (!draggedId || draggedId === task.id) return;
      e.preventDefault();
      const rect = li.getBoundingClientRect();
      const before = e.clientY < rect.top + rect.height / 2;
      clearDropIndicators();
      li.classList.add(before ? 'drop-before' : 'drop-after');
    });
    li.addEventListener('dragleave', () => {
      li.classList.remove('drop-before', 'drop-after');
    });
    li.addEventListener('drop', (e) => {
      if (!draggedId || draggedId === task.id) return;
      e.preventDefault();
      const rect = li.getBoundingClientRect();
      const before = e.clientY < rect.top + rect.height / 2;
      const source = draggedId;
      clearDropIndicators();
      moveTask(source, task.id, before);
    });
  }

  // painel de subtarefas (quando expandido)
  if (!task.collapsed) {
    li.appendChild(createSubtaskPanel(task, compact, detailed));
  }

  return li;
}

function workspaceSelect(task) {
  const wrap = document.createElement('label');
  wrap.className = 'inline-flex items-center gap-1 text-[10px] text-slate-500';
  const cap = document.createElement('span');
  cap.className = 'flex items-center';
  cap.appendChild(icon('Layers', { size: 12 }));
  cap.title = 'Workspace da tarefa';
  const sel = document.createElement('select');
  sel.className =
    'bg-slate-800 border border-slate-700 rounded px-1 py-0.5 text-[10px] text-slate-200 ' +
    'focus:outline-none focus:ring-1 focus:ring-indigo-500';
  sel.title = 'Mover para outro workspace';
  const current = task.workspace || 'general';
  for (const w of workspaces) {
    const o = document.createElement('option');
    o.value = w.id;
    o.textContent = w.name;
    if (w.id === current) o.selected = true;
    sel.appendChild(o);
  }
  sel.addEventListener('change', () => setTaskWorkspace(task.id, sel.value));
  wrap.append(cap, sel);
  return wrap;
}

// Seletor de habito vinculado (faixa da tarefa expandida). null se nao ha habitos.
function habitSelect(task) {
  if (habits.length === 0) return null;
  const wrap = document.createElement('label');
  wrap.className = 'inline-flex items-center gap-1 text-[10px] text-slate-500';
  const cap = document.createElement('span');
  cap.className = 'flex items-center';
  cap.appendChild(icon('Flame', { size: 12 }));
  cap.title = 'Habito vinculado';
  const sel = document.createElement('select');
  sel.className =
    'bg-slate-800 border border-slate-700 rounded px-1 py-0.5 text-[10px] text-slate-200 ' +
    'focus:outline-none focus:ring-1 focus:ring-indigo-500';
  sel.title = 'Vincular a um habito';
  const none = document.createElement('option');
  none.value = '';
  none.textContent = 'Nenhum';
  sel.appendChild(none);
  const current = task.habitId || '';
  for (const h of habits) {
    const o = document.createElement('option');
    o.value = h.id;
    o.textContent = h.name;
    if (h.id === current) o.selected = true;
    sel.appendChild(o);
  }
  sel.addEventListener('change', () => setTaskHabit(task.id, sel.value));
  wrap.append(cap, sel);
  return wrap;
}

// Campos de horario inicio/fim (time-blocking) para a faixa da tarefa expandida.
function taskTimeFields(task) {
  const wrap = document.createElement('span');
  wrap.className = 'inline-flex items-center gap-1 text-[10px] text-slate-500';
  const mkInput = () => {
    const i = document.createElement('input');
    i.type = 'time';
    i.className =
      'bg-slate-800 border border-slate-700 rounded px-1 py-0.5 text-[10px] text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500';
    return i;
  };
  const st = mkInput();
  st.value = task.startTime || '';
  st.title = 'Horario de inicio';
  const et = mkInput();
  et.value = task.endTime || '';
  et.title = 'Horario de termino';
  // Aplica so quando o campo perde o foco. O evento 'change' do <input type=time>
  // dispara a cada segmento (hora/minuto) editado — re-renderizar ali derruba o
  // foco no meio da digitacao (ex.: digitar "30" so registra o "3").
  const apply = () => setTaskTimes(task.id, st.value || null, et.value || null);
  st.addEventListener('blur', apply);
  et.addEventListener('blur', apply);
  wrap.append(icon('Clock', { size: 12 }), st, document.createTextNode('–'), et);
  return wrap;
}

function createSubtaskPanel(task, compact, detailed) {
  const panel = document.createElement('div');
  panel.className = 'mt-2 pl-5 space-y-1.5';

  // Faixa de opcoes da tarefa expandida. No modo widget ela reune TODAS as
  // ferramentas; nas outras views, o seletor de workspace mora aqui.
  const strip = document.createElement('div');
  strip.className = 'flex flex-wrap items-center gap-1.5 pb-1.5 mb-1 border-b border-slate-700/60';
  if (compact) {
    const { due, rec, pr, star, del } = taskControlButtons(task, true);
    strip.append(due, rec, pr, star, del);
  }
  strip.appendChild(taskTimeFields(task));
  strip.appendChild(workspaceSelect(task));
  const hs = habitSelect(task);
  if (hs) strip.appendChild(hs);
  // Recorrente que vence HOJE: "Pular" mora aqui (exige expandir a tarefa).
  // Nas atrasadas o Pular ja esta na linha principal; nas futuras nao existe.
  // ml-auto empurra o botao pro extremo direito da faixa, longe dos metadados.
  if (isRecurring(task.recurrence) && isDueToday(task)) {
    const skipBtn = skipCycleBtn(task, true);
    skipBtn.classList.add('ml-auto');
    strip.appendChild(skipBtn);
  }
  panel.appendChild(strip);

  const showCtl = compact || detailed;
  const ctlHover = showCtl ? '' : 'opacity-0 group-hover/sub:opacity-100 focus:opacity-100';

  for (const sub of task.subtasks) {
    const srow = document.createElement('div');
    srow.className = 'group/sub flex flex-wrap items-center gap-x-2 gap-y-1';

    // checkbox + texto ocupam a primeira linha; os metadados quebram para baixo
    const main = document.createElement('div');
    main.className = 'flex items-center gap-2 flex-1 min-w-[9rem]';

    const scb = document.createElement('input');
    scb.type = 'checkbox';
    scb.checked = sub.done;
    scb.className = 'accent-indigo-500 shrink-0 cursor-pointer scale-90';
    scb.addEventListener('change', () => toggleSubtask(task.id, sub.id));

    const stext = document.createElement('span');
    stext.className =
      'flex-1 min-w-0 text-xs break-words cursor-text ' +
      (sub.done ? 'line-through text-slate-600' : 'text-slate-300');
    stext.textContent = sub.text;
    stext.title = 'Clique duas vezes para editar';
    stext.addEventListener('dblclick', () => {
      const editor = inlineTextEditor(
        sub.text,
        'flex-1 min-w-0 bg-slate-900 border border-indigo-500 rounded px-2 py-0.5 text-xs focus:outline-none',
        (v) => editSubtaskText(task.id, sub.id, v)
      );
      main.replaceChild(editor, stext);
      editor.focus();
      editor.select();
    });

    main.append(scb, stext);
    srow.appendChild(main);

    if (sub.pomodoros > 0) {
      const spom = document.createElement('span');
      spom.className = 'shrink-0 text-[10px] tabular-nums text-slate-400';
      spom.textContent = '🍅' + sub.pomodoros;
      spom.title = sub.pomodoros + ' ciclo(s) de foco neste passo';
      srow.appendChild(spom);
    }

    // prazo do passo
    const sdue = document.createElement('button');
    sdue.type = 'button';
    if (sub.dueDate) {
      fillDueChip(sdue, sub.dueDate, sub.done);
      sdue.title = 'Prazo do passo: ' + sub.dueDate;
    } else {
      sdue.className =
        'shrink-0 flex items-center px-1 py-0.5 rounded text-slate-600 hover:text-slate-300 transition-opacity ' +
        ctlHover;
      sdue.appendChild(icon('CalendarPlus', { size: 13 }));
      sdue.title = 'Definir prazo do passo';
    }
    sdue.addEventListener('click', () =>
      openDateEditor(sdue, srow, sub.dueDate, (iso) => setSubtaskDue(task.id, sub.id, iso))
    );
    srow.appendChild(sdue);

    // prioridade do passo (mesmo padrao das tarefas: menu de escolha direta)
    const spr = document.createElement('button');
    spr.type = 'button';
    spr.className =
      'shrink-0 text-[10px] px-1.5 py-0.5 rounded font-medium ' + PRIORITY_BADGE[sub.priority];
    spr.textContent = PRIORITY_LABEL[sub.priority];
    spr.title = 'Escolher prioridade do passo';
    spr.addEventListener('click', () =>
      openChoiceMenu(spr, priorityChoices(), sub.priority, (v) =>
        setSubtaskPriority(task.id, sub.id, v)
      )
    );
    srow.appendChild(spr);

    // focar neste passo
    const sfocus = document.createElement('button');
    sfocus.type = 'button';
    sfocus.appendChild(icon('Play', { size: 13 }));
    sfocus.title = 'Iniciar o cronometro para este passo';
    sfocus.className =
      'shrink-0 flex items-center text-indigo-400 hover:text-indigo-300 transition-opacity ' +
      (showCtl ? '' : 'opacity-0 group-hover/sub:opacity-100 focus:opacity-100');
    sfocus.addEventListener('click', () => enterFocus(task.id, sub.id));
    srow.appendChild(sfocus);

    const sdel = document.createElement('button');
    sdel.type = 'button';
    sdel.appendChild(icon('Trash2', { size: 13 }));
    sdel.title = 'Remover passo';
    sdel.className =
      'shrink-0 flex items-center text-slate-600 hover:text-red-400 transition-opacity ' + ctlHover;
    sdel.addEventListener('click', () => removeSubtask(task.id, sub.id));
    srow.appendChild(sdel);

    panel.appendChild(srow);
  }

  const subInput = document.createElement('input');
  subInput.type = 'text';
  subInput.placeholder = '+ passo (Enter para adicionar)';
  subInput.className =
    'w-full bg-slate-900/60 border border-slate-700 rounded px-2 py-1 text-xs ' +
    'placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500';
  subInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addSubtask(task.id, subInput.value);
  });
  panel.appendChild(subInput);

  return panel;
}

function createArchiveEl(task) {
  const li = document.createElement('li');
  li.className = 'rounded-md border border-slate-800 bg-slate-800/50 px-2.5 py-2';

  const row = document.createElement('div');
  row.className = 'flex items-center gap-2';

  const mark = document.createElement('span');
  mark.className = 'shrink-0 flex items-center text-emerald-400';
  mark.appendChild(icon('Check', { size: 14 }));
  row.appendChild(mark);

  const title = document.createElement('span');
  title.className = 'flex-1 text-sm text-slate-400 line-through break-words';
  title.textContent = task.text;
  row.appendChild(title);

  if (task.completedAt) {
    const when = document.createElement('span');
    when.className = 'shrink-0 text-[10px] text-slate-600 tabular-nums';
    when.textContent = new Date(task.completedAt).toLocaleDateString('pt-BR');
    row.appendChild(when);
  }

  const restore = document.createElement('button');
  restore.type = 'button';
  restore.appendChild(icon('Undo2', { size: 14 }));
  restore.title = 'Restaurar para a lista';
  restore.className = 'shrink-0 flex items-center text-slate-500 hover:text-indigo-400';
  restore.addEventListener('click', () => restoreTask(task.id));
  row.appendChild(restore);

  const del = document.createElement('button');
  del.type = 'button';
  del.appendChild(icon('Trash2', { size: 14 }));
  del.title = 'Excluir definitivamente';
  del.className = 'shrink-0 flex items-center text-slate-600 hover:text-red-400';
  del.addEventListener('click', () => deleteArchived(task.id));
  row.appendChild(del);

  li.appendChild(row);

  const bits = [];
  if (task.subtasks.length > 0) {
    const done = task.subtasks.filter((s) => s.done).length;
    bits.push(done + '/' + task.subtasks.length + ' passos');
  }
  if (task.pomodoros > 0) bits.push('🍅' + task.pomodoros);
  if (bits.length > 0) {
    const info = document.createElement('div');
    info.className = 'mt-1 pl-4 text-[11px] text-slate-600';
    info.textContent = bits.join(' · ');
    li.appendChild(info);
  }

  return li;
}

/* ---------------- render: abas Hoje e Agenda ---------------- */

function shiftCal(dir) {
  const a = calAnchor();
  const v = prefs.calView;
  if (v === 'day') a.setDate(a.getDate() + dir);
  else if (v === 'week') a.setDate(a.getDate() + dir * 7);
  else if (v === 'ndays') a.setDate(a.getDate() + dir * prefs.calNDays);
  else a.setMonth(a.getMonth() + dir);
  calRef = toISO(a);
  render();
}

function calHeaderLabel() {
  const a = calAnchor();
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  if (prefs.calView === 'day') {
    return cap(a.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }));
  }
  if (prefs.calView === 'week') {
    const s = new Date(a);
    s.setDate(a.getDate() - a.getDay());
    const e = new Date(s);
    e.setDate(s.getDate() + 6);
    const f = (d) => d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
    return f(s) + ' – ' + f(e);
  }
  if (prefs.calView === 'ndays') {
    const e = new Date(a);
    e.setDate(a.getDate() + prefs.calNDays - 1);
    const f = (d) => d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
    return f(a) + ' – ' + f(e);
  }
  return cap(
    new Date(a.getFullYear(), a.getMonth(), 1).toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric'
    })
  );
}

// Texto/horario "proprios" de uma entrada de agenda — um passo (subtarefa)
// usa o proprio texto (prefixado com "↳") e horario, nao os da tarefa-mae.
function entryDisplay(e) {
  if (e.type === 'subtask') {
    return { text: '↳ ' + e.sub.text, startTime: e.sub.startTime || null, endTime: e.sub.endTime || null };
  }
  return { text: e.task.text, startTime: e.task.startTime, endTime: e.task.endTime };
}

// Uma entrada conta como "concluida" (vai pro grupo "dia todo", nao na grade
// de horas) se for o tipo 'done' de uma tarefa OU um passo ja marcado feito.
function entryIsDone(e) {
  return e.type === 'done' || (e.type === 'subtask' && e.sub.done);
}

// Mapa "YYYY-MM-DD" -> [{ type: 'task'|'subtask'|'projected'|'done', task, sub?, occ? }]
// Recorrentes sao PROJETADAS (calculadas) no range visivel, sem duplicar no storage.
function calendarEntries(startISO, endISO) {
  const map = new Map();
  const add = (iso, e) => {
    if (iso < startISO || iso > endISO) return;
    if (!map.has(iso)) map.set(iso, []);
    const arr = map.get(iso);
    // evita a mesma tarefa (ou o mesmo passo) aparecer duas vezes no mesmo dia
    // (ex.: ciclo concluido registrado no historico E projetado como ocorrencia).
    // Compara tambem "sub": senao, uma tarefa com prazo hoje E um passo dela
    // tambem com prazo hoje se confundiriam (mesma referencia de task).
    if (arr.some((x) => x.task === e.task && x.sub === e.sub)) return;
    arr.push(e);
  };

  for (const task of visibleTasks()) {
    for (const h of task.history) add(h, { type: 'done', task });

    // passos (subtarefas) com prazo proprio tambem entram na agenda.
    for (const sub of task.subtasks) {
      if (sub.dueDate) add(sub.dueDate, { type: 'subtask', task, sub });
    }

    if (!isRecurring(task.recurrence)) {
      if (task.dueDate) add(task.dueDate, { type: task.done ? 'done' : 'task', task });
      continue;
    }

    // ciclo concluido aguardando renovacao: ja registrado via task.history acima.

    // ocorrencia real atual + projecoes futuras
    let cur = task.done
      ? task.nextOccurrence || advanceDate(task.dueDate || todayISO(), task.recurrence)
      : task.dueDate || todayISO();
    cur = alignToRecurrence(cur, task.recurrence); // garante que 'weekdays' comece num dia valido
    const realDue = task.done ? null : task.dueDate;
    let guard = 0;
    while (cur <= endISO && guard++ < 500) {
      if (!(task.done && cur === task.dueDate)) {
        add(cur, { type: cur === realDue ? 'task' : 'projected', task, occ: cur });
      }
      cur = advanceDate(cur, task.recurrence);
    }
  }

  for (const task of visibleArchive()) {
    if (task.completedAt) add(toISO(new Date(task.completedAt)), { type: 'done', task });
  }

  for (const list of map.values()) {
    const rank = { task: 0, subtask: 1, projected: 2, done: 3 };
    list.sort((a, b) => {
      if (rank[a.type] !== rank[b.type]) return rank[a.type] - rank[b.type];
      const da = entryDisplay(a);
      const db = entryDisplay(b);
      const ta = da.startTime || '99:99';
      const tb = db.startTime || '99:99';
      if (ta !== tb) return ta < tb ? -1 : 1;
      const pa = a.type === 'subtask' ? a.sub.priority : a.task.priority;
      const pb = b.type === 'subtask' ? b.sub.priority : b.task.priority;
      return PRIORITY_WEIGHT[pb] - PRIORITY_WEIGHT[pa];
    });
  }
  return map;
}

function renderAgendaView() {
  const wrap = document.createElement('div');
  wrap.className = 'flex flex-col h-full min-h-0';
  wrap.appendChild(renderCalHeader());

  const body = document.createElement('div');
  body.className = 'flex-1 min-h-0 flex flex-col';
  if (prefs.calView === 'month') renderMonthGrid(body);
  else if (prefs.calView === 'ndays') renderTimeGrid(body, prefs.calNDays, false);
  else renderTimeGrid(body, prefs.calView === 'week' ? 7 : 1, prefs.calView === 'week');
  wrap.appendChild(body);

  dashboard.appendChild(wrap);
}

function calNavBtn(content, fn) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className =
    'px-2 py-1 rounded border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors inline-flex items-center';
  if (content instanceof Node) b.appendChild(content);
  else b.textContent = content;
  b.addEventListener('click', fn);
  return b;
}

function renderCalHeader() {
  const head = document.createElement('div');
  head.className = 'flex items-center justify-between gap-2 mb-2 shrink-0 flex-wrap';

  const label = document.createElement('div');
  label.className = 'text-sm font-semibold';
  label.textContent = calHeaderLabel();

  const seg = document.createElement('div');
  seg.className = 'flex rounded-md border border-slate-700 overflow-hidden text-xs';
  for (const v of CAL_VIEWS) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = CAL_VIEW_LABEL[v];
    b.className =
      'px-2 py-1 transition-colors ' +
      (prefs.calView === v ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800');
    b.addEventListener('click', () => {
      prefs.calView = v;
      savePrefs();
      render();
    });
    seg.appendChild(b);
  }

  const nav = document.createElement('div');
  nav.className = 'flex items-center gap-1 text-xs';
  nav.append(
    calNavBtn(icon('ChevronLeft', { size: 14 }), () => shiftCal(-1)),
    calNavBtn('Hoje', () => {
      calRef = null;
      render();
    }),
    calNavBtn(icon('ChevronRight', { size: 14 }), () => shiftCal(1))
  );

  const right = document.createElement('div');
  right.className = 'flex items-center gap-2 flex-wrap';
  right.appendChild(seg);

  // visao "N Dias": campo numerico pra escolher quantos dias aparecem
  if (prefs.calView === 'ndays') {
    const nInput = document.createElement('input');
    nInput.type = 'number';
    nInput.min = '2';
    nInput.max = '14';
    nInput.value = String(prefs.calNDays);
    nInput.title = 'Quantidade de dias';
    nInput.className =
      'w-14 bg-slate-800 border border-slate-700 rounded px-1.5 py-1 text-xs text-slate-200 ' +
      'focus:outline-none focus:ring-1 focus:ring-indigo-500';
    nInput.addEventListener('change', () => {
      const n = clampInt(nInput.value, 2, 14, prefs.calNDays);
      nInput.value = String(n);
      if (n === prefs.calNDays) return;
      prefs.calNDays = n;
      savePrefs();
      render();
    });
    right.appendChild(nInput);
  }

  right.appendChild(nav);
  head.append(label, right);
  return head;
}

function renderTodayView() {
  const wrap = document.createElement('div');
  wrap.className = 'flex flex-col h-full';
  renderTodayPanel(wrap);
  dashboard.appendChild(wrap);
}

// Bloco/chip de um item do calendario, colorido conforme entryColor(). Passos
// (subtarefas) usam o texto/horario proprios (entryDisplay), mas a cor e o
// clique continuam sendo os da tarefa-mae (nao ha "abrir detalhe" dedicado —
// reaproveita o mesmo toggle das tarefas normais, so mirando o pai).
function makeCalChip(e, opts) {
  opts = opts || {};
  const t = e.task;
  const d = entryDisplay(e);
  const isDone = entryIsDone(e);
  const color = entryColor(t);
  const chip = document.createElement('div');
  chip.className =
    'cal-chip' +
    (isDone ? ' done' : '') +
    (e.type === 'projected' ? ' projected' : '');
  chip.style.borderLeftColor = color;
  chip.style.background = hexAlpha(color, isDone ? 0.12 : 0.2);
  if (opts.timeLabel && d.startTime) {
    chip.textContent = d.startTime + ' ' + d.text;
  } else {
    chip.textContent = d.text;
  }
  chip.title =
    (e.type === 'subtask' ? t.text + ' — ' + e.sub.text : d.text) +
    (d.startTime ? ' · ' + d.startTime + (d.endTime ? '–' + d.endTime : '') : '') +
    (e.type === 'projected' ? ' (ocorrencia futura)' : '');
  if (e.type === 'task' || e.type === 'subtask') {
    chip.style.cursor = 'pointer';
    chip.addEventListener('click', (ev) => {
      ev.stopPropagation();
      toggleTask(t.id);
    });
  } else {
    chip.style.cursor = 'default';
  }
  return chip;
}

function renderMonthGrid(host) {
  const a = calAnchor();
  const month = a.getMonth();
  const first = new Date(a.getFullYear(), month, 1);
  const gridStart = new Date(first);
  gridStart.setDate(1 - first.getDay());
  const gridEnd = new Date(gridStart);
  gridEnd.setDate(gridStart.getDate() + 41);
  const byDay = calendarEntries(toISO(gridStart), toISO(gridEnd));
  const today = todayISO();
  const maxChips = 5;

  const wk = document.createElement('div');
  wk.className = 'cal-grid mb-1 shrink-0';
  for (const d of WEEKDAYS) {
    const c = document.createElement('div');
    c.className = 'text-[10px] text-slate-500 text-center';
    c.textContent = d;
    wk.appendChild(c);
  }
  host.appendChild(wk);

  const grid = document.createElement('div');
  grid.className = 'cal-grid cal-body flex-1 min-h-0 overflow-y-auto';

  for (let i = 0; i < 42; i++) {
    const dt = new Date(gridStart);
    dt.setDate(gridStart.getDate() + i);
    const iso = toISO(dt);
    const inMonth = dt.getMonth() === month;

    const cell = document.createElement('div');
    cell.className =
      'cal-cell' + (inMonth ? '' : ' other-month') + (iso === today ? ' today' : '');

    const dn = document.createElement('div');
    dn.className = 'cal-daynum';
    dn.textContent = String(dt.getDate());
    cell.appendChild(dn);

    const entries = byDay.get(iso) || [];
    entries.slice(0, maxChips).forEach((e) => cell.appendChild(makeCalChip(e, { timeLabel: true })));
    if (entries.length > maxChips) {
      const more = document.createElement('div');
      more.className = 'cal-more';
      more.textContent = '+' + (entries.length - maxChips) + ' mais';
      cell.appendChild(more);
    }

    cell.addEventListener('click', (e) => {
      if (e.target === cell || e.target === dn) quickAddForDay(iso, cell);
    });
    grid.appendChild(cell);
  }
  host.appendChild(grid);
}

function renderTimeGrid(host, nCols, alignWeek) {
  const anchor = calAnchor();
  const start = new Date(anchor);
  if (alignWeek) start.setDate(anchor.getDate() - anchor.getDay());
  const cols = [];
  for (let i = 0; i < nCols; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    cols.push({ date: d, iso: toISO(d) });
  }
  const byDay = calendarEntries(cols[0].iso, cols[nCols - 1].iso);
  const today = todayISO();
  const colTmpl = '3rem repeat(' + nCols + ', minmax(0, 1fr))';

  // cabecalho de colunas
  const headRow = document.createElement('div');
  headRow.className = 'tg-head shrink-0';
  headRow.style.gridTemplateColumns = colTmpl;
  headRow.appendChild(document.createElement('div'));
  for (const c of cols) {
    const h = document.createElement('div');
    h.className = 'tg-colhead' + (c.iso === today ? ' today' : '');
    const w = document.createElement('div');
    w.className = 'text-[10px] uppercase text-slate-500';
    w.textContent = c.date.toLocaleDateString('pt-BR', { weekday: 'short' });
    const n = document.createElement('div');
    n.className = 'text-sm font-semibold';
    n.textContent = String(c.date.getDate());
    h.append(w, n);
    headRow.appendChild(h);
  }
  host.appendChild(headRow);

  // linha "dia todo" (itens sem horario ou concluidos)
  const allRow = document.createElement('div');
  allRow.className = 'tg-allday shrink-0';
  allRow.style.gridTemplateColumns = colTmpl;
  const adl = document.createElement('div');
  adl.className = 'text-[9px] text-slate-500 pr-1 self-center text-right';
  adl.textContent = 'dia todo';
  allRow.appendChild(adl);
  for (const c of cols) {
    const cell = document.createElement('div');
    cell.className = 'tg-alldaycell';
    const ents = (byDay.get(c.iso) || []).filter((e) => !entryDisplay(e).startTime || entryIsDone(e));
    ents.slice(0, 4).forEach((e) => cell.appendChild(makeCalChip(e)));
    if (ents.length > 4) {
      const m = document.createElement('div');
      m.className = 'cal-more';
      m.textContent = '+' + (ents.length - 4);
      cell.appendChild(m);
    }
    allRow.appendChild(cell);
  }
  host.appendChild(allRow);

  // grade de horas rolavel
  const scroll = document.createElement('div');
  scroll.className = 'tg-scroll flex-1 min-h-0 overflow-y-auto';
  const grid = document.createElement('div');
  grid.className = 'tg-grid';
  grid.style.gridTemplateColumns = colTmpl;
  grid.style.height = 24 * HOUR_PX + 'px';

  const gutter = document.createElement('div');
  gutter.className = 'tg-gutter';
  for (let h = 0; h < 24; h++) {
    const lab = document.createElement('div');
    lab.className = 'tg-hourlabel';
    lab.style.height = HOUR_PX + 'px';
    lab.textContent = h === 0 ? '' : pad2(h) + ':00';
    gutter.appendChild(lab);
  }
  grid.appendChild(gutter);

  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();

  for (const c of cols) {
    const col = document.createElement('div');
    col.className = 'tg-col' + (c.iso === today ? ' today' : '');
    for (let h = 0; h < 24; h++) {
      const hr = document.createElement('div');
      hr.className = 'tg-hourrow';
      hr.style.height = HOUR_PX + 'px';
      // identifica a celula (dia+hora) — usado pro clique/arrastar-pra-criar
      // num slot vazio e como alvo do arraste fluido dos blocos (coordenadas
      // via elementFromPoint em makeTimedBlockDraggable).
      hr.dataset.date = c.iso;
      hr.dataset.time = pad2(h) + ':00';
      // clique simples ou "arrastar pra criar" (sweep-to-create) num slot
      // vazio: abre o form de criacao ja preenchido. Blocos existentes ficam
      // por cima e interceptam o mousedown antes de chegar aqui — z-index
      // maior, nao sao descendentes do hr — entao nunca disparam este fluxo
      // (conflito com o arraste de reagendar de makeTimedBlockDraggable evitado
      // pela propria pilha de elementos, sem checagem extra necessaria).
      makeSlotSweepable(hr, col, c.iso, h);
      col.appendChild(hr);
    }
    const timed = (byDay.get(c.iso) || []).filter((e) => entryDisplay(e).startTime && !entryIsDone(e));
    for (const e of timed) col.appendChild(makeTimedBlock(e));
    if (c.iso === today) {
      const nl = document.createElement('div');
      nl.className = 'tg-now';
      nl.style.top = Math.round((nowMin / 60) * HOUR_PX) + 'px';
      col.appendChild(nl);
    }
    grid.appendChild(col);
  }
  scroll.appendChild(grid);
  host.appendChild(scroll);
  requestAnimationFrame(() => {
    scroll.scrollTop = Math.max(0, 7 * HOUR_PX - 24);
  });
}

// Distancia minima (px) que o mouse precisa percorrer antes de um mousedown
// num slot vazio virar "arrastar pra criar" de verdade — abaixo disso, soltar
// conta como clique simples (abre o form so com a hora inicial, igual sempre
// abriu, sem desenhar bloco fantasma nenhum).
const SWEEP_DRAG_THRESHOLD = 4;

// "Arrastar pra criar" (sweep-to-create) num slot vazio da grade da Agenda:
// clique simples abre o form de criacao normal; arrastar pra baixo "desenha"
// um bloco fantasma tracejado que estica junto com o cursor e, ao soltar,
// abre o form com a hora de inicio (da celula onde comecou) e a hora de
// termino calculada a partir do tamanho arrastado (arredondada pros 15min
// mais proximos, minimo de 1h — mesmo minimo visual do bloco fantasma).
function makeSlotSweepable(hr, col, iso, startHour) {
  hr.addEventListener('mousedown', (down) => {
    if (down.button !== 0) return; // so botao esquerdo do mouse
    down.preventDefault(); // evita selecao de texto nativa ao arrastar
    const startY = down.clientY;
    const startMin = startHour * 60;
    const topPx = startHour * HOUR_PX;
    let dragging = false;
    let ghost = null;
    let colRect = null;

    const onMouseMove = (move) => {
      if (!dragging) {
        if (Math.abs(move.clientY - startY) < SWEEP_DRAG_THRESHOLD) return;
        // cruzou o limiar: comeca a desenhar o bloco fantasma de verdade.
        dragging = true;
        colRect = col.getBoundingClientRect();
        ghost = document.createElement('div');
        ghost.className = 'tg-ghost-sweep';
        ghost.style.top = topPx + 'px';
        ghost.style.height = HOUR_PX + 'px';
        col.appendChild(ghost);
      }
      const localY = move.clientY - colRect.top;
      ghost.style.height = Math.round(Math.max(HOUR_PX, localY - topPx)) + 'px';
    };

    const onMouseUp = (up) => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      if (!dragging) {
        // nao passou do limiar: foi um clique simples no slot.
        openTaskFormForSlot(iso, hr.dataset.time);
        return;
      }
      const localY = up.clientY - colRect.top;
      const heightPx = Math.max(HOUR_PX, localY - topPx);
      const rawMinutes = (heightPx / HOUR_PX) * 60;
      const durationMin = Math.max(60, Math.round(rawMinutes / 15) * 15);
      const endMin = Math.min(23 * 60 + 59, startMin + durationMin);
      ghost.remove();
      // openTaskFormForSlot so cuida de data/hora de inicio; a hora de termino
      // calculada pelo arraste e um extra deste fluxo de sweep, preenchida
      // logo em seguida sem precisar alterar a funcao existente.
      openTaskFormForSlot(iso, hr.dataset.time);
      taskEndEl.value = pad2(Math.floor(endMin / 60)) + ':' + pad2(endMin % 60);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  });
}

function makeTimedBlock(e) {
  const t = e.task;
  const d = entryDisplay(e);
  const s = timeToMin(d.startTime);
  const end = d.endTime ? timeToMin(d.endTime) : s + 60;
  const dur = Math.max(24, end - s);
  const color = entryColor(t);
  const b = document.createElement('div');
  b.className = 'tg-block' + (e.type === 'projected' ? ' projected' : '');
  b.style.top = Math.round((s / 60) * HOUR_PX) + 'px';
  b.style.height = Math.round((dur / 60) * HOUR_PX) + 'px';
  b.style.borderLeftColor = color;
  b.style.background = hexAlpha(color, 0.24);
  b.title =
    (e.type === 'subtask' ? t.text + ' — ' + e.sub.text : d.text) +
    ' · ' + d.startTime + (d.endTime ? '–' + d.endTime : '') +
    (e.type === 'projected' ? ' (ocorrencia futura)' : '');

  const tm = document.createElement('div');
  tm.className = 'text-[9px] opacity-70 leading-none';
  tm.textContent = d.startTime;
  const tx = document.createElement('div');
  tx.className = 'text-[10px] leading-tight';
  tx.textContent = d.text;
  b.append(tm, tx);

  if (e.type === 'task' || e.type === 'subtask') {
    b.style.cursor = 'pointer';
    b.addEventListener('click', () => toggleTask(t.id));

    // arrastar pra reagendar (motor de arraste fluido via mouse, mesmo padrao
    // do quadro de post-its dos habitos). Ocorrencias projetadas de recorrencia
    // ficam de fora — nao tem uma data propria pra mover, so o calculo do
    // proximo ciclo.
    const subId = e.type === 'subtask' ? e.sub.id : null;
    makeTimedBlockDraggable(b, t.id, subId);
    // alcas de redimensionar (topo/base) — usam o mesmo inicio/termino (real,
    // sem o clamp visual de "dur") como base do calculo.
    makeTimedBlockResizable(b, t.id, subId, s, end);
  }
  return b;
}

// Distancia minima (px) que o mouse precisa percorrer antes de virar arraste de
// verdade — abaixo disso, soltar o botao conta como clique simples (o listener
// 'click' do bloco cuida de alternar concluido/pendente).
const TIMED_BLOCK_DRAG_THRESHOLD = 4;

// Arraste fluido (mousedown/mousemove/mouseup) de um bloco com horario na
// grade da Agenda, pra reagendar arrastando pra outra celula dia+hora.
function makeTimedBlockDraggable(block, taskId, subtaskId) {
  block.addEventListener('mousedown', (down) => {
    if (down.button !== 0) return; // so botao esquerdo do mouse
    down.preventDefault(); // evita selecao de texto nativa ao arrastar
    down.stopPropagation(); // isola do que estiver por baixo/em volta (grade, outros blocos)
    const startX = down.clientX;
    const startY = down.clientY;
    let dragging = false;
    let offsetX = 0;
    let offsetY = 0;
    let hoverCell = null;

    const setHover = (cell) => {
      if (hoverCell === cell) return;
      if (hoverCell) hoverCell.classList.remove('tg-hourrow-dragover');
      hoverCell = cell;
      if (hoverCell) hoverCell.classList.add('tg-hourrow-dragover');
    };

    const cellUnder = (x, y) => {
      const el = document.elementFromPoint(x, y);
      return el ? el.closest('.tg-hourrow') : null;
    };

    const onMouseMove = (move) => {
      const dx = move.clientX - startX;
      const dy = move.clientY - startY;
      if (!dragging) {
        if (Math.abs(dx) < TIMED_BLOCK_DRAG_THRESHOLD && Math.abs(dy) < TIMED_BLOCK_DRAG_THRESHOLD) {
          return;
        }
        // cruzou o limiar: desprende o bloco do fluxo normal e passa a
        // segui-lo pelo viewport (position:fixed), por cima de tudo.
        dragging = true;
        const rect = block.getBoundingClientRect();
        offsetX = startX - rect.left;
        offsetY = startY - rect.top;
        block.style.position = 'fixed';
        block.style.left = rect.left + 'px';
        block.style.top = rect.top + 'px';
        block.style.width = rect.width + 'px';
        block.style.right = 'auto';
        block.style.zIndex = '100';
        // some da deteccao de elemento embaixo do cursor, pra elementFromPoint
        // enxergar a celula da grade por baixo do bloco arrastado.
        block.style.pointerEvents = 'none';
        block.classList.add('opacity-50');
      }
      block.style.left = move.clientX - offsetX + 'px';
      block.style.top = move.clientY - offsetY + 'px';
      setHover(cellUnder(move.clientX, move.clientY));
    };

    const onMouseUp = (up) => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      if (!dragging) return; // nao passou do limiar: foi um clique, nao um arraste
      setHover(null);
      const cell = cellUnder(up.clientX, up.clientY);
      if (cell) {
        // rescheduleEntry ja salva e chama render(); o re-render substitui este
        // bloco por um novo, limpo, sem nenhum dos estilos inline do arraste.
        rescheduleEntry(taskId, subtaskId, cell.dataset.date, cell.dataset.time);
      } else {
        // soltou fora de uma celula valida: desfaz a posicao flutuante.
        render();
      }
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  });
}

// Granularidade (minutos) do redimensionar — arredonda pro multiplo de 15
// mais proximo, mesmo grao usado pelo "arrastar pra criar" (makeSlotSweepable).
const RESIZE_SNAP_MIN = 15;
// Duracao minima permitida ao redimensionar um bloco (nunca deixa colapsar).
const RESIZE_MIN_DURATION_MIN = 15;

// Alcas de redimensionar (topo = muda o inicio, base = muda o termino) de um
// bloco com horario na Agenda. startMin/endMin sao os minutos (reais, ja
// calculados por makeTimedBlock) do inicio/termino atuais — nunca muda o dia,
// so os horarios dentro da mesma coluna.
function makeTimedBlockResizable(block, taskId, subId, startMin, endMin) {
  const baseStart = Math.max(0, Math.min(23 * 60 + 59, startMin));
  const baseEnd = Math.max(baseStart + RESIZE_MIN_DURATION_MIN, Math.min(23 * 60 + 59, endMin));

  const attachHandle = (edge) => {
    const handle = document.createElement('div');
    handle.className = 'tg-resize-handle tg-resize-handle-' + edge;
    handle.addEventListener('mousedown', (down) => {
      if (down.button !== 0) return; // so botao esquerdo do mouse
      down.preventDefault(); // evita selecao de texto nativa ao arrastar
      // nunca deixa isso borbulhar pro mousedown do proprio bloco (que moveria
      // o bloco inteiro em vez de redimensionar) nem pra grade por baixo.
      down.stopPropagation();
      const startY = down.clientY;
      let newStart = baseStart;
      let newEnd = baseEnd;

      const onMouseMove = (move) => {
        const dyMin =
          Math.round(((move.clientY - startY) / HOUR_PX) * 60 / RESIZE_SNAP_MIN) * RESIZE_SNAP_MIN;
        if (edge === 'bottom') {
          newEnd = Math.max(
            baseStart + RESIZE_MIN_DURATION_MIN,
            Math.min(23 * 60 + 59, baseEnd + dyMin)
          );
        } else {
          newStart = Math.min(
            baseEnd - RESIZE_MIN_DURATION_MIN,
            Math.max(0, baseStart + dyMin)
          );
        }
        block.style.top = Math.round((newStart / 60) * HOUR_PX) + 'px';
        block.style.height = Math.round(((newEnd - newStart) / 60) * HOUR_PX) + 'px';
      };

      const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        const startStr = pad2(Math.floor(newStart / 60)) + ':' + pad2(newStart % 60);
        const endStr = pad2(Math.floor(newEnd / 60)) + ':' + pad2(newEnd % 60);
        // resizeEntry ja salva e chama render(); o re-render substitui este
        // bloco por um novo, limpo, sem nenhum estilo inline do redimensionar.
        resizeEntry(taskId, subId, startStr, endStr);
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });
    return handle;
  };

  block.append(attachHandle('top'), attachHandle('bottom'));
}

function quickAddForDay(iso, cell) {
  if (cell.querySelector('input')) return;
  const inp = document.createElement('input');
  inp.type = 'text';
  inp.className = 'cal-quickadd';
  inp.placeholder = '+ tarefa em ' + formatDayMonth(iso);
  let closed = false;
  const commit = () => {
    if (closed) return;
    closed = true;
    const text = inp.value.trim();
    if (text) {
      tasks.push(
        normalizeTask({ text, dueDate: iso, workspace: prefs.workspace, createdAt: Date.now() })
      );
      saveTasks();
    }
    render();
  };
  inp.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') commit();
    else if (e.key === 'Escape') {
      closed = true;
      render();
    }
  });
  inp.addEventListener('blur', commit);
  cell.appendChild(inp);
  inp.focus();
}

// Alterna Lista/Matriz — preferencia so em memoria (state), nao persiste.
function todayViewToggle() {
  const wrap = document.createElement('div');
  wrap.className = 'flex items-center justify-end mb-2 shrink-0';
  const group = document.createElement('div');
  group.className = 'inline-flex items-center gap-0.5 p-0.5 rounded-md border border-slate-700 bg-slate-900/60';
  const mk = (mode, iconName, label) => {
    const active = state.todayViewMode === mode;
    const b = document.createElement('button');
    b.type = 'button';
    b.title = label;
    b.className =
      'inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-colors ' +
      (active ? 'bg-slate-700 text-slate-100' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800');
    b.append(icon(iconName, { size: 13 }), document.createTextNode(label));
    b.addEventListener('click', () => {
      if (state.todayViewMode === mode) return;
      state.todayViewMode = mode;
      render();
    });
    return b;
  };
  group.append(mk('list', 'List', 'Lista'), mk('matrix', 'LayoutGrid', 'Matriz'));
  wrap.appendChild(group);
  return wrap;
}

// Card de um quadrante da matriz — cabecalho (ponto colorido + titulo + contador)
// e a lista de tarefas daquele quadrante, usando createTaskEl (checkbox/expandir/
// editar continuam funcionando normalmente). Tambem funciona como zona de drop:
// soltar uma tarefa aqui fixa manualmente o quadrante dela (setTaskMatrixQuadrant).
function matrixQuadrantCard(qid, items) {
  const meta = QUADRANT_META[qid];
  const card = document.createElement('div');
  card.className =
    'flex flex-col min-h-0 rounded-lg border ' + meta.border + ' bg-slate-900/40 p-3 transition-colors';

  card.addEventListener('dragover', (e) => {
    e.preventDefault(); // obrigatorio pro browser permitir o drop
    e.dataTransfer.dropEffect = 'move';
  });
  card.addEventListener('dragenter', (e) => {
    e.preventDefault();
    card.classList.add('quadrant-drag-over');
  });
  card.addEventListener('dragleave', (e) => {
    // ignora quando o mouse so passou por um filho (evita "piscar" o destaque)
    if (e.relatedTarget && card.contains(e.relatedTarget)) return;
    card.classList.remove('quadrant-drag-over');
  });
  card.addEventListener('drop', (e) => {
    e.preventDefault();
    card.classList.remove('quadrant-drag-over');
    const id = e.dataTransfer.getData('text/plain');
    if (id) setTaskMatrixQuadrant(id, qid);
  });

  const head = document.createElement('div');
  head.className = 'flex items-center gap-2 mb-2 shrink-0';
  const dot = document.createElement('span');
  dot.className = 'h-2.5 w-2.5 rounded-full shrink-0 ' + meta.dot;
  const title = document.createElement('span');
  title.className = 'text-[11px] font-semibold uppercase tracking-wide text-slate-300';
  title.textContent = meta.title;
  const count = document.createElement('span');
  count.className = 'ml-auto text-[10px] text-slate-500 tabular-nums';
  count.textContent = String(items.length);
  head.append(dot, title, count);
  card.appendChild(head);

  const ul = document.createElement('ul');
  ul.className = 'flex-1 overflow-y-auto space-y-2 pr-1 min-h-0';
  if (items.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'text-[11px] text-slate-600 py-3 text-center';
    empty.textContent = 'Vazio';
    ul.appendChild(empty);
  } else {
    for (const t of items) ul.appendChild(createTaskEl(t, { matrix: true }));
  }
  card.appendChild(ul);
  return card;
}

// Grid 2x2 com os 4 quadrantes (classificacao em deriveMatrixQuadrants; cada
// card e uma zona de drop e arrastar uma tarefa entre eles fixa o override).
function renderMatrixView(list) {
  const q = deriveMatrixQuadrants(list);
  const grid = document.createElement('div');
  grid.className = 'grid grid-cols-2 grid-rows-2 gap-4 flex-1 min-h-0';
  for (const qid of [1, 2, 3, 4]) grid.appendChild(matrixQuadrantCard(qid, q[qid]));
  return grid;
}

function renderTodayPanel(host) {
  if (!state.todayViewMode) state.todayViewMode = 'list';
  const all = visibleTasks().filter(isTodayTask);
  // Atrasadas saem do bloco "Hoje" e vao fixas no topo, com o mesmo cabecalho
  // (groupHeader) usado na aba Tarefas — mesmo criterio/ordenacao de la.
  const overdue = all.filter(isOverdue).sort(byDateThenCreated);
  const todays = all
    .filter((t) => !isOverdue(t))
    .sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1; // concluidas hoje vao para o fim
      return byPriorityThenDue(a, b);
    });

  // captura de tarefas: agora usa o #task-form compartilhado (mesmo da aba
  // Tarefas), posicionado acima do dashboard e mostrado tambem na aba Hoje —
  // ver render(). O popover de detalhes esconde o campo Data aqui (implicita).

  host.appendChild(todayViewToggle());

  if (state.todayViewMode === 'matrix') {
    host.appendChild(renderMatrixView(all));
    return;
  }

  const ul = document.createElement('ul');
  ul.className = 'flex-1 overflow-y-auto space-y-2 pr-1 min-h-0';
  if (overdue.length === 0 && todays.length === 0) {
    ul.appendChild(emptyRow('Nada para hoje. Aproveite. 🎉'));
  } else if (overdue.length === 0) {
    // sem atrasadas: visual limpo original, SEM cabecalho nenhum
    for (const t of todays) ul.appendChild(createTaskEl(t, {}));
  } else {
    // com atrasadas: os dois blocos ficam rotulados, pra nao parecer que as
    // tarefas de hoje fazem parte do grupo "Atrasadas" logo acima.
    ul.appendChild(groupHeader('Atrasadas', overdue.length, 'bg-red-600'));
    for (const t of overdue) ul.appendChild(createTaskEl(t, {}));
    ul.appendChild(groupHeader('Hoje', todays.length, 'bg-amber-500'));
    for (const t of todays) ul.appendChild(createTaskEl(t, {}));
  }
  host.appendChild(ul);
}

/* ---------------- render: modo foco ---------------- */

function renderFocus() {
  const task = currentFocusTask();
  focusView.innerHTML = '';

  if (!task) {
    state.view = VIEWS.includes(prefs.view) ? prefs.view : 'today';
    render();
    return;
  }

  const isBreak = timer.phase === 'break';

  const top = document.createElement('div');
  top.className = 'focus-top shrink-0';
  const back = document.createElement('button');
  back.type = 'button';
  back.className =
    'text-xs text-slate-400 hover:text-slate-200 transition-colors inline-flex items-center gap-1';
  back.append(icon('ArrowLeft', { size: 13 }), document.createTextNode('Sair do foco'));
  back.addEventListener('click', exitFocus);
  top.appendChild(back);

  const center = document.createElement('div');
  center.className =
    'focus-center flex-1 min-h-0 flex flex-col items-center justify-center text-center gap-2 px-2 py-4';

  const phase = document.createElement('div');
  phase.className =
    'focus-phase shrink-0 text-[11px] font-semibold tracking-[0.2em] ' +
    (isBreak ? (timer.isLong ? 'text-amber-400' : 'text-emerald-400') : 'text-indigo-400');
  phase.textContent = isBreak ? (timer.isLong ? 'PAUSA LONGA' : 'PAUSA') : 'FOCO';

  const disp = document.createElement('div');
  disp.id = 'timer-display';
  disp.className = 'focus-clock shrink-0 text-6xl font-light tabular-nums tracking-tight leading-none';
  disp.textContent = fmtClock(timer.remaining);

  const focusSub = timer.subId ? task.subtasks.find((s) => s.id === timer.subId) : null;

  const pom = document.createElement('div');
  pom.className = 'focus-pom shrink-0 text-xs text-slate-500';
  pom.textContent = focusSub
    ? '🍅 ' + (focusSub.pomodoros || 0) + ' neste passo'
    : '🍅 ' + (task.pomodoros || 0) + ' nesta tarefa';

  const titleEl = document.createElement('div');
  titleEl.className =
    'focus-title shrink-0 mt-2 text-base break-words ' +
    ((focusSub ? focusSub.done : task.done) ? 'line-through text-slate-500' : 'text-slate-100');
  titleEl.textContent = focusSub ? focusSub.text : task.text;

  center.append(phase, disp, pom, titleEl);

  if (focusSub) {
    const parent = document.createElement('div');
    parent.className = 'focus-parent shrink-0 text-[11px] text-slate-500 -mt-1';
    parent.textContent = 'em: ' + task.text;
    center.appendChild(parent);
  }

  // checklist de passos (apenas durante o foco) — rola dentro de si mesma se for longa
  if (!isBreak && task.subtasks.length > 0) {
    const steps = document.createElement('div');
    steps.className = 'focus-steps mt-1 space-y-1 text-left';
    for (const sub of task.subtasks) {
      const label = document.createElement('label');
      label.className =
        'flex items-center gap-2 text-xs cursor-pointer ' +
        (focusSub && sub.id === focusSub.id ? 'font-semibold text-indigo-300' : '');
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = sub.done;
      cb.className = 'accent-indigo-500 scale-90 shrink-0';
      cb.addEventListener('change', () => toggleSubtask(task.id, sub.id));
      const sp = document.createElement('span');
      sp.className = 'break-words ' + (sub.done ? 'line-through text-slate-600' : '');
      sp.textContent = sub.text;
      label.append(cb, sp);
      steps.appendChild(label);
    }
    center.appendChild(steps);
  }

  // controles principais (Iniciar/Pausar, Reiniciar, Pular)
  const controls = document.createElement('div');
  controls.className = 'focus-controls shrink-0 mt-3 flex flex-wrap items-center justify-center gap-2';

  const startBtn = document.createElement('button');
  startBtn.type = 'button';
  startBtn.id = 'timer-startbtn';
  startBtn.className =
    'bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 transition-colors ' +
    'rounded-md px-5 py-2 text-sm font-medium inline-flex items-center gap-1.5';
  paintStartBtn(startBtn);
  startBtn.addEventListener('click', timerStart);

  const resetBtn = document.createElement('button');
  resetBtn.type = 'button';
  resetBtn.className =
    'border border-slate-700 hover:border-slate-500 transition-colors rounded-md px-3 py-2 text-xs text-slate-300 inline-flex items-center gap-1.5';
  resetBtn.append(icon('RotateCcw', { size: 13 }), document.createTextNode('Reiniciar'));
  resetBtn.addEventListener('click', timerReset);

  const skipBtn = document.createElement('button');
  skipBtn.type = 'button';
  skipBtn.className =
    'border border-slate-700 hover:border-slate-500 transition-colors rounded-md px-3 py-2 text-xs text-slate-300 inline-flex items-center gap-1.5';
  skipBtn.append(
    icon(isBreak ? 'SkipForward' : 'CheckCheck', { size: 13 }),
    document.createTextNode(isBreak ? 'Pular pausa' : 'Concluir ciclo')
  );
  skipBtn.addEventListener('click', timerSkip);

  controls.append(startBtn, resetBtn, skipBtn);
  center.appendChild(controls);

  // duracoes editaveis (acessivel tambem no modo widget)
  const cfg = document.createElement('div');
  cfg.className =
    'focus-cfg shrink-0 mt-2 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs text-slate-500';
  const focusIn = numberInput(prefs.focusMin, 1, 180);
  const breakIn = numberInput(prefs.breakMin, 1, 60);
  const apply = () => setDurations(focusIn.value, breakIn.value);
  focusIn.addEventListener('change', apply);
  breakIn.addEventListener('change', apply);
  const sep = document.createElement('span');
  sep.textContent = '·';
  cfg.append(durationField('foco', focusIn), sep, durationField('pausa', breakIn));
  center.appendChild(cfg);

  focusView.append(top, center);
}

function numberInput(value, min, max) {
  const el = document.createElement('input');
  el.type = 'number';
  el.min = String(min);
  el.max = String(max);
  el.value = String(value);
  el.className =
    'w-12 bg-slate-800 border border-slate-700 rounded px-1 py-0.5 text-center ' +
    'text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500';
  return el;
}

function durationField(labelText, inputEl) {
  const span = document.createElement('span');
  span.className = 'inline-flex items-center gap-1';
  span.append(document.createTextNode(labelText), inputEl, document.createTextNode('min'));
  return span;
}

/* ---------------- editores inline ---------------- */

// Menu de escolha direta (prioridade, recorrencia): um clique -> lista -> escolhe.
function closeChoiceMenu() {
  const m = document.getElementById('choice-menu');
  if (m) m.remove();
  const b = document.getElementById('choice-backdrop');
  if (b) b.remove();
  // os open*Menu abaixo registram scroll/resize com {once:true} pra fechar o
  // menu sozinho se a pagina se mover — mas se o menu fechar por outro caminho
  // antes disso (escolha clicada, clique fora), o listener fica pendurado no
  // window pra sempre. Remove explicitamente aqui pra nao acumular a cada abertura.
  window.removeEventListener('scroll', closeChoiceMenu, { capture: true });
  window.removeEventListener('resize', closeChoiceMenu);
}

function openChoiceMenu(anchorEl, choices, current, onPick) {
  closeChoiceMenu();
  const rect = anchorEl.getBoundingClientRect();

  const backdrop = document.createElement('div');
  backdrop.id = 'choice-backdrop';
  backdrop.className = 'fixed inset-0 z-40';
  backdrop.addEventListener('mousedown', closeChoiceMenu);

  const menu = document.createElement('div');
  menu.id = 'choice-menu';
  menu.className =
    'fixed z-50 min-w-[7rem] rounded-md border border-slate-700 bg-slate-900 shadow-xl py-1 text-xs';
  menu.style.left = Math.round(rect.left) + 'px';
  menu.style.top = Math.round(rect.bottom + 4) + 'px';

  for (const c of choices) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className =
      'w-full flex items-center gap-2 text-left px-2.5 py-1.5 transition-colors ' +
      (c.value === current ? 'text-indigo-300' : 'text-slate-300 hover:bg-slate-800');
    if (c.swatch) {
      const sw = document.createElement('span');
      sw.className = 'h-2 w-2 rounded-full shrink-0 ' + c.swatch;
      b.appendChild(sw);
    }
    const lb = document.createElement('span');
    lb.textContent = (c.value === current ? '• ' : '') + c.label;
    b.appendChild(lb);
    b.addEventListener('click', () => {
      closeChoiceMenu();
      onPick(c.value);
    });
    menu.appendChild(b);
  }

  document.body.append(backdrop, menu);

  // reposiciona se estourar a viewport
  requestAnimationFrame(() => {
    const mr = menu.getBoundingClientRect();
    if (mr.right > window.innerWidth - 8) {
      menu.style.left = Math.round(window.innerWidth - mr.width - 8) + 'px';
    }
    if (mr.bottom > window.innerHeight - 8) {
      menu.style.top = Math.round(rect.top - mr.height - 4) + 'px';
    }
  });

  window.addEventListener('scroll', closeChoiceMenu, { once: true, capture: true });
  window.addEventListener('resize', closeChoiceMenu, { once: true });
}

function priorityChoices() {
  return PRIORITIES.map((p) => ({ value: p, label: PRIORITY_LABEL[p], swatch: PRIORITY_DOT[p] }));
}

/* ---------------- recorrencia personalizada (painel reutilizavel) ---------------- */

// Painel com "A cada X dias" | "Dias da semana". Devolve { el, getValue() }.
function makeRecurrenceCustom(initial) {
  let mode = initial && initial.type === 'weekdays' ? 'weekdays' : 'everyN';
  const days = new Set(
    initial && initial.type === 'weekdays' ? initial.days : []
  );

  const wrap = document.createElement('div');
  wrap.className = 'space-y-2';

  const tabs = document.createElement('div');
  tabs.className = 'flex rounded-md border border-slate-700 overflow-hidden text-[11px]';
  const tabCls = (on) =>
    'flex-1 px-2 py-1 transition-colors ' +
    (on ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800');
  const tabEvery = document.createElement('button');
  tabEvery.type = 'button';
  tabEvery.textContent = 'A cada X dias';
  const tabWeek = document.createElement('button');
  tabWeek.type = 'button';
  tabWeek.textContent = 'Dias da semana';
  tabs.append(tabEvery, tabWeek);

  const everyRow = document.createElement('div');
  everyRow.className = 'flex items-center gap-2 text-[11px] text-slate-300';
  const nInput = document.createElement('input');
  nInput.type = 'number';
  nInput.min = '1';
  nInput.max = String(EVERY_N_MAX);
  nInput.value = String(initial && initial.type === 'everyN' ? initial.n : 2);
  nInput.className =
    'w-14 bg-slate-800 border border-slate-700 rounded px-1.5 py-1 text-center text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500';
  everyRow.append(document.createTextNode('A cada'), nInput, document.createTextNode('dia(s)'));

  const weekRow = document.createElement('div');
  weekRow.className = 'flex items-center gap-1';
  const dayBtns = WEEKDAY_LETTERS.map((letter, idx) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = letter;
    b.title = WEEKDAYS[idx];
    b.addEventListener('click', () => {
      if (days.has(idx)) days.delete(idx);
      else days.add(idx);
      paintDays();
    });
    weekRow.appendChild(b);
    return b;
  });

  function paintDays() {
    dayBtns.forEach((b, idx) => {
      const on = days.has(idx);
      b.className =
        'h-6 w-6 rounded-full border text-[10px] font-semibold transition-colors ' +
        (on
          ? 'bg-indigo-600 border-indigo-500 text-white'
          : 'border-slate-600 text-slate-400 hover:border-slate-400');
    });
  }

  function setMode(m) {
    mode = m;
    everyRow.hidden = m !== 'everyN';
    weekRow.hidden = m !== 'weekdays';
    tabEvery.className = tabCls(m === 'everyN');
    tabWeek.className = tabCls(m === 'weekdays');
    if (m === 'weekdays' && days.size === 0) {
      days.add(new Date().getDay());
      paintDays();
    }
  }

  tabEvery.addEventListener('click', () => setMode('everyN'));
  tabWeek.addEventListener('click', () => setMode('weekdays'));

  wrap.append(tabs, everyRow, weekRow);
  paintDays();
  setMode(mode);

  return {
    el: wrap,
    getValue() {
      if (mode === 'weekdays') {
        return normalizeRecurrence({ type: 'weekdays', days: [...days] });
      }
      return normalizeRecurrence({ type: 'everyN', n: clampInt(nInput.value, 1, EVERY_N_MAX, 2) });
    }
  };
}

// Menu de recorrencia (editar tarefa existente): 4 presets + painel personalizado.
function openRecurrenceMenu(anchorEl, currentRec, onApply) {
  closeChoiceMenu();
  const rect = anchorEl.getBoundingClientRect();

  const backdrop = document.createElement('div');
  backdrop.id = 'choice-backdrop';
  backdrop.className = 'fixed inset-0 z-40';
  backdrop.addEventListener('mousedown', closeChoiceMenu);

  const menu = document.createElement('div');
  menu.id = 'choice-menu';
  menu.className =
    'fixed z-50 w-56 rounded-md border border-slate-700 bg-slate-900 shadow-xl p-2 space-y-2 text-xs';
  menu.style.left = Math.round(rect.left) + 'px';
  menu.style.top = Math.round(rect.bottom + 4) + 'px';

  const presets = document.createElement('div');
  presets.className = 'grid grid-cols-2 gap-1';
  for (const p of RECURRENCES) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = RECUR_LABEL[p];
    b.className =
      'px-2 py-1 rounded border text-left transition-colors ' +
      (recurrenceEquals(currentRec, p)
        ? 'border-indigo-500 text-indigo-300'
        : 'border-slate-700 text-slate-300 hover:bg-slate-800');
    b.addEventListener('click', () => {
      closeChoiceMenu();
      onApply(p);
    });
    presets.appendChild(b);
  }

  const sep = document.createElement('div');
  sep.className = 'border-t border-slate-800';

  const capLabel = document.createElement('div');
  capLabel.className = 'text-[10px] uppercase tracking-wide text-slate-500';
  capLabel.textContent = 'Personalizado';

  const custom = makeRecurrenceCustom(typeof currentRec === 'object' ? currentRec : null);

  const apply = document.createElement('button');
  apply.type = 'button';
  apply.className =
    'w-full px-2 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-medium transition-colors';
  apply.textContent = 'Aplicar personalizado';
  apply.addEventListener('click', () => {
    closeChoiceMenu();
    onApply(custom.getValue());
  });

  menu.append(presets, sep, capLabel, custom.el, apply);
  document.body.append(backdrop, menu);

  requestAnimationFrame(() => {
    const mr = menu.getBoundingClientRect();
    if (mr.right > window.innerWidth - 8) {
      menu.style.left = Math.round(window.innerWidth - mr.width - 8) + 'px';
    }
    if (mr.bottom > window.innerHeight - 8) {
      menu.style.top = Math.round(Math.max(8, rect.top - mr.height - 4)) + 'px';
    }
  });
  window.addEventListener('scroll', closeChoiceMenu, { once: true, capture: true });
  window.addEventListener('resize', closeChoiceMenu, { once: true });
}

// Popover de filtros do Modo Widget (tempo + workspace). Fica aberto ate o
// usuario clicar fora — as escolhas aplicam na hora e re-renderizam a lista.
function openWidgetFilters(anchorEl) {
  closeChoiceMenu();
  const rect = anchorEl.getBoundingClientRect();

  const backdrop = document.createElement('div');
  backdrop.id = 'choice-backdrop';
  backdrop.className = 'fixed inset-0 z-40';
  backdrop.addEventListener('mousedown', closeChoiceMenu);

  const MENU_W = 190;
  const menu = document.createElement('div');
  menu.id = 'choice-menu';
  menu.className =
    'fixed z-50 rounded-md border border-slate-700 bg-slate-900 shadow-xl p-2 space-y-1 text-xs ' +
    'max-h-[calc(100vh-2.5rem)] overflow-y-auto';
  menu.style.width = MENU_W + 'px';
  // clamp imediato (a janela do widget e estreita — 250px)
  menu.style.left = Math.round(Math.max(8, Math.min(rect.left, window.innerWidth - MENU_W - 8))) + 'px';
  menu.style.top = Math.round(rect.bottom + 4) + 'px';

  const sectionLabel = (txt) => {
    const d = document.createElement('div');
    d.className = 'px-1 pt-1 pb-0.5 text-[10px] uppercase tracking-wide text-slate-500';
    d.textContent = txt;
    return d;
  };
  const optRow = (label, active, onClick, dotColor) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className =
      'w-full flex items-center gap-2 rounded px-2 py-1 text-left transition-colors ' +
      (active ? 'bg-indigo-600/20 text-indigo-200' : 'text-slate-300 hover:bg-slate-800');
    const lead = document.createElement('span');
    lead.className = 'shrink-0 w-3 flex items-center justify-center';
    if (active) lead.appendChild(icon('Check', { size: 12 }));
    else if (dotColor) {
      const dot = document.createElement('span');
      dot.className = 'h-2 w-2 rounded-full';
      dot.style.background = dotColor;
      lead.appendChild(dot);
    }
    const s = document.createElement('span');
    s.className = 'flex-1 truncate';
    s.textContent = label;
    b.append(lead, s);
    b.addEventListener('click', onClick);
    return b;
  };

  const build = () => {
    menu.replaceChildren();
    menu.appendChild(sectionLabel('Tempo'));
    for (const f of WIDGET_TIME_FILTERS) {
      menu.appendChild(
        optRow(WIDGET_TIME_LABEL[f], prefs.widgetTimeFilter === f, () => {
          prefs.widgetTimeFilter = f;
          savePrefs();
          render();
          build();
        })
      );
    }
    const sep = document.createElement('div');
    sep.className = 'my-1 border-t border-slate-800';
    menu.appendChild(sep);
    menu.appendChild(sectionLabel('Workspace'));
    for (const w of workspaces) {
      menu.appendChild(
        optRow(
          w.name,
          prefs.widgetWorkspaceFilter === w.id,
          () => {
            prefs.widgetWorkspaceFilter = w.id;
            savePrefs();
            render();
            build();
          },
          w.color
        )
      );
    }
  };
  build();

  document.body.append(backdrop, menu);
  requestAnimationFrame(() => {
    const mr = menu.getBoundingClientRect();
    if (mr.right > window.innerWidth - 8) {
      menu.style.left = Math.round(window.innerWidth - mr.width - 8) + 'px';
    }
    if (mr.bottom > window.innerHeight - 8) {
      menu.style.top = Math.round(Math.max(8, rect.top - mr.height - 4)) + 'px';
    }
  });
  window.addEventListener('resize', closeChoiceMenu, { once: true });
}

// Paleta de cores (para workspaces).
function openColorMenu(anchorEl, current, onPick) {
  closeChoiceMenu();
  const rect = anchorEl.getBoundingClientRect();

  const backdrop = document.createElement('div');
  backdrop.id = 'choice-backdrop';
  backdrop.className = 'fixed inset-0 z-40';
  backdrop.addEventListener('mousedown', closeChoiceMenu);

  const menu = document.createElement('div');
  menu.id = 'choice-menu';
  menu.className =
    'fixed z-50 rounded-md border border-slate-700 bg-slate-900 shadow-xl p-2 grid grid-cols-4 gap-1.5';
  menu.style.left = Math.round(rect.left) + 'px';
  menu.style.top = Math.round(rect.bottom + 4) + 'px';

  for (const hex of WS_PALETTE) {
    const sw = document.createElement('button');
    sw.type = 'button';
    sw.className = 'h-5 w-5 rounded-full border-2 transition-transform hover:scale-110';
    sw.style.background = hex;
    sw.style.borderColor = hex === current ? '#ffffff' : 'transparent';
    sw.addEventListener('click', () => {
      closeChoiceMenu();
      onPick(hex);
    });
    menu.appendChild(sw);
  }

  document.body.append(backdrop, menu);
  requestAnimationFrame(() => {
    const mr = menu.getBoundingClientRect();
    if (mr.right > window.innerWidth - 8) {
      menu.style.left = Math.round(window.innerWidth - mr.width - 8) + 'px';
    }
    if (mr.bottom > window.innerHeight - 8) {
      menu.style.top = Math.round(rect.top - mr.height - 4) + 'px';
    }
  });
  window.addEventListener('scroll', closeChoiceMenu, { once: true, capture: true });
}

function inlineTextEditor(value, className, onCommit) {
  const editor = document.createElement('input');
  editor.type = 'text';
  editor.value = value;
  editor.className = className;

  let closed = false;
  const commit = () => {
    if (closed) return;
    closed = true;
    onCommit(editor.value);
  };
  const cancel = () => {
    if (closed) return;
    closed = true;
    render();
  };

  editor.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') commit();
    else if (e.key === 'Escape') cancel();
  });
  editor.addEventListener('blur', commit);
  return editor;
}

// Troca "chipEl" (dentro de "container") por um seletor de data.
function openDateEditor(chipEl, container, currentISO, onCommit) {
  const editor = document.createElement('input');
  editor.type = 'date';
  if (currentISO) editor.value = currentISO;
  editor.className =
    'shrink-0 bg-slate-900 border border-indigo-500 rounded px-1 py-0.5 ' +
    'text-[11px] text-slate-100 focus:outline-none';

  let closed = false;
  const commit = () => {
    if (closed) return;
    closed = true;
    onCommit(editor.value || null);
  };
  editor.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') commit();
    else if (e.key === 'Escape') {
      closed = true;
      render();
    }
  });
  editor.addEventListener('change', commit);
  editor.addEventListener('blur', commit);

  container.replaceChild(editor, chipEl);
  editor.focus();
  try {
    if (editor.showPicker) editor.showPicker();
  } catch {
    /* showPicker pode nao estar disponivel; o campo continua utilizavel */
  }
}

function startEditDue(task, chipEl, row) {
  openDateEditor(chipEl, row, task.dueDate, (iso) => setDueDate(task.id, iso));
}

function clearDropIndicators() {
  for (const el of list.querySelectorAll('.drop-before, .drop-after')) {
    el.classList.remove('drop-before', 'drop-after');
  }
}

/* ---------------- barra de titulo (janela sem moldura) ---------------- */

function setupTitlebar() {
  const pinBtn = document.getElementById('pin-btn');
  const minBtn = document.getElementById('min-btn');
  const maxBtn = document.getElementById('max-btn');
  const closeBtn = document.getElementById('close-btn');

  setBtnIcon(pinBtn, 'PictureInPicture2', { size: 14 });
  setBtnIcon(minBtn, 'Minus', { size: 15 });
  setBtnIcon(maxBtn, 'Square', { size: 13 });
  setBtnIcon(closeBtn, 'X', { size: 15 });
  if (taskDetailsBtn) setBtnIcon(taskDetailsBtn, 'SlidersHorizontal', { size: 15 });
  if (widgetCfgBtn) {
    setBtnIcon(widgetCfgBtn, 'ListFilter', { size: 14 });
    widgetCfgBtn.addEventListener('click', () => openWidgetFilters(widgetCfgBtn));
  }

  // Fora do Electron (ex.: preview no navegador) window.foco nao existe;
  // os controles ficam ali mas inertes em vez de quebrar a pagina.
  if (!window.foco) return;

  const applyOverlay = (on) => {
    overlayMode = Boolean(on);
    pinBtn.classList.toggle('text-indigo-400', overlayMode);
    pinBtn.classList.toggle('bg-indigo-500/10', overlayMode);
    pinBtn.title = overlayMode
      ? 'Sair do modo widget'
      : 'Modo widget (canto da tela, no topo, translucido)';
    // No modo widget nao faz sentido maximizar.
    maxBtn.classList.toggle('hidden', overlayMode);
    render();
  };

  const applyMaximized = (on) => {
    maximized = Boolean(on);
    setBtnIcon(maxBtn, maximized ? 'Copy' : 'Square', { size: 13 });
    maxBtn.title = maximized ? 'Restaurar' : 'Maximizar';
    render();
  };

  pinBtn.addEventListener('click', () => window.foco.toggleOverlay().then(applyOverlay));
  minBtn.addEventListener('click', () => window.foco.minimize());
  maxBtn.addEventListener('click', () => window.foco.toggleMaximize());
  closeBtn.addEventListener('click', () => window.foco.close());

  window.foco.getOverlay().then(applyOverlay);
  window.foco.onOverlayChanged(applyOverlay);
  window.foco.isMaximized().then(applyMaximized);
  window.foco.onMaximizeChanged(applyMaximized);
}

// Re-renderiza se o layout mudar de categoria (ex.: sair/entrar do modo widget).
let resizeTimer = null;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if (layoutMode() !== lastLayout) render();
  }, 150);
});

// Move a linha do "agora" na grade de Semana/Dia a cada minuto (sem re-render).
setInterval(() => {
  const nl = document.querySelector('.tg-now');
  if (!nl) return;
  const n = new Date();
  nl.style.top = Math.round(((n.getHours() * 60 + n.getMinutes()) / 60) * HOUR_PX) + 'px';
}, 60000);

/* ---------------- popover "Detalhes" do formulario ---------------- */

let detailsOpen = false;
// true quando o #task-form foi aberto sob demanda fora das abas onde ele
// normalmente vive (ex.: clique num slot vazio da grade da Agenda) — usado
// pra fechar/limpar tudo direito se o usuario desistir sem salvar.
let taskFormForcedOpen = false;

// Controle do painel "Personalizado..." da recorrencia (criado sob demanda).
let recurCustom = null;

// Mostra/esconde e (re)cria o painel personalizado conforme o <select>.
function syncRecurCustom() {
  const custom = recurSelect.value === 'custom';
  recurCustomEl.hidden = !custom;
  if (custom) {
    recurCustom = makeRecurrenceCustom(recurCustom ? recurCustom.getValue() : null);
    recurCustomEl.replaceChildren(recurCustom.el);
  }
}

// Recorrencia final escolhida no popover (string simples ou objeto personalizado).
function selectedRecurrence() {
  if (recurSelect.value === 'custom') {
    return recurCustom ? recurCustom.getValue() : 'once';
  }
  return recurSelect.value;
}

// Ha algo fora do padrao (data, horario, recorrencia, prioridade, workspace ou habito)?
function detailsActive() {
  return (
    Boolean((!taskDateRow.hidden && taskDateEl.value) || taskStartEl.value || taskEndEl.value) ||
    isRecurring(selectedRecurrence()) ||
    taskPrioEl.value !== 'medium' ||
    (!taskWsRow.hidden && taskWsEl.value && taskWsEl.value !== 'general') ||
    Boolean(taskHabitEl.value)
  );
}

// Reconstroi o seletor de workspace do popover e mostra a linha so no "Geral".
function syncDetailsWorkspace() {
  const show = isMasterWorkspace();
  taskWsRow.hidden = !show;
  if (!show) return;
  const prev = taskWsEl.value;
  taskWsEl.innerHTML = '';
  for (const w of workspaces) {
    const o = document.createElement('option');
    o.value = w.id;
    o.textContent = w.name;
    taskWsEl.appendChild(o);
  }
  taskWsEl.value = workspaces.some((w) => w.id === prev) ? prev : 'general';
}

// Reconstroi o seletor de habito do popover com a lista atual do localStorage.
function syncDetailsHabit() {
  taskHabitRow.hidden = habits.length === 0;
  const prev = taskHabitEl.value;
  taskHabitEl.innerHTML = '';
  const none = document.createElement('option');
  none.value = '';
  none.textContent = 'Nenhum';
  taskHabitEl.appendChild(none);
  for (const h of habits) {
    const o = document.createElement('option');
    o.value = h.id;
    o.textContent = h.name;
    taskHabitEl.appendChild(o);
  }
  taskHabitEl.value = habits.some((h) => h.id === prev) ? prev : '';
}

// Realca o botao de engrenagem quando ha detalhes pendentes.
function updateDetailsIndicator() {
  const on = detailsActive();
  taskDetailsBtn.classList.toggle('text-indigo-400', on);
  taskDetailsBtn.classList.toggle('border-indigo-500/60', on);
  taskDetailsBtn.classList.toggle('text-slate-500', !on);
}

function onDetailsDocDown(e) {
  if (taskDetailsPanel.contains(e.target) || taskDetailsBtn.contains(e.target)) return;
  closeDetails();
}
function onDetailsKey(e) {
  if (e.key === 'Escape') {
    closeDetails();
    input.focus();
  }
}

function openDetails() {
  if (detailsOpen) return;
  detailsOpen = true;
  syncDetailsWorkspace();
  syncDetailsHabit();
  taskDetailsPanel.hidden = false;
  taskDetailsBtn.setAttribute('aria-expanded', 'true');
  taskDetailsBtn.classList.add('bg-slate-700');
  setTimeout(() => document.addEventListener('mousedown', onDetailsDocDown), 0);
  document.addEventListener('keydown', onDetailsKey);
}

function closeDetails() {
  if (!detailsOpen) return;
  detailsOpen = false;
  taskDetailsPanel.hidden = true;
  taskDetailsBtn.setAttribute('aria-expanded', 'false');
  taskDetailsBtn.classList.remove('bg-slate-700');
  document.removeEventListener('mousedown', onDetailsDocDown);
  document.removeEventListener('keydown', onDetailsKey);
  // se o form so estava visivel por causa de um clique num slot da Agenda
  // (fora das abas onde ele normalmente aparece), desistir (Esc/clicar fora/
  // fechar a engrenagem sem salvar) desfaz tudo: esconde o form de novo e
  // limpa os campos, pra nao vazar data/horario pra uma criacao futura normal.
  if (taskFormForcedOpen) {
    taskFormForcedOpen = false;
    form.classList.add('hidden');
    clearDetails();
    input.value = '';
  }
}

// Abre o form de criacao + o popover de detalhes, ja preenchidos com a data/
// hora do slot clicado na grade da Agenda (Dia/Semana/N Dias). So faz sentido
// fora das abas Tarefas/Hoje, onde o form normalmente fica escondido.
function openTaskFormForSlot(iso, time) {
  form.classList.remove('hidden');
  taskFormForcedOpen = true;
  taskDateEl.value = iso;
  taskStartEl.value = time;
  openDetails();
  updateDetailsIndicator();
  input.focus();
}

function clearDetails() {
  taskDateEl.value = '';
  taskStartEl.value = '';
  taskEndEl.value = '';
  recurSelect.value = 'once';
  recurCustom = null;
  syncRecurCustom();
  taskPrioEl.value = 'medium';
  taskWsEl.value = 'general';
  taskHabitEl.value = '';
  updateDetailsIndicator();
}

taskDetailsBtn.addEventListener('click', () => (detailsOpen ? closeDetails() : openDetails()));
taskDetailsClearBtn.addEventListener('click', () => {
  clearDetails();
  input.focus();
});
recurSelect.addEventListener('change', syncRecurCustom);
for (const el of [taskDateEl, taskStartEl, taskEndEl, recurSelect, taskPrioEl, taskWsEl, taskHabitEl]) {
  el.addEventListener('change', updateDetailsIndicator);
}

/* ---------------- eventos globais ---------------- */

form.addEventListener('submit', (e) => {
  e.preventDefault();
  // na aba Hoje o campo Data fica oculto (implicita) — forca hoje no payload,
  // ignorando qualquer valor residual do campo escondido.
  const onToday = layoutMode() === 'today';
  addTask(input.value, {
    recurrence: selectedRecurrence(),
    dueDate: onToday ? todayISO() : taskDateEl.value || null,
    startTime: taskStartEl.value || null,
    endTime: taskEndEl.value || null,
    priority: taskPrioEl.value,
    workspace: taskWsRow.hidden ? prefs.workspace : taskWsEl.value,
    habitId: taskHabitEl.value || null
  });
  input.value = '';
  clearDetails();
  closeDetails();
  input.focus();
});

setupTitlebar();
scheduleMidnightRollover();
render();
