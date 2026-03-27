# INSTRUCTIONS: AI Agent Blueprint
# Actúa como Arquitecto Senior Fullstack & Experto en DDD

Este documento contiene las reglas maestras para la construcción del Sistema de Fondo de Ahorro Familiar.

## 1. Directrices de Arquitectura
- **Patrón:** Domain-Driven Design (DDD) + Clean Architecture.
- **Capas:** - `Domain`: Entidades, Value Objects y reglas de negocio puras.
    - `Application`: Casos de uso (servicios) que orquestan el flujo.
    - `Infrastructure`: Adaptadores (Express, TypeORM/Prisma, Middlewares).
- **Inyección de Dependencias:** Obligatorio para desacoplar capas.

## 1.1. Arquitectura Orientada a Eventos (EDA)
- **Message Broker:** Usa RabbitMQ para la comunicación asíncrona entre microservicios.
- **Patrón Pub/Sub:** Los servicios deben publicar eventos cuando ocurran cambios de estado (ej. `InterestDistributedEvent`).
- **Resiliencia:** Implementa reintentos (retries) y manejo de colas de error (Dead Letter Exchanges) para asegurar que ningún movimiento financiero se pierda.
- **Capa de Mensajería:** En `Infrastructure`, crea una carpeta `messaging/` con productores y consumidores de eventos.

## 2. Requerimientos Técnicos (Stack)
- **Backend:** Node.js + TypeScript + Express.
- **Frontend:** React (Vite) + Tailwind CSS.
- **DB:** SQL Server 2022 (Dockerizado).
- **Contenerización:** Docker Compose para orquestar API, DB, RabbitMQ y frontend app.

## 3. Seguridad y Roles (RBAC)
- **Middleware Global de Auth:** Validar JWT en cada petición.
- **Regla de Solo Lectura:** - IF `User.IsAdmin == false` -> Solo se permiten métodos `GET`.
    - IF `User.IsAdmin == true` -> Permiso total (CRUD).
- **Privacidad:** Los usuarios normales solo pueden consultar sus propios registros (`UserId` match).