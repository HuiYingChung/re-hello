import { useState, useEffect } from "react";

/* ─── colour tokens ─── */
const C = {
  bg: "#FAF7F2", surface: "#FFFFFF", surfaceAlt: "#F3EDE4",
  text: "#2C2420", textSoft: "#8C7E72", textMuted: "#B5A99A",
  accent: "#D4956A", accentSoft: "#D4956A22", accentBg: "#FFF5EE",
  green: "#6B9E78", greenSoft: "#6B9E7822", greenBg: "#F0F7F1",
  blue: "#6889A8", blueSoft: "#6889A822",
  border: "#EDE6DC", shadow: "0 2px 12px rgba(44,36,32,0.06)",
  nav: "#FFFFFF", navBorder: "#EDE6DC",
};

/* ─── mock data ─── */
const people = [
  { id:1, name:"Rachel", tag:"Book club friend", where:"Local book club", date:"Mar 28", impression:"Warm and curious, laughed a lot", talked:"Taiwanese cooking, her favorite spice shop, the book we discussed", detail:"She's been trying to learn Taiwanese dishes — asked me about ingredients", nextAsk:"Did you end up making that mapo tofu?", reminder:"Before Saturday book club", daysAgo:3, avatar:"R", color:"#D4956A" },
  { id:2, name:"Sarah", tag:"PM at TechCorp", where:"Company happy hour", date:"Mar 15", impression:"Sharp thinker, very approachable", talked:"Product thinking, the book Inspired, her career switch from engineering", detail:"She runs a PM reading group on first Thursdays", nextAsk:"How's the reading group going? Any new book picks?", reminder:"This week", daysAgo:14, avatar:"S", color:"#6889A8" },
  { id:3, name:"Amy", tag:"Google recruiter", where:"ASU Career Fair", date:"Feb 20", impression:"Friendly, remembered my name", talked:"UX research roles, portfolio tips, her own path into recruiting", detail:"Said Google looks for case studies with real users", nextAsk:"Is the UX research position still open?", reminder:"Follow up by Friday", daysAgo:30, avatar:"A", color:"#6B9E78" },
];

/* ─── shared components ─── */
const Pill = ({children,color=C.accent,bg=C.accentSoft}) => (
  <span style={{fontSize:10,fontWeight:600,padding:"3px 9px",borderRadius:20,background:bg,color,letterSpacing:0.3}}>{children}</span>
);
const Avatar = ({letter,color,size=40}) => (
  <div style={{width:size,height:size,borderRadius:size/2,background:color+"18",color,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:size*0.4,fontFamily:"'Instrument Serif', Georgia, serif",flexShrink:0}}>{letter}</div>
);

