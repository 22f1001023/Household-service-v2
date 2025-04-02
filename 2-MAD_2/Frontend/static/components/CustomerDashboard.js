const CustomerDashboard = {
    components: {
        'customer-navbar': CustomerNavbar
    },
    template: `
    <div>
        <customer-navbar></customer-navbar>
        <div class="container mt-4">
            <h2 class="text-center text-danger mb-4">Customer Dashboard</h2>
            
            <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
            
            <div class="row">
                <div class="col-md-4">
                    <div class="card text-white bg-primary mb-3">
                        <div class="card-header">Total Requests</div>
                        <div class="card-body">
                            <h5 class="card-title">{{ dashboardMetrics.total_requests }}</h5>
                            <p class="card-text">Total service requests you've made.</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card text-white bg-success mb-3">
                        <div class="card-header">Completed Requests</div>
                        <div class="card-body">
                            <h5 class="card-title">{{ dashboardMetrics.completed_requests }}</h5>
                            <p class="card-text">Service requests that have been completed.</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card text-white bg-warning mb-3">
                        <div class="card-header">Pending Requests</div>
                        <div class="card-body">
                            <h5 class="card-title">{{ dashboardMetrics.pending_requests }}</h5>
                            <p class="card-text">Service requests that are still pending.</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="mt-4">
                <button @click="goToBookings" class="btn btn-primary me-2">View My Bookings</button>
                <button @click="goToNewBooking" class="btn btn-success">Book New Service</button>
            </div>
        </div>
    </div>`,

    data() {
        return {
            dashboardMetrics: {
                total_requests: 0,
                completed_requests: 0,
                pending_requests: 0
            },
            errorMessage: ''
        };
    },

    mounted() {
        this.fetchDashboardMetrics();
    },

    methods: {
        async fetchDashboardMetrics() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    this.errorMessage = 'Authentication token is missing. Please log in.';
                    return;
                }

                const response = await fetch('/spideyservices/customers/overview', {
                    method: 'GET',
                    headers: {
                        'Authorization': token,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to fetch dashboard metrics');
                }

                this.dashboardMetrics = await response.json();
                this.errorMessage = '';
            } catch (error) {
                this.errorMessage = error.message;
                console.error('Error fetching customer dashboard metrics:', error);
            }
        },

        goToBookings() {
            this.$router.push('/spideyservices/customers/bookings');
        },

        goToNewBooking() {
            this.$router.push('/spideyservices/customers/bookings/new');
        }
    }
};
