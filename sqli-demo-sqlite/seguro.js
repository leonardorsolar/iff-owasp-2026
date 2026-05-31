// ============================================
//  SERVIDOR SEGURO — Prepared Statements
//  node seguro.js
// ============================================
const express  = require('express')
const Database = require('better-sqlite3')

const app = express()
app.use(express.json())

const db = new Database('usuarios.db')

// ============================================
//  POST /login  ← SEGURO
// ============================================
app.post('/login', (req, res) => {
  const { username, password } = req.body

  // ✅ Prepared Statement — ? nunca viram SQL
  const sql = `SELECT * FROM usuarios WHERE username = ? AND password = ?`

  console.log('\n🟢 SQL (template):')
  console.log('  ', sql)
  console.log('   Parâmetros:', [username, password])

  const resultado = db.prepare(sql).all(username, password)

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
