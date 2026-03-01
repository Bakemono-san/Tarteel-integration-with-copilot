#!/bin/bash

# Test Script for Quran Recitation App
# Runs basic tests to verify installation

set -e

echo "🧪 Quran Recitation App - Test Suite"
echo "====================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
PASSED=0
FAILED=0

# Helper function for tests
run_test() {
    local test_name=$1
    local test_command=$2

    echo -n "Testing: $test_name... "

    if eval "$test_command" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ PASSED${NC}"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAILED${NC}"
        ((FAILED++))
        return 1
    fi
}

echo -e "${BLUE}1. Checking Prerequisites${NC}"
echo "-------------------------"

run_test "Python 3.10+" "python3 --version | grep -E 'Python 3\.(1[0-9]|[2-9][0-9])'"
run_test "Node.js 18+" "node --version | grep -E 'v(1[8-9]|[2-9][0-9])'"
run_test "pip installed" "pip3 --version"
run_test "npm installed" "npm --version"

echo ""
echo -e "${BLUE}2. Checking Backend Setup${NC}"
echo "-------------------------"

cd backend

run_test "Virtual environment exists" "[ -d venv ]"
run_test "requirements.txt exists" "[ -f requirements.txt ]"
run_test ".env file exists" "[ -f .env ] || [ -f .env.example ]"
run_test "main.py exists" "[ -f main.py ]"
run_test "Models directory" "[ -d models ]"
run_test "Services directory" "[ -d services ]"

# Check if backend is running
if curl -s http://localhost:8000 > /dev/null 2>&1; then
    run_test "Backend server running" "curl -s http://localhost:8000 | grep -q 'Quran'"
    run_test "Health endpoint" "curl -s http://localhost:8000/health | grep -q 'status'"
    run_test "API documentation" "curl -s http://localhost:8000/docs > /dev/null"
else
    echo -e "${YELLOW}⚠ Backend not running (start it to test endpoints)${NC}"
fi

cd ..

echo ""
echo -e "${BLUE}3. Checking Frontend Setup${NC}"
echo "-------------------------"

cd frontend

run_test "package.json exists" "[ -f package.json ]"
run_test "node_modules installed" "[ -d node_modules ]"
run_test "next.config.js exists" "[ -f next.config.js ]"
run_test "app directory" "[ -d app ]"
run_test "components directory" "[ -d components ]"
run_test "lib directory" "[ -d lib ]"

# Check if frontend is running
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    run_test "Frontend server running" "curl -s http://localhost:3000 > /dev/null"
else
    echo -e "${YELLOW}⚠ Frontend not running (start it to test)${NC}"
fi

cd ..

echo ""
echo -e "${BLUE}4. Checking File Structure${NC}"
echo "-------------------------"

run_test "README.md exists" "[ -f README.md ]"
run_test "QUICKSTART.md exists" "[ -f QUICKSTART.md ]"
run_test "setup.sh exists" "[ -f setup.sh ]"
run_test "start.sh exists" "[ -f start.sh ]"
run_test "docker-compose.yml" "[ -f docker-compose.yml ]"

echo ""
echo -e "${BLUE}5. Optional Checks${NC}"
echo "-------------------------"

# Check for Docker
if command -v docker &> /dev/null; then
    run_test "Docker installed" "docker --version"
    run_test "Docker Compose installed" "docker-compose --version || docker compose version"
else
    echo -e "${YELLOW}⚠ Docker not installed (optional)${NC}"
fi

# Check for Git
if command -v git &> /dev/null; then
    run_test "Git installed" "git --version"
else
    echo -e "${YELLOW}⚠ Git not installed (optional)${NC}"
fi

echo ""
echo "======================================"
echo -e "${GREEN}Tests Passed: $PASSED${NC}"
echo -e "${RED}Tests Failed: $FAILED${NC}"
echo "======================================"

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed! Your installation is good.${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Start backend: cd backend && source venv/bin/activate && python main.py"
    echo "2. Start frontend: cd frontend && npm run dev"
    echo "3. Open: http://localhost:3000"
    exit 0
else
    echo -e "${RED}⚠ Some tests failed. Please check the errors above.${NC}"
    echo ""
    echo "Troubleshooting:"
    echo "1. Run setup script: ./setup.sh"
    echo "2. Check QUICKSTART.md for manual setup"
    echo "3. Verify prerequisites are installed"
    exit 1
fi
