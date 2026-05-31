// ============================================
//  SERVIDOR VULNERÁVEL — SQL Injection Demo
//  node vulneravel.js
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

  function executar(sql) {
    const stmt = db.prepare(sql)
    const rows = []
    while (stmt.step()) rows.push(stmt.getAsObject())
    stmt.free()
    return rows
  }

  // ============================================
  //  POST /login  ← VULNERÁVEL
  // ============================================
  app.post('/login', (req, res) => {
    const { username, password } = req.body

    // ❌ NUNCA FAÇA ISSO — input colado direto no SQL (em uma linha!)
    const sql = `SELECT * FROM usuarios WHERE username = '${username}' AND password = '${password}'`

    console.log('\n🔴 SQL executado:')
    console.log('  ', sql)

    try {
      const resultado = executar(sql)

      if (resultado.length > 0) {
        res.json({
          ok: true,
          mensagem: `Logado como: ${resultado[0].username} [${resultado[0].role}]`,
          atencao: `${resultado.length} registro(s) retornado(s)!`,
          dados_vazados: resultado
        })
      } else {
        res.status(401).json({ ok: false, mensagem: 'Usuário ou senha inválidos' })
      }
    } catch (e) {
      res.status(500).json({ ok: false, erro: e.message })
    }
  })

  app.listen(3000, () => {
    console.log('🔴 Servidor VULNERÁVEL em http://localhost:3000\n')
  })
})
