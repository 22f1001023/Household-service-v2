const Navbar = {
    template: `
    <nav class="navbar navbar-expand-lg navbar-light" style="background-color: #e74c3c; color: white;">
        <div class="container-fluid">
            <a class="navbar-brand d-flex align-items-center" href="/">
                <img src="/static/logo.png" alt="Spidey Services Logo" height="40" class="me-2">
                <span style="color: white; font-weight: bold;">Spidey Services</span>
            </a>
            <button
                class="navbar-toggler"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#navbarNav"
            >
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ms-auto">
                    <!-- Common Links -->
                    <li class="nav-item">
                        <router-link class="nav-link" to="/" style="color: white;">Home</router-link>
                    </li>
                    <li class="nav-item">
                        <router-link class="nav-link" to="/about" style="color: white;">About</router-link>
                    </li>

                    <!-- Authentication Links -->
                    <li v-if="$route.path === '/login'" class="nav-item">
                        <router-link class="nav-link" to="/login" style="color: white;">Login</router-link>
                    </li>

                    <!-- Logout -->
                    <li v-if="$route.path !== '/login'" class="nav-item">
                        <button @click.prevent="logout()" class="btn btn-danger btn-sm">Logout</button>
                    </li>
                </ul>
            </div>
        </div>
    </nav>`,
    methods: {
        logout() {
            fetch('/spideyservices/auth/logout', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            })
                .then(response => {
                    if (response.ok) {
                        alert('Logout successful!');
                        localStorage.removeItem('token');
                        this.$router.push('/login');
                    } else {
                        alert('Logout failed!');
                    }
                })
                .catch(error => console.error('Error:', error));
        }
    }
};
