import { Component, HostListener, inject, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../core/services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Quedadas', icon: 'compass', route: '/meetups' },
  { label: 'Deportes', icon: 'trophy',  route: '/sports'  },
  { label: 'Perfil',   icon: 'user',    route: '/profile' },
];

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    LucideAngularModule,
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent implements OnInit {
  readonly authService = inject(AuthService);
  private readonly breakpointObserver = inject(BreakpointObserver);

  readonly navItems = NAV_ITEMS;

  isMobile   = false;
  sidenavOpen = true;
  showMenu   = false;

  @HostListener('document:click')
  closeMenu(): void { this.showMenu = false; }

  toggleMenu(e: Event): void {
    e.stopPropagation();
    this.showMenu = !this.showMenu;
  }

  ngOnInit(): void {
    this.breakpointObserver.observe('(max-width: 900px)').subscribe(result => {
      this.isMobile   = result.matches;
      this.sidenavOpen = !result.matches;
    });
  }

  toggleSidenav(): void { this.sidenavOpen = !this.sidenavOpen; }
  closeSidebar():  void { this.sidenavOpen = false; }
  logout():        void { this.authService.logout(); }

  get userPhoto():    string | null { return this.authService.currentUser()?.urlFotoPerfil ?? null; }
  get userName():     string        { return this.authService.currentUser()?.nombre ?? ''; }
  get userInitial():  string        { return this.userName.charAt(0).toUpperCase(); }
  get userInitials(): string {
    return this.userName
      .split(' ')
      .slice(0, 2)
      .map(s => s[0] ?? '')
      .join('')
      .toUpperCase() || '?';
  }
}
