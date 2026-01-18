import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { map, switchMap } from 'rxjs';
import { DataService, SportEvent } from '../services/data.service';
import { Auth, authState } from '@angular/fire/auth';
import { TranslateService, TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, TranslateModule],
  templateUrl: './stats.html',
  styleUrl: './stats.scss'
})
export class StatsComponent {
  private dataService = inject(DataService);
  private router = inject(Router);
  private auth = inject(Auth);

  ADMIN_EMAIL = 'admin@kirol.com';

  // Usamos authState para esperar a tener el usuario cargado antes de calcular
  stats$ = authState(this.auth).pipe(
    switchMap(user => {
      return this.dataService.getEvents().pipe(
        map(allEvents => {
          let myEvents: SportEvent[] = [];

          if (user?.email === this.ADMIN_EMAIL) {
            // Si es ADMIN: Ve todo (Estadísticas Globales - Caso Uso 10)
            myEvents = allEvents;
          } else {
            // Si es USUARIO: Solo los suyos (Estadísticas Personales - Caso Uso 8)
            myEvents = allEvents.filter(e => {
              const isCreator = e.createdBy === user?.email;
              const isParticipant = e.participants?.some(p => p.uid === user?.uid);
              return isCreator || isParticipant;
            });
          }

          const total = myEvents.length;

          // Deporte Favorito
          const sportCounts: Record<string, number> = {};
          myEvents.forEach(e => {
            const sportName = e.sport || 'Otros';
            sportCounts[sportName] = (sportCounts[sportName] || 0) + 1;
          });

          let favSport = 'Ninguno';
          let maxCount = 0;
          for (const [sport, count] of Object.entries(sportCounts)) {
            if (count > maxCount) {
              maxCount = count;
              favSport = sport;
            }
          }

          // 3. Este mes
          const now = new Date();
          const thisMonth = myEvents.filter(e => {
            const d = (e.date && typeof e.date.toDate === 'function')
              ? e.date.toDate()
              : new Date(e.date);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
          }).length;

          return {
            total,
            favSport,
            thisMonth,
            // Añadimos un título para saber qué estamos viendo
            title: user?.email === this.ADMIN_EMAIL ? 'STATS.TITLE_GLOBAL' : 'STATS.TITLE_PERSONAL'
          };
        })
      );
    })
  );

  goBack() {
    this.router.navigate(['home']);
  }
}
