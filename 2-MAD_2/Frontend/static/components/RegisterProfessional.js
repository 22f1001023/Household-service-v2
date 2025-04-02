const RegisterProfessional = {
    template: `
    <div class="register-container" style="max-width: 500px; margin: auto; padding: 20px; background-color: #e74c3c; border-radius: 10px; box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1); color: white;">
        <h1 class="text-center" style="color: white;">Spidey Services Professional Registration</h1>
        <form @submit.prevent="registerProfessional">
            <div class="form-group">
                <label for="email" style="font-weight: bold;">Email:</label>
                <input type="email" id="email" v-model="email" required class="form-control" placeholder="Enter your email">
            </div>
            <div class="form-group mt-3">
                <label for="username" style="font-weight: bold;">Username:</label>
                <input type="text" id="username" v-model="username" required class="form-control" placeholder="Enter your username">
            </div>
            <div class="form-group mt-3">
                <label for="password" style="font-weight: bold;">Password:</label>
                <input type="password" id="password" v-model="password" required class="form-control" placeholder="Enter your password">
            </div>
            <div class="form-group mt-3">
                <label for="phone" style="font-weight: bold;">Phone:</label>
                <input type="text" id="phone" v-model="phone" required class="form-control" placeholder="Enter your phone number">
            </div>
            <div class="form-group mt-3">
                <label for="pin_code" style="font-weight: bold;">Pin Code:</label>
                <input type="text" id="pin_code" v-model="pin_code" required class="form-control" placeholder="Enter your pin code">
            </div>
            <div class="form-group mt-3">
                <label for="description" style="font-weight: bold;">Description:</label>
                <textarea id="description" v-model="description" required class="form-control" placeholder="Describe your expertise"></textarea>
            </div>
            <div class="form-group mt-3">
                <label for="service_type" style="font-weight: bold;">Service Type:</label>
                <select id="service_type" v-model="service_type" required class="form-control">
                    <option value="" disabled>Select a service</option>
                    <option v-for="service in servicesList" :key="service.id" :value="service.name">{{ service.name }}</option>
                </select>
            </div>
            <div class='form-group mt-3'>
                <label for='experience' style='font-weight: bold;'>Experience (in years):</label>
                <input type='number' id='experience' v-model.number='experience' required class='form-control' placeholder='Enter your experience in years'>
            </div>
            <button type='submit' class='btn btn-dark btn-block mt-4'>Register</button>
        </form>
        <p v-if='successMessage' class='text-success text-center mt-3'>{{ successMessage }}</p>
        <p v-if='errorMessage' class='text-danger text-center mt-3'>{{ errorMessage }}</p>
        <p v-if="successMessage" class="text-success text-center mt-3">{{ successMessage }}</p>
        <p v-if="errorMessage" class="text-danger text-center mt-3">{{ errorMessage }}</p>
        <p class="text-center mt-4">Already have an account? 
            <router-link to="/login" style="color: white; font-weight: bold;">Login</router-link>
        </p>
    </div>`,
    data() {
        return {
            email: '',
            username: '',
            password: '',
            phone: '',
            pin_code: '',
            description: '',
            service_type: '',
            experience: null,
            servicesList: [],
            successMessage: '',
            errorMessage: ''
        };
    },
    mounted() {
        this.fetchServices();
    },
    methods: {
        async fetchServices() {
            try {
                const response = await fetch('/spideyservices/admin/services', {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                });

                if (!response.ok) throw new Error('Failed to fetch services');

                const data = await response.json();
                this.servicesList = data;
            } catch (error) {
                this.errorMessage = error.message;
            }
        },
        async registerProfessional() {
            try {
                const response = await fetch('/spideyservices/auth/signup/professionals', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: this.email,
                        username: this.username,
                        password: this.password,
                        phone: this.phone,
                        pin_code: this.pin_code,
                        description: this.description,
                        service_type: this.service_type,
                        experience: this.experience
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Registration failed');
                }

                const data = await response.json();
                this.successMessage = data.message;
                
                // Clear form fields after successful registration
                this.email = '';
                this.username = '';
                this.password = '';
                this.phone = '';
                this.pin_code = '';
                this.description = '';
                this.service_type = '';
                this.experience = null;
            } catch (error) {
                this.successMessage = '';
                this.errorMessage = error.message;
            }
        }
    }
};
