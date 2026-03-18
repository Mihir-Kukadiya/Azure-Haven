import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';

@Component({
    selector: 'app-user-profile',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './profile.component.html',
    styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
    @Input() userId: string | null = null;
    currentUser: any;

    constructor(private authService: AuthService) { }

    ngOnInit(): void {
        if (this.userId) {
            this.authService.getUserById(this.userId).subscribe({
                next: (user: any) => this.currentUser = user,
                error: () => { }
            });
        }
    }

    formatDate(dateString: string): string {
        return new Date(dateString).toLocaleDateString();
    }
}
