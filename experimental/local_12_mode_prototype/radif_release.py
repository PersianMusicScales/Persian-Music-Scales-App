#!/usr/bin/env python3
"""Frozen V4 (225-feature) Persian Dastgah/Avaz local prototype.

Commands: freeze / final-test / serve / status. All development and model files
stay on the user's PC. `final-test` is an explicitly separate, one-shot action.
"""
from __future__ import annotations

import argparse
import csv
import hashlib
import json
import os
from pathlib import Path
import shutil
import sys
import tempfile
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import unquote

import joblib
import numpy as np
from sklearn.ensemble import ExtraTreesClassifier
from sklearn.impute import SimpleImputer
from sklearn.metrics import accuracy_score, confusion_matrix, f1_score, recall_score
from sklearn.pipeline import make_pipeline

MODES = ('abu_ata','afshari','bayat_tork','chahargah','dashti','esfahan',
         'homayoun','mahur','nava','rast_panjgah','segah','shur')
VERSION = 'release-v4-225-2026-11-13-1'
BASELINE_CORRECT = 29
BASELINE_F1 = 0.58902
MAX_UPLOAD = 80 * 1024 * 1024
EXTENSIONS = {'.flac','.wav','.mp3','.m4a','.aac','.ogg','.aiff','.aif','.opus'}


def digest(path: Path) -> str:
    h = hashlib.sha256()
    with path.open('rb') as f:
        for chunk in iter(lambda: f.read(1024*1024), b''): h.update(chunk)
    return h.hexdigest()


def write_json(path: Path, value) -> None:
    path.write_text(json.dumps(value, indent=2, ensure_ascii=False), encoding='utf-8')


def setup(root: Path):
    lab = root / 'radif_discovery_lab'
    if not lab.is_dir(): raise FileNotFoundError('Missing lab directory: '+str(lab))
    if str(lab) not in sys.path: sys.path.insert(0, str(lab))
    import v3_preflight as pre
    import v4_contour_benchmark as v4
    import radif_lab as core
    import importlib.util
    state_path = root/'KDC_study'/'discovery_fixed'/'state.json'
    if not state_path.is_file(): raise FileNotFoundError(str(state_path))
    state = v4.read_state(state_path)
    model_path = state_path.parent / 'champion.py'
    if not model_path.is_file(): raise FileNotFoundError('Retained champion missing: '+str(model_path))
    spec = importlib.util.spec_from_file_location('retained_v4_champion', model_path)
    champion = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(champion)
    manifest = Path(state['manifest'])
    cache = Path(state['cache'])
    rows = pre.read_csv(manifest)
    pre.validate_splits(rows)
    if len(rows)!=65 or sum(r['split']=='test' for r in rows)!=16:
        raise ValueError('Expected the original fixed 37/12/16 KDC split')
    if set(r['mode'] for r in rows) != set(MODES): raise ValueError('Unexpected modal labels')
    if int(state['max_seconds']) != 60 or state['pitch_method'] != 'yin':
        raise ValueError('Frozen extraction requires 60 s and NumPy YIN')
    sources = [Path(__file__).resolve(), Path(v4.__file__).resolve(),
               Path(pre.__file__).resolve(), Path(core.__file__).resolve(),
               Path(champion.__file__).resolve(), manifest, state_path]
    fingerprints = {p.name: digest(p) for p in sources}
    return pre, v4, core, champion, state, rows, cache, fingerprints


def new_model():
    return make_pipeline(SimpleImputer(strategy='median'),
        ExtraTreesClassifier(n_estimators=200, min_samples_leaf=2,
            class_weight='balanced', random_state=42, n_jobs=1))


def features_for_audio(path: Path, core, v4) -> np.ndarray:
    old = np.asarray(core.extract_one(str(path), 60, 'yin'), dtype=float)
    f0, rms = v4.decode_pitch_track(str(path), 60)
    vec = v4.assemble('full_147_plus_contour', old, v4.contour_features(f0, rms))
    if vec.shape != (225,) or not np.all(np.isfinite(vec)):
        raise ValueError('Audio did not yield a valid 225-feature vector')
    return vec


