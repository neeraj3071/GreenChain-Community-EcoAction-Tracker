from fastapi import APIRouter, HTTPException, status, Depends
from datetime import timedelta, datetime
from pydantic import BaseModel

from app.models.schemas import UserCreate, UserLogin, Token, UserResponse, User
from app.services.auth_service import (
    get_password_hash,
    authenticate_user,
    create_access_token,
    get_current_user,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from app.services.database import get_collection
from app.services.email_service import email_service

# Additional schemas for OTP
class OTPRequest(BaseModel):
    email: str

class OTPVerification(BaseModel):
    email: str
    otp: str

class RegisterWithOTP(BaseModel):
    email: str
    username: str
    password: str
    full_name: str
    otp: str

class LoginWithOTP(BaseModel):
    email: str
    password: str
    otp: str

# Schema for registration with auto-login
class RegisterWithOTPResponse(BaseModel):
    user: UserResponse
    access_token: str
    token_type: str

router = APIRouter()

@router.post("/register", response_model=UserResponse)
async def register_user(user: UserCreate):
    """Register a new user"""
    users_collection = await get_collection("users")
    
    # Check if user already exists
    existing_user = await users_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Check if username is taken
    existing_username = await users_collection.find_one({"username": user.username})
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
    
    # Create new user
    user_data = {
        "email": user.email,
        "username": user.username,
        "hashed_password": get_password_hash(user.password),
        "full_name": user.full_name,
        "total_points": 0,
        "total_co2_saved": 0.0,
        "created_at": datetime.utcnow(),
        "is_active": True
    }
    
    result = await users_collection.insert_one(user_data)
    user_data["_id"] = result.inserted_id
    
    return UserResponse(
        id=str(result.inserted_id),
        email=user_data["email"],
        username=user_data["username"],
        full_name=user_data["full_name"],
        total_points=user_data["total_points"],
        total_co2_saved=user_data["total_co2_saved"],
        created_at=user_data["created_at"]
    )

@router.post("/login", response_model=Token)
async def login_user(user_credentials: UserLogin):
    """Authenticate user and return access token"""
    user = await authenticate_user(user_credentials.email, user_credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_user)):
    """Get current user profile"""
    return UserResponse(
        id=str(current_user.id),
        email=current_user.email,
        username=current_user.username,
        full_name=current_user.full_name,
        total_points=current_user.total_points,
        total_co2_saved=current_user.total_co2_saved,
        created_at=current_user.created_at
    )

# OTP-related endpoints
@router.post("/send-verification-otp")
async def send_verification_otp(request: OTPRequest):
    """Send OTP for email verification during registration"""
    try:
        print(f"📧 Received OTP request for email: {request.email}")
        users_collection = await get_collection("users")
        
        # Check if user already exists
        existing_user = await users_collection.find_one({"email": request.email})
        if existing_user:
            print(f"❌ Email {request.email} already registered")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        print(f"✅ Email {request.email} is available, sending OTP...")
        # Send OTP
        otp = await email_service.send_verification_otp(request.email)
        print(f"✅ OTP sent successfully: {otp}")
        
        return {"message": "OTP sent to your email", "email": request.email}
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error sending verification OTP: {e}")
        print(f"❌ Error type: {type(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send OTP: {str(e)}"
        )

@router.post("/send-login-otp")
async def send_login_otp(request: OTPRequest):
    """Send OTP for 2FA during login"""
    try:
        users_collection = await get_collection("users")
        
        # Check if user exists
        existing_user = await users_collection.find_one({"email": request.email})
        if not existing_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Send OTP
        await email_service.send_login_otp(request.email)
        
        return {"message": "OTP sent to your email", "email": request.email}
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error sending login OTP: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send OTP: {str(e)}"
        )

@router.post("/verify-otp")
async def verify_otp(request: OTPVerification):
    """Verify OTP for any purpose"""
    try:
        is_valid = await email_service.verify_otp(
            request.email, 
            request.otp, 
            "email_verification"  # Default to email verification
        )
        
        if not is_valid:
            # Also try login 2FA
            is_valid = await email_service.verify_otp(
                request.email, 
                request.otp, 
                "login_2fa"
            )
        
        if is_valid:
            return {"message": "OTP verified successfully", "valid": True}
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired OTP"
            )
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error verifying OTP: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to verify OTP"
        )

