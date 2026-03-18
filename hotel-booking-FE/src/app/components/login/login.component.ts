import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent {
    credentials = {
        username: '',
        password: ''
    };

    isLoading = false;
    showPassword = false;

    constructor(
        private authService: AuthService,
        private router: Router,
        private toastService: ToastService
    ) { }

    onSubmit(): void {
        if (!this.credentials.username || !this.credentials.password) {
            this.toastService.error('Please fill in all fields');
            return;
        }

        if (this.credentials.password.length < 6) {
            this.toastService.error('Password must be at least 6 characters long');
            return;
        }

        this.isLoading = true;

        this.authService.login(this.credentials).subscribe({
            next: (response) => {
                console.log('Login successful:', response);

                // Store user info and token
                localStorage.setItem('user', JSON.stringify(response.user));
                localStorage.setItem('token', response.token);

                this.toastService.success('Login successful!');

                if (response.user.role === 'admin') {
                    this.router.navigate(['/admin']);
                } else {
                    this.router.navigate(['/user']);
                }

                this.isLoading = false;
            },
            error: (error) => {
                this.toastService.error(error.error?.message || 'Login failed');
                this.isLoading = false;
            }
        });
    }

    togglePasswordVisibility(): void {
        this.showPassword = !this.showPassword;
    }
}