def freeze(root: Path, output: Path):
    pre, v4, core, champion, state, rows, cache, hashes = setup(root)
    if (output/'frozen.json').exists() or (output/'model.joblib').exists():
        raise FileExistsError('Release already frozen. Do not retrain or overwrite it.')
    dev, dimensions = pre.load_dev_features(rows, state, cache)
    if len(dev)!=49 or dimensions!=147: raise ValueError('Missing 49 cached development feature vectors')
    contour_cache = root/'v4_contour_evidence'/'pitch_cache'
    if not contour_cache.is_dir():
        raise FileNotFoundError('V4 pitch cache not found: '+str(contour_cache))
    for ix, row in enumerate(dev, 1):
        f0,rms = v4.get_track(row, 60, contour_cache)
        row['versions'] = {'full_147_plus_contour':v4.assemble(
            'full_147_plus_contour', row['features'], v4.contour_features(f0, rms))}
        if ix%10==0 or ix==49: print(f'Prepared development vectors: {ix}/49',flush=True)
    parity, _ = v4.cross_validate(dev, champion.predict, 'full_147_plus_contour')
    if parity['correct'] != BASELINE_CORRECT or abs(parity['macro_f1']-BASELINE_F1) > .0001:
        raise ValueError('V4 parity check FAILED. No release model created: '+str(parity))
    x = np.stack([r['versions']['full_147_plus_contour'] for r in dev])
    y = [r['mode'] for r in dev]
    model = new_model()
    model.fit(x, y)
    if set(model.classes_) != set(MODES): raise ValueError('Trained model missing a mode')
    output.mkdir(parents=True, exist_ok=True)
    temp = output/'model.tmp.joblib'
    joblib.dump(model, temp, compress=3)
    temp.replace(output/'model.joblib')
    info = {'version': VERSION, 'created_utc':datetime.now(timezone.utc).isoformat(),
            'model_sha256':digest(output/'model.joblib'), 'source_hashes':hashes,
            'training_recordings':49, 'feature_dimensions':225,
            'development_out_of_performer':{'correct':parity['correct'], 'n':49,
                'macro_f1':parity['macro_f1'], 'accuracy':parity['accuracy']},
            'training_set':'KDC train+val ONLY', 'final_test_status':'NOT_RUN',
            'model':'SimpleImputer(median) + ExtraTrees(200,leaf2,balanced,seed42)',
            'uncertainty':'ExtraTrees vote fractions are not calibrated probabilities'}
    write_json(output/'frozen.json',info)
    print('FROZEN:',output/'frozen.json','\nModel:',output/'model.joblib')
    print('Holdout untouched. To evaluate it ONCE, run the separate final-test command.')


def load_frozen(root: Path, output: Path):
    frozen = output/'frozen.json'
    if not frozen.is_file(): raise FileNotFoundError('First run freeze; '+str(frozen))
    meta = json.loads(frozen.read_text(encoding='utf-8'))
    if meta.get('version') != VERSION: raise ValueError('Wrong release version')
    if digest(output/'model.joblib') != meta['model_sha256']:
        raise ValueError('Frozen model has been modified')
    stuff = setup(root)
    if stuff[-1] != meta['source_hashes']:
        raise ValueError('Frozen source or manifest changed since freeze; refusing to use model')
    model = joblib.load(output/'model.joblib')  # Load ONLY the model trained locally by freeze.
    return meta, model, stuff


