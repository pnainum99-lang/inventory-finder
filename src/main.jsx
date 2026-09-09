import React,{useEffect,useMemo,useRef,useState} from "react";
import {createRoot} from "react-dom/client";
import {LayoutDashboard,Search,Package,Plus,Download,Upload,Trash2,Edit3,ExternalLink,Filter,BarChart3,ChevronRight,X,Database,RefreshCw} from "lucide-react";
import "./styles.css";

const STATUSES=["New Lead","Contacted","Negotiating","Purchased","Testing","Ready to Sell","Sold","Rejected"];
const SOURCES=["OLX","Facebook Marketplace","Dealer","WhatsApp","Referral","Other"];
const seed=[
{id:1,product:"RTX 3080 Ti",brand:"Inno3D",model:"iChill X3",condition:"Used",buy:35000,sell:43000,source:"OLX",location:"Delhi NCR",status:"New Lead",score:92,risk:"Medium",listing:"https://www.olx.in/",notes:"Check VRAM temperature",created:"2026-09-09"},
{id:2,product:"RTX 3090",brand:"ASUS",model:"TUF",condition:"Used",buy:45000,sell:52000,source:"Facebook Marketplace",location:"Noida",status:"Negotiating",score:84,risk:"Low",listing:"",notes:"Seller wants quick sale",created:"2026-09-08"},
{id:3,product:"RTX 3070",brand:"Gigabyte",model:"Gaming OC",condition:"Used",buy:25000,sell:29000,source:"OLX",location:"Greater Noida",status:"Contacted",score:71,risk:"Medium",listing:"",notes:"Need benchmark video",created:"2026-09-07"}
];

