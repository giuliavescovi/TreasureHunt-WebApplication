/* Data Access Object (DAO) module for accessing users data */

import db from "./db.js";
import crypto from "crypto";

// NOTE: all functions return error messages as json object { error: <string> }
export default function UserDao() {

    // Retrives one user given its id.
    this.getUserById = (idUser) => {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM users WHERE idUser = ?';
            db.get(query, [idUser], (err, row) => {
                if (err) {
                    reject(err);
                }
                if (row == undefined) {
                    resolve({ error: 'User not found.' });
                } else {
                    resolve(row);
                }
            });
        });
    };

    this.getUserByCredentials = (username, password) => {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM users WHERE username = ?';
            db.get(query, [username], (err, row) => {
                if (err) {
                    reject(err);
                } else if (row === undefined) {
                    resolve(false);
                } else {
                    const user = { idUser: row.idUser, username: row.username, name: row.name};

                    // Check the hashes with an async call
                    crypto.scrypt(password, row.salt, 32, function(err, hashedPassword) {
                        if (err) reject(err);
                        if (!crypto.timingSafeEqual(Buffer.from(row.hash, 'hex'), hashedPassword)) {
                            resolve(false);
                        } else {
                            resolve(user);
                        }
                    });
                }
            });
        });
    };

    // Recupera tutte le monete vinte da ciascun utente che ha giocato almeno una partita
    this.getLeaderBoard = () => {
        return new Promise((resolve, reject) => {
            const query = `SELECT users.name AS name, SUM(games.coinsWon) AS totalCoins 
                            FROM users JOIN games ON users.idUser = games.idUser
                            GROUP BY users.idUser
                            ORDER BY totalCoins DESC`;
            db.all(query, [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }
}