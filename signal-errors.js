// SVG helper used by the signal-error diagram.
function svgElement(tag, attributes, parent) {
  const el=document.createElementNS("http://www.w3.org/2000/svg",tag);
  for(const [key,value] of Object.entries(attributes)) el.setAttribute(key,value);
  parent.appendChild(el); return el;
}
// Experiment 2: one delayed signal changes the best-fit position.
const delaySlider=document.getElementById("delaySlider");
const delayValue=document.getElementById("delayValue");
const rangeError=document.getElementById("rangeError");
const positionError=document.getElementById("positionError");
const errorExplanation=document.getElementById("errorExplanation");
const errorRanges=document.getElementById("errorRangeLayer");
const errorPoints=document.getElementById("errorPointLayer");
// For display only: 1 map unit represents 1 metre.
function renderSignalError(){
  const ns=Number(delaySlider.value);
  const extraMetres=299792458*ns*1e-9;
  const ranges=GPSEngine.measurements(extraMetres);
  const estimate=GPSEngine.estimatePosition(ranges);
  const error=GPSEngine.distance(estimate,GPSEngine.receiver);
  delayValue.textContent=ns;
  rangeError.textContent=`Extra measured distance: ${extraMetres.toFixed(1)} m`;
  positionError.textContent=`Position error: ${error.toFixed(1)} m (illustrative map scale)`;
  errorExplanation.textContent=ns===0?
    "With no added delay, the circles meet at the true position.":
    "One satellite now reports a longer distance. The position error is NOT necessarily equal to the added distance: it depends on satellite geometry and all four measurements.";
  errorRanges.replaceChildren(); errorPoints.replaceChildren();
  GPSEngine.satellites.forEach((s,i)=>{
    svgElement("circle",{cx:s.x,cy:s.y,r:ranges[i],fill:"none",stroke:i===0?"#d6554b":"#d49b3d","stroke-width":"2","stroke-dasharray":"6 5"},errorRanges);
    svgElement("circle",{cx:s.x,cy:s.y,r:9,fill:"#176b64"},errorPoints);
    const label=svgElement("text",{x:s.x,y:s.y-14,"text-anchor":"middle","font-size":"12",fill:"#102536"},errorPoints);
    label.textContent=s.name;
  });
  svgElement("circle",{cx:GPSEngine.receiver.x,cy:GPSEngine.receiver.y,r:7,fill:"#176b64"},errorPoints);
  svgElement("circle",{cx:estimate.x,cy:estimate.y,r:8,fill:"none",stroke:"#d6554b","stroke-width":"3"},errorPoints);
  const legend=svgElement("text",{x:12,y:345,"font-size":"12",fill:"#102536"},errorPoints);
  legend.textContent="Green = true position   Red ring = estimated position";
}
delaySlider.addEventListener("input",renderSignalError);
document.getElementById("clearDelay").addEventListener("click",()=>{delaySlider.value="0";renderSignalError();});
renderSignalError();
