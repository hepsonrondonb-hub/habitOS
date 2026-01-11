#!/bin/bash

# Script to replace all radius.* usages with hardcoded values
# This fixes the circular dependency issue

echo "Replacing radius values in all files..."

# Replace radius.sm (8) 
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/radius\.sm/8/g' {} +

# Replace radius.md (12)
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/radius\.md/12/g' {} +

# Replace radius.lg (16)
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/radius\.lg/16/g' {} +

# Replace radius.full (9999)
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/radius\.full/9999/g' {} +

echo "Done! All radius values replaced."
