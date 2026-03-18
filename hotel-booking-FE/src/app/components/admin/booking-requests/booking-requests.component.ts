import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../services/toast.service';
import { BookingService } from '../../../services/booking.service';

@Component({
    selector: 'app-booking-requests',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './booking-requests.component.html',
    styleUrl: './booking-requests.component.scss'
})
export class BookingRequestsComponent implements OnInit {
    bookings: any[] = [];
    selectedStatus = 'all';
    isLoading = false;
    showStatusConfirm = false;
    actionBooking: any = null;
    actionType: 'approve' | 'reject' = 'approve';

    constructor(
        private toastService: ToastService,
        private bookingService: BookingService
    ) { }

    ngOnInit(): void {
        this.loadBookings();
    }

    loadBookings(): void {
        this.isLoading = true;
        this.bookingService.getBookings().subscribe({
            next: (bookings) => {
                this.bookings = bookings;
                this.isLoading = false;
            },
            error: (error) => {
                this.toastService.error('Error loading bookings');
                this.isLoading = false;
            }
        });
    }

    getFilteredBookings(): any[] {
        if (this.selectedStatus === 'all') {
            return this.bookings;
        }
        return this.bookings.filter(booking => booking.status === this.selectedStatus);
    }

    getPendingBookingsCount(): number {
        return this.bookings.filter(b => b.status === 'pending').length;
    }

    getConfirmedBookingsCount(): number {
        return this.bookings.filter(b => b.status === 'confirmed').length;
    }

    getRejectedBookingsCount(): number {
        return this.bookings.filter(b => b.status === 'rejected').length;
    }

    approveBooking(bookingId: string): void {
        this.actionBooking = this.bookings.find(b => b._id === bookingId);
        this.actionType = 'approve';
        this.showStatusConfirm = true;
    }

    rejectBooking(bookingId: string): void {
        this.actionBooking = this.bookings.find(b => b._id === bookingId);
        this.actionType = 'reject';
        this.showStatusConfirm = true;
    }

    confirmStatusAction(): void {
        if (!this.actionBooking) return;

        const newStatus = this.actionType === 'approve' ? 'confirmed' : 'rejected';

        this.isLoading = true;
        this.bookingService.updateBookingStatus(this.actionBooking._id, newStatus).subscribe({
            next: (updatedBooking) => {
                const index = this.bookings.findIndex(b => b._id === this.actionBooking._id);
                if (index !== -1) {
                    this.bookings[index] = updatedBooking;
                }
                this.toastService.success(`Booking ${this.actionType === 'approve' ? 'approved' : 'rejected'} successfully`);
                this.showStatusConfirm = false;
                this.actionBooking = null;
                this.isLoading = false;
            },
            error: (error) => {
                this.toastService.error(`Error ${this.actionType === 'approve' ? 'approving' : 'rejecting'} booking`);
                this.showStatusConfirm = false;
                this.actionBooking = null;
                this.isLoading = false;
            }
        });
    }

    cancelStatusAction(): void {
        this.showStatusConfirm = false;
        this.actionBooking = null;
    }

    getStatusColor(status: string): string {
        switch (status) {
            case 'pending': return '#f59e0b';
            case 'confirmed': return '#10b981';
            case 'rejected': return '#ef4444';
            default: return '#6b7280';
        }
    }

    getStatusIcon(status: string): string {
        switch (status) {
            case 'pending': return '⏳';
            case 'confirmed': return '✅';
            case 'rejected': return '❌';
            default: return '❓';
        }
    }

    formatDate(dateString: string): string {
        return new Date(dateString).toLocaleDateString();
    }

    formatDateTime(dateString: string): string {
        return new Date(dateString).toLocaleString();
    }

    getDaysDifference(checkIn: string, checkOut: string): number {
        const startDate = new Date(checkIn);
        const endDate = new Date(checkOut);
        const timeDifference = endDate.getTime() - startDate.getTime();
        return Math.ceil(timeDifference / (1000 * 3600 * 24));
    }
}
