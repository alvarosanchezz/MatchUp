import { Component } from '@angular/core';

@Component({
  selector: 'app-sports',
  standalone: true,
  template: `
    <div class="flex items-center justify-center h-64">
      <p class="text-gray-500 text-lg">Deportes — próximamente</p>
    </div>
  `,
})
export class SportsComponent {}
