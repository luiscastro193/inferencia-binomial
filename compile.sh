#!/bin/bash
em++ beta.cpp -Ivendor -Oz -flto -fno-exceptions -fno-rtti -DNDEBUG -sENVIRONMENT=web -sEXPORT_ES6=1 -sSTRICT=1 --closure 1 -sEXPORTED_FUNCTIONS=_set_params,_quantile,_pdf -o beta.js
