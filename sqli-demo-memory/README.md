# 💉 SQL Injection — Demo Prática
### Node.js + Express + SQLite | Node 20+

---

## 🚀 Setup

```bash
npm install
```

Abra **dois terminais**:

```bash
# Terminal 1 — servidor VULNERÁVEL (porta 3000)
npm run vulneravel

# Terminal 2 — servidor SEGURO (porta 3001)
npm run seguro
```

---

## 🔴 Testes no servidor VULNERÁVEL (porta 3000)

> A resposta com `"atencao"` só aparece aqui, no servidor vulnerável.
> Se você rodar o mesmo login no servidor seguro, o campo não vai existir.

### 1. Login normal ✅

Copie e cole este comando para ver exatamente a resposta mostrada abaixo:

```bash
curl -s -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"username":"joao","password":"joao2024"}'
```

**Resposta:**
```json
{
  "ok": true,
  "mensagem": "Logado como: joao [user]",
  "atencao": "1 registro(s) retornado(s)!"
}
```

**SQL gerado no servidor:**
```sql
SELECT * FROM usuarios WHERE username = 'joao' AND password = 'joao2024'
```

---

### 2. Senha errada ❌

```bash
curl -s -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"username":"joao","password":"errada"}'
```

**Resposta:**
```json
{ "ok": false, "mensagem": "Usuário ou senha inválidos" }
```

---

### 💥 3. ATAQUE — entrar sem saber a senha (vaza TODOS)

```bash
curl -s -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"username":"'\'' OR 1=1--","password":"x"}'
```

**Resposta — banco inteiro vazado:**
```json
{
  "ok": true,
  "mensagem": "Logado como: admin [admin]",
  "atencao": "3 registro(s) retornado(s)!",
  "dados_vazados": [
    { "id": 1, "username": "admin", "password": "segredo123", "role": "admin" },
    { "id": 2, "username": "joao",  "password": "joao2024",   "role": "user"  },
    { "id": 3, "username": "maria", "password": "maria@pass", "role": "user"  }
  ]
}
```

**SQL manipulado pelo atacante:**
```sql
SELECT * FROM usuarios WHERE username = '' OR 1=1-- ' AND password = 'x'
--                                          ^^^^^^^^  ^^^^^^^^^^^^^^^^^^^
--                                    sempre true!    foi comentado, ignorado
```

---

### 💥 4. ATAQUE — logar como admin sem saber a senha

```bash
curl -s -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin'\''--","password":"qualquer"}'
```

**Resposta:**
```json
{
  "ok": true,
  "mensagem": "Logado como: admin [admin]",
  "dados_vazados": [{ "username": "admin", "password": "segredo123", "role": "admin" }]
}
```

**SQL manipulado:**
```sql
SELECT * FROM usuarios WHERE username = 'admin'-- ' AND password = 'qualquer'
--                                             ^^
--                              tudo depois foi comentado — senha ignorada!
```

---

## 🟢 Testes no servidor SEGURO (porta 3001)

### Login normal ✅

```bash
curl -s -X POST http://localhost:3001/login \
  -H "Content-Type: application/json" \
  -d '{"username":"joao","password":"joao2024"}'
```

**Resposta:**
```json
{ "ok": true, "mensagem": "Logado como: joao [user]" }
```

---

### 🛡️ Mesmo ataque — completamente bloqueado

```bash
curl -s -X POST http://localhost:3001/login \
  -H "Content-Type: application/json" \
  -d '{"username":"'\'' OR 1=1--","password":"x"}'
```

**Resposta:**
```json
{ "ok": false, "mensagem": "Usuário ou senha inválidos" }
```

**Por quê funciona?** O payload `' OR 1=1--` é tratado como texto puro:
```
Banco procura um usuário com username LITERALMENTE igual a: ' OR 1=1--
Nenhum usuário tem esse nome → retorna vazio → login negado ✅
```

---

## 🔑 A diferença no código

```js
// ❌ VULNERÁVEL — input vira SQL executável
const sql = `SELECT * FROM usuarios WHERE username = '${username}' AND password = '${password}'`
executar(sql)

// ✅ SEGURO — input vira parâmetro (nunca executado como SQL)
const sql = `SELECT * FROM usuarios WHERE username = $u AND password = $p`
executarSeguro(sql, { $u: username, $p: password })
```

---

## 📊 Resumo

| Payload               | Vulnerável 🔴     | Seguro 🟢     |
|-----------------------|-------------------|---------------|
| Login correto         | ✅ Entra           | ✅ Entra       |
| Senha errada          | ❌ Bloqueado       | ❌ Bloqueado   |
| `' OR 1=1--`          | 💥 3 usuários vazam| ❌ Bloqueado   |
| `admin'--`            | 💥 Admin sem senha | ❌ Bloqueado   |
