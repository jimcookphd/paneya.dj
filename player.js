import Webamp from 'https://unpkg.com/webamp@2.3.1/built/webamp.bundle.min.mjs';
const output=document.querySelector('#output');
const status=document.querySelector('#status');
const print=(message)=>{const div=document.createElement('div');div.textContent=message;output.append(div);output.scrollTop=output.scrollHeight;};
let tracks=[],webamp;
try{
 const response=await fetch('./playlist.json',{cache:'no-store'});
 if(!response.ok)throw new Error(`playlist.json returned ${response.status}`);
 const data=await response.json();
 if(!Array.isArray(data))throw new Error('playlist.json must contain an array');
 tracks=data.filter(item=>item&&item.url&&item.title).map(item=>({url:item.url,metaData:{artist:item.artist||'P4#!Я',title:item.title},...(Number.isFinite(item.duration)?{duration:item.duration}:{})}));
 if(!Webamp.browserIsSupported())throw new Error('Webamp is not supported by this browser');
 webamp=new Webamp({initialTracks:tracks,enableMediaSession:true});
 await webamp.renderWhenReady(document.getElementById('winamp-container'));
 status.textContent=`Ready · ${tracks.length} mix${tracks.length===1?'':'es'} loaded · Drag the Winamp windows to arrange them`;
 print(`Loaded ${tracks.length} mix${tracks.length===1?'':'es'}.`);
}catch(error){status.textContent='Player failed to initialize: '+error.message;print('ERROR: '+error.message);}
const commands={help:()=>print('Commands: help, ls, play [number], pause, stop, next, prev, about, clear'),ls:()=>print(tracks.length?tracks.map((t,i)=>`${i+1}. ${t.metaData.title}`).join('\n'):'No mixes in playlist.'),about:()=>print('P4#!Я / PANEYA · future funk, bass, and musical experiments.'),clear:()=>{output.textContent='';},play:(arg)=>{if(!webamp)return print('Player not ready.');if(arg){const n=Number(arg);if(!Number.isInteger(n)||n<1||n>tracks.length)return print('Use play [track number].');webamp.setTracksToPlay(tracks.slice(n-1));}else webamp.play();},pause:()=>webamp?.pause(),stop:()=>webamp?.stop(),next:()=>webamp?.nextTrack(),prev:()=>webamp?.previousTrack()};
document.querySelector('#shell').addEventListener('submit',event=>{event.preventDefault();const input=document.querySelector('#command');const line=input.value.trim();input.value='';if(!line)return;print('paneya@dance:~$ '+line);const [cmd,...args]=line.split(/\s+/);try{(commands[cmd.toLowerCase()]||(()=>print(`${cmd}: command not found (try help)`)))(args[0]);}catch(error){print('Error: '+error.message);}});
