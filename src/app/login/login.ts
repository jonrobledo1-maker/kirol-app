import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { FormsModule } from '@angular/forms';
import { Auth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { TranslateService, TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [MatButtonModule, MatInputModule, MatFormFieldModule, MatCardModule, FormsModule, TranslateModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {
  public auth = inject(Auth);
  private router = inject(Router);
  public translate = inject(TranslateService);

  // Variables para guardar lo que escribe el usuario
  email = '';
  password = '';
  displayName = '';

  //Login Google
  async loginWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(this.auth, provider);
      this.router.navigate(['home']);
    } catch (error) {
      console.error(error);
      alert('Error con Google');
    }
  }

  // 2. Login con email y pass
  async loginWithEmail() {
    try {
      await signInWithEmailAndPassword(this.auth, this.email, this.password);
      this.router.navigate(['home']);
    } catch (error: any) {
      console.error(error);
      // Mensajes de error
      if (error.code === 'auth/invalid-credential') {
        alert('Correo o contraseña incorrectos');
      } else {
        alert('Error al entrar: ' + error.message);
      }
    }
  }

  // 3. Registrarse
  async registerWithEmail() {
    if (!this.displayName) {
      alert('Por favor, introduce tu nombre');
      return;
    }
    try {
      await createUserWithEmailAndPassword(this.auth, this.email, this.password);
      // Al registrarse, Firebase loguea automáticamente, ir a home
      alert('Cuenta creada con éxito. ¡Bienvenido ' + this.displayName + '!');
      this.router.navigate(['home']);
    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/email-already-in-use') {
        alert('Ese correo ya está registrado');
      } else if (error.code === 'auth/weak-password') {
        alert('La contraseña debe tener al menos 6 caracteres');
      } else {
        alert('Error al registrar: ' + error.message);
      }
    }
  }
  // Cambiar idioma en pantalla login
  switchLanguage(lang: string) {
    this.translate.use(lang);
    localStorage.setItem('language', lang);
  }
}
