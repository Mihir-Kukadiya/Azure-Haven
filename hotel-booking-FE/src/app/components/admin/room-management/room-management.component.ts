import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { ToastService } from '../../../services/toast.service';
import { RoomService } from '../../../services/room.service';

@Component({
    selector: 'app-room-management',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './room-management.component.html',
    styleUrl: './room-management.component.scss'
})
export class RoomManagementComponent implements OnInit, OnDestroy {
    rooms: any[] = [];
    filteredRooms: any[] = [];
    showAddForm = false;
    editingRoom: any | null = null;
    showDeleteConfirm = false;
    roomToDelete: string | null = null;
    isLoading = false;
    selectedFilter = 'all';
    searchTerm = '';

    private searchSubject = new Subject<string>();
    private destroy$ = new Subject<void>();

    newRoom: any = {
        roomNumber: '',
        type: '',
        price: '',
        capacity: '',
        amenities: '',
        status: 'available'
    };

    readonly roomTypeDefaults: Record<string, { price: number; capacity: number }> = {
        'Standard Single': { price: 2500, capacity: 1 },
        'Standard Double': { price: 3500, capacity: 2 },
        'Deluxe Room': { price: 5000, capacity: 3 },
        'Suite': { price: 8000, capacity: 4 },
        'Presidential Suite': { price: 15000, capacity: 6 }
    };

    readonly roomTypes = Object.keys(this.roomTypeDefaults);

    readonly statusOptions = [
        { value: 'available', label: 'Available', color: '#10b981' },
        { value: 'occupied', label: 'Occupied', color: '#ef4444' },
        { value: 'maintenance', label: 'Maintenance', color: '#f59e0b' }
    ] as const;

