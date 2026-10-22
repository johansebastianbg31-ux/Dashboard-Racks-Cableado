const STORAGE_KEY="rackManagerDataV1";
const demoData={racks:[{id:"rack-1",name:"Rack Principal",location:"Sala de telecomunicaciones",units:24,devices:[
{id:"dev-1",name:"Switch Core",type:"switch",model:"Huawei S5735",ip:"192.168.1.10",startU:20,height:1,power:true},
{id:"dev-2",name:"Patch Panel",type:"patch",model:"24 puertos",ip:"",startU:18,height:1,power:true},
{id:"dev-3",name:"Router",type:"router",model:"Huawei AR",ip:"192.168.1.1",startU:16,height:2,power:true},
{id:"dev-4",name:"Servidor",type:"server",model:"Servidor de gestión",ip:"192.168.1.20",startU:8,height:3,power:false}
]}]};
let data=JSON.parse(localStorage.getItem(STORAGE_KEY)||"null")||demoData;
let selectedRackId=data.racks[0]?.id;
let editingDeviceId=null;

const $=id=>document.getElementById(id);
function save(){localStorage.setItem(STORAGE_KEY,JSON.stringify(data))}
function selectedRack(){return data.racks.find(r=>r.id===selectedRackId)}
function esc(s=""){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function render(){
  if(!data.racks.length){$("rackTitle").textContent="Sin racks";$("rack").innerHTML="";return}
  if(!selectedRack()) selectedRackId=data.racks[0].id;
  const r=selectedRack();
  $("rackSelect").innerHTML=data.racks.map(x=>`<option value="${x.id}" ${x.id===r.id?"selected":""}>${esc(x.name)}</option>`).join("");
  $("rackTitle").textContent=r.name;
  $("rackInfo").textContent=`${r.units}U · ${r.location||"Sin ubicación"}`;
  $("rack").innerHTML="";
  for(let u=r.units;u>=1;u--){
    const slot=document.createElement("div");slot.className="rack-slot";slot.dataset.u=u;
    slot.innerHTML=`<span class="u-label">U${u}</span>`;
    const dev=r.devices.find(d=>d.startU===u);
    if(dev){
      const el=document.createElement("div");
      el.className=`device ${dev.type} ${dev.power?"":"off"}`;
      el.draggable=true;el.dataset.id=dev.id;
      el.innerHTML=`<span>▣ ${esc(dev.name)}</span><span class="power">${dev.power?"● ON":"○ OFF"}</span>`;
      el.addEventListener("click",()=>openDevice(dev.id));
      el.addEventListener("dragstart",e=>e.dataTransfer.setData("deviceId",dev.id));
      slot.appendChild(el);
    }
    slot.addEventListener("dragover",e=>e.preventDefault());
    slot.addEventListener("drop",e=>{e.preventDefault();moveDevice(e.dataTransfer.getData("deviceId"),u)});
    $("rack").appendChild(slot);
  }
  const devices=data.racks.flatMap(r=>r.devices);
  $("rackCount").textContent=data.racks.length;$("deviceCount").textContent=devices.length;$("onlineCount").textContent=devices.filter(d=>d.power).length;
  renderInventory();
}
function moveDevice(id,u){
  const r=selectedRack(),d=r.devices.find(x=>x.id===id); if(!d)return;
  if(u+d.height-1>r.units){alert("El dispositivo no cabe en esa posición.");return}
  const conflict=r.devices.find(x=>x.id!==id && u < x.startU+x.height && u+d.height > x.startU);
  if(conflict){alert("Ese espacio ya está ocupado.");return}
  d.startU=u;save();render();
}
function renderInventory(){
  const q=$("searchInput").value.toLowerCase();
  const all=data.racks.flatMap(r=>r.devices.map(d=>({...d,rack:r.name}))).filter(d=>(d.name+" "+d.model+" "+d.ip).toLowerCase().includes(q));
  $("inventory").innerHTML=all.length?all.map(d=>`<div class="inventory-item" data-id="${d.id}"><b>${esc(d.name)}</b><small>${esc(d.rack)} · U${d.startU} · ${esc(d.ip||"sin IP")}</small></div>`).join(""):`<p class="empty">No hay resultados.</p>`;
  document.querySelectorAll(".inventory-item").forEach(el=>el.onclick=()=>{const found=data.racks.flatMap(r=>r.devices).find(d=>d.id===el.dataset.id);if(found)openDevice(found.id)});
}
function showModal(title,html,submit){
  $("modalTitle").textContent=title;$("modalForm").innerHTML=html;$("modal").classList.remove("hidden");
  $("modalForm").onsubmit=e=>{e.preventDefault();submit(new FormData(e.target));$("modal").classList.add("hidden")};
}
function openRackForm(){
 const r=selectedRack()||{name:"",location:"",units:24};
 showModal("Datos del rack",`<div class="form-grid">
 <div class="field"><label>Nombre</label><input name="name" required value="${esc(r.name)}"></div>
 <div class="field"><label>Espacios U</label><input name="units" type="number" min="4" max="60" required value="${r.units}"></div>
 <div class="field full"><label>Ubicación</label><input name="location" value="${esc(r.location)}"></div>
 </div><div class="form-actions"><button class="btn primary">Guardar</button></div>`,fd=>{
   if(r.id){r.name=fd.get("name");r.units=+fd.get("units");r.location=fd.get("location"); if(r.devices.some(d=>d.startU+d.height-1>r.units)){alert("No puedes reducir el rack: hay dispositivos fuera del nuevo límite.");return}}
   else{const nr={id:"rack-"+Date.now(),name:fd.get("name"),units:+fd.get("units"),location:fd.get("location"),devices:[]};data.racks.push(nr);selectedRackId=nr.id}
   save();render();
 });
}
function openDevice(id=null){
 const r=selectedRack();
 let d=id?r.devices.find(x=>x.id===id):{id:null,name:"",type:"switch",model:"",ip:"",startU:1,height:1,power:true};
 editingDeviceId=id;
 showModal(id?"Editar dispositivo":"Nuevo dispositivo",`<div class="form-grid">
 <div class="field"><label>Nombre</label><input name="name" required value="${esc(d.name)}"></div>
 <div class="field"><label>Tipo</label><select name="type"><option value="switch">Switch</option><option value="router">Router</option><option value="server">Servidor</option><option value="patch">Patch panel</option><option value="ups">UPS</option></select></div>
 <div class="field"><label>Modelo</label><input name="model" value="${esc(d.model)}"></div>
 <div class="field"><label>Dirección IP</label><input name="ip" value="${esc(d.ip)}"></div>
 <div class="field"><label>Posición inicial U</label><input name="startU" type="number" min="1" max="${r.units}" value="${d.startU}"></div>
 <div class="field"><label>Altura (U)</label><input name="height" type="number" min="1" max="${r.units}" value="${d.height}"></div>
 <div class="field full"><label><input name="power" type="checkbox" ${d.power?"checked":""}> Dispositivo encendido</label></div>
 </div><div class="form-actions"><button class="btn primary">Guardar</button>${id?`<button type="button" id="deleteDevice" class="btn danger">Eliminar</button>`:""}</div>`,fd=>{
   const nd={id:d.id||"dev-"+Date.now(),name:fd.get("name"),type:fd.get("type"),model:fd.get("model"),ip:fd.get("ip"),startU:+fd.get("startU"),height:+fd.get("height"),power:fd.get("power")==="on"};
   if(nd.startU+nd.height-1>r.units){alert("El dispositivo supera la capacidad del rack.");return}
   const conflict=r.devices.find(x=>x.id!==d.id && nd.startU < x.startU+x.height && nd.startU+nd.height > x.startU);
   if(conflict){alert("El espacio seleccionado está ocupado.");return}
   if(d.id)Object.assign(d,nd);else r.devices.push(nd);save();render();
 });
 if(id) $("deleteDevice").onclick=()=>{r.devices=r.devices.filter(x=>x.id!==id);$("modal").classList.add("hidden");save();render()};
 const sel=$("modalForm").querySelector('[name="type"]');if(sel)sel.value=d.type;
}
$("newRackBtn").onclick=()=>{selectedRackId=null;openRackForm()};
$("newDeviceBtn").onclick=()=>selectedRack()?openDevice():alert("Crea primero un rack.");
$("editRackBtn").onclick=()=>selectedRack()&&openRackForm();
$("deleteRackBtn").onclick=()=>{if(data.racks.length<1)return;if(confirm("¿Eliminar este rack y sus dispositivos?")){data.racks=data.racks.filter(r=>r.id!==selectedRackId);selectedRackId=data.racks[0]?.id;save();render()}};
$("rackSelect").onchange=e=>{selectedRackId=e.target.value;render()};
$("searchInput").oninput=renderInventory;
$("closeModal").onclick=()=>$("modal").classList.add("hidden");
$("modal").onclick=e=>{if(e.target.id==="modal")$("modal").classList.add("hidden")};
$("resetBtn").onclick=()=>{if(confirm("¿Restablecer los datos de demostración?")){data=JSON.parse(JSON.stringify(demoData));selectedRackId=data.racks[0].id;save();render()}};
render();
