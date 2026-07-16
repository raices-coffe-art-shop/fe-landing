export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-top page-shell">
        <div>
          <p className="footer-word">Raíces</p>
          <p className="footer-tag">Café y Cultura</p>
        </div>
        <blockquote>“Todos regresamos a aquello que nos formó.”</blockquote>
      </div>
      <div className="footer-grid page-shell">
        <div><span>Visita</span><p>Dirección pendiente<br />Lima, Perú</p></div>
        <div><span>Contacto</span><p>WhatsApp pendiente<br />Instagram pendiente</p></div>
        <div><span>Explora</span><p><a href="#personas">Personas</a><br /><a href="#catalogo">Catálogo</a><br /><a href="#arte">Arte</a><br /><a href="/links">Enlaces</a></p></div>
        <div><span>Reconocimiento</span><p>A productores, artistas y artesanos cuyas historias sostienen este espacio.</p></div>
      </div>
      <div className="footer-bottom page-shell"><span>© 2026 Raíces</span><span>Ayacucho presente en Lima</span><span>Foto principal: Pizardi · Wikimedia Commons · CC BY-SA 4.0</span></div>
    </footer>
  );
}
