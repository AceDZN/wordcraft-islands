"""Original Wordcraft Islands score and sound design. No samples. CC0-1.0."""
from pathlib import Path
import numpy as np, wave, json, subprocess
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'public/audio'; OUT.mkdir(exist_ok=True,parents=True)
WORK=ROOT/'work'; WORK.mkdir(exist_ok=True)
SR=22050; BPM=92; BEAT=60/BPM; BAR=4*BEAT; DUR=32*BAR; N=round(DUR*SR)
rng=np.random.default_rng(21927)
def freq(m): return 440*2**((m-69)/12)
def tone(m,d,kind='pluck',amp=.1):
 t=np.arange(round(d*SR))/SR; f=freq(m)
 if kind=='bass':
  y=np.sin(2*np.pi*f*t)+.25*np.sin(2*np.pi*f*2*t)+.08*np.sin(2*np.pi*f*3*t); e=(1-np.exp(-t/0.009))*np.exp(-t/0.32)
 elif kind=='mallet':
  y=np.sin(2*np.pi*f*t)*np.exp(-t/0.55)+.45*np.sin(2*np.pi*f*2.76*t)*np.exp(-t/.12)+.12*np.sin(2*np.pi*f*5.4*t)*np.exp(-t/.045);e=np.minimum(t/.004,1)
 else:
  # Warm nylon-like string: decaying upper partials and a soft pick transient.
  y=sum((1/k**1.4)*np.sin(2*np.pi*f*k*t+.07*k)*np.exp(-t*(1.4+.7*k)) for k in range(1,7));e=np.minimum(t/.007,1)
  y+=rng.normal(0,.04,len(t))*np.exp(-t/.012)
 fade=np.minimum((d-t)/.045,1).clip(0,1)
 return y*e*fade*amp

def noise(d,amp=.1,low=120,high=7000):
 n=round(d*SR); x=rng.normal(0,1,n);sp=np.fft.rfft(x);f=np.fft.rfftfreq(n,1/SR);sp*=np.minimum(f/max(low,1),1)**2/(1+(f/high)**6);return np.fft.irfft(sp,n)*amp

def add(dest,sig,sec,pan=0):
 i=round(sec*SR); size=min(len(sig),len(dest)-i)
 if size<=0:return
 if dest.ndim==2:
  dest[i:i+size,0]+=sig[:size]*np.sqrt((1-pan)/2);dest[i:i+size,1]+=sig[:size]*np.sqrt((1+pan)/2)
 else:dest[i:i+size]+=sig[:size]
def room(x):
 y=x.copy()
 for delay,gain in [(.073,.11),(.129,.08),(.211,.055)]:
  dn=round(delay*SR);y+=np.roll(x,dn,axis=0)*gain
 return y

def save(name,x,where=OUT,ogg=False):
 p=where/(name+'.wav');mx=np.max(np.abs(x));x=np.clip(x,-.95,.95)
 with wave.open(str(p),'wb') as w:
  w.setnchannels(1 if x.ndim==1 else x.shape[1]);w.setsampwidth(2);w.setframerate(SR);w.writeframes((x*32767).astype('<i2').tobytes())
 if ogg:
  q=where/(name+'.ogg');subprocess.run(['ffmpeg','-y','-loglevel','error','-i',str(p),'-c:a','libopus','-b:a','96k',str(q)],check=True);p.unlink()
 return {'seconds':len(x)/SR,'peak':float(np.max(np.abs(x))),'peak_dBFS':float(20*np.log10(max(np.max(np.abs(x)),1e-9))),'RMS':float(np.sqrt(np.mean(x*x))),'boundary_delta':float(np.max(np.abs(x[0]-x[-1]))),'bytes':(where/(name+('.ogg' if ogg else '.wav'))).stat().st_size}

