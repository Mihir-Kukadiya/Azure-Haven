import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class BookingService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    getBookings(): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/bookings`);
    }

    getBooking(id: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/bookings/${id}`);
    }

    createBooking(bookingData: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/bookings`, bookingData);
    }

    updateBookingStatus(id: string, status: string): Observable<any> {
        return this.http.patch<any>(`${this.apiUrl}/bookings/${id}/status`, { status });
    }

    deleteBooking(id: string): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/bookings/${id}`);
    }

    getUserStats(userId: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/bookings/stats/${userId}`);
    }
}
