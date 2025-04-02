const ProfessionalAssigned = {
    components: {
        'professional-navbar': ProfessionalNavbar
    },
    template: `
    <div>
        <professional-navbar></professional-navbar>
        <div class="container mt-4">
            <h2 class="text-center text-danger mb-4">My Assigned Bookings</h2>
            
            <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
            <div v-if="successMessage" class="alert alert-success">{{ successMessage }}</div>
            
            <div v-if="bookings.length > 0">
                <table class="table table-bordered">
                    <thead class="table-dark">
                        <tr>
                            <th>ID</th>
                            <th>Service</th>
                            <th>Customer</th>
                            <th>Contact</th>
                            <th>Pin Code</th>
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
                            <td>{{ booking.service_name }}</td>
                            <td>{{ booking.customer_name }}</td>
                            <td>{{ booking.customer_phone }}</td>
                            <td>{{ booking.customer_pincode }}</td>
                            <td>{{ formatDate(booking.date_of_request) }}</td>
                            <td>{{ booking.date_of_completion ? formatDate(booking.date_of_completion) : 'Not completed' }}</td>
                            <td>
                                <span :class="getStatusBadgeClass(booking.service_status)">
                                    {{ booking.service_status }}
                                </span>
                            </td>
                            <td>{{ booking.remarks || 'None' }}</td>
                            <td>
                                <button 
                                    v-if="booking.service_status === 'assigned'"
                                    @click="updateBookingStatus(booking.id, 'completed')" 
                                    class="btn btn-success btn-sm">
                                    Mark Completed
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <div v-else-if="!errorMessage" class="alert alert-info">
                You don't have any assigned bookings at the moment.
            </div>
        </div>
    </div>`,
    
    data() {
        return {
            bookings: [],
            errorMessage: '',
            successMessage: ''
        };
    },
    
    mounted() {
        this.fetchAssignedBookings();
    },
    
    methods: {
        async fetchAssignedBookings() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    this.errorMessage = 'Authentication token is missing. Please log in.';
                    return;
                }
                
                const response = await fetch('/spideyservices/professionals/bookings', {
                    method: 'GET',
                    headers: {
                        'Authorization': token,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to fetch assigned bookings');
                }
                
                this.bookings = await response.json();
                this.errorMessage = '';
            } catch (error) {
                this.errorMessage = error.message;
                console.error('Error fetching assigned bookings:', error);
            }
        },
        
        formatDate(dateString) {
            if (!dateString) return 'N/A';
            const date = new Date(dateString);
            return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        },
        
        getStatusBadgeClass(status) {
            const classes = {
                'assigned': 'badge bg-warning',
                'completed': 'badge bg-success',
                'closed': 'badge bg-secondary',
                'requested': 'badge bg-info',
                'rejected': 'badge bg-danger'
            };
            return classes[status] || 'badge bg-primary';
        },
        
        async updateBookingStatus(bookingId, newStatus) {
            try {
                this.successMessage = '';
                this.errorMessage = '';
                
                const token = localStorage.getItem('token');
                if (!token) {
                    this.errorMessage = 'Authentication token is missing. Please log in.';
                    return;
                }
                
                const response = await fetch(`/spideyservices/professionals/bookings/${bookingId}/status`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': token,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ service_status: newStatus })
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || `Failed to update booking status to ${newStatus}`);
                }
                
                const data = await response.json();
                this.successMessage = data.message || `Booking status updated to ${newStatus} successfully`;
                
                // Refresh the bookings list
                setTimeout(() => {
                    this.fetchAssignedBookings();
                }, 1000); // Small delay to ensure backend has processed the update
            } catch (error) {
                this.errorMessage = error.message;
                console.error('Error updating booking status:', error);
            }
        }
    }
};
