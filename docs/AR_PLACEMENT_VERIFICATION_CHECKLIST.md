# AR Placement Verification Checklist

Run these tests on device/simulator with the debug overlay enabled (`__DEV__`). Document pass/fail per scenario.

---

## Test A – Crosshair lock

1. Select painting, tap "Detect Wall"
2. Move device so crosshair is at position A
3. Start a rotate gesture on the crosshair (two-finger rotate) and hold
4. Move device significantly – crosshair should stay at A
5. Tap "Place Here" – image should appear at A (not at new camera aim)
6. **Verify via debug overlay:** `pos` matches `cross` when locked

| Step | Pass | Fail | Notes |
|------|------|------|-------|
| 1-5  |      |      |       |
| 6    |      |      |       |

---

## Test B – Wall vs crosshair

1. Point at empty space (ceiling, floor, or gap between walls) – no plane detected
2. Crosshair should still follow camera
3. Tap "Place Here" – image should place at crosshair in empty space
4. **Verify via debug overlay:** `wall` can be `null` while image still places

| Step | Pass | Fail | Notes |
|------|------|------|-------|
| 1-4  |      |      |       |

---

## Test C – Initial state

1. Select a painting from gallery (do not tap "Detect Wall")
2. Image appears immediately at `[0, 0, -2]` (2m in front)
3. **Debug overlay:** `pos: [0, 0, -2]` (or equivalent)
4. Tap "Detect Wall", move crosshair, tap "Place Here"
5. Image jumps from default to crosshair position
6. **Debug overlay:** `pos` updates to match `cross` after Place Here

| Step | Pass | Fail | Notes |
|------|------|------|-------|
| 1-3  |      |      |       |
| 4-6  |      |      |       |
