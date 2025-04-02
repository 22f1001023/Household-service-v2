const AdminDashboard = {
    components: {
        'admin-navbar': AdminNavbar
    },
    template: `
    <div>
        <!-- Include Admin Navbar -->
        <admin-navbar></admin-navbar>

        <!-- Admin Dashboard Content -->
        <div class="container mt-4">
            <h2>Admin Dashboard</h2>
            
            <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
            
            <button @click="goToAdminService" class="btn btn-dark mb-3">Manage Services</button>
            
            <div class="row">
                <div class="col-md-4">
                    <div class="card text-white bg-primary mb-3">
                        <div class="card-header">Total Users</div>
                        <div class="card-body">
                            <h5 class="card-title">{{ totalUsers }}</h5>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card text-white bg-success mb-3">
                        <div class="card-header">Total Customers</div>
                        <div class="card-body">
                            <h5 class="card-title">{{ totalCustomers }}</h5>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card text-white bg-warning mb-3">
                        <div class="card-header">Total Professionals</div>
                        <div class="card-body">
                            <h5 class="card-title">{{ totalProfessionals }}</h5>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>`,

    data() {
        return {
            totalUsers: 0,
            totalCustomers: 0,
            totalProfessionals: 0,
            errorMessage: ""
        };
    },

    mounted() {
        this.fetchAdminOverview();
    },

    methods: {
        async fetchAdminOverview() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('Authentication token is missing. Please log in.');
                }

                const response = await fetch('/spideyservices/admin/overview', {
                    method: 'GET',
                    headers: {
                        'Authorization': token,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to fetch data');
                }

                const data = await response.json();
                this.totalUsers = data.total_users;
                this.totalCustomers = data.total_customers;
                this.totalProfessionals = data.total_professionals;
            } catch (error) {
                this.errorMessage = error.message;
            }
        },

        // Navigate to Admin Services page
        goToAdminService() {
            this.$router.push('/spideyservices/admin/services');
        }
    }
};
