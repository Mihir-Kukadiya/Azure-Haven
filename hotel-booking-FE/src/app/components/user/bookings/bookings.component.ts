import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingService } from '../../../services/booking.service';

@Component({
    selector: 'app-user-bookings',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './bookings.component.html',
    styleUrls: ['./bookings.component.scss']
})
export class BookingsComponent implements OnInit {
    @Input() userId: string | null = null;
    bookings: any[] = [];

    constructor(private bookingService: BookingService) { }

    ngOnInit(): void {
        if (this.userId) {
            this.bookingService.getBookings().subscribe({
                next: (bookings: any) => {
                    console.log('All bookings:', bookings);

                    // safer filter for string or object userId
                    this.bookings = bookings.filter((b: any) =>
                        b.userId &&
                        (b.userId._id === this.userId || b.userId === this.userId)
                    );

                    console.log('Filtered bookings:', this.bookings);
                },
                error: (err) => {
                    console.error('Failed to fetch bookings', err);
                }
            });
        }
    }

    getStatusColor(status: string): string {
        switch (status) {
            case 'pending': return '#f59e0b';
            case 'confirmed': return '#10b981';
            case 'rejected': return '#ef4444';
            case 'completed': return '#6b7280';
            default: return '#6b7280';
        }
    }

    formatDate(dateString: string): string {
        return new Date(dateString).toLocaleDateString();
    }
}