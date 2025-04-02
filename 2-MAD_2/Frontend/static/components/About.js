const About = {
    template: `
    <div class="about-page">
        <div class="container mt-5">
            <div class="row mb-5">
                <div class="col-md-12 text-center">
                    <h2>About Spidey Services</h2>
                    <p class="lead">Your friendly neighborhood solution for all household needs</p>
                </div>
            </div>
            
            <div class="row mb-5">
                <div class="col-md-6">
                    <h3>Our Story</h3>
                    <p>Spidey Services was founded in 2020 by Sanjay, a visionary entrepreneur who noticed a gap in the household services market while roaming around Chennai. Frustrated by the lack of reliable, professional, and timely home services, Sanjay decided to create a platform that connects skilled professionals with homeowners in need.</p>
                    <p>What started as a small operation with just a handful of professionals has now grown into Chennai's most trusted household services platform, serving thousands of satisfied customers across the city.</p>
                </div>
                <div class="col-md-6">
                    <div class="image-container">
                        <img src="/static/founder.png" alt="Founder Sanjay" class="img-fluid rounded founder-image">
                        <p class="text-center mt-2"><em>Sanjay, Founder & CEO</em></p>
                    </div>
                </div>
            </div>
            
            <div class="row mb-5">
                <div class="col-md-12">
                    <h3>Our Mission</h3>
                    <p>At Spidey Services, our mission is to transform the way household services are delivered in Chennai. We aim to:</p>
                    <ul>
                        <li>Provide fast, reliable, and high-quality services to every household</li>
                        <li>Create employment opportunities for skilled professionals</li>
                        <li>Ensure transparent pricing and excellent customer service</li>
                        <li>Build a community of trusted service providers and satisfied customers</li>
                    </ul>
                </div>
            </div>
            
            <div class="row mb-5">
                <div class="col-md-12">
                    <h3>Meet Our Team</h3>
                </div>
                <div class="col-md-4">
                    <div class="card team-card">
                        
                        <div class="card-body">
                            <h5 class="card-title">Sanjay</h5>
                            <p class="card-text">Founder & CEO</p>
                            <p class="card-text">A Chennai native with a passion for solving everyday problems. Sanjay's vision drives Spidey Services forward.</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card team-card">
                        
                        <div class="card-body">
                            <h5 class="card-title">Peter Parker</h5>
                            <p class="card-text">Operations Manager</p>
                            <p class="card-text">Ensures that all services are delivered on time and to the highest standards.</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card team-card">
                        
                        <div class="card-body">
                            <h5 class="card-title">Miles</h5>
                            <p class="card-text">Tech Lead</p>
                            <p class="card-text">The genius behind our platform, making sure your experience is smooth and seamless.</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="row mb-5">
                <div class="col-md-12">
                    <h3>Our Values</h3>
                    <div class="row mt-3">
                        <div class="col-md-4 mb-3">
                            <div class="value-box p-3 bg-light rounded">
                                <h5>Reliability</h5>
                                <p>We show up when we say we will and deliver what we promise.</p>
                            </div>
                        </div>
                        <div class="col-md-4 mb-3">
                            <div class="value-box p-3 bg-light rounded">
                                <h5>Quality</h5>
                                <p>We take pride in our work and strive for excellence in every service.</p>
                            </div>
                        </div>
                        <div class="col-md-4 mb-3">
                            <div class="value-box p-3 bg-light rounded">
                                <h5>Integrity</h5>
                                <p>We operate with honesty, transparency, and respect for our customers and team.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="row">
                <div class="col-md-12 text-center">
                    <h3>Join the Spidey Family!</h3>
                    <p>Whether you're looking for reliable home services or you're a skilled professional seeking opportunities, we welcome you to join our growing community.</p>
                    <button class="btn btn-primary mt-3" @click="redirectToLogin">Get Started</button>
                </div>
            </div>
        </div>
    </div>
    `,
    methods: {
        redirectToLogin() {
            this.$router.push('/login');
        }
    }
};
