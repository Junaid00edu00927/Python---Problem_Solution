# 💧 Water Measurement App

> **A Python + tkinter desktop application for visually measuring water volumes in everyday containers — with live blue-water visualization and Light/Dark theme support.**

---

## Overview

Water Measurement App is a compact, single-file Python desktop tool that simulates filling different household containers with water. It renders a **real-time blue-water graphic** inside a drawn container shape — complete with wave tops, graduation marks, and a shine effect. Everything updates instantly as you move the slider or type a value.

Perfect for:
- Learning about water volumes
- Quick kitchen/cooking references
- Science or education demonstrations
- Understanding litre measurements visually

---

## Features

| Feature | Details |
|---|---|
| 🫙 5 container types | Glass, Mug, Jug, Bottle, Bucket |
| 💧 Blue water visualization | Live canvas drawing with wave effect |
| 🎚️ Slider control | Smooth drag from 0 → max capacity |
| ⌨️ Manual entry | Type exact litre value |
| ⚡ Quick-fill buttons | 25%, 50%, 75%, 100% fill |
| 📐 Graduation marks | 4 tick marks with litre labels |
| 🌙 Dark / ☀️ Light theme | Toggle button, full palette swap |
| 📊 Status messages | Contextual text (empty → full) |
| 🔄 Reset button | Clear to 0 L instantly |
| ✅ No pip required | Only uses built-in tkinter |

---

## Containers & Capacities

| Container | Emoji | Max Volume | Max Volume (mL) | Shape |
|---|---|---|---|---|
| Glass  | 🥛 | 0.35 L | 350 mL  | Tapered tumbler |
| Mug    | ☕ | 0.50 L | 500 mL  | Cylinder + handle |
| Jug    | 🫙 | 2.00 L | 2000 mL | Wide trapezoid |
| Bottle | 🍶 | 1.50 L | 1500 mL | Narrow + neck |
| Bucket | 🪣 | 10.00 L | 10000 mL | Wide + arc handle |

---

## Screenshots / UI Layout

```
┌────────────────────────────────────────────────────────────┐
│  💧 Water Measurement App                    [🌙 Dark Mode] │
├────────────────────────────────────────────────────────────┤
│  Choose Container                                          │
│  [🥛 Glass] [☕ Mug] [🫙 Jug] [🍶 Bottle] [🪣 Bucket]      │
├───────────────────────┬────────────────────────────────────┤
│  Visualization        │  Controls                          │
│                       │                                    │
│    ┌───────┐          │  Container:  🥛 Glass               │
│    │~~~~~~~│          │  Max:  0.35 L  (350 mL)            │
│    │███████│          │                                    │
│    │███████│  0.25 L  │  Set Water (Liters):               │
│    │███████│  (71.4%) │  [══════════●────────]             │
│    │███████│          │                                    │
│    └───────┘          │  Enter (L): [0.250] [Set]          │
│     GLASS             │  Quick: [25%] [50%] [75%] [100%]  │
│                       │                                    │
│  0.250 L  (71.4%)     │              [🔄 Reset]            │
├───────────────────────┴────────────────────────────────────┤
│  🌊 Nearly full — 0.250 L!                                  │
└────────────────────────────────────────────────────────────┘
```

---

## Requirements

- **Python 3.6 or higher**
- **tkinter** — included with standard Python on Windows, macOS, and most Linux distros


## How to Run

1. **Download** `water_measurement.py`
2. **Open a terminal / command prompt**
3. **Run:**


## How to Use

### Step-by-step:

1. **Select a container** — click any of the 5 buttons at the top  
   *(the active container is highlighted in blue)*

2. **Set the water level** using any of three methods:
   - **Slider** — drag left/right
   - **Enter (L)** — type a value and click **Set**
   - **Quick fill** — click `25%`, `50%`, `75%`, or `100%`

3. **Watch the visualization** update:
   - Blue water rises from the bottom
   - Wavy top surface appears
   - Level label shows exact litres + percentage
   - Status bar gives a natural description

