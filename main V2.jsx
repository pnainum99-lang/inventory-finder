import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { Search, Plus, LayoutDashboard, Package, ShoppingCart, BarChart3, Settings, Trash2, Edit3, X } from "lucide-react";
import "./styles.css";

const initialItems = [
  {id:1, product:"RTX 3080 Ti", brand:"Inno3D", condition:"Used", buy:35000, sell:43000, source:"OLX", location:"Delhi NCR", status:"New Lead", notes:"Check VRAM temperature", score:92},
  {id:2, product:"RTX 3090", brand:"ASUS", condition:"Used", buy:45000, sell:52000, source:"Facebook Marketplace", location:"Noida", status:"Negotiating", notes:"Seller wants quick sale", score:84},
  {id:3, product:"RTX 3070", brand:"Gigabyte", condition:"Used", buy:25000, sell:29000, source:"OLX", location:"Greater Noida", status:"Contacted", notes:"Need benchmark video", score:71}
];

const statuses=["New Lead","Contacted","Negotiating","Purchased","Testing","Ready to Sell","Sold","Rejected"];

function App(){
  const [items,setItems]=useState(()=>JSON.parse(localStorage.getItem("inventory-items")||"null")||initialItems);
  const [page,setPage]=useState("Dashboard");
  const [q,setQ]=useState("");
  const [status,setStatus]=useState("All");
  const [showForm,setShowForm]=useState(false);
  const [editing,setEditing]=useState(null);

  const save=(next)=>{setItems(next);localStorage.setItem("inventory-items",JSON.stringify(next));};
  const filtered=useMemo(()=>items.filter(x=>(status==="All"||x.status===status)&&Object.values(x).join(" ").toLowerCase().includes(q.toLowerCase())),[items,status,q]);
  const profit=(x)=>(Number(x.sell)||0)-(Number(x.buy)||0);
  const stats={
    leads:items.filter(x=>["New Lead","Contacted","Negotiating"].includes(x.status)).length,
    priority:items.filter(x=>x.score>=85 && x.status!=="Rejected").length,
    stock:items.filter(x=>["Purchased","Testing","Ready to Sell"].includes(x.status)).length,
    sold:items.filter(x=>x.status==="Sold").length,
    potential:items.filter(x=>x.status!=="Rejected"&&x.status!=="Sold").reduce((a,x)=>a+profit(x),0),
    actual:items.filter(x=>x.status==="Sold").reduce((a,x)=>a+profit(x),0)
  };

  const nav=[["Dashboard",LayoutDashboard],["Inventory Finder",Search],["Inventory",Package],["Purchases",ShoppingCart],["Sales & Profit",BarChart3],["Settings",Settings]];
  return <div className="app">
    <aside>
      <div className="logo">INVENTORY<span>FINDER</span></div>
      <div className="nav">{nav.map(([n,I])=><button className={page===n?"active":""} onClick={()=>setPage(n)} key={n}><I size={18}/>{n}</button>)}</div>
      <div className="side-note"><b>Version 1</b><br/>Local prototype. Data is saved in this browser.</div>
    </aside>
    <main>
      <header><div><div className="eyebrow">RESALE OPERATIONS</div><h1>{page}</h1></div><button className="primary" onClick={()=>{setEditing(null);setShowForm(true)}}><Plus size={18}/> Add inventory</button></header>

      {page==="Dashboard" && <Dashboard stats={stats} items={items} profit={profit} onOpen={()=>setPage("Inventory Finder")} />}
      {(page==="Inventory Finder"||page==="Inventory"||page==="Purchases"||page==="Sales & Profit") &&
        <InventoryPage items={filtered} q={q} setQ={setQ} status={status} setStatus={setStatus} page={page} profit={profit}
          onEdit={(x)=>{setEditing(x);setShowForm(true)}} onDelete={(id)=>save(items.filter(x=>x.id!==id))}
          onStatus={(id,s)=>save(items.map(x=>x.id===id?{...x,status:s}:x))}/>}
      {page==="Settings" && <div className="panel"><h2>Settings</h2><p>This prototype stores data in your browser. When we move it online, this will be replaced by a shared database and user login.</p></div>}
    </main>
    {showForm && <Form item={editing} onClose={()=>setShowForm(false)} onSave={(data)=>{save(editing?items.map(x=>x.id===editing.id?{...x,...data}:x):[{...data,id:Date.now()},...items]);setShowForm(false)}}/>}
  </div>
}

