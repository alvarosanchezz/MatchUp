import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../core/services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Quedadas',  icon: 'event',         route: '/meetups' },
  { label: 'Deportes',  icon: 'sports_soccer',  route: '/sports'  },
  { label: 'Mi perfil', icon: 'person',         route: '/profile' },
];

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule,
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent implements OnInit {
  readonly authService = inject(AuthService);
  private readonly breakpointObserver = inject(BreakpointObserver);

  readonly navItems = NAV_ITEMS;

  isMobile = false;
  sidenavOpen = true;

  ngOnInit(): void {
    this.breakpointObserver.observe(Breakpoints.Handset).subscribe(result => {
      this.isMobile = result.matches;
      this.sidenavOpen = !result.matches;
    });
  }

  toggleSidenav(): void { this.sidenavOpen = !this.sidenavOpen; }
  closeSidebar():  void { this.sidenavOpen = false; }
  logout():        void { this.authService.logout(); }

  get userPhoto():   string | null { return this.authService.currentUser()?.urlFotoPerfil ?? null; }
  get userName():    string        { return this.authService.currentUser()?.nombre ?? ''; }
  get userInitial(): string        { return this.userName.charAt(0).toUpperCase(); }
}