music=np.zeros((N,2));solved=np.zeros_like(music)
# ABAC eight-bar blocks. D major / B minor; each block has an authored phrase.
chords=[(50,[62,66,69]),(43,[59,62,67]),(47,[59,62,66]),(45,[61,64,69]),(50,[62,66,69]),(43,[59,62,67]),(45,[61,64,69]),(50,[62,66,69])]
phrases={
 'A': [[(0,74,1), (1.5,78,.5), (2,81,1), (3,78,.75)],[(0,76,1.5),(2,74,.8)],[(.5,73,.5),(1.5,74,.6),(2.5,78,1)],[(0,76,1),(1.5,73,.5),(2,69,1.5)],[(0,74,.7),(1,78,.6),(2,81,.7),(3,83,.6)],[(.5,81,1),(2,78,1)],[(0,76,.7),(1,73,.7),(2,71,.7),(3,73,.7)],[(0,74,2.6)]],
 'B': [[(0,78,.6),(1,81,.6),(2,86,1)],[(.5,83,.5),(1.5,81,.5),(2.5,79,1)],[(0,78,1),(2,74,1)],[(.5,76,.5),(1.5,78,.5),(2.5,81,.8)],[(0,83,1),(1.5,81,.5),(2.5,78,1)],[(0,79,.6),(1,78,.5),(2,76,1)],[(0,73,.5),(1,76,.5),(2,81,1)],[(0,78,1),(2,74,1)]],
 'C': [[(0,74,1),(2,81,1)],[(0,79,1),(1.5,78,.5),(2.5,74,1)],[(.5,78,1),(2,83,1)],[(0,81,.8),(1.5,76,.6),(2.5,73,1)],[(0,78,.6),(1,81,.5),(2,86,1)],[(0,83,1),(2,79,1)],[(0,81,.6),(1,76,.6),(2,73,.7),(3,69,.5)],[(0,74,2.4)]]}
