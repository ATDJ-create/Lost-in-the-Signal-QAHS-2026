// Experiment 3: shortest route on a fictional city grid.
// Every junction has up to four neighbours. Each road has equal length.
const CityNavigation = (() => {
  const columns = 7, rows = 5;
  const start = [0, 2];
  const destinations = {library:[6,0],hospital:[6,4],museum:[3,0],station:[4,4],east:[6,2]};
  const key = p => p.join(",");
  const edgeKey = (a,b) => [key(a),key(b)].sort().join("|");
  // These two road segments can be closed for the experiment.
  const closures = [ [[2,2],[3,2]], [[3,2],[4,2]] ];
  function shortestPath(from,to,closeRoad) {
    const blocked = new Set(closeRoad ? closures.map(([a,b])=>edgeKey(a,b)) : []);
    const queue=[from], previous=new Map([[key(from),null]]);
    for(let head=0;head<queue.length;head++) {
      const current=queue[head];
      if(key(current)===key(to)) break;
      const [x,y]=current;
      for(const next of [[x+1,y],[x-1,y],[x,y+1],[x,y-1]]) {
        if(next[0]<0||next[0]>=columns||next[1]<0||next[1]>=rows) continue;
        if(blocked.has(edgeKey(current,next))||previous.has(key(next))) continue;
        previous.set(key(next),current); queue.push(next);
      }
    }
    if(!previous.has(key(to))) return null;
    const route=[];
    for(let at=to;at!==null;at=previous.get(key(at))) route.push(at);
    return route.reverse();
  }
  return {columns,rows,start,destinations,closures,shortestPath};
})();

if (document.getElementById("cityMap")) {
const cityMap=document.getElementById("cityMap");
const destinationSelect=document.getElementById("destination");
const roadClosure=document.getElementById("roadClosure");
const routeTitle=document.getElementById("routeTitle");
const routeResult=document.getElementById("routeResult");
const routeComparison=document.getElementById("routeComparison");
const streetX=x=>45+x*68, streetY=y=>48+y*68;
function cityLine(a,b,color,width,dash="") {
  const line=document.createElementNS("http://www.w3.org/2000/svg","line");
  for(const [name,value] of Object.entries({x1:streetX(a[0]),y1:streetY(a[1]),x2:streetX(b[0]),y2:streetY(b[1]),stroke:color,"stroke-width":width,"stroke-linecap":"round","stroke-dasharray":dash})) line.setAttribute(name,value);
  cityMap.appendChild(line);
}
function cityDot(p,color,label) {
  const circle=document.createElementNS("http://www.w3.org/2000/svg","circle");
  for(const [name,value] of Object.entries({cx:streetX(p[0]),cy:streetY(p[1]),r:10,fill:color,stroke:"white","stroke-width":2})) circle.setAttribute(name,value);
  cityMap.appendChild(circle);
  if(label){const t=document.createElementNS("http://www.w3.org/2000/svg","text");t.setAttribute("x",streetX(p[0])+13);t.setAttribute("y",streetY(p[1])-13);t.setAttribute("font-size","12");t.setAttribute("fill","#102536");t.setAttribute("font-weight","bold");t.textContent=label;cityMap.appendChild(t);}
}
function drawCity(){
  const name=destinationSelect.value;
  const to=CityNavigation.destinations[name];
  const closed=roadClosure.checked;
  const path=CityNavigation.shortestPath(CityNavigation.start,to,closed);
  cityMap.replaceChildren();
  const background=document.createElementNS("http://www.w3.org/2000/svg","rect");
  for(const [k,v] of Object.entries({width:500,height:380,fill:"#edf4f1",rx:12})) background.setAttribute(k,v);
  cityMap.appendChild(background);
  for(let y=0;y<CityNavigation.rows;y++)for(let x=0;x<CityNavigation.columns;x++){
    if(x<CityNavigation.columns-1)cityLine([x,y],[x+1,y],"#b3c6c5",6);
    if(y<CityNavigation.rows-1)cityLine([x,y],[x,y+1],"#b3c6c5",6);
  }
  if(closed)for(const [a,b] of CityNavigation.closures)cityLine(a,b,"#d6554b",7,"5 7");
  if(path)for(let i=1;i<path.length;i++)cityLine(path[i-1],path[i],"#2279b5",7);
  for(let y=0;y<CityNavigation.rows;y++)for(let x=0;x<CityNavigation.columns;x++)cityDot([x,y],"#ffffff","");
  cityDot(CityNavigation.start,"#176b64","Start");
  cityDot(to,"#d6554b",destinationSelect.options[destinationSelect.selectedIndex].text);
  const openPath=CityNavigation.shortestPath(CityNavigation.start,to,false);
  const openLength=openPath ? openPath.length-1 : null;
  const actualLength=path ? path.length-1 : null;
  routeComparison.textContent=(actualLength===null || openLength===null)?"No available route to compare.":
    `Open roads: ${openLength} segments. Current route: ${actualLength} segments. `+
    (actualLength>openLength?`Detour: +${actualLength-openLength} segments.`:"No extra distance for this destination.");
  routeTitle.textContent=path?"Route found!":"No route available";
  routeResult.textContent=path?`Shortest route: ${path.length-1} street segments (${path.length} junctions). ${closed?"The central road closure is avoided.":"All roads are open."}`:"Try changing the road closure.";
}
document.getElementById("findRoute").addEventListener("click",drawCity);
destinationSelect.addEventListener("change",drawCity);
roadClosure.addEventListener("change",drawCity);
drawCity();

}
