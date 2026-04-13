import { useState, useRef, useCallback, useEffect } from "react";

const PINT_CALS = 220;
const CAL_PER_STEP = 0.04;
const STEP_TARGET = 10000;

/* ── Utils ── */
function runCal(w, d, t) { const p = t/d; const m = p<4.5?12.8:p<5?11.5:p<5.5?10:p<6?9:p<7?8:7; return (m*3.5*w/200)*t; }
function cycleCal(w, d, t, e) { const s=d/(t/60); const m=s<16?4:s<19?6.8:s<22?8:s<26?10:12; return (m*3.5*w/200)*t+e*w*0.005; }
function weekKey() { const d=new Date(); const jan1=new Date(d.getFullYear(),0,1); const days=Math.floor((d-jan1)/86400000); return `${d.getFullYear()}-W${String(Math.ceil((days+jan1.getDay()+1)/7)).padStart(2,"0")}`; }
function todayKey() { return new Date().toISOString().slice(0,10); }
function genCode() { const c="ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; let r=""; for(let i=0;i<6;i++) r+=c[Math.floor(Math.random()*c.length)]; return r; }

/* ── Pedometer ── */
function usePedometer() {
  const [steps,setSteps]=useState(0); const [active,setActive]=useState(false);
  const ref=useRef({steps:0,lp:0,ab:false});
  const hm=useCallback((e)=>{const a=e.accelerationIncludingGravity;if(!a||a.x==null)return;const mag=Math.sqrt(a.x**2+a.y**2+a.z**2);const now=Date.now();const r=ref.current;if(mag>12.5&&!r.ab){r.ab=true;if(now-r.lp>300){r.lp=now;r.steps++;setSteps(r.steps);}}if(mag<11)r.ab=false;},[]);
  useEffect(()=>{let ok=false;(async()=>{if(typeof DeviceMotionEvent!=="undefined"&&typeof DeviceMotionEvent.requestPermission==="function"){try{const p=await DeviceMotionEvent.requestPermission();if(p!=="granted")return;}catch{return;}}if(!window.DeviceMotionEvent)return;window.addEventListener("devicemotion",hm);ok=true;setActive(true);})();return()=>{if(ok)window.removeEventListener("devicemotion",hm);};},[hm]);
  return {steps,active};
}

/* ── Storage (localStorage for PWA) ── */
function useStored(key, init) {
  const [val, setVal] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : init; } catch { return init; }
  });
  const set = useCallback((v) => {
    setVal(prev => {
      const n = typeof v === "function" ? v(prev) : v;
      try { localStorage.setItem(key, JSON.stringify(n)); } catch {}
      return n;
    });
  }, [key]);
  return [val, set, true]; // always "loaded" with localStorage
}

/* ── Design Tokens ── */
const F=`'Outfit',system-ui,sans-serif`;
const S=`'Fraunces',Georgia,serif`;
const amber="#F59E0B";const amberL="#FBBF24";const dim="#78716C";const dimr="#57534E";
const card="#131110";const cardB="#252220";const bg="#0A0908";

/* ── Step Ring ── */
function StepRing({steps,active}) {
  const pct=Math.min(steps/STEP_TARGET,1);const r=82;const c=2*Math.PI*r;const off=c-pct*c;
  return (
    <div style={{position:"relative",width:210,height:210,margin:"0 auto"}}>
      <svg viewBox="0 0 210 210" width="210" height="210" style={{transform:"rotate(-90deg)"}}>
        <circle cx="105" cy="105" r={r} fill="none" stroke="#1E1C1A" strokeWidth="10"/>
        <circle cx="105" cy="105" r={r} fill="none" stroke="url(#ag)" strokeWidth="10"
          strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round"
          style={{transition:"stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)"}}/>
        <defs><linearGradient id="ag" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor={amberL}/><stop offset="100%" stopColor="#D97706"/></linearGradient></defs>
      </svg>
      <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
        <div style={{fontFamily:S,fontSize:38,fontWeight:900,color:"#FAFAF9",lineHeight:1}}>{steps.toLocaleString()}</div>
        <div style={{fontSize:10,color:dimr,textTransform:"uppercase",letterSpacing:"0.14em",marginTop:2,fontWeight:600}}>/ {(STEP_TARGET/1000).toFixed(0)}k steps</div>
        {active&&<div style={{display:"flex",alignItems:"center",gap:5,marginTop:8,background:"rgba(34,197,94,0.1)",borderRadius:20,padding:"3px 10px"}}>
          <span style={{width:5,height:5,borderRadius:"50%",background:"#22C55E",boxShadow:"0 0 6px #22C55E",animation:"pulse 1.5s infinite"}}/>
          <span style={{fontSize:9,color:"#4ADE80",fontWeight:600,letterSpacing:"0.06em",textTransform:"uppercase"}}>Live</span>
        </div>}
      </div>
    </div>
  );
}

