const Home = {
    template: `
    <div class="household-home">
        <div class="container mt-4">
            <div class="row mb-4 text-dark">
                <div class="col-md-12">
                    <h2>Welcome to Spidey Services!</h2>
                    <p>
                        Your friendly neighborhood solution for all household needs. From web-slinging cleaners to wall-crawling plumbers, we've got you covered. Our superhero professionals ensure a seamless and stress-free home experience.
                    </p>
                </div>
            </div>
            <div class="row justify-content-between align-items-center">
                <div class="col-md-6 col-sm-12 mb-4">
                    <div class="image-container">
                        <img
                            src="/static/spideymain.png"
                            alt="Spidey Cleaning Service"
                            class="img-fluid rounded home-image"
                        />
                    </div>
                </div>
                <div class="col-md-6 col-sm-12 mb-4">
                    <div class="image-container">
                        <img
                            src="/static/spideymain2.png"
                            alt="Spidey Plumbing Service"
                            class="img-fluid rounded home-image"
                        />
                    </div>
                </div>
            </div>
            <div class="row mt-5">
                <div class="col-md-12">
                    <h3 class="mb-4">Our Top Services</h3>
                    <div class="row">
                        <div class="col-md-4 mb-4" v-for="service in topServices" :key="service.id">
                            <div class="card service-card h-100">
                                <img :src="service.image" :alt="service.name" class="card-img-top service-image">
                                <div class="card-body">
                                    <h5 class="card-title">{{ service.name }}</h5>
                                    <p class="card-text">{{ service.description }}</p>
                                </div>
                                <div class="card-footer bg-transparent border-0">
                                    <button class="btn btn-primary" @click="redirectToLogin">Book Now</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row mt-5">
                <div class="col-md-12 text-center">
                    <h3>Why Choose Spidey Services?</h3>
                    <div class="row mt-4">
                        <div class="col-md-4 mb-3">
                            <div class="feature-box">
                                <i class="fas fa-bolt feature-icon"></i>
                                <h5>Super Fast Response</h5>
                                <p>Our heroes arrive faster than you can say "Spider-Man"!</p>
                            </div>
                        </div>
                        <div class="col-md-4 mb-3">
                            <div class="feature-box">
                                <i class="fas fa-shield-alt feature-icon"></i>
                                <h5>Quality Guaranteed</h5>
                                <p>With great power comes great responsibility to deliver excellence.</p>
                            </div>
                        </div>
                        <div class="col-md-4 mb-3">
                            <div class="feature-box">
                                <i class="fas fa-dollar-sign feature-icon"></i>
                                <h5>Competitive Pricing</h5>
                                <p>Heroic services that won't break your bank!</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            topServices: [
                { 
                    id: 1, 
                    name: "Web-Slinging Cleaning", 
                    description: "Our cleaning heroes swing into action, leaving your home spotless and sparkling in no time.", 
                    image: "/static/spideyservices.png" 
                },
                { 
                    id: 2, 
                    name: "Wall-Crawling Plumbing", 
                    description: "No leak is too challenging for our plumbers who can reach and fix those impossible spots with ease.", 
                    image: "/static/plumbing.png" 
                },
                { 
                    id: 3, 
                    name: "Spider-Sense Electrical", 
                    description: "Our electricians detect and fix issues before they become problems, keeping your home safe and powered up.", 
                    image: "/static/Electrical.png" 
                }
            ]
        };
    },
    methods: {
        redirectToLogin() {
            this.$router.push('/login');
        }
    }
};
