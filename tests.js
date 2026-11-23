// Basic checks for both GPS calculations and city navigation.
const tests=[];
function test(name,pass){tests.push({name,pass:Boolean(pass)});}
const near=(a,b)=>Math.abs(a-b)<0.05;
test("Distance formula: 3–4–5 triangle",near(GPSEngine.distance({x:0,y:0},{x:3,y:4}),5));
test("Zero delay adds zero range",near(GPSEngine.measurements(0)[0],GPSEngine.distance(GPSEngine.satellites[0],GPSEngine.receiver)));
for(const group of [[0,1,2],[0,1,3],[0,2,3],[1,2,3]]){
 const p=GPSEngine.locateThree(group);test(`Three-satellite position: ${group.map(i=>"ABCD"[i]).join("")}`,p&&near(p.x,260)&&near(p.y,185));
}
const p=GPSEngine.estimatePosition(GPSEngine.measurements());
test("Four-satellite best fit with no delay",near(p.x,260)&&near(p.y,185));
test("Open-road shortest route",CityNavigation.shortestPath([0,2],[6,2],false).length-1===6);
test("Road closure requires detour",CityNavigation.shortestPath([0,2],[6,2],true).length-1>6);
test("Start equals destination",CityNavigation.shortestPath([0,2],[0,2],true).length===1);
// Extra edge-case checks and clear detour demonstration.
test("Distance is symmetric",near(GPSEngine.distance({x:1,y:2},{x:8,y:6}),GPSEngine.distance({x:8,y:6},{x:1,y:2})));
test("Zero distance for identical points",near(GPSEngine.distance({x:4,y:4},{x:4,y:4}),0));
test("100 ns adds about 29.98 m",near(GPSEngine.measurements(29.9792458)[0]-GPSEngine.measurements(0)[0],29.9792458));
test("Only satellite A receives the added delay",GPSEngine.measurements(10).slice(1).every((v,i)=>near(v,GPSEngine.measurements(0)[i+1])));
test("Three satellites reject too few inputs",GPSEngine.locateThree([0,1])===null);
test("East Market is available",Array.isArray(CityNavigation.destinations.east));
test("East Market open route has 6 segments",CityNavigation.shortestPath(CityNavigation.start,CityNavigation.destinations.east,false).length-1===6);
test("East Market closure adds segments",CityNavigation.shortestPath(CityNavigation.start,CityNavigation.destinations.east,true).length>7);
test("All route junctions remain inside city bounds",CityNavigation.shortestPath(CityNavigation.start,CityNavigation.destinations.east,true).every(([x,y])=>x>=0&&x<CityNavigation.columns&&y>=0&&y<CityNavigation.rows));
const container=document.getElementById("testResults");
const heading=document.createElement("h3");heading.textContent=`${tests.filter(t=>t.pass).length} of ${tests.length} tests passed`;container.appendChild(heading);
for(const t of tests){const p=document.createElement("p");p.className="test-result";p.textContent=`${t.pass?"PASS":"FAIL"} — ${t.name}`;container.appendChild(p);}
