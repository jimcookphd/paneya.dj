import Webamp from 'https://unpkg.com/webamp@2.3.1/built/webamp.bundle.min.mjs';

const output = document.querySelector('#output');
const status = document.querySelector('#status');
const input = document.querySelector('#command');
let currentDirectory = '/home/anonymous';

function shellPrompt() {
  const location = currentDirectory === '/home/anonymous' ? '~' : '~/Music';
  return `anonymous@dance:${location}$ `;
}

function musicFilenames() {
  return tracks.map(track => {
    const pathname = new URL(track.url, window.location.href).pathname;
    return decodeURIComponent(pathname.split('/').pop());
  });
}
const menuToggle = document.querySelector('#menu-toggle');
const siteMenu = document.querySelector('#site-menu');
const mixSelect = document.querySelector('#mix-select');
const accessibleAudio = document.querySelector('#accessible-audio');
const accessibleStatus = document.querySelector('#accessible-status');
let activePanel = null;

function toggleMenu(open) {
  siteMenu.hidden = !open;
  menuToggle.setAttribute('aria-expanded', String(open));
}
menuToggle.addEventListener('click', () => toggleMenu(siteMenu.hidden));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !siteMenu.hidden) {
    toggleMenu(false);
    menuToggle.focus();
  }
});
document.addEventListener('click', event => {
  if (!event.target.closest('.site-navigation')) toggleMenu(false);
});
function openPanel(id) {
  if (activePanel) document.getElementById(activePanel).hidden = true;
  activePanel = id;
  const panel = document.getElementById(id);
  panel.hidden = false;
  panel.querySelector('h1').setAttribute('tabindex', '-1');
  panel.querySelector('h1').focus();
}
document.querySelectorAll('[data-panel]').forEach(button => button.addEventListener('click', () => {
  toggleMenu(false);
  openPanel(button.dataset.panel);
}));
document.querySelector('#focus-terminal').addEventListener('click', () => {
  toggleMenu(false);
  document.querySelector('#command').focus();
});
document.querySelectorAll('.close-panel').forEach(button => button.addEventListener('click', () => {
  button.closest('.accessible-panel').hidden = true;
  activePanel = null;
  menuToggle.focus();
}));
function chooseMix(index) {
  const item = tracks[index];
  if (!item) return;
  accessibleAudio.pause();
  accessibleAudio.src = item.url;
  accessibleAudio.load();
  accessibleStatus.textContent = `Selected: ${item.metaData.title}`;
}
mixSelect.addEventListener('change', () => chooseMix(Number(mixSelect.value)));
accessibleAudio.addEventListener('play', () => {
  // Prevent two separate playback engines playing at the same time.
  if (webamp) webamp.pause();
  accessibleStatus.textContent = `Playing: ${tracks[Number(mixSelect.value)]?.metaData.title || 'mix'}`;
});
accessibleAudio.addEventListener('pause', () => {
  if (!accessibleAudio.ended) accessibleStatus.textContent = 'Paused';
});
accessibleAudio.addEventListener('error', () => {
  accessibleStatus.textContent = 'Audio unavailable. Please try another mix.';
});

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
let tracks = [];
let webamp = null;
let playerStarting = false;
let pid = 1842;
const llamaSound = new Audio('./llama.mp3');
llamaSound.preload = 'none';

function playLlamaSound() {
  llamaSound.currentTime = 0;
  llamaSound.play().catch(() => {
    // Browsers may block audio during the automated login sequence.
  });
}

function print(message = '') {
  const line = document.createElement('div');
  line.textContent = message;
  output.append(line);
  output.scrollTop = output.scrollHeight;
}

async function typeCommand(command) {
  const line = document.createElement('div');
  line.textContent = shellPrompt();
  output.append(line);
  for (const char of command) {
    line.textContent += char;
    output.scrollTop = output.scrollHeight;
    await delay(65);
  }
  await delay(350);
}

async function startWinamp() {
  if (webamp) {
    print('winamp: already running');
    return;
  }
  if (playerStarting) return;
  playerStarting = true;
  try {
    if (!Webamp.browserIsSupported()) throw new Error('Browser not supported');
    const instance = new Webamp({ initialTracks: tracks, enableMediaSession: true });
    await instance.renderWhenReady(document.querySelector('#winamp-container'));
    webamp = instance;
    // The player can also be closed using its own close button.
    if (typeof instance.onClose === 'function') {
      instance.onClose(() => { if (webamp === instance) webamp = null; });
    }
    status.textContent = `Ready · ${tracks.length} mixes loaded`;
  } catch (error) {
    print(`winamp: ${error.message}`);
    status.textContent = `Winamp failed: ${error.message}`;
  } finally {
    playerStarting = false;
  }
}

async function stopWinamp() {
  if (!webamp) return print('kill: no such process');
  const instance = webamp;
  webamp = null;
  try { await instance.dispose(); } catch (error) { print(`kill: ${error.message}`); }
  print(`[${pid}] terminated`);
}

function showFinger() {
  print('Login: paneya                  Name: P4#!Я');
  print('Directory: /home/paneya        Shell: /bin/bash');
  print('Project: Music, movement, and experimentation');
  print('Plan: Make people dance.');
}

