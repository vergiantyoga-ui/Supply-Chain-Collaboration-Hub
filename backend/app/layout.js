export const metadata = {
  title: "Paragon Supply Collaboration Hub — API",
  description: "Backend API for the Paragon Supply Collaboration Hub (Next.js, mock data, PostgreSQL-ready).",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
