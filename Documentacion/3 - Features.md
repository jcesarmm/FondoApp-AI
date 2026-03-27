# Feature: CRUD de Usuarios y Creación Automática de Cuenta
**Descripción:** Al registrar un nuevo usuario en el sistema, se debe asegurar la creación de su identidad y, en paralelo, la apertura de su cuenta de ahorro.

## 1. Reglas de Negocio
- **Validación:** El Email debe ser único. La contraseña debe tener mínimo 8 caracteres, una mayúscula y un número.
- **Seguridad:** Antes de persistir, la contraseña debe ser hasheada con `bcrypt`.
- **Roles:** Solo un `IsAdmin: true` puede crear o eliminar otros usuarios.
- **Evento:** Publicar `UserCreatedEvent` en el exchange `user.events`.

## 2. Implementación por Capas (DDD)
Para este CRUD, debes crear/modificar:

### Capa de Domain
- **Entity:** `User` con sus propiedades y método `validate()`.
- **Repository Interface:** `IUserRepository` con métodos `save`, `findById`, `findByEmail`, `findAll` y `delete`.

### Capa de Application
- **Use Cases:** - `CreateUserUseCase`: Valida si el email existe, hashea pass y guarda.
    - `GetAllUsersUseCase`: Retorna lista de usuarios (sin passwords).
    - `DeleteUserUseCase`: Elimina usuario por ID.

### Capa de Infrastructure
- **Persistence:** Implementación de `TypeORMUserRepository`.
- **Controller:** `UserController` con los endpoints:
    - `POST /api/users` (Admin only)
    - `GET /api/users` (Admin only)
    - `DELETE /api/users/:id` (Admin only)
- **Routes:** Registro de rutas en el router de Express.

### Backend: Microservicio Savings (Consumer)
- **Worker/Consumer:** Escuchar la cola `savings.user_creation.queue`.
- **Lógica:**
    1. Al recibir `UserCreatedEvent`, ejecutar caso de uso `CreateInitialAccount`.
    2. Crear registro en tabla `SavingsAccount` con `TotalBalance = 0`.
    3. Generar un `AccountNumber` único (autoincremental).

## 3. Implementación del Frontend (React)
- **Vista:** `UserManagementPage`.
- **Componentes:**
    - `UserTable`: Listado con columnas [Nombre, Email, Rol, Acciones].
    - `UserForm`: Formulario con validaciones (Email requerido, Password min 8 caracteres).
- Implementar Capa de servicio para la comunicacion con el backend.
- Agregar bearer token en todos los llamados al API.
- **Estado:** Usar `useEffect` para refrescar la lista tras crear un usuario.

# Feature: Pagina de inicio de sesión
**Descripción:** Al ingresar al sitio web, todos los usuarios deben estar autenticados para poder ejecutar cualquier acción. En caso de no estar autenticados, se debe retornar a esta pagina de inicio de sesion.

## 1. Reglas de Negocio
- **Validación:** El usuario debe existir en la base de datos, el email y la constraseña persistida deben coincidir.

## 2. Implementación por Capas (DDD)
Para este feature, debes recibir en el body y validarlos en el dominio.

### Capa de Domain
- **Entity:** `User` con sus propiedades y método `SignIn()`.
- **Repository Interface:** `IUserRepository` con método `SignIn`.

### Capa de Application
- **Use Cases:** 
    - `SignIn`: Obtiene los datos del usuario, espera la respuesta del dominio `SignIn()` y retorna un bearer token en caso que la validacion sea exitosa, incluir `IsAdmin` dentro de los claims del token.

### Capa de Infrastructure
- **Persistence:** Implementación de `TypeORMUserRepository`.
- **Controller:** `UserController` con los endpoints:
    - `POST /api/auth/signin`
- **Routes:** Registro de rutas en el router de Express.

## 3. Implementación del Frontend (React)
- **Vista:** `LoginPage`.
- **Componentes:**
    - `LoginForm`: Formulario con validaciones (Email requerido, Password).
- Implementar Capa de servicio para la comunicacion con el backend.