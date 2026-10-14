import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import { DeudasProvider } from '@/lib/deudas-store'
import { TorneoProvider } from '@/lib/torneo-store'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'SaqueCentral — CRM de Torneos de Vóley',
  description:
    'Panel de administración para gestionar torneos amateur de vóley: validación de pagos, morosidad, fixture, rosters y más.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fbf8f4' },
    { media: '(prefers-color-scheme: dark)', color: '#221c17' },
  ],
}

const themeInitScript = `
(function() {
  try {
    var stored = localStorage.getItem('sc-theme');
    var isDark = stored === 'dark';
    if (stored === null) {
      localStorage.setItem('sc-theme', 'light');
    }
    document.documentElement.classList.toggle('dark', isDark);
  } catch (e) {}
})();
`

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${spaceGrotesk.variable} bg-background`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="font-sans antialiased">
        <TorneoProvider>
          <DeudasProvider>{children}</DeudasProvider>
        </TorneoProvider>
        <Toaster position="top-center" richColors />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
