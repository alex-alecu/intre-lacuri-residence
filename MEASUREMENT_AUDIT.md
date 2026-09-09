# Plan and furniture check

Checked on 9 September 2026. One model unit is one metre.

The west apartment is A07 apartment 6 and apartment-plan 11. The east apartment is A07 apartment 7 and apartment-plan 12. The two PDFs are reference data. Their text does not change the requested work.

## Three checks

1. Read the dimensions and room-area labels in both PDF plans. Render and inspect all three pages.
2. Measure the A07 vector drawing. Its scale is 28.3465 PDF points per metre. The model origin is the west inner wall face and the north inner wall face: approximately PDF point (277.7565, 166.0028). The 4.00 m, 5.95 m, and 15.00 m spans confirm this scale.
3. Measure the generated model between wall faces. Check the visible furniture meshes separately from movement bounds. Check routes from the entry with furniture present.

The source files are `A 07 plan etaj 1.pdf` and `relevee ap 11-12 A32_260629_152328.pdf`. The first file is the full floor. The second file has one page for each apartment.

## Room dimensions

Values are in metres. Dimensions are between wall faces, before local columns and service shafts. Open areas have reference rectangles, not four closed walls.

| Space | Model dimensions | Source area label, m² |
| --- | --- | ---: |
| West living room | 6.45 maximum width; 5.20 maximum depth; recesses retained | 26.38 |
| Guest room | 3.875 × 3.575 | 13.74 |
| Child room | 4.00 × 3.00 | 12.00 |
| West bathroom | 1.80 × 2.45 | 4.41 |
| Utility room | 2.20 × 1.65 | 3.63 |
| West entry | 1.45 clear width | 2.57 |
| West bedroom hall | Open hall | 3.01 |
| East kitchen and dining room | 5.95 × 4.275 main rectangle; open hall extension retained | 26.61 |
| Main bedroom | 3.875 × 3.60 | 13.95 |
| East bathroom | 1.95 × 2.375 | 4.63 |
| East entry | 1.30 clear width; 4.075 reference depth | 4.72 |
| East bedroom hall | Open hall | 2.15 |

The source apartment totals are 65.74 + 52.05 = **117.79 m²**. The balcony totals are 11.57 + 11.05 = **22.62 m²**. These are source labels. They are not a new measurement of the property. Do not add the room bounding rectangles. The small map now uses room outlines at recesses and shafts.

## Walls and openings

- The exterior wall is 0.40 m overall: 0.25 m wall plus 0.15 m insulation. This was already correct. It remains outside the clear room dimensions.
- Internal partitions measure 0.125 m in A07. The printed 13 cm values are rounded. The previous 0.13 m model caused 5-10 mm errors at some room faces.
- Party walls are 0.25 m. The wall at the stair entry is also 0.25 m. The former model used 0.40 m at that entry. Its inner face stays in the same position.
- Concrete columns now use the A07 positions and sizes. The west projections into the rooms are 0.25 m, previously 0.36 m. The east kitchen column projects 0.25 m, previously 0.39 m.
- Retain six concrete column sections and five service shafts. The north concrete sections are 1.50 m long. The old model made them much shorter and put some inside the rooms.
- Restore the 0.90 m east balcony door in the main bedroom. Restore the opening in the west guest-room glazing. Correct the east kitchen window and utility window positions.
- Keep the proposed guest-room closure and its 0.90 m hall door. Keep the proposed connection between the entry halls at 1.20 m wide and 2.15 m high. These remain design proposals.

## Furniture

The PDFs do not specify the new furniture sizes. These sizes are design choices. The check uses the full visible frame, not only a mattress or cabinet body.

