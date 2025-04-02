const CustomerNewBookings = {
    components: {
        'customer-navbar': CustomerNavbar
    },
    template: `
    <div>
        <customer-navbar></customer-navbar>
        <div class="container mt-4">
            <h2 class="text-center text-danger mb-4">Book a New Service</h2>
            
            <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
            <div v-if="successMessage" class="alert alert-success">{{ successMessage }}</div>
            
            <form @submit.prevent="createBooking">
                <div class="mb-3">
                    <label for="serviceId" class="form-label">Service:</label>
                    <select id="serviceId" v-model="newBooking.service_id" class="form-select" required>
                        <option value="">Select a service</option>
                        <option v-for="service in services" :key="service.id" :value="service.id">
                            {{ service.name }} - ₹{{ service.base_price }}
                        </option>
                    </select>
                </div>
                
                <div class="mb-3">
                    <label for="dateOfRequest" class="form-label">Date of Request:</label>
                    <input type="datetime-local" id="dateOfRequest" v-model="newBooking.date_of_request" class="form-control">
                </div>
                
                <div class="mb-3">
                    <label for="remarks" class="form-label">Remarks:</label>
                    <textarea id="remarks" v-model="newBooking.remarks" class="form-control" rows="3" 
                        placeholder="Any additional details or requirements"></textarea>
                </div>
                
                <div class="d-grid gap-2">
                    <button type="submit" class="btn btn-primary">Book Service</button>
                </div>
            </form>
        </div>
    </div>`,
    
    data() {
        return {
            services: [],
            newBooking: {
                service_id: '',
                date_of_request: '',
                remarks: ''
            },
            errorMessage: '',
            successMessage: ''
        };
    },
    
    mounted() {
        this.fetchServices();
        this.setDefaultDateTime();
    },
    
    methods: {
        setDefaultDateTime() {
            // Set default date to current date/time
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            
            this.newBooking.date_of_request = `${year}-${month}-${day}T${hours}:${minutes}`;
        },
        async fetchServices() {
            try {
                const response = await fetch('/spideyservices/admin/services', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                });
                
                if (!response.ok) {
                    throw new Error('Failed to fetch services');
                }
                
                this.services = await response.json();
            } catch (error) {
                this.errorMessage = error.message;
                console.error('Error fetching services:', error);
            }
        },
        
        async createBooking() {
            try {
                this.errorMessage = '';
                this.successMessage = '';
                
                const token = localStorage.getItem('token');
                if (!token) {
                    this.errorMessage = 'Authentication token is missing. Please log in.';
                    return;
                }
                const bookingData = {...this.newBooking};
                if (bookingData.date_of_request) {
                    // Convert the datetime-local input value to the required format
                    const dateObj = new Date(bookingData.date_of_request);
                    const year = dateObj.getFullYear();
                    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                    const day = String(dateObj.getDate()).padStart(2, '0');
                    const hours = String(dateObj.getHours()).padStart(2, '0');
                    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
                    const seconds = '00'; // Add seconds which might be missing from the input
                    
                    bookingData.date_of_request = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
                }
                const response = await fetch('/spideyservices/customers/bookings', {
                    method: 'POST',
                    headers: {
                        'Authorization': token,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(this.newBooking)
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to create booking');
                }
                
                const data = await response.json();
                this.successMessage = data.message || 'Booking created successfully';
                
                // Reset form
                this.newBooking = {
                    service_id: '',
                    date_of_request: '',
                    remarks: ''
                };
            } catch (error) {
                this.errorMessage = error.message;
                console.error('Error creating booking:', error);
            }
        }
    }
};
