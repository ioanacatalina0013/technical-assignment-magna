import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'candidates',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/candidates/candidates-list/candidates-list.component').then(
        (m) => m.CandidatesListComponent
      ),
  },
  {
    path: 'candidates/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/candidates/candidate-detail/candidate-detail.component').then(
        (m) => m.CandidateDetailComponent
      ),
  },
  {
    path: 'sessions',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/sessions/session-list/session-list.component').then(
        (m) => m.SessionListComponent
      ),
  },
  {
    path: 'sessions/new',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/sessions/session-form/session-form.component').then(
        (m) => m.SessionFormComponent
      ),
  },
  {
    path: 'sessions/:id/edit',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/sessions/session-form/session-form.component').then(
        (m) => m.SessionFormComponent
      ),
  },
  {
    path: 'sessions/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/sessions/session-detail/session-detail.component').then(
        (m) => m.SessionDetailComponent
      ),
  },
  { path: '**', redirectTo: 'dashboard' },
];