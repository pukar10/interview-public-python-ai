#!/bin/bash

# Initialize development environment

echo "🚀 Initializing development environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

echo "📦 Starting services..."
docker-compose up -d

echo "⏳ Waiting for services to be healthy..."
sleep 10

# Wait for PostgreSQL to be ready
echo "🗄️ Waiting for PostgreSQL..."
until docker-compose exec -T postgres pg_isready -U postgres -d chat_db > /dev/null 2>&1; do
    sleep 2
done
echo "✅ PostgreSQL is ready"

# Wait for Ollama to be ready
echo "🤖 Waiting for Ollama service..."
until docker-compose exec -T ollama ollama list > /dev/null 2>&1; do
    sleep 2
    echo "   Still waiting for Ollama..."
done
echo "✅ Ollama service is ready"

# Check if model exists, pull if needed
echo "📥 Checking for llama3.2 model..."
if ! docker-compose exec -T ollama ollama list | grep -q "llama3.2"; then
    echo "   Model not found, pulling llama3.2 (this may take a few minutes)..."
    docker-compose exec -T ollama ollama pull llama3.2
    echo "✅ Model downloaded successfully"
else
    echo "✅ Model already available"
fi

# Run database migrations
echo "🔧 Running database migrations..."
docker-compose exec -T backend alembic upgrade head

echo "✨ Development environment is ready!"
echo ""
echo "🌐 Access points:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo "   PostgreSQL: localhost:5432"
echo "   Ollama: http://localhost:11434"
echo ""
echo "📝 To view logs: docker-compose logs -f"
echo "🛑 To stop: docker-compose down"