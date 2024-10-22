# 📱 WhatsApp ChatBot for Flux.IT

Welcome to the WhatsApp ChatBot repository! This project includes tools for interacting with WhatsApp in various ways:

- **Simple Read/Message Chatbot**: A straightforward chatbot to send and receive messages.
- **Chat Scraper by Contact Name**: Extract chats based on specific contact names.
- **Contact Scraper**: Scrape contacts for easy management and interaction.

## 🚀 Getting Started

### Prerequisites

To run this project, ensure you have [Docker](https://www.docker.com/) installed on your machine.

### 🛠️ Installation

1. **Install Docker**  
   Follow the installation instructions on the [official Docker website](https://www.docker.com/).

2. **Build the Docker Image**  
   Open your terminal and run the following command to build the Docker image:

   ```bash
   docker build -t bopple/flux.it-chatbot .
   ```
   
3. **Run the Docker Container**  
   After building the image, you can run the Docker container with:

   ```
   docker run -d --name myapp -p 3000:3000 bopple/flux.it-chatbot
   ```

## 🌐 Access the Application
Once the Docker container is running, you can access the application at http://localhost:3000.
