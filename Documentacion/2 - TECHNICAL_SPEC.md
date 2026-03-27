# TECHNICAL SPECIFICATIONS: Fondo de Ahorro Familiar

## 1. Modelo de Datos (Esquema SQL Server)

### Users
- `Id`: UNIQUEIDENTIFIER (PK)
- `Nombre`, `Apellido`: NVARCHAR(100)
- `Email`: NVARCHAR(255) (Unique)
- `Password`: NVARCHAR(MAX) (Hashed)
- `IsAdmin`: BIT (Default 0)

### SavingsAccount
- `Id`: UNIQUEIDENTIFIER (PK)
- `UserId`: FK -> Users
- `AccountNumber`: INT (IDENTITY)
- `TotalBalance`: DECIMAL(18, 2)

### SavingsAccountTransactions
- `Id`: UNIQUEIDENTIFIER (PK)
- `AccountId`: FK -> SavingsAccount
- `Type`: ENUM ('DEPOSIT', 'INTEREST_DISTRIBUTION', 'WITHDRAW')
- `Amount`: DECIMAL(18, 2)
- `Date`: DATETIMEOFFSET

### CreditAccount
- `Id`: UNIQUEIDENTIFIER (PK)
- `UserId`: FK -> Users
- `CreditNumber`: INT (IDENTITY)
- `TotalDebt`: DECIMAL(18, 2)
- `CurrentDebt`: DECIMAL(18, 2)
- `InterestRate`: DECIMAL(5, 2)
- `CreatedAt`: DATETIMEOFFSET

## 2. Lógica de Distribución de Intereses (Algoritmo)

El proceso debe ser ejecutado por un Admin y realizarse bajo una **Transacción SQL**:

1. **Cálculo de Base:** Obtener la suma de todos los `TotalBalance` de la tabla `SavingsAccount`.
   - $S_{total} = \sum Saldo_i$
2. **Cálculo de Participación:** Para cada cuenta $i$, determinar su porcentaje de participación.
   - $P_i = rac{Saldo_i}{S_{total}}$
3. **Asignación:** Aplicar el monto a distribuir ($M$) según la participación.
   - $Credito\_Interes_i = M \times P_i$
4. **Registro:** Insertar la transacción en `SavingsAccountTransactions` y actualizar `TotalBalance`.

## 3. Docker Configuration
- El `Dockerfile` debe usar una imagen `node:20-slim`.
- El `docker-compose.yml` debe mapear el puerto 1433 para SQL Server, el 3000 para la API y el 5173 para el frontend.

## 4. Infraestructura de Mensajería (RabbitMQ)

### Configuración Docker
- **Imagen:** `rabbitmq:3-management` (incluye la interfaz web en el puerto 15672).
- **Hostname:** `rabbitmq-broker`.
- **Variables de Entorno:** `fondoApp`, `Asusk61lc!`.

### Definición de Eventos y Colas
| Evento | Origen (Publisher) | Destino (Subscriber) | Acción |
| :--- | :--- | :--- | :--- |
| `InterestDistributed` | Lending/Admin Service | Savings Service | Crear transacciones de tipo 'INTEREST' en todas las cuentas afectadas. |
| `PaymentReceived` | Lending Service | Savings Service | Si el pago se hizo desde la cuenta de ahorro, descontar el saldo automáticamente. |

### Contrato del Evento `InterestDistributed` (JSON)
{
  "eventId": "uuid",
  "occurredOn": "ISO-8601",
  "distributionList": [
    { "accountId": "uuid", "amount": 150.50 },
    { "accountId": "uuid", "amount": 75.25 }
  ]
}

## Flujo de Eventos: Registro de Usuario
Cuando un nuevo usuario es creado en el sistema, debe dispararse la creación automática de su cuenta de ahorro inicial.

- **Evento:** `UserCreated`
- **Exchange:** `user.events` (Topic)
- **Routing Key:** `user.created`
- **Payload (JSON):**
  {
    "userId": "uuid-del-usuario",
    "email": "correo@ejemplo.com",
    "nombre": "Juan",
    "apellido": "Perez"
  }

### Comportamiento esperado:
1. **Servicio Auth/Users:** Crea el usuario en SQL Server. Si tiene éxito, publica el evento `UserCreated` en RabbitMQ.
2. **Servicio Savings:** Tiene un suscriptor (Consumer) escuchando la cola `savings.user_created.queue`. Al recibir el mensaje, ejecuta el caso de uso `CreateSavingsAccount` con `TotalBalance: 0`.