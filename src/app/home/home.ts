import { Component, inject } from '@angular/core';
import { CommonModule, AsyncPipe  } from '@angular/common';
import { Auth, signOut } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { DataService, SportEvent } from '../services/data.service';
import { EventFormComponent } from '../dialogs/event-form/event-form';
import { TranslateService, TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatDialogModule,
    TranslateModule
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class HomeComponent {
  private auth = inject(Auth);
  private router = inject(Router);
  private dataService = inject(DataService);
  public dialog = inject(MatDialog);
  public translate = inject(TranslateService);

  ADMIN_EMAIL = 'admin@kirol.com';

  events$: Observable<SportEvent[]> = this.dataService.getEvents();
  sports$ = this.dataService.getSports();

  switchLanguage(lang: string) {
      this.translate.use(lang);

      localStorage.setItem('language', lang);
    }

    constructor() {
      const savedLang = localStorage.getItem('language');
      if (savedLang) {
        this.translate.use(savedLang);
      }
    }

  get isAdmin(): boolean {
    return this.auth.currentUser?.email === this.ADMIN_EMAIL;
  }
   addSport() {
       const sportName = prompt('Nombre del nuevo deporte (ej: Rugby):');
       if (!sportName) return;

       const iconName = prompt('Nombre del icono (ej: sports_rugby, pool, fitness_center):', 'sports_score');
       const rules = prompt('Reglas por defecto (ej: 2 partes de 40min):', '');

       if (sportName && iconName) {
         this.dataService.addSport(sportName, iconName, rules || '')
           .then(() => alert('Deporte añadido correctamente'))
           .catch(e => alert('Error: ' + e));
       }
     }
     deleteSport(sport: any) {

       // Lista de IDs protegidos (deportes predefinidos)
       const protectedIds = ['pala', 'futbol', 'padel', 'basket', 'monte'];

       if (protectedIds.includes(sport.id)) {
         alert('No se pueden borrar los deportes predefinidos del sistema.');
         return;
       }

       if (confirm(`¿Seguro que quieres borrar el deporte "${sport.name}"?`)) {
         this.dataService.deleteSport(sport.id)
           .then(() => alert('Deporte eliminado'))
           .catch(e => alert('Error al borrar: ' + e));
       }
     }
   openCreateEventDialog() {
     const dialogRef = this.dialog.open(EventFormComponent);

     let currentSports: any[] = [];
     this.sports$.subscribe(s => currentSports = s);
     dialogRef.afterClosed().subscribe(result => {
       if (result) {
         const selectedSport = currentSports.find(s => s.name === result.sport);
         const rules = selectedSport ? selectedSport.defaultRules : 'Sin reglas específicas';

         const newEvent: SportEvent = {
           title: result.title,
           sport: result.sport,
           location: result.location || 'Sin ubicación',
           date: result.date,
           createdBy: this.auth.currentUser?.email || 'Anónimo',
           sportRules: rules
         };

         this.dataService.addEvent(newEvent)
         .then(() => console.log('Evento creado'))
         .catch((err: any) => alert('Error al crear: ' + err));
       }
     });
   }
   goToEvent(event: SportEvent) {
     if (event.id) {
       this.router.navigate(['/event', event.id]);
     }
   }

   async logout() {
     await signOut(this.auth);
     this.router.navigate(['login']);
   }
   goToStats() {
     this.router.navigate(['stats']);
   }
 }
