const AdminPerformance = {
    components: {
        'admin-navbar': AdminNavbar
    },
    template: `
    <div>
        <admin-navbar></admin-navbar>
        <div class="container mt-4">
            <div class="d-flex justify-content-between align-items-center">
                <h2>Monthly Activity Summary</h2>
            </div>
            <div v-if="errorMessage" class="alert alert-danger mt-3">{{ errorMessage }}</div>
            <div v-if="summaryData" class="mt-4">
                <h4>Summary:</h4>
                <ul class="list-group">
                    <li class="list-group-item">
                        <strong>Total Services Requested:</strong> {{ summaryData.total_services_requested }}
                    </li>
                    <li class="list-group-item">
                        <strong>Total Services Completed:</strong> {{ summaryData.total_services_completed }}
                    </li>
                    <li class="list-group-item">
                        <strong>Total Revenue Generated:</strong> {{ summaryData.total_revenue_generated }}
                    </li>
                    <li class="list-group-item">
                        <strong>Top Performing Service:</strong> {{ summaryData.top_performing_service }}
                    </li>
                </ul>
            </div>
            <div v-if="!summaryData && !errorMessage" class="mt-4">
                <button @click="fetchMonthlySummary" class="btn btn-primary">Fetch Monthly Summary</button>
            </div>
        </div>
    </div>`,

    data() {
        return {
            summaryData: null,
            errorMessage: ''
        };
    },

    methods: {
        async fetchMonthlySummary() {
            try {
                const token = localStorage.getItem('token');
                if (!token) throw new Error('Authentication token is missing. Please log in.');

                const response = await fetch('/spideyservices/admin/statistics/performance/monthly', {
                    method: 'GET',
                    headers: { 'Authorization': `${token}`, 'Content-Type': 'application/json' }
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to fetch monthly summary.');
                }

                this.summaryData = await response.json();
                this.errorMessage = '';
            } catch (error) {
                this.errorMessage = error.message;
                this.summaryData = null;
            }
        }
    },

    mounted() {
        this.fetchMonthlySummary();
    }
};
