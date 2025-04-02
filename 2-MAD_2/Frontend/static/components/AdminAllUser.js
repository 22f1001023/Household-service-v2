const AdminAllUser = {
    components: {
        'admin-navbar': AdminNavbar
    },
    template: `
    <div>
        <!-- Include Admin Navbar -->
        <admin-navbar></admin-navbar>

        <!-- All Users Content -->
        <div class="container mt-4">
            <h2>All Users</h2>
            
            <!-- Error and Success Messages -->
            <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
            <div v-if="successMessage" class="alert alert-success">{{ successMessage }}</div>

            <!-- Users Table -->
            <table class="table table-bordered">
                <thead class="table-dark">
                    <tr>
                        <th>ID</th>
                        <th>Email</th>
                        <th>Username</th>
                        <th>Phone</th>
                        <th>Pincode</th>
                        <th>Roles</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="user in users" :key="user.id">
                        <td>{{ user.id }}</td>
                        <td>{{ user.email }}</td>
                        <td>{{ user.username }}</td>
                        <td>{{ user.phone }}</td>
                        <td>{{ user.pincode }}</td>
                        <td>{{ user.roles.join(', ') }}</td>
                        <td>{{ user.active ? 'Active' : 'Blocked' }}</td>
                        <td>
                            <!-- Toggle User Status Button -->
                            <button @click="toggleUserStatus(user)" class="btn btn-sm" :class="user.active ? 'btn-danger' : 'btn-success'">
                                {{ user.active ? 'Block' : 'Unblock' }}
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>`,

    data() {
        return {
            users: [],
            errorMessage: '',
            successMessage: ''
        };
    },

    mounted() {
        this.fetchUsers();
    },

    methods: {
        // Fetch All Users
        async fetchUsers() {
            try {
                const token = localStorage.getItem('token');
                if (!token) throw new Error('Authentication token is missing. Please log in.');

                const response = await fetch('/spideyservices/admin/members', {
                    method: 'GET',
                    headers: {
                        'Authorization': `${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                const contentType = response.headers.get("content-type");
                if (!contentType || !contentType.includes("application/json")) {
                    throw new Error("Invalid response format. Server returned non-JSON data.");
                }

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to fetch users.');
                }

                this.users = await response.json();
            } catch (error) {
                this.errorMessage = error.message;
            }
        },

        // Toggle User Status (Block/Unblock)
        async toggleUserStatus(user) {
            try {
                const token = localStorage.getItem('token');
                if (!token) throw new Error('Authentication token is missing. Please log in.');

                const response = await fetch(`/spideyservices/admin/members/${user.id}/status`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ active: !user.active })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to update user status.');
                }

                const data = await response.json();
                this.successMessage = data.message;
                user.active = !user.active; // Update UI
            } catch (error) {
                this.errorMessage = error.message;
            }
        }
    }
};
