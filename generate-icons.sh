#!/bin/bash

# Script para gerar ícones PWA em diferentes tamanhos
# Você pode usar este script com ImageMagick ou outra ferramenta de conversão

# Array com todos os tamanhos necessários
sizes=(32 57 60 72 76 96 114 120 128 144 152 180 192 384 512)

# Se você tiver um ícone base (icon.png), pode usar este comando:
# for size in "${sizes[@]}"; do
#   convert icon.png -resize ${size}x${size} public/icons/icon-${size}x${size}.png
# done

echo "Para gerar os ícones, você pode:"
echo "1. Usar um serviço online como https://realfavicongenerator.net/"
echo "2. Usar ImageMagick com o comando acima"
echo "3. Usar ferramentas como PWA Builder"
echo ""
echo "Tamanhos necessários:"
for size in "${sizes[@]}"; do
  echo "- ${size}x${size} pixels"
done

echo ""
echo "Criando ícones placeholder básicos..."

# Criar ícones SVG básicos para diferentes tamanhos
for size in "${sizes[@]}"; do
  cat > "public/icons/icon-${size}x${size}.svg" << EOF
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="${size}" height="${size}" rx="$(($size/5))" fill="#dc2626"/>
<path d="M$(($size/4)) $(($size*3/8))H$(($size*3/4))L$(($size*11/16)) $(($size*5/8))H$(($size*5/16))L$(($size/4)) $(($size*3/8))Z" fill="white"/>
<path d="M$(($size*3/16)) $(($size/4))H$(($size*13/16))V$(($size*5/16))H$(($size*3/16))V$(($size/4))Z" fill="white"/>
<circle cx="$(($size*3/8))" cy="$(($size*11/16))" r="$(($size/16))" fill="white"/>
<circle cx="$(($size*5/8))" cy="$(($size*11/16))" r="$(($size/16))" fill="white"/>
<path d="M$(($size/2)) $(($size*7/16))L$(($size*7/16)) $(($size*9/16))H$(($size*9/16))L$(($size/2)) $(($size*7/16))Z" fill="#dc2626"/>
</svg>
EOF
done

echo "Ícones SVG placeholder criados!"
echo ""
echo "Para converter SVG para PNG, você pode usar:"
echo "npm install -g svg2png-cli"
echo "svg2png public/icons/icon-*.svg"
