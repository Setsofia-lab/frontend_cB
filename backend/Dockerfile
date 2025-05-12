# Stage 1: Use an official Python runtime as a parent image
FROM python:3.9-slim

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container at /app
COPY requirements.txt .

# Install any needed packages specified in requirements.txt
# Using --no-cache-dir to reduce image size
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend application code into the container at /app
COPY . .

# Make port 5001 available to the world outside this container
EXPOSE 5001

# Define environment variable for Flask app (optional, can be set in app.py too)
ENV FLASK_APP=app.py
ENV FLASK_RUN_HOST=0.0.0.0
# ENV FLASK_RUN_PORT=5001 # This can also be set here

# Run app.py when the container launches
# Use gunicorn for production later, but flask dev server is fine for now
CMD ["flask", "run", "--port=5001"]
# For production, you might use:
# CMD ["gunicorn", "--bind", "0.0.0.0:5001", "app:app"]
# Make sure to add gunicorn to requirements.txt if you use it.
