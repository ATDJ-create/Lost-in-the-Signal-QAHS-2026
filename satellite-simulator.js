// Experiment 1: satellite circles and receiver position.
const SVG_NS = "http://www.w3.org/2000/svg";
const {receiver,satellites,distance}=GPSEngine;
const activeSatellites = new Set();
const rangeLayer = document.getElementById("rangeLayer");
const satelliteLayer = document.getElementById("satelliteLayer");
const receiverLayer = document.getElementById("receiverLayer");
const controls = document.getElementById("satelliteControls");
const countLabel = document.getElementById("satelliteCount");
const resultTitle = document.getElementById("resultTitle");
const resultText = document.getElementById("resultText");
const coordinateText = document.getElementById("coordinateText");
function svgElement(tag, attributes, parent) {
  const element = document.createElementNS(SVG_NS,tag);
  for(const [name,value] of Object.entries(attributes)) element.setAttribute(name,value);
  parent.appendChild(element); return element;
}
// Make a checkbox for each satellite.
satellites.forEach((satellite, index) => {
  const label = document.createElement("label");
  label.className = "satellite-toggle";
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.value = String(index);
  checkbox.addEventListener("change", () => {
    if (checkbox.checked) activeSatellites.add(index);
    else activeSatellites.delete(index);
    drawExperiment();
  });
  const name = document.createElement("span");
  name.textContent = `Satellite ${satellite.name}`;
  const distanceLabel = document.createElement("small");
  distanceLabel.textContent = `${distance(satellite, receiver).toFixed(1)} units`;
  label.append(checkbox, name, distanceLabel);
  controls.appendChild(label);
});

function drawExperiment() {
  rangeLayer.replaceChildren();
  satelliteLayer.replaceChildren();
  receiverLayer.replaceChildren();

  const selected = satellites.filter((_, index) => activeSatellites.has(index));
  countLabel.textContent = `${selected.length} / 4`;

  // Draw distance circles for active satellites.
  selected.forEach(satellite => {
    svgElement("circle", {
      cx: satellite.x, cy: satellite.y,
      r: distance(satellite, receiver),
      fill: "none", stroke: "#d49b3d", "stroke-width": "2",
      "stroke-dasharray": "6 5", opacity: "0.9"
    }, rangeLayer);
  });

  // Draw satellite points and labels.
  satellites.forEach((satellite, index) => {
    const active = activeSatellites.has(index);
    svgElement("circle", {
      cx: satellite.x, cy: satellite.y, r: 11,
      fill: active ? "#176b64" : "#879da0",
      stroke: "white", "stroke-width": "3"
    }, satelliteLayer);
    const label = svgElement("text", {
      x: satellite.x, y: satellite.y + 4,
      "text-anchor": "middle", "font-size": "11", "font-weight": "bold",
      fill: "white"
    }, satelliteLayer);
    label.textContent = satellite.name;
  });

  coordinateText.textContent = "";
  if (selected.length === 0) {
    resultTitle.textContent = "Start with one satellite";
    resultText.textContent = "Switch on Satellite A. Its distance circle shows all the possible receiver positions.";
  } else if (selected.length === 1) {
    resultTitle.textContent = "One satellite: a circle";
    resultText.textContent = "The receiver could be anywhere on this circle. One distance is not enough to pinpoint it.";
  } else if (selected.length === 2) {
    resultTitle.textContent = "Two satellites: usually two possibilities";
    resultText.textContent = "The circles intersect at two points. We need another measurement to choose the correct one.";
  } else {
    const estimate = GPSEngine.locateThree(satellites.map((s,i)=>activeSatellites.has(i)?i:null).filter(i=>i!==null));
    if (!estimate) {
      resultTitle.textContent = "Satellite layout needs improving";
      resultText.textContent = "These satellites do not provide enough independent information for a unique solution.";
    } else {
      svgElement("circle", {
        cx: estimate.x, cy: estimate.y, r: 13,
        fill: "none", stroke: "#d6554b", "stroke-width": "3"
      }, receiverLayer);
      svgElement("circle", {
        cx: estimate.x, cy: estimate.y, r: 5, fill: "#d6554b"
      }, receiverLayer);
      const text = svgElement("text", {
        x: estimate.x + 15, y: estimate.y - 12,
        "font-size": "13", "font-weight": "bold", fill: "#a52e28"
      }, receiverLayer);
      text.textContent = "Receiver";
      resultTitle.textContent = "Location found!";
      resultText.textContent = "Three exact distances are enough to locate the receiver on our flat 2D map. A fourth circle confirms the result.";
      coordinateText.textContent = `Estimated position: (${estimate.x.toFixed(1)}, ${estimate.y.toFixed(1)}) map units`;
    }
  }
}

document.getElementById("resetButton").addEventListener("click", () => {
  activeSatellites.clear();
  controls.querySelectorAll("input").forEach(input => { input.checked = false; });
  drawExperiment();
});


drawExperiment();