/* ─── SCREEN: HOME ─── */
function Home({goTo,setPerson}) {
  return (
    <div style={{padding:"20px 20px 100px"}}>
      {/* greeting */}
      <div style={{marginBottom:24}}>
        <div style={{fontSize:14,color:C.textMuted,marginBottom:2}}>Good evening</div>
        <div style={{fontSize:24,fontWeight:700,fontFamily:"'Instrument Serif', Georgia, serif",color:C.text,lineHeight:1.2}}>Remember anyone new?</div>
      </div>

      {/* search */}
      <div style={{background:C.surfaceAlt,borderRadius:12,padding:"11px 14px",marginBottom:20,display:"flex",alignItems:"center",gap:8}}>
        <span style={{color:C.textMuted,fontSize:14}}>🔍</span>
        <span style={{color:C.textMuted,fontSize:13}}>Search people, topics, places...</span>
      </div>

      {/* quick actions */}
      <div style={{display:"flex",gap:8,marginBottom:28}}>
        <button onClick={()=>goTo("add")} style={{flex:1,background:C.accent,color:"#fff",border:"none",borderRadius:12,padding:"14px 10px",cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:600}}>
          + Remember someone
        </button>
        <button onClick={()=>goTo("prep")} style={{flex:1,background:C.greenBg,color:C.green,border:`1px solid ${C.green}33`,borderRadius:12,padding:"14px 10px",cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:600}}>
          🎯 Prep for event
        </button>
      </div>

      {/* recent people */}
      <SectionLabel>Recent people</SectionLabel>
      {people.slice(0,2).map(p=>(
        <PersonRow key={p.id} person={p} onTap={()=>{setPerson(p);goTo("detail")}} />
      ))}

      {/* need review */}
      <SectionLabel style={{marginTop:24}}>Review before you meet again</SectionLabel>
      <div onClick={()=>{setPerson(people[0]);goTo("recall")}} style={{background:C.accentBg,borderRadius:12,padding:14,cursor:"pointer",marginBottom:8,border:`1px solid ${C.accent}22`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <Avatar letter="R" color={C.accent} size={34} />
            <div>
              <div style={{fontWeight:600,fontSize:13,color:C.text}}>Rachel</div>
              <div style={{fontSize:11,color:C.textSoft}}>Book club this Saturday</div>
            </div>
          </div>
          <div style={{fontSize:11,color:C.accent,fontWeight:600}}>Review →</div>
        </div>
      </div>

      {/* reminders */}
      <SectionLabel style={{marginTop:24}}>Upcoming</SectionLabel>
      {[
        {person:people[2],hint:"Ask about the UX research role",time:"By Friday"},
        {person:people[1],hint:"Check in about PM reading group",time:"This week"},
      ].map((r,i)=>(
        <div key={i} style={{background:C.surface,borderRadius:12,padding:12,marginBottom:8,border:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:10}}>
          <Avatar letter={r.person.avatar} color={r.person.color} size={32} />
          <div style={{flex:1}}>
            <div style={{fontSize:12,fontWeight:600,color:C.text}}>{r.person.name} · <span style={{fontWeight:400,color:C.textSoft}}>{r.time}</span></div>
            <div style={{fontSize:11,color:C.green,marginTop:2}}>💬 {r.hint}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

const SectionLabel = ({children, style:s}) => (
  <div style={{fontSize:11,fontWeight:700,color:C.textMuted,letterSpacing:1,textTransform:"uppercase",marginBottom:10,...s}}>{children}</div>
);

const PersonRow = ({person:p, onTap}) => (
  <div onClick={onTap} style={{background:C.surface,borderRadius:12,padding:14,marginBottom:8,cursor:"pointer",border:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:12}}>
    <Avatar letter={p.avatar} color={p.color} size={38} />
    <div style={{flex:1,minWidth:0}}>
      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
        <span style={{fontWeight:600,fontSize:13,color:C.text}}>{p.name}</span>
        <span style={{fontSize:11,color:C.textMuted}}>{p.tag}</span>
      </div>
      <div style={{fontSize:12,color:C.textSoft,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{p.talked.split(",")[0]}</div>
    </div>
    <div style={{fontSize:11,color:C.textMuted,whiteSpace:"nowrap"}}>{p.daysAgo}d ago</div>
  </div>
);

/* ─── SCREEN: ADD (conversational) ─── */
const addSteps = [
  { key:"name", q:"What's their name?", placeholder:"First name is enough", type:"text" },
  { key:"tag", q:"How would you describe them in a few words?", placeholder:"e.g. PM at Google, book club friend", type:"text" },
  { key:"where", q:"Where did you meet?", placeholder:"e.g. career fair, coffee shop, meetup", type:"text" },
  { key:"impression", q:"What was your first impression?", placeholder:"Just a feeling — warm, funny, intense, quiet...", type:"textarea" },
  { key:"talked", q:"What did you two talk about?", placeholder:"Topics, stories, things they shared...", type:"textarea" },
  { key:"detail", q:"Anything interesting you want to remember?", placeholder:"A joke, a book they mentioned, a personal detail...", type:"textarea" },
  { key:"nextAsk", q:"Next time you see them, what could you ask?", placeholder:"This is your future conversation starter", type:"textarea" },
];

function AddPerson({goTo}) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [input, setInput] = useState("");
  const [done, setDone] = useState(false);

  const current = addSteps[step];
  const progress = ((step + 1) / addSteps.length) * 100;

  const next = () => {
    if (!input.trim()) return;
    const updated = {...answers, [current.key]: input.trim()};
    setAnswers(updated);
    setInput("");
    if (step < addSteps.length - 1) setStep(step + 1);
    else setDone(true);
  };
  const back = () => { if(step>0){setStep(step-1);setInput(answers[addSteps[step-1].key]||"");} else goTo("home"); };

  if (done) return (
    <div style={{padding:"40px 24px",textAlign:"center"}}>
      <div style={{fontSize:48,marginBottom:16}}>✨</div>
      <div style={{fontSize:20,fontWeight:700,fontFamily:"'Instrument Serif', Georgia, serif",color:C.text,marginBottom:8}}>Remembered!</div>
      <div style={{fontSize:14,color:C.textSoft,marginBottom:6}}>{answers.name} — {answers.tag}</div>
      <div style={{fontSize:13,color:C.textMuted,lineHeight:1.6,marginBottom:32,maxWidth:280,margin:"0 auto 32px"}}>
        Next time you see them, you'll know exactly what to say.
      </div>
      <button onClick={()=>goTo("home")} style={{background:C.accent,color:"#fff",border:"none",borderRadius:12,padding:"14px 28px",fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Back to home</button>
    </div>
  );

  return (
    <div style={{padding:"20px 20px 100px",display:"flex",flexDirection:"column",minHeight:"calc(100% - 120px)"}}>
      {/* header */}
      <div style={{display:"flex",alignItems:"center",marginBottom:20}}>
        <button onClick={back} style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:C.textSoft,padding:"4px 8px 4px 0"}}>←</button>
        <div style={{flex:1}} />
        <span style={{fontSize:11,color:C.textMuted,fontFamily:"'DM Mono', monospace"}}>{step+1} / {addSteps.length}</span>
      </div>

      {/* progress */}
      <div style={{height:3,background:C.surfaceAlt,borderRadius:2,marginBottom:32,overflow:"hidden"}}>
        <div style={{height:"100%",background:C.accent,borderRadius:2,width:`${progress}%`,transition:"width 0.3s ease"}} />
      </div>

      {/* question */}
      <div style={{fontSize:22,fontWeight:700,fontFamily:"'Instrument Serif', Georgia, serif",color:C.text,lineHeight:1.3,marginBottom:20}}>
        {current.q}
      </div>

      {/* input */}
      {current.type === "textarea" ? (
        <textarea value={input} onChange={e=>setInput(e.target.value)} placeholder={current.placeholder}
          style={{width:"100%",background:C.surfaceAlt,border:`1px solid ${C.border}`,borderRadius:12,padding:14,fontSize:15,color:C.text,fontFamily:"inherit",resize:"none",minHeight:100,outline:"none",boxSizing:"border-box",lineHeight:1.6}} autoFocus />
      ) : (
        <input value={input} onChange={e=>setInput(e.target.value)} placeholder={current.placeholder}
          onKeyDown={e=>e.key==="Enter"&&next()}
          style={{width:"100%",background:C.surfaceAlt,border:`1px solid ${C.border}`,borderRadius:12,padding:14,fontSize:15,color:C.text,fontFamily:"inherit",outline:"none",boxSizing:"border-box"}} autoFocus />
      )}

      <div style={{flex:1}} />

      {/* CTA */}
      <div style={{display:"flex",gap:8,marginTop:24}}>
        {step > 1 && (
          <button onClick={()=>{setStep(s=>s+1);setInput("");}} style={{background:C.surfaceAlt,color:C.textMuted,border:"none",borderRadius:12,padding:"14px 18px",fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>Skip</button>
        )}
        <button onClick={next} disabled={!input.trim()} style={{flex:1,background:input.trim()?C.accent:C.surfaceAlt,color:input.trim()?"#fff":C.textMuted,border:"none",borderRadius:12,padding:"14px",fontSize:14,fontWeight:600,cursor:input.trim()?"pointer":"default",fontFamily:"inherit",transition:"all 0.2s"}}>
          {step === addSteps.length-1 ? "Save ✨" : "Next →"}
        </button>
      </div>
    </div>
  );
}

/* ─── SCREEN: PERSON DETAIL ─── */
function PersonDetail({person:p, goTo}) {
  if(!p) return null;
  return (
    <div style={{padding:"20px 20px 100px"}}>
      <button onClick={()=>goTo("home")} style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:C.textSoft,padding:"4px 8px 4px 0",marginBottom:16}}>← Back</button>
      
      {/* header */}
      <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:24}}>
        <Avatar letter={p.avatar} color={p.color} size={52} />
        <div>
          <div style={{fontSize:22,fontWeight:700,fontFamily:"'Instrument Serif', Georgia, serif",color:C.text}}>{p.name}</div>
          <div style={{fontSize:13,color:C.textSoft}}>{p.tag}</div>
          <div style={{fontSize:11,color:C.textMuted,marginTop:2}}>Met at {p.where} · {p.date}</div>
        </div>
      </div>

      {/* recall card CTA */}
      <button onClick={()=>goTo("recall")} style={{width:"100%",background:C.accentBg,border:`1px solid ${C.accent}33`,borderRadius:12,padding:"14px",cursor:"pointer",fontFamily:"inherit",marginBottom:24,textAlign:"center"}}>
        <span style={{fontSize:13,fontWeight:600,color:C.accent}}>📇 Open Recall Card — quick review before meeting</span>
      </button>

      {/* sections */}
      <DetailSection icon="✦" title="First impression" color={C.accent}>{p.impression}</DetailSection>
      <DetailSection icon="💬" title="What we talked about" color={C.blue}>{p.talked}</DetailSection>
      <DetailSection icon="💡" title="Interesting detail" color={C.green}>{p.detail}</DetailSection>
      <DetailSection icon="🔮" title="Next time I could ask" color={C.accent}>
        <div style={{background:C.accentSoft,borderRadius:8,padding:"10px 12px",fontSize:14,color:C.accent,fontWeight:500,fontStyle:"italic"}}>"{p.nextAsk}"</div>
      </DetailSection>

      {p.reminder && (
        <div style={{background:C.greenBg,borderRadius:12,padding:14,marginTop:8,border:`1px solid ${C.green}22`}}>
          <div style={{fontSize:11,fontWeight:600,color:C.green,marginBottom:4}}>⏰ Reminder</div>
          <div style={{fontSize:13,color:C.text}}>{p.reminder}</div>
        </div>
      )}
    </div>
  );
}

const DetailSection = ({icon,title,color,children}) => (
  <div style={{marginBottom:16}}>
    <div style={{fontSize:11,fontWeight:600,color,marginBottom:6,display:"flex",alignItems:"center",gap:4}}>
      <span>{icon}</span> {title}
    </div>
    <div style={{fontSize:14,color:C.text,lineHeight:1.7,paddingLeft:2}}>{children}</div>
  </div>
);

/* ─── SCREEN: RECALL CARD ─── */
function RecallCard({person:p, goTo}) {
  if(!p) return null;
  return (
    <div style={{padding:"20px",display:"flex",flexDirection:"column",minHeight:"calc(100vh - 40px)",justifyContent:"center",alignItems:"center"}}>
      <div style={{width:"100%",maxWidth:340,background:C.surface,borderRadius:20,padding:"32px 24px",boxShadow:"0 8px 40px rgba(44,36,32,0.10)",border:`1px solid ${C.border}`,position:"relative",overflow:"hidden"}}>
        
        {/* decorative top stripe */}
        <div style={{position:"absolute",top:0,left:0,right:0,height:4,background:`linear-gradient(90deg, ${p.color}, ${C.accent})`}} />

        {/* header */}
        <div style={{textAlign:"center",marginBottom:28}}>
          <Avatar letter={p.avatar} color={p.color} size={56} />
          <div style={{fontSize:26,fontWeight:700,fontFamily:"'Instrument Serif', Georgia, serif",color:C.text,marginTop:10}}>{p.name}</div>
          <div style={{fontSize:12,color:C.textMuted,marginTop:2}}>{p.tag}</div>
        </div>

        {/* recall items */}
        <RecallItem emoji="📍" label="You met" value={`${p.where}, ${p.date}`} />
        <RecallItem emoji="💬" label="You talked about" value={p.talked} />
        <RecallItem emoji="💡" label="Remember this" value={p.detail} />
        
        {/* the big one */}
        <div style={{background:C.accentBg,borderRadius:14,padding:"16px",marginTop:16,textAlign:"center",border:`1px solid ${C.accent}22`}}>
          <div style={{fontSize:10,fontWeight:700,color:C.accent,letterSpacing:1.5,textTransform:"uppercase",marginBottom:6}}>You could ask</div>
          <div style={{fontSize:17,fontWeight:600,fontFamily:"'Instrument Serif', Georgia, serif",color:C.text,lineHeight:1.4}}>"{p.nextAsk}"</div>
        </div>
      </div>

      {/* bottom action */}
      <button onClick={()=>goTo("detail")} style={{marginTop:20,background:C.accent,color:"#fff",border:"none",borderRadius:12,padding:"14px 40px",fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
        Got it, I'm ready 👋
      </button>
      <button onClick={()=>goTo("home")} style={{marginTop:8,background:"none",border:"none",color:C.textMuted,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Back to home</button>
    </div>
  );
}

const RecallItem = ({emoji,label,value}) => (
  <div style={{marginBottom:14}}>
    <div style={{fontSize:10,fontWeight:600,color:C.textMuted,letterSpacing:0.5,marginBottom:3}}>{emoji} {label}</div>
    <div style={{fontSize:14,color:C.text,lineHeight:1.5}}>{value}</div>
  </div>
);

/* ─── SCREEN: EVENT PREP ─── */
function EventPrep({goTo, setPerson}) {
  const [goalSet, setGoalSet] = useState(false);
  return (
    <div style={{padding:"20px 20px 100px"}}>
      <button onClick={()=>goTo("home")} style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:C.textSoft,padding:"4px 8px 4px 0",marginBottom:16}}>← Back</button>

      <div style={{fontSize:22,fontWeight:700,fontFamily:"'Instrument Serif', Georgia, serif",color:C.text,marginBottom:4}}>Prep for your event</div>
      <div style={{fontSize:13,color:C.textSoft,marginBottom:24,lineHeight:1.5}}>Take 2 minutes to feel ready. You've got this.</div>

      {/* step 1: goal */}
      <div style={{background:C.surface,borderRadius:14,padding:16,marginBottom:12,border:`1px solid ${C.border}`}}>
        <div style={{fontSize:11,fontWeight:700,color:C.green,letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>Step 1 · Set a small goal</div>
        <div style={{fontSize:14,color:C.text,marginBottom:12}}>How many new people do you want to meet today?</div>
        <div style={{display:"flex",gap:8}}>
          {["Just 1","2–3 people","I'm feeling brave"].map((opt,i) => (
            <button key={i} onClick={()=>setGoalSet(true)} style={{
              flex:1,padding:"10px 6px",borderRadius:10,border:`1px solid ${goalSet && i===1 ? C.green : C.border}`,
              background: goalSet && i===1 ? C.greenBg : C.surface,
              color: goalSet && i===1 ? C.green : C.textSoft,
              fontSize:12,fontWeight:500,cursor:"pointer",fontFamily:"inherit"
            }}>{opt}</button>
          ))}
        </div>
      </div>

      {/* step 2: familiar faces */}
      <div style={{background:C.surface,borderRadius:14,padding:16,marginBottom:12,border:`1px solid ${C.border}`}}>
        <div style={{fontSize:11,fontWeight:700,color:C.blue,letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>Step 2 · Familiar faces</div>
        <div style={{fontSize:13,color:C.textSoft,marginBottom:10}}>People you've met before who might be there</div>
        {people.slice(0,2).map(p=>(
          <div key={p.id} onClick={()=>{setPerson(p);goTo("recall")}} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",cursor:"pointer",borderBottom:`1px solid ${C.border}`}}>
            <Avatar letter={p.avatar} color={p.color} size={30} />
            <div style={{flex:1}}>
              <span style={{fontSize:13,fontWeight:600,color:C.text}}>{p.name}</span>
              <span style={{fontSize:11,color:C.textMuted,marginLeft:6}}>last talked about {p.talked.split(",")[0].toLowerCase()}</span>
            </div>
            <span style={{fontSize:11,color:C.accent}}>Review</span>
          </div>
        ))}
      </div>

      {/* step 3: conversation starters */}
      <div style={{background:C.surface,borderRadius:14,padding:16,marginBottom:12,border:`1px solid ${C.border}`}}>
        <div style={{fontSize:11,fontWeight:700,color:C.accent,letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>Step 3 · Back-pocket topics</div>
        <div style={{fontSize:13,color:C.textSoft,marginBottom:10}}>Conversation starters you can always use</div>
        {[
          "What are you working on that excites you?",
          "Have you read/watched anything good lately?",
          "How did you end up in your field?",
        ].map((t,i)=>(
          <div key={i} style={{fontSize:13,color:C.text,padding:"8px 12px",background:C.surfaceAlt,borderRadius:8,marginBottom:6,lineHeight:1.4}}>💬 {t}</div>
        ))}
      </div>

      {/* encouragement */}
      <div style={{background:C.greenBg,borderRadius:14,padding:16,textAlign:"center",border:`1px solid ${C.green}22`}}>
        <div style={{fontSize:20,marginBottom:4}}>🌿</div>
        <div style={{fontSize:14,fontWeight:600,color:C.green,marginBottom:4}}>Remember</div>
        <div style={{fontSize:13,color:C.textSoft,lineHeight:1.5}}>You don't need to talk to everyone. One genuine conversation is worth more than ten business cards.</div>
      </div>
    </div>
  );
}

/* ─── APP SHELL ─── */
export default function App() {
  const [screen, setScreen] = useState("home");
  const [person, setPerson] = useState(people[0]);
  const [fadeKey, setFadeKey] = useState(0);

  const goTo = (s) => { setScreen(s); setFadeKey(k=>k+1); };

  const navItems = [
    { id:"home", label:"Home", icon:"🏠" },
    { id:"people", label:"People", icon:"👥" },
    { id:"add", label:"Add", icon:"✚", isAdd:true },
    { id:"reminders", label:"Reminders", icon:"🔔" },
    { id:"profile", label:"Profile", icon:"⚙️" },
  ];

  return (
    <div style={{display:"flex",justifyContent:"center",alignItems:"flex-start",minHeight:"100vh",background:"#E8E2D9",padding:"20px 10px",fontFamily:"'Outfit', 'Noto Sans TC', system-ui, sans-serif"}}>
      <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Outfit:wght@300;400;500;600;700&family=DM+Mono:wght@400&display=swap" rel="stylesheet" />

      {/* phone frame */}
      <div style={{width:375,minHeight:740,background:C.bg,borderRadius:32,overflow:"hidden",position:"relative",boxShadow:"0 20px 60px rgba(0,0,0,0.15)"}}>
        
        {/* status bar */}
        <div style={{height:44,background:C.bg,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div style={{width:80,height:5,borderRadius:3,background:C.border}} />
        </div>

        {/* screen content */}
        <div key={fadeKey} style={{animation:"fadeIn 0.2s ease",overflow:"auto",height:"calc(100% - 44px - 68px)"}}>
          {screen==="home" && <Home goTo={goTo} setPerson={setPerson} />}
          {screen==="add" && <AddPerson goTo={goTo} />}
          {screen==="detail" && <PersonDetail person={person} goTo={goTo} />}
          {screen==="recall" && <RecallCard person={person} goTo={goTo} />}
          {screen==="prep" && <EventPrep goTo={goTo} setPerson={setPerson} />}
        </div>

        {/* bottom nav */}
        {screen!=="recall" && (
          <div style={{position:"absolute",bottom:0,left:0,right:0,height:68,background:C.nav,borderTop:`1px solid ${C.navBorder}`,display:"flex",alignItems:"center",justifyContent:"space-around",padding:"0 8px"}}>
            {navItems.map(item=>(
              <button key={item.id} onClick={()=>{if(item.id==="home"||item.id==="add")goTo(item.id)}}
                style={{background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:2,padding:"6px 12px",fontFamily:"inherit",
                  opacity: (screen===item.id || (screen==="detail"&&item.id==="people") || (screen==="prep"&&item.id==="home")) ? 1 : 0.4
                }}>
                <span style={{fontSize:item.isAdd?22:18}}>{item.icon}</span>
                <span style={{fontSize:9,color:C.text,fontWeight:500}}>{item.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
}