const money=n=>"₹"+Number(n||0).toLocaleString("en-IN");
const margin=x=>Number(x.sell||0)-Number(x.buy||0);
function calcScore(f){
 const p=Math.max(-1,Math.min(1,margin(f)/(Number(f.buy)||1)));
 let s=55+p*45;
 if(f.condition==="New")s+=5;
 if(f.condition==="Refurbished")s-=2;
 if(f.risk==="Low")s+=5;if(f.risk==="High")s-=12;
 return Math.max(0,Math.min(100,Math.round(s)));
}
function App(){
 const [items,setItems]=useState(()=>{try{return JSON.parse(localStorage.getItem("if-v2"))||seed}catch{return seed}});
 const [page,setPage]=useState("Dashboard"),[q,setQ]=useState(""),[status,setStatus]=useState("All"),[source,setSource]=useState("All"),[minProfit,setMinProfit]=useState(""),[show,setShow]=useState(false),[edit,setEdit]=useState(null),[toast,setToast]=useState("");
 const fileRef=useRef();
 useEffect(()=>localStorage.setItem("if-v2",JSON.stringify(items)),[items]);
 const save=x=>setItems(x);
 const stats=useMemo(()=>({leads:items.filter(x=>["New Lead","Contacted","Negotiating"].includes(x.status)).length,stock:items.filter(x=>["Purchased","Testing","Ready to Sell"].includes(x.status)).length,sold:items.filter(x=>x.status==="Sold").length,potential:items.filter(x=>!["Sold","Rejected"].includes(x.status)).reduce((a,x)=>a+margin(x),0),actual:items.filter(x=>x.status==="Sold").reduce((a,x)=>a+margin(x),0),high:items.filter(x=>x.score>=85&&x.status!=="Rejected").length}),[items]);
 const filtered=useMemo(()=>items.filter(x=>{
  const hay=Object.values(x).join(" ").toLowerCase();
  return hay.includes(q.toLowerCase())&&(status==="All"||x.status===status)&&(source==="All"||x.source===source)&&(minProfit===""||margin(x)>=Number(minProfit));
 }).sort((a,b)=>b.score-a.score),[items,q,status,source,minProfit]);
 function notify(t){setToast(t);setTimeout(()=>setToast(""),2200)}
 function addOrUpdate(data){
  if(edit)save(items.map(x=>x.id===edit.id?{...x,...data,score:calcScore(data)}:x));
  else save([{...data,id:Date.now(),created:new Date().toISOString().slice(0,10),score:calcScore(data)},...items]);
  setShow(false);setEdit(null);notify(edit?"Inventory updated":"Inventory added");
 }
 function remove(id){if(confirm("Delete this inventory record?")){save(items.filter(x=>x.id!==id));notify("Deleted")}}
 function exportCSV(){
  const cols=["id","product","brand","model","condition","buy","sell","source","location","status","score","risk","listing","notes","created"];
  const esc=v=>`"${String(v??"").replaceAll('"','""')}"`;
  const csv=[cols.join(","),...items.map(x=>cols.map(c=>esc(x[c])).join(","))].join("\\n");
  const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));a.download="inventory-finder-v2.csv";a.click();notify("CSV exported");
 }
 function backup(){const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(items,null,2)],{type:"application/json"}));a.download="inventory-backup.json";a.click();notify("Backup exported")}
 function restore(e){const f=e.target.files?.[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const x=JSON.parse(r.result);if(!Array.isArray(x))throw 0;save(x);notify("Backup restored")}catch{notify("Invalid backup file")}};r.readAsText(f)}
 const nav=[["Dashboard",LayoutDashboard],["Inventory Finder",Search],["Inventory",Package],["Sales & Profit",BarChart3]];
 return <div className="app">
  <aside><div className="logo">INVENTORY<span>FINDER</span><small>V2</small></div>{nav.map(([n,I])=><button className={page===n?"nav active":"nav"} onClick={()=>setPage(n)} key={n}><I size={18}/>{n}</button>)}<div className="side">V2 prototype<br/>Local storage enabled</div></aside>
  <main><header><div><div className="eyebrow">RESALE OPERATIONS</div><h1>{page}</h1></div><div className="head-actions"><button className="ghost" onClick={exportCSV}><Download size={16}/> CSV</button><button className="primary" onClick={()=>{setEdit(null);setShow(true)}}><Plus size={17}/> Add inventory</button></div></header>
   {page==="Dashboard"&&<Dashboard stats={stats} items={items} onOpen={()=>setPage("Inventory Finder")}/>}
   {page==="Inventory Finder"&&<Finder items={filtered} q={q} setQ={setQ} status={status} setStatus={setStatus} source={source} setSource={setSource} minProfit={minProfit} setMinProfit={setMinProfit} onEdit={x=>{setEdit(x);setShow(true)}} onDelete={remove} onStatus={(id,s)=>save(items.map(x=>x.id===id?{...x,status:s}:x))}/>}
   {page==="Inventory"&&<Finder items={filtered} q={q} setQ={setQ} status={status} setStatus={setStatus} source={source} setSource={setSource} minProfit={minProfit} setMinProfit={setMinProfit} onEdit={x=>{setEdit(x);setShow(true)}} onDelete={remove} onStatus={(id,s)=>save(items.map(x=>x.id===id?{...x,status:s}:x))}/>}
   {page==="Sales & Profit"&&<Sales items={items}/>}
   <div className="backupbar"><Database size={16}/> <span>Data is stored in this browser.</span><button onClick={backup}>Backup JSON</button><button onClick={()=>fileRef.current.click()}>Restore</button><input ref={fileRef} type="file" accept=".json" hidden onChange={restore}/></div>
  </main>
  {show&&<Form item={edit} items={items} onClose={()=>{setShow(false);setEdit(null)}} onSave={addOrUpdate}/>}
  {toast&&<div className="toast">{toast}</div>}
 </div>
}
function Dashboard({stats,items,onOpen}){return <><div className="cards">{Object.entries({ "Active Leads":stats.leads,"High Priority":stats.high,"Current Stock":stats.stock,"Sold":stats.sold,"Potential Profit":money(stats.potential),"Actual Profit":money(stats.actual)}).map(([k,v])=><div className="stat" key={k}><span>{k}</span><strong>{v}</strong></div>)}</div><div className="section"><div><h2>🔥 Best opportunities</h2><p>Prioritized using deal score.</p></div><button className="ghost" onClick={onOpen}>Open Finder <ChevronRight size={16}/></button></div><div className="deals">{items.filter(x=>!["Sold","Rejected"].includes(x.status)).sort((a,b)=>b.score-a.score).slice(0,6).map(x=><div className="deal" key={x.id}><div className="row"><span className="badge">{x.status}</span><b>★ {x.score}</b></div><h3>{x.product}</h3><p>{x.brand} {x.model} · {x.location}</p><div className="numbers"><span>BUY<b>{money(x.buy)}</b></span><span>SELL<b>{money(x.sell)}</b></span><span>PROFIT<b>{money(margin(x))}</b></span></div></div>)}</div></>}
function Finder({items,q,setQ,status,setStatus,source,setSource,minProfit,setMinProfit,onEdit,onDelete,onStatus}){return <><div className="filters"><div className="search"><Search size={18}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search product, brand, model, source, location..."/></div><select value={status} onChange={e=>setStatus(e.target.value)}><option>All</option>{STATUSES.map(s=><option key={s}>{s}</option>)}</select><select value={source} onChange={e=>setSource(e.target.value)}><option>All</option>{SOURCES.map(s=><option key={s}>{s}</option>)}</select><input className="profitfilter" type="number" value={minProfit} onChange={e=>setMinProfit(e.target.value)} placeholder="Min profit ₹"/></div><div className="resultline"><span><Filter size={14}/> {items.length} matching opportunities</span><span>Sorted by Deal Score ↓</span></div><div className="table"><table><thead><tr><th>Inventory</th><th>Source</th><th>Buy</th><th>Sell</th><th>Profit</th><th>Score</th><th>Status</th><th>Actions</th></tr></thead><tbody>{items.map(x=><tr key={x.id}><td><b>{x.product}</b><small>{x.brand} {x.model} · {x.condition} · {x.location}</small></td><td>{x.source}{x.listing&&<a href={x.listing} target="_blank" rel="noreferrer"><ExternalLink size={13}/></a>}</td><td>{money(x.buy)}</td><td>{money(x.sell)}</td><td className={margin(x)>=0?"good":"bad"}>{money(margin(x))}</td><td><b className={x.score>=85?"hot":""}>★ {x.score}</b></td><td><select className="status" value={x.status} onChange={e=>onStatus(x.id,e.target.value)}>{STATUSES.map(s=><option key={s}>{s}</option>)}</select></td><td className="actions"><button onClick={()=>onEdit(x)} title="Edit"><Edit3 size={15}/></button><button onClick={()=>onDelete(x.id)} title="Delete"><Trash2 size={15}/></button></td></tr>)}</tbody></table>{!items.length&&<div className="empty">No matching inventory. Try changing your filters.</div>}</div></>}
function Sales({items}){const sold=items.filter(x=>x.status==="Sold");return <div className="panel"><h2>Sales & Profit</h2><p>{sold.length} sold items · Total realized profit <b>{money(sold.reduce((a,x)=>a+margin(x),0))}</b></p><div className="table"><table><thead><tr><th>Product</th><th>Buy</th><th>Sell</th><th>Profit</th><th>Source</th></tr></thead><tbody>{sold.map(x=><tr key={x.id}><td><b>{x.product}</b><small>{x.brand} {x.model}</small></td><td>{money(x.buy)}</td><td>{money(x.sell)}</td><td className="good">{money(margin(x))}</td><td>{x.source}</td></tr>)}</tbody></table></div></div>}
function Form({item,onClose,onSave}){const [f,setF]=useState(item||{product:"",brand:"",model:"",condition:"Used",buy:"",sell:"",source:"OLX",location:"",status:"New Lead",risk:"Medium",listing:"",notes:""});const u=(k,v)=>setF({...f,[k]:v});const score=calcScore(f);return <div className="overlay"><div className="modal"><div className="modalhead"><h2>{item?"Edit inventory":"Add inventory"}</h2><button onClick={onClose}><X/></button></div><div className="scorepreview">Deal Score <b>★ {score}</b><span>{score>=85?"High priority":"Needs review"}</span></div><div className="formgrid">{[["product","Product"],["brand","Brand"],["model","Model"],["location","Seller location"],["buy","Expected buy ₹"],["sell","Expected sell ₹"],["listing","Listing URL"]].map(([k,l])=><label key={k}>{l}<input value={f[k]} onChange={e=>u(k,e.target.value)}/></label>)}<label>Source<select value={f.source} onChange={e=>u("source",e.target.value)}>{SOURCES.map(s=><option key={s}>{s}</option>)}</select></label><label>Condition<select value={f.condition} onChange={e=>u("condition",e.target.value)}><option>Used</option><option>New</option><option>Refurbished</option></select></label><label>Status<select value={f.status} onChange={e=>u("status",e.target.value)}>{STATUSES.map(s=><option key={s}>{s}</option>)}</select></label><label>Risk<select value={f.risk} onChange={e=>u("risk",e.target.value)}><option>Low</option><option>Medium</option><option>High</option></select></label><label className="wide">Notes<textarea value={f.notes} onChange={e=>u("notes",e.target.value)}/></label></div><div className="modalactions"><button className="ghost" onClick={onClose}>Cancel</button><button className="primary" onClick={()=>onSave({...f,buy:Number(f.buy)||0,sell:Number(f.sell)||0,score})}>{item?"Update inventory":"Save inventory"}</button></div></div></div>}
createRoot(document.getElementById("root")).render(<App/>);