function Dashboard({stats,items,profit,onOpen}){
 return <div>
  <div className="cards">
   <Stat title="New Leads" value={stats.leads}/><Stat title="High Priority" value={stats.priority}/>
   <Stat title="Current Stock" value={stats.stock}/><Stat title="Sold" value={stats.sold}/>
   <Stat title="Potential Profit" value={"₹"+stats.potential.toLocaleString("en-IN")}/><Stat title="Actual Profit" value={"₹"+stats.actual.toLocaleString("en-IN")}/>
  </div>
  <div className="section-title"><div><h2>🔥 Best Opportunities</h2><p>Highest deal scores in your current database.</p></div><button className="ghost" onClick={onOpen}>View all</button></div>
  <div className="deal-grid">{items.filter(x=>x.status!=="Rejected"&&x.status!=="Sold").sort((a,b)=>b.score-a.score).slice(0,6).map(x=><div className="deal" key={x.id}><div className="deal-top"><span className="badge">{x.status}</span><b>★ {x.score}</b></div><h3>{x.product}</h3><p>{x.brand} · {x.condition} · {x.location}</p><div className="deal-numbers"><span>Buy <b>₹{x.buy.toLocaleString("en-IN")}</b></span><span>Sell <b>₹{x.sell.toLocaleString("en-IN")}</b></span><span>Profit <b>₹{profit(x).toLocaleString("en-IN")}</b></span></div></div>)}</div>
 </div>
}
function Stat({title,value}){return <div className="stat"><span>{title}</span><strong>{value}</strong></div>}
function InventoryPage({items,q,setQ,status,setStatus,page,profit,onEdit,onDelete,onStatus}){
 const display=page==="Purchases"?items.filter(x=>["Purchased","Testing","Ready to Sell"].includes(x.status)):page==="Sales & Profit"?items.filter(x=>x.status==="Sold"):items;
 return <div>
  <div className="toolbar"><div className="search"><Search size={18}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search product, brand, source, location..."/></div><select value={status} onChange={e=>setStatus(e.target.value)}><option>All</option>{statuses.map(s=><option key={s}>{s}</option>)}</select></div>
  <div className="table-wrap"><table><thead><tr><th>Product</th><th>Source</th><th>Buy</th><th>Sell</th><th>Profit</th><th>Score</th><th>Status</th><th></th></tr></thead>
  <tbody>{display.map(x=><tr key={x.id}><td><b>{x.product}</b><small>{x.brand} · {x.condition} · {x.location}</small></td><td>{x.source}</td><td>₹{Number(x.buy).toLocaleString("en-IN")}</td><td>₹{Number(x.sell).toLocaleString("en-IN")}</td><td className={profit(x)>=0?"good":"bad"}>₹{profit(x).toLocaleString("en-IN")}</td><td><b>★ {x.score}</b></td><td><select className="status" value={x.status} onChange={e=>onStatus(x.id,e.target.value)}>{statuses.map(s=><option key={s}>{s}</option>)}</select></td><td className="actions"><button onClick={()=>onEdit(x)}><Edit3 size={15}/></button><button onClick={()=>onDelete(x.id)}><Trash2 size={15}/></button></td></tr>)}</tbody></table>
  {display.length===0&&<div className="empty">No inventory found.</div>}</div>
 </div>
}
function Form({item,onClose,onSave}){
 const [f,setF]=useState(item||{product:"",brand:"",condition:"Used",buy:"",sell:"",source:"OLX",location:"",status:"New Lead",notes:"",score:70});
 const upd=(k,v)=>setF({...f,[k]:v});
 return <div className="overlay"><div className="modal"><div className="modal-head"><h2>{item?"Edit inventory":"Add inventory"}</h2><button onClick={onClose}><X/></button></div>
  <div className="form-grid">{[["product","Product"],["brand","Brand"],["location","Seller location"],["buy","Expected buy price"],["sell","Expected selling price"],["source","Source"],["score","Deal score (0-100)"]].map(([k,l])=><label key={k}>{l}<input value={f[k]} onChange={e=>upd(k,e.target.value)}/></label>)}
  <label>Condition<select value={f.condition} onChange={e=>upd("condition",e.target.value)}><option>Used</option><option>New</option><option>Refurbished</option></select></label>
  <label>Status<select value={f.status} onChange={e=>upd("status",e.target.value)}>{statuses.map(s=><option key={s}>{s}</option>)}</select></label>
  <label className="wide">Notes<textarea value={f.notes} onChange={e=>upd("notes",e.target.value)}/></label></div>
  <div className="modal-actions"><button className="ghost" onClick={onClose}>Cancel</button><button className="primary" onClick={()=>onSave({...f,buy:Number(f.buy),sell:Number(f.sell),score:Number(f.score)})}>Save inventory</button></div>
 </div></div>
}
createRoot(document.getElementById("root")).render(<App/>);