for bar in range(32):
 block=['A','B','A','C'][bar//8];b=bar%8; root,cs=chords[b];start=bar*BAR
 # Sparse alternating plucked chord voicings, not a static pad.
 for beat in [0,1.5,2.5]:
  for k,n in enumerate(cs):add(music,tone(n,.95,amp=.027),start+beat*BEAT+k*.024,[-.45,.2,.5][k])
 for beat,n in [(0,root),(2,root+7)]:add(music,tone(n,.8,'bass',.10),start+beat*BEAT,-.08)
 for beat,n,d in phrases[block][b]:add(music,tone(n,d*BEAT+.2,amp=.092 if bar//8!=2 else .077),start+beat*BEAT,.16)
 if b in [1,3,5,7]:
  for beat,n in [(1,cs[-1]+12),(3,cs[1]+12)]:add(music,tone(n,.7,'mallet',.027),start+beat*BEAT,-.5)
 for beat in np.arange(.5,4,.5):
  s=noise(.085,.022,2300,8000)*np.exp(-np.arange(round(.085*SR))/SR/.025);add(music,s,start+beat*BEAT,.5 if beat%1 else -.5)
 for beat in [1,3]:
  t=np.arange(round(.095*SR))/SR;wood=(np.sin(2*np.pi*780*t)+.5*np.sin(2*np.pi*1210*t))*np.exp(-t/.018)*.035;add(music,wood,start+beat*BEAT,-.4)
 if b==7:
  for beat in [3.25,3.5,3.75]:add(music,tone(81+(int(beat*4)%3)*2,.18,'mallet',.025),start+beat*BEAT,.4)
 # Extra hopeful, high-register layer fades in after solve at runtime.
 for beat,n in [(0,cs[0]+12),(.75,cs[1]+12),(1.5,cs[2]+12),(2.5,cs[1]+12)]:add(solved,tone(n,1.3,'mallet',.06),start+beat*BEAT,(-.3 if beat<2 else .3))
music=room(music);solved=room(solved)
# Continuous low wave wash + periodic breeze/cloth; periodic construction avoids a hard seam.
t=np.arange(N)/SR
amb=np.zeros((N,2))
for ch in range(2):
 raw=noise(DUR,.13,70,1500);f=np.fft.rfftfreq(N,1/SR);sp=np.fft.rfft(raw);sp/=1+(f/1800)**3;wash=np.fft.irfft(sp,N)
 envelope=.36+.18*np.sin(2*np.pi*t/DUR*13+ch*.8)+.12*np.sin(2*np.pi*t/DUR*5)
 amb[:,ch]=wash*envelope+.005*np.sin(2*np.pi*t/DUR*round(75*DUR))
for i in range(16):
 d=.7;sig=noise(d,.016,1200,5200)*np.sin(np.linspace(0,np.pi,round(d*SR)))**2
 add(amb,sig,i*DUR/16+.2,(-.65 if i%2 else .65))
# Tiny edge crossfade only ambience; music release wraps via room circular taps.
for x in [music,solved,amb]:
 fade=round(.015*SR);x[:fade]*=np.linspace(0,1,fade)[:,None];x[-fade:]*=np.linspace(1,0,fade)[:,None]

cues={}
def cue(name,y):cues[name]=y;save(name,y)
t=np.arange(round(.28*SR))/SR
cue('notebook',noise(.28,.10,800,7000)*np.sin(np.linspace(0,np.pi,len(t)))**2 + .025*np.sin(2*np.pi*180*t)*np.exp(-t/.07))
cue('page',noise(.22,.09,1400,8500)*np.sin(np.linspace(0,np.pi,round(.22*SR)))**2)
cue('confirm',tone(81,.22,'mallet',.20))
y=np.zeros(round(1.0*SR))
for i,n in enumerate([62,69,74,78,81]):add(y,tone(n,.65,'mallet',.12),i*.08)
y+=noise(1,.025,1800,8000)*np.sin(np.linspace(0,np.pi,len(y)))**2;cue('create',y)
t=np.arange(round(.32*SR))/SR;cue('wood',(np.sin(2*np.pi*170*t)+.45*np.sin(2*np.pi*391*t))*np.exp(-t/.046)*.25+noise(.32,.025,120,2200)*np.exp(-t/.03))
t=np.arange(round(.9*SR))/SR;cue('metal',sum(np.sin(2*np.pi*f*t)*np.exp(-t/d)*a for f,d,a in [(420,.26,.16),(1127,.15,.08),(1830,.09,.04)]))
cue('rotate',tone(86,.10,'mallet',.10))
t=np.arange(round(.3*SR))/SR;cue('bounce',np.sin(2*np.pi*(260*t-160*t*t))*np.exp(-t/.065)*.22)
t=np.arange(round(.72*SR))/SR;cue('splash',noise(.72,.22,180,7000)*(1-np.exp(-t/.008))*np.exp(-t/.17))
t=np.arange(round(.52*SR))/SR;cue('umbrella',noise(.52,.12,700,6000)*np.sin(np.linspace(0,np.pi,len(t)))**2+.08*np.sin(2*np.pi*220*t)*np.exp(-np.maximum(t-.37,0)/.03)*(t>.37))
t=np.arange(round(.9*SR))/SR;cue('fan',(noise(.9,.045,100,1800)+.025*np.sin(2*np.pi*(75*t+30*t*t)))*np.sin(np.linspace(0,np.pi,len(t)))**2)
y=np.zeros(round(.48*SR));add(y,tone(76,.28,'pluck',.13),0);add(y,tone(69,.28,'pluck',.13),.15);cue('undo',y)
y=np.zeros(round(1.8*SR))
for i,n in enumerate([62,66,69,74,78,81]):add(y,tone(n,1.2,'mallet',.12),i*.095)
cue('success',y)
y=np.zeros(round(.62*SR));add(y,tone(67,.4,'pluck',.14),0);add(y,tone(62,.4,'pluck',.13),.18);cue('mistake',y)
metrics={}
for name,x in [('island-score',music),('hopeful-stem',solved),('water-breeze',amb)]:metrics[name]=save(name,x,ogg=True)
P=round(26*SR);preview=music[:P]*.48+amb[:P]*.45
preview[13*SR:]+=solved[13*SR:P]*.34
for sec,name in [(1,'notebook'),(3.2,'confirm'),(4,'create'),(6,'wood'),(8,'rotate'),(10,'splash'),(11.4,'undo'),(13,'success'),(17,'umbrella'),(20,'metal'),(23,'fan')]:add(preview,cues[name]*.50,sec,.1)
preview[:round(.15*SR)]*=np.linspace(0,1,round(.15*SR))[:,None];preview[-SR:]*=np.linspace(1,0,SR)[:,None]
metrics['mixed-preview']=save('mixed-preview',preview,where=ROOT/'docs/audio')
# Decoded OGG verification, versus just inspecting source floats.
for name in ['island-score','hopeful-stem','water-breeze']:
 p=OUT/(name+'.ogg');raw=subprocess.check_output(['ffmpeg','-v','error','-i',str(p),'-ar',str(SR),'-f','f32le','-acodec','pcm_f32le','-']);z=np.frombuffer(raw,dtype='<f4').reshape(-1,2)
 metrics[name]['decoded_seconds']=len(z)/SR;metrics[name]['decoded_peak']=float(np.max(np.abs(z)));metrics[name]['decoded_RMS']=float(np.sqrt(np.mean(z*z)));metrics[name]['decoded_boundary_delta']=float(np.max(np.abs(z[0]-z[-1])))
(ROOT/'docs/audio/metrics.json').write_text(json.dumps(metrics,indent=2)+'\n')
print(json.dumps(metrics,indent=2))
