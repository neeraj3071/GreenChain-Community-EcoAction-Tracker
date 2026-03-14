import os
import random
import string
import aiosmtplib
from pathlib import Path
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
from app.services.database import get_collection
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parents[2]
load_dotenv(BASE_DIR / ".env")

class EmailService:
    def __init__(self):
        self.smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.email_address = os.getenv("EMAIL_ADDRESS") or os.getenv("GMAIL_EMAIL")
        raw_password = os.getenv("EMAIL_PASSWORD") or os.getenv("GMAIL_APP_PASSWORD") or ""
        self.email_password = raw_password.replace(" ", "").strip()  # App password for Gmail
        self.smtp_timeout_seconds = float(os.getenv("SMTP_TIMEOUT_SECONDS", "15"))
        self.frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
        
    def generate_otp(self, length=6):
        """Generate a random OTP"""
        return ''.join(random.choices(string.digits, k=length))
    
    async def send_otp_email(self, to_email: str, otp: str, purpose: str = "verification"):
        """Send OTP via email"""
        if not self.email_address or not self.email_password or self.email_address == "your-gmail@gmail.com":
            print("⚠️ Email credentials not configured. OTP email was not sent.")
            return False
        
        try:
            # Create message
            message = MIMEMultipart()
            message["From"] = self.email_address
            message["To"] = to_email
            message["Subject"] = f"GreenChain - Your {purpose.title()} Code"
            
            # Email body
            body = f"""
            <html>
            <head></head>
            <body>
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #22c55e;">🌱 GreenChain</h2>
                    <p>Hello!</p>
                    <p>Your {purpose} code is:</p>
                    <div style="background-color: #f0f9ff; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
                        <h1 style="color: #22c55e; font-size: 32px; letter-spacing: 8px; margin: 0;">{otp}</h1>
                    </div>
                    <p>This code will expire in 10 minutes.</p>
                    <p>If you didn't request this code, please ignore this email.</p>
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                    <p style="color: #6b7280; font-size: 12px;">
                        Best regards,<br>
                        The GreenChain Team 🌍
                    </p>
                </div>
            </body>
            </html>
            """
            
            message.attach(MIMEText(body, "html"))
            
            # Send email
            await aiosmtplib.send(
                message,
                hostname=self.smtp_server,
                port=self.smtp_port,
                start_tls=True,
                username=self.email_address,
                password=self.email_password,
                timeout=self.smtp_timeout_seconds,
            )
            
            print(f"✅ OTP email sent to {to_email}")
            return True
            
        except Exception as e:
            print(f"❌ Failed to send email: {e}")
            return False
    
    async def store_otp(self, email: str, otp: str, purpose: str = "verification"):
        """Store OTP in database with expiration"""
        otps_collection = await get_collection("otps")
        
        # Remove existing OTPs for this email and purpose
        await otps_collection.delete_many({"email": email, "purpose": purpose})
        
        # Store new OTP
        otp_doc = {
            "email": email,
            "otp": otp,
            "purpose": purpose,
            "created_at": datetime.utcnow(),
            "expires_at": datetime.utcnow() + timedelta(minutes=10),
            "used": False
        }
        
        await otps_collection.insert_one(otp_doc)
        print(f"🔐 OTP stored for {email}: {otp}")
    
    async def verify_otp(self, email: str, provided_otp: str, purpose: str = "verification"):
        """Verify OTP"""
        otps_collection = await get_collection("otps")
        
        # Find valid OTP
        otp_doc = await otps_collection.find_one({
            "email": email,
            "otp": provided_otp,
            "purpose": purpose,
            "used": False,
            "expires_at": {"$gt": datetime.utcnow()}
        })
        
        if otp_doc:
            # Mark OTP as used
            await otps_collection.update_one(
                {"_id": otp_doc["_id"]},
                {"$set": {"used": True, "used_at": datetime.utcnow()}}
            )
            print(f"✅ OTP verified for {email}")
            return True
        
        print(f"❌ Invalid or expired OTP for {email}")
        return False
    
    async def send_verification_otp(self, email: str):
        """Send email verification OTP"""
        try:
            otp = self.generate_otp()
            print(f"📧 Generated OTP for {email}: {otp}")
            await self.store_otp(email, otp, "email_verification")
            email_sent = await self.send_otp_email(email, otp, "email verification")
            if not email_sent:
                raise RuntimeError("Unable to send OTP email. Check Gmail app password and SMTP settings.")
            return otp
        except Exception as e:
            print(f"❌ Error in send_verification_otp: {e}")
            raise e
    
    async def send_login_otp(self, email: str):
        """Send login 2FA OTP"""
        try:
            otp = self.generate_otp()
            print(f"📧 Generated login OTP for {email}: {otp}")
            await self.store_otp(email, otp, "login_2fa")
            email_sent = await self.send_otp_email(email, otp, "login verification")
            if not email_sent:
                raise RuntimeError("Unable to send OTP email. Check Gmail app password and SMTP settings.")
            return otp
        except Exception as e:
            print(f"❌ Error in send_login_otp: {e}")
            raise e
    
    async def send_welcome_email(self, to_email: str, username: str, full_name: str = None):
        """Send welcome email to new users"""
        try:
            display_name = full_name if full_name else username
            
            if not self.email_address or not self.email_password or self.email_address == "your-gmail@gmail.com":
                print("⚠️ Email credentials not configured. Welcome email was not sent.")
                return False
            
            # Create message
            message = MIMEMultipart()
            message["From"] = self.email_address
            message["To"] = to_email
            message["Subject"] = f"🌱 Welcome to GreenChain, {display_name}!"
            
            # Welcome email body
            body = f"""
            <html>
            <head></head>
            <body>
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="font-size: 48px; margin: 0;">🌱</h1>
                        <h2 style="color: white; font-size: 28px; margin: 10px 0;">Welcome to GreenChain!</h2>
                    </div>
                </div>
                
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px 20px; background: white; border: 1px solid #e5e7eb;">
                    <h3 style="color: #22c55e; font-size: 24px;">Hi {display_name}! 👋</h3>
                    
                    <p style="font-size: 16px; line-height: 1.6; color: #374151;">
                        Welcome to <strong>GreenChain</strong> - the community-driven platform where your eco-friendly actions make a real impact! 🌍
                    </p>
                    
                    <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #22c55e;">
                        <h4 style="color: #22c55e; margin-top: 0;">🚀 Get Started:</h4>
                        <ul style="color: #374151; line-height: 1.6;">
                            <li><strong>Track Actions:</strong> Log your eco-friendly activities</li>
                            <li><strong>Earn Points:</strong> Get rewarded for sustainable choices</li>
                            <li><strong>Join Challenges:</strong> Participate in community challenges</li>
                            <li><strong>Connect:</strong> Find and connect with eco-warriors</li>
                            <li><strong>Make Impact:</strong> See your CO2 savings grow</li>
                        </ul>
                    </div>
                    
                    <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h4 style="color: #16a34a; margin-top: 0;">🏆 Your Journey Starts Now!</h4>
                        <p style="color: #374151; margin-bottom: 0;">
                            Every small action counts toward a greener future. Start logging your eco-actions today and watch your positive impact grow!
                        </p>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="{self.frontend_url}" style="background: #22c55e; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                            🌱 Start Your Green Journey
                        </a>
                    </div>
                    
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                    
                    <p style="color: #6b7280; font-size: 14px; text-align: center;">
                        Questions? Just reply to this email - we're here to help! 💚<br>
                        <strong>The GreenChain Team</strong><br>
                        <em>Building a sustainable future, one action at a time</em> 🌍
                    </p>
                </div>
            </body>
            </html>
            """
            
            message.attach(MIMEText(body, "html"))
            
            # Send email
            await aiosmtplib.send(
                message,
                hostname=self.smtp_server,
                port=self.smtp_port,
                start_tls=True,
                username=self.email_address,
                password=self.email_password,
                timeout=self.smtp_timeout_seconds,
            )
            
            print(f"🎉 Welcome email sent to {to_email}")
            return True
            
        except Exception as e:
            print(f"❌ Failed to send welcome email: {e}")
            return False

# Create global instance
email_service = EmailService()