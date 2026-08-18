# Project about to calculate the KB and MB file of the Video with help of providing value
#-------------------------------------------------------------
# 1. Define constants for clarity (removes "magic numbers")
BITS_PER_BYTE = 8
BYTES_PER_MB = 1000  # Note: Use 1024 if you strictly need binary Mebibytes (MiB)

# 2. Use standard Python snake_case naming conventions
bitrates_kbps = [300, 500, 1000]
duration_seconds = 60

# 3. Calculate KB first using integer division (//)
file_sizes_kb = [
    (bitrate * duration_seconds) // BITS_PER_BYTE 
    for bitrate in bitrates_kbps
]

# 4. Derive MB directly from the KB list (avoids repeating the first math step)
file_sizes_mb = [
    size_kb // BYTES_PER_MB 
    for size_kb in file_sizes_kb
]

# 5. Print the results in a clean, readable table format using zip()
print("--- File Size Estimates ---")
for bitrate, size_mb, size_kb in zip(bitrates_kbps, file_sizes_mb, file_sizes_kb):
    print(f"Bitrate: {bitrate:>4} Kbps | Size: {size_mb:>3} MB ({size_kb} KB)")

"""
# Simple of Output
--- File Size Estimates ---
Bitrate:  300 Kbps | Size:   2 MB (2250 KB)
Bitrate:  500 Kbps | Size:   3 MB (3750 KB)
Bitrate: 1000 Kbps | Size:   7 MB (7500 KB)
"""