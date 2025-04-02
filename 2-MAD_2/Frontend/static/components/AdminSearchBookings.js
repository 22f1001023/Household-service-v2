const AdminSearchBookings = {
    components: {
        'admin-navbar': AdminNavbar
    },
    template: `
    <div>
        <!-- Include Admin Navbar -->
        <admin-navbar></admin-navbar>

        <!-- Service Bookings Content -->
        <div class="container mt-4">
            <h2>Service Bookings</h2>

            <!-- Error Message -->
            <div v-if="errorMessage" class="alert alert-danger mt-3">{{ errorMessage }}</div>

            <!-- Bookings Table -->
            <div v-if="bookings.length > 0" class="mt-4">
                <table class="table table-bordered">
                    <thead class="table-dark">
                        <tr>
                            <th>ID</th>
                            <th>Service ID</th>
                            <th>Customer ID</th>
                            <th>Professional ID</th>
                            <th>Date of Request</th>
                            <th>Date of Completion</th>
                            <th>Status</th>
                            <th>Remarks</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="booking in bookings" :key="booking.id">
                            <td>{{ booking.id }}</td>
                            <td>{{ booking.service_id }}</td>
                            <td>{{ booking.customer_id }}</td>
                            <td>{{ booking.professional_id || 'Unassigned' }}</td>
                            <td>{{ formatDate(booking.date_of_request) }}</td>
                            <td>{{ formatDate(booking.date_of_completion) || 'Pending' }}</td>
                            <td>{{ booking.service_status }}</td>
                            <td>{{ booking.remarks || 'None' }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- No Bookings Message -->
            <div v-if="bookings.length === 0 && !errorMessage" class="alert alert-info mt-3">
                No bookings found.
            </div>
        </div>
    </div>`,

    data() {
        return {
            bookings: [], // List of all bookings
            errorMessage: '' // Error message, if any
        };
    },

    mounted() {
        this.fetchBookings();
    },

    methods: {
        // Fetch All Bookings API
        async fetchBookings() {
            try {
                const token = localStorage.getItem('token');
                if (!token) throw new Error('Authentication token is missing. Please log in.');

                const response = await fetch('/spideyservices/admin/bookings', {
                    method: 'GET',
                    headers: { 'Authorization': `${token}`, 'Content-Type': 'application/json' }
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to fetch bookings.');
                }

                this.bookings = await response.json();
                this.errorMessage = '';
            } catch (error) {
                this.errorMessage = error.message;
                this.bookings = [];
            }
        },

        // Format Date for Display
        formatDate(dateString) {
            if (!dateString) return null;
            const date = new Date(dateString);
            return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        }
    }
};
