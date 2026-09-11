function extractContacts(text='') {
  const phones=[...new Set((text.match(/(?:\+91[\s-]?)?[6-9]\d{9}|(?:0\d{2,4}[\s-]?)?\d{6,8}/g)||[]))].slice(0,5)
  const emails=[...new Set((text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi)||[]))].slice(0,5)
  return {phones,emails}
}
function cleanHost(url){try{return new URL(url).hostname.replace(/^www\./,'')}catch{return ''}}
export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({error:'POST only'})
  const key=process.env.TAVILY_API_KEY
  if(!key) return res.status(500).json({error:'TAVILY_API_KEY is not configured in Vercel environment variables.'})
  try{
    const {query,source='all',location='',maxResults=20}=req.body||{}
    if(!query?.trim()) return res.status(400).json({error:'Search query is required'})
    const end=new Date(); const start=new Date(); start.setDate(end.getDate()-60)
    const iso=d=>d.toISOString().slice(0,10)
    const domains={olx:['olx.in'],facebook:['facebook.com'],quikr:['quikr.com'],cashify:['cashify.in'],amazon:['amazon.in'],flipkart:['flipkart.com']}
    let include_domains=source==='all'?undefined:domains[source]
    const q=location?`${query} ${location}`:query
    const r=await fetch('https://api.tavily.com/search',{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${key}`},body:JSON.stringify({query:q,search_depth:'basic',topic:'general',max_results:Math.min(Number(maxResults)||20,20),start_date:iso(start),end_date:iso(end),include_domains,include_answer:false,include_raw_content:true,country:'india'})})
    const data=await r.json(); if(!r.ok) return res.status(r.status).json({error:data?.detail||data?.error||'Search provider error'})
    const results=(data.results||[]).map((x,i)=>{const text=`${x.title||''} ${x.content||''} ${x.raw_content||''}`; const c=extractContacts(text); return {id:`web-${Date.now()}-${i}`,title:x.title,url:x.url,source:cleanHost(x.url),snippet:x.content||'',rawContent:x.raw_content||'',score:x.score||0,publishedDate:x.published_date||null,contacts:c}})
    res.status(200).json({query:q,from:iso(start),to:iso(end),results,credits:data.usage?.credits||null})
  }catch(e){res.status(500).json({error:e.message||'Search failed'})}
}
