import { Component } from '@angular/core';

@Component({
  selector: 'app-meetup-detail',
  standalone: true,
  template: `
    <div class="flex items-center justify-center h-64">
      <p class="text-gray-500 text-lg">Detalle de quedada — próximamente</p>
    </div>
  `,
})
export class MeetupDetailComponent {}
