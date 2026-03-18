import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ToastService } from '../../../services/toast.service';
import { RoomService } from '../../../services/room.service';
import { BookingService } from '../../../services/booking.service';
import { AuthService } from '../../../services/auth.service';
import { BookingFormComponent } from '../booking-form/booking-form.component';
import { RoomsComponent } from '../rooms/rooms.component';
import { BookingsComponent } from '../bookings/bookings.component';
import { ProfileComponent } from '../profile/profile.component';
import { first } from 'rxjs/operators';
import { OverviewComponent } from '../overview/overview.component';

@Component({
    selector: 'app-user-dashboard',
    standalone: true,
    imports: [CommonModule, BookingFormComponent, OverviewComponent, RoomsComponent, BookingsComponent, ProfileComponent],
    templateUrl: './user-dashboard.component.html',
    styleUrl: './user-dashboard.component.scss'
})
export class UserDashboardComponent implements OnInit {
    currentUser: any;
    activeTab: string = 'dashboard';
    userStats = {
        totalBookings: 0,
        activeBookings: 0,
        completedBookings: 0
    };
    availableRooms: any[] = [];
    userBookings: any[] = [];
    isLoading = false;
    showBookingForm = false;
    selectedRoom: any = null;

    constructor(
        private router: Router,
        private toastService: ToastService,
        private roomService: RoomService,
        private bookingService: BookingService,
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        this.loadUserData();
        this.loadAvailableRooms();
    }

loadUserData(): void {
  const localData = localStorage.getItem('user');
  if (!localData) {
    this.toastService.error('No user data found. Please login again.');
    this.router.navigate(['/login']);
    return;
  }

  const localUser = JSON.parse(localData);
  const userId = localUser._id || localUser.id;

  this.authService.getUserById(userId).pipe(first()).subscribe({
    next: (user) => {
      this.currentUser = user;
      localStorage.setItem('user', JSON.stringify(user));
    },
    error: (err) => {
      console.error(err);
      this.currentUser = localUser; // fallback
    }
  });
}

    checkUserAccess(): void {
        if (!this.currentUser || this.currentUser.role !== 'user') {
            this.toastService.error('Access denied. User privileges required.');
            this.router.navigate(['/login']);
        }
    }

    setActiveTab(tab: string): void {
        this.activeTab = tab;
    }

    logout(): void {
        this.authService.logout();
        this.toastService.success('Logged out successfully');
        this.router.navigate(['/login']);
    }

    getPageTitle(): string {
        switch (this.activeTab) {
            case 'dashboard': return 'Welcome to Azure Haven';
            case 'rooms': return 'Available Rooms';
            case 'bookings': return 'My Bookings';
            case 'profile': return 'My Profile';
            default: return 'Dashboard';
        }
    }

    getPageDescription(): string {
        switch (this.activeTab) {
            case 'dashboard': return 'Discover luxury accommodations and book your perfect stay.';
            case 'rooms': return 'Browse our available rooms and find your ideal accommodation.';
            case 'bookings': return 'View and manage your booking history.';
            case 'profile': return 'Update your personal information and preferences.';
            default: return 'Manage your hotel experience.';
        }
    }

    loadUserStats(): void {
        this.bookingService.getBookings().subscribe({
            next: (bookings) => {
                const userBookings = bookings.filter((b: any) => b.userId === (this.currentUser?._id || this.currentUser?.id));
                this.userStats.totalBookings = userBookings.length;
                this.userStats.activeBookings = userBookings.filter((b: any) => b.status === 'confirmed').length;
                this.userStats.completedBookings = userBookings.filter((b: any) => b.status === 'completed').length;
            },
            error: () => { }
        });
    }

    loadAvailableRooms(): void {
        this.isLoading = true;
        this.roomService.getRooms().subscribe({
            next: (rooms) => {
                this.availableRooms = rooms.filter((room: any) => room.status === 'available');
                this.isLoading = false;
            },
            error: () => {
                this.toastService.error('Error loading rooms');
                this.isLoading = false;
            }
        });
    }

    loadUserBookings(): void {
        this.bookingService.getBookings().subscribe({
            next: (bookings) => {
                console.log(bookings);

                this.userBookings = bookings.filter((b: any) => b.userId === (this.currentUser?._id || this.currentUser?.id));
            },
            error: () => { }
        });
    }

    bookRoom(room: any): void {
        this.selectedRoom = room;
        this.showBookingForm = true;
    }

    onBookingSubmitted(_: any): void {
        this.showBookingForm = false;
        this.selectedRoom = null;
        this.loadUserBookings();
        this.loadUserStats();
    }

    onBookingCancelled(): void {
        this.showBookingForm = false;
        this.selectedRoom = null;
    }

    getCurrentTime(): Date {
        return new Date();
    }
}
