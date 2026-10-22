# Administrador de Racks

Aplicación web para administrar racks de telecomunicaciones, espacios U y dispositivos.

## Cómo ejecutar

1. Descarga y descomprime el proyecto.
2. Abre la carpeta `dashboard-racks` en Visual Studio Code.
3. Abre `index.html` con un navegador.
4. Para una experiencia cómoda puedes instalar la extensión **Live Server** en VS Code y elegir **Open with Live Server**.

## Funciones

- Crear, editar y eliminar racks.
- Seleccionar capacidad de 4 a 60U.
- Crear switches, routers, servidores, patch panels y UPS.
- Editar modelo, IP, posición, altura y estado.
- Arrastrar dispositivos entre espacios U.
- Evitar que dos equipos ocupen el mismo espacio.
- Inventario con búsqueda.
- Guardado automático en `localStorage`.
- Datos de demostración incluidos.

## Nota

El archivo `data/inventario.json` sirve como ejemplo/exportación de datos. La aplicación guarda los cambios de uso normal en el almacenamiento local del navegador.
