/* Data Access Object (DAO) module for accessing locations, clues and games data.*/
import db from "./db.js";

export const DIFFICULTY_LEVELS = {
    easy: { numLocations: 6, pathLength: 3, totalTime: 60 },
    medium: { numLocations: 8, pathLength: 4, totalTime: 90 },
    hard: { numLocations: 12, pathLength: 6, totalTime: 120 },
};

// I luoghi nella mappa hanno posizioni di default, indipendentemente dalle città selezionate
export const MAP_POSITIONS = {
    easy: [
        { x: 70, y: 30 }, { x: 25, y: 55 }, { x: 65, y: 70 },
    ],
    medium: [
        { x: 45, y: 80 }, { x: 75, y: 50 }, { x: 25, y: 55 }, { x: 55, y: 35 },
    ],
    hard: [
        { x: 50, y: 27 }, { x: 75, y: 35 }, { x: 20, y: 55 },
        { x: 65, y: 60 }, { x: 30, y: 75 }, { x: 70, y: 85 },
    ],
};

export const MIN_TREASURE_COINS = 10;
export const MAX_TREASURE_COINS = 100;

// Estrazione di un intero casuale tra min e max, entrambi inclusi.
export const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Algoritmo Fisher-Yates per mescolare elementi di un array
export const shuffle = (array) => {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
        const j = randomInt(0, i);
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
};

export default function GameDao() {
    // Recupera tutte le possibili località dal database
    this.getAllLocations = () => {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM locations', [], (err, rows) => {
                if (err) reject(err); 
                else resolve(rows);
            });
        });
    };

    // Estrae randomicamente un indizio tra i 3 associati a ciascuna località 
    this.getRandomClueForLocation = (idLocation) => {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM clues WHERE idLocation = ? ORDER BY RANDOM() LIMIT 1';
            db.get(query, [idLocation], (err, row) => {
                if (err) reject(err); else resolve(row);
            });
        });
    };

    // Creazione di una nuova partita sulla base della difficoltà
    this.createGame = async (difficulty) => {
        const config = DIFFICULTY_LEVELS[difficulty];
        
        const shuffled = shuffle(await this.getAllLocations());
        // Primo slice: i primi numLocations sono i luoghi scelti per la mappa (6/8/12)
        const chosenLocations = shuffled.slice(0, config.numLocations);

        // Secondo slice: i primi pathLength dei luoghi scelti per la mappa rappresentano il percorso corretto (3/4/6)
        const positions = MAP_POSITIONS[difficulty];
        const pathLocations = chosenLocations.slice(0, config.pathLength).map((loc, i) => ({
            idLocation: loc.idLocation,
            name: loc.name,
            // Ad ogni luogo si associa la posizione x,y 
            x: positions[i].x,
            y: positions[i].y,
        }));

        const path = [];
        for (const loc of pathLocations) {
            const clue = await this.getRandomClueForLocation(loc.idLocation);
            path.push({ idLocation: loc.idLocation, name: loc.name, x: loc.x, y: loc.y, clueText: clue.text });
        }

        return {
            difficulty,
            totalTime: config.totalTime,
            pathLength: config.pathLength,
            treasureCoins: randomInt(MIN_TREASURE_COINS, MAX_TREASURE_COINS),
            startTime: Date.now(),
            locations: shuffle(chosenLocations).map(l => ({ idLocation: l.idLocation, name: l.name })),
            path,
            currentStep: 0,
            visited: [],
            status: 'playing',
            saved: false,
        };
    };

    // Salva solo l'esito finale di una partita (mai durante lo svolgimento)
    this.saveFinishedGame = (idUser, difficulty, status, treasureCoins, coinsWon, startTimeMs, totalTime, currentStep) => {
        return new Promise((resolve, reject) => {
            const query = `INSERT INTO games (idUser, difficulty, treasureCoins, startTime, totalTime, status, currentStep, coinsWon)
                           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
            const startTimeIso = new Date(startTimeMs).toISOString();
            db.run(query, [idUser, difficulty, treasureCoins, startTimeIso, totalTime, status, currentStep, coinsWon], function (err) {
                if (err) reject(err); 
                else resolve(this.lastID);
            });
        });
    };
}