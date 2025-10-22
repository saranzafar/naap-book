#!/bin/bash
TARGET="android/app/build/generated/autolinking/src/main/jni/Android-autolinking.cmake"

echo "🕓 Waiting for Android-autolinking.cmake to be generated..."

# Wait up to 2 minutes (checking every 3 seconds)
for i in {1..40}; do
  if [ -f "$TARGET" ]; then
    echo "🛠️  Found $TARGET — fixing..."
    # Backup first
    cp "$TARGET" "$TARGET.bak"

    # Comment out invalid lines safely
    sed -i '/add_subdirectory/s/^/#/' "$TARGET"
    sed -i '/target_link_libraries/s/^/#/' "$TARGET"

    echo "✅ Done: Patched $TARGET"
    exit 0
  fi
  sleep 3
done

echo "⚠️  $TARGET not found after waiting. Try running this script during build again."
exit 0
