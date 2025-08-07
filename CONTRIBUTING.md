# Contributing to SearchMind

¡Gracias por tu interés en contribuir a SearchMind! Este documento establece las pautas y reglas para contribuir al proyecto.

## 🔒 Reglas de Contribución

### ⚠️ **OBLIGATORIO: Fork + Pull Request**

**NO se aceptan contribuciones directas al repositorio principal.** Todas las contribuciones deben seguir el siguiente flujo:

1. **Fork** del repositorio
2. Crear **Pull Request** desde tu fork
3. Revisión y aprobación del código
4. Merge al repositorio principal

### 🚫 Lo que NO está permitido:
- ❌ Push directo a `main` o `master`
- ❌ Commits directos al repositorio principal
- ❌ Bypass de revisiones de código
- ❌ Force push a ramas protegidas

## 📋 Proceso de Contribución

### 1. Fork del Proyecto
```bash
# Clic en "Fork" en GitHub o usa GitHub CLI
gh repo fork owner/search-mind --clone
```

### 2. Configurar el Repositorio Local
```bash
# Clonar tu fork
git clone https://github.com/TU-USUARIO/search-mind.git
cd search-mind

# Agregar el repositorio original como upstream
git remote add upstream https://github.com/OWNER/search-mind.git

# Verificar remotos
git remote -v
```

### 3. Crear Rama de Trabajo
```bash
# Crear y cambiar a nueva rama
git checkout -b feature/nueva-funcionalidad

# O para bug fixes
git checkout -b fix/corregir-problema
```

### 4. Realizar Cambios
```bash
# Hacer tus cambios
# Ejecutar tests
npm test

# Verificar linting
npm run lint

# Verificar tipos
npm run typecheck
```

### 5. Commit y Push
```bash
# Commit con mensaje descriptivo
git add .
git commit -m "feat: agregar nueva funcionalidad de chat"

# Push a tu fork
git push origin feature/nueva-funcionalidad
```

### 6. Crear Pull Request
1. Ve a tu fork en GitHub
2. Clic en "Compare & pull request"
3. Completa la plantilla del PR
4. Espera revisión y aprobación

## 📝 Estándares de Código

### Commits
Usamos [Conventional Commits](https://conventionalcommits.org/):
```
feat: nueva funcionalidad
fix: corrección de bug
docs: actualización de documentación
style: cambios de formato
refactor: refactorización de código
test: agregar o modificar tests
chore: tareas de mantenimiento
```

### Código
- **TypeScript**: Todo el código debe estar tipado
- **ESLint**: Seguir las reglas configuradas
- **Prettier**: Formateo automático
- **Tests**: Incluir tests para nuevas funcionalidades

## 🔍 Revisión de Código

### Requisitos para Merge:
- ✅ **Al menos 1 revisión aprobada**
- ✅ **Todos los checks de CI pasan**
- ✅ **No hay conflictos**
- ✅ **Tests incluidos**
- ✅ **Documentación actualizada**

### Proceso de Revisión:
1. **Revisión automática**: CI/CD checks
2. **Revisión manual**: Maintainers revisan código
3. **Feedback**: Cambios solicitados si es necesario
4. **Aprobación**: Merge al repositorio principal

## 🏷️ Tipos de Contribución

### 🐛 **Bug Reports**
- Usar plantilla de issue
- Incluir pasos para reproducir
- Especificar entorno y versión
- Screenshots si aplica

### ✨ **Feature Requests**
- Describir la funcionalidad propuesta
- Justificar la necesidad
- Considerar impacto en usuarios existentes
- Discutir en issue antes de implementar

### 📚 **Documentación**
- README actualizaciones
- Comentarios de código
- API documentation
- Ejemplos de uso

### 🧪 **Tests**
- Unit tests
- Integration tests
- E2E tests
- Performance tests

## 🚀 Configuración de Desarrollo

```bash
# Instalar dependencias
npm install

# Configurar entorno
cp apps/backend/.env.template apps/backend/.env

# Ejecutar en modo desarrollo
npx nx serve backend
npx nx dev frontend

# Ejecutar tests
npx nx test backend
npx nx e2e backend-e2e

# Linting y formateo
npx nx lint backend frontend
npx nx format
```

## ❓ Ayuda y Soporte

### 📞 Contacto:
- **Issues**: Para bugs y feature requests
- **Discussions**: Para preguntas generales
- **Discord/Slack**: Para chat en tiempo real (si aplica)

### 📖 Recursos:
- [README](./README.md)
- [Arquitectura](./docs/architecture.md)
- [API Documentation](./docs/api.md)

## 🎯 Buenas Prácticas

### ✅ **DO:**
- Hacer fork del proyecto
- Crear ramas descriptivas
- Escribir commits claros
- Incluir tests
- Actualizar documentación
- Seguir estándares de código
- Ser respetuoso en reviews

### ❌ **DON'T:**
- Push directo a main
- Commits sin descripción
- Cambios sin tests
- Ignorar feedback de revisión
- Mezclar múltiples features en un PR
- Modificar archivos no relacionados

## 📜 Código de Conducta

Este proyecto adhiere al [Contributor Covenant](https://www.contributor-covenant.org/). Se espera que todos los participantes sigan estas pautas de comportamiento.

---

**¡Gracias por contribuir a SearchMind!** 🙏

Tu colaboración ayuda a hacer este proyecto mejor para toda la comunidad.