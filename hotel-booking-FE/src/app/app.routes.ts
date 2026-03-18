import { Routes } from '@angular/router';
import { RegisterComponent } from './components/register/register.component';
import { LoginComponent } from './components/login/login.component';
import { AdminDashboardComponent } from './components/admin/admin-dashboard/admin-dashboard.component';
import { AdminOverviewComponent } from './components/admin/admin-overview/admin-overview.component';
import { RoomManagementComponent } from './components/admin/room-management/room-management.component';
import { BookingRequestsComponent } from './components/admin/booking-requests/booking-requests.component';
import { UserManagementComponent } from './components/admin/user-management/user-management.component';
import { UserDashboardComponent } from './components/user/user-dashboard/user-dashboard.component';

export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'register', component: RegisterComponent },
    { path: 'login', component: LoginComponent },
    {
        path: 'admin',
        component: AdminDashboardComponent,
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', component: AdminOverviewComponent },
            { path: 'rooms', component: RoomManagementComponent },
            { path: 'bookings', component: BookingRequestsComponent },
            { path: 'users', component: UserManagementComponent }
        ]
    },
    { path: 'user', component: UserDashboardComponent },
];
