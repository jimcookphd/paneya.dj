'use strict';
const $ = id => document.getElementById(id);
const audio=$('audio'), list=$('playlist'), title=$('trackTitle'), state=$('state');
let tracks=[], current=-1;
const fmt=s=>{if(!Number.isFinite(s))return '00:00';s=Math.floor(s);return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`};
function render(){list.replaceChildren();$('count').textContent=`${tracks.length} TRACK${tracks.length===1?'':'S'}`;if(!tracks.length){let li=document.createElement('li');li.className='empty';li.textContent='No mixes loaded yet — add MP3 URLs to playlist.json';list.append(li);return;}tracks.forEach((t,i)=>{let li=document.createElement('li');li.textContent=`${String(i+1).padStart(2,'0')}. ${t.title}`;li.className=i===current?'active':'';li.onclick=()=>load(i,true);list.append(li)})}
function load(i,autoplay=false){if(i<0||i>=tracks.length)return;current=i;audio.src=tracks[i].url;title.textContent=tracks[i].title;$('seek').value=0;$('duration').textContent='00:00';render();if(autoplay)play()}
async function play(){if(current<0){if(!tracks.length){print('No mixes available yet.');return;}load(0)}try{await audio.play()}catch(e){print('Playback unavailable: '+e.message)}}
function pause(){audio.pause()}function stop(){audio.pause();audio.currentTime=0;state.textContent='STOP'}function step(d){if(tracks.length)load((current+d+tracks.length)%tracks.length,true)}
$('play').onclick=play;$('pause').onclick=pause;$('stop').onclick=stop;$('prev').onclick=()=>step(-1);$('next').onclick=()=>step(1);
$('volume').oninput=e=>audio.volume=Number(e.target.value)/100;audio.volume=.8;
$('seek').oninput=e=>{if(Number.isFinite(audio.duration)&&audio.duration>0)audio.currentTime=audio.duration*Number(e.target.value)/1000};
audio.ontimeupdate=()=>{$('elapsed').textContent=fmt(audio.currentTime);if(Number.isFinite(audio.duration)&&audio.duration>0)$('seek').value=Math.round(audio.currentTime/audio.duration*1000)};
audio.onloadedmetadata=()=>{$('duration').textContent=fmt(audio.duration)};audio.onplay=()=>{state.textContent='PLAY';$('meters').classList.add('playing')};audio.onpause=()=>{state.textContent='PAUSE';$('meters').classList.remove('playing')};audio.onended=()=>step(1);audio.onerror=()=>{if(audio.src)print('Audio unavailable. Check the URL in playlist.json.')};
function print(s){let div=document.createElement('div');div.textContent=s;$('terminalOutput').append(div);$('terminalOutput').scrollTop=$('terminalOutput').scrollHeight}
$('commandForm').onsubmit=e=>{e.preventDefault();let raw=$('command').value.trim();$('command').value='';if(!raw)return;print('paneya@dance:~$ '+raw);let [cmd,...args]=raw.split(/\s+/);switch(cmd.toLowerCase()){case 'help':print('Commands: help, ls, play [number], pause, stop, next, prev, about, clear');break;case 'ls':print(tracks.length?tracks.map((t,i)=>`${i+1}  ${t.title}`).join('\n'):'No mixes loaded.');break;case 'play':{let n=args.length?Number(args[0])-1:current;if(n>=0&&n<tracks.length)load(n,true);else play();break}case 'pause':pause();break;case 'stop':stop();break;case 'next':step(1);break;case 'prev':step(-1);break;case 'about':print('P4#!Я / PANEYA — future funk, bass music, and musical experiments.');break;case 'clear':$('terminalOutput').replaceChildren();break;default:print(`${cmd}: command not found (try help)`)}};
fetch('playlist.json').then(r=>{if(!r.ok)throw Error(r.status);return r.json()}).then(data=>{tracks=Array.isArray(data)?data.filter(t=>t.title&&t.url):[];render()}).catch(()=>{render();print('Could not load playlist.json.')});
render();
