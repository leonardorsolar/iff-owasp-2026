// node criar-banco.js
const Database = require('better-sqlite3')
const db = new Database('usuarios.db')

db.exec(`
  CREATE TABLE IF NOT EXISTS usuarios (
    id       INTEGER PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role     TEXT NOT NULL
  )
`)

const insert = db.prepare('INSERT OR IGNORE INTO usuarios VALUES (?, ?, ?, ?)')
insert.run(1, 'admin', 'segredo123', 'admin')
insert.run(2, 'joao',  'joao2024',   'user')
insert.run(3, 'maria', 'maria@pass', 'user')

console.log('✅ Banco criado: usuarios.db')
console.table(db.prepare('SELECT * FROM usuarios').all())
db.close()