async function execute(line, interactive = false) {
  const [command, ...args] = line.trim().split(/\s+/);
  switch (command?.toLowerCase()) {
    case '': return;
    case 'sudo':
      print('[sudo] anonymous is not in the sudoers file.');
      print('This incident will be reported.');
      return;
    case 'finger':
      if (!args.length || args[0] === 'paneya') showFinger();
      else print(`finger: ${args[0]}: no such user`);
      return;
    case 'winamp':
      if (webamp) return print('winamp: already running');
      print(`[1] ${pid}`);
      print('Starting Winamp...');
      if (interactive) playLlamaSound();
      await startWinamp();
      return;
    case 'ps':
      print('  PID TTY      CMD');
      print(' 1901 pts/0    sh');
      if (webamp) print(` ${pid} pts/0    winamp`);
      return;
    case 'kill':
      if (args.includes(String(pid)) || args.includes('%1')) await stopWinamp();
      else print('kill: no such process');
      return;
    case 'pkill':
      if (args.includes('winamp')) await stopWinamp();
      else print('pkill: no matching processes');
      return;
    case 'cd': {
      const destination = args[0] || '~';
      if (destination === '~' || destination === '/home/anonymous' ||
          destination === '..' || destination === '../') {
        currentDirectory = '/home/anonymous';
      } else if ((destination === 'Music' && currentDirectory === '/home/anonymous') ||
                 destination === '/home/anonymous/Music' ||
                 (destination === '.' || destination === './')) {
        if (destination !== '.' && destination !== './') {
          currentDirectory = '/home/anonymous/Music';
        }
      } else {
        print(`cd: ${destination}: No such file or directory`);
      }
      return;
    }
    case 'ls':
      if (currentDirectory === '/home/anonymous') print('Music  .plan');
      else musicFilenames().forEach(filename => print(filename));
      return;
    case 'cat':
      if (args[0] === '.plan' && currentDirectory === '/home/anonymous') print('Make people dance.');
      else print(`cat: ${args[0] || ''}: No such file`);
      return;
    case 'pwd': print(currentDirectory); return;
    case 'whoami': print('anonymous'); return;
    case 'uname': print(args.includes('-a') ? 'Linux dance 6.12.0-amd64 x86_64 GNU/Linux' : 'Linux'); return;
    case 'date': print(new Date().toString()); return;
    case 'clear': output.replaceChildren(); return;
    case 'play':
      accessibleAudio.pause();
      if (!webamp) return print('winamp: not running');
      if (args[0]) {
        const n = Number(args[0]);
        if (!Number.isInteger(n) || n < 1 || n > tracks.length) return print('play: invalid track number');
        webamp.setTracksToPlay(tracks.slice(n - 1));
      } else webamp.play();
      return;
    case 'pause': webamp?.pause(); return;
    case 'stop': webamp?.stop(); return;
    case 'next': webamp?.nextTrack(); return;
    case 'prev': webamp?.previousTrack(); return;
    case 'exit': print('logout'); print('Connection to dance closed.'); input.disabled = true; return;
    default: print(`${command}: command not found`);
  }
}

async function boot() {
  print('Linux dance 6.12.0-amd64 x86_64');
  print();
  print('Welcome to danceOS.');
  print();
  print('Last login: Sat Nov 14 21:13:00 2026 from unknown');
  print();
  print('The programs included with this system are free software.');
  print();
  await delay(500);
  await typeCommand('sudo su');
  await execute('sudo su');
  print();
  await delay(450);
  await typeCommand('finger paneya');
  await execute('finger paneya');
  print();
  await delay(450);
  await typeCommand('winamp &');
  await execute('winamp &');
  print();
  input.disabled = false;
  status.textContent = `danceOS ready · ${tracks.length} mixes`;
}

document.querySelector('#shell').addEventListener('submit', async event => {
  event.preventDefault();
  if (input.disabled) return;
  const line = input.value.trim();
  input.value = '';
  if (!line) return;
  print(shellPrompt() + line);
  input.disabled = true;
  try { await execute(line, true); }
  catch (error) { print(`sh: ${error.message}`); }
  finally {
    if (line !== 'exit') { input.disabled = false; input.focus(); }
  }
});

try {
  const response = await fetch('./playlist.json', { cache: 'no-store' });
  if (!response.ok) throw new Error(`playlist.json returned ${response.status}`);
  const data = await response.json();
  if (!Array.isArray(data)) throw new Error('playlist.json must contain an array');
  tracks = data.filter(item => item?.url && item?.title).map(item => ({
    url: item.url,
    metaData: { artist: item.artist || 'P4#!Я', title: item.title },
    ...(Number.isFinite(item.duration) ? { duration: item.duration } : {})
  }));
  mixSelect.replaceChildren();
  tracks.forEach((track, index) => {
    const option = document.createElement('option');
    option.value = String(index);
    option.textContent = track.metaData.title;
    mixSelect.append(option);
  });
  if (tracks.length) chooseMix(0);
  else accessibleStatus.textContent = 'No mixes available.';
  await boot();
} catch (error) {
  status.textContent = `Startup failed: ${error.message}`;
  print(`danceOS: ${error.message}`);
  input.disabled = false;
}
