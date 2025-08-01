#!/bin/bash

# Script para criar imagens para redes sociais usando o novo favicon

echo "Criando imagens para redes sociais e PWA..."

# Criar diretório para imagens sociais
mkdir -p social-images

# Copiar o favicon para diferentes usos
cp "favicon F1 Analytics.svg" "favicon.ico"
cp "favicon F1 Analytics.svg" "apple-touch-icon.png"

# Criar versões específicas para redes sociais
cp "Logo F1 Analytics.svg" "social-images/og-image.svg"
cp "Logo F1 Analytics.svg" "social-images/twitter-image.svg"
cp "Logo F1 Analytics.svg" "social-images/facebook-image.svg"
cp "Logo F1 Analytics.svg" "social-images/whatsapp-image.svg"

# Atualizar ícones PWA com o novo design
cp "favicon F1 Analytics.svg" "icons/icon-192x192.png"
cp "favicon F1 Analytics.svg" "icons/icon-512x512.png"
cp "favicon F1 Analytics.svg" "icons/icon-152x152.png"
cp "favicon F1 Analytics.svg" "icons/icon-144x144.png"
cp "favicon F1 Analytics.svg" "icons/icon-128x128.png"
cp "favicon F1 Analytics.svg" "icons/icon-96x96.png"
cp "favicon F1 Analytics.svg" "icons/icon-72x72.png"
cp "favicon F1 Analytics.svg" "icons/icon-32x32.png"

echo "✅ Imagens criadas com sucesso!"
echo ""
echo "📱 Para melhores resultados, converta SVG para PNG:"
echo "1. Use um conversor online como https://convertio.co/svg-png/"
echo "2. Ou instale imagemagick: brew install imagemagick"
echo "3. Então execute: convert favicon.svg -resize 512x512 favicon-512.png"
echo ""
echo "📊 Tamanhos recomendados para redes sociais:"
echo "- Open Graph (Facebook): 1200x630px"
echo "- Twitter Card: 1200x600px"
echo "- WhatsApp: 400x400px"
echo "- Apple Touch Icon: 180x180px"
