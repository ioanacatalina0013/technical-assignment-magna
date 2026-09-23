import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { NavShellComponent } from './shared/components/nav-shell/nav-shell.component';

export const routes: Routes = [
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
    path: '',
    component: NavShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'candidates',
        loadComponent: () =>
          import('./features/candidates/candidates-list/candidates-list.component').then(
            (m) => m.CandidateListComponent
          ),
      },
      {
        path: 'candidates/:id',
        loadComponent: () =>
          import('./features/candidates/candidate-detail/candidate-detail.component').then(
            (m) => m.CandidateDetailComponent
          ),
      },
      {
        path: 'sessions',
        loadComponent: () =>
          import('./features/sessions/session-list/session-list.component').then(
            (m) => m.SessionListComponent
          ),
      },
      {
        path: 'sessions/new',
        loadComponent: () =>
          import('./features/sessions/session-form/session-form.component').then(
            (m) => m.SessionFormComponent
          ),
      },
      {
        path: 'sessions/:id/edit',
        loadComponent: () =>
          import('./features/sessions/session-form/session-form.component').then(
            (m) => m.SessionFormComponent
          ),
      },
      {
        path: 'sessions/:id',
        loadComponent: () =>
          import('./features/sessions/session-detail/session-detail.component').then(
            (m) => m.SessionDetailComponent
          ),
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];