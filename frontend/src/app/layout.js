import './globals.css'
import Script from 'next/script'

export const metadata = {
  title: 'Bounce Strike',
  description: 'Multiplayer bounce game',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.11.2/p5.min.js" />
        <Script src="https://cdn.socket.io/4.7.2/socket.io.min.js" />
        <Script src="/helpers.js" />
        <Script src="/objects.js" />
        <Script src="/sketch.js" />
      </body>
    </html>
  )
}