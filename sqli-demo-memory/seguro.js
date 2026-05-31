// ============================================
//  SERVIDOR SEGURO — Prepared Statements
//  node seguro.js
// ============================================
const express = require('express')
const initSqlJs = require('sql.js')

const app = express()
app.use(express.json())

initSqlJs().then(SQL => {

  // --- Banco SQLite em memória ---
  const db = new SQL.Database()
  db.run(`CREATE TABLE usuarios (id INTEGER, username TEXT, password TEXT, role TEXT)`)
  db.run(`INSERT INTO usuarios VALUES (1, 'admin', 'segredo123', 'admin')`)
  db.run(`INSERT INTO usuarios VALUES (2, 'joao',  'joao2024',   'user')`)
  db.run(`INSERT INTO usuarios VALUES (3, 'maria', 'maria@pass', 'user')`)

  function executarSeguro(sql, params) {
    const stmt = db.prepare(sql)
    stmt.bind(params)           // ← parâmetros separados do SQL
    const rows = []
    while (stmt.step()) rows.push(stmt.getAsObject())
    stmt.free()
    return rows
  }

  // ============================================
  //  POST /login  ← SEGURO
  // ============================================
  app.post('/login', (req, res) => {
    const { username, password } = req.body

    // ✅ Prepared Statement — $u e $p nunca viram SQL
    const sql = `SELECT * FROM usuarios WHERE username = $u AND password = $p`

    console.log('\n🟢 SQL (template):')
    console.log('  ', sql)
    console.log('   Parâmetros:', { $u: username, $p: password })

    const resultado = executarSeguro(sql, { $u: username, $p: password })

    if (resultado.length > 0) {
      res.json({
        ok: true,
        mensagem: `Logado como: ${resultado[0].username} [${resultado[0].role}]`
      })
    } else {
      res.status(401).json({ ok: false, mensagem: 'Usuário ou senha inválidos' })
    }
  })

  app.listen(3001, () => {
    console.log('🟢 Servidor SEGURO em http://localhost:3001\n')
  })
})
