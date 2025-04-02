const ProfessionalProfile = {
    components: {
        'professional-navbar': ProfessionalNavbar
    },
    template: `
    <div>
        <professional-navbar></professional-navbar>
        <div class="container mt-4">
            <h2 class="text-center text-danger mb-4">Professional Profile</h2>
            
            <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
            <div v-if="successMessage" class="alert alert-success">{{ successMessage }}</div>
            
            <div class="card">
                <div class="card-header bg-dark text-white">
                    <h4>Profile Details</h4>
                </div>
                <div class="card-body">
                    <form @submit.prevent="updateProfile">
                        <div class="mb-3">
                            <label for="email" class="form-label">Email:</label>
                            <input type="email" id="email" v-model="profile.email" class="form-control" disabled>
                            <small class="text-muted">Email cannot be changed</small>
                        </div>
                        
                        <div class="mb-3">
                            <label for="username" class="form-label">Username:</label>
                            <input type="text" id="username" v-model="profile.username" class="form-control" required>
                        </div>
                        
                        <div class="mb-3">
                            <label for="phone" class="form-label">Phone:</label>
                            <input type="tel" id="phone" v-model="profile.phone" class="form-control" required>
                        </div>
                        
                        <div class="mb-3">
                            <label class="form-label">Account Status:</label>
                            <div class="form-control bg-light">
                                {{ profile.active ? 'Active' : 'Inactive' }}
                            </div>
                        </div>
                        
                        <div class="d-grid gap-2">
                            <button type="submit" class="btn btn-primary">Update Profile</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>`,
    
    data() {
        return {
            profile: {
                id: null,
                email: '',
                username: '',
                phone: '',
                active: false
            },
            errorMessage: '',
            successMessage: ''
        };
    },
    
    mounted() {
        this.fetchProfileData();
    },
    
    methods: {
        async fetchProfileData() {
            try {
                const userId = localStorage.getItem('user_id');
                if (!userId) {
                    this.errorMessage = 'User ID not found. Please log in again.';
                    setTimeout(() => this.$router.push('/login'), 2000);
                    return;
                }
                
                const token = localStorage.getItem('token');
                if (!token) {
                    this.errorMessage = 'Authentication token is missing. Please log in.';
                    setTimeout(() => this.$router.push('/login'), 2000);
                    return;
                }
                
                const response = await fetch(`/spideyservices/professionals/details/${userId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': token,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to fetch profile data');
                }
                
                this.profile = await response.json();
                this.errorMessage = '';
            } catch (error) {
                this.errorMessage = error.message;
                console.error('Profile fetch error:', error);
            }
        },
        
        async updateProfile() {
            try {
                this.errorMessage = '';
                this.successMessage = '';
                
                const userId = localStorage.getItem('user_id');
                const token = localStorage.getItem('token');
                
                if (!token || !userId) {
                    this.errorMessage = 'Authentication required. Please log in.';
                    return;
                }
                
                // Only send the fields that can be updated
                const updateData = {
                    username: this.profile.username,
                    phone: this.profile.phone
                };
                
                const response = await fetch(`/spideyservices/professionals/details/${userId}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': token,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updateData)
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to update profile');
                }
                
                const data = await response.json();
                this.successMessage = data.message || 'Profile updated successfully';
                
                // Refresh profile data
                this.fetchProfileData();
            } catch (error) {
                this.errorMessage = error.message;
                console.error('Profile update error:', error);
            }
        }
    }
};
