const AdminNavbar = {
    template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
        <div class="container-fluid">
            <a class="navbar-brand" href="#">Admin Panel</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav">
                    <li class="nav-item">
                        <a class="nav-link" @click.prevent="goToAdminDashboard" href="#">Admin Dashboard</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" @click.prevent="goToAdminService" href="#">Services</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" @click.prevent="goToAdminAllUsers" href="#">All Users</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" @click.prevent="goToProfessionalVerification" href="#">Professional Verification</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" @click.prevent="goToExportJobPage" href="#">Export Job</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" @click.prevent="goToMonthlySummaryPage" href="#">Monthly Summary</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" @click.prevent="goToBookingsPage" href="#">Bookings</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" @click.prevent="goToSearchBookingsPage" href="#">Search Bookings</a>
                    </li>
                </ul>
            </div>
        </div>
    </nav>`,

    methods: {
        // Navigate to Admin Dashboard
        goToAdminDashboard() {
            this.$router.push('/spideyservices/admin/overview');
        },
        // Navigate to Admin Services page
        goToAdminService() {
            this.$router.push('/spideyservices/admin/services');
        },
        // Navigate to Admin All Users page
        goToAdminAllUsers() {
            this.$router.push('/spideyservices/admin/members');
        },
        // Navigate to Professional Verification page
        goToProfessionalVerification() {
            this.$router.push('/spideyservices/admin/professionals');
        },
        // Navigate to Export Job Page
        goToExportJobPage() {
            this.$router.push('/spideyservices/admin/statistics/downloads');
        },
        // Navigate to Monthly Summary Page
        goToMonthlySummaryPage() {
            this.$router.push('/spideyservices/admin/statistics/performance/monthly');
        },
        // Navigate to Bookings Page
        goToBookingsPage() {
            this.$router.push('/spideyservices/admin/bookings');
        },
        // Navigate to Search Bookings Page
        goToSearchBookingsPage() {
            this.$router.push('/spideyservices/admin/bookings/lookup');
        }
    }
};
