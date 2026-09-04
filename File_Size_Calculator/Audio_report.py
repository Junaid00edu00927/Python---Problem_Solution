"""
Core calculation logic and formatting utilities.
"""

# Constants (using 1000 for decimal MB, as in the original example)
BITS_PER_BYTE = 8
BYTES_PER_KB = 1000
BYTES_PER_MB = 1000  # Decimal MB; use 1024 for MiB if needed


def calculate_size(bitrate_kbps: int, duration_sec: int) -> tuple[int, int]:
    """
    Calculate file size in KB and MB for a given bitrate and duration.

    Args:
        bitrate_kbps: Bitrate in kilobits per second.
        duration_sec: Duration in seconds.

    Returns:
        A tuple (size_kb, size_mb) as integers (floor division).
    """
    total_bits = bitrate_kbps * 1000 * duration_sec   # kbps → bits
    total_bytes = total_bits // BITS_PER_BYTE
    size_kb = total_bytes // BYTES_PER_KB
    size_mb = size_kb // BYTES_PER_MB
    return size_kb, size_mb


def format_result(size_kb: int, size_mb: int) -> str:
    """
    Return a human‑readable string for the file size.
    """
    return f"{size_kb} KB ({size_mb} MB)"
