"""
╔══════════════════════════════════════════════╗
║      💧 Water Measurement App  v1.0          ║
║   Visualize water in Glass, Jug & Bucket     ║
╚══════════════════════════════════════════════╝
"""

import tkinter as tk
from tkinter import ttk, messagebox

# ─────────────────────────────────────────────
#  CONTAINER DEFINITIONS
# ─────────────────────────────────────────────
CONTAINERS = {
    "Glass":  {"max_liters": 0.35,  "emoji": "🥛", "shape": "glass"},
    "Mug":    {"max_liters": 0.50,  "emoji": "☕", "shape": "mug"},
    "Jug":    {"max_liters": 2.00,  "emoji": "🫙", "shape": "jug"},
    "Bottle": {"max_liters": 1.50,  "emoji": "🍶", "shape": "bottle"},
    "Bucket": {"max_liters": 10.00, "emoji": "🪣", "shape": "bucket"},
}

# ─────────────────────────────────────────────
#  THEME PALETTES
# ─────────────────────────────────────────────
THEMES = {
    "light": {
        "bg":           "#f0f8ff",
        "panel":        "#ffffff",
        "text":         "#be0404",
        "subtext":      "#9a5c5a",
        "accent":       "#2196F3",
        "btn_bg":       "#2196F3",
        "btn_fg":       "#ffffff",
        "btn_active":   "#1565C0",
        "border":       "#cce0f5",
        "water_full":   "#1565C0",
        "water_mid":    "#2196F3",
        "water_low":    "#64B5F6",
        "container_fg": "#1a2a3a",
        "shadow":       "#d0e8f8",
    },
    "dark": {
        "bg":           "#285382",
        "panel":        "#51659d",
        "text":         "#e8f4ff",
        "subtext":      "#7fb3d3",
        "accent":       "#42A5F5",
        "btn_bg":       "#1565C0",
        "btn_fg":       "#e8f4ff",
        "btn_active":   "#0D47A1",
        "border":       "#2a4a6a",
        "water_full":   "#053988",
        "water_mid":    "#1565C0",
        "water_low":    "#2E8AE5",
        "container_fg": "#e8f4ff",
        "shadow":       "#acb6d9",
    },
}

