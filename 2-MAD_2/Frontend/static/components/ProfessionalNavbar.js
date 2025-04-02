const ProfessionalNavbar = {
    template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
        <div class="container-fluid">
            <a class="navbar-brand" href="#">Professional Panel</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav">
                    <li class="nav-item">
                        <a class="nav-link" @click.prevent="goToProfessionalDashboard" href="#">Dashboard</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" @click.prevent="goToProfessionalProfile" href="#">Profile</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" @click.prevent="goToUnassignedBookings" href="#">Unassigned Bookings</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" @click.prevent="goToAssignedBookings" href="#">Assigned Bookings</a>
                    </li>
                </ul>
            </div>
        </div>
    </nav>`,

    methods: {
        // Navigate to Professional Dashboard
        goToProfessionalDashboard() {
            this.$router.push('/spideyservices/professionals/overview');
        },
        // Navigate to Professional Profile
        goToProfessionalProfile() {
            this.$router.push('/spideyservices/professionals/details/' + this.getCurrentUserId());
        },
        // Navigate to Unassigned Bookings
        goToUnassignedBookings() {
            this.$router.push('/spideyservices/professionals/unassigned');
        },
        // Navigate to Assigned Bookings
        goToAssignedBookings() {
            this.$router.push('/spideyservices/professionals/bookings');
        },
        // Helper method to get the current user's ID (replace with actual implementation)
        getCurrentUserId() {
            // Assuming you store the user ID in session or local storage
            return localStorage.getItem('user_id');
        }
    }
};
