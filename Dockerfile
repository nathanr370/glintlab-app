FROM node:18-slim

# Install Python3, pip, and venv
RUN apt-get update && \
    apt-get install -y python3 python3-pip python3-venv && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Create and activate a virtual environment, then install requirements
COPY requirements.txt ./
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
RUN pip install --no-cache-dir -r requirements.txt

WORKDIR /app

# Install Node.js dependencies
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install

# Copy the rest of the code
COPY . .

RUN pnpm build

EXPOSE 3000
CMD ["pnpm", "start"]