/* ── Inputs ── */
const inp={width:"100%",background:"#1E1C1A",border:"1px solid #2A2725",borderRadius:10,padding:"13px 14px",color:"#FAFAF9",fontSize:15,fontFamily:F,outline:"none",boxSizing:"border-box",transition:"border-color 0.2s"};
const lbl={fontSize:10,color:dim,textTransform:"uppercase",letterSpacing:"0.12em",fontWeight:700,marginBottom:5,display:"block"};
const btnP=(ok)=>({width:"100%",padding:"15px",border:"none",borderRadius:12,fontSize:15,fontWeight:700,fontFamily:F,cursor:"pointer",color:"#0A0908",background:ok?`linear-gradient(135deg,${amberL},${amber})`:"#2A2725",boxShadow:ok?"0 4px 24px rgba(251,191,36,0.2)":"none",transition:"all 0.3s"});

/* ── Profile ── */
function ProfileScreen({onSave,existing}) {
  const [age,sA]=useState(existing?.age||"");const [sex,sS]=useState(existing?.sex||"male");
  const [height,sH]=useState(existing?.height||"");const [weight,sW]=useState(existing?.weight||"");
  const [name,sN]=useState(existing?.name||"");
  const ok=age&&height&&weight&&name;
  return (
    <div style={{padding:"56px 24px",maxWidth:380,margin:"0 auto"}}>
      <div style={{textAlign:"center",marginBottom:44}}>
        <div style={{fontSize:44,marginBottom:10}}>🍻</div>
        <h1 style={{fontFamily:S,fontSize:32,fontWeight:900,margin:0,color:"#FAFAF9"}}>Sips</h1>
        <p style={{color:dimr,fontSize:12,marginTop:6,letterSpacing:"0.14em",textTransform:"uppercase",fontWeight:600}}>{existing?"Edit profile":"Create your profile"}</p>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:18}}>
        <div><label style={lbl}>Display Name</label><input type="text" placeholder="Your name" value={name} onChange={e=>sN(e.target.value)} style={inp}/></div>
        <div style={{display:"flex",gap:10}}>
          <div style={{flex:1}}><label style={lbl}>Age</label><input type="number" placeholder="28" value={age} onChange={e=>sA(e.target.value)} style={inp} inputMode="numeric"/></div>
          <div style={{flex:1}}>
            <label style={lbl}>Sex</label>
            <div style={{display:"flex",gap:6}}>{["M","F"].map((s,i)=>{const v=["male","female"][i];return(
              <button key={v} onClick={()=>sS(v)} style={{flex:1,padding:"13px 0",borderRadius:10,border:sex===v?`1.5px solid ${amber}`:"1px solid #2A2725",background:sex===v?"rgba(245,158,11,0.08)":"#1E1C1A",color:sex===v?amberL:dim,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:F}}>{s}</button>
            );})}</div>
          </div>
        </div>
        <div style={{display:"flex",gap:10}}>
          <div style={{flex:1}}><label style={lbl}>Height (cm)</label><input type="number" placeholder="175" value={height} onChange={e=>sH(e.target.value)} style={inp} inputMode="numeric"/></div>
          <div style={{flex:1}}><label style={lbl}>Weight (kg)</label><input type="number" placeholder="72" value={weight} onChange={e=>sW(e.target.value)} style={inp} inputMode="numeric"/></div>
        </div>
        <button disabled={!ok} onClick={()=>onSave({...existing,name,age:+age,sex,height:+height,weight:+weight})} style={{...btnP(ok),marginTop:8}}>
          {existing?"Save Changes":"Get Started"}
        </button>
      </div>
    </div>
  );
}

