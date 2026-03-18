import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoomService } from '../../../services/room.service';
import { BookingService } from '../../../services/booking.service';
import { forkJoin } from 'rxjs';

@Component({
    selector: 'app-user-rooms',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './rooms.component.html',
    styleUrl: './rooms.component.scss'
})
export class RoomsComponent implements OnInit {
    rooms: any[] = [];
    isLoading: boolean = false;
    @Output() bookRoom = new EventEmitter<any>();

    constructor(
        private roomService: RoomService,
        private bookingService: BookingService
    ) { }

    ngOnInit(): void {
        this.isLoading = true;
        forkJoin({
            rooms: this.roomService.getRooms(),
            bookings: this.bookingService.getBookings()
        }).subscribe({
            next: ({ rooms, bookings }) => {
                const bookedRoomIds = new Set(
                    bookings
                        .filter((booking: any) => booking.status === 'pending' || booking.status === 'confirmed')
                        .map((booking: any) => {
                            if (typeof booking.roomId === 'string') {
                                return booking.roomId;
                            }
                            return booking.roomId?._id;
                        })
                        .filter(Boolean)
                );

                this.rooms = rooms.filter(
                    (room: any) => room.status === 'available' && !bookedRoomIds.has(room._id)
                );
                this.isLoading = false;
            },
            error: () => {
                this.isLoading = false;
            }
        });
    }
}