# ─────────────────────────────────────────────
#  MAIN APPLICATION CLASS
# ─────────────────────────────────────────────
class WaterMeasurementApp:
    def __init__(self, root):
        self.root = root
        self.root.title("💧 Water Measurement App")
        self.root.geometry("680x620")
        self.root.resizable(False, False)

        self.theme_name = tk.StringVar(value="light")
        self.container_name = tk.StringVar(value="Glass")
        self.liters = tk.DoubleVar(value=0.0)

        self._build_ui()
        self._apply_theme()
        self._update_display()

    # ── UI CONSTRUCTION ──────────────────────
    def _build_ui(self):
        T = THEMES[self.theme_name.get()]

        # ── TOP BAR ──
        self.top_bar = tk.Frame(self.root, pady=10)
        self.top_bar.pack(fill="x", padx=20, pady=(15, 5))

        self.title_lbl = tk.Label(
            self.top_bar, text="💧 Water Measurement App",
            font=("Segoe UI", 18, "bold"))
        self.title_lbl.pack(side="left")

        # Theme toggle button
        self.theme_btn = tk.Button(
            self.top_bar, text="🌙 Dark Mode",
            font=("Segoe UI", 10, "bold"),
            bd=0, padx=12, pady=5, cursor="hand2",
            command=self._toggle_theme)
        self.theme_btn.pack(side="right", padx=5)

        # ── CONTAINER SELECTOR ──
        self.sel_frame = tk.LabelFrame(
            self.root, text=" Choose Container ",
            font=("Segoe UI", 11, "bold"), pady=10, padx=10)
        self.sel_frame.pack(fill="x", padx=20, pady=8)

        self.cont_btns = {}
        for name, info in CONTAINERS.items():
            btn = tk.Button(
                self.sel_frame,
                text=f"{info['emoji']} {name}\n({info['max_liters']} L max)",
                font=("Segoe UI", 9, "bold"),
                width=10, height=2, bd=0, cursor="hand2",
                command=lambda n=name: self._select_container(n))
            btn.pack(side="left", padx=6, pady=4)
            self.cont_btns[name] = btn

        # ── MIDDLE SECTION: Canvas + Controls ──
        self.mid = tk.Frame(self.root)
        self.mid.pack(fill="both", expand=True, padx=20, pady=5)

        # LEFT: Canvas visualization
        self.canvas_frame = tk.LabelFrame(
            self.mid, text=" Visualization ",
            font=("Segoe UI", 11, "bold"), padx=10, pady=10)
        self.canvas_frame.pack(side="left", fill="both", expand=True)

        self.canvas = tk.Canvas(
            self.canvas_frame, width=230, height=280,
            bd=0, highlightthickness=0)
        self.canvas.pack()

        self.level_lbl = tk.Label(
            self.canvas_frame, text="0.00 L  (0%)",
            font=("Segoe UI", 12, "bold"))
        self.level_lbl.pack(pady=(6, 0))

        # RIGHT: Controls panel
        self.ctrl_frame = tk.LabelFrame(
            self.mid, text=" Controls ",
            font=("Segoe UI", 11, "bold"), padx=14, pady=14)
        self.ctrl_frame.pack(side="right", fill="both", expand=True, padx=(10, 0))

        tk.Label(self.ctrl_frame, text="Container:",
                 font=("Segoe UI", 10)).pack(anchor="w")
        self.cont_label = tk.Label(
            self.ctrl_frame, font=("Segoe UI", 13, "bold"))
        self.cont_label.pack(anchor="w", pady=(0, 10))

        tk.Label(self.ctrl_frame, text="Max Capacity:",
                 font=("Segoe UI", 10)).pack(anchor="w")
        self.max_lbl = tk.Label(
            self.ctrl_frame, font=("Segoe UI", 12))
        self.max_lbl.pack(anchor="w", pady=(0, 12))

        tk.Label(self.ctrl_frame, text="Set Water (Liters):",
                 font=("Segoe UI", 10)).pack(anchor="w")

        self.slider = ttk.Scale(
            self.ctrl_frame, from_=0, to=1,
            orient="horizontal", length=180,
            command=self._on_slider)
        self.slider.pack(fill="x", pady=6)

        # Manual entry
        entry_row = tk.Frame(self.ctrl_frame)
        entry_row.pack(fill="x", pady=4)
        tk.Label(entry_row, text="Enter (L):", font=("Segoe UI", 10)).pack(side="left")
        self.entry = tk.Entry(entry_row, width=8, font=("Segoe UI", 11), bd=2)
        self.entry.pack(side="left", padx=6)
        tk.Button(entry_row, text="Set", font=("Segoe UI", 9, "bold"),
                  bd=0, padx=8, cursor="hand2",
                  command=self._on_entry_set).pack(side="left")

        # Quick fill buttons
        tk.Label(self.ctrl_frame, text="Quick Fill:",
                 font=("Segoe UI", 10)).pack(anchor="w", pady=(10, 2))
        quick_row = tk.Frame(self.ctrl_frame)
        quick_row.pack(fill="x")
        for pct in [25, 50, 75, 100]:
            tk.Button(
                quick_row, text=f"{pct}%",
                font=("Segoe UI", 9, "bold"),
                bd=0, padx=8, pady=4, cursor="hand2",
                command=lambda p=pct: self._set_percent(p)
            ).pack(side="left", padx=3)

        # Reset
        self.reset_btn = tk.Button(
            self.ctrl_frame, text="🔄 Reset",
            font=("Segoe UI", 10, "bold"),
            bd=0, padx=14, pady=6, cursor="hand2",
            command=self._reset)
        self.reset_btn.pack(pady=(14, 0))

        # ── BOTTOM STATUS ──
        self.status_frame = tk.Frame(self.root)
        self.status_frame.pack(fill="x", padx=20, pady=(4, 12))

        self.status_lbl = tk.Label(
            self.status_frame,
            text="ℹ️  Select a container and adjust the slider.",
            font=("Segoe UI", 9))
        self.status_lbl.pack(side="left")

    # ── THEME ────────────────────────────────
    def _toggle_theme(self):
        self.theme_name.set(
            "dark" if self.theme_name.get() == "light" else "light")
        self._apply_theme()
        self._update_display()

    def _apply_theme(self):
        T = THEMES[self.theme_name.get()]
        is_dark = self.theme_name.get() == "dark"

        self.root.configure(bg=T["bg"])

        def style_widget(w):
            cls = w.winfo_class()
            try:
                if cls in ("Frame", "Tk"):
                    w.configure(bg=T["bg"])
                elif cls == "Label":
                    w.configure(bg=T["bg"], fg=T["text"])
                elif cls == "LabelFrame":
                    w.configure(bg=T["panel"], fg=T["text"])
                elif cls == "Button":
                    w.configure(bg=T["btn_bg"], fg=T["btn_fg"],
                                activebackground=T["btn_active"],
                                activeforeground=T["btn_fg"])
                elif cls == "Canvas":
                    w.configure(bg=T["panel"])
                elif cls == "Entry":
                    w.configure(bg=T["panel"], fg=T["text"],
                                insertbackground=T["text"])
            except tk.TclError:
                pass
            for child in w.winfo_children():
                style_widget(child)

        style_widget(self.root)

        # Special overrides
        self.canvas_frame.configure(bg=T["panel"])
        self.canvas.configure(bg=T["panel"])
        self.level_lbl.configure(bg=T["panel"])
        self.cont_label.configure(bg=T["panel"], fg=T["accent"])
        self.max_lbl.configure(bg=T["panel"], fg=T["subtext"])
        self.ctrl_frame.configure(bg=T["panel"])
        self.status_frame.configure(bg=T["bg"])
        self.status_lbl.configure(bg=T["bg"], fg=T["subtext"])
        self.top_bar.configure(bg=T["bg"])
        self.title_lbl.configure(bg=T["bg"], fg=T["accent"])
        self.theme_btn.configure(
            text="☀️ Light Mode" if is_dark else "🌙 Dark Mode",
            bg=T["btn_bg"], fg=T["btn_fg"])
        self.reset_btn.configure(bg=T["accent"])
        self.sel_frame.configure(bg=T["panel"])

        # Container selector buttons
        name = self.container_name.get()
        for n, btn in self.cont_btns.items():
            if n == name:
                btn.configure(bg=T["accent"], fg=T["btn_fg"])
            else:
                btn.configure(bg=T["border"], fg=T["text"])

        # Fix child frames inside LabelFrames
        for frame in [self.mid, self.sel_frame]:
            for child in frame.winfo_children():
                try:
                    child.configure(bg=T["panel"])
                except Exception:
                    pass

    # ── CONTAINER SELECTION ──────────────────
    def _select_container(self, name):
        self.container_name.set(name)
        self.liters.set(0.0)
        max_l = CONTAINERS[name]["max_liters"]
        self.slider.configure(to=max_l)
        self.slider.set(0)
        self._apply_theme()
        self._update_display()

    # ── SLIDER CALLBACK ──────────────────────
    def _on_slider(self, val):
        v = round(float(val), 3)
        self.liters.set(v)
        self._update_display()

    # ── ENTRY SET ────────────────────────────
    def _on_entry_set(self):
        try:
            val = float(self.entry.get())
            max_l = CONTAINERS[self.container_name.get()]["max_liters"]
            if val < 0 or val > max_l:
                messagebox.showwarning(
                    "Out of Range",
                    f"Value must be between 0 and {max_l} L")
                return
            self.liters.set(round(val, 3))
            self.slider.set(val)
            self._update_display()
        except ValueError:
            messagebox.showerror("Invalid Input", "Please enter a valid number.")

    # ── QUICK FILL ───────────────────────────
    def _set_percent(self, pct):
        max_l = CONTAINERS[self.container_name.get()]["max_liters"]
        val = round(max_l * pct / 100, 3)
        self.liters.set(val)
        self.slider.set(val)
        self._update_display()

    # ── RESET ────────────────────────────────
    def _reset(self):
        self.liters.set(0.0)
        self.slider.set(0)
        self._update_display()

    # ── UPDATE DISPLAY ───────────────────────
    def _update_display(self):
        T = THEMES[self.theme_name.get()]
        name = self.container_name.get()
        info = CONTAINERS[name]
        liters = self.liters.get()
        max_l = info["max_liters"]
        pct = (liters / max_l) if max_l > 0 else 0

        # Water color by fill level
        if pct >= 0.75:
            water_color = T["water_full"]
        elif pct >= 0.35:
            water_color = T["water_mid"]
        else:
            water_color = T["water_low"]

        # Labels
        self.cont_label.configure(
            text=f"{info['emoji']} {name}")
        self.max_lbl.configure(
            text=f"Max: {max_l:.2f} L  ({max_l*1000:.0f} mL)")
        self.level_lbl.configure(
            text=f"{liters:.3f} L  ({pct*100:.1f}%)",
            fg=water_color if pct > 0 else T["subtext"])

        # Status message
        if pct == 0:
            msg = f"ℹ️  Container is empty."
        elif pct < 0.25:
            msg = f"💧 Low water — {liters:.3f} L filled."
        elif pct < 0.75:
            msg = f"💦 Half-filled — {liters:.3f} L in the {name}."
        elif pct < 1.0:
            msg = f"🌊 Nearly full — {liters:.3f} L!"
        else:
            msg = f"✅ {name} is completely full! ({liters:.3f} L)"
        self.status_lbl.configure(text=msg)

        # Draw visualization
        self._draw_container(name, info["shape"], pct, water_color, T)

    # ── CANVAS DRAWING ───────────────────────
    def _draw_container(self, name, shape, pct, water_color, T):
        c = self.canvas
        c.delete("all")
        W, H = 230, 280
        cx = W // 2

        # ── Shape geometry ──
        if shape == "glass":
            top_w, bot_w, top_y, bot_y = 80, 60, 30, 240
        elif shape == "mug":
            top_w, bot_w, top_y, bot_y = 75, 70, 30, 230
        elif shape == "jug":
            top_w, bot_w, top_y, bot_y = 60, 90, 25, 245
        elif shape == "bottle":
            top_w, bot_w, top_y, bot_y = 30, 70, 20, 250
        else:  # bucket
            top_w, bot_w, top_y, bot_y = 100, 70, 30, 245

        half_top = top_w // 2
        half_bot = bot_w // 2
        container_h = bot_y - top_y

        # Shadow
        c.create_polygon(
            cx - half_top + 4, top_y + 4,
            cx + half_top + 4, top_y + 4,
            cx + half_bot + 4, bot_y + 4,
            cx - half_bot + 4, bot_y + 4,
            fill=T["shadow"], outline="")

        # Water fill (clipped trapezoid)
        if pct > 0:
            water_h = container_h * pct
            water_top_y = bot_y - water_h
            ratio = (water_top_y - top_y) / container_h if container_h else 0
            water_top_w = half_top + (half_bot - half_top) * ratio

            # Wave animation (static wave top)
            wave_pts = [cx - water_top_w, water_top_y]
            segments = 8
            seg_w = (water_top_w * 2) / segments
            for i in range(segments + 1):
                x = cx - water_top_w + i * seg_w
                y = water_top_y + (4 if i % 2 == 0 else -4)
                wave_pts += [x, y]
            wave_pts += [cx + half_bot, bot_y, cx - half_bot, bot_y]

            c.create_polygon(wave_pts, fill=water_color, outline="")

            # Shine highlight inside water
            c.create_rectangle(
                cx - water_top_w + 8, water_top_y + 6,
                cx - water_top_w + 18, bot_y - 6,
                fill="#ffffff", outline="", stipple="gray25")

        # Container outline
        c.create_polygon(
            cx - half_top, top_y,
            cx + half_top, top_y,
            cx + half_bot, bot_y,
            cx - half_bot, bot_y,
            outline=T["accent"], fill="", width=3)

        # Top rim
        c.create_line(
            cx - half_top, top_y,
            cx + half_top, top_y,
            fill=T["accent"], width=4)

        # Mug handle
        if shape == "mug":
            c.create_arc(
                cx + half_bot - 5, top_y + 40,
                cx + half_bot + 38, top_y + 120,
                start=270, extent=180,
                outline=T["accent"], width=3, style="arc")

        # Bottle neck
        if shape == "bottle":
            c.create_rectangle(
                cx - 15, top_y - 30, cx + 15, top_y,
                outline=T["accent"], fill=T["panel"], width=2)
            c.create_rectangle(
                cx - 10, top_y - 45, cx + 10, top_y - 30,
                outline=T["accent"], fill=T["panel"], width=2)

        # Bucket handle
        if shape == "bucket":
            c.create_arc(
                cx - half_top + 10, top_y - 40,
                cx + half_top - 10, top_y + 10,
                start=0, extent=180,
                outline=T["accent"], width=3, style="arc")

        # Graduation marks (5 lines)
        for i in range(1, 5):
            y = top_y + (container_h * i / 5)
            tw = half_top + (half_bot - half_top) * i / 5
            c.create_line(
                cx - tw, y, cx - tw + 14, y,
                fill=T["subtext"], width=1)
            c.create_line(
                cx + tw, y, cx + tw - 14, y,
                fill=T["subtext"], width=1)
            lval = CONTAINERS[name]["max_liters"] * i / 5
            c.create_text(
                cx + tw + 18, y,
                text=f"{lval:.2f}L",
                font=("Segoe UI", 7), fill=T["subtext"],
                anchor="w")

        # Container name label at bottom
        c.create_text(
            cx, bot_y + 20, text=name.upper(),
            font=("Segoe UI", 9, "bold"),
            fill=T["subtext"])


# ─────────────────────────────────────────────
#  ENTRY POINT
# ─────────────────────────────────────────────
if __name__ == "__main__":
    root = tk.Tk()
    app = WaterMeasurementApp(root)
    root.mainloop()