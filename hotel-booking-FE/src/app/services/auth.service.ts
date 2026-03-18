import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // --- Existing methods ---
  register(userData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/register`, userData);
  }

  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/login`, credentials);
  }

  logout(): void {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }

  // ✅ Place the getUsers() method here
  getUsers(): Observable<any> {
    const token = localStorage.getItem('token'); // token from login
    if (!token) {
      throw new Error('No token found. Please login.');
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<any>(`${this.apiUrl}/auth/users`, { headers });
  }
getUserById(id: string) {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No token found. Please login.');

  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });

  return this.http.get<any>(`${this.apiUrl}/users/${id}`, { headers });
}

  static getCurrentUser(): { id: string, username: string, role: string } | null {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user && user.id && user.username && user.role) {
          return user;
        }
      } catch (e) {}
    }
    return null;
  }
}