@router.post("/test-email")
async def test_email_setup():
    """Test email configuration"""
    try:
        # Test with a simple email
        test_otp = "123456"
        success = await email_service.send_otp_email(
            "test@example.com", 
            test_otp, 
            "testing"
        )
        
        if success:
            return {"message": "Email configuration test successful!", "status": "working"}
        else:
            return {"message": "Email configuration test failed!", "status": "failed"}
            
    except Exception as e:
        print(f"❌ Email test error: {e}")
        return {"message": f"Email test failed: {str(e)}", "status": "error"}

class WelcomeEmailRequest(BaseModel):
    email: str
    username: str
    full_name: str = None

@router.post("/test-welcome-email")
async def test_welcome_email(request: WelcomeEmailRequest):
    """Test welcome email sending"""
    try:
        success = await email_service.send_welcome_email(
            request.email,
            request.username, 
            request.full_name
        )
        
        if success:
            return {
                "message": f"Welcome email sent to {request.email}!", 
                "status": "success"
            }
        else:
            return {
                "message": "Failed to send welcome email", 
                "status": "failed"
            }
            
    except Exception as e:
        print(f"❌ Welcome email test error: {e}")
        return {
            "message": f"Welcome email test failed: {str(e)}", 
            "status": "error"
        }

@router.post("/register-with-otp", response_model=RegisterWithOTPResponse)
async def register_with_otp(user: RegisterWithOTP):
    """Register a new user with OTP verification and auto-login"""
    try:
        # First verify OTP
        is_valid = await email_service.verify_otp(
            user.email, 
            user.otp, 
            "email_verification"
        )
        
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired OTP"
            )
        
        users_collection = await get_collection("users")
        
        # Check if user already exists (double check)
        existing_user = await users_collection.find_one({"email": user.email})
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Check if username is taken
        existing_username = await users_collection.find_one({"username": user.username})
        if existing_username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
        
        # Create new user
        user_data = {
            "email": user.email,
            "username": user.username,
            "hashed_password": get_password_hash(user.password),
            "full_name": user.full_name,
            "total_points": 0,
            "total_co2_saved": 0.0,
            "created_at": datetime.utcnow(),
            "is_active": True,
            "email_verified": True  # Since OTP was verified
        }
        
        result = await users_collection.insert_one(user_data)
        user_data["_id"] = result.inserted_id
        
        # Send welcome email to new user
        try:
            await email_service.send_welcome_email(
                user.email, 
                user.username, 
                user.full_name
            )
            print(f"🎉 Welcome email sent to new user: {user.email}")
        except Exception as e:
            print(f"⚠️ Failed to send welcome email to {user.email}: {e}")
            # Don't fail registration if welcome email fails
        
        # Create access token for auto-login
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email}, expires_delta=access_token_expires
        )
        
        user_response = UserResponse(
            id=str(result.inserted_id),
            email=user_data["email"],
            username=user_data["username"],
            full_name=user_data["full_name"],
            total_points=user_data["total_points"],
            total_co2_saved=user_data["total_co2_saved"],
            created_at=user_data["created_at"]
        )
        
        print(f"✅ User {user.email} registered and logged in automatically")
        
        return RegisterWithOTPResponse(
            user=user_response,
            access_token=access_token,
            token_type="bearer"
        )
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error in OTP registration: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed"
        )

@router.post("/login-with-otp", response_model=Token)
async def login_with_otp(credentials: LoginWithOTP):
    """Login with password and OTP verification"""
    try:
        # First authenticate with password
        user = await authenticate_user(credentials.email, credentials.password)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Then verify OTP
        is_valid = await email_service.verify_otp(
            credentials.email, 
            credentials.otp, 
            "login_2fa"
        )
        
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired OTP"
            )
        
        # Create access token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email}, expires_delta=access_token_expires
        )
        
        return {"access_token": access_token, "token_type": "bearer"}
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error in OTP login: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed"
        )

@router.post("/verify-login-otp", response_model=Token)
async def verify_login_otp(request: OTPVerification):
    """Verify login OTP and automatically log user in"""
    try:
        users_collection = await get_collection("users")
        
        # Check if user exists
        user_doc = await users_collection.find_one({"email": request.email})
        if not user_doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Verify OTP
        is_valid = await email_service.verify_otp(
            request.email, 
            request.otp, 
            "login_2fa"
        )
        
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired OTP"
            )
        
        # Create access token - auto login after OTP verification
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user_doc["email"]}, expires_delta=access_token_expires
        )
        
        print(f"✅ Login OTP verified, user {request.email} logged in automatically")
        return {"access_token": access_token, "token_type": "bearer"}
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error verifying login OTP: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to verify OTP and login"
        )