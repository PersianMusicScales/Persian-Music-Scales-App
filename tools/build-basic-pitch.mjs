// Local build step. No model is fetched when a visitor opens the website.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {build} from 'esbuild';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const upstream=path.join(root,'node_modules','@spotify','basic-pitch');
const asset=path.join(root,'assets','models','basic-pitch');
if(!fs.existsSync(path.join(upstream,'model','model.json'))){
  throw new Error('Spotify model missing. Install dependencies first: npm install');
}
fs.mkdirSync(asset,{recursive:true});
// Copy model.json and its binary weight shards unmodified; GraphModel expects
// relative paths found in its weightsManifest.
fs.cpSync(path.join(upstream,'model'),asset,{recursive:true,force:true});
const license=path.join(upstream,'LICENSE');
if(fs.existsSync(license)){
  fs.mkdirSync(path.join(root,'assets','third-party'),{recursive:true});
  fs.copyFileSync(license,path.join(root,'assets','third-party','spotify-basic-pitch-LICENSE.txt'));
}
await build({
  entryPoints:[path.join(root,'src','basic-pitch-experiment','entry.js')],
  outfile:path.join(root,'src','basic-pitch-experiment','neural-microtone.bundle.js'),
  bundle:true, format:'iife',platform:'browser',target:['chrome100','edge100','firefox100','safari15'],
  minify:true,legalComments:'eof',logLevel:'info',
});
console.log('Model and neural bundle prepared locally. No audio has been uploaded or analyzed.');
