/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. ESTO ES VITAL PARA TAURI: Exporta HTML/JS estático a la carpeta "out"
  output: 'export',

  // 2. Ignora errores de TS para que la compilación no se detenga
  typescript: {
    ignoreBuildErrors: true,
  },

  // 3. Requerido por Tauri porque no hay servidor Node para optimizar imágenes
  images: {
    unoptimized: true,
  },
  swcMinify: true,
  reactStrictMode: false,
}

export default nextConfig