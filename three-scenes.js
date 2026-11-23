// Optional Three.js visualisations. The mathematical 2D experiments remain functional
// even if this external 3D library cannot load.
const host = document.querySelector('[data-scene]');
const status = document.querySelector('.scene-status');
if (host) {
  try {
    const THREE = await import('https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js');
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0c2033);
    const camera = new THREE.PerspectiveCamera(43, 1, 0.1, 300);
    camera.position.set(11, 12, 17);
    const renderer = new THREE.WebGLRenderer({antialias:true,alpha:false});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    host.appendChild(renderer.domElement);
    scene.add(new THREE.HemisphereLight(0xb5edff,0x193249,2.2));
    const light = new THREE.DirectionalLight(0xffffff,2.4); light.position.set(5,14,9); scene.add(light);
    const root = new THREE.Group(); scene.add(root);
    const mat = (color, extra={}) => new THREE.MeshStandardMaterial({color,...extra});
    const sphere = (radius,color,x,y,z) => {const m=new THREE.Mesh(new THREE.SphereGeometry(radius,24,16),mat(color));m.position.set(x,y,z);root.add(m);return m;};
    const box=(w,h,d,color,x,y,z)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(color));m.position.set(x,y,z);root.add(m);return m;};
    const line=(a,b,color,width=0.05)=>{const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),delta=end.clone().sub(start);const m=new THREE.Mesh(new THREE.CylinderGeometry(width,width,delta.length(),8),mat(color,{emissive:color,emissiveIntensity:.22}));m.position.copy(start).add(end).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());root.add(m);return m;};
    const ephemeral=[];
    const clearEphemeral=()=>{for(const m of ephemeral){root.remove(m);m.geometry?.dispose();m.material?.dispose();}ephemeral.length=0;};
    const addDynamic=(m)=>{ephemeral.push(m);return m;};
    if(host.dataset.scene==='satellites') {
      sphere(3.15,0x176d9d,0,0,0);
      const earth=new THREE.Mesh(new THREE.SphereGeometry(3.19,32,20),new THREE.MeshStandardMaterial({color:0x2587a5,transparent:true,opacity:.18,wireframe:true}));root.add(earth);
      const sats=[[-5,3,-2],[5,4,-2],[-4,-3,2],[4,-2,4]];
      sats.forEach(([x,y,z])=>{sphere(.32,0xedba65,x,y,z);box(.9,.13,.5,0x72bfc6,x+.6,y,z);box(.9,.13,.5,0x72bfc6,x-.6,y,z);});
      const draw=()=>{clearEphemeral();const active=[...document.querySelectorAll('#satelliteControls input')].map((x,i)=>x.checked?i:-1).filter(x=>x>=0);active.forEach(i=>addDynamic(line(sats[i],[1.4,2.2,1.7],0x60e0ce,.045)));if(active.length>=3)addDynamic(sphere(.22,0xf76f6b,1.4,2.2,1.7));};
      document.querySelector('#satelliteControls')?.addEventListener('change',draw);
      document.querySelector('#resetButton')?.addEventListener('click',()=>requestAnimationFrame(draw));draw();
    } else if(host.dataset.scene==='signals') {
      box(13,.22,9,0x203a49,0,-.2,0);
      for(let i=0;i<11;i++){const x=(i%6)*2.1-5.3,z=Math.floor(i/6)*3-1.6;const h=1.2+(i%4)*.65;box(1.25,h,1.2,0x396d80,x,h/2,z);}
      const satellite=sphere(.36,0xedba65,-5,6,-4);const receiver=sphere(.23,0x36a99f,3,.5,2);
      const draw=()=>{clearEphemeral();const ns=Number(document.querySelector('#delaySlider')?.value||0);const bend=ns/100*3;addDynamic(line([-5,6,-4],[.3+bend,3.8,1],ns?0xf0ae5a:0x52e1ce,.06));addDynamic(line([.3+bend,3.8,1],[3,.5,2],ns?0xf0ae5a:0x52e1ce,.06));addDynamic(sphere(.23,0xe96d69,3+bend*.5,.5,2));};
      document.querySelector('#delaySlider')?.addEventListener('input',draw);document.querySelector('#clearDelay')?.addEventListener('click',()=>requestAnimationFrame(draw));draw();
    } else if(host.dataset.scene==='city') {
      const city=CityNavigation;
      box(16,.2,12,0x22394b,0,-.35,0);
      for(let y=0;y<5;y++)for(let x=0;x<7;x++){const xx=(x-3)*2.1,zz=(y-2)*2.1;if(x<6)line([xx,.02,zz],[xx+2.1,.02,zz],0x9dc4c5,.08);if(y<4)line([xx,.02,zz],[xx,.02,zz+2.1],0x9dc4c5,.08);if(x<6&&y<4){const h=.6+((x*3+y*5)%5)*.35;box(1.12,h,1.12,0x315c73,xx+1.05,h/2,zz+1.05);}}
      const draw=()=>{clearEphemeral();const dest=document.querySelector('#destination')?.value||'library',closed=document.querySelector('#roadClosure')?.checked||false;const route=city.shortestPath(city.start,city.destinations[dest],closed);if(route)for(let i=1;i<route.length;i++){const a=route[i-1],b=route[i];addDynamic(line([(a[0]-3)*2.1,.17,(a[1]-2)*2.1],[(b[0]-3)*2.1,.17,(b[1]-2)*2.1],0x37d6c3,.12));}if(closed)for(const [a,b] of city.closures)addDynamic(line([(a[0]-3)*2.1,.19,(a[1]-2)*2.1],[(b[0]-3)*2.1,.19,(b[1]-2)*2.1],0xef6b66,.11));const to=city.destinations[dest];addDynamic(sphere(.24,0xedba65,(to[0]-3)*2.1,.35,(to[1]-2)*2.1));};
      ['destination','roadClosure','findRoute'].forEach(id=>document.getElementById(id)?.addEventListener(id==='findRoute'?'click':'change',draw));draw();
    }
    let angle=.1, elevation=.4, radius=host.dataset.scene==='satellites'?19:23;
    let dragging=false, lastX=0,lastY=0;
    renderer.domElement.addEventListener('pointerdown',e=>{dragging=true;lastX=e.clientX;lastY=e.clientY;renderer.domElement.setPointerCapture(e.pointerId);});
    renderer.domElement.addEventListener('pointerup',()=>dragging=false);
    renderer.domElement.addEventListener('pointercancel',()=>dragging=false);
    renderer.domElement.addEventListener('pointermove',e=>{if(!dragging)return;angle+=(e.clientX-lastX)*.007;elevation=Math.max(-.1,Math.min(1.3,elevation+(e.clientY-lastY)*.005));lastX=e.clientX;lastY=e.clientY;});
    renderer.domElement.addEventListener('wheel',e=>{e.preventDefault();radius=Math.max(9,Math.min(38,radius+Math.sign(e.deltaY)*1.3));},{passive:false});
    const resize=()=>{const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();};
    new ResizeObserver(resize).observe(host);resize();
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let frame=0;
    const animate=()=>{frame=requestAnimationFrame(animate);camera.position.set(Math.sin(angle)*Math.cos(elevation)*radius,Math.sin(elevation)*radius,Math.cos(angle)*Math.cos(elevation)*radius);camera.lookAt(0,0,0);renderer.render(scene,camera);};
    animate();status.textContent='3D scene ready · Use the controls below to change it.';
    document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame)}else{animate();}});
  } catch(error) {
    status.textContent='3D view unavailable (network or WebGL). The working 2D experiment below remains available.';
    console.warn('Optional 3D view could not load:',error);
  }
}