def final_test(root: Path, output: Path):
    meta, model, stuff = load_frozen(root, output)
    pre, v4, core, champion, state, rows, cache, hashes = stuff
    test_rows = [r for r in rows if r['split']=='test']
    if len(test_rows)!=16 or len({r['performer'] for r in test_rows})!=1:
        raise ValueError('Final-test must contain exactly 16 recordings of one reserved performer')
    for r in test_rows:
        if not Path(r['source']).is_file(): raise FileNotFoundError(r['source'])
    if shutil.which('ffmpeg') is None: raise RuntimeError('FFmpeg not found on PATH')
    completed=output/'final_test_summary.json'
    if completed.exists(): raise FileExistsError('Final test already completed; do not rerun.')
    # Exclusive one-attempt latch. Create ONLY after all metadata/path checks.
    latch=output/'FINAL_TEST_STARTED.lock'
    fd=os.open(str(latch), os.O_CREAT|os.O_EXCL|os.O_WRONLY, 0o600)
    with os.fdopen(fd,'w',encoding='utf-8') as f:
        f.write('Frozen SHA256: '+meta['model_sha256']+'\n')
        f.write('Started: '+datetime.now(timezone.utc).isoformat()+'\n')
    print('FINAL TEST STARTED (one attempt; no model changes permitted)',flush=True)
    truth=[]; pred=[]; records=[]
    for i,r in enumerate(test_rows,1):
        vec=features_for_audio(Path(r['source']),core,v4)
        scores=model.predict_proba(vec.reshape(1,-1))[0]
        ranked=sorted(zip(model.classes_,scores), key=lambda p:-p[1])
        label=str(ranked[0][0]);truth.append(r['mode']);pred.append(label)
        records.append({'source':r['source'],'performer':r['performer'],
            'actual':r['mode'],'predicted':label,'correct':int(label==r['mode']),
            'top3':'; '.join(f'{m}={s:.4f}' for m,s in ranked[:3])})
        print(f'Independent test: {i}/16',flush=True)
    results={'version':VERSION, 'completed_utc':datetime.now(timezone.utc).isoformat(),
        'n_test':16, 'correct':sum(a==b for a,b in zip(truth,pred)),
        'accuracy':round(float(accuracy_score(truth,pred)),5),
        'macro_f1_12':round(float(f1_score(truth,pred,labels=MODES,average='macro',zero_division=0)),5),
        'recall_by_mode':{m:round(float(v),4) for m,v in zip(MODES,recall_score(truth,pred,labels=MODES,average=None,zero_division=0))},
        'confusion_matrix':confusion_matrix(truth,pred,labels=MODES).tolist(),
        'labels':list(MODES),'model_sha256':meta['model_sha256'],
        'development_accuracy':meta['development_out_of_performer']['accuracy'],
        'interpretation':'Single performer, small held-out sample; not general population accuracy'}
    with (output/'final_test_predictions_LOCAL.csv').open('w',newline='',encoding='utf-8-sig') as file:
        writer=csv.DictWriter(file,fieldnames=list(records[0]));writer.writeheader();writer.writerows(records)
    write_json(completed,results)
    report=['# Frozen V4 — one-time independent KDC final test','',
        'Final-test recordings: **16**, one previously unseen performer.',
        f'Correct: **{results["correct"]}/16**',
        f'Accuracy: **{results["accuracy"]:.3f}**',
        f'Macro-F1 across all 12 classes: **{results["macro_f1_12"]:.3f}**','',
        'Feature pipeline: frozen 147 + 78 = 225; first 60 s, NumPy YIN.',
        'Model: trained on 49 development recordings, frozen before opening this final test.',
        'Class vote fractions are NOT calibrated confidence.',
        'This is only one held-out performer and 16 short examples; do not tune after viewing.','',
        '## Per-mode recall','']
    for m,v in results['recall_by_mode'].items():report.append(f'- {m}: {v:.3f}')
    (output/'final_test_report_for_chat.md').write_text('\n'.join(report)+'\n',encoding='utf-8')
    print('ONE-TIME TEST FINISHED:', output/'final_test_report_for_chat.md')


PAGE = '''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Persian Music — Local 12-Mode Prototype</title><style>
:root{font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:#202d38;background:#f5f7fa}
body{max-width:750px;margin:5vh auto;padding:0 20px}main{background:white;border:1px solid #dae3eb;border-radius:18px;padding:32px;box-shadow:0 6px 26px #12283a0b}
h1{margin:0 0 8px;font-size:1.7rem}p{line-height:1.6}input{width:100%;margin:20px 0}button{background:#123b52;color:white;border:0;border-radius:9px;padding:12px 22px;cursor:pointer}
button:disabled{opacity:.55}li{margin:10px 0}small{color:#526678}#result{margin-top:24px}code{font-size:.9em}
</style></head><body><main><h1>Persian music · 12-mode research prototype</h1>
<p>Select an audio file to receive a ranked experimental estimate across the seven Dastgahs and five Avazha. All processing stays on this computer.</p>
<p><strong>Important:</strong> Not a validated musical identification service. Scores are uncalibrated tree-vote fractions. Do not upload a reserved KDC final-test recording here.</p>
<input type="file" id="audio" accept=".flac,.wav,.mp3,.m4a,.aac,.ogg,.aiff,.aif,.opus"><button id="go">Analyze locally</button>
<div id="result" aria-live="polite"></div><p><small>Frozen V4 · 225 acoustic features · first 60 seconds · no network service.</small></p>
</main><script>
const b=document.getElementById('go'), a=document.getElementById('audio'), o=document.getElementById('result');
b.onclick=async()=>{if(!a.files.length){o.textContent='Choose an audio file first.';return;} b.disabled=true;o.textContent='Analyzing audio on this computer…';
try{const f=a.files[0]; const r=await fetch('/analyze',{method:'POST',headers:{'X-Filename':encodeURIComponent(f.name)},body:f});
const data=await r.json();if(!r.ok)throw new Error(data.error||'Analysis failed');
o.replaceChildren();const h=document.createElement('h2');h.textContent='Ranked suggestions';o.append(h);
const ol=document.createElement('ol');for(const x of data.ranked){const li=document.createElement('li');li.textContent=x.label+' — '+(100*x.vote_fraction).toFixed(1)+'% tree votes';ol.append(li);}o.append(ol);
const p=document.createElement('p');p.textContent='These scores are not calibrated probabilities and are not evidence of reliable mode identification.';o.append(p);
}catch(e){o.textContent='Error: '+e.message;}finally{b.disabled=false;}};
</script></body></html>'''


