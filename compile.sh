#!/bin/bash
COMMON=(
	beta.cpp -Ivendor
	-Oz -flto -fno-exceptions -fno-rtti -DNDEBUG
	-mtail-call -msimd128 -mavx2
	-sENVIRONMENT=web -sEXPORT_ES6=1 --no-entry
	-sSTRICT=1 -sJS_MATH=1 -sEVAL_CTORS=2
	--closure 1 -sEXPORT_KEEPALIVE=1
	-sMINIMAL_RUNTIME=1 -sMINIMAL_RUNTIME_STREAMING_WASM_INSTANTIATION=1
	-sINITIAL_HEAP=0 -sMALLOC=none
	-sEXPORTED_RUNTIME_METHODS=wasmMemory
)

em++ "${COMMON[@]}" -mrelaxed-simd -o beta.js
em++ "${COMMON[@]}" -o beta-safe.js

rm beta-safe.js
perl -0777 -pi -e '
	my $arg;
	s|"beta.wasm"|`beta\${safe?"":"-safe"}.wasm`|g;
	s|fetch\((new URL\([^)]+\))\)|$arg = $1; "req"|e;
	my $safe_eval = "let safe=WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,5,1,96,0,1,123,3,2,1,0,10,15,1,13,0,65,1,253,15,65,2,253,15,253,128,2,11]));";
	$_ = qq{$safe_eval\nlet req=fetch($arg);\n$_};
' beta.js
