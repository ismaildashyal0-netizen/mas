import { useState, useEffect, useRef } from "react";

// ─── Design Tokens ──────────────────────────────────────────────────────────
const C = {
  bg:'#060b14', s0:'#0c1424', s1:'#111e30', s2:'#162540',
  b0:'#1c2d44', b1:'#2d4a72',
  blue:'#3b82f6', blueH:'#60a5fa', blueT:'rgba(59,130,246,0.15)',
  amber:'#f59e0b', amberT:'rgba(245,158,11,0.15)',
  green:'#22c55e', greenT:'rgba(34,197,94,0.12)',
  red:'#ef4444', redT:'rgba(239,68,68,0.12)',
  purple:'#a855f7', purpleT:'rgba(168,85,247,0.12)',
  cyan:'#06b6d4', cyanT:'rgba(6,182,212,0.12)',
  pink:'#ec4899', orange:'#f97316',
  t0:'#e2e8f0', t1:'#94a3b8', t2:'#64748b', t3:'#2e4060',
};

const TASK_STATUSES = ['not-started','in-progress','blocked','review','done'];
const COMP_STATUSES  = ['not-started','in-progress','testing','deployed','blocked'];
const RISK_STATUSES  = ['open','mitigated','closed'];
const MS_STATUSES    = ['pending','at-risk','achieved'];

const STATUS_CFG = {
  'not-started':{ label:'Not Started', dot:C.t3,  bg:'transparent'  },
  'in-progress': { label:'In Progress', dot:C.blue, bg:C.blueT   },
  'blocked':     { label:'Blocked',     dot:C.red,  bg:C.redT    },
  'review':      { label:'Review',      dot:C.amber,bg:C.amberT  },
  'done':        { label:'Done',        dot:C.green,bg:C.greenT  },
  'deployed':    { label:'Deployed',    dot:C.green,bg:C.greenT  },
  'testing':     { label:'Testing',     dot:C.purple,bg:C.purpleT},
  'pending':     { label:'Pending',     dot:C.t2,  bg:'transparent'  },
  'at-risk':     { label:'At Risk',     dot:C.amber,bg:C.amberT  },
  'achieved':    { label:'Achieved',    dot:C.green,bg:C.greenT  },
  'open':        { label:'Open',        dot:C.red,  bg:C.redT    },
  'mitigated':   { label:'Mitigated',   dot:C.amber,bg:C.amberT  },
  'closed':      { label:'Closed',      dot:C.green,bg:C.greenT  },
};

const PRI_CFG = {
  'critical':{ label:'Critical', color:'#ff4545' },
  'high':    { label:'High',     color:C.amber   },
  'medium':  { label:'Medium',   color:C.blue    },
  'low':     { label:'Low',      color:C.t2      },
};

const SEV_CFG = {
  'critical':{ label:'Critical', color:'#ff4545' },
  'high':    { label:'High',     color:C.amber   },
  'medium':  { label:'Medium',   color:C.blue    },
  'low':     { label:'Low',      color:C.t2      },
};

const PHASE_COLORS = [C.cyan, C.blue, C.purple, C.amber, C.orange, C.green, C.pink];

