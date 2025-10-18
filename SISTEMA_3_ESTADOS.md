# Sistema de 3 Estados de Autorización

## 📋 Resumen de Cambios

Se ha implementado exitosamente un sistema de autorización con 3 estados que reemplaza el sistema binario anterior (autorizado/no autorizado).

## 🔄 Estados de Autorización

### 1. `pending` (Pendiente)
- Usuario registrado pero sin autorizar
- Estado inicial para nuevos usuarios
- No tiene acceso al sistema QR

### 2. `authorized` (Autorizado)
- Usuario autorizado para acceso
- Puede generar y usar códigos QR
- Registra quién y cuándo lo autorizó

### 3. `unauthorized` (Desautorizado)
- Usuario desautorizado con motivo registrado
- No tiene acceso al sistema QR
- Mantiene historial de desautorización

## 🗃️ Nuevos Campos en Base de Datos

### Tabla `users` - Campos Agregados:
```sql
authorization_status VARCHAR DEFAULT 'pending'  -- Estado actual
authorization_info TEXT                         -- Razón/información adicional
unauthorized_at DATETIME                        -- Fecha de desautorización
unauthorized_by_id INTEGER                      -- ID del admin que desautorizó
```

### Campos Existentes Mantenidos:
```sql
is_authorized BOOLEAN                           -- Compatibilidad (autorizado = True)
authorized_at DATETIME                          -- Fecha de autorización
authorized_by_id INTEGER                        -- ID del admin que autorizó
```

## 🔄 Migración Ejecutada

La migración se ejecutó exitosamente:
- ✅ Nuevas columnas agregadas a la tabla `users`
- ✅ Usuarios existentes actualizados:
  - `is_authorized = 1` → `authorization_status = 'authorized'`
  - `is_authorized = 0` → `authorization_status = 'pending'`

## 📡 Endpoints Actualizados

### 1. `/admin/users/authorize/{user_id}` (POST)
- Cambia estado a `authorized`
- Registra fecha y admin autorizador
- Actualiza `is_authorized = True`

### 2. `/admin/users/unauthorize/{user_id}` (POST)
```json
{
  "reason": "Motivo de la desautorización"
}
```
- Cambia estado a `unauthorized`
- Registra fecha, admin y motivo
- Actualiza `is_authorized = False`

### 3. `/admin/users/reauthorize/{user_id}` (POST)
```json
{
  "reason": "Motivo de la reautorización"
}
```
- Cambia estado a `authorized`
- Limpia información de desautorización
- Registra nueva autorización

### 4. `/admin/users/search` (GET)
Respuesta actualizada con nuevos campos:
```json
{
  "id": 1,
  "email": "user@example.com",
  "authorization_status": "authorized",
  "authorization_info": "Empleado verificado",
  "unauthorized_at": null,
  "unauthorized_by_id": null,
  "unauthorized_by_name": null,
  "authorized_by_name": "Admin Usuario"
}
```

### 5. **NUEVO** `/auth/status` (GET)
**Descripción**: Verifica el estado de autorización del usuario actual
```json
{
  "user_id": 1,
  "email": "usuario@example.com",
  "authorization_status": "authorized",
  "can_login": true,
  "can_access_qr": true,
  "message": "Tu cuenta está autorizada. Tienes acceso completo al sistema."
}
```

### 6. **MODIFICADO** `/auth/login` (POST)
- ✅ `pending`: **NO** puede iniciar sesión
- ✅ `authorized`: **SÍ** puede iniciar sesión con acceso completo
- ✅ `unauthorized`: **SÍ** puede iniciar sesión pero con restricciones
- ✅ `admin`: Siempre puede iniciar sesión

### 7. **MODIFICADO** `/qr/current` y `/qr/scan` (GET/POST)
- ✅ Solo usuarios con estado `authorized` pueden acceder
- ❌ Usuarios `pending` y `unauthorized` son bloqueados
- 🔒 Mensajes específicos según el estado del usuario

## 🔐 Validaciones de Seguridad

### Nueva Lógica de Acceso por Estados:

#### Inicio de Sesión (`/auth/login`):
- ✅ **`authorized`**: Login permitido, acceso completo
- ✅ **`unauthorized`**: Login permitido, acceso limitado  
- ❌ **`pending`**: Login bloqueado
- ✅ **`admin`**: Siempre permitido

#### Acceso a QR (`/qr/current`, `/qr/scan`):
- ✅ **`authorized`**: Acceso completo a funcionalidades QR
- ❌ **`unauthorized`**: Bloqueado con mensaje específico
- ❌ **`pending`**: Bloqueado con mensaje de autorización pendiente

```python
# Validación en endpoints QR
if user.authorization_status != "authorized":
    status_message = {
        "pending": "Tu cuenta está pendiente de autorización",
        "unauthorized": f"Tu acceso ha sido desautorizado. {user.authorization_info or 'Contacta al administrador.'}"
    }.get(user.authorization_status, "Estado de autorización inválido")
    
    raise HTTPException(status_code=403, detail=status_message)
```

### Validación de Estados:
- ✅ Solo admins pueden cambiar estados
- ✅ No se puede autorizar usuario ya autorizado
- ✅ No se puede desautorizar usuario no autorizado
- ✅ Información obligatoria para desautorización
- ✅ Usuarios desautorizados pueden iniciar sesión pero no usar QR

## 🎯 Beneficios del Sistema

1. **Trazabilidad Completa**: Historial detallado de cambios de estado
2. **Información Contextual**: Razones específicas para cada cambio
3. **Mejor UX**: Mensajes de error más informativos
4. **Auditoría**: Quién y cuándo realizó cada cambio
5. **Flexibilidad**: Fácil extensión para más estados en el futuro

## 📋 Próximos Pasos

1. **Instalar Dependencias**: `pip install -r requirements.txt`
2. **Verificar Migración**: Comprobar que las nuevas columnas existen
3. **Probar Endpoints**: Validar funcionamiento de los 3 estados
4. **Probar Nuevo Endpoint**: Verificar `/auth/status`
5. **Probar Restricciones QR**: Confirmar que usuarios desautorizados no pueden acceder
6. **Actualizar Frontend**: Usar nuevos campos de estado e información

## 📚 Documentación Adicional

- **[Control de Acceso por Estados](./CONTROL_ACCESO_ESTADOS.md)**: Documentación detallada sobre la lógica de acceso
- **[Verificación del Sistema](./verify_3_states.py)**: Script para verificar que todo funciona correctamente


```

## 🐛 Errores Resueltos

### Error de Validación en `/profile`
**Problema**: `pydantic_core._pydantic_core.ValidationError: 2 validation errors for UserResponse`
- `authorization_status` Field required
- `authorization_info` Field required

**Solución**: 
1. ✅ Actualizado esquema `UserResponse` para hacer `authorization_info` opcional
2. ✅ Actualizado endpoint `/profile` para incluir todos los nuevos campos:
   - `authorization_status`
   - `authorization_info` 
   - `unauthorized_at`

**Código corregido**:
```python
# En schemas.py
authorization_info: Optional[str] = None  # Ahora es opcional

# En main.py - endpoint /profile
return UserResponse(
    # ... campos existentes ...
    authorization_status=current_user.authorization_status,
    authorization_info=current_user.authorization_info,
    unauthorized_at=current_user.unauthorized_at
)
```