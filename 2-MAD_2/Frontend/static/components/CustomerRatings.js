const CustomerRatings = {
    components: {
        'customer-navbar': CustomerNavbar
    },
    template: `
    <div>
        <customer-navbar></customer-navbar>
        <div class="container mt-4">
            <h2 class="text-center text-danger mb-4">Rate Completed Services</h2>
            
            <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
            <div v-if="successMessage" class="alert alert-success">{{ successMessage }}</div>
            
            <!-- Completed Bookings Table -->
            <div v-if="completedBookings.length > 0">
                <h4>Completed Services</h4>
                <table class="table table-bordered">
                    <thead class="table-dark">
                        <tr>
                            <th>ID</th>
                            <th>Service ID</th>
                            <th>Professional</th>
                            <th>Date Completed</th>
                            <th>Current Rating</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="booking in completedBookings" :key="booking.id">
                            <td>{{ booking.id }}</td>
                            <td>{{ booking.service_id }}</td>
                            <td>{{ booking.professional_id || 'Unassigned' }}</td>
                            <td>{{ formatDate(booking.date_of_completion) }}</td>
                            <td>
                                <div v-if="booking.rating">
                                    <span class="text-warning">
                                        <i v-for="n in booking.rating" :key="n" class="bi bi-star-fill"></i>
                                        <i v-for="n in 5-booking.rating" :key="n+5" class="bi bi-star"></i>
                                    </span>
                                    ({{ booking.rating }}/5)
                                </div>
                                <span v-else class="text-muted">Not rated yet</span>
                            </td>
                            <td>
                                <button 
                                    @click="showRatingModal(booking)" 
                                    class="btn btn-primary btn-sm">
                                    {{ booking.rating ? 'Update Rating' : 'Rate Service' }}
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <div v-else-if="!loading" class="alert alert-info">
                You don't have any completed services to rate.
            </div>
        </div>
        
        <!-- Rating Modal (moved outside the container to avoid layout issues) -->
        <div v-if="showModal" class="modal fade show" tabindex="-1" role="dialog" style="display: block;">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Rate Service</h5>
                        <button type="button" class="btn-close" @click="closeModal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label for="rating">Rating (1-5):</label>
                            <div class="rating-stars my-3">
                                <span v-for="star in 5" :key="star" 
                                    @click="ratingValue = star" 
                                    class="star-rating"
                                    :class="{ 'selected': star <= ratingValue }">
                                    ★
                                </span>
                            </div>
                            <select id="rating" v-model="ratingValue" class="form-select">
                                <option value="1">1 - Poor</option>
                                <option value="2">2 - Fair</option>
                                <option value="3">3 - Good</option>
                                <option value="4">4 - Very Good</option>
                                <option value="5">5 - Excellent</option>
                            </select>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" @click="closeModal">Cancel</button>
                        <button type="button" class="btn btn-primary" @click="submitRating">Submit Rating</button>
                    </div>
                </div>
            </div>
            <div class="modal-backdrop fade show"></div>
        </div>
    </div>`,
    
    data() {
        return {
            completedBookings: [],
            selectedBooking: null,
            ratingValue: 3,
            showModal: false,
            errorMessage: '',
            successMessage: '',
            loading: true
        };
    },
    
    mounted() {
        // Add CSS for star rating
        const style = document.createElement('style');
        style.textContent = `
            .star-rating {
                font-size: 2rem;
                color: #ccc;
                cursor: pointer;
                transition: color 0.2s;
                margin-right: 5px;
            }
            .star-rating.selected {
                color: #ffc107;
            }
            .star-rating:hover {
                color: #ffc107;
            }
            .modal-open {
                overflow: hidden;
            }
            .modal {
                overflow-y: auto;
            }
        `;
        document.head.appendChild(style);
        
        this.fetchCompletedBookings();
    },
    
    methods: {
        async fetchCompletedBookings() {
            try {
                this.loading = true;
                const token = localStorage.getItem('token');
                if (!token) {
                    this.errorMessage = 'Authentication token is missing. Please log in.';
                    return;
                }
                
                const response = await fetch('/spideyservices/customers/bookings', {
                    method: 'GET',
                    headers: {
                        'Authorization': token,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to fetch bookings');
                }
                
                const allBookings = await response.json();
                // Filter only completed or closed bookings
                this.completedBookings = allBookings.filter(booking => 
                    booking.service_status === 'closed' || booking.service_status === 'completed');
                this.errorMessage = '';
            } catch (error) {
                this.errorMessage = error.message;
                console.error('Error fetching completed bookings:', error);
            } finally {
                this.loading = false;
            }
        },
        
        showRatingModal(booking) {
            this.selectedBooking = booking;
            this.ratingValue = booking.rating || 3; // Use existing rating or default to 3
            this.showModal = true;
            // Add class to body to prevent scrolling
            document.body.classList.add('modal-open');
        },
        
        closeModal() {
            this.showModal = false;
            // Remove class from body to allow scrolling again
            document.body.classList.remove('modal-open');
        },
        
        async submitRating() {
            try {
                this.successMessage = '';
                this.errorMessage = '';
                
                const token = localStorage.getItem('token');
                if (!token) {
                    this.errorMessage = 'Authentication token is missing. Please log in.';
                    return;
                }
                
                const response = await fetch(`/spideyservices/customers/bookings/${this.selectedBooking.id}/ratings`, {
                    method: 'POST',
                    headers: {
                        'Authorization': token,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({ rating: parseInt(this.ratingValue) })
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to submit rating');
                }
                
                const data = await response.json();
                this.successMessage = data.message || 'Rating submitted successfully';
                this.closeModal();
                
                // Update the rating in the local list
                const bookingIndex = this.completedBookings.findIndex(b => b.id === this.selectedBooking.id);
                if (bookingIndex !== -1) {
                    this.completedBookings[bookingIndex].rating = parseInt(this.ratingValue);
                }
                
                // Refresh the list after a short delay
                setTimeout(() => {
                    this.fetchCompletedBookings();
                }, 2000);
            } catch (error) {
                this.errorMessage = error.message;
                console.error('Error submitting rating:', error);
            }
        },
        
        formatDate(dateString) {
            if (!dateString) return 'N/A';
            const date = new Date(dateString);
            return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        }
    }
};
