import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { HomeComponent } from './home/home';
import { canActivate, redirectUnauthorizedTo, redirectLoggedInTo } from '@angular/fire/auth-guard';
import { EventDetailComponent } from './event-detail/event-detail';
import { OnInit } from '@angular/core';
import { StatsComponent } from './stats/stats';


const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['login']);
const redirectLoggedInToHome = () => redirectLoggedInTo(['home']);

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent,
    ...canActivate(redirectLoggedInToHome)
  },
  {
    path: 'event/:id',
    component: EventDetailComponent,
    ...canActivate(redirectUnauthorizedToLogin)
  },
  {
    path: 'home',
    component: HomeComponent,
    ...canActivate(redirectUnauthorizedToLogin)
  },
  {
      path: 'stats',
      component: StatsComponent,
      ...canActivate(redirectUnauthorizedToLogin)
    }
];
