import {defineCliConfig} from 'sanity/cli'

/**
 * Configuración para Sanity CLI.
 *
 * El Studio vive embebido dentro de Next.js, por eso antes no existía este
 * archivo. Los comandos `sanity exec --with-user-token` sí lo necesitan para
 * saber contra qué proyecto y dataset deben trabajar.
 */
export default defineCliConfig({
  api: {
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'otz8srw5',
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  },
})
