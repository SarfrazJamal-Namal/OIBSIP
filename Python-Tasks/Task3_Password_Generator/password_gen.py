"""
Secure Password Generator
OASIS INFOBYTE - Python Programming Internship
Task 3: Password Generator
"""

import random
import string
import pyperclip
import sys

def generate_password(length, use_upper, use_lower, use_digits, use_special):
    """Generate a random password based on user preferences"""
    
    # Build character pool
    char_pool = ""
    if use_upper:
        char_pool += string.ascii_uppercase
    if use_lower:
        char_pool += string.ascii_lowercase
    if use_digits:
        char_pool += string.digits
    if use_special:
        char_pool += string.punctuation
    
    # Check if at least one character type is selected
    if not char_pool:
        return None
    
    # Generate password
    password = ''.join(random.choice(char_pool) for _ in range(length))
    return password

def check_password_strength(password):
    """Evaluate password strength"""
    score = 0
    feedback = []
    
    # Length check
    if len(password) >= 12:
        score += 2
        feedback.append("✅ Good length (12+ characters)")
    elif len(password) >= 8:
        score += 1
        feedback.append("⚠️ Moderate length (8-11 characters)")
    else:
        feedback.append("❌ Too short (less than 8 characters)")
    
    # Character diversity
    if any(c.isupper() for c in password):
        score += 1
        feedback.append("✅ Contains uppercase letters")
    else:
        feedback.append("❌ Missing uppercase letters")
    
    if any(c.islower() for c in password):
        score += 1
        feedback.append("✅ Contains lowercase letters")
    else:
        feedback.append("❌ Missing lowercase letters")
    
    if any(c.isdigit() for c in password):
        score += 1
        feedback.append("✅ Contains numbers")
    else:
        feedback.append("❌ Missing numbers")
    
    if any(c in string.punctuation for c in password):
        score += 1
        feedback.append("✅ Contains special characters")
    else:
        feedback.append("❌ Missing special characters")
    
    # Determine strength level
    if score >= 5:
        strength = "🟢 STRONG"
    elif score >= 3:
        strength = "🟡 MODERATE"
    else:
        strength = "🔴 WEAK"
    
    return strength, feedback

def main():
    print("=" * 70)
    print("🔐 SECURE PASSWORD GENERATOR 🔐")
    print("=" * 70)
    print()
    
    try:
        # Get password length
        while True:
            try:
                length = int(input("Enter desired password length (minimum 6): "))
                if length < 6:
                    print("❌ Password length must be at least 6 characters!")
                    continue
                break
            except ValueError:
                print("❌ Please enter a valid number!")
        
        print("\n📋 Character Options:")
        print("-" * 70)
        
        # Get character type preferences
        use_upper = input("Include uppercase letters (A-Z)? (y/n): ").strip().lower() == 'y'
        use_lower = input("Include lowercase letters (a-z)? (y/n): ").strip().lower() == 'y'
        use_digits = input("Include digits (0-9)? (y/n): ").strip().lower() == 'y'
        use_special = input("Include special characters (!@#$%^&*)? (y/n): ").strip().lower() == 'y'
        
        # Validate at least one option selected
        if not any([use_upper, use_lower, use_digits, use_special]):
            print("\n❌ Error: You must select at least one character type!")
            sys.exit(1)
        
        # Generate password
        password = generate_password(length, use_upper, use_lower, use_digits, use_special)
        
        if password is None:
            print("\n❌ Error: Unable to generate password!")
            sys.exit(1)
        
        # Display results
        print("\n" + "=" * 70)
        print("🎉 PASSWORD GENERATED SUCCESSFULLY!")
        print("=" * 70)
        print(f"\n🔑 Your Password: {password}")
        print()
        
        # Password strength analysis
        strength, feedback = check_password_strength(password)
        print(f"💪 Strength: {strength}")
        print("\n📊 Security Analysis:")
        print("-" * 70)
        for item in feedback:
            print(f"  {item}")
        print()
        
        # Copy to clipboard
        try:
            copy = input("📋 Copy password to clipboard? (y/n): ").strip().lower()
            if copy == 'y':
                pyperclip.copy(password)
                print("✅ Password copied to clipboard!")
            else:
                print("ℹ️ Password not copied.")
        except Exception as e:
            print(f"⚠️ Could not copy to clipboard: {str(e)}")
        
        print("\n" + "=" * 70)
        print("🔒 SECURITY TIP: Never share your password with anyone!")
        print("=" * 70)
        print("\n✅ Thank you for using Secure Password Generator!")
        
    except KeyboardInterrupt:
        print("\n\n⚠️ Program interrupted by user.")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ An error occurred: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
