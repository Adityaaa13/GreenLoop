# Render Deployment Guide (GreenLoop)

## 1. Addressing Cold Starts
Both the **Node.js Backend** and **Python AI Service** are on Render's Free Tier. They will "sleep" after 15 minutes of inactivity.

- **The Problem**: When the AI service is sleeping, the first request can take up to 2 minutes to wake it up.
- **The Solution**: Use the `PYTHON_AI_SERVICE_URL` environment variable. The backend is now configured to wait up to 150 seconds for the service to wake up.

## 2. Environment Variables
In your Render Dashboard, you MUST set the following for the **Node.js (Backend)** service:

- `PYTHON_AI_SERVICE_URL`: The URL of your Python service.
    - **Tip**: Use the **Internal Service URL** (e.g., `http://garbage-image-tester:8000`) instead of the public `https://...` URL. Internal URLs are faster and don't count against public bandwidth.

## 3. Communication Flow
1. Citizen submits report -> Node reaches out to Python.
2. If Python is asleep, Node stays "connected" and retries health checks for 150s.
3. Once Python responds, the validation proceeds.
