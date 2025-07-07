const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config();

class Database {
    constructor() {
        this.dbType = process.env.DB_TYPE || 'sqlite';
        this.connection = null;
        this.init();
    }

    init() {
        if (this.dbType === 'sqlite') {
            const dbPath = process.env.SQLITE_DB_PATH || path.join(__dirname, '../database/registry.db');
            console.log('Attempting to connect to SQLite database at:', dbPath);
            
            // Ensure directory exists
            const dbDir = path.dirname(dbPath);
            const fs = require('fs');
            if (!fs.existsSync(dbDir)) {
                fs.mkdirSync(dbDir, { recursive: true });
            }
            
            this.connection = new sqlite3.Database(dbPath, (err) => {
                if (err) {
                    console.error('SQLite connection error:', err.message);
                } else {
                    console.log('Connected to SQLite database at:', dbPath);
                }
            });
        } else if (this.dbType === 'postgres') {
            this.connection = new Pool({
                host: process.env.POSTGRES_HOST,
                port: process.env.POSTGRES_PORT,
                database: process.env.POSTGRES_DB,
                user: process.env.POSTGRES_USER,
                password: process.env.POSTGRES_PASSWORD,
            });
            console.log('Connected to PostgreSQL database');
        }
    }

    // Generic query method that works with both SQLite and PostgreSQL
    async query(sql, params = []) {
        return new Promise((resolve, reject) => {
            if (this.dbType === 'sqlite') {
                this.connection.all(sql, params, (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                });
            } else if (this.dbType === 'postgres') {
                this.connection.query(sql, params)
                    .then(result => resolve(result.rows))
                    .catch(err => reject(err));
            }
        });
    }

    // Insert method with return of inserted ID
    async insert(sql, params = []) {
        return new Promise((resolve, reject) => {
            if (this.dbType === 'sqlite') {
                this.connection.run(sql, params, function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({ id: this.lastID, changes: this.changes });
                    }
                });
            } else if (this.dbType === 'postgres') {
                // For PostgreSQL, we need to add RETURNING id to get the inserted ID
                const pgSql = sql.includes('RETURNING') ? sql : sql + ' RETURNING id';
                this.connection.query(pgSql, params)
                    .then(result => resolve({ id: result.rows[0]?.id, changes: result.rowCount }))
                    .catch(err => reject(err));
            }
        });
    }

    // Update/Delete method
    async run(sql, params = []) {
        return new Promise((resolve, reject) => {
            if (this.dbType === 'sqlite') {
                this.connection.run(sql, params, function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({ changes: this.changes });
                    }
                });
            } else if (this.dbType === 'postgres') {
                this.connection.query(sql, params)
                    .then(result => resolve({ changes: result.rowCount }))
                    .catch(err => reject(err));
            }
        });
    }

    close() {
        if (this.connection) {
            if (this.dbType === 'sqlite') {
                this.connection.close();
            } else if (this.dbType === 'postgres') {
                this.connection.end();
            }
        }
    }
}

module.exports = new Database();
