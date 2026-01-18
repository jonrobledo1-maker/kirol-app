import { Component, inject } from '@angular/core';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { CommonModule, AsyncPipe  } from '@angular/common';
import { TranslateService, TranslateModule } from '@ngx-translate/core';


@Component({
  selector: 'app-event-form',
  standalone: true,
  imports: [
    MatDialogModule, MatButtonModule, MatInputModule,
    MatSelectModule, MatDatepickerModule, FormsModule,
    CommonModule, AsyncPipe, MatIconModule, TranslateModule
  ],
  templateUrl: './event-form.html',
  styleUrl: './event-form.scss'
})
export class EventFormComponent {
  private dialogRef = inject(MatDialogRef<EventFormComponent>);
  private dataService = inject(DataService);

  // Cargamos la lista de deportes
  sports$ = this.dataService.getSports();

  // Datos del formulario
  formData = {
    title: '',
    sport: '',
    location: '',
    date: new Date()
  };

  close() {
    this.dialogRef.close();
  }

  save() {
    // Validar que haya datos básicos
    if (!this.formData.title || !this.formData.sport) {
      alert('Rellena al menos el título y el deporte');
      return;
    }
    this.dialogRef.close(this.formData);
  }
}
