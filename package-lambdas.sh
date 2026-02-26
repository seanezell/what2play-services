#!/bin/bash
mkdir -p terraform/zip

for lambda_dir in lambdas/*/; do
  if [ -d "$lambda_dir" ]; then
    lambda_name=$(basename "$lambda_dir")
    echo "Packaging $lambda_name..."
    
    cd "$lambda_dir"
    [ -f "package.json" ] && npm install --production
    zip -r "../../terraform/zip/${lambda_name}.zip" .
    cd - > /dev/null
  fi
done
