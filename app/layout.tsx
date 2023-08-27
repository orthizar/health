import './globals.css'
import { Inter } from 'next/font/google'
import GoogleAnalytics from "./components/GoogleAnalytics";

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Health of Silvan Kohler',
  description: 'Health of Silvan Kohler',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS ? (
          <GoogleAnalytics ga_id=
            {process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS} />
        ) : null}
        {children}
      </body>
    </html>
  )
}
