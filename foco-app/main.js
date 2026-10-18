const { app, BrowserWindow, Tray, Menu, ipcMain, screen, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');

// "assets/" e empacotado dentro do app (usado em runtime pela janela/bandeja).
// "build/" e so material do instalador (icone do .exe) e nao vai pro pacote final.
const ICON_PATH = path.join(__dirname, 'assets', 'icon.png');
const STATE_FILE = path.join(app.getPath('userData'), 'window-state.json');

const DEFAULT_STATE = {
  width: 820,
  height: 600,
  x: undefined,
  y: undefined,
  overlay: false,
  preOverlay: null,
  preOverlayMax: false
};

// Modo widget / sobreposicao
const OVERLAY_SIZE = { width: 250, height: 350 };
const OVERLAY_MARGIN = 12;
const OVERLAY_OPACITY = 0.8;
const NORMAL_MIN = { width: 460, height: 460 };
const OVERLAY_MIN = { width: 210, height: 290 };

let win = null;
let tray = null;
let isQuitting = false;
let saveTimer = null;
let overlayMode = false;
let preOverlayBounds = null; // bounds "normais" guardados enquanto o widget esta ativo
let preOverlayMax = false; // se a janela estava maximizada ao entrar no widget

/* ---------------- estado da janela (arquivo JSON em userData) ---------------- */

function loadState() {
  try {
    const raw = fs.readFileSync(STATE_FILE, 'utf-8');
    return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

function saveState(partial) {
  try {
    const next = { ...loadState(), ...partial };
    fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
    fs.writeFileSync(STATE_FILE, JSON.stringify(next));
  } catch (err) {
    console.error('Falha ao salvar estado da janela:', err);
  }
}

function scheduleSaveBounds() {
  // No modo widget a posicao/tamanho sao fixos: nao sobrescreve os bounds normais.
  if (overlayMode) return;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    if (!win || win.isDestroyed()) return;
    const b = win.getBounds();
    saveState({ width: b.width, height: b.height, x: b.x, y: b.y });
  }, 400);
}

// Evita restaurar a janela fora da area visivel (ex: monitor externo desconectado).
function boundsAreVisible(x, y, width, height) {
  if (x === undefined || y === undefined) return false;
  return screen.getAllDisplays().some((d) => {
    const a = d.workArea;
    return x >= a.x && y >= a.y && x + width <= a.x + a.width && y + height <= a.y + a.height;
  });
}

function centeredDefaultBounds() {
  const wa = screen.getPrimaryDisplay().workArea;
  const { width, height } = DEFAULT_STATE;
  return {
    width,
    height,
    x: Math.round(wa.x + (wa.width - width) / 2),
    y: Math.round(wa.y + (wa.height - height) / 2)
  };
}

// Canto inferior direito do monitor onde a janela esta (ou do principal).
function overlayBoundsFor(refBounds) {
  const display = refBounds ? screen.getDisplayMatching(refBounds) : screen.getPrimaryDisplay();
  const wa = display.workArea;
  return {
    width: OVERLAY_SIZE.width,
    height: OVERLAY_SIZE.height,
    x: wa.x + wa.width - OVERLAY_SIZE.width - OVERLAY_MARGIN,
    y: wa.y + wa.height - OVERLAY_SIZE.height - OVERLAY_MARGIN
  };
}

/* ---------------- iniciar com o Windows ---------------- */

// getLoginItemSettings so reconhece o item se receber as MESMAS opcoes usadas
// no set. Em dev o caminho e "electron.exe + caminho do projeto"; depois de
// empacotado (app.isPackaged) e so o proprio .exe instalado.
function loginItemOptions() {
  return {
    path: process.execPath,
    args: app.isPackaged ? [] : [path.resolve(process.argv[1] || app.getAppPath())]
  };
}

function getLaunchAtLogin() {
  return app.getLoginItemSettings(loginItemOptions()).openAtLogin;
}

function setLaunchAtLogin(enabled) {
  app.setLoginItemSettings({ openAtLogin: enabled, ...loginItemOptions() });
}

/* ---------------- modo widget / sobreposicao ---------------- */

function setOverlay(on) {
  on = Boolean(on);
  if (!win || win.isDestroyed() || on === overlayMode) return overlayMode;

  if (on) {
    preOverlayMax = win.isMaximized();
    preOverlayBounds = preOverlayMax ? win.getNormalBounds() : win.getBounds();
    if (preOverlayMax) win.unmaximize();
    overlayMode = true;
    win.setMinimumSize(OVERLAY_MIN.width, OVERLAY_MIN.height);
    win.setBounds(overlayBoundsFor(preOverlayBounds));
    win.setAlwaysOnTop(true);
    win.setOpacity(OVERLAY_OPACITY);
    saveState({ overlay: true, preOverlay: preOverlayBounds, preOverlayMax });
  } else {
    overlayMode = false;
    win.setOpacity(1);
    win.setAlwaysOnTop(false);
    win.setMinimumSize(NORMAL_MIN.width, NORMAL_MIN.height);
    const target =
      preOverlayBounds &&
      boundsAreVisible(
        preOverlayBounds.x,
        preOverlayBounds.y,
        preOverlayBounds.width,
        preOverlayBounds.height
      )
        ? preOverlayBounds
        : centeredDefaultBounds();
    win.setBounds(target);
    if (preOverlayMax) win.maximize();
    preOverlayBounds = null;
    preOverlayMax = false;
    saveState({
      overlay: false,
      preOverlay: null,
      preOverlayMax: false,
      width: target.width,
      height: target.height,
      x: target.x,
      y: target.y
    });
  }

  win.webContents.send('overlay-changed', overlayMode);
  return overlayMode;
}

/* ---------------- janela principal ---------------- */

function createWindow() {
  const state = loadState();
  overlayMode = Boolean(state.overlay);
  preOverlayMax = Boolean(state.preOverlayMax);
  preOverlayBounds =
    state.preOverlay &&
    boundsAreVisible(
      state.preOverlay.x,
      state.preOverlay.y,
      state.preOverlay.width,
      state.preOverlay.height
    )
      ? state.preOverlay
      : null;

  let bounds;
  if (overlayMode) {
    bounds = overlayBoundsFor(preOverlayBounds);
  } else {
    const visible = boundsAreVisible(state.x, state.y, state.width, state.height);
    bounds = {
      width: state.width || DEFAULT_STATE.width,
      height: state.height || DEFAULT_STATE.height,
      x: visible ? state.x : undefined,
      y: visible ? state.y : undefined
    };
  }

  win = new BrowserWindow({
    width: bounds.width,
    height: bounds.height,
    x: bounds.x,
    y: bounds.y,
    minWidth: overlayMode ? OVERLAY_MIN.width : NORMAL_MIN.width,
    minHeight: overlayMode ? OVERLAY_MIN.height : NORMAL_MIN.height,
    frame: false,
    resizable: true,
    alwaysOnTop: overlayMode,
    opacity: overlayMode ? OVERLAY_OPACITY : 1,
    backgroundColor: '#0f172a',
    title: 'Foco',
    icon: ICON_PATH,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.loadFile('index.html');

  win.on('resize', scheduleSaveBounds);
  win.on('move', scheduleSaveBounds);
  win.on('maximize', () => win.webContents.send('maximize-changed', true));
  win.on('unmaximize', () => win.webContents.send('maximize-changed', false));

  // Fechar (X) minimiza para a bandeja em vez de encerrar o processo.
  win.on('close', (e) => {
    if (isQuitting) return;
    e.preventDefault();
    win.hide();
  });

  // Descomente para depurar:
  // win.webContents.openDevTools({ mode: 'detach' });
}

/* ---------------- bandeja do sistema ---------------- */

function buildTrayMenu() {
  return Menu.buildFromTemplate([
    {
      label: 'Abrir Foco',
      click: () => {
        win.show();
        win.focus();
      }
    },
    { type: 'separator' },
    {
      label: 'Modo widget (sobreposicao)',
      type: 'checkbox',
      checked: overlayMode,
      click: (item) => setOverlay(item.checked)
    },
    {
      label: 'Iniciar com o Windows',
      type: 'checkbox',
      checked: getLaunchAtLogin(),
      click: (item) => setLaunchAtLogin(item.checked)
    },
    { type: 'separator' },
    {
      label: 'Sair',
      click: () => {
        isQuitting = true;
        app.quit();
      }
    }
  ]);
}

function createTray() {
  const trayIcon = nativeImage.createFromPath(ICON_PATH).resize({ width: 16, height: 16 });
  tray = new Tray(trayIcon);
  tray.setToolTip('Foco');

  tray.on('click', () => {
    if (win.isVisible()) win.hide();
    else {
      win.show();
      win.focus();
    }
  });

  tray.on('right-click', () => tray.popUpContextMenu(buildTrayMenu()));
}

/* ---------------- IPC (chamado pelo preload.js) ---------------- */

ipcMain.on('window:minimize', () => win && win.minimize());
ipcMain.on('window:close', () => win && win.close());

ipcMain.on('window:toggle-maximize', () => {
  if (!win || overlayMode) return; // no modo widget nao faz sentido maximizar
  if (win.isMaximized()) win.unmaximize();
  else win.maximize();
});
ipcMain.handle('window:is-maximized', () => !!win && win.isMaximized());

ipcMain.handle('window:toggle-overlay', () => setOverlay(!overlayMode));
ipcMain.handle('window:get-overlay', () => overlayMode);

/* ---------------- instancia unica ---------------- */

// So uma instancia do app pode rodar por vez: com mais de uma janela mexendo
// no mesmo localStorage ao mesmo tempo, ha risco de corrida de dados (race
// condition) e corrupcao do estado salvo. Uma segunda tentativa de abrir o
// app so foca a janela que ja esta rodando.
const gotSingleInstanceLock = app.requestSingleInstanceLock();

if (!gotSingleInstanceLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (!win) return;
    if (win.isMinimized()) win.restore();
    // o app fecha (X) pra bandeja em vez de destruir a janela (ver win.on('close')
    // acima) — ela pode estar so oculta, nao minimizada, entao precisa de show()
    if (!win.isVisible()) win.show();
    win.focus();
  });

  /* ---------------- ciclo de vida do app ---------------- */

  app.whenReady().then(() => {
    if (process.platform === 'win32') app.setAppUserModelId('com.foco.app');

    createWindow();
    createTray();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
      else {
        win.show();
        win.focus();
      }
    });
  });

  app.on('before-quit', () => {
    isQuitting = true;
  });

  // O app so fecha de fato pelo item "Sair" da bandeja (ver close acima).
  app.on('window-all-closed', () => {
    // Mantido vazio de proposito: fechar a janela nao deve encerrar o processo,
    // ja que ele continua vivo na bandeja do sistema.
  });
}
