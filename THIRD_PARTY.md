# Third-party components and data

- Three.js 0.180.0 and its included addons: MIT, license in `dist/vendor/three/LICENSE.txt`.
- Google Draco geometry decoder: Apache License 2.0, license in `dist/vendor/three/draco/LICENSE.txt`.
- Barlow and Barlow Condensed: SIL Open Font License, license in `dist/assets/fonts/OFL.txt`.
- Archivo variable: [Omnibus-Type / Google Fonts](https://github.com/google/fonts/tree/main/ofl/archivo), SIL Open Font License 1.1; license in `dist/assets/fonts/OFL-Archivo.txt`, source provenance in `SOURCE-Archivo.txt`. Self-hosted WOFF2 files provide the current interface and postcard typography.
- STIX Two Text: SIL Open Font License, license in `dist/assets/fonts/OFL-STIXTwoText.txt`.
- City and County of San Francisco building footprints, street and park datasets: [DataSF](https://data.sf.gov/Geographic-Locations-and-Boundaries/Building-Footprints/ynuv-fyni). Full dataset citations are included in the source release.
- Terrain: [Mapzen / AWS Terrain Tiles](https://registry.opendata.aws/terrain-tiles/).
- Aerial imagery: public-domain USGS/USDA [NAIP imagery](https://imagery.nationalmap.gov/arcgis/rest/services/USGSNAIPImagery/ImageServer).
- Render lighting: [Kloofendal 48d Partly Cloudy (Pure Sky)](https://polyhaven.com/a/kloofendal_48d_partly_cloudy_puresky), Greg Zaal, sky edits by Jarod Guest; [Industrial Sunset 02 (Pure Sky)](https://polyhaven.com/a/industrial_sunset_02_puresky), Poly Haven. Both distributed under CC0.

The seven city images are renders produced from the project's Blender scene. The web model and image gallery do not use third-party reference photographs as substitute city renders.

The four on-demand neighborhood datasets reuse DataSF footprints and public terrain elevations. They restore 1,180 low-rise building masses in the Mission District and Pacific Heights. Those two views also use native-resolution crops of the same public-domain NAIP aerial mosaic; architectural window and cornice details are interpretations. The neighborhood asset README and manifest document their coverage and source metadata. Landmark and neighborhood descriptions link to primary institutional, architectural, park or official visitor sources in the viewer.

The browser's 60-second tour, continuous virtual-day lighting, moving water, two ferries, coastal haze, exact-view sharing and PNG postcards are project-authored features. Optional harbor ambience is synthesized in the browser from original oscillators and noise; it contains no external audio recordings. Browser lighting is artistic and does not model a date-specific physical solar position. These additions do not modify the full Blender release or its seven rendered images.