// ─── Seed Data ──────────────────────────────────────────────────────────────
const INIT = {
  phases:[
    {id:1,name:'Infrastructure Setup'},
    {id:2,name:'OpenShift (RHOCP)'},
    {id:3,name:'IBM Cloud Pak Components'},
    {id:4,name:'MAS Core Deployment'},
    {id:5,name:'MAS Applications'},
    {id:6,name:'Integration & Testing'},
    {id:7,name:'Go-Live & Handover'},
  ],
  components:[
    {id:'hw',   name:'Hardware / Server Provisioning',     phase:1,status:'in-progress',notes:''},
    {id:'net',  name:'Network Configuration & VLANs',      phase:1,status:'not-started',notes:''},
    {id:'dns',  name:'DNS Setup',                          phase:1,status:'not-started',notes:''},
    {id:'lb',   name:'Load Balancer Setup',                phase:1,status:'not-started',notes:''},
    {id:'stor', name:'Persistent Storage (NFS / OCS)',     phase:1,status:'not-started',notes:''},
    {id:'ldap', name:'LDAP / Active Directory Integration',phase:1,status:'not-started',notes:''},
    {id:'ca',   name:'Certificate Authority Setup',        phase:1,status:'not-started',notes:''},
    {id:'ocp',  name:'RHOCP Cluster Installation',        phase:2,status:'not-started',notes:''},
    {id:'wkr',  name:'Worker Node Configuration',          phase:2,status:'not-started',notes:''},
    {id:'sc',   name:'Storage Class Setup',                phase:2,status:'not-started',notes:''},
    {id:'reg',  name:'Internal Image Registry',            phase:2,status:'not-started',notes:''},
    {id:'np',   name:'Network Policies',                   phase:2,status:'not-started',notes:''},
    {id:'rbac', name:'RBAC Configuration',                 phase:2,status:'not-started',notes:''},
    {id:'cat',  name:'IBM Operator Catalog',               phase:3,status:'not-started',notes:''},
    {id:'cs',   name:'IBM Common Services',                phase:3,status:'not-started',notes:''},
    {id:'cm',   name:'Cert Manager Operator',              phase:3,status:'not-started',notes:''},
    {id:'lic',  name:'IBM Licensing Service',              phase:3,status:'not-started',notes:''},
    {id:'db2',  name:'Db2 Operator & Instance',            phase:3,status:'not-started',notes:''},
    {id:'mdb',  name:'MongoDB Operator & Instance',        phase:3,status:'not-started',notes:''},
    {id:'ss',   name:'IBM Shared Services',                phase:3,status:'not-started',notes:''},
    {id:'mop',  name:'MAS Operator Installation',          phase:4,status:'not-started',notes:''},
    {id:'mc',   name:'MAS Core Configuration',             phase:4,status:'not-started',notes:''},
    {id:'smtp', name:'SMTP Configuration',                 phase:4,status:'not-started',notes:''},
    {id:'idp',  name:'IdP (LDAP) Integration',             phase:4,status:'not-started',notes:''},
    {id:'lup',  name:'License File Upload',                phase:4,status:'not-started',notes:''},
    {id:'mgm',  name:'Maximo Manage',                      phase:5,status:'not-started',notes:''},
    {id:'mhl',  name:'MAS Health',                         phase:5,status:'not-started',notes:''},
    {id:'mpd',  name:'MAS Predict',                        phase:5,status:'not-started',notes:''},
    {id:'mvi',  name:'MAS Visual Inspection',              phase:5,status:'not-started',notes:''},
    {id:'mon',  name:'MAS Monitor',                        phase:5,status:'not-started',notes:''},
    {id:'e2e',  name:'End-to-End Connectivity Test',       phase:6,status:'not-started',notes:''},
    {id:'pb',   name:'Performance Baseline',               phase:6,status:'not-started',notes:''},
    {id:'ft',   name:'Failover Testing',                   phase:6,status:'not-started',notes:''},
    {id:'uat',  name:'UAT Sign-off',                       phase:6,status:'not-started',notes:''},
    {id:'sa',   name:'Security Audit',                     phase:6,status:'not-started',notes:''},
    {id:'cut',  name:'Production Cutover',                 phase:7,status:'not-started',notes:''},
    {id:'mig',  name:'Data Migration',                     phase:7,status:'not-started',notes:''},
    {id:'trn',  name:'Training Sessions',                  phase:7,status:'not-started',notes:''},
    {id:'doc',  name:'Documentation Handover',             phase:7,status:'not-started',notes:''},
    {id:'gl',   name:'Go-Live Sign-off',                   phase:7,status:'not-started',notes:''},
  ],
  team:[
    {id:1,name:'Team Lead',        role:'Project Lead / Architect',   initials:'TL',color:C.blue  },
    {id:2,name:'Infra Engineer',   role:'Infrastructure Engineer',    initials:'IE',color:C.cyan  },
    {id:3,name:'OCP Admin',        role:'OpenShift Administrator',    initials:'OA',color:C.purple},
    {id:4,name:'DBA',              role:'Database Administrator',     initials:'DB',color:C.amber },
    {id:5,name:'MAS Specialist',   role:'IBM MAS Engineer',           initials:'MS',color:C.red   },
    {id:6,name:'Security Eng.',    role:'Security / Network Eng.',    initials:'SE',color:C.green },
    {id:7,name:'QA Engineer',      role:'QA / Test Engineer',         initials:'QA',color:C.pink  },
  ],
  tasks:[
    {id:'t01',title:'Finalize hardware BOM & procurement',         phase:1,compId:'hw',  assigneeId:1,status:'in-progress',priority:'critical',deadline:'2025-02-15',notes:''},
    {id:'t02',title:'Configure server BIOS and IPMI',              phase:1,compId:'hw',  assigneeId:2,status:'not-started',priority:'high',    deadline:'2025-02-20',notes:''},
    {id:'t03',title:'Design network topology and VLANs',           phase:1,compId:'net', assigneeId:6,status:'in-progress',priority:'high',    deadline:'2025-02-18',notes:''},
    {id:'t04',title:'Configure DNS zones for OCP cluster',         phase:1,compId:'dns', assigneeId:6,status:'not-started',priority:'high',    deadline:'2025-02-22',notes:''},
    {id:'t05',title:'Setup HAProxy / F5 load balancer',            phase:1,compId:'lb',  assigneeId:2,status:'not-started',priority:'high',    deadline:'2025-02-25',notes:''},
    {id:'t06',title:'Provision NFS storage volumes for OCP',       phase:1,compId:'stor',assigneeId:2,status:'not-started',priority:'critical',deadline:'2025-02-28',notes:''},
    {id:'t07',title:'Integrate LDAP schema with Active Directory', phase:1,compId:'ldap',assigneeId:6,status:'not-started',priority:'high',    deadline:'2025-03-05',notes:''},
    {id:'t08',title:'Generate root CA and intermediate certs',     phase:1,compId:'ca',  assigneeId:6,status:'not-started',priority:'high',    deadline:'2025-03-05',notes:''},
    {id:'t09',title:'Run OCP IPI installer',                       phase:2,compId:'ocp', assigneeId:3,status:'not-started',priority:'critical',deadline:'2025-03-15',notes:''},
    {id:'t10',title:'Add and label compute worker nodes',          phase:2,compId:'wkr', assigneeId:3,status:'not-started',priority:'high',    deadline:'2025-03-18',notes:''},
    {id:'t11',title:'Configure OCS/Rook storage classes',          phase:2,compId:'sc',  assigneeId:3,status:'not-started',priority:'high',    deadline:'2025-03-20',notes:''},
    {id:'t12',title:'Setup internal container image registry',     phase:2,compId:'reg', assigneeId:3,status:'not-started',priority:'medium',  deadline:'2025-03-22',notes:''},
    {id:'t13',title:'Deploy IBM Operator Catalog sources',         phase:3,compId:'cat', assigneeId:5,status:'not-started',priority:'critical',deadline:'2025-04-01',notes:''},
    {id:'t14',title:'Install IBM Common Services',                 phase:3,compId:'cs',  assigneeId:5,status:'not-started',priority:'high',    deadline:'2025-04-05',notes:''},
    {id:'t15',title:'Install Cert Manager Operator',               phase:3,compId:'cm',  assigneeId:5,status:'not-started',priority:'high',    deadline:'2025-04-08',notes:''},
    {id:'t16',title:'Deploy IBM Licensing Service',                phase:3,compId:'lic', assigneeId:5,status:'not-started',priority:'critical',deadline:'2025-04-10',notes:''},
    {id:'t17',title:'Deploy Db2 operator and create instance',     phase:3,compId:'db2', assigneeId:4,status:'not-started',priority:'critical',deadline:'2025-04-15',notes:''},
    {id:'t18',title:'Deploy MongoDB operator and instance',        phase:3,compId:'mdb', assigneeId:4,status:'not-started',priority:'critical',deadline:'2025-04-15',notes:''},
    {id:'t19',title:'Install MAS operator from OperatorHub',       phase:4,compId:'mop', assigneeId:5,status:'not-started',priority:'critical',deadline:'2025-05-01',notes:''},
    {id:'t20',title:'Create MAS Core instance and configure',      phase:4,compId:'mc',  assigneeId:5,status:'not-started',priority:'critical',deadline:'2025-05-05',notes:''},
    {id:'t21',title:'Configure SMTP for MAS notifications',        phase:4,compId:'smtp',assigneeId:5,status:'not-started',priority:'medium',  deadline:'2025-05-08',notes:''},
    {id:'t22',title:'Connect MAS to LDAP/AD identity provider',    phase:4,compId:'idp', assigneeId:5,status:'not-started',priority:'high',    deadline:'2025-05-10',notes:''},
    {id:'t23',title:'Upload AppPoint license file to MAS',         phase:4,compId:'lup', assigneeId:1,status:'not-started',priority:'critical',deadline:'2025-05-12',notes:''},
    {id:'t24',title:'Deploy and configure Maximo Manage app',      phase:5,compId:'mgm', assigneeId:5,status:'not-started',priority:'critical',deadline:'2025-05-20',notes:''},
    {id:'t25',title:'Run E2E smoke test across all services',       phase:6,compId:'e2e', assigneeId:7,status:'not-started',priority:'critical',deadline:'2025-06-10',notes:''},
    {id:'t26',title:'Conduct UAT with business end-users',         phase:6,compId:'uat', assigneeId:7,status:'not-started',priority:'critical',deadline:'2025-06-20',notes:''},
    {id:'t27',title:'Security vulnerability assessment',           phase:6,compId:'sa',  assigneeId:6,status:'not-started',priority:'high',    deadline:'2025-06-15',notes:''},
    {id:'t28',title:'Execute production cutover plan',             phase:7,compId:'cut', assigneeId:1,status:'not-started',priority:'critical',deadline:'2025-07-01',notes:''},
    {id:'t29',title:'Complete user training program',              phase:7,compId:'trn', assigneeId:1,status:'not-started',priority:'high',    deadline:'2025-07-05',notes:''},
    {id:'t30',title:'Deliver all technical documentation',         phase:7,compId:'doc', assigneeId:1,status:'not-started',priority:'high',    deadline:'2025-07-10',notes:''},
  ],
  milestones:[
    {id:'m1',name:'Infrastructure Ready',      date:'2025-03-07',status:'pending',  phaseId:1},
    {id:'m2',name:'OCP Cluster Live',          date:'2025-03-25',status:'pending',  phaseId:2},
    {id:'m3',name:'Cloud Pak Services Live',   date:'2025-04-20',status:'pending',  phaseId:3},
    {id:'m4',name:'MAS Core Live',             date:'2025-05-15',status:'pending',  phaseId:4},
    {id:'m5',name:'MAS Applications Live',     date:'2025-05-30',status:'pending',  phaseId:5},
    {id:'m6',name:'UAT Complete',              date:'2025-06-25',status:'pending',  phaseId:6},
    {id:'m7',name:'Production Go-Live',        date:'2025-07-01',status:'pending',  phaseId:7},
  ],
  risks:[
    {id:'r01',title:'Storage IOPS insufficient for Db2 workloads',    severity:'high',    likelihood:'medium',status:'open',owner:'DBA',          mitigation:'Benchmark storage; provision dedicated SSD tier for Db2',notes:''},
    {id:'r02',title:'IBM license delivery delays',                     severity:'critical',likelihood:'low',   status:'open',owner:'Team Lead',     mitigation:'Initiate procurement 6 weeks before Phase 4',          notes:''},
    {id:'r03',title:'LDAP schema incompatibility with MAS',            severity:'high',    likelihood:'medium',status:'open',owner:'Security Eng.', mitigation:'Validate LDAP attributes against MAS requirements early',notes:''},
    {id:'r04',title:'Certificate management complexity at scale',      severity:'medium',  likelihood:'high',  status:'open',owner:'Security Eng.', mitigation:'Use Cert Manager automation; document renewal schedule',  notes:''},
    {id:'r05',title:'OCP cluster upgrade breaking MAS compatibility',  severity:'medium',  likelihood:'medium',status:'open',owner:'OCP Admin',     mitigation:'Lock OCP version until MAS certified; test upgrades in staging',notes:''},
  ],
  standups:[],
  nextId:1000,
};

// ─── Utilities ──────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2,8);
const today = () => new Date().toISOString().slice(0,10);
const fmtDate = d => { if(!d) return '—'; const dt=new Date(d+'T00:00:00'); return dt.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}); };
const daysLeft = d => { if(!d) return null; const diff=Math.ceil((new Date(d+'T00:00:00')-new Date())/(1000*60*60*24)); return diff; };
const clamp = (v,a,b) => Math.min(Math.max(v,a),b);

// ─── Small Components ───────────────────────────────────────────────────────
const Dot = ({color,size=7,pulse})=>(
  <span style={{display:'inline-block',width:size,height:size,borderRadius:'50%',background:color,flexShrink:0,animation:pulse?'pulse 2s infinite':undefined}}/>
);

const Badge = ({status,small})=>{
  const cfg=STATUS_CFG[status]||{label:status,dot:C.t2,bg:'transparent'};
  return(
    <span style={{display:'inline-flex',alignItems:'center',gap:5,padding:small?'2px 7px':'3px 9px',borderRadius:4,background:cfg.bg,border:`1px solid ${cfg.dot}22`,fontSize:small?10:11,fontWeight:500,color:cfg.dot,fontFamily:"'IBM Plex Mono',monospace",whiteSpace:'nowrap'}}>
      <Dot color={cfg.dot} size={5}/>{cfg.label}
    </span>
  );
};

const PriBadge = ({priority,small})=>{
  const cfg=PRI_CFG[priority]||{label:priority,color:C.t2};
  return(
    <span style={{display:'inline-flex',alignItems:'center',gap:4,padding:small?'2px 6px':'3px 8px',borderRadius:4,border:`1px solid ${cfg.color}33`,fontSize:small?10:11,fontWeight:600,color:cfg.color,fontFamily:"'IBM Plex Mono',monospace",background:`${cfg.color}0f`,letterSpacing:'0.02em'}}>
      {cfg.label}
    </span>
  );
};

