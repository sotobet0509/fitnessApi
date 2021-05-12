# Bloom #
Plantilla para proyectos con nodejs, express y typeorm 


## Compilar
Usar comando TSC

## Migraciones

1. Generar migracion con `npm run typeorm migration:create -- -n 'Nombre de la migración'`
2. Compliar migración con `tsc`
3. Generar migracion con `npm run typeorm migration:generate -- -n 'Nombre de la migración'`
5. Compliar migración con `tsc`
6. Correr migración con `npm run typeorm migration:run`