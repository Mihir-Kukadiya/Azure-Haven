import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingService } from '../../../services/booking.service';

@Component({
    selector: 'app-user-overview',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './overview.component.html',
    styleUrls: ['./overview.component.scss'] // fixed typo: styleUrls instead of styleUrl
})
export class OverviewComponent implements OnInit, OnChanges {
    @Input() userId: string | null = null;
    @Output() navigate = new EventEmitter<string>();

    userStats = { totalBookings: 0, activeBookings: 0, completedBookings: 0 };
    userBookings: any[] = [];
    private loadedForUserId: string | null = null;

    constructor(private bookingService: BookingService) { }

    ngOnInit(): void {
        if (this.userId) {
            this.loadData();
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['userId'] && this.userId && this.userId !== this.loadedForUserId) {
            this.loadData();
        }
    }

    private loadData(): void {
        if (!this.userId) return;
        this.loadedForUserId = this.userId;

        // Fetch user stats
        this.bookingService.getUserStats(this.userId).subscribe({
            next: (stats) => {
                this.userStats = stats;
            },
            error: () => { }
        });

        // Fetch bookings and filter out completed ones for Recent Bookings
        this.bookingService.getBookings().subscribe({
            next: (bookings) => {
                this.userBookings = bookings
                    .filter((b: any) =>
                        b.userId &&
                        (b.userId._id === this.userId || b.userId === this.userId) 
                        // b.status !== 'completed' // <-- exclude completed bookings here
                    )
                    // .slice(0, 3);
            },
            error: () => { }
        });
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