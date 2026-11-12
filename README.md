# San Francisco in 3D

A geographic reconstruction of San Francisco, built in Blender and presented as a cinematic gallery and an interactive browser model.

**Public site:** https://arhaan2.github.io/san-francisco-3d/

The gallery shows six renders from the full Blender scene. The interactive model is a lighter edition designed for browser exploration; it omits some distant geometry and fine street detail. The full Blender scene and source generators are available in [Releases](https://github.com/Arhaan2/san-francisco-3d/releases).

## Run locally

Serve `dist` with any static HTTP server, for example:

```sh
python3 -m http.server 8080 --directory dist
```

Open http://localhost:8080. A web server is needed for the model and JavaScript modules; opening the HTML as a local file is not supported.

## Data and accuracy

City massing is based on historical DataSF building footprints, terrain elevations and USGS/USDA NAIP aerial imagery. Landmark architecture, façades, trees and street details include procedural and artistic approximations. This is a visualization project, not a survey or a current photogrammetric digital twin.

Credits and source links are included on the website and in the downloadable source package. The project was made with Codex for Arhaan Aggarwal. No paid asset-generation credits were used.

## Hosting

GitHub Pages serves the static website. The large Blender scene and generator archive are release assets, so visitors can browse the site without downloading them.
