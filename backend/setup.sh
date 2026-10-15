#!/bin/bash

# Merlot VIP Backend - Setup Script
# Rulează acest script pentru a configura automat backend-ul

echo "🍷 Merlot VIP Backend Setup"
echo "=========================="
echo ""

# Verifică dacă Node.js este instalat
if ! command -v node &> /dev/null; then
    echo "❌ Node.js nu este instalat!"
    echo "📥 Instalează de la: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js $(node -v)"

# Verifică dacă PostgreSQL este instalat
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL nu este instalat!"
    echo "📥 Instalează de la: https://www.postgresql.org/download/"
    exit 1
fi

echo "✅ PostgreSQL $(psql --version)"
echo ""

# Instalează dependențele
echo "📦 Instalare dependențe..."
npm install
echo ""

# Copiază .env.example în .env dacă nu există
if [ ! -f .env ]; then
    echo "📝 Creare fișier .env..."
    cp .env.example .env
    echo "✅ .env creat"
    echo ""
    echo "⚠️  IMPORTANT: Editează .env și completează:"
    echo "   - DB_PASSWORD (parola PostgreSQL)"
    echo "   - JWT_SECRET (cheie secretă pentru JWT)"
    echo ""
    read -p "Apasă ENTER când ai completat .env..."
else
    echo "✅ .env există deja"
fi

# Creează baza de date
echo ""
echo "🗄️  Creare bază de date..."
read -p "Utilizator PostgreSQL [postgres]: " DB_USER
DB_USER=${DB_USER:-postgres}

# Încearcă să creeze baza de date
if psql -U $DB_USER -lqt | cut -d \| -f 1 | grep -qw merlot_vip; then
    echo "✅ Baza de date merlot_vip există deja"
else
    echo "📊 Creare bază de date merlot_vip..."
    psql -U $DB_USER -c "CREATE DATABASE merlot_vip;" 2>/dev/null
    if [ $? -eq 0 ]; then
        echo "✅ Baza de date creată"
    else
        echo "❌ Eroare la crearea bazei de date"
        echo "💡 Verifică credențialele PostgreSQL în .env"
        exit 1
    fi
fi

echo ""
echo "🚀 Pornește serverul cu: npm run dev"
echo ""
echo "📋 Utilizatori demo:"
echo "   Manager:  manager@merlot.ro  / Manager123!"
echo "   Barman:   barman@merlot.ro   / Barman123!"
echo "   Client:   client@merlot.ro   / Client123!"
echo ""
echo "✅ Setup complet!"
