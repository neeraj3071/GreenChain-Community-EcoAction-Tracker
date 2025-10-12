#!/usr/bin/env python3
"""
Gmail SMTP Configuration Helper for GreenChain
This script helps you set up Gmail SMTP credentials securely.
"""

import os
import getpass
from pathlib import Path

def setup_gmail_smtp():
    print("🌱 GreenChain Gmail SMTP Setup")
    print("=" * 40)
    
    # Get current directory
    backend_dir = Path(__file__).parent
    env_file = backend_dir / ".env"
    
    if not env_file.exists():
        print("❌ .env file not found!")
        return
    
    print("📧 Please provide your Gmail credentials:")
    print("(Note: You need to generate an App Password from Google Account Security)")
    print()
    
    # Get Gmail address
    gmail_address = input("Enter your Gmail address: ").strip()
    
    if not gmail_address.endswith("@gmail.com"):
        print("⚠️  Warning: Make sure you're using a Gmail address (@gmail.com)")
    
    # Get App Password securely
    print("\n🔐 Enter your Gmail App Password:")
    print("(This should be a 16-character password from Google Account Security)")
    app_password = getpass.getpass("App Password: ").strip()
    
    if len(app_password) != 16:
        print("⚠️  Warning: App passwords are typically 16 characters long")
    
    # Read current .env file
    with open(env_file, 'r') as f:
        content = f.read()
    
    # Replace credentials
    content = content.replace("EMAIL_ADDRESS=your-gmail@gmail.com", f"EMAIL_ADDRESS={gmail_address}")
    content = content.replace("EMAIL_PASSWORD=your-16-char-app-password", f"EMAIL_PASSWORD={app_password}")
    
    # Write back to .env file
    with open(env_file, 'w') as f:
        f.write(content)
    
    print("\n✅ Gmail SMTP credentials updated successfully!")
    print(f"📧 Email: {gmail_address}")
    print("🔐 Password: [HIDDEN]")
    print("\n🚀 Restart your backend server to apply the changes.")
    print("\nTo test: Send a POST request to /api/auth/test-email")

if __name__ == "__main__":
    try:
        setup_gmail_smtp()
    except KeyboardInterrupt:
        print("\n\n❌ Setup cancelled.")
    except Exception as e:
        print(f"\n❌ Error: {e}")