    constructor(
        private toastService: ToastService,
        private roomService: RoomService
    ) {
        // Setup debounced search
        this.searchSubject.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            takeUntil(this.destroy$)
        ).subscribe(searchTerm => {
            this.searchTerm = searchTerm;
            this.applyFilters();
        });
    }

    ngOnInit(): void {
        this.loadRooms();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    loadRooms(): void {
        this.isLoading = true;
        this.roomService.getRooms()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (rooms) => {
                    this.rooms = rooms;
                    this.applyFilters();
                    this.isLoading = false;
                },
                error: (error) => {
                    console.error('Error loading rooms:', error);
                    this.toastService.error('Failed to load rooms. Please try again.');
                    this.isLoading = false;
                }
            });
    }

    applyFilters(): void {
        let filtered = [...this.rooms];

        // Filter by status
        if (this.selectedFilter !== 'all') {
            filtered = filtered.filter(room => room.status === this.selectedFilter);
        }

        // Filter by search term
        if (this.searchTerm.trim()) {
            const searchLower = this.searchTerm.toLowerCase();
            filtered = filtered.filter(room =>
                room.roomNumber.toLowerCase().includes(searchLower) ||
                room.type.toLowerCase().includes(searchLower) ||
                room.amenities?.toLowerCase().includes(searchLower)
            );
        }

        this.filteredRooms = filtered;
    }

    onSearchChange(searchTerm: string): void {
        this.searchSubject.next(searchTerm);
    }

    onFilterChange(): void {
        this.applyFilters();
    }

    getFilteredRooms(): any[] {
        return this.filteredRooms;
    }

    getRoomStats(): any {
        return {
            total: this.rooms.length,
            available: this.rooms.filter(room => room.status === 'available').length,
            occupied: this.rooms.filter(room => room.status === 'occupied').length,
            maintenance: this.rooms.filter(room => room.status === 'maintenance').length
        };
    }

    private validateForm(): boolean {
        const { roomNumber, type, price, capacity } = this.newRoom;

        if (!roomNumber.trim()) {
            this.toastService.error('Room number is required');
            return false;
        }

        // Room number format validation
        const roomNumberPattern = /^[A-Za-z0-9]+$/;
        if (!roomNumberPattern.test(roomNumber.trim())) {
            this.toastService.error('Room number should contain only letters and numbers');
            return false;
        }

        if (!type.trim()) {
            this.toastService.error('Room type is required');
            return false;
        }

        const priceNum = parseFloat(price);
        if (!price || isNaN(priceNum) || priceNum <= 0) {
            this.toastService.error('Valid price is required');
            return false;
        }

        const capacityNum = parseInt(capacity);
        if (!capacity || isNaN(capacityNum) || capacityNum <= 0 || capacityNum > 10) {
            this.toastService.error('Valid capacity (1-10) is required');
            return false;
        }

        // Check for duplicate room number
        const existingRoom = this.rooms.find(room =>
            room.roomNumber.toLowerCase() === roomNumber.toLowerCase().trim() &&
            room._id !== this.editingRoom?._id
        );

        if (existingRoom) {
            this.toastService.error(`Room number "${roomNumber}" already exists`);
            return false;
        }

        return true;
    }

    addRoom(): void {
        if (!this.validateForm()) {
            return;
        }

        const selectedTypeDefaults = this.roomTypeDefaults[this.newRoom.type];
        const roomData = {
            roomNumber: this.newRoom.roomNumber.trim(),
            type: this.newRoom.type,
            price: selectedTypeDefaults.price,
            capacity: selectedTypeDefaults.capacity,
            amenities: this.newRoom.amenities.trim(),
            status: this.newRoom.status
        };

        this.isLoading = true;
        this.roomService.createRoom(roomData)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (room) => {
                    this.rooms.push(room);
                    this.applyFilters();
                    this.resetForm();
                    this.showAddForm = false;
                    this.toastService.success(`Room ${room.roomNumber} added successfully`);
                    this.isLoading = false;
                },
                error: (error) => {
                    console.error('Error adding room:', error);
                    this.handleApiError(error, 'Failed to add room');
                    this.isLoading = false;
                }
            });
    }

    editRoom(room: any): void {
        const selectedTypeDefaults = this.roomTypeDefaults[room.type];
        this.editingRoom = { ...room };
        this.newRoom = {
            roomNumber: room.roomNumber,
            type: room.type,
            price: selectedTypeDefaults ? selectedTypeDefaults.price.toString() : room.price.toString(),
            capacity: selectedTypeDefaults ? selectedTypeDefaults.capacity.toString() : room.capacity.toString(),
            amenities: room.amenities || '',
            status: room.status
        };
        this.showAddForm = true;

        // Scroll to form
        setTimeout(() => {
            document.querySelector('.form-container')?.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }, 100);
    }

    updateRoom(): void {
        if (!this.validateForm() || !this.editingRoom) {
            return;
        }

        const selectedTypeDefaults = this.roomTypeDefaults[this.newRoom.type];
        const roomData = {
            roomNumber: this.newRoom.roomNumber.trim(),
            type: this.newRoom.type,
            price: selectedTypeDefaults.price,
            capacity: selectedTypeDefaults.capacity,
            amenities: this.newRoom.amenities.trim(),
            status: this.newRoom.status
        };

        this.isLoading = true;
        this.roomService.updateRoom(this.editingRoom._id, roomData)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (updatedRoom) => {
                    const index = this.rooms.findIndex(r => r._id === this.editingRoom!._id);
                    if (index !== -1) {
                        this.rooms[index] = updatedRoom;
                        this.applyFilters();
                    }
                    this.resetForm();
                    this.showAddForm = false;
                    this.editingRoom = null;
                    this.toastService.success(`Room ${updatedRoom.roomNumber} updated successfully`);
                    this.isLoading = false;
                },
                error: (error) => {
                    console.error('Error updating room:', error);
                    this.handleApiError(error, 'Failed to update room');
                    this.isLoading = false;
                }
            });
    }

    deleteRoom(roomId: string): void {
        const room = this.rooms.find(r => r._id === roomId);
        if (room?.status === 'occupied') {
            this.toastService.error('Cannot delete occupied room. Please check out the guest first.');
            return;
        }

        this.roomToDelete = roomId;
        this.showDeleteConfirm = true;
    }

    confirmDelete(): void {
        if (!this.roomToDelete) {
            return;
        }

        const roomToDelete = this.rooms.find(r => r._id === this.roomToDelete);

        this.isLoading = true;
        this.roomService.deleteRoom(this.roomToDelete)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.rooms = this.rooms.filter(r => r._id !== this.roomToDelete);
                    this.applyFilters();
                    this.toastService.success(`Room ${roomToDelete?.roomNumber} deleted successfully`);
                    this.showDeleteConfirm = false;
                    this.roomToDelete = null;
                    this.isLoading = false;
                },
                error: (error) => {
                    console.error('Error deleting room:', error);
                    this.handleApiError(error, 'Failed to delete room');
                    this.showDeleteConfirm = false;
                    this.roomToDelete = null;
                    this.isLoading = false;
                }
            });
    }

    private handleApiError(error: any, defaultMessage: string): void {
        const message = error?.error?.message || error?.message || defaultMessage;
        this.toastService.error(`${message}. Please try again.`);
    }

    cancelDelete(): void {
        this.showDeleteConfirm = false;
        this.roomToDelete = null;
    }

    cancelEdit(): void {
        this.resetForm();
        this.showAddForm = false;
        this.editingRoom = null;
    }

    resetForm(): void {
        this.newRoom = {
            roomNumber: '',
            type: '',
            price: '',
            capacity: '',
            amenities: '',
            status: 'available'
        };
    }

    onRoomTypeChange(selectedType: string): void {
        const selectedTypeDefaults = this.roomTypeDefaults[selectedType];
        if (!selectedTypeDefaults) {
            this.newRoom.price = '';
            this.newRoom.capacity = '';
            return;
        }

        this.newRoom.price = selectedTypeDefaults.price.toString();
        this.newRoom.capacity = selectedTypeDefaults.capacity.toString();
    }

    getStatusColor(status: string): string {
        const statusOption = this.statusOptions.find(option => option.value === status);
        return statusOption?.color || '#6b7280';
    }

    formatDate(dateString: string): string {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    formatPrice(price: number): string {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0
        }).format(price);
    }

    clearSearch(): void {
        this.searchTerm = '';
        this.applyFilters();
    }

    clearFilters(): void {
        this.selectedFilter = 'all';
        this.searchTerm = '';
        this.applyFilters();
    }

    trackByRoomId(index: number, room: any): string {
        return room._id;
    }
}
