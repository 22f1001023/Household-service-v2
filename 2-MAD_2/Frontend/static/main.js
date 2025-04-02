const routes = [
    {path: '/', component: Home},
    {path: '/about', component: About},
    {path: '/login', component: Login},
    {path: '/signup/customers', component: RegisterCustomer },
    {path: '/signup/professionals', component: RegisterProfessional },
    {path: '/spideyservices/admin/overview', component: AdminDashboard },
    {path: '/spideyservices/admin/services', component: AdminServices },
    {path: '/spideyservices/admin/members', component: AdminAllUser },
    {path: '/spideyservices/admin/professionals', component: AdminProfApprove },
    {path: '/spideyservices/admin/download', component: AdminDownload },
    {path: '/spideyservices/admin/performance', component: AdminPerformance },
    {path: '/spideyservices/admin/navbar', component: AdminNavbar },
    {path: '/spideyservices/admin/bookings', component: AdminBookings },
    {path: '/spideyservices/admin/bookings/lookup', component: AdminSearchBookings },
    {path: '/spideyservices/professionals/overview', component: ProfessionalDashboard },
    {path: '/spideyservices/professionals/navbar', component: ProfessionalNavbar },
    {path: '/spideyservices/professionals/details/:id', component: ProfessionalProfile},
    {path: '/spideyservices/professionals/unassigned', component: ProfessionalUnassigned},
    {path: '/spideyservices/professionals/bookings', component: ProfessionalAssigned},
    {path: '/spideyservices/customers/navbar', component: CustomerNavbar },
    {path: '/spideyservices/customers/overview', component: CustomerDashboard},
    {path: '/spideyservices/customers/details/:id', component: CustomerProfile},
    {path: '/spideyservices/customers/bookings/new', component: CustomerNewBookings},
    {path: '/spideyservices/customers/bookings', component: CustomerBookings},
    {path: '/spideyservices/customers/ratings', component: CustomerRatings},

];

const router = new VueRouter({
    routes,
    mode: 'history'
});

new Vue({
    el: '#app',
    router,
    template: `
    <div class="app"> 
    <nav-bar></nav-bar>
    <router-view></router-view>
    <foot></foot>
    </div>`,
    components: {
        'nav-bar': Navbar,
        'foot': Footer
    },
});