/* ── Log Activity ── */
function LogScreen({type,profile,onSave,onBack}) {
  const isR=type==="run";const [dist,sD]=useState("");const [time,sT]=useState("");const [elev,sE]=useState("");
  const ok=dist&&time&&(isR||elev);
  const cal=ok?(isR?runCal(profile.weight,+dist,+time):cycleCal(profile.weight,+dist,+time,+elev)):0;
  const pints=cal/PINT_CALS;
  return (
    <div style={{padding:"28px 24px",maxWidth:380,margin:"0 auto"}}>
      <button onClick={onBack} style={{background:"#1E1C1A",border:"1px solid #2A2725",borderRadius:8,color:dim,fontSize:12,cursor:"pointer",fontFamily:F,padding:"7px 14px",fontWeight:600,marginBottom:28}}>← Back</button>
      <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:28}}>
        <div style={{width:52,height:52,borderRadius:14,background:"rgba(245,158,11,0.08)",border:"1px solid rgba(245,158,11,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26}}>{isR?"🏃":"🚴"}</div>
        <div><h2 style={{fontFamily:S,fontSize:24,fontWeight:900,margin:0,color:"#FAFAF9"}}>Log {isR?"Run":"Ride"}</h2><p style={{color:dimr,fontSize:11,margin:0,textTransform:"uppercase",letterSpacing:"0.08em",fontWeight:600}}>Enter your details</p></div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <div style={{display:"flex",gap:10}}>
          <div style={{flex:1}}><label style={lbl}>Distance (km)</label><input type="number" placeholder="5.0" value={dist} onChange={e=>sD(e.target.value)} style={inp} inputMode="decimal" step="0.1"/></div>
          <div style={{flex:1}}><label style={lbl}>Time (min)</label><input type="number" placeholder="30" value={time} onChange={e=>sT(e.target.value)} style={inp} inputMode="numeric"/></div>
        </div>
        {!isR&&<div><label style={lbl}>Elevation Gain (m)</label><input type="number" placeholder="120" value={elev} onChange={e=>sE(e.target.value)} style={inp} inputMode="numeric"/></div>}
        {ok&&<div style={{background:card,border:`1px solid ${cardB}`,borderRadius:16,padding:"22px",textAlign:"center"}}>
          <span style={{fontSize:10,color:dimr,textTransform:"uppercase",letterSpacing:"0.12em",fontWeight:700}}>This earns you</span>
          <div style={{fontFamily:S,fontSize:44,fontWeight:900,color:amberL,lineHeight:1,margin:"8px 0 4px"}}>{pints.toFixed(1)}</div>
          <span style={{fontSize:13,color:"#A8A29E",fontWeight:500}}>{pints<1?"pint":"pints"} <span style={{color:dimr}}>· {Math.round(cal)} cal</span></span>
        </div>}
        <button disabled={!ok} onClick={()=>onSave({type,dist:+dist,time:+time,elev:isR?0:+elev,cals:Math.round(cal),date:new Date().toISOString()})} style={btnP(ok)}>🍺 Log Activity</button>
      </div>
    </div>
  );
}

