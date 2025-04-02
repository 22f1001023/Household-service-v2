const Login = {
    template: `
    <div class="container mt-5">
        <div class="row">
            <div class="col-md-6 d-flex align-items-center justify-content-center">
                <img src="/static/login.png" alt="Login Image" class="img-fluid" style="max-height: 400px;">
            </div>
            <div class="col-md-6">
                <div class="login-container" style="max-width: 400px; margin: auto; padding: 20px; background-color: #e74c3c; border-radius: 10px; box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1); color: white;">
                    <h1 class="text-center" style="color: white;">Spidey Services Login</h1>
                    <form @submit.prevent="login">
                        <div class="form-group">
                            <label for="email" style="font-weight: bold;">Email:</label>
                            <input type="email" id="email" v-model="email" required class="form-control" placeholder="Enter your email">
                        </div>
                        <div class="form-group mt-3">
                            <label for="password" style="font-weight: bold;">Password:</label>
                            <input type="password" id="password" v-model="password" required class="form-control" placeholder="Enter your password">
                        </div>
                        <button type="submit" class="btn btn-dark btn-block mt-4">Login</button>
                    </form>
                    <!-- Error message in black -->
                    <p v-if="errorMessage" class="text-center mt-3" style="color: black;">{{ errorMessage }}</p>
                    <p class="text-center mt-4">Don't have an account? 
                        <router-link to="/signup/customers" style="color: white; font-weight: bold;">Register as Customer</router-link> |
                        <router-link to="/signup/professionals" style="color: white; font-weight: bold;">Register as Professional</router-link>
                    </p>
                </div>
            </div>
        </div>
    </div>`,
    data() {
        return {
            email: '',
            password: '',
            errorMessage: ''
        };
    },
    methods: {
        async login() {
            try {
                // Clear previous error messages
                this.errorMessage = '';

                // Basic validation
                if (!this.email || !this.password) {
                    this.errorMessage = 'Please enter both email and password.';
                    return;
                }

                const response = await fetch('/spideyservices/auth/credentials', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email: this.email, password: this.password })
                });

                // Handle server errors
                if (response.status === 500) {
                    throw new Error('Server error. Please try again later or contact support.');
                }

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Invalid credentials. Please enter correct credentials.');
                }

                const data = await response.json();
                console.log('Login successful:', data);

                // Save token, role, and user_id in localStorage
                localStorage.setItem('token', data.token);
                localStorage.setItem('role', data.role);
                localStorage.setItem('user_id', data.user_id);

                // Redirect user based on role
                if (data.redirect_url) {
                    this.$router.push(data.redirect_url);
                } else {
                    this.errorMessage = 'Role-based redirection failed!';
                }
            } catch (error) {
                console.error('Login error:', error);
                this.errorMessage = error.message;
            }
        }
    }
};
