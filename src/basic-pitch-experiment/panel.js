/* Optional, explicitly user-initiated neural transcription in the EXISTING
 * audio analyzer. Does not change the original circle or scale matcher.
 */
(() => {
  'use strict';
  const host=document.getElementById('bestMatch');
  if (!host || !host.parentNode) return;
  const root=document.createElement('section');
  root.id='basicPitchMicrotonalExperiment';
  root.style.cssText='margin:18px 0;padding:15px;border:1px solid #9db4c4;border-radius:12px;background:rgba(116,147,172,.065);';
  root.setAttribute('aria-label','Neural microtonal analysis experiment');
  const title=document.createElement('h3');
  title.textContent='Neural microtonal analysis · Basic Pitch experiment';
  const intro=document.createElement('p');
  intro.textContent='Separate from the existing scale matches. Spotify Basic Pitch estimates notes and pitch bends; an experimental Persian modal comparison ranks 7 Dastgahs and 5 Avazha. Musical accuracy is not yet validated.';
  const button=document.createElement('button');
  button.type='button';button.disabled=true;button.textContent='Try neural microtonal detection';
  button.style.cssText='padding:10px 13px;border-radius:8px;cursor:pointer;margin:5px 0;';
  const excerptRow=document.createElement('label');
  excerptRow.style.cssText='display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:8px 0;';
  excerptRow.append(document.createTextNode('Start analysis at (seconds): '));
  const excerptStart=document.createElement('input');
  excerptStart.type='number';
  excerptStart.min='0';
  excerptStart.step='1';
  excerptStart.value='0';
  excerptStart.style.cssText='width:95px;padding:6px;';
  excerptRow.append(excerptStart);
  const excerptHint=document.createElement('small');
  excerptHint.textContent='The next 45 seconds are analyzed. For long recordings, try 0, 60, 120…';
  excerptHint.style.cssText='display:block;margin:0 0 8px;';
  const status=document.createElement('p');
  status.setAttribute('aria-live','polite');status.setAttribute('role','status');
  status.textContent='Analyze a recording with the normal analyzer first.';
  const results=document.createElement('div');results.setAttribute('aria-live','polite');
  root.append(title,intro,excerptRow,excerptHint,button,status,results);
  host.insertAdjacentElement('afterend',root);
  let selectedFile=null, generation=-1, task=0, inProgress=false, latest=null, workerEvents=[];
  function clear(){
    task++;selectedFile=null;generation=-1;latest=null;workerEvents=[];results.replaceChildren();
    // Basic Pitch is not abortable once neural inference starts; a stale
    // result is ignored instead of being displayed for a different recording.
    status.textContent='Analyze a recording with the normal analyzer first.';
    button.disabled=true;
  }
  window.addEventListener('persian:audio-analysis-reset',clear);
  window.addEventListener('persian:audio-analysis-ready',event=>{
    clear();
    const f=event.detail?.file;
    selectedFile=(typeof File!=='undefined' && f instanceof File)? f:null;
    generation=event.detail?.generation ?? -1;
    workerEvents=Array.isArray(event.detail?.events) ? event.detail.events : [];
    button.disabled=!selectedFile||inProgress;
    excerptStart.value='0';
    status.textContent=selectedFile?'Ready. Choose the excerpt start time, then click to analyze 45 seconds locally.':'No recording available.';
  });
  async function loadEngine(){
    if(window.PersianBasicPitchExperiment) return window.PersianBasicPitchExperiment;
    await import('./neural-microtone.bundle.js');
    if(!window.PersianBasicPitchExperiment)throw Error('Neural bundle missing. Run npm run basic-pitch:build in this PR checkout.');
    return window.PersianBasicPitchExperiment;
  }
  function para(text){const p=document.createElement('p');p.textContent=text;return p;}
  function exportCsv(analysis){
    const header='start_seconds,end_seconds,pitch_hz,relative_cents_from_12tet,duration_seconds';
    const lines=analysis.melody.map(n=>[n.start+analysis.startSeconds,n.end+analysis.startSeconds,n.hz,n.centsOffsetFromPiano,n.duration].map(x=>Number(x).toFixed(4)).join(','));
    const csv=[header,...lines].join('\n')+'\n';
    const blob=new Blob([csv],{type:'text/csv;charset=utf-8'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');a.href=url;a.download=`neural-microtonal-melody-from-${Math.round(analysis.startSeconds)}s.csv`;a.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  function render(analysis){
    results.replaceChildren();
    if(!analysis.melodyCount){results.append(para('No stable notes were extracted; no mode is suggested.'));return;}
    results.append(para(`${analysis.noteCount} detected notes; ${analysis.melodyCount} predominant-melody notes; ${analysis.seconds.toFixed(1)} seconds analyzed (from ${analysis.startSeconds.toFixed(1)} to ${(analysis.startSeconds+analysis.seconds).toFixed(1)} s of recording).`));
    results.append(para(`Median absolute deviation from the nearest 12-TET note: ${Number(analysis.medianAbsCentsDeviation).toFixed(1)} cents (neural estimate, NOT measured pitch accuracy).`));
    const reliability=analysis.reliability;
    const warning=para(analysis.decision==='uncertain'
      ? `UNRELIABLE MELODY — NO MODAL IDENTIFICATION: ${analysis.decisionReason}`
      : `Exploratory ranking only; no validated Dastgah/Avaz identification. ${analysis.decisionReason}`);
    warning.style.cssText='font-weight:700;border-left:3px solid #bc8527;padding:8px 12px;background:rgba(190,135,30,.08);';
    results.append(warning);
    if(reliability)results.append(para(`Neural tracking diagnostic: ${reliability.harmonicLeaps} integer-ratio large jumps / ${Math.max(0,reliability.noteCount-1)} note transitions; ${(100*reliability.topFourCoverage).toFixed(0)}% pitch-profile energy in four bins. These are warning indicators, not verified errors.`));
    if(analysis.comparison?.available){
      const cmp=analysis.comparison;
      results.append(para(`Cross-check against independent original analyzer: ${cmp.compared} overlapping notes; ${cmp.compared ? (cmp.agreementFraction*100).toFixed(0)+'%' : 'N/A'} within 100 cents; ${cmp.harmonicConflicts} integer-harmonic disagreements. Neither extractor is ground truth.`));
    }
    if(analysis.workerRanked?.length)results.append(para(`Original analyzer's pitch-only comparison: ${analysis.workerRanked.slice(0,3).map(m=>m.name).join(', ')} (also heuristic, not calibrated).`));
    const h=document.createElement('h4');h.textContent=analysis.decision==='uncertain'
      ? 'Unsafe neural ranking (for diagnosis ONLY)' : 'All 12 candidate modes · unvalidated heuristic fit';results.append(h);
    const list=document.createElement('ol');
    for(const entry of analysis.ranked){
      const li=document.createElement('li');
      li.textContent=`${entry.name} (${entry.type}) · relative fit ${entry.fit.toFixed(3)} · transposition bin ${entry.tonicBin}`;
      list.append(li);
    }
    results.append(list);
    const disclaimer=para('Important: These fit values are NOT probabilities. Shur-related Avazha share pitch collections, and Mahur/Rast-Panjgah cannot be reliably separated by this pitch-based heuristic. Do not interpret a top candidate as a verified diagnosis.');
    disclaimer.style.fontSize='.88em';results.append(disclaimer);
    const save=document.createElement('button');save.type='button';save.textContent='Export estimated microtonal melody CSV';
    save.addEventListener('click',()=>exportCsv(analysis));results.append(save);
  }
  button.addEventListener('click',async()=>{
    if(inProgress || !selectedFile)return;
    inProgress=true;button.disabled=true;
    const file=selectedFile, sameGeneration=generation, thisTask=++task;
    const startSeconds=Math.max(0,Number(excerptStart.value)||0);
    results.replaceChildren();
    try{
      status.textContent='Loading neural transcription engine…';
      const engine=await loadEngine();
      if(thisTask!==task || selectedFile!==file || generation!==sameGeneration)return;
      const referenceEvents=workerEvents;
      const analysis=await engine.runNeuralMicrotones(file,message=>{
        if(thisTask===task)status.textContent=String(message);
      }, 45, referenceEvents, startSeconds);
      if(thisTask!==task || selectedFile!==file || generation!==sameGeneration)return;
      latest=analysis;
      status.textContent='Neural microtonal analysis complete (experimental; not validated).';
      render(latest);
    }catch(error){
      if(thisTask===task)status.textContent=`Could not run Basic Pitch: ${error.message}. If the bundle is missing, follow the PR setup instructions.`;
    }finally{
      inProgress=false;
      button.disabled=!selectedFile;
    }
  });
})();
