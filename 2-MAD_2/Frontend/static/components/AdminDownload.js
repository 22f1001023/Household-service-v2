const AdminDownload = {
    components: {
        'admin-navbar': AdminNavbar
    },
    template: `
    <div>
        <!-- Include Admin Navbar -->
        <admin-navbar></admin-navbar>

        <!-- Export Service Data Content -->
        <div class="container mt-4">
            <div class="d-flex justify-content-between align-items-center">
                <h2>Export Service Data</h2>
            </div>

            <!-- Trigger Export Job -->
            <div class="mt-4">
                <h4>Trigger Export Job</h4>
                <button @click="triggerExportJob" class="btn btn-primary">Trigger Export Job</button>
                <div v-if="message" class="alert alert-success mt-3">{{ message }}</div>
                <div v-if="errorMessage" class="alert alert-danger mt-3">{{ errorMessage }}</div>
            </div>

            <!-- Check Export Job Status -->
            <div class="mt-4">
                <h4>Check Export Job Status</h4>
                <form @submit.prevent="checkJobStatus">
                    <div class="mb-3">
                        <label for="taskId" class="form-label">Task ID</label>
                        <input type="text" id="taskId" v-model="taskId" class="form-control" required>
                    </div>
                    <button type="submit" class="btn btn-secondary">Check Status</button>
                </form>
                <div v-if="jobStatus" class="alert alert-info mt-3">
                    <p><strong>Task ID:</strong> {{ jobStatus.task_id }}</p>
                    <p><strong>Status:</strong> {{ jobStatus.task_status }}</p>
                    <p><strong>Result:</strong> {{ jobStatus.task_result }}</p>
                </div>
            </div>
        </div>
    </div>`,

    data() {
        return {
            message: '',
            errorMessage: '',
            taskId: '',
            jobStatus: null
        };
    },

    methods: {
        // Trigger Export Job API
        async triggerExportJob() {
            try {
                const token = localStorage.getItem('token');
                if (!token) throw new Error('Authentication token is missing. Please log in.');

                const response = await fetch('/spideyservices/admin/statistics/downloads', {
                    method: 'POST',
                    headers: { 'Authorization': `${token}`, 'Content-Type': 'application/json' }
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to create export job.');
                }

                const data = await response.json();
                this.message = `Export job created successfully. Task ID: ${data.task_id}`;
                this.errorMessage = '';
            } catch (error) {
                this.errorMessage = error.message;
                this.message = '';
            }
        },

        // Check Export Job Status API
        async checkJobStatus() {
            try {
                const token = localStorage.getItem('token');
                if (!token) throw new Error('Authentication token is missing. Please log in.');

                const response = await fetch(`/spideyservices/jobs/${this.taskId}/status`, {
                    method: 'GET',
                    headers: { 'Authorization': `${token}`, 'Content-Type': 'application/json' }
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to fetch job status.');
                }

                this.jobStatus = await response.json();
                this.errorMessage = '';
            } catch (error) {
                this.errorMessage = error.message;
                this.jobStatus = null;
            }
        }
    }
};
