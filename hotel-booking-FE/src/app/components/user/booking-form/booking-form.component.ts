import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../services/toast.service';
import { BookingService } from '../../../services/booking.service';
import { AuthService } from '../../../services/auth.service';

@Component({
    selector: 'app-booking-form',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './booking-form.component.html',
    styleUrl: './booking-form.component.scss'
})
export class BookingFormComponent {
    @Input() room: any;
    @Input() currentUser: any;
    @Output() bookingSubmitted = new EventEmitter<any>();
    @Output() cancelled = new EventEmitter<void>();

    bookingData = {
        checkIn: '',
        checkOut: '',
        guests: 1,
        specialRequests: ''
    };

    isLoading = false;
    minDate = new Date().toISOString().split('T')[0];

    constructor(
        private bookingService: BookingService,
        private toastService: ToastService
    ) { }

    onSubmit(): void {
        console.log('currentUser in booking form:', this.currentUser);
        if (!this.currentUser || !this.currentUser._id) {
            this.toastService.error('User information is missing. Please log in again.');
            return;
        }
        if (!this.validateForm()) {
            return;
        }

        this.isLoading = true;

        const bookingPayload = {
            userId: this.currentUser._id,
            roomId: this.room._id,
            checkIn: new Date(this.bookingData.checkIn),
            checkOut: new Date(this.bookingData.checkOut),
            guests: this.bookingData.guests,
            totalPrice: this.calculateTotalPrice(),
            specialRequests: this.bookingData.specialRequests,
            status: 'pending'
        };

        this.bookingService.createBooking(bookingPayload).subscribe({
            next: (booking) => {
                this.toastService.success('Booking request submitted successfully!');
                this.bookingSubmitted.emit(booking);
                this.isLoading = false;
            },
            error: (error) => {
                this.toastService.error('Error submitting booking request');
                this.isLoading = false;
            }
        });
    }

    validateForm(): boolean {
        if (!this.bookingData.checkIn || !this.bookingData.checkOut) {
            this.toastService.error('Please select check-in and check-out dates');
            return false;
        }

        if (new Date(this.bookingData.checkIn) >= new Date(this.bookingData.checkOut)) {
            this.toastService.error('Check-out date must be after check-in date');
            return false;
        }

        if (this.bookingData.guests < 1 || this.bookingData.guests > this.room.capacity) {
            this.toastService.error(`Number of guests must be between 1 and ${this.room.capacity}`);
            return false;
        }

        return true;
    }

    calculateTotalPrice(): number {
        if (!this.bookingData.checkIn || !this.bookingData.checkOut) {
            return 0;
        }

        const checkIn = new Date(this.bookingData.checkIn);
        const checkOut = new Date(this.bookingData.checkOut);
        const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

        return nights * this.room.price;
    }

    getNumberOfNights(): number {
        if (!this.bookingData.checkIn || !this.bookingData.checkOut) {
            return 0;
        }

        const checkIn = new Date(this.bookingData.checkIn);
        const checkOut = new Date(this.bookingData.checkOut);
        return Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    }

    onCancel(): void {
        this.cancelled.emit();
    }

    updateCheckOutMinDate(): void {
        if (this.bookingData.checkIn) {
            const checkInDate = new Date(this.bookingData.checkIn);
            const nextDay = new Date(checkInDate);
            nextDay.setDate(nextDay.getDate() + 1);
            this.bookingData.checkOut = '';
        }
    }
}
