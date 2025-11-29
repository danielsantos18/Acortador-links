# 🔗 Acortador de URLs Serverless Distribuido

Este proyecto es un sistema completo y escalable para acortar URLs, gestionar redirecciones y visualizar estadísticas de uso. Está construido con una arquitectura **Serverless** en AWS, totalmente desacoplada y distribuida.

## 🚀 ¿Qué es este proyecto?

Es una solución que permite a los usuarios convertir enlaces largos en URLs cortas y amigables. Además, rastrea cada clic en tiempo real para ofrecer métricas de uso detalladas.

El sistema está dividido en **5 Módulos Independientes**, cada uno con su propia responsabilidad, infraestructura (Terraform) y ciclo de despliegue (CI/CD).

---

## 🏗️ Arquitectura del Sistema

El proyecto utiliza servicios modernos de AWS como Lambda, API Gateway, DynamoDB, S3 y CloudFront.

### 📦 Módulos Backend (Node.js + Lambda)

1.  **Módulo 1: Servicio de Acortamiento**
    *   **Función**: Recibe una URL larga, genera un código único (ej. `AbCdEf`) y lo guarda en la base de datos.
    *   **Endpoint**: `POST /shorten`

2.  **Módulo 2: Servicio de Redirección**
    *   **Función**: Recibe un código corto, busca la URL original, **incrementa el contador de visitas** y redirige al usuario (HTTP 302).
    *   **Endpoint**: `GET /{codigo}`

3.  **Módulo 3: Servicio de Estadísticas**
    *   **Función**: Consulta la base de datos para devolver cuántas veces se ha visitado un enlace y cuándo fue creado.
    *   **Endpoint**: `GET /stats/{codigo}`

### 🖥️ Módulos Frontend (React + Vite)

4.  **Módulo 4: Visualizador de Estadísticas**
    *   Interfaz para consultar las métricas de un enlace específico.
    *   Alojado en S3 y distribuido globalmente con CloudFront.

5.  **Módulo 5: Frontend Principal**
    *   Interfaz para crear nuevos enlaces cortos.
    *   Incluye una página intermedia de redirección con cuenta regresiva.
    *   Alojado en S3 y distribuido globalmente con CloudFront.

### 🗄️ Infraestructura Compartida
*   **DynamoDB**: Una única tabla NoSQL (`UrlShortenerTable`) que actúa como la fuente de verdad para todos los módulos, permitiendo la persistencia de datos a alta velocidad.

---

## 📖 Guía de Uso

### 1. Crear un Enlace Corto
1.  Abre el **Frontend Principal**.
2.  Pega tu URL larga (ej. `https://www.youtube.com/watch?v=...`).
3.  Haz clic en **"Shorten"**.
4.  ¡Listo! Copia tu nuevo enlace corto.

### 2. Usar el Enlace
1.  Pega el enlace corto en tu navegador.
2.  Verás una pantalla de **"Redirigiendo en 5 segundos..."**.
3.  Automáticamente serás llevado a tu destino original.

### 3. Ver Estadísticas
1.  Copia el código de 6 letras de tu enlace corto.
2.  Ve al **Frontend de Estadísticas**.
3.  Pega el código y busca.
4.  Verás el número total de visitas actualizándose en tiempo real.

---



## 👨‍💻 Tecnologías

*   **Cloud**: AWS (Lambda, API Gateway, DynamoDB, S3, CloudFront).
*   **IaC**: Terraform.
*   **Backend**: Node.js.
*   **Frontend**: React, Vite.


---
*Proyecto desarrollado como práctica de Arquitectura Serverless.*
