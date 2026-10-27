import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {MeshoptDecoder} from 'three/addons/libs/meshopt_decoder.module.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {clone} from 'three/addons/utils/SkeletonUtils.js';
import {prepareCourierClips,COURIER_WALK_REFERENCE_SPEED} from './character';
import {supportsBothBanks,type Item,type Level,type Spec} from './rules';
const C={grass:0x90ad55,stone:0xccaa77,water:0x49bfca,wood:0xa46c38,cream:0xf3e4bf,coral:0xcb614a,teal:0x246f77};
export class World {
 scene=new THREE.Scene();camera:THREE.OrthographicCamera;renderer:THREE.WebGLRenderer;root=new THREE.Group();items=new THREE.Group();preview=new THREE.Group();player=new THREE.Group();bridge=new THREE.Group();star=new THREE.Group();water:THREE.Mesh;
 itemMeshes=new Map<string,THREE.Group>();models=new Map<string,THREE.Object3D>();clips:THREE.AnimationClip[]=[];mixer?:THREE.AnimationMixer;actions:Record<string,THREE.AnimationAction>={};anim='';loaded:string[]=[];errors:string[]=[];ray=new THREE.Raycaster();pointer=new THREE.Vector2();angle=.55;time=0;voyage=new THREE.Group();voyageSail?:THREE.Mesh;voyageDone=false;chestLid?:THREE.Mesh;caveGlow?:THREE.Mesh;rain=new THREE.Group();level?:Level;zoneMeshes:THREE.Object3D[]=[];locationLabels:THREE.Sprite[]=[];previewSpec?:Spec;bridgeShown?:boolean;transport?:{id:string;kind:string;x:number;z:number;deckY:number;active:boolean};destination=new THREE.Group();particles=new THREE.Group();goalIsReady=false;popTimes=new Map<string,number>();
 constructor(public canvas:HTMLCanvasElement){
 this.scene.background=new THREE.Color(0xc6e4dd);this.scene.fog=new THREE.Fog(0xc6e4dd,35,75);
 this.camera=new THREE.OrthographicCamera(-14,14,9,-9,.1,130);
 this.renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,preserveDrawingBuffer:true});this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.25));this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.0;
 this.scene.add(new THREE.HemisphereLight(0xf9f5d9,0x5f9c9b,1.8));const sun=new THREE.DirectionalLight(0xffe4b1,2.8);sun.position.set(-9,20,10);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-18,right:18,top:14,bottom:-14,near:.5,far:60});sun.shadow.normalBias=.03;this.scene.add(sun);
 this.water=new THREE.Mesh(new THREE.PlaneGeometry(180,180),new THREE.MeshStandardMaterial({color:C.water,roughness:.25,metalness:.2,transparent:true,opacity:.94}));this.water.rotation.x=-Math.PI/2;this.water.position.y=-1.05;this.water.receiveShadow=true;this.scene.add(this.water);const sea=this.water.material as THREE.MeshStandardMaterial;const c=document.createElement('canvas');c.width=c.height=128;const cx=c.getContext('2d')!,data=cx.createImageData(128,128);for(let y=0;y<128;y++)for(let x=0;x<128;x++){const i=(y*128+x)*4;data.data[i]=128+Math.sin(x*.4+y*.19)*24;data.data[i+1]=128+Math.cos(y*.35+x*.15)*24;data.data[i+2]=250;data.data[i+3]=255;}cx.putImageData(data,0,0);const normal=new THREE.CanvasTexture(c);normal.wrapS=normal.wrapT=THREE.RepeatWrapping;normal.repeat.set(36,36);sea.normalMap=normal;sea.normalScale=new THREE.Vector2(.22,.22);sea.color.set(0x31acb6);sea.roughness=.32;
 this.scene.add(this.root,this.items,this.preview,this.player,this.bridge,this.star,this.voyage,this.rain,this.destination,this.particles);this.resize();window.addEventListener('resize',()=>this.resize());
 this.loadModels();
 }
 mat(color:number,roughness=.8){return new THREE.MeshStandardMaterial({color,roughness});}
 mesh(geo:THREE.BufferGeometry,color:number,parent:THREE.Object3D=this.root){const m=new THREE.Mesh(geo,this.mat(color));m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
 box(w:number,h:number,d:number,color:number,x=0,y=0,z=0,parent:THREE.Object3D=this.root){const m=this.mesh(new THREE.BoxGeometry(w,h,d),color,parent);m.position.set(x,y,z);return m;}
 cylinder(rt:number,rb:number,h:number,color:number,x:number,y:number,z:number,parent:THREE.Object3D=this.root,n=12){const m=this.mesh(new THREE.CylinderGeometry(rt,rb,h,n),color,parent);m.position.set(x,y,z);return m;}
 async loadModels(){const loader=new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);for(const name of ['courier','boat','balloon','lamp','crate']){try{const gltf=await loader.loadAsync(`${import.meta.env.BASE_URL}models/${name}.glb`);gltf.scene.traverse(o=>{if(o instanceof THREE.Mesh){o.castShadow=true;o.receiveShadow=true;}});this.models.set(name,gltf.scene);this.loaded.push(name);if(name==='courier'){this.clips=Object.values(prepareCourierClips(gltf.animations));this.player.clear();const model=this.model('courier',1.7);this.player.add(model);this.mixer=new THREE.AnimationMixer(model);for(const clip of this.clips){this.actions[clip.name]=this.mixer.clipAction(clip);if(clip.name==='jump'){this.actions[clip.name].setLoop(THREE.LoopOnce,1);this.actions[clip.name].clampWhenFinished=true;}}this.animatePlayer(false,false,0);this.mixer.update(0);}}catch(e){this.errors.push(name+': '+String(e));}}this.refreshItems();}
 model(name:string,height:number){const source=this.models.get(name);if(!source)return new THREE.Group();const m=clone(source);const b=new THREE.Box3().setFromObject(m);const size=b.getSize(new THREE.Vector3());const center=b.getCenter(new THREE.Vector3());m.position.set(-center.x,-b.min.y,-center.z);const holder=new THREE.Group();holder.add(m);holder.scale.setScalar(height/Math.max(.01,size.y));return holder;}
 resize(){const w=innerWidth,h=innerHeight;this.renderer.setSize(w,h);const v=w<700?12.5:7.9;this.camera.left=-v*w/h;this.camera.right=v*w/h;this.camera.top=v;this.camera.bottom=-v;this.camera.updateProjectionMatrix();this.orbit(0);}
 orbit(delta:number){this.angle+=delta;this.camera.position.set(Math.sin(this.angle)*24,22,Math.cos(this.angle)*24);this.camera.lookAt(0,-.2,0);}
 label(text:string,x:number,y:number,z:number,size=1){const can=document.createElement('canvas');can.width=768;can.height=128;const ctx=can.getContext('2d')!;ctx.fillStyle='#f9edcf';ctx.beginPath();ctx.roundRect(2,4,764,116,25);ctx.fill();ctx.strokeStyle='#9f7d4b';ctx.lineWidth=4;ctx.stroke();ctx.fillStyle='#4b4e3b';ctx.font='700 43px sans-serif';ctx.textAlign='center';ctx.fillText(text,384,78);const tex=new THREE.CanvasTexture(can);tex.colorSpace=THREE.SRGBColorSpace;const s=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,depthTest:false,toneMapped:false}));s.scale.set(3.5*size,.58*size,1);s.position.set(x,y,z);this.root.add(s);return s;}
 build(level:Level,variant=0){this.level=level;this.transport=undefined;this.voyage.visible=true;this.bridgeShown=undefined;this.goalIsReady=false;this.clearDestination();this.particles.clear();this.popTimes.clear();this.voyage.clear();this.voyageDone=false;this.root.clear();this.rain.clear();this.bridge.clear();this.star.clear();this.zoneMeshes=[];this.locationLabels=[];const g=level.gap;
 // Layered sandstone banks with clipped corners, cobbles, grasses and shoreline foam.
 for(const side of [-1,1]){const min=side<0?-9:g/2,max=side<0?-g/2:9;const len=max-min,mid=(min+max)/2;
 this.island(min,max,8,2.6,C.stone,-2.7);this.island(min+.07,max-.07,7.9,.22,variant?0x94aa59:C.grass,-.3);this.island(min+.18,max-.18,7.7,.17,0xd8bc84,-.47);
 for(let i=0;i<18;i++){const x=min+.3+((i*1.37)%(len-.6)),z=-3.7+(i*2.17)%7.4;const rock=this.mesh(new THREE.DodecahedronGeometry(.4+(i%3)*.09,0),i%2?0xb6986d:0xdac38e);rock.position.set(x,-1.3,z);rock.scale.set(1.3,2.4,1.2);}
 for(let i=0;i<30;i++){const x=min+.3+((i*1.2)%(len-.6)),z=(i%2?1:-1)*(2.4+(i*.29)%1.25);this.cylinder(.14,.18,.12,0xf5dc8d,x,.1,z,undefined,6);for(let j=0;j<3;j++){const blade=this.mesh(new THREE.ConeGeometry(.065,.5,3),0x6a9549);blade.position.set(x+j*.1,.24,z);blade.rotation.z=(j-1)*.3;}}
 for(let i=0;i<9;i++){const x=min+.5+(len-1)*i/8;const tile=this.box(.85,.07,1.2,0xe5c58d,x,.04,0);tile.rotation.y=Math.sin(i)*.1;}
 const foam=this.mesh(new THREE.TorusGeometry(3.8,.05,5,60),0xa4ecdf);foam.rotation.x=-Math.PI/2;foam.scale.x=len/8;foam.position.set(mid,-.94,0);
 }
 for(const [x,z,r] of [[-13,-10,2.5],[10,-11,2],[15,7,1.8],[-14,8,1.4]]){const rock=this.mesh(new THREE.CylinderGeometry(r*.8,r,2.5,7),0xc5a773);rock.position.set(x,-1.5,z);const turf=this.mesh(new THREE.CylinderGeometry(r*.8,r*.82,.2,7),0x80a36a);turf.position.set(x,-.2,z);if(r>2)this.tree(x,z);}
 for(let i=0;i<24;i++){const x=-8.6+(i*2.7)%17,z=(i%2?-1:1)*(3.6+(i%3)*.12);const r=this.mesh(new THREE.DodecahedronGeometry(.25+(i%4)*.12,0),i%2?0xd3b27f:0xa88c63);r.position.set(x,-.25,z);r.scale.set(1.3,1,.9);}
 if(g===0)this.box(1,1.8,8,C.stone,0,-1.05,0);
 for(const x of [-g/2-.35,g/2+.35])for(const z of [-.8,.8]){this.cylinder(.12,.15,.8,C.wood,x,.3,z);this.cylinder(.16,.16,.1,0xe1c78b,x,.7,z);}
 for(const [x,z] of [[-8,2.8],[-7.9,-3],[7.8,3],[8,-2.8]]) this.tree(x,z);
 this.lighthouse(6.8,-2.3);for(const [x,z] of [[-4,2.7],[-3,-3.1],[4,2.7],[3.5,-2.5]]){for(let i=0;i<5;i++){const bush=this.mesh(new THREE.IcosahedronGeometry(.22,0),0x55874a);bush.position.set(x+Math.sin(i*4)*.3,.18,z+Math.cos(i*4)*.3);const flower=this.mesh(new THREE.SphereGeometry(.055,5,4),i%2?0xf2ce65:0xef997b);flower.position.set(bush.position.x,.4,bush.position.z);}}
 this.cylinder(.5,.65,.2,0xcda35d,6.7,.1,.5);const starGeo=new THREE.OctahedronGeometry(.42);this.star.add(new THREE.Mesh(starGeo,new THREE.MeshStandardMaterial({color:0xffd76a,emissive:0xa0670e,emissiveIntensity:.5,metalness:.3,roughness:.3})));this.star.position.set(6.7,1.15,.5);
 this.label('המגדלור',6.7,2.1,.6,.65);
 for(const zone of level.zones){const isWater=zone.x>-g/2&&zone.x<g/2;const ring=this.mesh(new THREE.TorusGeometry(.8,.06,8,48),0xf7d28b);ring.rotation.x=-Math.PI/2;ring.position.set(zone.x,isWater?-.7:.12,zone.z);this.zoneMeshes.push(ring);this.locationLabels.push(this.label(zone.id==='crossing'?`המעבר · ${level.gap} m`:zone.id==='parcel-n'?'חבילה 1':zone.id==='parcel-s'?'חבילה 2':zone.id==='plate'?'לוח המשקל':zone.id==='wind'?'רציף הרוח':zone.id==='cargo'?'המטען':'הרציף',zone.x,1.3,zone.z,.65));
 if(level.kind==='shelter'){this.box(.9,.35,.8,0xa26b45,zone.x,.2,zone.z);this.box(.95,.04,.85,0xe9c997,zone.x,.4,zone.z);for(let i=0;i<4;i++)this.box(.14,.13,.16,0x72964a,zone.x-.3+i*.18,.5,zone.z);}
 if(['weight','wind','storm'].includes(level.kind)&&!isWater){this.cylinder(.9,1,.13,0xb89b59,zone.x,.1,zone.z);this.label(level.kind==='weight'?'> 6 kg':'→ 8 N',zone.x,.35,zone.z+1,.55);}}
 
 if(['ferry','cargo','wind','storm'].includes(level.kind)){
 // A tangible raft and sail wait by the dock, then carry the explorer across.
 for(let i=0;i<5;i++)this.box(2.4,.16,.28,0xa97a48,0,-.05,(i-2)*.3,this.voyage);
 for(const z of [-.55,.55]){const barrel=this.cylinder(.22,.22,1.8,0x718783,0,-.3,z,this.voyage);barrel.rotation.z=Math.PI/2;}
 this.cylinder(.045,.055,2.7,0x8e693b,-.65,1.3,0,this.voyage).name='voyage-mast';
 const cloth=new THREE.BufferGeometry();cloth.setAttribute('position',new THREE.Float32BufferAttribute([-.6,.7,-.02,-.6,2.5,-.02,1,.7,-.02],3));cloth.computeVertexNormals();this.voyageSail=new THREE.Mesh(cloth,new THREE.MeshStandardMaterial({color:0xf5dfb2,side:THREE.DoubleSide,roughness:.9}));this.voyageSail.castShadow=true;this.voyage.add(this.voyageSail);this.voyage.position.set(-level.gap/2+.4,-.45,0);
 }
 const sourceZ=variant?-1:1;if(level.seeds?.some(s=>s.origin.includes('tree')))this.tree(-5.5,2.8*sourceZ);if(level.seeds?.some(s=>s.origin.includes('fountain'))){this.cylinder(.65,.8,.35,0xd9d1b7,-7,.15,-2.8*sourceZ);this.cylinder(.45,.45,.15,0x59bcc2,-7,.4,-2.8*sourceZ);this.cylinder(.1,.18,.8,0xdbd4bd,-7,.65,-2.8*sourceZ);}
 // Optional material playground: lamp marker and key chest, both have real interactions.
 this.box(.9,.5,.65,0x825537,4.5,.28,2.6);this.chestLid=this.box(.95,.18,.7,0xb1854e,4.5,.64,2.6);this.box(.1,.2,.05,0xe4c063,4.5,.4,2.95);
 this.cylinder(.55,.8,.15,0x455c55,7,.1,2.5);this.caveGlow=this.mesh(new THREE.OctahedronGeometry(.3),0xffcc5a);this.caveGlow.position.set(7,.4,2.5);this.caveGlow.visible=false;
 if(level.kind==='shelter'){for(const zone of level.zones){for(let i=0;i<3;i++){const cloud=this.mesh(new THREE.IcosahedronGeometry(.55,1),0xdae5df);cloud.position.set(zone.x+(i-1)*.5,4.5,zone.z);cloud.scale.y=.55;}for(let i=0;i<18;i++){const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0),new THREE.Vector3(0,-.22,0)]),new THREE.LineBasicMaterial({color:0x8ecbd8,transparent:true,opacity:.7}));line.position.set(zone.x+Math.sin(i*6)*.7,.8+(i%6)*.5,zone.z+Math.cos(i*6)*.7);this.rain.add(line);}}}
 if(level.id==='g8-length'){const sample=this.prop({noun:'plank',length:1.8,width:.7,material:'wooden'} as Spec);sample.position.set(-5.2,0,-2.5);this.root.add(sample);this.label('Short sample · 1.8 m',-5.2,1,-2.5,.65);}
 if(level.kind==='weight'){this.cylinder(.4,.5,.7,0x657d77,-7,.35,2.6);this.label('Counterweight · 6 kg',-7,1.1,2.6,.6);}
 this.batchScenery();this.scene.traverse(o=>{if(o instanceof THREE.Mesh)o.receiveShadow=true;});
 }
 batchScenery(){
 this.root.updateWorldMatrix(true,true);
 const dynamic=new Set<THREE.Object3D|undefined>([...this.zoneMeshes,this.chestLid,this.caveGlow]);
 const groups=new Map<string,THREE.Mesh[]>();
 this.root.traverse(o=>{if(!(o instanceof THREE.Mesh)||dynamic.has(o)||Array.isArray(o.material)||!(o.material instanceof THREE.MeshStandardMaterial)||o.material.map)return;const m=o.material;const key=[m.color.getHexString(),m.roughness,m.metalness,m.side,m.transparent,m.opacity].join('/');const list=groups.get(key)??[];list.push(o);groups.set(key,list);});
 for(const meshes of groups.values()){
  if(meshes.length<2)continue;
  const geometries=meshes.map(m=>{const g=m.geometry.index?m.geometry.toNonIndexed():m.geometry.clone();return g.applyMatrix4(m.matrixWorld);});
  const geometry=mergeGeometries(geometries,false);geometries.forEach(g=>g.dispose());if(!geometry)continue;
  const material=meshes[0].material;
  const merged=new THREE.Mesh(geometry,material);merged.castShadow=true;merged.receiveShadow=true;
  for(const mesh of meshes){mesh.parent?.remove(mesh);mesh.geometry.dispose();if(mesh.material!==material)(mesh.material as THREE.Material).dispose();}
  this.root.add(merged);
 }
 }
 island(min:number,max:number,depth:number,height:number,color:number,y:number){const z=depth/2;const shape=new THREE.Shape();shape.moveTo(min+.6,-z);shape.lineTo(max-.4,-z);shape.lineTo(max,-z+.65);shape.lineTo(max,z-.65);shape.lineTo(max-.4,z);shape.lineTo(min+.6,z);shape.lineTo(min,z-.8);shape.lineTo(min,-z+.8);shape.closePath();const geo=new THREE.ExtrudeGeometry(shape,{depth:height,bevelEnabled:true,bevelSize:.1,bevelThickness:.08,bevelSegments:1,steps:1});geo.rotateX(-Math.PI/2);const m=this.mesh(geo,color);m.position.y=y;return m;}
 tree(x:number,z:number){this.cylinder(.13,.2,1.7,0x8b6c45,x,.85,z);for(let i=0;i<3;i++){const leaf=this.mesh(new THREE.IcosahedronGeometry(.72,1),[0x548348,0x6d994b,0x87a952][i]);leaf.position.set(x+(i-1)*.35,1.8+i*.28,z);leaf.scale.y=.65;}}
 lighthouse(x:number,z:number){this.cylinder(.42,.62,2.3,0xeee0b6,x,1.1,z);this.cylinder(.44,.49,.35,C.coral,x,1.3,z);this.cylinder(.57,.57,.15,0x92673d,x,2.3,z);this.cylinder(.3,.3,.5,0xffd179,x,2.6,z);this.cylinder(0,.65,.5,C.coral,x,3.1,z);const light=new THREE.PointLight(0xffcc66,4,5);light.position.set(x,2.6,z);this.root.add(light);}
 prop(s:Spec){const group=new THREE.Group();const wood=this.woodMaterial();const put=(m:THREE.Mesh,x=0,y=0,z=0)=>{m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;group.add(m);return m;};
 if(['crate','boat','balloon','lamp'].includes(s.noun)&&this.models.has(s.noun)){const h=s.noun==='balloon'?5.2*(s.adjectives.some(a=>a==='large'||a==='big')?1.25:s.adjectives.includes('small')?.7:1):s.length;const m=this.model(s.noun,h);if(s.noun==='boat'||s.noun==='crate'){const b=new THREE.Box3().setFromObject(m),v=b.getSize(new THREE.Vector3());const k=s.noun==='boat'?s.length/v.x:Math.max(s.length,s.width)/Math.max(v.x,v.z);m.scale.multiplyScalar(k);}if(s.noun==='boat')m.rotation.y=Math.PI;group.add(m);if(s.material==='metal'&&s.noun==='crate')m.traverse(o=>{if(o instanceof THREE.Mesh)o.material=this.mat(0x809595,.35);});}
 else if(s.noun==='plank'){put(new THREE.Mesh(new THREE.BoxGeometry(s.length,.16,s.width),s.material==='metal'?this.mat(0x8da2a3,.3):wood),0,.13,0);for(let i=0;i<3;i++)put(new THREE.Mesh(new THREE.BoxGeometry(s.length,.02,.025),this.mat(0x6c4b2b)),0,.22,(i-1)*.35);}
 else if(s.noun==='ladder'){for(const z of [-s.width*.4,s.width*.4])put(new THREE.Mesh(new THREE.BoxGeometry(s.length,.16,.15),wood),0,.13,z);for(let x=-s.length/2+.2;x<s.length/2;x+=.4)put(new THREE.Mesh(new THREE.BoxGeometry(.12,.13,s.width),wood),x,.13,0);}
 else if(s.noun==='rope'){const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(-s.length/2,.1,0),new THREE.Vector3(0,0,0),new THREE.Vector3(s.length/2,.1,0)]);put(new THREE.Mesh(new THREE.TubeGeometry(curve,30,.08,8,false),this.mat(0xcab080)));}
 else if(s.noun==='umbrella'){const radius=s.rain;const pole=put(new THREE.Mesh(new THREE.CylinderGeometry(.04,.04,1.9,8),this.mat(0x745c40)),0,.95,0);pole.name='pole';for(let i=0;i<10;i++){const shape=new THREE.BufferGeometry();const p=[];const a=i/10*Math.PI*2,b=(i+1)/10*Math.PI*2;p.push(0,2.2,0,Math.cos(a)*radius,1.8,Math.sin(a)*radius,Math.cos(b)*radius,1.8,Math.sin(b)*radius);shape.setAttribute('position',new THREE.Float32BufferAttribute(p,3));shape.computeVertexNormals();const mat=new THREE.MeshStandardMaterial({color:i%2?0xf5dfad:0xdf7652,side:THREE.DoubleSide,roughness:.8});put(new THREE.Mesh(shape,mat));const rib=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,2.18,0),new THREE.Vector3(Math.cos(a)*radius,1.79,Math.sin(a)*radius)]);group.add(new THREE.Line(rib,new THREE.LineBasicMaterial({color:0x8b693f})));}}
 else if(s.noun==='fan'){this.box(.8,.15,.65,0x377e86,0,.1,0,group);this.cylinder(.06,.1,.8,0x5f8e8e,0,.6,0,group);const grill=put(new THREE.Mesh(new THREE.TorusGeometry(.5,.045,8,32),this.mat(0x486e70)),0,1.2,0);grill.rotation.y=Math.PI/2;for(let i=0;i<8;i++){const spoke=put(new THREE.Mesh(new THREE.BoxGeometry(.025,.95,.025),this.mat(0x6c8d89)),0,1.2,0);spoke.rotation.x=i*Math.PI/8;}const blades=new THREE.Group();blades.name='blades';blades.position.set(0,1.2,0);for(let i=0;i<3;i++){const blade=new THREE.Mesh(new THREE.SphereGeometry(.23,12,6),this.mat(0xbed5c5,.3));blade.scale.set(.12,1.6,.55);blade.position.set(0,Math.cos(i*Math.PI*2/3)*.22,Math.sin(i*Math.PI*2/3)*.22);blade.rotation.x=i*Math.PI*2/3;blades.add(blade);}group.add(blades);}
 else if(s.noun==='bucket'){const bucket=put(new THREE.Mesh(new THREE.CylinderGeometry(s.width*.4,s.width*.3,.8,16,1,true),this.mat(s.material==='metal'?0x9eb6b3:0x936339)),0,.4,0);(bucket.material as THREE.Material).side=THREE.DoubleSide;const handle=put(new THREE.Mesh(new THREE.TorusGeometry(.4,.035,6,20,Math.PI),this.mat(0x566f6e)),0,.8,0);handle.rotation.y=Math.PI/2;}
 else if(s.noun==='sponge'){put(new THREE.Mesh(new THREE.BoxGeometry(s.width,.35,s.length),this.mat(0xead36b)),0,.2,0);for(let i=0;i<30;i++)put(new THREE.Mesh(new THREE.SphereGeometry(.045,6,4),this.mat(0xa99a44)),Math.sin(i*4)*s.width*.4,.38,Math.cos(i*3)*s.length*.4);}
 else if(s.noun==='key'){const ring=put(new THREE.Mesh(new THREE.TorusGeometry(.18,.06,8,18),this.mat(0xd6b054,.3)),0,.2,0);ring.rotation.x=-Math.PI/2;this.box(.65,.08,.1,0xd6b054,.3,.2,0,group);this.box(.1,.08,.17,0xd6b054,.55,.2,.1,group);}
 else {put(new THREE.Mesh(new THREE.BoxGeometry(s.length,.8,s.width),wood),0,.4,0);}
 if(s.light){const light=new THREE.PointLight(0xffdc8b,10,7);light.position.y=1;group.add(light);}
 return group;
 }
 woodMaterial(){const can=document.createElement('canvas');can.width=128;can.height=128;const ctx=can.getContext('2d')!;ctx.fillStyle='#bc8a50';ctx.fillRect(0,0,128,128);for(let i=0;i<50;i++){ctx.strokeStyle=i%2?'#c89a60':'#9d6f3a';ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(0,i*2.6);ctx.bezierCurveTo(40,i*2.6+4,85,i*2.6-4,128,i*2.6);ctx.stroke();}const map=new THREE.CanvasTexture(can);return new THREE.MeshStandardMaterial({map,roughness:.85});}
 current:Item[]=[];
 setItems(items:Item[]){this.current=items;this.refreshItems();}
 refreshItems(){this.items.clear();this.itemMeshes.clear();for(const o of this.current){const m=this.prop(o.spec);m.position.set(o.x,0,o.z);m.rotation.y=o.rot;m.userData.itemId=o.id;m.traverse(n=>n.userData.itemId=o.id);this.items.add(m);this.itemMeshes.set(o.id,m);}}
 setPreview(spec?:Spec,x=0,z=0,rot=0){if(spec&&this.previewSpec===spec&&this.preview.children[0]){const mesh=this.preview.children[0];mesh.position.set(x,.12,z);mesh.rotation.y=rot;return;}this.preview.clear();this.previewSpec=spec;if(!spec)return;const m=this.prop(spec);m.traverse(o=>{if(o instanceof THREE.Mesh){const mats=(Array.isArray(o.material)?o.material:[o.material]).map(a=>{const b=a.clone();b.transparent=true;b.opacity=.5;b.depthWrite=false;return b;});o.material=mats.length===1?mats[0]:mats;}});m.position.set(x,.12,z);m.rotation.y=rot;this.preview.add(m);}
 groundPoint(clientX:number,clientY:number){const r=this.canvas.getBoundingClientRect();this.pointer.set(((clientX-r.left)/r.width)*2-1,-((clientY-r.top)/r.height)*2+1);this.ray.setFromCamera(this.pointer,this.camera);const p=new THREE.Vector3();this.ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0,1,0),0),p);return p;}
 pick(clientX:number,clientY:number){const r=this.canvas.getBoundingClientRect();this.pointer.set(((clientX-r.left)/r.width)*2-1,-((clientY-r.top)/r.height)*2+1);this.ray.setFromCamera(this.pointer,this.camera);return this.ray.intersectObjects(this.items.children,true).find(h=>h.object.userData.itemId)?.object.userData.itemId as string|undefined;}
 showBridge(show:boolean){if(this.bridgeShown===show)return;this.bridgeShown=show;this.bridge.clear();for(const mesh of this.zoneMeshes)if(this.level?.kind==='weight')mesh.position.y=show?.03:.12;if(!show||!this.level?.gap)return;const l=this.level.gap+1;this.box(l,.15,1.4,0xaa824f,0,.08,0,this.bridge);for(let x=-l/2;x<l/2;x+=.3)this.box(.02,.02,1.35,0x79582f,x,.17,0,this.bridge);}
 setExtras(state:{unlocked:boolean;illuminated:boolean}){if(this.chestLid)this.chestLid.rotation.x=state.unlocked?-.8:0;if(this.caveGlow)this.caveGlow.visible=state.illuminated;}
 beginVoyage(item?:Item){
 const previous=this.transport;this.resetVoyage();if(!item)return -.34;
 const ownVehicle=item.spec.noun==='boat'||item.spec.noun==='balloon';
 const deckY=item.spec.noun==='boat'?item.spec.length*.12-.5:item.spec.noun==='balloon'?.07:-.34;
 this.transport={id:item.id,kind:item.spec.noun,x:previous?.id===item.id?previous.x:item.x,z:previous?.id===item.id?previous.z:item.z,deckY,active:false};
 if(ownVehicle){const wind=this.level?.kind==='storm'||this.level?.kind==='wind';for(const child of this.voyage.children)child.visible=wind&&(child===this.voyageSail||child.name==='voyage-mast');}
 return deckY;
 }
 resetVoyage(){this.transport=undefined;this.voyageDone=false;this.voyage.visible=true;for(const child of this.voyage.children)child.visible=true;}
 sailProgress(x:number|undefined,ready:boolean){if(!this.level)return;if(x!==undefined){this.voyage.position.x=x;this.voyageDone=true;if(this.transport){this.transport.active=true;this.transport.x=x;this.transport.z=0;}}else if(!this.voyageDone)this.voyage.position.x=-this.level.gap/2+.35;this.voyage.position.y=-.38+Math.sin(this.time*2)*.012;if(this.voyageSail)this.voyageSail.rotation.y=ready?Math.sin(this.time*3)*.08:0;}
 markDestination(point:{x:number;z:number}){this.clearDestination();const m=new THREE.Mesh(new THREE.TorusGeometry(.25,.035,7,28),new THREE.MeshBasicMaterial({color:0xfff4b9,depthTest:false,transparent:true,opacity:.9}));m.rotation.x=-Math.PI/2;m.position.set(point.x,.15,point.z);this.destination.add(m);}
 clearDestination(){for(const o of this.destination.children){if(o instanceof THREE.Mesh){o.geometry.dispose();(o.material as THREE.Material).dispose();}}this.destination.clear();}
 setNavigating(active:boolean){for(const label of this.locationLabels)label.visible=!active;}
 goalReady(ready:boolean){this.goalIsReady=ready;}
 popItem(id:string){this.popTimes.set(id,this.time);}
 reactToPlacement(item:Item){this.burst(item.x,.7,item.z,0xe4cda3,8);}
 burst(x:number,y:number,z:number,color:number,count=18){for(let i=0;i<count;i++){const m=new THREE.Mesh(new THREE.OctahedronGeometry(.045,0),new THREE.MeshBasicMaterial({color,transparent:true}));m.position.set(x,y,z);m.userData={born:this.time,vx:Math.sin(i*2.4)*1.5,vy:1+(i%4)*.35,vz:Math.cos(i*2.4)*1.5};this.particles.add(m);}}
 celebrate(){this.burst(6.7,1,.5,0xffd56b,30);}
 animatePlayer(moving:boolean,jumping:boolean,speed:number){const want=jumping?'jump':moving?'walk':'idle';if(want!==this.anim&&this.actions[want]){const initial=!this.anim;if(this.anim)this.actions[this.anim]?.fadeOut(.12);this.actions[want].reset().setEffectiveWeight(1).play();if(!initial)this.actions[want].fadeIn(.12);this.anim=want;}if(this.actions.walk)this.actions.walk.setEffectiveTimeScale(Math.max(.15,speed/COURIER_WALK_REFERENCE_SPEED));}
 render(dt:number,player:{x:number;z:number;jump:number;facing:number;vx:number;vz:number},moving:boolean,ready:boolean,paused=false,carried=false){
 this.time+=paused?0:dt;
 if(this.transport&&!this.transport.active&&!paused&&this.level){const dock=-this.level.gap/2+.35;this.transport.x+=(dock-this.transport.x)*(1-Math.exp(-dt*6));this.transport.z*=Math.exp(-dt*6);}
 for(let i=0;i<this.rain.children.length;i++)this.rain.children[i].position.y=.7+((i*.37+3.5-this.time*2)%3.5+3.5)%3.5;
 this.player.position.set(player.x,player.jump,player.z);
 const turn=Math.atan2(Math.sin(player.facing-this.player.rotation.y),Math.cos(player.facing-this.player.rotation.y));this.player.rotation.y+=turn*(1-Math.exp(-dt*18));
 this.animatePlayer(moving&&!carried,player.jump>.01&&!carried,Math.hypot(player.vx,player.vz));this.mixer?.update(paused?0:dt);
 this.star.rotation.y=this.time;this.star.position.y=1.2+Math.sin(this.time*2)*.15;this.star.scale.setScalar(ready?1.25+Math.sin(this.time*3)*.05:1);
 for(const object of this.current){const mesh=this.itemMeshes.get(object.id);if(!mesh)continue;
  const riding=this.transport?.id===object.id?this.transport:undefined;mesh.position.x=riding?riding.x:object.x;mesh.position.z=riding?(riding.kind==='boat'||riding.kind==='balloon'?riding.z:-1.05):object.z;
  const overWater=this.level&&(!!riding||Math.abs(object.x)<this.level.gap/2),supported=!!this.level&&supportsBothBanks(this.level,object),sinks=overWater&&!object.spec.float&&!supported;
  mesh.position.y=sinks?-.65:overWater&&object.spec.float?-.5+Math.sin(this.time*2)*.04:0;mesh.rotation.z=sinks?-.22:0;
  const age=this.time-(this.popTimes.get(object.id)??-100);mesh.scale.setScalar(age<.35?.3+.7*(1-Math.pow(1-Math.min(1,age/.35),3)):1);
  const blades=mesh.getObjectByName('blades');if(blades&&object.spec.force&&!paused)blades.rotation.x+=dt*object.spec.force;
 }
 for(const p of [...this.particles.children]){const age=this.time-p.userData.born;if(age>1.2){this.particles.remove(p);(p as THREE.Mesh).geometry.dispose();((p as THREE.Mesh).material as THREE.Material).dispose();continue;}if(!paused){p.position.x+=p.userData.vx*dt;p.position.z+=p.userData.vz*dt;p.position.y+=p.userData.vy*dt;p.userData.vy-=dt*2.8;(p as THREE.Mesh).scale.setScalar(1-age/1.2);}}
 const wm=this.water.material as THREE.MeshStandardMaterial;if(wm.normalMap)wm.normalMap.offset.set(this.time*.008,this.time*.004);
 this.renderer.render(this.scene,this.camera);
 }
 dispose(){this.renderer.dispose();}
}
