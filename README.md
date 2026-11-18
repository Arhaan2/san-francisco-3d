# San Francisco in 3D

A geographic reconstruction of San Francisco, built in Blender and presented as a cinematic gallery and an interactive browser model.

**Public site:** https://arhaan2.github.io/san-francisco-3d/

The gallery shows seven renders from the full Blender scene, including a sunset waterfront view. Switch the opening image between sunset, daylight and blue hour, or open any gallery image at full resolution. The interactive model is a lighter edition designed for browser exploration; it omits some distant geometry and fine street detail. The full Blender scene and source generators are available in [Releases](https://github.com/Arhaan2/san-francisco-3d/releases).

## Explore the live city

The site opens with a full-screen city render. Switch its light, enter the live city immediately, or choose a starting place. The time slider stays visible while exploring; places and settings share a compact panel. The seven-render collection supports touch, mouse dragging, keyboard navigation and full-screen viewing.


- Take a 60-second cinematic tour, with pause, resume and stop controls.
- Adjust the lighting continuously across a virtual 24-hour day, from daylight to sunset and illuminated night.
- Select eight landmarks or visit North Beach, Chinatown, the Mission District and Pacific Heights. Neighborhood detail loads on demand, restoring 1,180 additional low-rise buildings across the Mission and Pacific Heights.
- Watch two ferries cross moving water beneath coastal haze. Movement can be switched off, and reduced-motion preferences are respected.
- Share the current neighborhood, camera angle and time of day in one link, or save a PNG postcard of the view.
- Turn on optional synthesized harbor ambience. Sound remains off until explicitly enabled.

The browser additions leave the full Blender release and its seven finished renders unchanged. Browser lighting is an artistic interpretation of a virtual day, rather than a physical solar simulation for a particular date.

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
