# Calculator Microservice

## Overview
A simple calculator microservice built with **Node.js** and **Express.js** that supports basic arithmetic operations.

## Features
- Addition, Subtraction, Multiplication, and Division
- User-friendly Web Interface
- REST API for external integration
- Error handling for invalid inputs and division by zero
- Logging with Winston for debugging

## Setup Instructions
1. **Install dependencies**:
   npm install
   
3. **Start the server**:
   node app.js
   
5. **Access the application**:
   - Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Endpoints
- **POST /add** - Adds two numbers
- **POST /subtract** - Subtracts two numbers
- **POST /multiply** - Multiplies two numbers
- **POST /divide** - Divides two numbers (handles division by zero)

## Logging
- Logs are stored in `logs/combined.log` and `logs/error.log`.

## License
MIT License

