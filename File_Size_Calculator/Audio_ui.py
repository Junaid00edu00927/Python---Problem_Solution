"""
Graphical User Interface for Audio File Size Calculator
Uses Tkinter for a clean, responsive layout.
"""

import tkinter as tk
from tkinter import messagebox, ttk

from Audio_report import calculate_size, format_result


class App:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("Audio File Size Calculator")
        self.root.geometry("500x400")
        self.root.resizable(False, False)

        # --- Input Frame ---
        input_frame = ttk.LabelFrame(
            self.root, text="Input Parameters", padding=10)
        input_frame.pack(fill="x", padx=10, pady=10)

        # Bitrate entry
        ttk.Label(input_frame, text="Bitrate (kbps):").grid(
            row=0, column=0, sticky="w", pady=5)
        self.bitrate_entry = ttk.Entry(input_frame, width=30)
        self.bitrate_entry.grid(row=0, column=1, padx=10, pady=5)
        self.bitrate_entry.insert(0, "300, 500, 1000")  # example

        # Duration entry
        ttk.Label(input_frame, text="Duration (seconds):").grid(
            row=1, column=0, sticky="w", pady=5)
        self.duration_entry = ttk.Entry(input_frame, width=30)
        self.duration_entry.grid(row=1, column=1, padx=10, pady=5)
        self.duration_entry.insert(0, "60")

        # Calculate button
        self.calc_btn = ttk.Button(
            input_frame, text="Calculate", command=self.calculate)
        self.calc_btn.grid(row=2, column=0, columnspan=2, pady=10)

        # --- Output Frame ---
        output_frame = ttk.LabelFrame(
            self.root, text="File Size Estimates", padding=10)
        output_frame.pack(fill="both", expand=True, padx=10, pady=10)

        # Treeview for tabular results
        columns = ("Bitrate (kbps)", "Size (KB)", "Size (MB)")
        self.tree = ttk.Treeview(
            output_frame, columns=columns, show="headings")
        for col in columns:
            self.tree.heading(col, text=col)
            self.tree.column(col, width=120, anchor="center")

        scrollbar = ttk.Scrollbar(
            output_frame, orient="vertical", command=self.tree.yview)
        self.tree.configure(yscrollcommand=scrollbar.set)
        self.tree.pack(side="left", fill="both", expand=True)
        scrollbar.pack(side="right", fill="y")

    def calculate(self):
        """Parse inputs, compute sizes, and display results."""
        # Clear previous results
        for item in self.tree.get_children():
            self.tree.delete(item)

        # Get bitrates
        bitrate_text = self.bitrate_entry.get().strip()
        try:
            bitrates = [int(b.strip())
                        for b in bitrate_text.split(",") if b.strip()]
        except ValueError:
            messagebox.showerror(
                "Input Error", "Please enter valid integers for bitrates, separated by commas.")
            return

        if not bitrates:
            messagebox.showerror("Input Error", "No bitrates entered.")
            return

        # Get duration
        duration_text = self.duration_entry.get().strip()
        try:
            duration = int(duration_text)
            if duration <= 0:
                raise ValueError
        except ValueError:
            messagebox.showerror(
                "Input Error", "Duration must be a positive integer (seconds).")
            return

        # Compute and populate table
        for bps in bitrates:
            kb, mb = calculate_size(bps, duration)
            self.tree.insert("", "end", values=(bps, kb, mb))

    def run(self):
        """Start the Tkinter main loop."""
        self.root.mainloop()