const SevBadge = ({severity})=>{
  const cfg=SEV_CFG[severity]||{label:severity,color:C.t2};
  return(
    <span style={{display:'inline-flex',alignItems:'center',padding:'2px 7px',borderRadius:4,border:`1px solid ${cfg.color}33`,fontSize:10,fontWeight:600,color:cfg.color,fontFamily:"'IBM Plex Mono',monospace",background:`${cfg.color}0f`}}>
      {cfg.label}
    </span>
  );
};

const Avatar = ({member,size=28})=>(
  <div style={{width:size,height:size,borderRadius:'50%',background:`${member.color}22`,border:`1.5px solid ${member.color}55`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:size*0.34,fontWeight:700,color:member.color,flexShrink:0,fontFamily:"'IBM Plex Mono',monospace"}}>
    {member.initials}
  </div>
);

const ProgBar = ({value,color=C.blue,height=5,bg=C.b0})=>(
  <div style={{width:'100%',height,borderRadius:2,background:bg,overflow:'hidden'}}>
    <div style={{width:`${clamp(value,0,100)}%`,height:'100%',background:color,borderRadius:2,transition:'width 0.6s ease'}}/>
  </div>
);

const Inp = ({value,onChange,placeholder,style,type='text',rows,...rest})=>{
  const base={background:C.s1,border:`1px solid ${C.b0}`,borderRadius:5,padding:'7px 10px',color:C.t0,fontSize:13,width:'100%',fontFamily:"'IBM Plex Sans',sans-serif",...style};
  if(rows) return <textarea rows={rows} value={value} onChange={onChange} placeholder={placeholder} style={{...base,resize:'vertical'}} {...rest}/>;
  return <input type={type} value={value} onChange={onChange} placeholder={placeholder} style={base} {...rest}/>;
};

