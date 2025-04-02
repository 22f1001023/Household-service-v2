const AdminProfApprove = {
    components: {
        'admin-navbar': AdminNavbar
    },
    template: `
    <div>
        <!-- Include Admin Navbar -->
        <admin-navbar></admin-navbar>

        <!-- Professional Verification Content -->
        <div class="container mt-4">
            <h2>Professional Verification</h2>

            <!-- Error and Success Messages -->
            <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
            <div v-if="successMessage" class="alert alert-success">{{ successMessage }}</div>

            <!-- Professionals Table -->
            <table class="table table-bordered">
                <thead class="table-dark">
                    <tr>
                        <th>ID</th>
                        <th>Email</th>
                        <th>Username</th>
                        <th>Phone</th>
                        <th>Pincode</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="professional in professionals" :key="professional.id">
                        <td>{{ professional.id }}</td>
                        <td>{{ professional.email }}</td>
                        <td>{{ professional.username }}</td>
                        <td>{{ professional.phone }}</td>
                        <td>{{ professional.pincode }}</td>
                        <td>{{ professional.active ? 'Active' : 'Inactive' }}</td>
                        <td>
                            <!-- Approve Button -->
                            <button @click="verifyProfessional(professional.id, true)" class="btn btn-success btn-sm me-2">Approve</button>

                            <!-- Reject Button -->
                            <button @click="verifyProfessional(professional.id, false)" class="btn btn-danger btn-sm">Reject</button>
                        </td>
                    </tr>
                </tbody>
            </table>

            <!-- No Professionals Message -->
            <div v-if="professionals.length === 0 && !errorMessage" class="alert alert-info mt-3">
                No professionals found for verification.
            </div>
        </div>
    </div>`,

    data() {
        return {
            professionals: [],
            errorMessage: '',
            successMessage: ''
        };
    },

    mounted() {
        this.fetchProfessionals();
    },

    methods: {
        // Fetch All Professionals API
        async fetchProfessionals() {
            try {
                const token = localStorage.getItem('token');
                if (!token) throw new Error('Authentication token is missing. Please log in.');

                const response = await fetch('/spideyservices/admin/professionals', {
                    method: 'GET',
                    headers: { 'Authorization': `${token}` }
                });

                if (!response.ok) {
                    throw new Error(`Error ${response.status}: ${await response.text()}`);
                }

                const contentType = response.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    this.professionals = await response.json();
                } else {
                    throw new Error("Unexpected response format. Expected JSON but received something else.");
                }
            } catch (error) {
                console.error("Fetch Professionals Error:", error);
                this.errorMessage = error.message || "An error occurred while fetching professionals.";
            }
        },

        // Verify Professional API (Approve/Reject)
        async verifyProfessional(professionalId, approved) {
            try {
                const token = localStorage.getItem('token');
                if (!token) throw new Error('Authentication token is missing. Please log in.');

                const response = await fetch(`/spideyservices/admin/professionals/${professionalId}/verification`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ approved })
                });

                if (!response.ok) {
                    throw new Error(`Error ${response.status}: ${await response.text()}`);
                }

                const contentType = response.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    const data = await response.json();
                    this.successMessage = data.message || "Verification status updated successfully.";
                    await this.fetchProfessionals();
                } else {
                    throw new Error("Unexpected response format. Expected JSON but received something else.");
                }
            } catch (error) {
                console.error("Verification Error:", error);
                this.errorMessage = error.message || "An error occurred during verification.";
            }
        }
    }
};
