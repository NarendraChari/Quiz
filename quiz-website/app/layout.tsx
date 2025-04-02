import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>Programming Quiz</title>
        <meta name="description" content="Test your programming knowledge" />
      </head>
      <body className={inter.className}>
        {/* Animated background */}
        <div className="fixed inset-0 -z-10 overflow-hidden">
          {/* Grid background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>

          {/* Animated blobs */}
          <div className="absolute left-1/4 top-1/4 -z-10 h-[300px] w-[300px] rounded-full bg-pistaGreen opacity-20 blur-[100px] animate-blob"></div>
          <div className="absolute right-1/4 bottom-1/4 -z-10 h-[250px] w-[250px] rounded-full bg-lightBlue opacity-20 blur-[100px] animate-blob animation-delay-2000"></div>
          <div className="absolute left-1/3 bottom-1/3 -z-10 h-[200px] w-[200px] rounded-full bg-lemonGreen opacity-20 blur-[100px] animate-blob animation-delay-4000"></div>

          {/* Floating particles */}
          <div className="absolute top-10 left-10 h-4 w-4 rounded-full bg-pistaGreen animate-float-particle"></div>
          <div className="absolute top-20 right-20 h-3 w-3 rounded-full bg-lightBlue animate-float-particle animation-delay-1000"></div>
          <div className="absolute bottom-20 left-1/3 h-5 w-5 rounded-full bg-lemonGreen animate-float-particle animation-delay-2000"></div>
          <div className="absolute top-1/3 right-1/4 h-6 w-6 rounded-full bg-pistaGreen animate-float-particle animation-delay-3000"></div>
          <div className="absolute bottom-1/4 right-1/3 h-4 w-4 rounded-full bg-lightBlue animate-float-particle animation-delay-4000"></div>
        </div>

        {/* Disable right-click */}
        <div onContextMenu={(e) => e.preventDefault()} className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  )
}



import './globals.css'

export const metadata = {
      generator: 'v0.dev'
    };
