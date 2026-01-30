#!/usr/bin/env python3
"""
Test ATS endpoint connectivity
"""
import requests
import sys

def test_ats_endpoint():
    """Test the ATS endpoint that's failing"""
    
    endpoint = "https://api.qtale.io/api/v1/recruiter/applications/public/interview-data/8"
    # Token from dashboard (you'll need to get the full token)
    api_token = "048e9c3e-3..."  # Replace with full token from dashboard
    
    print(f"Testing ATS endpoint: {endpoint}")
    print(f"API Token (preview): {api_token[:10]}...")
    print("-" * 60)
    
    try:
        print("\n1. Testing DNS resolution...")
        import socket
        try:
            ip = socket.gethostbyname("api.qtale.io")
            print(f"   ✓ DNS OK: api.qtale.io -> {ip}")
        except Exception as e:
            print(f"   ✗ DNS FAILED: {e}")
            return
        
        print("\n2. Testing HTTPS connection...")
        response = requests.get(
            endpoint,
            headers={
                'Authorization': f'Bearer {api_token}',
                'Content-Type': 'application/json'
            },
            timeout=10
        )
        
        print(f"   Status Code: {response.status_code}")
        print(f"   Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            print(f"   ✓ SUCCESS! Data received:")
            try:
                data = response.json()
                print(f"   Response data keys: {list(data.keys())}")
                print(f"   Full response: {data}")
            except:
                print(f"   Response text (not JSON): {response.text[:200]}")
        elif response.status_code == 401:
            print(f"   ✗ UNAUTHORIZED: API token is invalid or expired")
            print(f"   Response: {response.text}")
        elif response.status_code == 404:
            print(f"   ✗ NOT FOUND: Interview data not found at this endpoint")
            print(f"   Response: {response.text}")
        else:
            print(f"   ✗ ERROR: {response.status_code}")
            print(f"   Response: {response.text}")
            
    except requests.exceptions.Timeout:
        print(f"   ✗ TIMEOUT: Server took too long to respond (>10s)")
    except requests.exceptions.ConnectionError as e:
        print(f"   ✗ CONNECTION ERROR: Cannot reach server")
        print(f"   Details: {e}")
    except Exception as e:
        print(f"   ✗ UNEXPECTED ERROR: {e}")
    
    print("\n" + "=" * 60)
    print("IMPORTANT:")
    print("1. Make sure you replace the API token with the FULL token")
    print("2. Check if api.qtale.io is accessible from Render's servers")
    print("3. Check Render backend logs for detailed error messages")
    print("=" * 60)

if __name__ == "__main__":
    test_ats_endpoint()


