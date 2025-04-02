const ProfessionalUnassigned = {
    components: {
        'professional-navbar': ProfessionalNavbar
    },
    template: `
    <div>
        <professional-navbar></professional-navbar>
        <div class="container mt-4">
            <h2 class="text-center text-danger mb-4">Unassigned Service Requests</h2>
            
            <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
            
            <div v-if="bookings.length > 0">
                <table class="table table-bordered">
                    <thead class="table-dark">
                        <tr>
                            <th>ID</th>
                            <th>Service</th>
                            <th>Customer</th>
                            <th>Contact</th>
                            <th>Pin Code</th>
                            <th>Date of Request</th>
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
                            <td>{{ booking.remarks || 'None' }}</td>
                            <td>
                                <button @click="acceptBooking(booking.id)" class="btn btn-success btn-sm me-2">Accept</button>
                                <button @click="rejectBooking(booking.id)" class="btn btn-danger btn-sm">Reject</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <div v-else-if="!errorMessage" class="alert alert-info">
                No unassigned service requests available at the moment.
            </div>
        </div>
    </div>`,
    
    data() {
        return {
            bookings: [],
            errorMessage: ''
        };
    },
    
    mounted() {
        this.fetchUnassignedBookings();
    },
    
    methods: {
        async fetchUnassignedBookings() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    this.errorMessage = 'Authentication token is missing. Please log in.';
                    return;
                }
                
                const response = await fetch('/spideyservices/professionals/unassigned', {
                    method: 'GET',
                    headers: {
                        'Authorization': token,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to fetch unassigned bookings');
                }
                
                this.bookings = await response.json();
                this.errorMessage = '';
            } catch (error) {
                this.errorMessage = error.message;
                console.error('Error fetching unassigned bookings:', error);
            }
        },
        
        formatDate(dateString) {
            if (!dateString) return 'N/A';
            const date = new Date(dateString);
            return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        },
        
        async acceptBooking(bookingId) {
            try {
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
                    body: JSON.stringify({ service_status: 'accepted' })
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to accept booking');
                }
                
                // Show success message
                alert('Booking accepted successfully!');
                
                // Refresh the list after successful action
                this.fetchUnassignedBookings();
            } catch (error) {
                this.errorMessage = error.message;
                console.error('Error accepting booking:', error);
            }
        },
        
        async rejectBooking(bookingId) {
            try {
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
                    body: JSON.stringify({ service_status: 'rejected' })
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to reject booking');
                }
                
                // Show success message
                alert('Booking rejected successfully!');
                
                // Refresh the list after successful action
                this.fetchUnassignedBookings();
            } catch (error) {
                this.errorMessage = error.message;
                console.error('Error rejecting booking:', error);
            }
        }
    }
}
