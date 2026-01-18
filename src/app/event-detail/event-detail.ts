import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService, SportEvent, Expense } from '../services/data.service';
import { Observable, combineLatest, map } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { FormsModule } from '@angular/forms';
import { Auth, authState, User } from '@angular/fire/auth';
import { TranslateService, TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatCardModule, MatListModule, FormsModule, TranslateModule],
  templateUrl: './event-detail.html',
  styleUrl: './event-detail.scss'
})
export class EventDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dataService = inject(DataService);
  public auth = inject(Auth);

  eventId: string = '';
  event$!: Observable<SportEvent>;
  expenses$!: Observable<Expense[]>;
  ADMIN_EMAIL = 'admin@kirol.com';

  resultInput = '';
  incidentsInput = '';
  showResultForm = false;

  user$ = authState(this.auth);

  summary$!: Observable<{ total: number, perPerson: number, isJoined: boolean }>;

  newExpenseDesc = '';
  newExpenseAmount = 0;

  ngOnInit() {
    this.eventId = this.route.snapshot.paramMap.get('id') || '';

    if (this.eventId) {
      this.event$ = this.dataService.getEventById(this.eventId);
      this.expenses$ = this.dataService.getExpenses(this.eventId);

      this.summary$ = combineLatest([
        this.event$,
        this.expenses$,
        this.user$
      ]).pipe(
        map(([event, expenses, user]) => {
          const currentEvent = event as SportEvent;
          const currentExpenses = expenses as Expense[];
          const currentUser = user as User | null;

          // 1. Calcular total
          const total = currentExpenses.reduce((acc: number, curr: Expense) => acc + (curr.amount || 0), 0);

          // 2. Contar participantes
          const count = currentEvent.participants?.length || 0;

          // 3. División equitativa
          const perPerson = count > 0 ? (total / count) : 0;

          // 4. Saber si estoy unido
          const isJoined = currentEvent.participants?.some((p: any) => p.uid === currentUser?.uid) || false;

          return { total, perPerson, isJoined };
        })
      );
    }
  }
  get canDelete(): boolean {
      const user = this.auth.currentUser;
      if (user?.email === this.ADMIN_EMAIL) return true;
      return false;
    }
  deleteEvent() {
      if (confirm('¿Estás seguro de que quieres eliminar este evento y todos sus datos?')) {
        this.dataService.deleteEvent(this.eventId)
          .then(() => {
            alert('Evento eliminado');
            this.router.navigate(['home']);
          })
          .catch(error => alert('Error al borrar: ' + error));
      }
    }
  joinEvent() {
    const user = this.auth.currentUser;
    if (!user || !this.eventId) return;
    const displayName = user.displayName || user.email || 'Anónimo';

    this.dataService.joinEvent(this.eventId, user.uid, displayName)
      .then(() => console.log('Unido'))
      .catch(error => console.error(error));
  }

  addExpense() {
    if (!this.newExpenseDesc || this.newExpenseAmount <= 0) return;

    const user = this.auth.currentUser;
    const nameToShow = user?.displayName || user?.email || 'Anónimo';
    const expense: Expense = {
      description: this.newExpenseDesc,
      amount: this.newExpenseAmount,
      paidBy: nameToShow,
      date: new Date()
    };

    this.dataService.addExpense(this.eventId, expense).then(() => {
      this.newExpenseDesc = '';
      this.newExpenseAmount = 0;
    });
  }

  goBack() {
    this.router.navigate(['home']);
  }
 saveResult() {
    if (!this.eventId) return;

    this.dataService.updateEventResult(this.eventId, this.resultInput, this.incidentsInput)
      .then(() => {
        alert('Resultados actualizados');
        this.showResultForm = false;
      })
      .catch(e => console.error(e));
  }
}
