const ProfessionalDashboard = {
    components: {
        'professional-navbar': ProfessionalNavbar  // Fixed component name to match template
    },
    data() {
        return {
            dashboardMetrics: {
                total_assigned_requests: 0,
                completed_requests: 0,
                pending_requests: 0
            },
            errorMessage: null
        };
    },
    template: `
    <div>
        <!-- Include Professional Navbar -->
        <professional-navbar></professional-navbar>
        
        <div class="container mt-4">
            <h1 class="text-center text-danger">Professional Dashboard</h1>
            
            <div v-if="errorMessage" class="alert alert-danger mt-3">{{ errorMessage }}</div>
            
            <div class="row mt-4">
                <div class="col-md-4">
                    <div class="card text-white bg-primary mb-3">
                        <div class="card-header">Assigned Requests</div>
                        <div class="card-body">
                            <h5 class="card-title">{{ dashboardMetrics.total_assigned_requests }}</h5>
                            <p class="card-text">Total service requests assigned to you.</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card text-white bg-success mb-3">
                        <div class="card-header">Completed Requests</div>
                        <div class="card-body">
                            <h5 class="card-title">{{ dashboardMetrics.completed_requests }}</h5>
                            <p class="card-text">Total service requests you have successfully completed.</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card text-white bg-warning mb-3">
                        <div class="card-header">Pending Requests</div>
                        <div class="card-body">
                            <h5 class="card-title">{{ dashboardMetrics.pending_requests }}</h5>
                            <p class="card-text">Total service requests that are awaiting your action.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>`,

    methods: {
        async fetchDashboardMetrics() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    this.errorMessage = 'Authentication token is missing. Please log in.';
                    return;
                }

                const response = await fetch('/spideyservices/professionals/overview', {
                    method: 'GET',
                    headers: {
                        'Authorization': `${token}`,  // Fixed token format
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to fetch dashboard metrics');
                }

                this.dashboardMetrics = await response.json();
                this.errorMessage = null;
            } catch (error) {
                this.errorMessage = error.message || 'Failed to fetch dashboard metrics. Please try again later.';
                console.error('Dashboard error:', error);
            }
        }
    },

    mounted() {
        this.fetchDashboardMetrics();
    }
};
