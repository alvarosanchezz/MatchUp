import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule],
  styles: [`
    /* ── Reset & base ──────────────────────────────────────────────────────── */
    :host { display: block; }

    /* ── Navbar ────────────────────────────────────────────────────────────── */
    .nav {
      position: fixed;
      top: 0; left: 0; right: 0;
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 40px;
      height: 64px;
      background: rgba(15, 12, 41, 0.75);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-bottom: 1px solid rgba(255,255,255,0.07);
    }
    .nav-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      color: white;
      text-decoration: none;
    }
    .nav-logo-icon {
      width: 36px; height: 36px;
      background: linear-gradient(135deg, #a78bfa, #7c3aed);
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
    }
    .nav-logo-icon mat-icon { color: white; font-size: 20px; width: 20px; height: 20px; }
    .nav-logo-text { font-size: 20px; font-weight: 700; letter-spacing: -0.3px; }
    .nav-actions { display: flex; gap: 8px; align-items: center; }
    .nav-login { color: rgba(255,255,255,0.85) !important; }
    .nav-register { background: white !important; color: #5b21b6 !important; font-weight: 600 !important; }

    /* ── Hero ──────────────────────────────────────────────────────────────── */
    .hero {
      min-height: 100vh;
      background: linear-gradient(135deg, #0f0c29 0%, #302b63 55%, #24243e 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 80px 24px 64px;
      position: relative;
      overflow: hidden;
    }

    /* Decorative blobs */
    .hero::before {
      content: '';
      position: absolute;
      top: 10%; left: -10%;
      width: 500px; height: 500px;
      background: radial-gradient(circle, rgba(124,61,255,0.22) 0%, transparent 70%);
      pointer-events: none;
    }
    .hero::after {
      content: '';
      position: absolute;
      bottom: 5%; right: -5%;
      width: 400px; height: 400px;
      background: radial-gradient(circle, rgba(167,139,250,0.18) 0%, transparent 70%);
      pointer-events: none;
    }

    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(167,139,250,0.15);
      border: 1px solid rgba(167,139,250,0.35);
      border-radius: 20px;
      padding: 6px 16px;
      font-size: 13px;
      color: #c4b5fd;
      font-weight: 500;
      margin-bottom: 28px;
      letter-spacing: 0.3px;
    }
    .hero-badge mat-icon { font-size: 15px; width: 15px; height: 15px; }

    .hero-title {
      font-size: clamp(2.4rem, 6vw, 4rem);
      font-weight: 800;
      color: white;
      line-height: 1.12;
      letter-spacing: -1px;
      margin: 0 0 20px;
      max-width: 700px;

      span {
        background: linear-gradient(90deg, #a78bfa, #60a5fa);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
    }

    .hero-sub {
      font-size: clamp(1rem, 2.5vw, 1.2rem);
      color: rgba(255,255,255,0.62);
      max-width: 520px;
      line-height: 1.65;
      margin: 0 0 40px;
    }

    .hero-cta {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
      justify-content: center;
      margin-bottom: 56px;
    }
    .btn-primary-hero {
      background: linear-gradient(135deg, #7c3aed, #6d28d9) !important;
      color: white !important;
      font-size: 16px !important;
      font-weight: 600 !important;
      padding: 0 32px !important;
      height: 52px !important;
      border-radius: 26px !important;
      box-shadow: 0 8px 24px rgba(124,58,237,0.45) !important;
      transition: box-shadow 0.2s, transform 0.15s !important;

      &:hover {
        box-shadow: 0 12px 32px rgba(124,58,237,0.6) !important;
        transform: translateY(-1px);
      }
    }
    .btn-secondary-hero {
      color: rgba(255,255,255,0.8) !important;
      border-color: rgba(255,255,255,0.25) !important;
      font-size: 16px !important;
      padding: 0 32px !important;
      height: 52px !important;
      border-radius: 26px !important;

      &:hover { background: rgba(255,255,255,0.06) !important; }
    }

    /* Stat pills */
    .hero-stats {
      display: flex;
      gap: 24px;
      flex-wrap: wrap;
      justify-content: center;
    }
    .stat-pill {
      display: flex;
      align-items: center;
      gap: 8px;
      color: rgba(255,255,255,0.55);
      font-size: 14px;
    }
    .stat-pill mat-icon { font-size: 18px; width: 18px; height: 18px; color: #a78bfa; }

    /* ── Features ──────────────────────────────────────────────────────────── */
    .features {
      background: #fafafa;
      padding: 80px 24px;
    }
    .section-label {
      text-align: center;
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #7c3aed;
      margin-bottom: 12px;
    }
    .section-title {
      text-align: center;
      font-size: clamp(1.6rem, 4vw, 2.4rem);
      font-weight: 700;
      color: #1a1a2e;
      margin: 0 0 12px;
      letter-spacing: -0.5px;
    }
    .section-sub {
      text-align: center;
      font-size: 16px;
      color: rgba(0,0,0,0.5);
      max-width: 500px;
      margin: 0 auto 56px;
      line-height: 1.65;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 24px;
      max-width: 960px;
      margin: 0 auto;
    }
    .feature-card {
      background: white;
      border-radius: 16px;
      padding: 32px 28px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.07), 0 4px 16px rgba(0,0,0,0.05);
      transition: box-shadow 0.2s, transform 0.2s;

      &:hover {
        box-shadow: 0 4px 24px rgba(0,0,0,0.1);
        transform: translateY(-3px);
      }
    }
    .feature-icon {
      width: 52px; height: 52px;
      border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 18px;
    }
    .feature-icon mat-icon { font-size: 26px; width: 26px; height: 26px; }
    .icon-purple { background: rgba(124,58,237,0.1); }
    .icon-purple mat-icon { color: #7c3aed; }
    .icon-blue   { background: rgba(59,130,246,0.1); }
    .icon-blue mat-icon   { color: #3b82f6; }
    .icon-green  { background: rgba(16,185,129,0.1); }
    .icon-green mat-icon  { color: #10b981; }
    .icon-orange { background: rgba(249,115,22,0.1); }
    .icon-orange mat-icon { color: #f97316; }

    .feature-title {
      font-size: 17px;
      font-weight: 700;
      color: #1a1a2e;
      margin: 0 0 8px;
    }
    .feature-text {
      font-size: 14px;
      color: rgba(0,0,0,0.55);
      line-height: 1.65;
      margin: 0;
    }

    /* ── CTA banner ────────────────────────────────────────────────────────── */
    .cta-banner {
      background: linear-gradient(135deg, #0f0c29 0%, #302b63 55%, #24243e 100%);
      padding: 80px 24px;
      text-align: center;
    }
    .cta-banner h2 {
      font-size: clamp(1.6rem, 4vw, 2.4rem);
      font-weight: 700;
      color: white;
      margin: 0 0 12px;
      letter-spacing: -0.5px;
    }
    .cta-banner p {
      font-size: 16px;
      color: rgba(255,255,255,0.55);
      margin: 0 0 36px;
    }

    /* ── Footer ────────────────────────────────────────────────────────────── */
    .footer {
      background: #0f0c29;
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
      color: rgba(255,255,255,0.55);
      font-size: 14px;
    }
    .footer-logo mat-icon { color: #a78bfa; font-size: 18px; width: 18px; height: 18px; }
    .footer-copy { font-size: 13px; color: rgba(255,255,255,0.35); }

    /* ── Mobile ────────────────────────────────────────────────────────────── */
    @media (max-width: 600px) {
      .nav { padding: 0 16px; }
      .nav-logo-text { font-size: 17px; }
      .hero { padding: 100px 16px 48px; }
      .hero-cta { flex-direction: column; align-items: center; }
      .btn-primary-hero, .btn-secondary-hero { width: 100%; max-width: 280px; }
      .features { padding: 56px 16px; }
      .cta-banner { padding: 56px 16px; }
      .footer { padding: 20px 16px; flex-direction: column; align-items: center; text-align: center; }
    }
  `],
  template: `
    <!-- Navbar -->
    <nav class="nav">
      <a class="nav-logo" routerLink="/">
        <div class="nav-logo-icon"><mat-icon>sports</mat-icon></div>
        <span class="nav-logo-text">MatchUp</span>
      </a>
      <div class="nav-actions">
        <a mat-button class="nav-login" routerLink="/auth/login">Iniciar sesión</a>
        <a mat-raised-button class="nav-register" routerLink="/auth/register">Regístrate</a>
      </div>
    </nav>

    <!-- Hero -->
    <section class="hero">
      <div class="hero-badge">
        <mat-icon>bolt</mat-icon>
        La plataforma de quedadas deportivas
      </div>

      <h1 class="hero-title">
        Encuentra tu partido,<br>
        <span>conoce a tu gente.</span>
      </h1>

      <p class="hero-sub">
        Organiza y únete a quedadas deportivas cerca de ti.
        Fútbol, baloncesto, tenis y mucho más — con gente real de tu zona.
      </p>

      <div class="hero-cta">
        <a mat-raised-button class="btn-primary-hero" routerLink="/auth/register">
          Empezar gratis
          <mat-icon style="margin-left:6px">arrow_forward</mat-icon>
        </a>
        <a mat-stroked-button class="btn-secondary-hero" routerLink="/auth/login">
          Iniciar sesión
        </a>
      </div>

      <div class="hero-stats">
        <div class="stat-pill">
          <mat-icon>location_on</mat-icon>
          <span>Quedadas cerca de ti</span>
        </div>
        <div class="stat-pill">
          <mat-icon>sports_soccer</mat-icon>
          <span>Múltiples deportes</span>
        </div>
        <div class="stat-pill">
          <mat-icon>star</mat-icon>
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
          <div class="feature-icon icon-purple">
            <mat-icon>search</mat-icon>
          </div>
          <h3 class="feature-title">Busca quedadas</h3>
          <p class="feature-text">
            Filtra por deporte, fecha y distancia. Encuentra partidos abiertos
            en tu barrio en segundos.
          </p>
        </div>

        <div class="feature-card">
          <div class="feature-icon icon-blue">
            <mat-icon>group_add</mat-icon>
          </div>
          <h3 class="feature-title">Únete o crea</h3>
          <p class="feature-text">
            Apúntate a una quedada existente o crea la tuya propia en menos
            de un minuto. El organizador confirma los participantes.
          </p>
        </div>

        <div class="feature-card">
          <div class="feature-icon icon-green">
            <mat-icon>map</mat-icon>
          </div>
          <h3 class="feature-title">Mapa interactivo</h3>
          <p class="feature-text">
            Visualiza todas las quedadas en un mapa. Encuentra las más
            cercanas a ti de un vistazo.
          </p>
        </div>

        <div class="feature-card">
          <div class="feature-icon icon-orange">
            <mat-icon>star_rate</mat-icon>
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
      <a mat-raised-button class="btn-primary-hero" routerLink="/auth/register">
        Crear cuenta gratis
        <mat-icon style="margin-left:6px">arrow_forward</mat-icon>
      </a>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-logo">
        <mat-icon>sports</mat-icon>
        <span>MatchUp</span>
      </div>
      <span class="footer-copy">© 2025 MatchUp. Hecho con ❤️ para deportistas.</span>
    </footer>
  `,
})
export class LandingComponent implements OnInit {
  private readonly authSvc = inject(AuthService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    // Si ya está autenticado, ir directo a la app
    if (this.authSvc.currentUser()) {
      this.router.navigate(['/meetups']);
    }
  }
}
