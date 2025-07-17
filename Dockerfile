FROM ubuntu:22.04

# Install system dependencies
RUN apt-get update && \
    apt-get install -y \
      curl \
      python3 \
      python3-pip \
      python3-venv \
      git

# Install Node.js (LTS) and npm
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs

# Install pnpm globally
RUN npm install -g pnpm

# Copy requirements.txt and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Set working directory
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files and install dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

# Copy the rest of the app and scripts
COPY . .

# Expose port
EXPOSE 3000

# Start Next.js in dev mode
CMD ["pnpm", "dev"]
#CMD ["bash"]