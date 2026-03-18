import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RoomService } from '../../../services/room.service';
import { BookingService } from '../../../services/booking.service';
import { AuthService } from '../../../services/auth.service';

@Component({
    selector: 'app-admin-overview',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './admin-overview.component.html',
    styleUrl: './admin-overview.component.scss'
})
export class AdminOverviewComponent implements OnInit {
    dashboardStats = {
        totalRooms: 0,
        pendingBookings: 0,
        confirmedBookings: 0,
        rejectedBookings: 0,
        totalUsers: 0
    };

    constructor(
        private router: Router,
        private roomService: RoomService,
        private bookingService: BookingService,
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        this.loadDashboardStats();
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
                this.dashboardStats.rejectedBookings = bookings.filter((b: any) => b.status === 'rejected').length;
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

    navigateTo(route: string): void {
        this.router.navigate([`/admin/${route}`]);
    }
}
