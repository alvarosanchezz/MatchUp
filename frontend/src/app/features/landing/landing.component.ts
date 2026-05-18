import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink, LucideAngularModule],
  styles: [`
    :host { display: block; }

    /* ── Navbar ─────────────────────────────────────────────────────────── */
    .nav {
      position: fixed;
      top: 0; left: 0; right: 0;
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 40px;
      height: 64px;
      background: color-mix(in oklch, var(--bg) 82%, transparent);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--hairline);
    }
    .nav-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
    }
    .nav-logo-mark {
      width: 36px; height: 36px;
      background: var(--accent);
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      font-family: 'Space Grotesk', sans-serif;
      font-weight: 700;
      font-size: 18px;
      color: var(--accent-ink);
      flex-shrink: 0;
    }
    .nav-logo-text {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 20px;
      font-weight: 700;
      letter-spacing: -0.03em;
      color: var(--ink);
    }
    .nav-logo-text b { color: var(--accent); }
    .nav-actions { display: flex; gap: 8px; align-items: center; }

    .btn-nav-ghost {
      display: inline-flex;
      align-items: center;
      padding: 8px 18px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      color: color-mix(in oklch, var(--ink) 75%, transparent);
      text-decoration: none;
      background: transparent;
      border: 1px solid transparent;
      transition: background 150ms, color 150ms;
      &:hover { background: var(--surface); color: var(--ink); }
    }
    .btn-nav-accent {
      display: inline-flex;
      align-items: center;
      padding: 8px 18px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      color: var(--accent-ink);
      text-decoration: none;
      background: var(--accent);
      border: none;
      transition: filter 150ms, transform 120ms;
      &:hover { filter: brightness(1.08); transform: translateY(-1px); }
    }

    /* ── Hero ───────────────────────────────────────────────────────────── */
    .hero {
      min-height: 100vh;
      background: var(--bg);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 80px 24px 64px;
      position: relative;
      overflow: hidden;
    }
    .hero::before {
      content: '';
      position: absolute;
      top: 5%; left: -15%;
      width: 600px; height: 600px;
      background: radial-gradient(circle, color-mix(in oklch, var(--accent) 18%, transparent) 0%, transparent 65%);
      pointer-events: none;
    }
    .hero::after {
      content: '';
      position: absolute;
      bottom: 0; right: -10%;
      width: 500px; height: 500px;
      background: radial-gradient(circle, color-mix(in oklch, var(--accent) 10%, transparent) 0%, transparent 65%);
      pointer-events: none;
    }

    .hero-badge {
      position: relative;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: color-mix(in oklch, var(--accent) 14%, transparent);
      border: 1px solid color-mix(in oklch, var(--accent) 35%, transparent);
      border-radius: 999px;
      padding: 6px 16px;
      font-size: 13px;
      color: var(--accent);
      font-weight: 600;
      margin-bottom: 28px;
      letter-spacing: 0.2px;
    }
    .hero-badge lucide-icon { width: 14px; height: 14px; }

    .hero-title {
      position: relative;
      font-family: 'Space Grotesk', sans-serif;
      font-size: clamp(2.4rem, 6vw, 4rem);
      font-weight: 800;
      color: var(--ink);
      line-height: 1.1;
      letter-spacing: -0.03em;
      margin: 0 0 20px;
      max-width: 720px;
    }
    .hero-title .highlight {
      color: var(--accent);
    }

    .hero-sub {
      position: relative;
      font-size: clamp(1rem, 2.5vw, 1.2rem);
      color: color-mix(in oklch, var(--ink) 55%, transparent);
      max-width: 520px;
      line-height: 1.65;
      margin: 0 0 40px;
    }

    .hero-cta {
      position: relative;
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
      justify-content: center;
      margin-bottom: 56px;
    }
    .btn-hero-primary {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: var(--accent);
      color: var(--accent-ink);
      font-family: 'Space Grotesk', sans-serif;
      font-size: 16px;
      font-weight: 700;
      padding: 14px 32px;
      border-radius: 999px;
      border: none;
      cursor: pointer;
      text-decoration: none;
      box-shadow: 0 8px 28px color-mix(in oklch, var(--accent) 38%, transparent);
      transition: filter 0.2s, transform 0.15s, box-shadow 0.2s;
      lucide-icon { width: 18px; height: 18px; }
      &:hover {
        filter: brightness(1.08);
        transform: translateY(-2px);
        box-shadow: 0 12px 36px color-mix(in oklch, var(--accent) 50%, transparent);
      }
    }
    .btn-hero-ghost {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: transparent;
      color: color-mix(in oklch, var(--ink) 75%, transparent);
      border: 1px solid color-mix(in oklch, var(--ink) 22%, transparent);
      font-size: 16px;
      font-weight: 600;
      padding: 14px 32px;
      border-radius: 999px;
      cursor: pointer;
      text-decoration: none;
      transition: background 0.2s, border-color 0.2s, color 0.2s;
      &:hover {
        background: color-mix(in oklch, var(--ink) 6%, transparent);
        border-color: color-mix(in oklch, var(--ink) 32%, transparent);
        color: var(--ink);
      }
    }

    /* Stat pills */
    .hero-stats {
      position: relative;
      display: flex;
      gap: 28px;
      flex-wrap: wrap;
      justify-content: center;
    }
    .stat-pill {
      display: flex;
      align-items: center;
      gap: 8px;
      color: color-mix(in oklch, var(--ink) 50%, transparent);
      font-size: 14px;
      font-weight: 500;
    }
    .stat-pill lucide-icon { width: 17px; height: 17px; color: var(--accent); }

    /* ── Features ───────────────────────────────────────────────────────── */
    .features {
      background: var(--surface);
      padding: 96px 24px;
      border-top: 1px solid var(--hairline);
    }
    .section-label {
      text-align: center;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--accent);
      margin-bottom: 10px;
    }
    .section-title {
      text-align: center;
      font-family: 'Space Grotesk', sans-serif;
      font-size: clamp(1.6rem, 4vw, 2.4rem);
      font-weight: 700;
      color: var(--ink);
      margin: 0 0 12px;
      letter-spacing: -0.03em;
    }
    .section-sub {
      text-align: center;
      font-size: 16px;
      color: color-mix(in oklch, var(--ink) 55%, transparent);
      max-width: 500px;
      margin: 0 auto 56px;
      line-height: 1.65;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 20px;
      max-width: 960px;
      margin: 0 auto;
    }
    .feature-card {
      background: var(--bg);
      border: 1px solid var(--hairline);
      border-radius: 16px;
      padding: 28px 24px;
      transition: box-shadow 0.2s, transform 0.2s, border-color 0.2s;
      &:hover {
        box-shadow: 0 8px 32px color-mix(in oklch, var(--accent) 12%, transparent);
        transform: translateY(-3px);
        border-color: color-mix(in oklch, var(--accent) 30%, transparent);
      }
    }
    .feature-icon {
      width: 50px; height: 50px;
      border-radius: 14px;
      background: color-mix(in oklch, var(--accent) 14%, transparent);
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 18px;
    }
    .feature-icon lucide-icon {
      width: 24px; height: 24px;
      color: var(--accent);
    }
    .feature-title {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 17px;
      font-weight: 700;
      color: var(--ink);
      margin: 0 0 8px;
    }
    .feature-text {
      font-size: 14px;
      color: color-mix(in oklch, var(--ink) 55%, transparent);
      line-height: 1.65;
      margin: 0;
    }

    /* ── CTA banner ─────────────────────────────────────────────────────── */
    .cta-banner {
      background: var(--bg);
      padding: 96px 24px;
      text-align: center;
      border-top: 1px solid var(--hairline);
      position: relative;
      overflow: hidden;
    }
    .cta-banner::before {
      content: '';
      position: absolute;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      width: 600px; height: 300px;
      background: radial-gradient(ellipse, color-mix(in oklch, var(--accent) 12%, transparent) 0%, transparent 70%);
      pointer-events: none;
    }
    .cta-banner h2 {
      position: relative;
      font-family: 'Space Grotesk', sans-serif;
      font-size: clamp(1.6rem, 4vw, 2.4rem);
      font-weight: 700;
      color: var(--ink);
      margin: 0 0 12px;
      letter-spacing: -0.03em;
    }
    .cta-banner p {
      position: relative;
      font-size: 16px;
      color: color-mix(in oklch, var(--ink) 55%, transparent);
      margin: 0 0 36px;
    }

    /* ── Footer ─────────────────────────────────────────────────────────── */
    .footer {
      background: var(--surface);
      border-top: 1px solid var(--hairline);
      padding: 24px 40px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
    }
    .footer-logo {
      display: flex;
      align-items: center;
      gap: 8px;
      color: color-mix(in oklch, var(--ink) 55%, transparent);
      font-family: 'Space Grotesk', sans-serif;
      font-size: 15px;
      font-weight: 600;
    }
    .footer-logo lucide-icon { color: var(--accent); width: 18px; height: 18px; }
    .footer-copy { font-size: 13px; color: color-mix(in oklch, var(--ink) 35%, transparent); }

    /* ── Mobile ─────────────────────────────────────────────────────────── */
    @media (max-width: 600px) {
      .nav { padding: 0 16px; }
      .hero { padding: 100px 16px 48px; }
      .hero-cta { flex-direction: column; align-items: center; }
      .btn-hero-primary, .btn-hero-ghost { width: 100%; max-width: 280px; justify-content: center; }
      .features { padding: 60px 16px; }
      .cta-banner { padding: 60px 16px; }
      .footer { padding: 20px 16px; flex-direction: column; align-items: center; text-align: center; }
    }
  `],
  template: `
    <!-- Navbar -->
    <nav class="nav">
      <a class="nav-logo" routerLink="/">
        <div class="nav-logo-mark">M</div>
        <span class="nav-logo-text">match<b>up</b></span>
      </a>
      <div class="nav-actions">
        <a class="btn-nav-ghost" routerLink="/auth/login">Iniciar sesión</a>
        <a class="btn-nav-accent" routerLink="/auth/register">Regístrate</a>
      </div>
    </nav>

    <!-- Hero -->
    <section class="hero">
      <div class="hero-badge">
        <lucide-icon name="zap"></lucide-icon>
        La plataforma de quedadas deportivas
      </div>

      <h1 class="hero-title">
        Encuentra tu partido,<br>
        <span class="highlight">conoce a tu gente.</span>
      </h1>

      <p class="hero-sub">
        Organiza y únete a quedadas deportivas cerca de ti.
        Fútbol, baloncesto, tenis y mucho más — con gente real de tu zona.
      </p>

      <div class="hero-cta">
        <a class="btn-hero-primary" routerLink="/auth/register">
          Empezar gratis
          <lucide-icon name="arrow-right"></lucide-icon>
        </a>
        <a class="btn-hero-ghost" routerLink="/auth/login">
          Iniciar sesión
        </a>
      </div>

      <div class="hero-stats">
        <div class="stat-pill">
          <lucide-icon name="map-pin"></lucide-icon>
          <span>Quedadas cerca de ti</span>
        </div>
        <div class="stat-pill">
          <lucide-icon name="trophy"></lucide-icon>
          <span>Múltiples deportes</span>
        </div>
        <div class="stat-pill">
          <lucide-icon name="star"></lucide-icon>
          <span>Sistema de valoraciones</span>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="features">
      <p class="section-label">Cómo funciona</p>
      <h2 class="section-title">Todo lo que necesitas para<br>jugar más y mejor</h2>
      <p class="section-sub">
        MatchUp te conecta con deportistas de tu ciudad para que nunca te falte equipo.
      </p>

      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">
            <lucide-icon name="search"></lucide-icon>
          </div>
          <h3 class="feature-title">Busca quedadas</h3>
          <p class="feature-text">
            Filtra por deporte, fecha y distancia. Encuentra partidos abiertos
            en tu barrio en segundos.
          </p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">
            <lucide-icon name="users"></lucide-icon>
          </div>
          <h3 class="feature-title">Únete o crea</h3>
          <p class="feature-text">
            Apúntate a una quedada existente o crea la tuya propia en menos
            de un minuto. El organizador confirma los participantes.
          </p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">
            <lucide-icon name="map"></lucide-icon>
          </div>
          <h3 class="feature-title">Mapa interactivo</h3>
          <p class="feature-text">
            Visualiza todas las quedadas en un mapa. Encuentra las más
            cercanas a ti de un vistazo.
          </p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">
            <lucide-icon name="star"></lucide-icon>
          </div>
          <h3 class="feature-title">Valora y conecta</h3>
          <p class="feature-text">
            Después de cada quedada, valora el nivel y la deportividad
            de tus compañeros. Construye tu reputación.
          </p>
        </div>
      </div>
    </section>

    <!-- CTA Banner -->
    <section class="cta-banner">
      <h2>¿Listo para jugar?</h2>
      <p>Únete gratis y empieza a encontrar tu próximo partido hoy.</p>
      <a class="btn-hero-primary" routerLink="/auth/register">
        Crear cuenta gratis
        <lucide-icon name="arrow-right"></lucide-icon>
      </a>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-logo">
        <lucide-icon name="trophy"></lucide-icon>
        <span>MatchUp</span>
      </div>
      <span class="footer-copy">© 2025 MatchUp. Hecho con ❤️ para deportistas.</span>
    </footer>
  `,
})
export class LandingComponent implements OnInit {
  private readonly authSvc = inject(AuthService);
  private readonly router  = inject(Router);

  ngOnInit(): void {
    if (this.authSvc.currentUser()) {
      this.router.navigate(['/meetups']);
    }
  }
}
