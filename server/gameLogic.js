// Luoghi ancora proponibili come risposta 
export const buildOptions = (game) => {
    // Estrae le tappe del percorso già superate tra tutti i luoghi scelti per la mappa
    const alreadyVisitedIds = new Set(game.path.slice(0, game.currentStep).map(l => l.idLocation));
    return game.locations.filter(l => !alreadyVisitedIds.has(l.idLocation));
};

export const buildGameStateResponse = (game) => {
    // Costruzione della partita con le informazioni che il client può ricevere
    const base = {
        difficulty: game.difficulty,
        treasureCoins: game.treasureCoins,
        totalTime: game.totalTime,
        pathLength: game.pathLength,   
        status: game.status,
        visited: game.visited,
    };

    if (game.status === 'playing') {
        const current = game.path[game.currentStep];
        return { ...base, clue: { text: current.clueText, options: buildOptions(game) } };
    }

    // Quando la partita è terminata viene fornito l'intero percorso
    return {
        ...base,
        coinsWon: game.coinsWon,
        path: game.path.map((l, i) => ({ idLocation: l.idLocation, name: l.name, x: l.x, y: l.y, pathOrder: i })),
    };
};

// Per verificare se il tempo di gioco è terminato
export const finalizeIfExpired = (game) => {
    if (game.status !== 'playing') 
        return game;
    
    const elapsedSeconds = (Date.now() - game.startTime) / 1000;
    
    if (elapsedSeconds < game.totalTime) 
        return game;
   
    game.status = 'lost';
    game.coinsWon = 0;
    
    return game;
};

export const applyAnswer = (game, idLocation) => {
    const expected = game.path[game.currentStep];

    // Risposta sbagliata
    if (Number(idLocation) !== expected.idLocation) {
        game.status = 'lost';
        game.coinsWon = 0;
        return game;
    }

    game.visited.push({ idLocation: expected.idLocation, name: expected.name, x: expected.x, y: expected.y, pathOrder: game.currentStep });
    game.currentStep++;
    
    if (game.currentStep === game.pathLength) {
        game.status = 'won';
        game.coinsWon = game.treasureCoins;
    }
    
    return game;
};