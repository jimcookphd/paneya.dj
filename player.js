import Webamp from 'https://unpkg.com/webamp@2.3.1/built/webamp.bundle.min.mjs';

const output = document.querySelector('#output');
const status = document.querySelector('#status');
const input = document.querySelector('#command');
const prompt = 'anonymous@dance:~$ ';
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
let tracks = [];
let webamp = null;
let playerStarting = false;
let pid = 1842;

function print(message = '') {
  const line = document.createElement('div');
  line.textContent = message;
  output.append(line);
  output.scrollTop = output.scrollHeight;
}

async function typeCommand(command) {
  const line = document.createElement('div');
  line.textContent = prompt;
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

async function execute(line) {
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
    case 'ls':
      print('Music  .plan');
      return;
    case 'cat':
      if (args[0] === '.plan') print('Make people dance.');
      else print(`cat: ${args[0] || ''}: No such file`);
      return;
    case 'pwd': print('/home/anonymous'); return;
    case 'whoami': print('anonymous'); return;
    case 'uname': print(args.includes('-a') ? 'Linux dance 6.12.0-amd64 x86_64 GNU/Linux' : 'Linux'); return;
    case 'date': print(new Date().toString()); return;
    case 'clear': output.replaceChildren(); return;
    case 'play':
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
  print(prompt + line);
  input.disabled = true;
  try { await execute(line); }
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
  await boot();
} catch (error) {
  status.textContent = `Startup failed: ${error.message}`;
  print(`danceOS: ${error.message}`);
  input.disabled = false;
}
