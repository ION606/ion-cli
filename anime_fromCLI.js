#!/usr/bin/env node

import animeMain from "./anime/getAndSave.js";


function fromCLI() {
    const argsRaw = [...process.argv].slice(2);
    console.log(argsRaw.join(" "));
    animeMain(argsRaw);
}

fromCLI();