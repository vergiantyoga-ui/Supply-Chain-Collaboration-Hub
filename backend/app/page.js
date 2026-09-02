export default function Home() {
  return (
    <main style={{ fontFamily: "sans-serif", padding: "2rem", maxWidth: 720 }}>
      <h1>Paragon Supply Collaboration Hub — API</h1>
      <p>This Next.js app only serves API routes under <code>/api/*</code>. It has no UI of its own.</p>
      <p>The React + Vite frontend (in <code>../frontend</code>) consumes these endpoints.</p>
      <ul>
        <li><code>POST /api/auth/login</code></li>
        <li><code>POST /api/auth/forgot-password</code></li>
        <li><code>POST /api/auth/sso</code></li>
        <li><code>GET /api/lookups</code></li>
        <li><code>GET /api/suppliers</code></li>
        <li><code>POST /api/suppliers</code></li>
        <li><code>GET /api/suppliers/:id</code></li>
        <li><code>POST /api/suppliers/:id/approve</code></li>
        <li><code>POST /api/suppliers/:id/reject</code></li>
      </ul>
    </main>
  );
}