4. **Switch theme** with the button in the top-right corner

5. **Reset** to empty with the 🔄 button

---

## Code Architecture

```
water_measurement.py
│
├── CONTAINERS  (dict)        → Name, max_liters, emoji, shape
├── THEMES      (dict)        → Light & dark colour tokens
│
└── WaterMeasurementApp  (class)
    ├── __init__()            → State variables + build_ui
    ├── _build_ui()           → All widget creation
    │   ├── Top bar           → Title + theme toggle
    │   ├── sel_frame         → Container selector buttons
    │   ├── canvas_frame      → tkinter Canvas + level label
    │   ├── ctrl_frame        → Slider, entry, quick-fill, reset
    │   └── status_frame      → Bottom status label
    │
    ├── _toggle_theme()       → Light ↔ Dark swap
    ├── _apply_theme()        → Walk widget tree, apply colours
    ├── _select_container()   → Switch container, reset slider
    ├── _on_slider()          → Slider → liters
    ├── _on_entry_set()       → Validate + apply manual input
    ├── _set_percent()        → Quick-fill (25/50/75/100%)
    ├── _reset()              → Set liters to 0
    ├── _update_display()     → Update labels + call draw
    └── _draw_container()     → All Canvas drawing logic
```


## Visualization Details

The container is drawn purely with the **tkinter Canvas** API — no images used:

- **Shadow polygon** — slightly offset gray fill for depth
- **Water polygon** — trapezoid fill clipped to container geometry, with wavy top edge (8-segment sine approximation)
- **Shine strip** — white semi-transparent rectangle for 3-D glass effect
- **Container outline** — 3-pixel polygon outline with accent colour
- **Top rim** — 4-pixel horizontal line
- **Shape extras:**
  - Mug → arc handle on the right side
  - Bottle → rectangular neck + cap drawn above body
  - Bucket → arc handle drawn above rim
- **Graduation marks** — 4 tick marks with volume labels

---

## Input Methods

| Method | How | Range |
|---|---|---|
| Slider | Drag horizontally | 0 → container max |
| Manual entry | Type litres, press Set | Validated: 0 → max |
| Quick 25% | Button | max × 0.25 |
| Quick 50% | Button | max × 0.50 |
| Quick 75% | Button | max × 0.75 |
| Quick 100% | Button | max (full) |

If a manual entry is out of range, a warning dialog appears. Non-numeric input shows an error dialog.

---

## Water Color Logic

| Fill Level | Colour 
|---|---|---|
| 0 – 34% (Low) | Light Blue | 
| 35 – 74% (Mid) | Medium Blue | 
| 75 – 100% (Full) | Deep Blue | 

*(Dark mode uses slightly darker variants of the same logic.)*

---

## Future Ideas

- [ ] **Animated wave** using `root.after()` loop
- [ ] **Unit converter** — toggle mL / fl oz / cups / pints
- [ ] **Pour animation** — transfer water between containers
- [ ] **Daily tracker** — log total water intake per day
- [ ] **Custom container** — user inputs their own max volume
- [ ] **CSV export** — save measurement sessions to file
- [ ] **Multiple containers side-by-side** comparison view
- [ ] **Sound effect** — water dripping/pouring on fill

---

## FAQ

**Q: Does this need any pip install?**  
A: No. Only tkinter is needed, and it ships with Python.

**Q: Will it work on Windows / macOS / Linux?**  
A: Yes — tkinter is cross-platform.

**Q: Can I add my own container?**  
A: Yes — add an entry to the `CONTAINERS` dict at the top of the file with your own `max_liters` and pick any `shape` key.

**Q: The window is small. Can I resize it?**  
A: The window is fixed at 680×620 in this version. You can change `self.root.geometry("680x620")` and `self.root.resizable(False, False)` to allow resizing, but the canvas layout may need adjustment.

**Q: How do I change the default theme to dark?**  
A: Change `self.theme_name = tk.StringVar(value="light")` to `value="dark"` in `__init__`.

---


