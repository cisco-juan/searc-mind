# Configuración de Branch Protection Rules

Esta guía explica cómo configurar las reglas de protección de rama en GitHub para forzar el flujo fork + pull request.

## 🔒 Configurar Branch Protection

### 1. Acceder a Settings
1. Ve a tu repositorio en GitHub
2. Clic en **Settings** (pestaña superior)
3. En el menú lateral: **Branches**

### 2. Crear Regla de Protección
1. Clic en **Add rule**
2. **Branch name pattern**: `main` (o `master`)
3. Configurar las siguientes opciones:

### 3. Configuraciones Recomendadas

#### ✅ **Require pull request reviews before merging**
- **Required number of reviewers**: `1` (mínimo)
- ☑️ **Dismiss stale pull request approvals when new commits are pushed**
- ☑️ **Require review from CODEOWNERS** (opcional)
- ☑️ **Restrict reviews to users with explicit read or higher access**

#### ✅ **Require status checks to pass before merging**
- ☑️ **Require branches to be up to date before merging**
- Agregar checks específicos:
  - `build`
  - `test`
  - `lint`
  - `typecheck`

#### ✅ **Require conversation resolution before merging**
- Fuerza resolver todos los comentarios antes del merge

#### ✅ **Require signed commits** (opcional)
- Para mayor seguridad

#### ✅ **Require linear history**
- Evita merge commits, fuerza rebase/squash

#### ✅ **Restrict pushes that create files that match a pattern**
- Patrón: `*.env` (evitar commits de archivos sensibles)

### 4. Configuraciones de Administración

#### ⚠️ **Restrictions**
- ☑️ **Restrict pushes that create files matching a pattern**
- ☑️ **Include administrators** (aplicar reglas a admins también)
- ❌ **Allow force pushes** (mantener deshabilitado)
- ❌ **Allow deletions** (mantener deshabilitado)

## 🛡️ Configuración Avanzada

### GitHub Actions para CI/CD

Crear `.github/workflows/ci.yml`:

```yaml
name: CI/CD

on:
  pull_request:
    branches: [ main ]
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run linting
        run: npm run lint
        
      - name: Run type checking
        run: npm run typecheck
        
      - name: Run tests
        run: npm test
        
      - name: Build projects
        run: npm run build
```

### CODEOWNERS File

Crear `.github/CODEOWNERS`:

```
# Global owners
* @owner-username

# Backend specific
apps/backend/ @backend-team

# Frontend specific  
apps/frontend/ @frontend-team

# Docker configurations
docker-compose.yml @devops-team
Dockerfile @devops-team

# Documentation
*.md @docs-team
```

## 🔧 Configuración del Repositorio

### 1. General Settings
- **Settings** → **General**
- ❌ **Allow merge commits** (opcional)
- ☑️ **Allow squash merging**
- ☑️ **Allow rebase merging**
- ☑️ **Automatically delete head branches**

### 2. Colaboradores
- **Settings** → **Manage access**
- Agregar colaboradores con permisos específicos:
  - **Read**: Solo lectura
  - **Write**: Puede crear PRs
  - **Maintain**: Puede mergear PRs
  - **Admin**: Control total

## 📋 Resultado Final

Con esta configuración:

✅ **Nadie puede hacer push directo a `main`**
✅ **Todas las contribuciones requieren PR**
✅ **PRs requieren al menos 1 revisión**
✅ **CI/CD debe pasar antes del merge**
✅ **Conversaciones deben resolverse**
✅ **Historial linear (opcional)**

## 🚨 Emergencias

### Bypass Temporal (Solo Admins)
Si necesitas bypass temporal:

1. **Settings** → **Branches**
2. Edit rule → **Allow specified actors to bypass required pull requests**
3. Agregar usuarios/teams específicos
4. **¡Revertir después de la emergencia!**

## ✅ Verificar Configuración

### Test del Flujo:
1. Crear branch de prueba
2. Intentar push directo → Debe fallar
3. Crear PR → Debe permitir
4. Mergear sin revisión → Debe fallar
5. Aprobar y mergear → Debe funcionar

---

**¡Tu repositorio ahora está protegido!** 🛡️

Solo se permiten contribuciones a través de forks y pull requests.