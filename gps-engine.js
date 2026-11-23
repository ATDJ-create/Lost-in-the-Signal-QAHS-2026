// Maths shared by both experiments. Coordinates use classroom map units.
const GPSEngine = (() => {
  const receiver = { x:260, y:185 };
  const satellites = [
    {name:"A",x:75,y:70}, {name:"B",x:420,y:65},
    {name:"C",x:90,y:305}, {name:"D",x:420,y:295}
  ];
  function distance(a,b) { return Math.hypot(a.x-b.x,a.y-b.y); }
  function measurements(extraA=0) {
    return satellites.map((sat,i)=>distance(sat,receiver)+(i===0?extraA:0));
  }
  // Three exact distances: subtract circle equations to solve two linear equations.
  function locateThree(indices, ranges=measurements()) {
    if(indices.length<3) return null;
    const [ia,ib,ic]=indices, a=satellites[ia], b=satellites[ib], c=satellites[ic];
    const da=ranges[ia],db=ranges[ib],dc=ranges[ic];
    const A1=2*(b.x-a.x),B1=2*(b.y-a.y);
    const C1=da*da-db*db+b.x*b.x-a.x*a.x+b.y*b.y-a.y*a.y;
    const A2=2*(c.x-a.x),B2=2*(c.y-a.y);
    const C2=da*da-dc*dc+c.x*c.x-a.x*a.x+c.y*c.y-a.y*a.y;
    const det=A1*B2-A2*B1;
    if(Math.abs(det)<1e-9) return null;
    return {x:(C1*B2-C2*B1)/det,y:(A1*C2-A2*C1)/det};
  }
  // Approximate best fit for four imperfect distances (grid search, then refine).
  function estimatePosition(ranges) {
    let best={x:250,y:180}, step=128;
    function error(p) {return satellites.reduce((sum,s,i)=>sum+(distance(p,s)-ranges[i])**2,0);}
    while(step>0.03125) {
      let candidate=best, lowest=error(best);
      for(const dx of [-1,0,1]) for(const dy of [-1,0,1]) {
        const p={x:best.x+dx*step,y:best.y+dy*step}, score=error(p);
        if(score<lowest){lowest=score;candidate=p;}
      }
      if(candidate===best) step/=2; else best=candidate;
    }
    return best;
  }
  return {receiver,satellites,distance,measurements,locateThree,estimatePosition};
})();
