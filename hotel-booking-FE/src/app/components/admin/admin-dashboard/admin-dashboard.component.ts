import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet, ActivatedRoute } from '@angular/router';
import { ToastService } from '../../../services/toast.service';
import { RoomManagementComponent } from '../room-management/room-management.component';
import { BookingRequestsComponent } from '../booking-requests/booking-requests.component';
import { UserManagementComponent } from '../user-management/user-management.component';
import { RoomService } from '../../../services/room.service';
import { BookingService } from '../../../services/booking.service';
import { AuthService } from '../../../services/auth.service';

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
    imports: [CommonModule, RouterOutlet],
    templateUrl: './admin-dashboard.component.html',
    styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit {
    currentUser: any;
    dashboardStats = {
        totalRooms: 0,
        pendingBookings: 0,
        confirmedBookings: 0,
        totalUsers: 0
    };

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private toastService: ToastService,
        private roomService: RoomService,
        private bookingService: BookingService,
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        this.loadUserData();
        this.checkUserAccess();
        this.loadDashboardStats();
    }

    loadUserData(): void {
        const userData = localStorage.getItem('user');
        if (userData) {
            this.currentUser = JSON.parse(userData);
        }
    }

    checkUserAccess(): void {
        if (!this.currentUser || this.currentUser.role !== 'admin') {
            this.toastService.error('Access denied. Admin privileges required.');
            this.router.navigate(['/login']);
        }
    }

    navigateTo(route: string): void {
        this.router.navigate([`/admin/${route}`]);
    }

    logout(): void {
        this.authService.logout();
        this.toastService.success('Logged out successfully');
        this.router.navigate(['/login']);
    }

    getPageTitle(): string {
        const currentRoute = this.router.url.split('/').pop();
        switch (currentRoute) {
            case 'dashboard': return 'Admin Dashboard';
            case 'rooms': return 'Room Management';
            case 'bookings': return 'Booking Requests';
            case 'users': return 'User Management';
            default: return 'Admin Dashboard';
        }
    }

    getPageDescription(): string {
        const currentRoute = this.router.url.split('/').pop();
        switch (currentRoute) {
            case 'dashboard': return 'Overview of hotel operations and statistics.';
            case 'rooms': return 'Manage hotel rooms, add new rooms, and update existing ones.';
            case 'bookings': return 'Review and manage booking requests from guests.';
            case 'users': return 'View and manage registered user accounts.';
            default: return 'Manage your hotel operations.';
        }
    }

    loadDashboardStats(): void {
        this.roomService.getRooms().subscribe({
            next: (rooms) => {
                this.dashboardStats.totalRooms = rooms.length;
            },
            error: (error) => {
                console.error('Error loading rooms:', error);
            }
        });

        this.bookingService.getBookings().subscribe({
            next: (bookings) => {
                this.dashboardStats.pendingBookings = bookings.filter((b: any) => b.status === 'pending').length;
                this.dashboardStats.confirmedBookings = bookings.filter((b: any) => b.status === 'confirmed').length;
            },
            error: (error) => {
                console.error('Error loading bookings:', error);
            }
        });

        this.authService.getUsers().subscribe({
            next: (users) => {
                this.dashboardStats.totalUsers = users.length;
            },
            error: (error) => {
                console.error('Error loading users:', error);
            }
        });
    }

    getCurrentTime(): Date {
        return new Date();
    }

    isActiveRoute(route: string): boolean {
        return this.router.url.includes(`/admin/${route}`);
    }
}
