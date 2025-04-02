from flask import current_app as app, jsonify, request, render_template
from flask_security import login_required, auth_required, roles_required,current_user
from Backend.models import *
from celery.result import AsyncResult
from celery import Celery
from datetime import datetime
from flask_security.utils import verify_password, login_user, hash_password, logout_user,get_token_status
from uuid import uuid4

# In your login route
from flask_security.utils import verify_password, login_user

@app.route('/spideyservices/auth/credentials', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    # Validate input fields
    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    # Fetch user from database
    user = User.query.filter_by(email=email).first()
    
    # Verify user credentials
    if user and verify_password(password, user.password):
        login_user(user)  # Log in the user using Flask-Security
        
        # Generate token using Flask-Security
        token = user.get_auth_token()
        
        # Determine redirect URL based on role
        role = user.roles[0].name if user.roles else None
        if role == 'admin':
            redirect_url = '/spideyservices/admin/overview'
        elif role == 'user_professional':
            redirect_url = '/spideyservices/professionals/overview'
        elif role == 'user_customer':
            redirect_url = '/spideyservices/customers/overview'
        else:
            redirect_url = '/'  # Default redirect if no specific role match
        
        return jsonify({
            "message": "Login successful", 
            "token": token, 
            "role": role,
            "user_id": user.id,
            "redirect_url": redirect_url
        }), 200
    
    return jsonify({"error": "Invalid credentials. Please enter correct credentials."}), 401


@app.route('/spideyservices/auth/signup/customers', methods=['POST'])
def customer_signup():
    data = request.get_json()
    
    # Check if user already exists
    if User.query.filter_by(email=data.get('email')).first():
        return jsonify({"error": "Email already registered"}), 400
    
    # Create new user with customer role
    customer_role = Role.query.filter_by(name='user_customer').first()
    new_user = User(
        email=data.get('email'),
        username=data.get('username'),
        password=hash_password(data.get('password')),
        phone=data.get('phone'),
        pin_code=data.get('pin_code'),
        active=True,
        fs_uniquifier=uuid4().hex,  # Generate a unique identifier
        roles=[customer_role]
    )
    
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({"message": "Customer registered successfully"}), 201

@app.route('/spideyservices/auth/signup/professionals', methods=['POST'])
def professional_signup():
    data = request.get_json()

    # Check if user already exists
    if User.query.filter_by(email=data.get('email')).first():
        return jsonify({"error": "Email already registered"}), 400

    # Validate service type
    service_type = data.get('service_type')
    service = Service.query.filter_by(name=service_type).first()
    if not service:
        return jsonify({"error": f"Invalid service type '{service_type}'. Please select a valid service."}), 400

    # Create new user with professional role
    professional_role = Role.query.filter_by(name='user_professional').first()
    new_user = User(
        email=data.get('email'),
        username=data.get('username'),
        password=hash_password(data.get('password')),
        phone=data.get('phone'),
        pin_code=data.get('pin_code'),
        active=True,
        fs_uniquifier=uuid4().hex,  # Generate a unique identifier
        roles=[professional_role],
        description=data.get('description'),
        service_type=service.name,  # Store validated service type
        experience=data.get('experience'),
        is_approved=False,
        documents_verified=False
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "Professional registered successfully. Awaiting admin approval."}), 201