const Sel = ({value,onChange,options,style})=>(
  <select value={value} onChange={onChange} style={{background:C.s1,border:`1px solid ${C.b0}`,borderRadius:5,padding:'7px 10px',color:C.t0,fontSize:13,fontFamily:"'IBM Plex Sans',sans-serif",width:'100%',...style}}>
    {options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
);

const Btn = ({children,onClick,variant='primary',small,style})=>{
  const styles={
    primary:{background:C.blue,color:'#fff',border:`1px solid ${C.blue}`},
    secondary:{background:'transparent',color:C.t1,border:`1px solid ${C.b0}`},
    danger:{background:C.redT,color:C.red,border:`1px solid ${C.red}44`},
    ghost:{background:'transparent',color:C.blueH,border:'none'},
  };
  return(
    <button onClick={onClick} style={{...styles[variant],borderRadius:5,padding:small?'4px 10px':'7px 14px',fontSize:small?11:13,fontWeight:500,cursor:'pointer',fontFamily:"'IBM Plex Sans',sans-serif",display:'inline-flex',alignItems:'center',gap:5,...style}}>
      {children}
    </button>
  );
};

const Card = ({children,style,onClick})=>(
  <div onClick={onClick} style={{background:C.s0,border:`1px solid ${C.b0}`,borderRadius:8,padding:16,...style,cursor:onClick?'pointer':undefined}}>
    {children}
  </div>
);

const Label = ({children})=>(
  <div style={{fontSize:11,fontWeight:600,color:C.t2,letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:5,fontFamily:"'IBM Plex Mono',monospace"}}>
    {children}
  </div>
);

// ─── Modal ──────────────────────────────────────────────────────────────────
const Modal = ({title,onClose,children,wide})=>(
  <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
    <div style={{background:C.s1,border:`1px solid ${C.b1}`,borderRadius:10,width:'100%',maxWidth:wide?720:500,maxHeight:'90vh',overflow:'auto',boxShadow:'0 25px 60px rgba(0,0,0,0.6)'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 20px',borderBottom:`1px solid ${C.b0}`}}>
        <span style={{fontWeight:700,fontSize:16,color:C.t0}}>{title}</span>
        <button onClick={onClose} style={{background:'transparent',border:'none',color:C.t2,fontSize:20,cursor:'pointer',lineHeight:1}}>×</button>
      </div>
      <div style={{padding:20}}>{children}</div>
    </div>
  </div>
);

const FRow = ({label,children})=>(
  <div style={{marginBottom:14}}>
    <Label>{label}</Label>
    {children}
  </div>
);

const FGrid = ({children,cols=2})=>(
  <div style={{display:'grid',gridTemplateColumns:`repeat(${cols},1fr)`,gap:14}}>
    {children}
  </div>
);

// ─── Phase progress calculator ───────────────────────────────────────────────
const calcPhaseProgress = (phaseId, components) => {
  const comps = components.filter(c=>c.phase===phaseId);
  if(!comps.length) return 0;
  const done = comps.filter(c=>c.status==='deployed'||c.status==='done').length;
  return Math.round((done/comps.length)*100);
};

const overallProgress = (components) => {
  if(!components.length) return 0;
  const done = components.filter(c=>c.status==='deployed'||c.status==='done').length;
  return Math.round((done/components.length)*100);
};

// ─── DASHBOARD ───────────────────────────────────────────────────────────────
function Dashboard({data}){
  const {tasks,components,risks,milestones,team,phases,standups}=data;
  const totalTasks=tasks.length;
  const doneTasks=tasks.filter(t=>t.status==='done').length;
  const inProg=tasks.filter(t=>t.status==='in-progress').length;
  const blocked=tasks.filter(t=>t.status==='blocked').length;
  const openRisks=risks.filter(r=>r.status==='open').length;
  const overall=overallProgress(components);

  const upcoming=tasks.filter(t=>{
    if(t.status==='done') return false;
    const d=daysLeft(t.deadline);
    return d!==null&&d<=7;
  }).sort((a,b)=>new Date(a.deadline)-new Date(b.deadline)).slice(0,6);

  const lastStandup=standups.length?standups[standups.length-1]:null;

  const statCard=(label,value,sub,color=C.t0)=>(
    <Card style={{textAlign:'center'}}>
      <div style={{fontSize:11,color:C.t2,textTransform:'uppercase',letterSpacing:'0.08em',fontFamily:"'IBM Plex Mono',monospace",marginBottom:8}}>{label}</div>
      <div style={{fontSize:32,fontWeight:700,color,fontFamily:"'IBM Plex Mono',monospace",lineHeight:1}}>{value}</div>
      {sub&&<div style={{fontSize:11,color:C.t2,marginTop:4}}>{sub}</div>}
    </Card>
  );

  return(
    <div style={{display:'flex',flexDirection:'column',gap:20}}>
      <div style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:12}}>
        {statCard('Overall',''+overall+'%','components deployed',C.blueH)}
        {statCard('Total Tasks',''+totalTasks,'across all phases')}
        {statCard('In Progress',''+inProg,'tasks active',C.blue)}
        {statCard('Blocked',''+blocked,'need attention',blocked>0?C.red:C.t2)}
        {statCard('Completed',''+doneTasks,'tasks done',C.green)}
        {statCard('Open Risks',''+openRisks,'tracked',openRisks>0?C.amber:C.t2)}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1.6fr 1fr',gap:16}}>
        <Card>
          <div style={{fontWeight:700,fontSize:14,marginBottom:16,color:C.t0}}>Phase Progress</div>
          {phases.map((ph,i)=>{
            const prog=calcPhaseProgress(ph.id,components);
            const phColor=PHASE_COLORS[i]||C.blue;
            const phComps=components.filter(c=>c.phase===ph.id);
            const phDone=phComps.filter(c=>c.status==='deployed'||c.status==='done').length;
            return(
              <div key={ph.id} style={{marginBottom:14}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:5}}>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <span style={{width:6,height:6,borderRadius:'50%',background:phColor,display:'inline-block'}}/>
                    <span style={{fontSize:13,color:C.t0}}>{ph.name}</span>
                  </div>
                  <span style={{fontSize:11,color:C.t2,fontFamily:"'IBM Plex Mono',monospace"}}>{phDone}/{phComps.length} · {prog}%</span>
                </div>
                <ProgBar value={prog} color={phColor}/>
              </div>
            );
          })}
        </Card>

        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          <Card style={{flex:1}}>
            <div style={{fontWeight:700,fontSize:14,marginBottom:12,color:C.t0}}>⚠ Upcoming Deadlines <span style={{fontSize:11,color:C.t2,fontWeight:400}}>next 7 days</span></div>
            {upcoming.length===0&&<div style={{color:C.t2,fontSize:13}}>No deadlines in next 7 days.</div>}
            {upcoming.map(t=>{
              const d=daysLeft(t.deadline);
              const member=data.team.find(m=>m.id===t.assigneeId);
              return(
                <div key={t.id} style={{display:'flex',alignItems:'center',gap:8,marginBottom:9,padding:'7px 10px',background:d<=2?C.redT:d<=4?C.amberT:C.s1,borderRadius:5,border:`1px solid ${d<=2?C.red+'33':d<=4?C.amber+'33':C.b0}`}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:12,color:C.t0,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{t.title}</div>
                    <div style={{fontSize:10,color:C.t2,marginTop:2}}>{fmtDate(t.deadline)} · {member?.name||'?'}</div>
                  </div>
                  <span style={{fontSize:11,fontWeight:700,color:d<=0?C.red:d<=2?C.red:d<=4?C.amber:C.t1,fontFamily:"'IBM Plex Mono',monospace",whiteSpace:'nowrap'}}>{d<0?`${Math.abs(d)}d late`:d===0?'Today':`${d}d`}</span>
                </div>
              );
            })}
          </Card>
          {lastStandup&&(
            <Card>
              <div style={{fontWeight:700,fontSize:13,marginBottom:10,color:C.t0}}>Last Standup <span style={{fontSize:11,color:C.t2,fontWeight:400}}>{fmtDate(lastStandup.date)}</span></div>
              {lastStandup.blockers&&<div style={{fontSize:12,color:C.red,padding:'5px 8px',background:C.redT,borderRadius:4,marginBottom:6}}>🚧 {lastStandup.blockers}</div>}
              <div style={{fontSize:12,color:C.t1,lineHeight:1.6}}>{lastStandup.completed?.slice(0,100)||'—'}</div>
            </Card>
          )}
        </div>
      </div>

      <Card>
        <div style={{fontWeight:700,fontSize:14,marginBottom:14,color:C.t0}}>Project Milestones</div>
        <div style={{display:'flex',alignItems:'center',gap:0,overflowX:'auto',padding:'8px 0'}}>
          {milestones.map((ms,i)=>{
            const cfg=STATUS_CFG[ms.status]||STATUS_CFG['pending'];
            const isLast=i===milestones.length-1;
            return(
              <div key={ms.id} style={{display:'flex',alignItems:'center',flexShrink:0}}>
                <div style={{textAlign:'center',width:110}}>
                  <div style={{width:14,height:14,borderRadius:'50%',background:cfg.dot,margin:'0 auto 5px',border:`2px solid ${cfg.dot}88`}}/>
                  <div style={{fontSize:11,fontWeight:600,color:C.t0,marginBottom:2}}>{ms.name}</div>
                  <div style={{fontSize:10,color:C.t2,fontFamily:"'IBM Plex Mono',monospace"}}>{fmtDate(ms.date)}</div>
                  <div style={{marginTop:4}}><Badge status={ms.status} small/></div>
                </div>
                {!isLast&&<div style={{width:40,height:1,background:C.b0,flexShrink:0}}/>}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

// ─── COMPONENTS VIEW ────────────────────────────────────────────────────────
function ComponentsView({data,setData}){
  const [selPhase,setSelPhase]=useState(1);
  const [editComp,setEditComp]=useState(null);
  const [form,setForm]=useState({});

  const phaseComps=data.components.filter(c=>c.phase===selPhase);
  const progress=calcPhaseProgress(selPhase,data.components);
  const phColor=PHASE_COLORS[selPhase-1]||C.blue;

  const openEdit=(comp)=>{setEditComp(comp);setForm({status:comp.status,notes:comp.notes});};
  const saveEdit=()=>{
    setData(d=>({...d,components:d.components.map(c=>c.id===editComp.id?{...c,...form}:c)}));
    setEditComp(null);
  };

  const statusCounts=(phId)=>{
    const comps=data.components.filter(c=>c.phase===phId);
    const done=comps.filter(c=>c.status==='deployed'||c.status==='done').length;
    return {total:comps.length,done};
  };

  return(
    <div>
      <div style={{display:'flex',gap:6,marginBottom:16,flexWrap:'wrap'}}>
        {data.phases.map((ph,i)=>{
          const {total,done}=statusCounts(ph.id);
          const col=PHASE_COLORS[i]||C.blue;
          const active=selPhase===ph.id;
          return(
            <button key={ph.id} onClick={()=>setSelPhase(ph.id)} style={{background:active?`${col}22`:'transparent',border:`1px solid ${active?col:C.b0}`,borderRadius:6,padding:'6px 12px',color:active?col:C.t2,fontSize:12,fontWeight:active?600:400,cursor:'pointer',fontFamily:"'IBM Plex Sans',sans-serif"}}>
              {ph.id}. {ph.name} <span style={{fontSize:10,opacity:0.7}}>({done}/{total})</span>
            </button>
          );
        })}
      </div>

      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:16}}>
        <div style={{flex:1}}>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:6}}>
            <div style={{width:10,height:10,borderRadius:'50%',background:phColor}}/>
            <span style={{fontWeight:700,fontSize:16,color:C.t0}}>Phase {selPhase}: {data.phases[selPhase-1]?.name}</span>
            <span style={{fontSize:13,color:C.t2}}>{progress}% complete</span>
          </div>
          <ProgBar value={progress} color={phColor} height={6}/>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
        {phaseComps.map(comp=>{
          const cfg=STATUS_CFG[comp.status]||STATUS_CFG['not-started'];
          return(
            <Card key={comp.id} style={{display:'flex',gap:10,alignItems:'flex-start',cursor:'pointer',transition:'border-color 0.2s',borderColor:comp.status==='deployed'?C.green+'44':comp.status==='blocked'?C.red+'44':C.b0}} onClick={()=>openEdit(comp)}>
              <div style={{marginTop:2}}>
                <Dot color={cfg.dot} size={9} pulse={comp.status==='in-progress'}/>
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:500,color:C.t0,marginBottom:4}}>{comp.name}</div>
                <Badge status={comp.status} small/>
                {comp.notes&&<div style={{fontSize:11,color:C.t2,marginTop:5,lineHeight:1.5}}>{comp.notes}</div>}
              </div>
            </Card>
          );
        })}
      </div>

      {editComp&&(
        <Modal title={`Update: ${editComp.name}`} onClose={()=>setEditComp(null)}>
          <FRow label="Status">
            <Sel value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))} options={COMP_STATUSES.map(s=>({value:s,label:STATUS_CFG[s]?.label||s}))}/>
          </FRow>
          <FRow label="Notes / Version Info">
            <Inp value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} placeholder="Add notes, version, issues..." rows={3}/>
          </FRow>
          <div style={{display:'flex',gap:8,justifyContent:'flex-end',marginTop:4}}>
            <Btn variant="secondary" onClick={()=>setEditComp(null)}>Cancel</Btn>
            <Btn onClick={saveEdit}>Save</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── TASKS VIEW ─────────────────────────────────────────────────────────────
function TasksView({data,setData}){
  const [fPhase,setFPhase]=useState('all');
  const [fAssignee,setFAssignee]=useState('all');
  const [fStatus,setFStatus]=useState('all');
  const [fPri,setFPri]=useState('all');
  const [showAdd,setShowAdd]=useState(false);
  const [editTask,setEditTask]=useState(null);
  const [viewMode,setViewMode]=useState('table');

  const emptyForm={title:'',phase:1,compId:'',assigneeId:'',status:'not-started',priority:'medium',deadline:'',notes:''};
  const [form,setForm]=useState(emptyForm);

  const filtered=data.tasks.filter(t=>{
    if(fPhase!=='all'&&t.phase!==Number(fPhase)) return false;
    if(fAssignee!=='all'&&t.assigneeId!==Number(fAssignee)) return false;
    if(fStatus!=='all'&&t.status!==fStatus) return false;
    if(fPri!=='all'&&t.priority!==fPri) return false;
    return true;
  }).sort((a,b)=>{
    const pd={critical:0,high:1,medium:2,low:3};
    return pd[a.priority]-pd[b.priority];
  });

  const openAdd=()=>{setForm(emptyForm);setShowAdd(true);};
  const openEdit=(t)=>{setEditTask(t);setForm({...t});setShowAdd(false);};
  const saveTask=()=>{
    if(!form.title.trim()) return;
    if(editTask){
      setData(d=>({...d,tasks:d.tasks.map(t=>t.id===editTask.id?{...t,...form,assigneeId:Number(form.assigneeId),phase:Number(form.phase)}:t)}));
    } else {
      const newT={...form,id:'t'+uid(),assigneeId:Number(form.assigneeId),phase:Number(form.phase)};
      setData(d=>({...d,tasks:[...d.tasks,newT]}));
    }
    setShowAdd(false);setEditTask(null);
  };
  const deleteTask=(id)=>{setData(d=>({...d,tasks:d.tasks.filter(t=>t.id!==id)}));setEditTask(null);};
  const quickStatus=(id,status)=>{setData(d=>({...d,tasks:d.tasks.map(t=>t.id===id?{...t,status}:t)}));};

  const compOpts=form.phase?data.components.filter(c=>c.phase===Number(form.phase)).map(c=>({value:c.id,label:c.name})):[];
  const kanbanCols=['not-started','in-progress','blocked','review','done'];

  const TaskForm=(
    <div>
      <FRow label="Task Title">
        <Inp value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="Describe the task..."/>
      </FRow>
      <FGrid>
        <FRow label="Phase">
          <Sel value={form.phase} onChange={e=>setForm(f=>({...f,phase:Number(e.target.value),compId:''}))} options={data.phases.map(p=>({value:p.id,label:`${p.id}. ${p.name}`}))}/>
        </FRow>
        <FRow label="Component">
          <Sel value={form.compId} onChange={e=>setForm(f=>({...f,compId:e.target.value}))} options={[{value:'',label:'—'},...compOpts]}/>
        </FRow>
        <FRow label="Assignee">
          <Sel value={form.assigneeId} onChange={e=>setForm(f=>({...f,assigneeId:e.target.value}))} options={[{value:'',label:'Unassigned'},...data.team.map(m=>({value:m.id,label:m.name}))]}/>
        </FRow>
        <FRow label="Priority">
          <Sel value={form.priority} onChange={e=>setForm(f=>({...f,priority:e.target.value}))} options={['critical','high','medium','low'].map(p=>({value:p,label:PRI_CFG[p].label}))}/>
        </FRow>
        <FRow label="Status">
          <Sel value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))} options={TASK_STATUSES.map(s=>({value:s,label:STATUS_CFG[s]?.label||s}))}/>
        </FRow>
        <FRow label="Deadline">
          <Inp type="date" value={form.deadline} onChange={e=>setForm(f=>({...f,deadline:e.target.value}))}/>
        </FRow>
      </FGrid>
      <FRow label="Notes">
        <Inp value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} placeholder="Additional details..." rows={2}/>
      </FRow>
      <div style={{display:'flex',gap:8,justifyContent:'space-between',marginTop:4}}>
        {editTask?<Btn variant="danger" onClick={()=>deleteTask(editTask.id)}>Delete</Btn>:<div/>}
        <div style={{display:'flex',gap:8}}>
          <Btn variant="secondary" onClick={()=>{setShowAdd(false);setEditTask(null);}}>Cancel</Btn>
          <Btn onClick={saveTask}>{editTask?'Save Changes':'Add Task'}</Btn>
        </div>
      </div>
    </div>
  );

  return(
    <div>
      <div style={{display:'flex',gap:8,marginBottom:14,flexWrap:'wrap',alignItems:'center'}}>
        <Sel value={fPhase} onChange={e=>setFPhase(e.target.value)} options={[{value:'all',label:'All Phases'},...data.phases.map(p=>({value:p.id,label:`Phase ${p.id}: ${p.name}`}))]} style={{width:200}}/>
        <Sel value={fAssignee} onChange={e=>setFAssignee(e.target.value)} options={[{value:'all',label:'All Members'},...data.team.map(m=>({value:m.id,label:m.name}))]} style={{width:160}}/>
        <Sel value={fStatus} onChange={e=>setFStatus(e.target.value)} options={[{value:'all',label:'All Statuses'},...TASK_STATUSES.map(s=>({value:s,label:STATUS_CFG[s]?.label||s}))]} style={{width:150}}/>
        <Sel value={fPri} onChange={e=>setFPri(e.target.value)} options={[{value:'all',label:'All Priority'},...['critical','high','medium','low'].map(p=>({value:p,label:PRI_CFG[p].label}))]} style={{width:140}}/>
        <div style={{flex:1}}/>
        <div style={{display:'flex',gap:4,border:`1px solid ${C.b0}`,borderRadius:5,overflow:'hidden'}}>
          {['table','kanban'].map(m=>(
            <button key={m} onClick={()=>setViewMode(m)} style={{padding:'6px 12px',background:viewMode===m?C.blueT:'transparent',color:viewMode===m?C.blueH:C.t2,border:'none',cursor:'pointer',fontSize:12,fontFamily:"'IBM Plex Sans',sans-serif"}}>
              {m==='table'?'≡ Table':'☰ Kanban'}
            </button>
          ))}
        </div>
        <Btn onClick={openAdd}>+ Add Task</Btn>
      </div>
      <div style={{fontSize:12,color:C.t2,marginBottom:10}}>{filtered.length} tasks</div>

      {viewMode==='table'&&(
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
            <thead>
              <tr style={{borderBottom:`1px solid ${C.b0}`,color:C.t2}}>
                {['Task','Phase','Assignee','Priority','Status','Deadline',''].map(h=>(
                  <th key={h} style={{textAlign:'left',padding:'8px 10px',fontWeight:600,fontFamily:"'IBM Plex Mono',monospace",fontSize:10,letterSpacing:'0.06em',textTransform:'uppercase',whiteSpace:'nowrap'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(t=>{
                const member=data.team.find(m=>m.id===t.assigneeId);
                const d=daysLeft(t.deadline);
                const overdue=d!==null&&d<0&&t.status!=='done';
                return(
                  <tr key={t.id} style={{borderBottom:`1px solid ${C.b0}22`,background:overdue?C.redT:'transparent'}}>
                    <td style={{padding:'9px 10px',color:C.t0,fontWeight:500,maxWidth:280}}>{t.title}</td>
                    <td style={{padding:'9px 10px',color:C.t2,whiteSpace:'nowrap',fontSize:11}}>Ph.{t.phase}</td>
                    <td style={{padding:'9px 10px'}}>
                      {member&&<div style={{display:'flex',alignItems:'center',gap:6}}><Avatar member={member} size={22}/><span style={{color:C.t1,fontSize:11}}>{member.name}</span></div>}
                    </td>
                    <td style={{padding:'9px 10px'}}><PriBadge priority={t.priority} small/></td>
                    <td style={{padding:'9px 10px'}}>
                      <select value={t.status} onChange={e=>quickStatus(t.id,e.target.value)} style={{background:STATUS_CFG[t.status]?.bg||'transparent',border:`1px solid ${STATUS_CFG[t.status]?.dot||C.b0}33`,borderRadius:4,padding:'2px 6px',color:STATUS_CFG[t.status]?.dot||C.t2,fontSize:11,cursor:'pointer',fontFamily:"'IBM Plex Mono',monospace"}}>
                        {TASK_STATUSES.map(s=><option key={s} value={s}>{STATUS_CFG[s]?.label||s}</option>)}
                      </select>
                    </td>
                    <td style={{padding:'9px 10px',fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:overdue?C.red:d<=3&&d>=0?C.amber:C.t2,whiteSpace:'nowrap'}}>{fmtDate(t.deadline)}</td>
                    <td style={{padding:'9px 10px'}}><Btn small variant="ghost" onClick={()=>openEdit(t)}>Edit</Btn></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length===0&&<div style={{textAlign:'center',color:C.t2,padding:40,fontSize:13}}>No tasks match the current filter.</div>}
        </div>
      )}

      {viewMode==='kanban'&&(
        <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:10,alignItems:'start'}}>
          {kanbanCols.map(col=>{
            const colTasks=filtered.filter(t=>t.status===col);
            const cfg=STATUS_CFG[col];
            return(
              <div key={col}>
                <div style={{display:'flex',alignItems:'center',gap:6,padding:'6px 10px',background:cfg.bg||C.s0,borderRadius:'6px 6px 0 0',border:`1px solid ${cfg.dot}33`,borderBottom:'none',marginBottom:0}}>
                  <Dot color={cfg.dot} size={7}/>
                  <span style={{fontSize:11,fontWeight:600,color:cfg.dot,fontFamily:"'IBM Plex Mono',monospace"}}>{cfg.label}</span>
                  <span style={{fontSize:10,color:C.t2,marginLeft:'auto'}}>{colTasks.length}</span>
                </div>
                <div style={{background:C.s0,border:`1px solid ${C.b0}`,borderRadius:'0 0 6px 6px',minHeight:80,padding:6,display:'flex',flexDirection:'column',gap:6}}>
                  {colTasks.map(t=>{
                    const member=data.team.find(m=>m.id===t.assigneeId);
                    return(
                      <div key={t.id} onClick={()=>openEdit(t)} style={{background:C.s1,border:`1px solid ${C.b0}`,borderRadius:5,padding:'8px 10px',cursor:'pointer'}}>
                        <div style={{fontSize:11,color:C.t0,fontWeight:500,marginBottom:5,lineHeight:1.4}}>{t.title}</div>
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                          <PriBadge priority={t.priority} small/>
                          {member&&<Avatar member={member} size={20}/>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {(showAdd||editTask)&&(
        <Modal title={editTask?'Edit Task':'Add New Task'} onClose={()=>{setShowAdd(false);setEditTask(null);}}>
          {TaskForm}
        </Modal>
      )}
    </div>
  );
}

// ─── TEAM VIEW ──────────────────────────────────────────────────────────────
function TeamView({data,setData}){
  const [editMember,setEditMember]=useState(null);
  const [showAdd,setShowAdd]=useState(false);
  const [form,setForm]=useState({name:'',role:'',initials:'',color:C.blue});

  const getMemberStats=(id)=>{
    const tasks=data.tasks.filter(t=>t.assigneeId===id);
    return{
      total:tasks.length,
      inProg:tasks.filter(t=>t.status==='in-progress').length,
      done:tasks.filter(t=>t.status==='done').length,
      blocked:tasks.filter(t=>t.status==='blocked').length,
    };
  };

  const openEdit=(m)=>{setEditMember(m);setForm({...m});setShowAdd(false);};
  const saveMember=()=>{
    if(!form.name.trim()) return;
    if(editMember){
      setData(d=>({...d,team:d.team.map(m=>m.id===editMember.id?{...m,...form}:m)}));
    } else {
      setData(d=>({...d,team:[...d.team,{...form,id:d.team.length+100}]}));
    }
    setEditMember(null);setShowAdd(false);
  };

  const TEAM_COLORS=[C.blue,C.cyan,C.purple,C.amber,C.red,C.green,C.pink,'#f97316'];

  const MemberForm=(
    <div>
      <FGrid>
        <FRow label="Name"><Inp value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Full name or role title"/></FRow>
        <FRow label="Role"><Inp value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value}))} placeholder="e.g. Database Administrator"/></FRow>
        <FRow label="Initials (2 chars)"><Inp value={form.initials} onChange={e=>setForm(f=>({...f,initials:e.target.value.slice(0,2).toUpperCase()}))} placeholder="TL"/></FRow>
        <FRow label="Colour">
          <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
            {TEAM_COLORS.map(col=>(
              <div key={col} onClick={()=>setForm(f=>({...f,color:col}))} style={{width:24,height:24,borderRadius:'50%',background:col,cursor:'pointer',border:form.color===col?`2px solid white`:`2px solid transparent`}}/>
            ))}
          </div>
        </FRow>
      </FGrid>
      <div style={{display:'flex',gap:8,justifyContent:'flex-end',marginTop:8}}>
        <Btn variant="secondary" onClick={()=>{setEditMember(null);setShowAdd(false);}}>Cancel</Btn>
        <Btn onClick={saveMember}>{editMember?'Save':'Add Member'}</Btn>
      </div>
    </div>
  );

  return(
    <div>
      <div style={{display:'flex',justifyContent:'flex-end',marginBottom:14}}>
        <Btn onClick={()=>{setForm({name:'',role:'',initials:'',color:C.blue});setShowAdd(true);}}>+ Add Member</Btn>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14}}>
        {data.team.map(member=>{
          const stats=getMemberStats(member.id);
          const pct=stats.total?Math.round((stats.done/stats.total)*100):0;
          const tasksByStatus=data.tasks.filter(t=>t.assigneeId===member.id&&t.status!=='done').slice(0,4);
          return(
            <Card key={member.id} style={{borderColor:`${member.color}22`}}>
              <div style={{display:'flex',gap:12,alignItems:'flex-start',marginBottom:14}}>
                <Avatar member={member} size={44}/>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:15,color:C.t0}}>{member.name}</div>
                  <div style={{fontSize:12,color:C.t2,marginTop:2}}>{member.role}</div>
                </div>
                <Btn small variant="ghost" onClick={()=>openEdit(member)}>Edit</Btn>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:6,marginBottom:12,textAlign:'center'}}>
                {[['Tasks',stats.total,C.t1],['Active',stats.inProg,C.blue],['Done',stats.done,C.green],['Blocked',stats.blocked,C.red]].map(([l,v,col])=>(
                  <div key={l} style={{background:C.s1,borderRadius:5,padding:'6px 4px'}}>
                    <div style={{fontSize:16,fontWeight:700,color:col,fontFamily:"'IBM Plex Mono',monospace"}}>{v}</div>
                    <div style={{fontSize:9,color:C.t2,marginTop:1,textTransform:'uppercase',letterSpacing:'0.05em'}}>{l}</div>
                  </div>
                ))}
              </div>
              <div style={{marginBottom:10}}>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:11,color:C.t2,marginBottom:4}}>
                  <span>Task completion</span><span style={{fontFamily:"'IBM Plex Mono',monospace"}}>{pct}%</span>
                </div>
                <ProgBar value={pct} color={member.color} height={4}/>
              </div>
              {tasksByStatus.length>0&&(
                <div>
                  <div style={{fontSize:10,color:C.t2,textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:5,fontFamily:"'IBM Plex Mono',monospace"}}>Active Tasks</div>
                  {tasksByStatus.map(t=>(
                    <div key={t.id} style={{display:'flex',alignItems:'center',gap:6,fontSize:11,color:C.t1,marginBottom:4,padding:'4px 7px',background:C.s1,borderRadius:4}}>
                      <Dot color={STATUS_CFG[t.status]?.dot||C.t2} size={5}/>
                      <span style={{flex:1,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{t.title}</span>
                      <PriBadge priority={t.priority} small/>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>
      {(showAdd||editMember)&&(
        <Modal title={editMember?'Edit Team Member':'Add Team Member'} onClose={()=>{setEditMember(null);setShowAdd(false);}}>
          {MemberForm}
        </Modal>
      )}
    </div>
  );
}

// ─── MILESTONES VIEW ────────────────────────────────────────────────────────
function MilestonesView({data,setData}){
  const [editMs,setEditMs]=useState(null);
  const [showAdd,setShowAdd]=useState(false);
  const [form,setForm]=useState({name:'',date:'',status:'pending',phaseId:1,notes:''});

  const saveMs=()=>{
    if(!form.name.trim()) return;
    if(editMs){
      setData(d=>({...d,milestones:d.milestones.map(m=>m.id===editMs.id?{...m,...form,phaseId:Number(form.phaseId)}:m)}));
    } else {
      setData(d=>({...d,milestones:[...d.milestones,{...form,id:'m'+uid(),phaseId:Number(form.phaseId)}]}));
    }
    setEditMs(null);setShowAdd(false);
  };
  const deleteMs=(id)=>{setData(d=>({...d,milestones:d.milestones.filter(m=>m.id!==id)}));setEditMs(null);};

  const MsForm=(
    <div>
      <FGrid>
        <FRow label="Milestone Name"><Inp value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. OCP Cluster Live"/></FRow>
        <FRow label="Target Date"><Inp type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))}/></FRow>
        <FRow label="Phase">
          <Sel value={form.phaseId} onChange={e=>setForm(f=>({...f,phaseId:e.target.value}))} options={data.phases.map(p=>({value:p.id,label:`${p.id}. ${p.name}`}))}/>
        </FRow>
        <FRow label="Status">
          <Sel value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))} options={MS_STATUSES.map(s=>({value:s,label:STATUS_CFG[s]?.label||s}))}/>
        </FRow>
      </FGrid>
      <div style={{display:'flex',gap:8,justifyContent:'space-between',marginTop:8}}>
        {editMs?<Btn variant="danger" onClick={()=>deleteMs(editMs.id)}>Delete</Btn>:<div/>}
        <div style={{display:'flex',gap:8}}>
          <Btn variant="secondary" onClick={()=>{setEditMs(null);setShowAdd(false);}}>Cancel</Btn>
          <Btn onClick={saveMs}>{editMs?'Save':'Add Milestone'}</Btn>
        </div>
      </div>
    </div>
  );

  const sorted=[...data.milestones].sort((a,b)=>new Date(a.date)-new Date(b.date));

  return(
    <div>
      <div style={{display:'flex',justifyContent:'flex-end',marginBottom:14}}>
        <Btn onClick={()=>{setForm({name:'',date:'',status:'pending',phaseId:1,notes:''});setShowAdd(true);}}>+ Add Milestone</Btn>
      </div>
      <div style={{position:'relative',paddingLeft:28,marginBottom:20}}>
        <div style={{position:'absolute',left:7,top:8,bottom:8,width:2,background:C.b0,borderRadius:1}}/>
        {sorted.map((ms,i)=>{
          const cfg=STATUS_CFG[ms.status]||STATUS_CFG['pending'];
          const phColor=PHASE_COLORS[(ms.phaseId-1)]||C.blue;
          const d=daysLeft(ms.date);
          const overdue=d!==null&&d<0&&ms.status!=='achieved';
          return(
            <div key={ms.id} style={{position:'relative',marginBottom:18,cursor:'pointer'}} onClick={()=>{setEditMs(ms);setForm({...ms});}}>
              <div style={{position:'absolute',left:-24,top:12,width:14,height:14,borderRadius:'50%',background:cfg.dot,border:`2px solid ${C.bg}`,zIndex:1}}/>
              <Card style={{borderColor:`${phColor}33`,transition:'border-color 0.2s'}}>
                <div style={{display:'flex',alignItems:'center',gap:10,flexWrap:'wrap'}}>
                  <div style={{flex:1,minWidth:200}}>
                    <div style={{fontWeight:700,fontSize:14,color:C.t0,marginBottom:4}}>{ms.name}</div>
                    <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
                      <span style={{fontSize:11,color:C.t2,fontFamily:"'IBM Plex Mono',monospace"}}>📅 {fmtDate(ms.date)}</span>
                      <span style={{fontSize:11,color:phColor}}>Phase {ms.phaseId}: {data.phases.find(p=>p.id===ms.phaseId)?.name}</span>
                    </div>
                  </div>
                  <div style={{display:'flex',gap:8,alignItems:'center'}}>
                    {overdue&&<span style={{fontSize:11,color:C.red,fontWeight:700,fontFamily:"'IBM Plex Mono',monospace"}}>{Math.abs(d)}d overdue</span>}
                    {!overdue&&d!==null&&ms.status==='pending'&&<span style={{fontSize:11,color:d<=7?C.amber:C.t2,fontFamily:"'IBM Plex Mono',monospace"}}>{d}d away</span>}
                    <Badge status={ms.status}/>
                  </div>
                </div>
              </Card>
            </div>
          );
        })}
      </div>
      {(showAdd||editMs)&&(
        <Modal title={editMs?'Edit Milestone':'Add Milestone'} onClose={()=>{setEditMs(null);setShowAdd(false);}}>
          {MsForm}
        </Modal>
      )}
    </div>
  );
}

// ─── RISKS VIEW ──────────────────────────────────────────────────────────────
function RisksView({data,setData}){
  const [editRisk,setEditRisk]=useState(null);
  const [showAdd,setShowAdd]=useState(false);
  const [form,setForm]=useState({title:'',severity:'medium',likelihood:'medium',status:'open',owner:'',mitigation:'',notes:''});

  const saveRisk=()=>{
    if(!form.title.trim()) return;
    if(editRisk){
      setData(d=>({...d,risks:d.risks.map(r=>r.id===editRisk.id?{...r,...form}:r)}));
    } else {
      setData(d=>({...d,risks:[...d.risks,{...form,id:'r'+uid()}]}));
    }
    setEditRisk(null);setShowAdd(false);
  };
  const deleteRisk=(id)=>{setData(d=>({...d,risks:d.risks.filter(r=>r.id!==id)}));setEditRisk(null);};

  const sevOrder={critical:0,high:1,medium:2,low:3};
  const sorted=[...data.risks].sort((a,b)=>sevOrder[a.severity]-sevOrder[b.severity]);

  const RiskForm=(
    <div>
      <FRow label="Risk Title"><Inp value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="Describe the risk..."/></FRow>
      <FGrid>
        <FRow label="Severity"><Sel value={form.severity} onChange={e=>setForm(f=>({...f,severity:e.target.value}))} options={['critical','high','medium','low'].map(s=>({value:s,label:SEV_CFG[s].label}))}/></FRow>
        <FRow label="Likelihood"><Sel value={form.likelihood} onChange={e=>setForm(f=>({...f,likelihood:e.target.value}))} options={['high','medium','low'].map(s=>({value:s,label:s.charAt(0).toUpperCase()+s.slice(1)}))}/></FRow>
        <FRow label="Status"><Sel value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))} options={RISK_STATUSES.map(s=>({value:s,label:STATUS_CFG[s]?.label||s}))}/></FRow>
        <FRow label="Owner"><Inp value={form.owner} onChange={e=>setForm(f=>({...f,owner:e.target.value}))} placeholder="Responsible person"/></FRow>
      </FGrid>
      <FRow label="Mitigation Plan"><Inp value={form.mitigation} onChange={e=>setForm(f=>({...f,mitigation:e.target.value}))} placeholder="Describe mitigation steps..." rows={2}/></FRow>
      <FRow label="Notes"><Inp value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} placeholder="Additional notes..." rows={2}/></FRow>
      <div style={{display:'flex',gap:8,justifyContent:'space-between',marginTop:8}}>
        {editRisk?<Btn variant="danger" onClick={()=>deleteRisk(editRisk.id)}>Delete</Btn>:<div/>}
        <div style={{display:'flex',gap:8}}>
          <Btn variant="secondary" onClick={()=>{setEditRisk(null);setShowAdd(false);}}>Cancel</Btn>
          <Btn onClick={saveRisk}>{editRisk?'Save Changes':'Add Risk'}</Btn>
        </div>
      </div>
    </div>
  );

  return(
    <div>
      <div style={{display:'flex',gap:10,marginBottom:14,alignItems:'center'}}>
        {['critical','high','medium','open'].map(s=>{
          const count=s==='open'?data.risks.filter(r=>r.status==='open').length:data.risks.filter(r=>r.severity===s).length;
          const color=s==='open'?C.red:SEV_CFG[s]?.color||C.t2;
          return(
            <div key={s} style={{background:C.s0,border:`1px solid ${C.b0}`,borderRadius:6,padding:'8px 14px',textAlign:'center'}}>
              <div style={{fontSize:20,fontWeight:700,color,fontFamily:"'IBM Plex Mono',monospace"}}>{count}</div>
              <div style={{fontSize:10,color:C.t2,textTransform:'uppercase',letterSpacing:'0.06em'}}>{s}</div>
            </div>
          );
        })}
        <div style={{flex:1}}/>
        <Btn onClick={()=>{setForm({title:'',severity:'medium',likelihood:'medium',status:'open',owner:'',mitigation:'',notes:''});setShowAdd(true);}}>+ Add Risk</Btn>
      </div>

      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        {sorted.map(risk=>{
          const cfg=SEV_CFG[risk.severity]||{color:C.t2};
          return(
            <Card key={risk.id} style={{borderLeft:`3px solid ${cfg.color}`,cursor:'pointer'}} onClick={()=>{setEditRisk(risk);setForm({...risk});}}>
              <div style={{display:'flex',gap:12,alignItems:'flex-start'}}>
                <div style={{flex:1}}>
                  <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:6,flexWrap:'wrap'}}>
                    <span style={{fontWeight:600,fontSize:14,color:C.t0}}>{risk.title}</span>
                    <SevBadge severity={risk.severity}/>
                    <Badge status={risk.status} small/>
                    <span style={{fontSize:11,color:C.t2}}>Likelihood: <span style={{color:C.t1}}>{risk.likelihood}</span></span>
                    {risk.owner&&<span style={{fontSize:11,color:C.t2}}>Owner: <span style={{color:C.t1}}>{risk.owner}</span></span>}
                  </div>
                  {risk.mitigation&&<div style={{fontSize:12,color:C.t1,lineHeight:1.6,padding:'6px 10px',background:C.s1,borderRadius:4}}><span style={{color:C.green,fontWeight:600}}>↳ </span>{risk.mitigation}</div>}
                  {risk.notes&&<div style={{fontSize:11,color:C.t2,marginTop:5}}>{risk.notes}</div>}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {(showAdd||editRisk)&&(
        <Modal title={editRisk?'Edit Risk':'Add Risk'} onClose={()=>{setEditRisk(null);setShowAdd(false);}} wide>
          {RiskForm}
        </Modal>
      )}
    </div>
  );
}

// ─── STANDUP VIEW ────────────────────────────────────────────────────────────
function StandupView({data,setData}){
  const [showAdd,setShowAdd]=useState(false);
  const [form,setForm]=useState({date:today(),completed:'',planned:'',blockers:'',submittedBy:''});

  const addEntry=()=>{
    if(!form.completed.trim()&&!form.planned.trim()) return;
    setData(d=>({...d,standups:[...d.standups,{...form,id:'sd'+uid()}]}));
    setShowAdd(false);
    setForm({date:today(),completed:'',planned:'',blockers:'',submittedBy:''});
  };

  const sorted=[...data.standups].sort((a,b)=>new Date(b.date)-new Date(a.date));

  return(
    <div>
      <div style={{display:'flex',gap:10,justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
        <div style={{fontWeight:700,fontSize:16,color:C.t0}}>Daily Standup Log</div>
        <Btn onClick={()=>setShowAdd(true)}>+ Add Today's Standup</Btn>
      </div>

      {sorted.length===0&&(
        <Card style={{textAlign:'center',padding:40}}>
          <div style={{fontSize:32,marginBottom:10}}>📋</div>
          <div style={{color:C.t2,fontSize:14}}>No standup entries yet. Add your first one!</div>
        </Card>
      )}

      {sorted.map(entry=>(
        <Card key={entry.id} style={{marginBottom:12,borderLeft:`3px solid ${C.blue}`}}>
          <div style={{display:'flex',gap:10,alignItems:'center',marginBottom:12}}>
            <span style={{fontWeight:700,fontSize:14,color:C.blueH,fontFamily:"'IBM Plex Mono',monospace"}}>{fmtDate(entry.date)}</span>
            {entry.submittedBy&&<span style={{fontSize:12,color:C.t2}}>by {entry.submittedBy}</span>}
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            {entry.completed&&(
              <div>
                <div style={{fontSize:10,color:C.green,textTransform:'uppercase',letterSpacing:'0.08em',fontFamily:"'IBM Plex Mono',monospace",marginBottom:5}}>✅ Completed Yesterday</div>
                <div style={{fontSize:12,color:C.t1,lineHeight:1.7,background:C.s1,padding:'8px 10px',borderRadius:5}}>{entry.completed}</div>
              </div>
            )}
            {entry.planned&&(
              <div>
                <div style={{fontSize:10,color:C.blue,textTransform:'uppercase',letterSpacing:'0.08em',fontFamily:"'IBM Plex Mono',monospace",marginBottom:5}}>🎯 Planned Today</div>
                <div style={{fontSize:12,color:C.t1,lineHeight:1.7,background:C.s1,padding:'8px 10px',borderRadius:5}}>{entry.planned}</div>
              </div>
            )}
          </div>
          {entry.blockers&&(
            <div style={{marginTop:10}}>
              <div style={{fontSize:10,color:C.red,textTransform:'uppercase',letterSpacing:'0.08em',fontFamily:"'IBM Plex Mono',monospace",marginBottom:5}}>🚧 Blockers</div>
              <div style={{fontSize:12,color:C.t1,lineHeight:1.6,background:C.redT,padding:'8px 10px',borderRadius:5,border:`1px solid ${C.red}22`}}>{entry.blockers}</div>
            </div>
          )}
        </Card>
      ))}

      {showAdd&&(
        <Modal title="Add Standup Entry" onClose={()=>setShowAdd(false)}>
          <FGrid>
            <FRow label="Date"><Inp type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))}/></FRow>
            <FRow label="Submitted By"><Inp value={form.submittedBy} onChange={e=>setForm(f=>({...f,submittedBy:e.target.value}))} placeholder="Your name (optional)"/></FRow>
          </FGrid>
          <FRow label="✅ What was completed yesterday?"><Inp value={form.completed} onChange={e=>setForm(f=>({...f,completed:e.target.value}))} placeholder="Tasks completed, deployments done, decisions made..." rows={3}/></FRow>
          <FRow label="🎯 What is planned for today?"><Inp value={form.planned} onChange={e=>setForm(f=>({...f,planned:e.target.value}))} placeholder="Tasks to work on today..." rows={3}/></FRow>
          <FRow label="🚧 Blockers / Issues (leave blank if none)"><Inp value={form.blockers} onChange={e=>setForm(f=>({...f,blockers:e.target.value}))} placeholder="Any blockers, pending dependencies, waiting on approvals..." rows={2}/></FRow>
          <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
            <Btn variant="secondary" onClick={()=>setShowAdd(false)}>Cancel</Btn>
            <Btn onClick={addEntry}>Submit</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── APP ─────────────────────────────────────────────────────────────────────
const TABS=[
  {id:'dashboard', label:'Dashboard',  icon:'◈'},
  {id:'components',label:'Components', icon:'⬡'},
  {id:'tasks',     label:'Tasks',      icon:'✦'},
  {id:'team',      label:'Team',       icon:'◉'},
  {id:'milestones',label:'Milestones', icon:'◆'},
  {id:'risks',     label:'Risks',      icon:'⚠'},
  {id:'standup',   label:'Standup',    icon:'◎'},
];

export default function App(){
  const [data,setData]=useState(INIT);
  const [tab,setTab]=useState('dashboard');
  const [loaded,setLoaded]=useState(false);
  const [saving,setSaving]=useState(false);
  const saveRef=useRef(null);

  // ---------------------------------------------------------------------------------
  // PASTE YOUR GOOGLE SCRIPT URL HERE ONCE IT IS READY.
  // Leave it blank ("") and the app will automatically use local browser storage.
  // ---------------------------------------------------------------------------------
  const DB_URL = "https://script.google.com/macros/s/AKfycbzU_XPajn4jKX2evVzhnHQBCNlrvSBtKRUNcCOTlJM_bfieDOID8GPwaT_eMqBEcQVr/exec"; 

  // LOAD DATA ON STARTUP
  useEffect(()=>{
    (async()=>{
      try {
        if (DB_URL) {
          const response = await fetch(DB_URL);
          const textData = await response.text();
          if(textData && textData.length > 5) {
            setData(JSON.parse(textData));
          }
        } else {
          const r = localStorage.getItem('mas-eam-tracker');
          if(r) setData(JSON.parse(r));
        }
      } catch(e) {
        console.error("Failed to load data", e);
      }
      setLoaded(true);
    })();
  },[]);

  // SAVE DATA ON CHANGES
  useEffect(()=>{
    if(!loaded) return;
    if(saveRef.current) clearTimeout(saveRef.current);
    
    setSaving(true);
    
    // Using a 1.5 second delay to avoid sending too many requests to Google at once
    saveRef.current=setTimeout(async()=>{
      try {
        if (DB_URL) {
          await fetch(DB_URL, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { "Content-Type": "text/plain;charset=utf-8" } 
          });
        } else {
          localStorage.setItem('mas-eam-tracker', JSON.stringify(data));
        }
      } catch(e) {
        console.error("Failed to save data", e);
      }
      setSaving(false);
    }, 1500); 
  },[data,loaded]);

  const overall=overallProgress(data.components);
  const blockedTasks=data.tasks.filter(t=>t.status==='blocked').length;

  if(!loaded) return(
    <div style={{minHeight:'100vh',background:C.bg,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'IBM Plex Mono',monospace",color:C.t2}}>
      Loading MAS Tracker…
    </div>
  );

  return(
    <div style={{minHeight:'100vh',background:C.bg,fontFamily:"'IBM Plex Sans',sans-serif",color:C.t0}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:5px;height:5px}
        ::-webkit-scrollbar-track{background:${C.bg}}
        ::-webkit-scrollbar-thumb{background:${C.b0};border-radius:3px}
        select option{background:${C.s1};color:${C.t0}}
        input[type="date"]::-webkit-calendar-picker-indicator{filter:invert(0.5)}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        .fade{animation:fadeIn 0.25s ease}
      `}</style>

      {/* Header */}
      <div style={{background:C.s0,borderBottom:`1px solid ${C.b0}`,padding:'0 24px'}}>
        <div style={{maxWidth:1400,margin:'0 auto'}}>
          <div style={{display:'flex',alignItems:'center',gap:16,padding:'12px 0 0',marginBottom:12}}>
            <div style={{background:C.blueT,border:`1px solid ${C.blue}44`,borderRadius:6,padding:'6px 10px',fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:C.blueH,fontWeight:600,letterSpacing:'0.05em'}}>
              IBM MAS
            </div>
            <div>
              <div style={{fontWeight:700,fontSize:18,color:C.t0,fontFamily:"'IBM Plex Sans',sans-serif"}}>Enterprise Asset Management Platform Tracker</div>
              <div style={{fontSize:11,color:C.t2,marginTop:1}}>IBM Maximo Application Suite · On-Premises OpenShift Deployment</div>
            </div>
            <div style={{flex:1}}/>
            <div style={{display:'flex',gap:16,alignItems:'center'}}>
              {blockedTasks>0&&<div style={{background:C.redT,border:`1px solid ${C.red}44`,borderRadius:5,padding:'4px 10px',fontSize:11,color:C.red,fontFamily:"'IBM Plex Mono',monospace"}}>⚠ {blockedTasks} blocked</div>}
              <div style={{display:'flex',align:'center',gap:8}}>
                <span style={{fontSize:11,color:C.t2}}>Overall</span>
                <span style={{fontSize:18,fontWeight:700,color:C.blueH,fontFamily:"'IBM Plex Mono',monospace"}}>{overall}%</span>
              </div>
              <div style={{width:120}}>
                <ProgBar value={overall} height={6} color={C.blue}/>
              </div>
              <span style={{fontSize:10,color:saving?C.amber:C.t3,fontFamily:"'IBM Plex Mono',monospace",minWidth:50}}>{saving?'Saving…':DB_URL?'Cloud Saved ✓':'Local Saved ✓'}</span>
            </div>
          </div>
          {/* Nav */}
          <div style={{display:'flex',gap:0}}>
            {TABS.map(t=>{
              const active=tab===t.id;
              return(
                <button key={t.id} onClick={()=>setTab(t.id)} style={{background:'transparent',border:'none',borderBottom:active?`2px solid ${C.blue}`:'2px solid transparent',padding:'10px 18px',color:active?C.blueH:C.t2,fontSize:13,fontWeight:active?600:400,cursor:'pointer',fontFamily:"'IBM Plex Sans',sans-serif",display:'flex',alignItems:'center',gap:6,transition:'color 0.15s',marginBottom:-1}}>
                  <span style={{fontSize:11,opacity:0.8}}>{t.icon}</span>{t.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{maxWidth:1400,margin:'0 auto',padding:'24px 24px 60px'}} className="fade" key={tab}>
        {tab==='dashboard'  &&<Dashboard    data={data} setData={setData}/>}
        {tab==='components' &&<ComponentsView data={data} setData={setData}/>}
        {tab==='tasks'      &&<TasksView    data={data} setData={setData}/>}
        {tab==='team'       &&<TeamView     data={data} setData={setData}/>}
        {tab==='milestones' &&<MilestonesView data={data} setData={setData}/>}
        {tab==='risks'      &&<RisksView    data={data} setData={setData}/>}
        {tab==='standup'    &&<StandupView  data={data} setData={setData}/>}
      </div>
    </div>
  );
}
