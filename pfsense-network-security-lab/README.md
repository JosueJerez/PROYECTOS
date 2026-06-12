# 🛡️ pfSense Network Security & Routing Lab

Este proyecto consiste en el diseño, implementación y evaluación de una infraestructura de red segura utilizando **pfSense** como firewall perimetral y core de enrutamiento dentro de un entorno simulado en **GNS3**.

## 🚀 Descripción del Proyecto
El objetivo principal fue fortalecer la seguridad y administración de una red académica mediante la implementación de soluciones de código abierto. Se simularon escenarios reales de tráfico para evaluar la capacidad de respuesta del firewall ante amenazas y la eficiencia en la gestión de recursos de red.

---


**Componentes del Lab:**
- **Firewall/Router:** pfSense 2.x
- **Simulador:** GNS3
- **Endpoints:** Clientes Windows/Linux para pruebas de conectividad y seguridad.
- **Redes:** Segmentación por VLANs (Administrativa, Estudiantil, Guest).

---

## 🛠️ Características Implementadas
- **Reglas de Seguridad (L3/L4):** Configuración de filtrado de tráfico entrante y saliente basado en políticas de privilegios mínimos.
- **VPN (Virtual Private Network):** Implementación de acceso remoto seguro para usuarios externos.
- **Gestión de Ancho de Banda (QoS):** Priorización de servicios críticos y limitación de tráfico no esencial.
- **Prevención de Intrusiones:** Configuración de módulos para la detección de anomalías y amenazas.
- **Servicios de Red:** DHCP Server, DNS Resolver y NAT.

---

## 📊 Resultados y Análisis
Durante la fase de pruebas, se realizaron las siguientes evaluaciones:
1. **Pruebas de Rendimiento:** Análisis de latencia y throughput bajo carga de tráfico.
2. **Detección de Amenazas:** Verificación de bloqueos ante intentos de acceso no autorizados.
3. **Optimización de Hardware:** Se analizó el impacto del procesamiento (CPU/RAM) en el firewall al manejar múltiples reglas y cifrado VPN.


---

## 👤 Autor
**Josué Jerez**
- [LinkedIn](https://linkedin.com/in/josué-jerez-aab92b298/)
- Estudiante de 9.º Semestre de Ingeniería en Sistemas
- Enfocado en Ciberseguridad (Blue Team) y Soluciones Cloud.
