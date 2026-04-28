# Gestion Visual de Opticas e Infraestructura

Aplicacion web visual para hacer seguimiento diario a opticas y sedes administrativas desde un tablero por tarjetas.

## Que resuelve

Esta herramienta esta pensada para coordinar:

- novedades por sede,
- tareas prioritarias,
- mantenimiento,
- obras nuevas,
- reformas,
- cotizaciones,
- proveedores,
- evidencias y notas.

Cada sede funciona como un mini centro de control con su propia informacion, historial y seguimiento.

## Como funciona

Cada tarjeta representa una sede.

Dentro de cada sede puedes gestionar:

- operacion diaria,
- mantenimiento,
- obras y reformas,
- cotizaciones y proveedores,
- evidencias y notas.

Ademas, cada caso puede llevar:

- prioridad,
- estado,
- semaforo,
- impacto,
- responsable,
- proveedor,
- presupuesto,
- avance,
- fecha compromiso.

## Funciones principales

- Vista visual tipo dashboard por sedes.
- Imagen de fachada por sede.
- Apertura de una ventana por sede para trabajar sin romper el tablero.
- Registro de casos nuevos.
- Edicion rapida de casos existentes.
- Resumen ejecutivo con indicadores.
- Exportacion global o por sede a CSV.
- Almacenamiento local en el navegador.

## Estructura del proyecto

- `index.html`: estructura principal de la interfaz.
- `styles.css`: estilos visuales del tablero, tarjetas y ventanas.
- `app.js`: logica de sedes, casos, filtros, persistencia y exportacion.
- `.gitignore`: archivos a ignorar al publicar.

## Publicar en GitHub

1. Crea un repositorio nuevo en GitHub.
2. Sube estos archivos a la raiz del repositorio.
3. Verifica que `index.html` quede en la raiz.
4. En GitHub abre `Settings > Pages`.
5. En `Build and deployment` selecciona `Deploy from a branch`.
6. Elige tu rama principal y la carpeta `/root`.
7. Guarda y espera a que GitHub te entregue la URL publica.

## Uso local

1. Abre `index.html` en tu navegador.
2. Busca o ubica la sede en el tablero.
3. Haz clic en `Abrir sede`.
4. Registra un caso nuevo o edita uno existente.
5. Exporta la informacion cuando lo necesites.

## Nota importante

Las imagenes y los datos se guardan en el navegador del equipo donde abras la app.  
Si luego quieres usarla entre varias personas o desde varios computadores, el siguiente paso ideal es conectarla a una base de datos.
