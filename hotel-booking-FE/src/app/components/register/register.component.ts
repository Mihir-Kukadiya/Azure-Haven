import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: './register.component.html',
    styleUrl: './register.component.scss'
})
export class RegisterComponent {
    userData = {
        username: '',
        password: '',
        email: '',
        phone: '',
        city: '',
        role: 'user'
    };

    isLoading = false;
    showPassword = false;

    constructor(
        private authService: AuthService,
        private router: Router,
        private toastService: ToastService
    ) { }

    onSubmit(): void {
        if (!this.userData.username || !this.userData.password || !this.userData.email || !this.userData.phone || !this.userData.city) {
            this.toastService.error('Please fill in all fields');
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(this.userData.email)) {
            this.toastService.error('Please enter a valid email address');
            return;
        }

        // Password strength validation
        if (this.userData.password.length < 6) {
            this.toastService.error('Password must be at least 6 characters long');
            return;
        }

        this.isLoading = true;

        this.authService.register(this.userData).subscribe({
            next: (response) => {
                console.log('Registration successful:', response);
                this.toastService.success('Registration successful! Please login.');
                this.router.navigate(['/login']);
            },
            error: (error) => {
                this.toastService.error(error.error?.message || 'Registration failed');
                this.isLoading = false;
            }
        });
    }

    togglePasswordVisibility(): void {
        this.showPassword = !this.showPassword;
    }
}
