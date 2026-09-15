"""
BMI Calculator with Visualization
OASIS INFOBYTE - Python Programming Internship
Task 2: BMI Calculator
"""

import matplotlib.pyplot as plt
import sys

def calculate_bmi(weight, height):
    """Calculate BMI from weight (kg) and height (m)"""
    return weight / (height ** 2)

def get_bmi_category(bmi):
    """Determine BMI category"""
    if bmi < 18.5:
        return "Underweight", "yellow"
    elif 18.5 <= bmi < 25:
        return "Normal weight", "green"
    elif 25 <= bmi < 30:
        return "Overweight", "orange"
    else:
        return "Obese", "red"

def visualize_bmi(bmi, category, color):
    """Create visual representation of BMI"""
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 5))
    
    # BMI Gauge Chart
    categories = ['Underweight\n(<18.5)', 'Normal\n(18.5-24.9)', 'Overweight\n(25-29.9)', 'Obese\n(≥30)']
    colors = ['yellow', 'green', 'orange', 'red']
    ranges = [18.5, 6.5, 5, 10]  # Range widths
    
    # Create horizontal bar chart
    ax1.barh(categories, ranges, left=[0, 18.5, 25, 30], color=colors, alpha=0.7, edgecolor='black')
    ax1.axvline(x=bmi, color='blue', linewidth=3, label=f'Your BMI: {bmi:.1f}')
    ax1.set_xlabel('BMI Value', fontsize=12, fontweight='bold')
    ax1.set_title('BMI Category Scale', fontsize=14, fontweight='bold')
    ax1.legend(fontsize=11)
    ax1.set_xlim(10, 40)
    ax1.grid(axis='x', alpha=0.3)
    
    # BMI Pie Chart (distribution)
    ax2.pie([1], labels=[f'{category}\nBMI: {bmi:.1f}'], colors=[color], 
            autopct='', startangle=90, textprops={'fontsize': 14, 'fontweight': 'bold'})
    ax2.set_title('Your BMI Category', fontsize=14, fontweight='bold')
    
    plt.tight_layout()
    plt.show()

def get_health_advice(category):
    """Provide health advice based on BMI category"""
    advice = {
        "Underweight": "⚠️ You may need to gain weight. Consult a healthcare provider for personalized advice.",
        "Normal weight": "✅ Great! You're in a healthy weight range. Maintain your current lifestyle.",
        "Overweight": "⚠️ Consider adopting a healthier diet and exercise routine to reduce health risks.",
        "Obese": "🚨 You're at increased risk for health issues. Consult a healthcare provider immediately."
    }
    return advice.get(category, "")

def main():
    print("=" * 60)
    print("🏥 BMI CALCULATOR WITH VISUALIZATION 🏥")
    print("=" * 60)
    print()
    
    try:
        # Get user input
        weight = float(input("Enter your weight (in kilograms): "))
        height = float(input("Enter your height (in meters): "))
        
        # Validate input
        if weight <= 0 or height <= 0:
            print("\n❌ Error: Weight and height must be positive numbers!")
            sys.exit(1)
        
        if height > 3:
            print("\n❌ Error: Height seems too large. Please enter height in meters (e.g., 1.75)")
            sys.exit(1)
        
        # Calculate BMI
        bmi = calculate_bmi(weight, height)
        category, color = get_bmi_category(bmi)
        
        # Display results
        print("\n" + "=" * 60)
        print("📊 RESULTS:")
        print("=" * 60)
        print(f"Weight: {weight} kg")
        print(f"Height: {height} m")
        print(f"BMI: {bmi:.2f}")
        print(f"Category: {category}")
        print("=" * 60)
        print()
        
        # Health advice
        print("💡 HEALTH ADVICE:")
        print(get_health_advice(category))
        print()
        
        # Ask to visualize
        visualize = input("Would you like to see a visual chart? (y/n): ").strip().lower()
        if visualize == 'y':
            visualize_bmi(bmi, category, color)
        
        print("\n✅ Thank you for using BMI Calculator!")
        
    except ValueError:
        print("\n❌ Error: Please enter valid numeric values!")
        sys.exit(1)
    except KeyboardInterrupt:
        print("\n\n⚠️ Program interrupted by user.")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ An error occurred: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
