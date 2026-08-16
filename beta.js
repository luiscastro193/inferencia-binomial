let safe=WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,5,1,96,0,1,123,3,2,1,0,10,15,1,13,0,65,1,253,15,65,2,253,15,253,128,2,11]));
let req=fetch(new URL(`beta${safe?"":"-safe"}.wasm`,import.meta.url));
async function Module(moduleArg={}){var Module=moduleArg;var b={},d,e,g={a:{k:()=>{throw"";},j:()=>{},i:(a,c)=>{b[a]&&(clearTimeout(b[a].id),delete b[a]);if(!c)return 0;var f=setTimeout(()=>{delete b[a];d(a,performance.now())},c);b[a]={id:f,u:c};return 0},g:Math.acos,f:Math.asin,e:Math.cos,c:Math.exp,a:Math.log,b:Math.pow,d:Math.sin,h:a=>{throw`exit(${a})`;}}};e=WebAssembly.instantiateStreaming(req,g).then(a=>{a=a.instance.exports;Module._set_params=a.m;Module._quantile=a.n;Module._pdfs_pointer=a.o;d=a.p;Module.wasmMemory=
a.l});await (e);;return Module}export default Module;
