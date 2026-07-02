import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

const DEFAULT_GA_MEASUREMENT_ID = 'G-CZ7HQG57CM'

function googleAnalyticsPlugin(gaMeasurementId) {
  if (!gaMeasurementId) {
    return { name: 'google-analytics' }
  }

  const snippet = `<!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${gaMeasurementId}', { send_page_view: false });
    </script>`

  return {
    name: 'google-analytics',
    transformIndexHtml(html) {
      return html.replace('</head>', `    ${snippet}\n  </head>`)
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const gaMeasurementId = env.VITE_GA_MEASUREMENT_ID?.trim() || DEFAULT_GA_MEASUREMENT_ID

  return {
    plugins: [react(), googleAnalyticsPlugin(gaMeasurementId)],
    build: {
      target: 'es2020',
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router')) {
              return 'vendor';
            }
          },
        },
      },
    },
    server: {
      port: 5173,
      strictPort: true,
      open: '/',
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
        },
        '/uploads': {
          target: 'http://localhost:3000',
          changeOrigin: true,
        },
      },
    },
  }
})