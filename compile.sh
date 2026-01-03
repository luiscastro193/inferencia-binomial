#!/bin/bash
em++ beta.cpp -Ivendor -Oz -flto -fno-exceptions -fno-rtti -DNDEBUG -sENVIRONMENT=web -sEXPORT_ES6=1 -sSTRICT=1 --closure 1 -sINITIAL_MEMORY=131072 -sEXPORTED_RUNTIME_METHODS=wasmMemory -sEXPORTED_FUNCTIONS=_set_params,_quantile,_pdfs_pointer -o beta.js
