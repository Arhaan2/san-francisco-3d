# Neighborhood geometry

These small, on-demand datasets are derived from the same [DataSF Building Footprints](https://data.sfgov.org/Housing-and-Buildings/Building-Footprints/ynuv-fyni) and [public terrain data](https://registry.opendata.aws/terrain-tiles/) used in the Blender scene. They contain mapped footprints, recorded building heights, foundation elevations, and source building identifiers.

Each selection covers building centers within 320 metres of the neighborhood view. Only one overlay is displayed at a time.

| View | Mapped buildings | Restored low-rise masses |
|---|---:|---:|
| North Beach | 817 | 0 |
| Chinatown | 593 | 0 |
| Mission District | 715 | 715 |
| Pacific Heights | 467 | 465 |

The browser export already contains the central city and tall outlying buildings. Its geographic bounds and exact roof-to-lowest-foundation height test determine which structures may be restored. Existing masses receive only thin cornice relief; their walls and aerial roofs remain intact. New masses reuse the base model’s NAIP roof imagery and add instanced windows, sills, and cornices. Facade details are architectural interpretations, not surveyed elevations or photogrammetry. Source data predates some present-day development.

Coordinates are kilometres, Y up, east +X and north −Z. The local geographic origin follows the base model. Rings are simplified with a maximum 15-centimetre perpendicular tolerance to remove tiny survey jogs. JSON files load only after neighborhood selection; failure leaves the base city and navigation available.

Mission and Pacific Heights also load 548×432-pixel native crops from the existing 8000×7200 NAIP city mosaic. Each is approximately 115–122 KB and improves the local texture resolution by about 2× over the web model. These public-domain pixels are neither generated nor upsampled. New roofs use the crops; a feathered ground decal copies the original terrain's exact triangles and smooth normals, remains depth-tested beneath buildings, and does not alter the source model. Imagery failure falls back to the original texture. Geographic bounds and source metadata accompany both crops.

The extraction script is `work/navigation/extract_neighborhoods.py` in the authoring workspace. `manifest.json` records counts, geographic centers, and file sizes. Landmark and neighborhood stories link to their primary institutional, architectural, park, or official visitor sources directly in the viewer.
