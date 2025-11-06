import "./globals.css";
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
        <title>
          Felipe Fontana - Desarrollador Web Full Stack | UI/UX Designer | ffontana.dev
        </title>
        <meta
          name="description"
          content="Desarrollador web especializado en React, Next.js y UI/UX. Creo landing pages optimizadas, chatbots con IA y aplicaciones web modernas. Más de 3 años de experiencia en Montevideo, Uruguay."
        />
        <meta name="keywords" content="desarrollador web, React, Next.js, UI/UX, landing pages, chatbots, IA, Montevideo, Uruguay, frontend, fullstack" />
        <meta name="author" content="Felipe Fontana" />
        <meta name="robots" content="index, follow" />
        <meta name="theme-color" content="#000000" />

        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://ffontana.dev/" />
        <meta
          property="og:title"
          content="Felipe Fontana - Desarrollador Web Full Stack | Portfolio"
        />
        <meta
          property="og:description"
          content="Portfolio profesional de Felipe Fontana. Desarrollador web especializado en React, Next.js, UI/UX y soluciones digitales innovadoras."
        />
        <meta property="og:image" content="https://ffontana.dev/og-image.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="ffontana.dev — Desarrollo Web y Experiencias Creativas"
        />
        <meta
          name="twitter:description"
          content="Explora el showroom de experiencias interactivas creadas por Felipe Fontana. Diseño digital con enfoque UI/UX y tecnología."
        />
        <meta
          name="twitter:image"
          content="https://ffontana.dev/og-image.jpg"
        />

        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>{children}</body>
    </html>
  );
}
