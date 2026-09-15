"""
Weather App - Fetch Real-Time Weather Data
OASIS INFOBYTE - Python Programming Internship
Task 4: Weather App
"""

import requests
import sys
from datetime import datetime

# OpenWeatherMap API Configuration
API_KEY = "your_api_key_here"  # Replace with your actual API key
BASE_URL = "http://api.openweathermap.org/data/2.5/weather"

def get_weather_icon(weather_main):
    """Get weather emoji based on condition"""
    icons = {
        "Clear": "☀️",
        "Clouds": "☁️",
        "Rain": "🌧️",
        "Drizzle": "🌦️",
        "Thunderstorm": "⛈️",
        "Snow": "❄️",
        "Mist": "🌫️",
        "Fog": "🌫️",
        "Haze": "🌫️"
    }
    return icons.get(weather_main, "🌍")

def kelvin_to_celsius(kelvin):
    """Convert Kelvin to Celsius"""
    return kelvin - 273.15

def kelvin_to_fahrenheit(kelvin):
    """Convert Kelvin to Fahrenheit"""
    return (kelvin - 273.15) * 9/5 + 32

def fetch_weather(city_name, api_key):
    """Fetch weather data from OpenWeatherMap API"""
    try:
        # Build API request
        params = {
            'q': city_name,
            'appid': api_key
        }
        
        # Make API request
        response = requests.get(BASE_URL, params=params, timeout=10)
        
        # Check for errors
        if response.status_code == 401:
            return None, "Invalid API key. Please check your API configuration."
        elif response.status_code == 404:
            return None, f"City '{city_name}' not found. Please check the spelling."
        elif response.status_code != 200:
            return None, f"Error: Unable to fetch weather data (Status code: {response.status_code})"
        
        # Parse JSON response
        data = response.json()
        return data, None
        
    except requests.exceptions.Timeout:
        return None, "Request timeout. Please check your internet connection."
    except requests.exceptions.ConnectionError:
        return None, "Connection error. Please check your internet connection."
    except Exception as e:
        return None, f"An error occurred: {str(e)}"

def display_weather(data):
    """Display weather information in a formatted way"""
    
    # Extract data
    city = data['name']
    country = data['sys']['country']
    weather_main = data['weather'][0]['main']
    weather_desc = data['weather'][0]['description']
    temp_kelvin = data['main']['temp']
    feels_like_kelvin = data['main']['feels_like']
    humidity = data['main']['humidity']
    pressure = data['main']['pressure']
    wind_speed = data['wind']['speed']
    visibility = data.get('visibility', 0) / 1000  # Convert to km
    
    # Convert temperatures
    temp_celsius = kelvin_to_celsius(temp_kelvin)
    temp_fahrenheit = kelvin_to_fahrenheit(temp_kelvin)
    feels_like_celsius = kelvin_to_celsius(feels_like_kelvin)
    
    # Get weather icon
    icon = get_weather_icon(weather_main)
    
    # Get current time
    current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    # Display results
    print("\n" + "=" * 70)
    print(f"{icon}  WEATHER REPORT FOR {city.upper()}, {country}  {icon}")
    print("=" * 70)
    print(f"📅 Updated: {current_time}")
    print()
    
    print("🌡️  TEMPERATURE:")
    print(f"   Current: {temp_celsius:.1f}°C / {temp_fahrenheit:.1f}°F")
    print(f"   Feels Like: {feels_like_celsius:.1f}°C")
    print()
    
    print(f"🌤️  CONDITIONS:")
    print(f"   Weather: {weather_main} ({weather_desc.capitalize()})")
    print()
    
    print("💨 ATMOSPHERIC DATA:")
    print(f"   Humidity: {humidity}%")
    print(f"   Pressure: {pressure} hPa")
    print(f"   Wind Speed: {wind_speed} m/s")
    print(f"   Visibility: {visibility:.1f} km")
    print()
    
    print("=" * 70)

def main():
    print("=" * 70)
    print("🌦️  WEATHER APP - REAL-TIME WEATHER INFORMATION 🌦️")
    print("=" * 70)
    print()
    
    # Check if API key is configured
    if API_KEY == "your_api_key_here":
        print("❌ ERROR: API Key Not Configured!")
        print()
        print("📝 To use this app, you need a FREE API key from OpenWeatherMap:")
        print()
        print("   1. Visit: https://openweathermap.org/api")
        print("   2. Sign up for a free account")
        print("   3. Generate your API key")
        print("   4. Replace 'your_api_key_here' in the code with your actual API key")
        print()
        print("=" * 70)
        sys.exit(1)
    
    try:
        # Get city name from user
        city_name = input("Enter city name (e.g., London, New York, Tokyo): ").strip()
        
        if not city_name:
            print("\n❌ Error: City name cannot be empty!")
            sys.exit(1)
        
        print(f"\n🔍 Fetching weather data for '{city_name}'...")
        
        # Fetch weather data
        data, error = fetch_weather(city_name, API_KEY)
        
        if error:
            print(f"\n❌ {error}")
            sys.exit(1)
        
        # Display weather information
        display_weather(data)
        
        # Ask if user wants to check another city
        print()
        another = input("🔄 Check weather for another city? (y/n): ").strip().lower()
        if another == 'y':
            print("\n" + "=" * 70 + "\n")
            main()
        else:
            print("\n✅ Thank you for using Weather App!")
        
    except KeyboardInterrupt:
        print("\n\n⚠️ Program interrupted by user.")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ An unexpected error occurred: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
