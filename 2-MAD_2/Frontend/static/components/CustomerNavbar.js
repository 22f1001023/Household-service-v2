const CustomerNavbar = {
    template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
        <div class="container-fluid">
            <a class="navbar-brand" href="#">Customer Panel</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav">
                    <li class="nav-item">
                        <a class="nav-link" @click.prevent="goToCustomerDashboard" href="#">Dashboard</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" @click.prevent="goToCustomerProfile" href="#">Profile</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" @click.prevent="goToNewBooking" href="#">Book Service</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" @click.prevent="goToCustomerBookings" href="#">My Bookings</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" @click.prevent="goToCustomerRatings" href="#">Ratings</a>
                    </li>
                </ul>
            </div>
        </div>
    </nav>`,

    methods: {
        // Navigate to Customer Dashboard
        goToCustomerDashboard() {
            this.$router.push('/spideyservices/customers/overview');
        },
        
        // Navigate to Customer Profile
        goToCustomerProfile() {
            this.$router.push('/spideyservices/customers/details/' + this.getCurrentUserId());
        },
        
        // Navigate to Customer Bookings
        goToCustomerBookings() {
            this.$router.push('/spideyservices/customers/bookings');
        },
        
        // Navigate to Customer Ratings
        goToCustomerRatings() {
            this.$router.push('/spideyservices/customers/ratings');
        },
        
        // Navigate to New Booking Form
        goToNewBooking() {
            this.$router.push('/spideyservices/customers/bookings/new');
        },
        
        // Helper method to get the current user's ID
        getCurrentUserId() {
            return localStorage.getItem('user_id');
        }
    }
};
