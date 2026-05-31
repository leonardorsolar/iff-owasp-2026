// ============================================
//  SERVIDOR VULNERÁVEL — SQL Injection Demo
//  node vulneravel.js
// ============================================
const express  = require('express')
const Database = require('better-sqlite3')

const app = express()
app.use(express.json())

const db = new Database('usuarios.db')

// ============================================
//  POST /login  ← VULNERÁVEL
// ============================================
app.post('/login', (req, res) => {
  const { username, password } = req.body

  // ❌ NUNCA FAÇA ISSO — input colado direto no SQL
  const sql = `SELECT * FROM usuarios WHERE username = '${username}' AND password = '${password}'`

  console.log('\n🔴 SQL executado:')
  console.log('  ', sql)

  try {
    const resultado = db.prepare(sql).all()

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