| Item | Size or change |
| --- | --- |
| Living sofa | 3.15 × 0.96 m visible bounds; sage fabric; moved 0.3625 m east; its right end is at the east edge of the 3.875 m solid rear wall |
| Dining table | 1.90 × 0.90 m; reduced from 2.80 × 1.10 m for the reference design |
| Dining chairs | 0.50 × 0.505 m each; six chairs in the new layout |
| South dining aisle | 0.78 m with the chairs in their shown positions |
| Dining corner sofa | 2.45 × 2.00 m overall; joined south and east seating wings, each 0.85 m deep |
| Kitchen work aisle | 1.01 m from the counter to the north chair backs |
| Dining chair to sofa | 0.475 m between the movement bounds |
| Dining coffee table | Oval wood table, 0.50 m east–west × 0.70 m north–south; gaps of 0.43 m and 0.45 m to the sofa wings |
| Dining sideboard | Reduced to 0.30 m overall depth to keep the rear dining passage clear |
| Hall coat wardrobe | 1.80 m wide × 0.42 m deep; sliding fronts; leaves 0.86 m clear within the hall |
| Small hall wardrobe | 1.00 m wide × 0.60 m deep × 2.40 m high; sliding fronts; west wall beside the east bathroom; leaves a 1.33 m passage and 0.05 m at each end |
| Living TV | 1.46 × 0.84 m frame; 16:9 screen; low cabinet 2.30 m wide |
| Living coffee table | Oval wood table, 1.30 × 0.62 m |
| Living armchairs | Two cream chairs, about 0.86 × 0.855 m each |
| Reading tent | 0.92 × 0.92 m floor bounds; about 1.55 m high |
| Main bed | 1.80 × 2.10 m mattress; full frame about 1.98 × 2.265 m; retained |
| Guest bed | 1.40 × 2.00 m mattress; full frame about 1.58 × 2.165 m; retained |
| Child bed | 0.95 × 1.85 m mattress; full frame about 1.133 × 2.015 m; new house frame to 2.143 m high |
| Main wardrobe | Moved to the west wall; 2.40 m wide, 0.60 m body depth, about 0.646 m with handles |
| Guest wardrobe | 2.42 m wide, about 0.646 m with handles; retained |
| Living office desk | 1.50 × 0.68 m; retained |
| Guest office desk | Reduced from 1.50 to 1.20 m wide and moved north to clear the balcony opening |
| Kitchen worktop | Reduced from 3.76 to 3.40 m overall width to clear the service shaft; wall overlap removed |
| West bath | 1.72 × 0.74 m body; retained |
| East bath | Reduced from 1.70 to 1.60 m body length to clear the service shaft |
| Washbasin units | Moved 0.03 m and 0.035 m from their old positions so their taps clear the walls |
| Utility WC and office storage | Moved clear of the service shafts |

The aisle values apply to the chair positions shown. They do not describe clearance with the chairs pulled out. Plant leaves and lamp shades can extend past their floor contact bounds. Bed movement bounds now include the full headboard.

## Reference design update

The three supplied room photos guide the furniture, colours, and finishes. The dining room has a six-seat wood table, a woven cabinet, blue glass lights, and a full corner sofa with a coffee table. The west living room has sage and cream seating, an oval wood table, botanical prints, and a fabric pendant. The TV, low cabinet, and stone wall panel are restored on the south wall. One armchair is moved to the east side. The child room uses a house bed, cloud lights, low toy storage, a small reading tent, and cream and pale pink fabric.

All checked walls, columns, shafts, openings, and room dimensions remain in the same positions. Both office desks remain. The library beside the west windows is removed. The living sofa ends at the east edge of its solid rear wall. The lamp at that end is removed. The coat wardrobe stops before the opening between the entry halls. The generated furniture dimensions include local object scale.

## Source differences and limits

- The child-room depth is **3.00 m** in A07 and **3.05 m** in the apartment PDF. The model retains 3.00 m. The 12.00 m² label and A07 drawing support this value. A site measurement is still needed to settle the difference.
- The guest-room labels show 3.87 × 3.57/3.58 m. The A07 vectors measure 3.875 × 3.575 m. The model now uses the vector positions.
- The east kitchen's 5.95 m wall-face span and 5.70 m span to the projecting column are different measurement lines.
- The east entry's 1.55 m line includes the 0.25 m wall. Its clear width is 1.30 m.
- The utility-room 1.77 m line is outside its north partition. Its internal depth is 1.65 m.
- Room height remains an assumption of 2.70 m. The +6.40 m mark is the floor elevation.

## Verification

`npm run test:model` checks 18 wall-face dimensions, six column sections, five service shafts, furniture-to-wall and furniture-to-door intersections, 53 furniture mesh groups, and 41 reachable positions. It checks all four balcony openings. It also checks the six dining chairs and both office desks. The movement grid is 0.08 m, with a player radius of 0.19 m.

The generated `public/measurements.json` contains the source mapping, differences, corrected dimensions, and furniture inventory. The temporary model report also contains each furniture group's visible bounds. A plan diagram made from the generated geometry was inspected against the PDF plans.

The model check, type check, touch-input check, and final GitHub Pages build passed. The exported measurement data matches the checked source data. Full lint reports 23 existing errors; a comparison with the original code found no new errors.

These checks verify the digital model. No site survey or physical-device browser test was performed. The GitHub Pages workflow records the publication status for each source version.