def serve(root: Path, output: Path, port: int):
    meta, model, stuff = load_frozen(root, output)
    pre,v4,core,champion,state,rows,cache,hashes = stuff
    blocked={Path(r['source']).name.lower() for r in rows if r['split']=='test'}
    class Handler(BaseHTTPRequestHandler):
        def do_GET(self):
            if self.path!='/': self.send_error(404);return
            data=PAGE.encode('utf-8');self.send_response(200)
            self.send_header('Content-Type','text/html; charset=utf-8')
            self.send_header('Content-Length',str(len(data)));self.end_headers();self.wfile.write(data)
        def do_POST(self):
            if self.path!='/analyze':self.send_error(404);return
            try:
                size=int(self.headers.get('Content-Length','0'))
                name=Path(unquote(self.headers.get('X-Filename',''))).name
                if size<1024 or size>MAX_UPLOAD:raise ValueError('Upload must be between 1 KB and 80 MB')
                if Path(name).suffix.lower() not in EXTENSIONS:raise ValueError('Unsupported audio file extension')
                if name.lower() in blocked:raise ValueError('Reserved KDC final-test filename blocked')
                with tempfile.TemporaryDirectory(prefix='radif_local_') as folder:
                    audio=Path(folder)/('input'+Path(name).suffix.lower())
                    remaining=size
                    with audio.open('wb') as dest:
                        while remaining:
                            chunk=self.rfile.read(min(1024*1024,remaining))
                            if not chunk:raise ValueError('Incomplete upload')
                            dest.write(chunk);remaining-=len(chunk)
                    vec=features_for_audio(audio,core,v4)
                scores=model.predict_proba(vec.reshape(1,-1))[0]
                ranked=[{'label':str(m),'vote_fraction':round(float(p),5)} for m,p in
                    sorted(zip(model.classes_,scores), key=lambda x:-x[1])]
                self.reply(200,{'ranked':ranked,'model_sha256':meta['model_sha256']})
            except Exception as exc:self.reply(400,{'error':str(exc)[:500]})
        def reply(self,status,data):
            payload=json.dumps(data).encode('utf-8');self.send_response(status)
            self.send_header('Content-Type','application/json')
            self.send_header('Content-Length',str(len(payload)));self.end_headers();self.wfile.write(payload)
    print(f'Local-only app: http://127.0.0.1:{port}/  (Ctrl+C to stop)',flush=True)
    ThreadingHTTPServer(('127.0.0.1',port),Handler).serve_forever()


def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('action',choices=['freeze','final-test','serve','status'])
    p.add_argument('--root',type=Path,default=Path.home()/'Desktop'/'Scale detection')
    p.add_argument('--port',type=int,default=8765)
    args=p.parse_args()
    root=args.root.resolve(); output=root/'radif_release_v1'
    if args.action=='freeze':freeze(root,output)
    elif args.action=='final-test':final_test(root,output)
    elif args.action=='serve':serve(root,output,args.port)
    else:
        for name in ['frozen.json','FINAL_TEST_STARTED.lock','final_test_summary.json']:
            print(name, 'EXISTS' if (output/name).exists() else 'not present')

if __name__=='__main__':main()