#logout
@app.route('/spideyservices/auth/logout', methods=['POST'])
@auth_required('token')
def logout():
    try:
        # Logout the current user
        logout_user()
        return jsonify({"message": "Logout successful"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500



# Admin Dashboard Overview
@app.route('/spideyservices/admin/overview', methods=['GET'])
@auth_required('token')
@roles_required('admin')
def admin_overview():
    try:
        # Fetch statistics for the admin dashboard
        total_users = User.query.count()
        total_customers = User.query.join(User.roles).filter(Role.name == 'user_customer').count()
        total_professionals = User.query.join(User.roles).filter(Role.name == 'user_professional').count()

        return jsonify({
            "total_users": total_users,
            "total_customers": total_customers,
            "total_professionals": total_professionals
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Get all user accounts (customers and professionals)
@app.route('/spideyservices/admin/members', methods=['GET'])
@auth_required('token')
@roles_required('admin')
def get_all_members():
    try:
        users = User.query.all()
        user_list = [
            {
                "id": user.id,
                "email": user.email,
                "username": user.username,
                "phone": user.phone,
                "pincode": user.pin_code,
                "roles": [role.name for role in user.roles],
                "active": user.active
            }
            for user in users
        ]
        return jsonify(user_list)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Update user account status (Block/Unblock)
@app.route('/spideyservices/admin/members/<int:member_id>/status', methods=['PATCH'])
@auth_required('token')
@roles_required('admin')
def update_user_status(member_id):
    try:
        data = request.get_json()
        user = User.query.get(member_id)

        if not user:
            return jsonify({"error": "User not found"}), 404

        # Update active status based on the request payload
        if 'active' in data:
            user.active = data['active']
            db.session.commit()
            status = "unblocked" if user.active else "blocked"
            return jsonify({"message": f"User {status} successfully"})
        
        return jsonify({"error": "Invalid payload"}), 400

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Get all service professionals
@app.route('/spideyservices/admin/professionals', methods=['GET'])
@auth_required('token')
@roles_required('admin')
def get_all_professionals():
    try:
        professionals = User.query.join(User.roles).filter(Role.name == 'user_professional').all()
        professional_list = [
            {
                "id": professional.id,
                "email": professional.email,
                "username": professional.username,
                "phone": professional.phone,
                "pincode": professional.pin_code,
                "active": professional.active
            }
            for professional in professionals
        ]
        return jsonify(professional_list)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Update provider verification status (Approve/Reject)
@app.route('/spideyservices/admin/professionals/<int:professional_id>/verification', methods=['PATCH'])
@auth_required('token')
@roles_required('admin')
def update_provider_verification(professional_id):
    try:
        data = request.get_json()
        professional = User.query.get(professional_id)

        if not professional:
            return jsonify({"error": "Professional not found"}), 404

        # Update approval status based on admin's decision
        if 'approved' in data:
            professional.is_approved = data['approved']
            db.session.commit()
            status = "approved" if professional.is_approved else "rejected"
            return jsonify({"message": f"Professional {status} successfully"})
        
        return jsonify({"error": "Invalid payload"}), 400

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Create service data export job (Async Job)
@app.route('/spideyservices/admin/statistics/downloads', methods=['POST'])
@auth_required('token')
@roles_required('admin')
def create_export_job():
    try:
        # Example: Trigger a Celery task to export service data as CSV
        task_id = "example_task_id"  # Replace with actual task ID from Celery when implemented
        return jsonify({"message": "Export job created", "task_id": task_id})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Retrieve monthly activity summary
@app.route('/spideyservices/admin/statistics/performance/monthly', methods=['GET'])
@auth_required('token')
@roles_required('admin')
def get_monthly_summary():
    try:
        # Calculate actual statistics
        total_services_requested = ServiceRequest.query.count()
        total_services_completed = ServiceRequest.query.filter_by(service_status='completed').count()
        
        # Calculate total revenue (assuming there's a price field in Service model)
        total_revenue = db.session.query(func.sum(Service.base_price)).join(ServiceRequest).filter(ServiceRequest.service_status == 'completed').scalar() or 0
        
        # Find top performing service
        top_service = db.session.query(Service.name, func.count(ServiceRequest.id).label('request_count')) \
            .join(ServiceRequest) \
            .group_by(Service.id) \
            .order_by(func.count(ServiceRequest.id).desc()) \
            .first()
        
        top_performing_service = top_service.name if top_service else "N/A"

        summary = {
            "total_services_requested": total_services_requested,
            "total_services_completed": total_services_completed,
            "total_revenue_generated": float(total_revenue),  # Convert to float for JSON serialization
            "top_performing_service": top_performing_service
        }
        return jsonify(summary)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

#Service

# Get all services or create a new service (Admin-only for POST)
@app.route('/spideyservices/admin/services', methods=['GET', 'POST'])
def manage_services():
    if request.method == 'GET':
        # Fetch all services
        services = Service.query.all()
        service_list = [
            {
                "id": service.id,
                "name": service.name,
                "description": service.description,
                "base_price(₹)": service.base_price,
                "time_required": service.time_required
            }
            for service in services
        ]
        return jsonify(service_list)

    elif request.method == 'POST':
        # Create a new service (Admin-only)
        @roles_required('admin')
        def create_service():
            data = request.get_json()
            if not data.get('name') or not data.get('base_price'):
                return jsonify({"error": "Name and Base Price are required"}), 400

            new_service = Service(
                name=data['name'],
                description=data.get('description', ''),
                base_price=data['base_price'],
                time_required=data.get('time_required', 0)
            )
            db.session.add(new_service)
            db.session.commit()

            return jsonify({"message": "Service created successfully", "service_id": new_service.id}), 201

        return create_service()

# Get, update, or delete a specific service (Admin-only for PUT and DELETE)
@app.route('/spideyservices/admin/services/<int:service_id>', methods=['GET', 'PUT', 'DELETE'])
@auth_required('token')
def manage_service_by_id(service_id):
    service = Service.query.get(service_id)

    if not service:
        return jsonify({"error": "Service not found"}), 404

    if request.method == 'GET':
        # Fetch specific service details
        return jsonify({
            "id": service.id,
            "name": service.name,
            "description": service.description,
            "base_price": service.base_price,
            "time_required": service.time_required
        })

    elif request.method == 'PUT':
        # Update specific service details (Admin-only)
        @roles_required('admin')
        def update_service():
            data = request.get_json()
            if 'name' in data:
                service.name = data['name']
            if 'description' in data:
                service.description = data['description']
            if 'base_price' in data:
                service.base_price = data['base_price']
            if 'time_required' in data:
                service.time_required = data['time_required']

            db.session.commit()
            return jsonify({"message": "Service updated successfully"})

        return update_service()

    elif request.method == 'DELETE':
        # Delete specific service (Admin-only)
        @roles_required('admin')
        def delete_service():
            db.session.delete(service)
            db.session.commit()
            return jsonify({"message": "Service deleted successfully"})

        return delete_service()

# Search services by criteria (e.g., name, location, pin code)
@app.route('/spideyservices/admin/services/lookup', methods=['GET'])
@auth_required('token')
def search_services():
    query_params = request.args
    name = query_params.get('name')
    
    # Example search logic (adjust based on your database schema)
    services_query = Service.query
    if name:
        services_query = services_query.filter(Service.name.ilike(f"%{name}%"))

    services = services_query.all()
    results = [
        {
            "id": service.id,
            "name": service.name,
            "description": service.description,
            "base_price": service.base_price,
            "time_required": service.time_required
        }
        for service in services
    ]

    return jsonify(results)


# 1. Get customer dashboard metrics
@app.route('/spideyservices/customers/overview', methods=['GET'])
@auth_required('token')
@roles_required('user_customer')
def customer_dashboard():
    try:
        # Example metrics for the customer dashboard
        total_requests = ServiceRequest.query.filter_by(customer_id=current_user.id).count()
        completed_requests = ServiceRequest.query.filter_by(customer_id=current_user.id, service_status='closed').count()
        pending_requests = ServiceRequest.query.filter_by(customer_id=current_user.id, service_status='requested').count()

        return jsonify({
            "total_requests": total_requests,
            "completed_requests": completed_requests,
            "pending_requests": pending_requests
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# 2. Get or update customer profile
@app.route('/spideyservices/customers/details/<int:customer_id>', methods=['GET', 'PUT'])
@auth_required('token')
@roles_required('user_customer')
def customer_profile(customer_id):
    if current_user.id != customer_id:
        return jsonify({"error": "Unauthorized access"}), 403

    customer = User.query.get(customer_id)
    if not customer:
        return jsonify({"error": "Customer not found"}), 404

    if request.method == 'GET':
        # Fetch customer profile details
        return jsonify({
            "id": customer.id,
            "email": customer.email,
            "username": customer.username,
            "phone": customer.phone,
            "active": customer.active
        })

    elif request.method == 'PUT':
        # Update customer profile details
        data = request.get_json()
        if 'username' in data:
            customer.username = data['username']
        if 'phone' in data:
            customer.phone = data['phone']

        db.session.commit()
        return jsonify({"message": "Profile updated successfully"})
    
@app.route('/spideyservices/customers/bookings', methods=['GET', 'POST'])
@auth_required('token')
@roles_required('user_customer')
def manage_bookings():
    if request.method == 'GET':
        # Fetch all service bookings for the current user
        bookings = ServiceRequest.query.filter_by(customer_id=current_user.id).all()
        booking_list = [
            {
                "id": booking.id,
                "service_id": booking.service_id,
                "service_name": Service.query.get(booking.service_id).name,
                "professional_id": booking.professional_id,
                "date_of_request": booking.date_of_request,
                "date_of_completion": booking.date_of_completion,
                "service_status": booking.service_status,
                "remarks": booking.remarks
            }
            for booking in bookings
        ]
        return jsonify(booking_list)

    elif request.method == 'POST':
        # Create a new service booking
        data = request.get_json()
        if not data.get('service_id'):
            return jsonify({"error": "Service ID is required"}), 400
            
        # Convert string date to Python datetime object if provided
        date_of_request = None
        if data.get('date_of_request'):
            try:
                from datetime import datetime
                
                # Try multiple date formats
                date_formats = [
                    '%Y-%m-%dT%H:%M:%S',  # YYYY-MM-DDTHH:MM:SS
                    '%d-%m-%Y %H:%M',     # DD-MM-YYYY HH:MM
                    '%Y-%m-%d %H:%M:%S',  # YYYY-MM-DD HH:MM:SS
                    '%Y-%m-%dT%H:%M'      # YYYY-MM-DDTHH:MM (without seconds)
                ]
                
                for date_format in date_formats:
                    try:
                        date_of_request = datetime.strptime(data['date_of_request'], date_format)
                        break
                    except ValueError:
                        continue
                        
                if date_of_request is None:
                    return jsonify({"error": "Invalid date format. Accepted formats: YYYY-MM-DDTHH:MM:SS or DD-MM-YYYY HH:MM"}), 400
                    
            except Exception as e:
                return jsonify({"error": f"Date parsing error: {str(e)}"}), 400

        new_booking = ServiceRequest(
            service_id=data['service_id'],
            customer_id=current_user.id,
            date_of_request=date_of_request or datetime.utcnow(),  # Use provided date or current time
            service_status='requested',
            remarks=data.get('remarks', '')
        )
        db.session.add(new_booking)
        db.session.commit()

        return jsonify({"message": "Booking created successfully", "booking_id": new_booking.id}), 201


# 4. Get, update, or close a specific booking
@app.route('/spideyservices/customers/bookings/<int:booking_id>', methods=['GET', 'PUT', 'DELETE'])
@auth_required('token')
@roles_required('user_customer')
def manage_booking_by_id(booking_id):
    booking = ServiceRequest.query.get(booking_id)

    if not booking or booking.customer_id != current_user.id:
        return jsonify({"error": "Booking not found or unauthorized access"}), 404

    if request.method == 'GET':
        # Fetch specific booking details
        return jsonify({
            "id": booking.id,
            "service_id": booking.service_id,
            "service_name": Service.query.get(booking.service_id).name,
            "professional_id": booking.professional_id,
            "date_of_request": booking.date_of_request,
            "date_of_completion": booking.date_of_completion,
            "service_status": booking.service_status,
            "remarks": booking.remarks
        })

    elif request.method == 'PUT':
        # Update specific booking details (e.g., remarks)
        data = request.get_json()
        if 'remarks' in data:
            booking.remarks = data['remarks']
        
        db.session.commit()
        return jsonify({"message": "Booking updated successfully"})

    elif request.method == 'DELETE':
        # Close the service request (mark as closed)
        booking.service_status = 'closed'
        db.session.commit()
        return jsonify({"message": "Booking closed successfully"})


# 5. Add ratings for a completed service
@app.route('/spideyservices/customers/bookings/<int:booking_id>/ratings', methods=['POST'])
@auth_required('token')
@roles_required('user_customer')
def add_ratings(booking_id):
    booking = ServiceRequest.query.get(booking_id)

    if not booking or booking.customer_id != current_user.id:
        return jsonify({"error": "Booking not found or unauthorized access"}), 404

    if booking.service_status != 'closed':
        return jsonify({"error": "Cannot rate a service that is not completed"}), 400

    data = request.get_json()
    if not data.get('rating') or not (1 <= data['rating'] <= 5):
        return jsonify({"error": "Rating must be between 1 and 5"}), 400

    # Assuming you have a column `rating` in the `ServiceRequest` model
    booking.rating = data['rating']
    db.session.commit()

    return jsonify({"message": "Rating added successfully"})




# 1. Get professional dashboard metrics
@app.route('/spideyservices/professionals/overview', methods=['GET'])
@auth_required('token')
@roles_required('user_professional')
def professional_dashboard():
    try:
        # Example metrics for the professional dashboard
        total_assigned_requests = ServiceRequest.query.filter_by(professional_id=current_user.id, service_status='assigned').count()
        completed_requests = ServiceRequest.query.filter_by(professional_id=current_user.id, service_status='closed').count()
        pending_requests = ServiceRequest.query.filter_by(professional_id=current_user.id, service_status='requested').count()

        return jsonify({
            "total_assigned_requests": total_assigned_requests,
            "completed_requests": completed_requests,
            "pending_requests": pending_requests
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# 2. Get or update professional profile
@app.route('/spideyservices/professionals/details/<int:professional_id>', methods=['GET', 'PUT'])
@auth_required('token')
@roles_required('user_professional')
def professional_profile(professional_id):
    if current_user.id != professional_id:
        return jsonify({"error": "Unauthorized access"}), 403

    professional = User.query.get(professional_id)
    if not professional:
        return jsonify({"error": "Professional not found"}), 404

    if request.method == 'GET':
        # Fetch professional profile details
        return jsonify({
            "id": professional.id,
            "email": professional.email,
            "username": professional.username,
            "phone": professional.phone,
            "active": professional.active
        })

    elif request.method == 'PUT':
        # Update professional profile details
        data = request.get_json()
        if 'username' in data:
            professional.username = data['username']
        if 'phone' in data:
            professional.phone = data['phone']

        db.session.commit()
        return jsonify({"message": "Profile updated successfully"})


# 3. Get all unassigned service bookings
@app.route('/spideyservices/professionals/unassigned', methods=['GET'])
@auth_required('token')
@roles_required('user_professional')
def get_unassigned_bookings():
    try:
        # Fetch all unassigned service requests
        unassigned_bookings = ServiceRequest.query.filter_by(professional_id=None).all()
        
        if not unassigned_bookings:
            return jsonify([]), 200
        
        # Use a more efficient query with joins to avoid N+1 query problem
        booking_list = []
        for booking in unassigned_bookings:
            service = Service.query.get(booking.service_id)
            customer = User.query.get(booking.customer_id)
            
            if not service or not customer:
                continue
                
            booking_list.append({
                "id": booking.id,
                "service_id": booking.service_id,
                "service_name": service.name,
                "customer_id": booking.customer_id,
                "customer_name": customer.username,
                "customer_phone": customer.phone,
                "customer_pincode": customer.pin_code,
                "date_of_request": booking.date_of_request,
                "remarks": booking.remarks,
                "service_status": booking.service_status
            })
        
        return jsonify(booking_list)
    except Exception as e:
        app.logger.error(f"Error fetching unassigned bookings: {str(e)}")
        return jsonify({"error": "Failed to retrieve unassigned bookings. Please try again later."}), 500



@app.route('/spideyservices/professionals/bookings', methods=['GET'])
@auth_required('token')
@roles_required('user_professional')
def get_assigned_bookings():
    try:
        # Fetch all assigned service bookings for the current professional
        bookings = ServiceRequest.query.filter_by(professional_id=current_user.id).all()
        
        if not bookings:
            return jsonify([]), 200
            
        booking_list = []
        for booking in bookings:
            service = Service.query.get(booking.service_id)
            customer = User.query.get(booking.customer_id)
            
            if not service or not customer:
                continue
                
            booking_list.append({
                "id": booking.id,
                "service_id": booking.service_id,
                "service_name": service.name,
                "customer_id": booking.customer_id,
                "customer_name": customer.username,
                "customer_phone": customer.phone,
                "customer_pincode": customer.pin_code,
                "date_of_request": booking.date_of_request,
                "date_of_completion": booking.date_of_completion,
                "service_status": booking.service_status,
                "remarks": booking.remarks
            })
            
        return jsonify(booking_list)
    except Exception as e:
        app.logger.error(f"Error fetching assigned bookings: {str(e)}")
        return jsonify({"error": "Failed to retrieve assigned bookings. Please try again later."}), 500


@app.route('/spideyservices/professionals/bookings/<int:booking_id>/status', methods=['PATCH'])
@auth_required('token')
@roles_required('user_professional')
def update_booking_status(booking_id):
    try:
        booking = ServiceRequest.query.get(booking_id)

        if not booking:
            return jsonify({"error": "Booking not found"}), 404
            
        # Ensure the booking is either unassigned or already assigned to the current professional
        if booking.professional_id and booking.professional_id != current_user.id:
            return jsonify({"error": "Unauthorized access. This booking is assigned to another professional."}), 403

        data = request.get_json()
        if not data or 'service_status' not in data:
            return jsonify({"error": "Missing service_status in request payload"}), 400

        # Validate the service status
        if data['service_status'] not in ['accepted', 'rejected', 'completed']:
            return jsonify({"error": "Invalid service status. Must be 'accepted', 'rejected', or 'completed'"}), 400

        # Update service status based on the request payload
        if data['service_status'] == 'accepted':
            # Assign professional ID when accepted
            booking.professional_id = current_user.id
            booking.service_status = 'assigned'
        elif data['service_status'] == 'rejected':
            booking.service_status = 'rejected'
        elif data['service_status'] == 'completed':
            if booking.professional_id != current_user.id:
                return jsonify({"error": "Only assigned professionals can complete this request"}), 403
            booking.service_status = 'completed'
            booking.date_of_completion = datetime.utcnow()

        db.session.commit()
        return jsonify({
            "message": f"Booking status updated to {data['service_status']} successfully",
            "booking_id": booking.id,
            "new_status": booking.service_status
        })

    except Exception as e:
        app.logger.error(f"Error updating booking status: {str(e)}")
        db.session.rollback()
        return jsonify({"error": "Failed to update booking status. Please try again later."}), 500


# 1. Get all service bookings (Admin only)
@app.route('/spideyservices/admin/bookings', methods=['GET'])
@auth_required('token')
@roles_required('admin')
def get_all_bookings():
    try:
        # Fetch all service bookings
        bookings = ServiceRequest.query.all()
        booking_list = [
            {
                "id": booking.id,
                "service_id": booking.service_id,
                "service_name": Service.query.get(booking.service_id).name,
                "customer_id": booking.customer_id,
                "customer_name": User.query.get(booking.customer_id).username,  # Fetch customer name
                "customer_phone": User.query.get(booking.customer_id).phone,  # Fetch customer phone
                "customer_pincode": User.query.get(booking.customer_id).pin_code,  # Fetch customer pin code
                "professional_id": booking.professional_id,
                "date_of_request": booking.date_of_request,
                "date_of_completion": booking.date_of_completion,
                "service_status": booking.service_status,
                "remarks": booking.remarks
            }
            for booking in bookings
        ]
        return jsonify(booking_list)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# 2. Get details of a specific booking
@app.route('/spideyservices/admin/bookings/<int:booking_id>', methods=['GET'])
@auth_required('token')
def get_booking_by_id(booking_id):
    try:
        # Fetch specific service booking details
        booking = ServiceRequest.query.get(booking_id)

        if not booking:
            return jsonify({"error": "Booking not found"}), 404

        return jsonify({
            "id": booking.id,
            "service_id": booking.service_id,
            "service_name": Service.query.get(booking.service_id).name,
            "customer_id": booking.customer_id,
            "customer_name": User.query.get(booking.customer_id).username,  # Fetch customer name
            "customer_phone": User.query.get(booking.customer_id).phone,  # Fetch customer phone
            "customer_pincode": User.query.get(booking.customer_id).pin_code,  # Fetch customer pin code
            "professional_id": booking.professional_id,
            "date_of_request": booking.date_of_request,
            "date_of_completion": booking.date_of_completion,
            "service_status": booking.service_status,
            "remarks": booking.remarks
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# 3. Query bookings by parameters (e.g., service status, customer ID)
@app.route('/spideyservices/admin/bookings/lookup', methods=['GET'])
@auth_required('token')
def query_bookings():
    try:
        query_params = request.args
        service_status = query_params.get('service_status')
        customer_id = query_params.get('customer_id')
        professional_id = query_params.get('professional_id')

        # Initialize query
        bookings_query = ServiceRequest.query

        # Apply filters based on query parameters
        if service_status:
            bookings_query = bookings_query.filter(ServiceRequest.service_status == service_status)
        if customer_id:
            bookings_query = bookings_query.filter(ServiceRequest.customer_id == int(customer_id))
        if professional_id:
            bookings_query = bookings_query.filter(ServiceRequest.professional_id == int(professional_id))

        # Execute query and fetch results
        bookings = bookings_query.all()
        results = [
            {
                "id": booking.id,
                "service_id": booking.service_id,
                "service_name": Service.query.get(booking.service_id).name,
                "customer_id": booking.customer_id,
                "customer_name": User.query.get(booking.customer_id).username,  # Fetch customer name
                "customer_phone": User.query.get(booking.customer_id).phone,  # Fetch customer phone
                "customer_pincode": User.query.get(booking.customer_id).pin_code,  # Fetch customer pin code
                "professional_id": booking.professional_id,
                "date_of_request": booking.date_of_request,
                "date_of_completion": booking.date_of_completion,
                "service_status": booking.service_status,
                "remarks": booking.remarks
            }
            for booking in bookings
        ]

        return jsonify(results)
    except Exception as e:
        return jsonify({"error": str(e)}), 500



# Configure Celery with Flask and Redis
def make_celery(app):
    celery = Celery(
        app.import_name,
        backend='redis://localhost:6379/0',
        broker='redis://localhost:6379/0'
    )
    celery.conf.update(app.config)
    return celery

celery = make_celery(app)

# 1. Trigger daily reminder job for professionals
@app.route('/spideyservices/jobs/reminders/daily', methods=['POST'])
def trigger_daily_reminders():
    task = send_daily_reminders.apply_async()
    return jsonify({"message": "Daily reminders task triggered", "task_id": task.id}), 202

@celery.task
def send_daily_reminders():
    # Logic to send reminders to professionals
    # Example: Fetch pending service requests and send reminders via email/SMS/Google Chat webhook
    professionals = User.query.join(ServiceRequest).filter(ServiceRequest.service_status == 'requested').all()
    for professional in professionals:
        # Send reminder logic (e.g., email or SMS)
        print(f"Reminder sent to professional: {professional.email}")
    return {"status": "Reminders sent successfully", "timestamp": str(datetime.utcnow())}


# 2. Trigger monthly activity report generation
@app.route('/spideyservices/jobs/reports/monthly', methods=['POST'])
def trigger_monthly_report():
    task = generate_monthly_report.apply_async()
    return jsonify({"message": "Monthly report generation task triggered", "task_id": task.id}), 202

@celery.task
def generate_monthly_report():
    # Logic to generate monthly activity report for customers and send via email
    customers = User.query.filter(User.roles.any(name='user_customer')).all()
    report_data = []
    for customer in customers:
        total_requests = ServiceRequest.query.filter_by(customer_id=customer.id).count()
        closed_requests = ServiceRequest.query.filter_by(customer_id=customer.id, service_status='closed').count()
        report_data.append({
            "customer_email": customer.email,
            "total_requests": total_requests,
            "closed_requests": closed_requests
        })
        # Send report via email (use an email library like Flask-Mail)
        print(f"Monthly report sent to customer: {customer.email}")
    return {"status": "Monthly reports generated successfully", "timestamp": str(datetime.utcnow())}


# 3. Check status of an asynchronous task
@app.route('/spideyservices/jobs/<task_id>/status', methods=['GET'])
def check_task_status(task_id):
    task_result = AsyncResult(task_id, app=celery)
    result = {
        "task_id": task_id,
        "task_status": task_result.status,
        "task_result": task_result.result
    }
    return jsonify(result), 200









@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
    # Only handle non-API routes with the catch-all
    if path.startswith('api/'):
        return {"error": "Not found"}, 404
    return render_template("index.html")