import { Injectable } from '@angular/core';
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  updateDoc,
  arrayUnion,
  enableIndexedDbPersistence
} from 'firebase/firestore';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface SportEvent {
  id?: string;
  title: string;
  sport: string;
  date: any;
  location: string;
  createdBy: string;
  participants?: { uid: string, name: string }[];
  sportRules?: string;
  result?: string;
  incidents?: string;
}

export interface Sport {
  id?: string;
  name: string;
  icon: string;
  defaultRules?: string;
}

export interface Expense {
  id?: string;
  description: string;
  amount: number;
  paidBy: string;
  date: any;
}

@Injectable({ providedIn: 'root' })
export class DataService {
  private firestore;

  constructor() {
    const app = getApps().length > 0 ? getApp() : initializeApp(environment.firebase);
    this.firestore = getFirestore(app);

    enableIndexedDbPersistence(this.firestore, { forceOwnership: true })
      .catch((err) => {
        if (err.code == 'failed-precondition') {
            console.warn('Persistencia: Múltiples pestañas abiertas.');
        } else if (err.code == 'unimplemented') {
            console.warn('El navegador no soporta persistencia.');
        } else {
            console.error('Error persistencia:', err);
        }
      });
  }

  // --- 1. AGENDA ---
  getEvents(): Observable<SportEvent[]> {
    return new Observable((observer) => {
      const eventsRef = collection(this.firestore, 'events');
      const q = query(eventsRef, orderBy('date', 'asc'));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const events = snapshot.docs.map(doc => {
          const data = doc.data();
          return { id: doc.id, ...data } as SportEvent;
        });
        observer.next(events);
      }, (error) => {
        console.log("Leyendo eventos offline...");
      });
      return () => unsubscribe();
    });
  }

  addEvent(event: SportEvent) {
    const eventsRef = collection(this.firestore, 'events');
    return addDoc(eventsRef, event);
  }

  getEventById(id: string): Observable<SportEvent> {
    return new Observable((observer) => {
      const docRef = doc(this.firestore, `events/${id}`);
      const unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          observer.next({ id: docSnap.id, ...data } as SportEvent);
        }
      });
      return () => unsubscribe();
    });
  }

  addExpense(eventId: string, expense: Expense) {
    const expensesRef = collection(this.firestore, `events/${eventId}/expenses`);
    return addDoc(expensesRef, expense);
  }

  getExpenses(eventId: string): Observable<Expense[]> {
    return new Observable((observer) => {
      const expensesRef = collection(this.firestore, `events/${eventId}/expenses`);
      const q = query(expensesRef, orderBy('date', 'desc'));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const expenses = snapshot.docs.map(doc => {
          const data = doc.data();
          return { id: doc.id, ...data } as Expense;
        });
        observer.next(expenses);
      });
      return () => unsubscribe();
    });
  }

  getSports(): Observable<Sport[]> {
    const sportsRef = collection(this.firestore, 'sports');
    const q = query(sportsRef, orderBy('name', 'asc'));

    const defaultSports: Sport[] = [
      { id: 'pala', name: 'Pala', icon: 'sports_tennis', defaultRules: '4 personas, 3 partidos a 22 puntos' },
      { id: 'futbol', name: 'Fútbol Sala', icon: 'sports_soccer', defaultRules: '2 partes de 25 min' },
      { id: 'padel', name: 'Pádel', icon: 'sports_tennis', defaultRules: 'Al mejor de 3 sets' },
      { id: 'basket', name: 'Baloncesto', icon: 'sports_basketball', defaultRules: '4 cuartos de 10 min' },
      { id: 'monte', name: 'Monte', icon: 'hiking', defaultRules: 'Ruta libre' }
    ];

    return new Observable((observer) => {
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const customSports = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Sport));
        const allSports = [...defaultSports, ...customSports];
        allSports.sort((a, b) => a.name.localeCompare(b.name));
        observer.next(allSports);
      }, (error) => {
        observer.next(defaultSports);
      });
      return () => unsubscribe();
    });
  }

  addSport(name: string, icon: string = 'sports_score', defaultRules: string = '') {
    const sportsRef = collection(this.firestore, 'sports');
    return addDoc(sportsRef, { name, icon, defaultRules });
  }

  deleteSport(sportId: string) {
    const docRef = doc(this.firestore, `sports/${sportId}`);
    return deleteDoc(docRef);
  }

  deleteEvent(eventId: string) {
    const docRef = doc(this.firestore, `events/${eventId}`);
    return deleteDoc(docRef);
  }

  joinEvent(eventId: string, userId: string, userName: string) {
    const docRef = doc(this.firestore, `events/${eventId}`);
    return updateDoc(docRef, {
      participants: arrayUnion({ uid: userId, name: userName })
    });
  }

  updateEventResult(eventId: string, result: string, incidents: string) {
    const docRef = doc(this.firestore, `events/${eventId}`);
    return updateDoc(docRef, { result, incidents });
  }
}
