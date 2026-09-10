'use client';

import {useEffect, useRef, useState} from 'react';
import {ArrowUpRight, Armchair, BedDouble, Blocks, ChevronRight, Compass, CookingPot, DoorOpen, FileText, Footprints, House, Layers3, Maximize, Minimize, Moon, Pause, RotateCcw, Shirt, Sun, X} from 'lucide-react';
import {Tabs, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {Switch} from '@/components/ui/switch';
import {ToggleGroup,ToggleGroupItem} from '@/components/ui/toggle-group';
import {Sheet, SheetClose, SheetContent, SheetTitle, SheetDescription} from '@/components/ui/sheet';
import type {HomeScene} from '@/lib/home-scene';
import {getLayout,isLayoutVersion,layoutOptions,type LayoutVersion} from '@/lib/layouts';
import {sitePath} from '@/lib/site-path';

export default function Home() {
  const host = useRef<HTMLDivElement>(null);
  const model = useRef<HomeScene|null>(null);
  const [layout,setLayout] = useState<LayoutVersion>('social');
  const {rooms,footprints:roomFootprints} = getLayout(layout);
  const [mode, setMode] = useState('overview');
  const [selected, setSelected] = useState('living');
  const [furniture, setFurniture] = useState(true);
  const [night, setNight] = useState(false);
  const [notes, setNotes] = useState(false);
  const [roomsOpen, setRoomsOpen] = useState(false);
  const [touch, setTouch] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [contextLost, setContextLost] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [locked, setLocked] = useState(false);
  const [position, setPosition] = useState({x:5.72, z:9.12, yaw:0});

  useEffect(() => {
    setTouch(navigator.maxTouchPoints>0);
    const onFullscreen = () => setExpanded(Boolean(document.fullscreenElement));
    const onEscape = (event:KeyboardEvent) => {if(event.key==='Escape'&&!document.fullscreenElement)setExpanded(false);};
    document.addEventListener('fullscreenchange',onFullscreen);
    window.addEventListener('keydown',onEscape);
    return () => {document.removeEventListener('fullscreenchange',onFullscreen);window.removeEventListener('keydown',onEscape);};
  }, []);

  useEffect(() => {
    let cancelled = false;
    import('@/lib/home-scene').then(({HomeScene}) => {
      if (cancelled || !host.current) return;
      try {
        const requested=new URLSearchParams(window.location.search).get('layout');
        const initialLayout=isLayoutVersion(requested)?requested:'social';
        model.current = new HomeScene(host.current, {onLock:setLocked, onPosition:setPosition, onContextChange:setContextLost},initialLayout);
        setLayout(initialLayout);
        setReady(true);
      } catch (cause) {
        console.error(cause);
        setError('Modelul nu a putut porni. Reîncarcă pagina și verifică dacă accelerarea grafică este activă.');
      }
    }).catch(() => setError('Fișierele modelului nu au putut fi încărcate. Reîncarcă pagina.'));
    return () => { cancelled = true; model.current?.dispose(); model.current = null; };
  }, []);

  useEffect(() => {
    if (!ready) return;
    type Registry = {registerTool:(tool:Record<string,unknown>, options:{signal:AbortSignal})=>void|Promise<void>};
    const context = (document as Document & {modelContext?:Registry}).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    try {
      void Promise.resolve(context.registerTool({
        name:'navigate_home_model', title:'Explorează o cameră',
        description:'Alege perspectiva și mută camera în încăperea selectată.',
        inputSchema:{type:'object', properties:{view:{type:'string', enum:['overview','plan','walk']}, room:{type:'string', enum:rooms.map(r=>r.id)}}, required:['view','room'], additionalProperties:false},
        annotations:{readOnlyHint:false, untrustedContentHint:false},
        execute:async (input:unknown) => {
          const value = input as {view?:string;room?:string};
          if (!value || !['overview','plan','walk'].includes(value.view??'') || !rooms.some(r=>r.id===value.room)) throw new Error('Alege o perspectivă și o cameră valide.');
          setMode(value.view!); setSelected(value.room!);
          model.current?.setMode(value.view!); model.current?.goToRoom(value.room!);
          await new Promise<void>(resolve=>requestAnimationFrame(()=>resolve()));
          return {view:value.view, room:value.room};
        },
      }, {signal:lifecycle.signal})).catch(()=>{});
    } catch {}
    return ()=>lifecycle.abort();
  }, [ready,layout,rooms]);

  const changeLayout = (value:LayoutVersion) => {
    if(!model.current)return;
    try{
      model.current.setLayout(value);
      setError('');setLayout(value);setSelected(id=>getLayout(value).rooms.some(r=>r.id===id)?id:'living');
      const url=new URL(window.location.href);url.searchParams.set('layout',value);
      window.history.replaceState(window.history.state,'',url);
    }catch(cause){console.error(cause);setError('Varianta nu a putut fi încărcată. Reîncarcă pagina.');}
  };
  const changeMode = (value:string) => {setMode(value); model.current?.setMode(value);};
  const selectRoom = (id:string) => {setSelected(id); model.current?.goToRoom(id);setRoomsOpen(false);};
  const openNotes = () => {model.current?.unlock();setNotes(true);};
  const changeRoomsOpen = (open:boolean) => {if(open)model.current?.unlock();setRoomsOpen(open);};
  const toggleFullscreen = async () => {
    model.current?.clearKeys();
    if(document.fullscreenElement){await document.exitFullscreen().catch(()=>{});setExpanded(false);return;}
    if(expanded){setExpanded(false);return;}
    setExpanded(true);
    if(document.fullscreenEnabled&&document.documentElement.requestFullscreen){
      try{await document.documentElement.requestFullscreen();}catch{/* The expanded layout remains available. */}
    }
  };
  const room = rooms.find(r=>r.id===selected)!;
  const roomIcon = selected==='kitchen' ? <CookingPot/> : selected==='dressing' ? <Shirt/> : ['master','daughter','guest'].includes(selected)||(selected==='living'&&layout!=='original') ? <BedDouble/> : <Armchair/>;
  const roomList = () => <nav aria-label="Încăperi" className="room-list">{rooms.filter(r=>r.primary).map((r,i)=><button key={r.id} className={`room-button ${selected===r.id?'selected':''}`} aria-current={selected===r.id?'location':undefined} onClick={()=>selectRoom(r.id)}><span className="room-number">{String(i+1).padStart(2,'0')}</span><span className="room-text"><strong>{r.name}</strong><small>{r.detail}</small></span><ChevronRight size={16}/></button>)}</nav>;
  const instructions = touch
    ? mode==='walk'?'Ține apăsate săgețile pentru deplasare. Trage pe imagine pentru privire.':mode==='plan'?'Trage cu un deget. Apropie sau depărtează două degete pentru zoom.':'Un deget: rotire · Două degete: zoom și deplasare'
    : mode==='walk'?'W A S D: deplasare · Mouse: privire · Shift: pas rapid':mode==='plan'?'Derulează pentru apropiere sau depărtare.':'Trage pentru rotire · Derulează pentru apropiere';

  return <main className={`home-app ${mode==='walk'?'walk-mode':''} ${touch?'touch-device':''} ${expanded?'expanded':''}`}>
    <header className="topbar">
      <a href={sitePath('/')} className="brand" aria-label="Acasă"><span className="brand-mark"><House size={21}/></span><span>A32<span className="brand-dot"> / </span>ACASĂ</span></a>
      <div className="project-title">Acasă, împreună <span>Etajul 2</span></div>
      <div className="header-actions"><button className="room-menu-trigger" aria-haspopup="dialog" aria-expanded={roomsOpen} onClick={()=>changeRoomsOpen(true)}><DoorOpen/>Încăperi</button><button className="plain-button" onClick={openNotes} aria-label="Despre amenajare"><FileText size={16}/><span>Despre amenajare</span><ArrowUpRight size={15}/></button></div>
    </header>
    <div className="layout-bar">
      <div className="layout-heading"><strong>Compară amenajările</strong><span>Aceeași perspectivă pentru cele trei variante.</span></div>
      <ToggleGroup className="layout-switch" aria-label="Varianta de amenajare" value={[layout]} onValueChange={values=>{if(isLayoutVersion(values[0]))changeLayout(values[0]);}}>
        {layoutOptions.map(option=><ToggleGroupItem key={option.id} value={option.id} disabled={!ready||contextLost} aria-label={`${option.number} ${option.name}`}><span className="layout-number">{option.number}</span>{option.name}</ToggleGroupItem>)}
      </ToggleGroup>
      <span className="layout-detail" aria-live="polite">{layout==='social'?'Insulă · Dining separat · TV 160 cm':layout==='suite'?'Perete nou de 15 cm · Dressing deschis':'Amenajarea inițială'}</span>
    </div>
    <div className="workspace">
      <aside className="room-panel">
        <div className="panel-heading"><span className="eyebrow">LOCUINȚA NOASTRĂ</span><h1>Loc pentru<br/>fiecare dintre noi.</h1><p>Materiale naturale. Confort. Liniște.</p></div>
        <div className="area-stats"><div><strong>{layout==='suite'?'4':'3'}</strong><span>Dormitoare</span></div><div><strong>{layout!=='original'?'1':'2'}</strong><span>{layout!=='original'?'Birou':'Birouri'}</span></div><div><strong>{layout!=='original'?'1':'6'}</strong><span>{layout!=='original'?'Dressing deschis':'Locuri la masă'}</span></div></div>
        <div className="room-list-label"><span>EXPLOREAZĂ LOCUINȚA</span></div>
        {roomList()}
        <div className="connection-note"><DoorOpen size={20}/><div><strong>O singură locuință</strong><p>Cele două holuri sunt unite printr-un pasaj interior.</p><button onClick={()=>selectRoom('connection')}>Vezi legătura <ArrowUpRight size={13}/></button></div></div>
        <div className="palette"><span className="eyebrow">MATERIALE ȘI FINISAJE</span><div className="swatches">{[['#79563d','Nuc'],['#dccdb5','Travertin'],['#e8dfcd','In'],['#858870','Verde măsliniu'],['#ab8c58','Alamă']].map(([color,name])=><span key={name} style={{background:color}} title={name}/>)}</div><p>Nuc · Travertin · In · Alamă</p></div>
      </aside>
      <section className="model-area" aria-label="Model interactiv al locuinței">
        <div ref={host} className="three-host"/>
        <div className="view-top"><Tabs value={mode} onValueChange={v=>changeMode(String(v))}><TabsList className="view-tabs"><TabsTrigger value="overview"><Layers3/>Vedere 3D</TabsTrigger><TabsTrigger value="plan"><Blocks/>Plan</TabsTrigger><TabsTrigger value="walk"><Footprints/>Plimbare</TabsTrigger></TabsList></Tabs><div className="view-status"><i/>{ready?'MODEL 3D':'SE ÎNCARCĂ'}</div></div>
        {(error||contextLost)&&<div className="model-error" role="alert"><h2>Vederea 3D nu este disponibilă.</h2><p>{contextLost?'Modelul se restabilește. Dacă nu reapare, reîncarcă pagina.':error}</p><button onClick={()=>window.location.reload()}>Reîncarcă pagina</button></div>}
        <div className="model-caption"><span className="eyebrow">{mode==='walk'?'LA NIVELUL PRIVIRII':mode==='plan'?'VEDERE DE SUS':'ACASĂ, DIN ORICE UNGHI'}</span><h2>{mode==='walk'?'Intră și descoperă.':mode==='plan'?'Totul se leagă.':'Spațiu pentru viața noastră.'}</h2><p>{instructions}</p></div>
        <div className="right-tools"><button onClick={()=>{setNight(!night);model.current?.setNight(!night);}} aria-label={night?'Lumină de zi':'Lumină de seară'} title={night?'Lumină de zi':'Lumină de seară'}>{night?<Moon/>:<Sun/>}</button><button onClick={()=>model.current?.reset()} aria-label="Resetează perspectiva" title="Resetează perspectiva"><RotateCcw/></button><button onClick={toggleFullscreen} aria-label={expanded?'Ieși din ecranul complet':'Ecran complet'} title={expanded?'Ieși din ecranul complet':'Ecran complet'} aria-pressed={expanded}>{expanded?<Minimize/>:<Maximize/>}</button></div>
        <div className="north"><Compass size={32}/><span>N</span></div>
        {mode==='walk'&&!locked&&ready&&!contextLost&&<button className="enter-walk" onClick={()=>model.current?.lock()}><Footprints size={20}/>Începe plimbarea<span>{touch?'Folosește săgețile și trage pe imagine.':'Esc eliberează mouse-ul'}</span></button>}
        {mode==='walk'&&locked&&<div className="crosshair"/>}
        {mode==='walk'&&locked&&<><div className="touch-controls" role="group" aria-label="Comenzi de deplasare">{[['ArrowLeft','←','Stânga'],['ArrowUp','↑','Înainte'],['ArrowDown','↓','Înapoi'],['ArrowRight','→','Dreapta']].map(([key,label,name])=><button key={key} data-direction={key} onContextMenu={e=>e.preventDefault()} onPointerDown={e=>{e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);model.current?.setTouchKey(e.pointerId,key);}} onPointerUp={e=>model.current?.setTouchKey(e.pointerId,null)} onPointerCancel={e=>model.current?.setTouchKey(e.pointerId,null)} onLostPointerCapture={e=>model.current?.setTouchKey(e.pointerId,null)} aria-label={name}>{label}</button>)}</div><button className="pause-walk" onClick={()=>model.current?.unlock()}><Pause/>Pauză</button></>}
        <div className="view-bottom"><div className="selected-card"><span className="selected-icon">{roomIcon}</span><div><span className="eyebrow">{room.side}</span><strong>{room.name}</strong><p>{room.description}</p></div></div><div className="mini-map"><span>EȘTI AICI</span><svg viewBox="-1 -1 16.2 12.1" aria-label="Harta locuinței">{rooms.filter(r=>r.id!=='connection').map(r=><polygon key={r.id} points={(roomFootprints[r.id]??[[r.x,r.z],[r.x+r.w,r.z],[r.x+r.w,r.z+r.d],[r.x,r.z+r.d]]).map(p=>p.join(',')).join(' ')} fill={r.id===selected?'#bd9d75':'#e2ded4'} stroke="#fff" strokeWidth=".1"/>)}<circle cx={position.x} cy={position.z} r=".26" fill="#3f5847" stroke="white" strokeWidth=".12"/></svg></div></div>
        <footer className="model-footer"><span>Acasă, împreună</span><div><label><Switch checked={furniture} onCheckedChange={v=>{setFurniture(v);model.current?.setFurniture(v);}} aria-label="Arată mobilierul"/>Mobilier</label></div><button onClick={openNotes}><FileText size={14}/>Detalii</button></footer>
      </section>
    </div>
    <Sheet open={roomsOpen} onOpenChange={changeRoomsOpen}><SheetContent side="left" className="rooms-sheet" showCloseButton={false}><SheetClose className="notes-close" aria-label="Închide"><X size={20}/></SheetClose><SheetTitle>Încăperi</SheetTitle><SheetDescription>Alege un loc pentru a muta perspectiva.</SheetDescription>{roomList()}<button className="connection-link" onClick={()=>selectRoom('connection')}><DoorOpen/>Vezi pasajul interior<ChevronRight/></button></SheetContent></Sheet>
    <Sheet open={notes} onOpenChange={setNotes}><SheetContent className="source-sheet" showCloseButton={false}><SheetClose className="notes-close" aria-label="Închide"><X size={20}/></SheetClose><SheetTitle>Despre amenajare</SheetTitle><SheetDescription>O locuință gândită pentru întreaga familie.</SheetDescription><div className="source-body">
      {layout==='social'?<><h3>Living, dining și insulă</h3><p>Masa pentru șase persoane se mută în fostul dormitor de est. Peretele dintre camere se păstrează la 1,35 m, cu un blat de piatră deasupra. Blatul de lucru al bucătăriei rămâne la 95 cm. Structura din stânga rămâne întreagă, cu finisaj din nuc. O trecere de 1,05 m leagă încăperile în est.</p><h3>Loc pentru relaxare</h3><p>Canapeaua dreaptă de 2,60 m stă cu spatele spre bucătărie. Un culoar de lucru de aproximativ 1 m rămâne în spate. Televizorul de pe peretele opus are lățimea de 160 cm. Măsuța compactă păstrează trecerea liberă. Dulapurile suspendate dispar de deasupra insulei.</p><h3>Structura păstrată</h3><p>Modelul păstrează elementul din stânga și toate ghenele. Dimensiunile structurii trebuie confirmate pe șantier. Reducerea peretelui și trecerea nouă trebuie verificate de un inginer structurist înainte de lucrări.</p></>:<><h3>Bucătărie și loc de luat masa</h3><p>Bucătăria spațioasă ocupă fostul salon din apartamentul din dreapta. Masa de 1,90 × 0,90 m are șase scaune tapițate. Un colțar verde-salvie de 2,45 × 2,00 m și o măsuță ovală creează un al doilea loc de relaxare, fără televizor. Dulapurile până la tavan, sertarele adânci și electrocasnicele integrate păstrează blatul liber.</p></>}
      {layout!=='original'?<>
        <h3>Dormitor matrimonial și dressing deschis</h3><p>Fostul living devine dormitor, cu pat de 2 × 2 m, tăblie tapițată, două noptiere și dulapuri suplimentare în locul televizorului. Peretele nou de 15 cm are o întoarcere scurtă spre camera de oaspeți. Ușa de 1 m se deschide în dormitor. Holul comun păstrează accesul la baie și la celelalte camere.</p>
        <h3>Un dressing în locul biroului</h3><p>Dressingul deschis se extinde din fostul birou spre dormitor. Două corpuri din nuc, de 2,20 m și 1,60 m, au o adâncime de 60 cm. Rafturile luminate, barele pentru haine, sertarele, oglinda înaltă și taburetul tapițat completează spațiul. Fereastra rămâne liberă.</p>
        <h3>Spațiu pentru trecere</h3><p>Planul propus păstrează aproximativ 81 cm pe latura de est a patului și 75 cm între pat și dulapurile de 36 cm adâncime. Acestea au rafturi pentru haine împăturite; barele pentru umerașe rămân în dressing. Holul din dreptul băii are aproximativ 1,08 m. Suprafața închisă este de aproximativ 20,94 m², inclusiv zona de dressing de 5,69 m². Valorile sunt calculate din model și trebuie verificate la fața locului.</p>
      </>:<><h3>Un living pentru relaxare</h3><p>Canapeaua verde-salvie, cele două fotolii crem și măsuța ovală din lemn completează zona cu televizor. Canapeaua ajunge la capătul peretelui din spate, în locul lampadarului. Un fotoliu este mutat lateral pentru a elibera zona televizorului. Mobilierul din lemn și textilele naturale completează zona de relaxare. Al doilea birou se află în locul fostei bucătării, integrat în mobilier.</p></>}
      <h3>Depozitare în hol</h3><p>Holul către bucătărie are un dulap pentru paltoane, jachete și încălțăminte. Ușile glisante păstrează trecerea liberă.</p>
      <h3>Camera fetiței</h3><p>Patul-căsuță are un cadru din lemn și lumină caldă. Norii luminoși, rafturile cu cărți, cutiile pentru jucării și cortul de lectură completează spațiul de joacă. Textilele crem și roz pudrat păstrează atmosfera calmă.</p>
      <h3>Balcoane verzi</h3><p>Băncile cu spațiu de depozitare, pernele de exterior, jardinierele și panourile cu plante transformă balcoanele în locuri de relaxare. Mobilierul este așezat lângă clădire, iar traseele către uși rămân libere.</p>
      <h3>Uși și băi</h3><p>Ușa camerei de oaspeți este pe peretele dinspre hol, aproape de deschiderea din planul etajului. Golul nedorit din peretele băii a fost închis. Căzile, lavoarele și vasele WC sunt orientate conform planurilor.</p>
      <h3>Plimbare</h3><p>Mobilierul aflat la cel mult 20 cm de un perete nu oprește deplasarea. Mobilierul separat de pereți rămâne un obstacol. Pereții, structura și insula rămân solide.</p><h3>Despre model</h3><p>Modelul urmărește conturul și pozițiile pereților din documentele furnizate. Unele detalii și înălțimea camerelor sunt estimări. Deschiderea dintre apartamente este o propunere și trebuie verificată de un inginer structurist înainte de lucrări.</p>
    </div></SheetContent></Sheet>
  </main>;
}