/* ── Home Tab ── */
function HomeTab({profile,activities,pedometer,onNavigate,onEditProfile}) {
  const stepCal=pedometer.steps*CAL_PER_STEP;const actCal=activities.reduce((s,a)=>s+a.cals,0);
  const totalCal=stepCal+actCal;const totalP=totalCal/PINT_CALS;
  return (
    <div style={{padding:"28px 20px 120px",maxWidth:420,margin:"0 auto"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:28}}>
        <h1 style={{fontFamily:S,fontSize:22,fontWeight:900,margin:0,color:"#FAFAF9"}}>Sips</h1>
        <button onClick={onEditProfile} style={{background:"#1E1C1A",border:"1px solid #2A2725",borderRadius:8,padding:"6px 12px",color:dim,fontSize:10,cursor:"pointer",fontFamily:F,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase"}}>{profile.name}</button>
      </div>
      <div style={{background:card,border:`1px solid ${cardB}`,borderRadius:24,padding:"32px 20px 28px",marginBottom:14}}>
        <StepRing steps={pedometer.steps} active={pedometer.active}/>
        {pedometer.steps>0&&<p style={{textAlign:"center",fontSize:12,color:dim,margin:"14px 0 0"}}>{(stepCal/PINT_CALS).toFixed(1)} pints from steps · {Math.round(stepCal)} cal</p>}
        {!pedometer.active&&<p style={{textAlign:"center",fontSize:11,color:dimr,margin:"10px 0 0"}}>Pedometer unavailable on this device</p>}
      </div>
      <div style={{background:"linear-gradient(135deg,rgba(245,158,11,0.06),rgba(217,119,6,0.03))",border:"1px solid rgba(245,158,11,0.12)",borderRadius:18,padding:"22px 20px",marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div><div style={{fontSize:10,color:amber,textTransform:"uppercase",letterSpacing:"0.12em",fontWeight:700,marginBottom:2}}>Total earned</div><div style={{fontSize:12,color:dim}}>{Math.round(totalCal)} calories burned</div></div>
        <div style={{textAlign:"right"}}><div style={{fontFamily:S,fontSize:36,fontWeight:900,color:amberL,lineHeight:1}}>{totalP.toFixed(1)}</div><div style={{fontSize:10,color:amber,fontWeight:600,letterSpacing:"0.06em"}}>PINTS</div></div>
      </div>
      <div style={{display:"flex",gap:10,marginBottom:24}}>
        {[["run","🏃","Log Run"],["cycle","🚴","Log Ride"]].map(([id,ic,lb])=>(
          <button key={id} onClick={()=>onNavigate(id)} style={{flex:1,background:card,border:`1px solid ${cardB}`,borderRadius:14,padding:"20px 12px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:8,transition:"all 0.2s"}}>
            <div style={{width:44,height:44,borderRadius:12,background:"rgba(245,158,11,0.06)",border:"1px solid rgba(245,158,11,0.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>{ic}</div>
            <span style={{fontSize:12,fontWeight:700,color:"#D6D3D1",fontFamily:F}}>{lb}</span>
          </button>
        ))}
      </div>
      {activities.length>0&&<>
        <div style={{fontSize:10,color:dim,textTransform:"uppercase",letterSpacing:"0.12em",fontWeight:700,marginBottom:10}}>Today's Activities</div>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {activities.map((a,i)=>(
            <div key={i} style={{background:card,border:`1px solid ${cardB}`,borderRadius:12,padding:"14px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:20}}>{a.type==="run"?"🏃":"🚴"}</span>
                <div><div style={{fontSize:13,fontWeight:600,color:"#FAFAF9"}}>{a.dist}km · {a.time}min</div><div style={{fontSize:10,color:dimr}}>{a.cals} cal{a.type==="cycle"&&a.elev?` · ${a.elev}m elev`:""}</div></div>
              </div>
              <div style={{textAlign:"right"}}><div style={{fontFamily:S,fontSize:18,fontWeight:900,color:amberL,lineHeight:1}}>{(a.cals/PINT_CALS).toFixed(1)}</div><div style={{fontSize:9,color:dim,fontWeight:600}}>pints</div></div>
            </div>
          ))}
        </div>
      </>}
    </div>
  );
}

/* ── Leaderboard Tab ── */
function LeaderboardTab({profile,weeklyPints}) {
  const [friends,setFriends]=useStored("sips-friends",[]);
  const [addCode,setAddCode]=useState("");
  const [copied,setCopied]=useState(false);
  const wk=weekKey();

  // Build board from local data (for full multi-user, add Firebase)
  const board = [
    {code:profile.code,name:profile.name||"You",pints:weeklyPints,isMe:true},
    ...friends.map(f=>({code:f.code,name:f.name||f.code,pints:f.pints||0,isMe:false}))
  ].sort((a,b)=>b.pints-a.pints);

  const addFriend=()=>{
    const code=addCode.trim().toUpperCase();
    if(!code||code.length!==6||code===profile.code||friends.find(f=>f.code===code))return;
    setFriends(prev=>[...prev,{code,name:code,pints:0}]);
    setAddCode("");
  };

  const copyCode=()=>{
    navigator.clipboard?.writeText(profile.code).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2000);}).catch(()=>{});
  };

  const medals=["🥇","🥈","🥉"];

  return (
    <div style={{padding:"28px 20px 120px",maxWidth:420,margin:"0 auto"}}>
      <h1 style={{fontFamily:S,fontSize:22,fontWeight:900,margin:"0 0 6px",color:"#FAFAF9"}}>Leaderboard</h1>
      <p style={{fontSize:11,color:dimr,margin:"0 0 24px",textTransform:"uppercase",letterSpacing:"0.1em",fontWeight:600}}>Weekly rankings · {wk}</p>

      <div style={{background:card,border:`1px solid ${cardB}`,borderRadius:16,padding:"16px 18px",marginBottom:12,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <div style={{fontSize:10,color:dim,textTransform:"uppercase",letterSpacing:"0.1em",fontWeight:700,marginBottom:4}}>Your friend code</div>
          <div style={{fontFamily:"'Courier New',monospace",fontSize:22,fontWeight:700,color:amberL,letterSpacing:"0.2em"}}>{profile.code}</div>
        </div>
        <button onClick={copyCode} style={{background:"rgba(245,158,11,0.08)",border:`1px solid rgba(245,158,11,0.15)`,borderRadius:10,padding:"10px 16px",color:amberL,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:F,transition:"all 0.2s"}}>
          {copied?"Copied!":"Copy"}
        </button>
      </div>

      <div style={{display:"flex",gap:8,marginBottom:24}}>
        <input type="text" placeholder="Enter friend code" value={addCode} onChange={e=>setAddCode(e.target.value.toUpperCase())}
          maxLength={6} style={{...inp,flex:1,fontFamily:"'Courier New',monospace",letterSpacing:"0.15em",textTransform:"uppercase"}}/>
        <button onClick={addFriend} style={{background:addCode.length===6?`linear-gradient(135deg,${amberL},${amber})`:"#2A2725",border:"none",borderRadius:10,padding:"0 20px",color:"#0A0908",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:F,transition:"all 0.2s"}}>Add</button>
      </div>

      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        {board.map((entry,i)=>(
          <div key={entry.code} style={{
            background:entry.isMe?"rgba(245,158,11,0.04)":card,
            border:entry.isMe?`1px solid rgba(245,158,11,0.15)`:`1px solid ${cardB}`,
            borderRadius:14,padding:"14px 16px",display:"flex",alignItems:"center",gap:14,
          }}>
            <div style={{width:32,textAlign:"center"}}>
              {i<3?<span style={{fontSize:22}}>{medals[i]}</span>:<span style={{fontFamily:S,fontSize:18,fontWeight:900,color:dimr}}>{i+1}</span>}
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:14,fontWeight:600,color:entry.isMe?"#FAFAF9":"#D6D3D1"}}>
                {entry.name}{entry.isMe&&<span style={{fontSize:10,color:amber,marginLeft:6,fontWeight:700}}>YOU</span>}
              </div>
              <div style={{fontSize:10,color:dimr,fontFamily:"'Courier New',monospace",letterSpacing:"0.08em"}}>{entry.code}</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontFamily:S,fontSize:22,fontWeight:900,color:i===0?amberL:"#A8A29E",lineHeight:1}}>{entry.pints.toFixed(1)}</div>
              <div style={{fontSize:9,color:dim,fontWeight:600}}>pints</div>
            </div>
          </div>
        ))}
      </div>

      <p style={{textAlign:"center",color:dimr,fontSize:10,margin:"24px 0 0",lineHeight:1.6}}>
        Friend scores update when you're on the same network.<br/>For real-time sync, connect a backend like Firebase.
      </p>
    </div>
  );
}

/* ── Tab Bar ── */
function TabBar({tab,setTab}) {
  const tabs=[["home","Home","M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"],["board","Leaderboard","M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"]];
  return (
    <div style={{position:"fixed",bottom:0,left:0,right:0,background:"rgba(10,9,8,0.92)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",borderTop:"1px solid #1E1C1A",padding:"8px 0 env(safe-area-inset-bottom,8px)",zIndex:100}}>
      <div style={{display:"flex",maxWidth:420,margin:"0 auto"}}>
        {tabs.map(([id,label,path])=>{
          const on=tab===id;
          return (
            <button key={id} onClick={()=>setTab(id)} style={{flex:1,background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"6px 0"}}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={on?amberL:dimr} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={path}/></svg>
              <span style={{fontSize:10,fontWeight:on?700:500,color:on?amberL:dimr,fontFamily:F,letterSpacing:"0.02em"}}>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── App ── */
export default function App() {
  const [profile,setProfile]=useStored("sips-profile",null);
  const [activities,setActivities]=useStored(`sips-activities-${todayKey()}`,[]);
  const [weekAct,setWeekAct]=useStored(`sips-weekpints-${weekKey()}`,0);
  const [screen,setScreen]=useState(()=>profile?"app":"profile");
  const [tab,setTab]=useState("home");
  const pedometer=usePedometer();

  const stepCal=pedometer.steps*CAL_PER_STEP;
  const actCal=activities.reduce((s,a)=>s+a.cals,0);
  const totalPints=(stepCal+actCal)/PINT_CALS;

  const saveProfile=(p)=>{
    if(!p.code) p.code=genCode();
    setProfile(p);setScreen("app");
  };
  const saveLog=(a)=>{
    setActivities(prev=>[a,...prev]);
    setWeekAct(prev=>prev+(a.cals/PINT_CALS));
    setScreen("app");
  };

  return (
    <div style={{minHeight:"100vh",background:bg,color:"#FAFAF9",fontFamily:F}}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Fraunces:opsz,wght@9..144,700;9..144,900&display=swap" rel="stylesheet"/>

      {screen==="profile"&&<ProfileScreen onSave={saveProfile} existing={profile}/>}
      {screen==="app"&&tab==="home"&&profile&&(
        <HomeTab profile={profile} activities={activities} pedometer={pedometer}
          onNavigate={(s)=>{if(s==="run"||s==="cycle")setScreen("log-"+s);else setTab(s);}} onEditProfile={()=>setScreen("profile")}/>
      )}
      {screen==="app"&&tab==="board"&&profile&&(
        <LeaderboardTab profile={profile} weeklyPints={totalPints+weekAct}/>
      )}
      {(screen==="log-run"||screen==="log-cycle")&&profile&&(
        <LogScreen type={screen.replace("log-","")} profile={profile} onSave={saveLog} onBack={()=>setScreen("app")}/>
      )}
      {screen==="app"&&<TabBar tab={tab} setTab={setTab}/>}

      <style>{`
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
        input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}
        input[type=number]{-moz-appearance:textfield}
        input::placeholder{color:#44403C}
        input:focus{border-color:${amber} !important}
        button:active{transform:scale(0.97)}
        *{-webkit-tap-highlight-color:transparent}
      `}</style>
    </div>
  );
}
