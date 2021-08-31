# Bloom #
Plantilla para proyectos con nodejs, express y typeorm 


## Compilar
Usar comando TSC

## Migraciones

Borrar el build del proyecto
Borrar la carpeta migrations
NO OLVIDAR RESPALDAR REGISTROS DE LA BASE DE DATOS
Borrar la base de datos

1. Generar migracion con `npm run typeorm migration:create -- -n 'Nombre de la migración'`
2. Compliar migración con `tsc`
3. Generar migracion con `npm run typeorm migration:generate -- -n 'Nombre de la migración'`
4. Compliar migración con `tsc`
5. Correr migración con `npm run typeorm migration:run`