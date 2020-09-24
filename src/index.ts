import './config' // Para que cargue las variables de entorno antes que nada
import loaders from './loaders'

async function start() {
  await loaders()
  console.log('Server ready')
}

start()
