const AdminBookings = {
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

            <!-- Search Form -->
            <div class="mt-4">
                <h4>Search Bookings by Parameters</h4>
                <form @submit.prevent="searchBookings" class="row g-3">
                    <div class="col-md-4">
                        <label for="serviceStatus" class="form-label">Service Status</label>
                        <select id="serviceStatus" v-model="searchParams.service_status" class="form-select">
                            <option value="">Select Status</option>
                            <option value="requested">Requested</option>
                            <option value="assigned">Assigned</option>
                            <option value="completed">Completed</option>
                            <option value="closed">Closed</option>
                        </select>
                    </div>
                    <div class="col-md-4">
                        <label for="customerId" class="form-label">Customer ID</label>
                        <input type="number" id="customerId" v-model.number="searchParams.customer_id" class="form-control">
                    </div>
                    <div class="col-md-4">
                        <label for="professionalId" class="form-label">Professional ID</label>
                        <input type="number" id="professionalId" v-model.number="searchParams.professional_id" class="form-control">
                    </div>
                    <div class="col-12">
                        <button type="submit" class="btn btn-primary me-2">Search</button>
                        <button type="button" @click="clearSearch" class="btn btn-secondary">Clear Search</button>
                    </div>
                </form>
            </div>

            <!-- Search Results Section -->
            <div v-if="isSearchActive" class="mt-4">
                <h4>Search Results</h4>
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
                        <tr v-for="booking in searchResults" :key="booking.id">
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

                <!-- No Search Results Message -->
                <div v-if="searchResults.length === 0" class="alert alert-info">
                    No bookings found matching your search criteria.
                </div>
            </div>

            <!-- All Bookings Section -->
            <div class="mt-4">
                <h4>All Bookings</h4>
                <table v-if="bookings.length > 0" class="table table-bordered">
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

                <!-- No Bookings Message -->
                <div v-if="bookings.length === 0 && !errorMessage" class="alert alert-info">
                    No bookings found.
                </div>
            </div>
        </div>
    </div>`,

    data() {
        return {
            searchParams: {
                service_status: '',
                customer_id: null,
                professional_id: null
            },
            bookings: [], // List of all bookings
            searchResults: [], // List of search results
            isSearchActive: false, // Flag to show search results section
            errorMessage: '' // Error message, if any
        };
    },

    mounted() {
        this.fetchAllBookings(); // Fetch all bookings on component mount
    },

    methods: {
        // Fetch All Bookings API
        async fetchAllBookings() {
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

        // Fetch Search Results API
        async searchBookings() {
            try {
                // Check if any search parameter is provided
                const hasSearchParams = Object.values(this.searchParams).some(value => 
                    value !== null && value !== '' && value !== undefined
                );
                
                if (!hasSearchParams) {
                    // If no search parameters, just show all bookings
                    this.isSearchActive = false;
                    return;
                }

                const token = localStorage.getItem('token');
                if (!token) throw new Error('Authentication token is missing. Please log in.');

                // Build query string from non-empty parameters
                const queryParams = {};
                for (const [key, value] of Object.entries(this.searchParams)) {
                    if (value !== null && value !== '' && value !== undefined) {
                        queryParams[key] = value;
                    }
                }
                
                const query = new URLSearchParams(queryParams).toString();
                const response = await fetch(`/spideyservices/admin/bookings/lookup?${query}`, {
                    method: 'GET',
                    headers: { 'Authorization': `${token}`, 'Content-Type': 'application/json' }
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to fetch bookings.');
                }

                this.searchResults = await response.json();
                this.isSearchActive = true;
                this.errorMessage = '';
            } catch (error) {
                this.errorMessage = error.message;
                this.searchResults = [];
            }
        },

        // Clear Search and Show All Bookings
        clearSearch() {
            this.searchParams = {
                service_status: '',
                customer_id: null,
                professional_id: null
            };
            this.isSearchActive = false;
            this.searchResults = [];
        },

        // Format Date for Display
        formatDate(dateString) {
            if (!dateString) return null;
            const date = new Date(dateString);
            return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        }
    }
};
