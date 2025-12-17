#!/bin/bash

# Color token mappings
# Format: hex_code -> tailwind_class

# Background colors
find app -name "*.tsx" -type f -exec sed -i \
  -e 's/bg-\[#0a3d2a\]/bg-primary-surface/g' \
  -e 's/from-\[#0a3d2a\]/from-primary-surface/g' \
  -e 's/via-\[#0a3d2a\]/via-primary-surface/g' \
  -e 's/bg-\[#0a3d2a\]/bg-primary-surface/g' \
  -e 's/bg-\[#1d6b47\]/bg-primary-surface-light/g' \
  -e 's/from-\[#1d6b47\]/from-primary-surface-light/g' \
  -e 's/via-\[#1d6b47\]/via-primary-surface-light/g' \
  -e 's/to-\[#1d6b47\]/to-primary-surface-light/g' \
  -e 's/border-\[#1d6b47\]/border-primary-surface-light/g' \
  -e 's/placeholder-\[#1d6b47\]/placeholder-primary-surface-light/g' \
  -e 's/bg-\[#0f4d2f\]/bg-primary-surface-dark/g' \
  -e 's/to-\[#0f4d2f\]/to-primary-surface-dark/g' \
  -e 's/border-\[#0f4d2f\]/border-primary-surface-dark/g' \
  {} \;

# Accent/Primary green
find app -name "*.tsx" -type f -exec sed -i \
  -e 's/bg-\[#4ade80\]/bg-primary-400/g' \
  -e 's/from-\[#4ade80\]/from-primary-400/g' \
  -e 's/to-\[#4ade80\]/to-primary-400/g' \
  -e 's/text-\[#4ade80\]/text-primary-400/g' \
  -e 's/ring-\[#4ade80\]/ring-primary-400/g' \
  -e 's/focus:ring-\[#4ade80\]/focus:ring-primary-400/g' \
  -e 's/shadow-\[#4ade80\]/shadow-primary-400/g' \
  -e 's/hover:from-\[#5ce196\]/hover:from-primary-500/g' \
  -e 's/hover:to-\[#2a8f5e\]/hover:to-primary-700/g' \
  {} \;

# Muted text colors
find app -name "*.tsx" -type f -exec sed -i \
  -e 's/text-\[#a8d5ba\]/text-muted/g' \
  -e 's/from-\[#a8d5ba\]/from-muted/g' \
  -e 's/to-\[#a8d5ba\]/to-muted/g' \
  -e 's/placeholder-\[#a8d5ba\]/placeholder-muted/g' \
  {} \;

# White text
find app -name "*.tsx" -type f -exec sed -i \
  -e 's/text-\[#EEEEFF\]/text-white/g' \
  {} \;

echo "Color replacements completed!"
