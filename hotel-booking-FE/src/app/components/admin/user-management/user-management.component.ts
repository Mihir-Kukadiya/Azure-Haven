import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../services/toast.service';
import { AuthService } from '../../../services/auth.service';

@Component({
    selector: 'app-user-management',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './user-management.component.html',
    styleUrls: ['./user-management.component.scss'] // <-- fixed here
})
export class UserManagementComponent implements OnInit {
    users: any[] = [];
    isLoading = false;

    constructor(
        private toastService: ToastService,
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        this.loadUsers();
    }

    loadUsers(): void {
        this.isLoading = true;
        this.authService.getUsers().subscribe({
            next: (users) => {
                this.users = users;
                this.isLoading = false;
            },
            error: (error) => {
                this.toastService.error('Error loading users');
                this.isLoading = false;
                this.users = [];
            }
        });
    }

    formatDate(dateString: string): string {
        return new Date(dateString).toLocaleDateString();
    }

    getRoleColor(role: string): string {
        return role === 'admin' ? '#dc2626' : '#059669';
    }
}
