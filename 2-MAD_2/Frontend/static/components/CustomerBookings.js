const CustomerBookings = {
    components: {
        'customer-navbar': CustomerNavbar
    },
    template: `
    <div>
        <customer-navbar></customer-navbar>
        <div class="container mt-4">
            <h2 class="text-center text-danger mb-4">My Bookings</h2>
            
            <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
            <div v-if="successMessage" class="alert alert-success">{{ successMessage }}</div>
            
            <div class="mb-3">
                <button @click="goToNewBooking" class="btn btn-primary">Book New Service</button>
            </div>
            
            <!-- Bookings Table -->
            <div v-if="bookings.length > 0">
                <table class="table table-bordered">
                    <thead class="table-dark">
                        <tr>
                            <th>ID</th>
                            <th>Service ID</th>
                            <th>Professional</th>
                            <th>Date Requested</th>
                            <th>Date Completed</th>
                            <th>Status</th>
                            <th>Remarks</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="booking in bookings" :key="booking.id">
                            <td>{{ booking.id }}</td>
                            <td>{{ booking.service_id }}</td>
                            <td>{{ booking.professional_id || 'Unassigned' }}</td>
                            <td>{{ formatDate(booking.date_of_request) }}</td>
                            <td>{{ booking.date_of_completion ? formatDate(booking.date_of_completion) : 'Not completed' }}</td>
                            <td>
                                <span :class="getStatusBadgeClass(booking.service_status)">
                                    {{ booking.service_status }}
                                </span>
                            </td>
                            <td>{{ booking.remarks || 'None' }}</td>
                            <td>
                                <div class="btn-group" role="group">
                                    <button @click="editRemarks(booking)" class="btn btn-sm btn-warning me-1">
                                        Edit Remarks
                                    </button>
                                    <button v-if="booking.service_status !== 'closed'" 
                                        @click="closeBooking(booking.id)" 
                                        class="btn btn-sm btn-danger">
                                        Close
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <div v-else class="alert alert-info">
                You don't have any bookings yet.
            </div>
            
            <!-- Edit Remarks Modal -->
            <div v-if="showEditModal" class="modal show d-block" tabindex="-1" role="dialog">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Edit Remarks</h5>
                            <button type="button" class="btn-close" @click="showEditModal = false"></button>
                        </div>
                        <div class="modal-body">
                            <div class="form-group">
                                <label for="editRemarks">Remarks:</label>
                                <textarea id="editRemarks" v-model="editBooking.remarks" class="form-control" rows="3"></textarea>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" @click="showEditModal = false">Cancel</button>
                            <button type="button" class="btn btn-primary" @click="updateRemarks">Save</button>
                        </div>
                    </div>
                </div>
                <div class="modal-backdrop show"></div>
            </div>
        </div>
    </div>`,
    
    data() {
        return {
            bookings: [],
            editBooking: {
                id: null,
                remarks: ''
            },
            showEditModal: false,
            errorMessage: '',
            successMessage: ''
        };
    },
    
    mounted() {
        this.fetchBookings();
    },
    
    methods: {
        async fetchBookings() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    this.errorMessage = 'Authentication token is missing. Please log in.';
                    return;
                }
                
                const response = await fetch('/spideyservices/customers/bookings', {
                    method: 'GET',
                    headers: {
                        'Authorization': token,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to fetch bookings');
                }
                
                this.bookings = await response.json();
                this.errorMessage = '';
            } catch (error) {
                this.errorMessage = error.message;
                console.error('Error fetching bookings:', error);
            }
        },
        
        editRemarks(booking) {
            this.editBooking = {
                id: booking.id,
                remarks: booking.remarks || ''
            };
            this.showEditModal = true;
        },
        
        async updateRemarks() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    this.errorMessage = 'Authentication token is missing. Please log in.';
                    return;
                }
                
                const response = await fetch(`/spideyservices/customers/bookings/${this.editBooking.id}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': token,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({ remarks: this.editBooking.remarks })
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to update remarks');
                }
                
                const data = await response.json();
                this.successMessage = data.message || 'Remarks updated successfully';
                this.showEditModal = false;
                
                // Update the booking in the local list
                const bookingIndex = this.bookings.findIndex(b => b.id === this.editBooking.id);
                if (bookingIndex !== -1) {
                    this.bookings[bookingIndex].remarks = this.editBooking.remarks;
                }
                
                // Refresh the list after a short delay
                setTimeout(() => {
                    this.fetchBookings();
                    this.successMessage = '';
                }, 2000);
            } catch (error) {
                this.errorMessage = error.message;
                console.error('Error updating remarks:', error);
            }
        },
        
        async closeBooking(bookingId) {
            if (!confirm('Are you sure you want to close this booking?')) {
                return;
            }
            
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    this.errorMessage = 'Authentication token is missing. Please log in.';
                    return;
                }
                
                const response = await fetch(`/spideyservices/customers/bookings/${bookingId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': token,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to close booking');
                }
                
                const data = await response.json();
                this.successMessage = data.message || 'Booking closed successfully';
                
                // Update the booking status in the local list
                const bookingIndex = this.bookings.findIndex(b => b.id === bookingId);
                if (bookingIndex !== -1) {
                    this.bookings[bookingIndex].service_status = 'closed';
                }
                
                // Refresh the list after a short delay
                setTimeout(() => {
                    this.fetchBookings();
                    this.successMessage = '';
                }, 2000);
            } catch (error) {
                this.errorMessage = error.message;
                console.error('Error closing booking:', error);
            }
        },
        
        goToNewBooking() {
            this.$router.push('/spideyservices/customers/bookings/new');
        },
        
        formatDate(dateString) {
            if (!dateString) return 'N/A';
            const date = new Date(dateString);
            return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        },
        
        getStatusBadgeClass(status) {
            const classes = {
                'requested': 'badge bg-info',
                'assigned': 'badge bg-warning',
                'completed': 'badge bg-success',
                'closed': 'badge bg-secondary',
                'rejected': 'badge bg-danger'
            };
            return classes[status] || 'badge bg-primary';
        }
    }
};
