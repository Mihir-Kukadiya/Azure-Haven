import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class RoomService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    getRooms(): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/rooms`);
    }

    getRoom(id: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/rooms/${id}`);
    }

    createRoom(roomData: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/rooms`, roomData);
    }

    updateRoom(id: string, roomData: any): Observable<any> {
        return this.http.patch<any>(`${this.apiUrl}/rooms/${id}`, roomData);
    }

    deleteRoom(id: string): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/rooms/${id}`);
    }
}
