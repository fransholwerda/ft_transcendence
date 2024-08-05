#!/bin/bash

# Extract the IP address
INET_VALUE=$(ifconfig | grep -w 'inet' | awk 'NR==2{print $2}')

# Ensure the INET_VALUE is not empty
if [ -z "$INET_VALUE" ]; then
  echo "Failed to extract INET value."
  exit 1
fi

# Files to update
FILES=(
  "./frontend/shared/constants.ts"
  "./backend/shared/constants.ts"
)

# Update HOST_HOSTNAME in each file
for FILE in "${FILES[@]}"; do
  if [ -f "$FILE" ]; then
    # Use sed to update the value, handling existing values
    sed -i.bak "s|^const HOST_HOSTNAME = '.*';|const HOST_HOSTNAME = '${INET_VALUE}';|" "$FILE"
    # Verify the update was successful
    if grep -q "const HOST_HOSTNAME = '${INET_VALUE}';" "$FILE"; then
      echo "Updated HOST_HOSTNAME in $FILE with ${INET_VALUE}"
    else
      echo "Failed to update $FILE. Check the pattern."
    fi
  else
    echo "File $FILE does not exist."
  fi
done


echo "------------------------------------------"
cat ./frontend/shared/constants.ts
echo "------------------------------------------"
cat ./backend/shared/constants.ts
echo "------------------------------------------"
