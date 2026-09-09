# A32 connected apartment model

This Three.js model uses the two supplied floor plans. One model unit equals one metre.

Run `npm install`, then `npm run dev`. Open the local address printed by the server.

The published site is at https://alex-alecu.github.io/intre-lacuri-residence/. GitHub Actions checks and publishes the site when a change is pushed to `main`. Run `npm run build:pages` to make the same static output locally. The output is in `dist/client`. It includes the model and extracted dimensions. It excludes the original PDF and plan image. File links use the repository path.

The Pages workflow runs on Linux. The installed vinext version can stop with a libuv shutdown error after static export on Windows with Node.js 24. The workflow requires a successful build and file checks before it can publish.

The 3D overview has cut walls. Drag to rotate. Use the wheel to zoom. Select a room to move the camera.

The interface is in Romanian. Select **Plimbare**, then the start control. Use W A S D or the arrow keys to move. Use the mouse to look. Hold Shift to move faster. Press Esc to release the mouse. On a touch screen, drag the scene to look and use the four arrow controls to move. The model has no room labels or dimension lines.

On iPad, use **Încăperi** to open the room list. The model uses the available screen in portrait, landscape, and Split View. In the 3D view, drag one finger to rotate. Use two fingers to zoom and move the view. In the plan, drag one finger to move the view. In **Plimbare**, press **Începe plimbarea**, hold a direction arrow with one hand, and drag the scene with the other hand to look. **Pauză** stops movement. The full-screen control also has an expanded layout when the browser cannot enter native full screen.

The touch renderer limits pixel density to reduce graphics work. Static shadows update when the walls or furniture change. The model can restore its graphics context after a temporary loss. Safe-area padding keeps controls clear of the screen edges.

The plan data is in `lib/plan.ts`. Architecture and furniture are in `lib/build-home.ts`. Camera and input controls are in `lib/home-scene.ts`. Collision rules are in `lib/navigation.ts`.

The apartment PDF labels the apartments 11 and 12. The A07 full-floor PDF labels the same layouts 6 and 7. The west apartment is 6/11. The east apartment is 7/12. See `MEASUREMENT_AUDIT.md` for the three measurement checks and `public/measurements.json` for the source values and differences.

The new hall opening is 1.20 m wide and 2.15 m high. The guest room has a proposed south partition and an east door near the opening in A07. The apartment PDF shows a different guest opening. The model keeps the concrete columns and service shafts. The new hall opening is a design proposal. A structural engineer must check the wall before site work.

Wall height is an assumed 2.70 m. The source mark +6.40 m is the floor elevation. It is not the room height. The child's room uses the A07 dimension of 3.00 m. The apartment PDF gives 3.05 m. This difference remains unresolved. Internal partitions follow the 0.125 m vector width, rounded to 13 cm in the labels. Exterior walls include 0.25 m wall and 0.15 m insulation. Party and stair-entry walls are 0.25 m. Room areas are source labels. Bounding rectangles must not be summed. The small map uses outlines at recesses and shafts.

Furniture uses custom geometry and local material textures. The east room has a large kitchen, a 1.90 × 0.90 m dining table for six, a 2.45 × 2.00 m corner sofa and a 0.70 × 0.50 m oval coffee table, and tall cabinets for the fridge, ovens, and pantry. The west room has a sage sofa, two cream armchairs, an oval wood coffee table, and an office desk with storage. The guest room has the second desk. The living sofa is centred on the solid rear wall. The library beside the windows is removed. The hall to the dining room has a 1.80 × 0.42 m coat wardrobe with sliding fronts. The small hall beside the bathroom has a second wardrobe, 1.00 m wide and 0.60 m deep, with sliding doors. Both sitting areas have no TV. The child room has a wood house bed, cloud lights, low toy storage, and a small reading tent. There are three bedrooms, two bathrooms, and a utility room with WC. Both balconies have teak storage benches, planted wall panels, and stone planters. The third-person camera can be added to the existing camera modes later.

The two north bathrooms follow the fixture arrangement in A07. The west WC faces south. The east WC faces east. The west bathroom corner is closed. Furniture and fixture sizes are design choices unless the source gives a size. The main wardrobe and guest desk leave the balcony openings clear. The south dining aisle is 0.78 m with the chairs in their shown position. The kitchen work aisle is 1.01 m. The nearest dining chair is 0.475 m from the corner sofa. The coat wardrobe leaves 0.86 m clear within the hall. The small hall wardrobe leaves a 1.33 m passage and clears both room doors. The dining coffee table is 0.43 m from the sofa return and 0.45 m from the main sofa wing. These values use the shown chair positions. See the measurement report for changed furniture sizes.

Run `npm run check` for the type check. Run `npm run test:model` for 18 wall-face checks, column and shaft checks, 52 furniture mesh checks, and movement checks. The movement test uses a 0.08 m grid and a player radius of 0.19 m. It checks each room, all four balcony openings, kitchen access, and desk access from the entry. It also checks the corrected doors, bathroom wall, WC positions, and number of desks and dining chairs. Run `npm run build:pages` for the published files.

Browser image and interaction checks were not run. WebMCP registration is optional. No supported WebMCP test context was available in this session.

Run `npm run test:touch` to check multiple fingers, input cancellation, pause, keyboard input, touch view modes, and portrait framing. These are code checks. A physical iPad was not available for device tests.

The three reference photos guide the room colours, materials, and furniture style. The botanical wall prints use a generated image at `public/artwork/botanical-pair.jpg`. The original reference photos are not website assets.
