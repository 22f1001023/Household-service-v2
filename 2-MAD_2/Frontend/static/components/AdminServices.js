const AdminServices = {
    components: {
        'admin-navbar': AdminNavbar
    },
    template: `
    <div>
        <!-- Include Admin Navbar -->
        <admin-navbar></admin-navbar>

        <!-- Admin Services Content -->
        <div class="container mt-4">
            <h2 class="mb-4">Manage Services</h2>

            <!-- Error and Success Messages -->
            <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
            <div v-if="successMessage" class="alert alert-success">{{ successMessage }}</div>

            <!-- Create New Service Section -->
            <h4>Create New Service</h4>
            <form @submit.prevent="createService" class="mb-4">
                <div class="mb-3">
                    <label for="name" class="form-label">Service Name</label>
                    <input type="text" id="name" v-model="newService.name" class="form-control" required>
                </div>
                <div class="mb-3">
                    <label for="description" class="form-label">Description</label>
                    <textarea id="description" v-model="newService.description" class="form-control"></textarea>
                </div>
                <div class="mb-3">
                    <label for="base_price" class="form-label">Base Price</label>
                    <input type="number" id="base_price" v-model.number="newService.base_price" class="form-control" required>
                </div>
                <div class="mb-3">
                    <label for="time_required" class="form-label">Time Required (in minutes)</label>
                    <input type="number" id="time_required" v-model.number="newService.time_required" class="form-control">
                </div>
                <button type="submit" class="btn btn-primary">Create Service</button>
            </form>

            <!-- List All Services Section -->
            <h4>Existing Services</h4>
            <table class="table table-bordered">
                <thead class="table-dark">
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Base Price</th>
                        <th>Time Required</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- Render Each Service -->
                    <tr v-for="service in services" :key="service.id">
                        <td>{{ service.id }}</td>
                        <td><input type="text" v-model.lazy="service.name" class="form-control"></td>
                        <td><input type="text" v-model.lazy="service.description" class="form-control"></td>
                        <td><input type="number" v-model.lazy.number="service.base_price" class="form-control"></td>
                        <td><input type="number" v-model.lazy.number="service.time_required" class="form-control"></td>
                        <td>
                            <!-- Update Button -->
                            <button @click.prevent="updateService(service)" class="btn btn-success btn-sm me-2">Update</button>

                            <!-- Delete Button -->
                            <button @click.prevent="deleteService(service.id)" class="btn btn-danger btn-sm">Delete</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>`,

    data() {
        return {
            services: [], // List of all services
            newService: {
                name: '',
                description: '',
                base_price: null,
                time_required: null
            },
            errorMessage: '',
            successMessage: ''
        };
    },

    mounted() {
        this.fetchServices();
    },

    methods: {
        // Fetch All Services
        async fetchServices() {
            try {
                const token = localStorage.getItem('token');
                if (!token) throw new Error('Authentication token is missing. Please log in.');

                const response = await fetch('/spideyservices/admin/services', {
                    method: 'GET',
                    headers: { 'Authorization': `${token}` }
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to fetch services.');
                }

                this.services = await response.json();
            } catch (error) {
                this.errorMessage = error.message;
            }
        },

        // Create a New Service
        async createService() {
            try {
                const token = localStorage.getItem('token');
                if (!token) throw new Error('Authentication token is missing. Please log in.');

                const response = await fetch('/spideyservices/admin/services', {
                    method: 'POST',
                    headers: {
                        'Authorization': `${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(this.newService)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to create service.');
                }

                const data = await response.json();
                this.successMessage = data.message;
                this.newService = { name: '', description: '', base_price: null, time_required: null };
                this.fetchServices(); // Refresh the list of services
            } catch (error) {
                this.errorMessage = error.message;
            }
        },

        // Update an Existing Service
        async updateService(service) {
            try {
                const token = localStorage.getItem('token');
                if (!token) throw new Error('Authentication token is missing. Please log in.');

                const response = await fetch(`/spideyservices/admin/services/${service.id}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name: service.name,
                        description: service.description,
                        base_price: service.base_price,
                        time_required: service.time_required
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to update service.');
                }

                const data = await response.json();
                this.successMessage = data.message;
            } catch (error) {
                this.errorMessage = error.message;
            }
        },

        // Delete a Service
        async deleteService(serviceId) {
            try {
                const token = localStorage.getItem('token');
                if (!token) throw new Error('Authentication token is missing. Please log in.');

                const response = await fetch(`/spideyservices/admin/services/${serviceId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `${token}` }
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to delete service.');
                }

                const data = await response.json();
                this.successMessage = data.message;
                this.fetchServices(); // Refresh the list of services
            } catch (error) {
                this.errorMessage = error.message;
            }
        }
    }
};
