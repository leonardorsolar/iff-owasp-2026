# 💉 SQL Injection — Demo Prática
### Node.js + Express + better-sqlite3

---

## 🚀 Setup

```bash
npm install
node criar-banco.js    # gera usuarios.db
```

Abra dois terminais:

```bash
# Terminal A
node vulneravel.js     # porta 3000

# Terminal B
node seguro.js         # porta 3001
```

---

## 🔴 Servidor VULNERÁVEL — porta 3000

### 1. Login normal ✅
```bash
curl -s -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"username":"joao","password":"joao2024"}'
```

### 2. Senha errada ❌
```bash
curl -s -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"username":"joao","password":"errada"}'
```

### 💥 3. ATAQUE — vaza o banco sem saber nenhuma senha
```bash
curl -s -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"username":"'\'' OR 1=1--","password":"x"}'
```

SQL gerado pelo ataque:
```sql
SELECT * FROM usuarios WHERE username = '' OR 1=1-- ' AND password = 'x'
--                                          ^^^^^^^^
--                              sempre true! o resto foi comentado
```

### 💥 4. ATAQUE — entra como admin sem saber a senha
```bash
curl -s -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin'\''--","password":"qualquer"}'
```

SQL gerado:
```sql
SELECT * FROM usuarios WHERE username = 'admin'-- ' AND password = 'qualquer'
--                                             ^^
--                              senha ignorada pelo comentário SQL!
```

---

## 🟢 Servidor SEGURO — porta 3001

### Login normal ✅
```bash
curl -s -X POST http://localhost:3001/login \
  -H "Content-Type: application/json" \
  -d '{"username":"joao","password":"joao2024"}'
```

### 🛡️ Mesmo ataque — bloqueado
```bash
curl -s -X POST http://localhost:3001/login \
  -H "Content-Type: application/json" \
  -d '{"username":"'\'' OR 1=1--","password":"x"}'
```

Resposta: `{ "ok": false, "mensagem": "Usuário ou senha inválidos" }`

---

## 🔑 A diferença

```js
// ❌ VULNERÁVEL — input vira SQL
const sql = `SELECT * FROM usuarios WHERE username = '${username}' AND password = '${password}'`
db.prepare(sql).all()

// ✅ SEGURO — input vira parâmetro
const sql = `SELECT * FROM usuarios WHERE username = ? AND password = ?`
db.prepare(sql).all(username, password)
```
