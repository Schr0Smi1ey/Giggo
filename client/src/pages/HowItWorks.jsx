import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, CheckCircle2, ShieldCheck, UserRoundSearch, WalletCards } from 'lucide-react';
import { Button } from '../components/Button.jsx';
import tripData from '../data/tripdata.json';

const CESIUM_VERSION = '1.120';
const CESIUM_BASE = `https://cesium.com/downloads/cesiumjs/releases/${CESIUM_VERSION}/Build/Cesium/`;

const STEPS = [
  [Briefcase, 'Post or find a job', 'Clients describe the work. Freelancers with an active virtual card send proposals.'],
  [UserRoundSearch, 'Agree on an offer', 'Shortlist, chat, and accept an offer with clear milestones.'],
  [ShieldCheck, 'Fund the milestone', 'The client pays into escrow, so the freelancer knows the money is there.'],
  [CheckCircle2, 'Deliver and approve', 'The freelancer submits work. The client reviews, approves, or asks for changes.'],
  [WalletCards, 'Get paid', 'Releasing escrow credits the freelancer\'s virtual card, minus the platform fee.'],
];

let cesiumPromise;
function loadCesium() {
  if (window.Cesium) return Promise.resolve(window.Cesium);
  cesiumPromise ||= new Promise((resolve, reject) => {
    window.CESIUM_BASE_URL = CESIUM_BASE;
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = `${CESIUM_BASE}Widgets/widgets.css`;
    document.head.appendChild(css);
    const script = document.createElement('script');
    script.src = `${CESIUM_BASE}Cesium.js`;
    script.onload = () => resolve(window.Cesium);
    script.onerror = () => reject(new Error('Could not load the globe viewer'));
    document.head.appendChild(script);
  });
  return cesiumPromise;
}

// Animates the exported route: a plane flies through each stop, easing along the saved points.
function RouteGlobe() {
  const container = useRef(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let viewer;
    let cancelled = false;
    loadCesium().then((Cesium) => {
      if (cancelled || !container.current) return;
      const points = tripData.pathPoints;
      viewer = new Cesium.Viewer(container.current, {
        baseLayer: false,
        terrainProvider: new Cesium.EllipsoidTerrainProvider(),
        animation: false, timeline: false, baseLayerPicker: false, geocoder: false, homeButton: false,
        sceneModePicker: false, navigationHelpButton: false, fullscreenButton: false, infoBox: false, selectionIndicator: false,
      });
      viewer.scene.globe.baseColor = Cesium.Color.fromCssColorString('#1e3a5f');
      // The globe renders on its own; street imagery is layered on top once it loads.
      viewer.imageryLayers.addImageryProvider(new Cesium.UrlTemplateImageryProvider({ url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png', tilingScheme: new Cesium.WebMercatorTilingScheme(), maximumLevel: 19, credit: '© OpenStreetMap contributors' }));
      const start = Cesium.JulianDate.now();
      const secondsPerLeg = 8;
      const position = new Cesium.SampledPositionProperty();
      position.setInterpolationOptions({ interpolationDegree: 2, interpolationAlgorithm: Cesium.HermitePolynomialApproximation });
      points.forEach((point, index) => {
        position.addSample(Cesium.JulianDate.addSeconds(start, index * secondsPerLeg, new Cesium.JulianDate()), new Cesium.Cartesian3(point.position.x, point.position.y, point.position.z));
      });
      const stop = Cesium.JulianDate.addSeconds(start, (points.length - 1) * secondsPerLeg, new Cesium.JulianDate());
      viewer.clock.startTime = start.clone();
      viewer.clock.stopTime = stop.clone();
      viewer.clock.currentTime = start.clone();
      viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP;
      viewer.clock.shouldAnimate = true;

      const settings = points.map((point) => point.settings);
      points.forEach((point, index) => viewer.entities.add({
        position: new Cesium.Cartesian3(point.position.x, point.position.y, point.position.z),
        point: { pixelSize: 9, color: Cesium.Color.fromCssColorString('#0f766e'), outlineColor: Cesium.Color.WHITE, outlineWidth: 2 },
        label: settings[index].showPointName ? { text: settings[index].name, font: '14px sans-serif', pixelOffset: new Cesium.Cartesian2(0, -18), fillColor: Cesium.Color.WHITE, outlineColor: Cesium.Color.BLACK, outlineWidth: 3, style: Cesium.LabelStyle.FILL_AND_OUTLINE } : undefined,
      }));
      const plane = viewer.entities.add({
        position,
        orientation: new Cesium.VelocityOrientationProperty(position),
        point: { pixelSize: 14, color: Cesium.Color.RED, outlineColor: Cesium.Color.WHITE, outlineWidth: 2 },
        path: { leadTime: 0, trailTime: (points.length - 1) * secondsPerLeg, width: 3, material: Cesium.Color.RED.withAlpha(0.8) },
      });
      // Frame the whole route so every stop stays visible while the plane flies it.
      viewer.camera.setView({ destination: Cesium.Cartesian3.fromDegrees(20, 20, 24_000_000), orientation: { heading: 0, pitch: Cesium.Math.toRadians(-90), roll: 0 } });
    }).catch((err) => { if (!cancelled) setError(err.message); });
    return () => { cancelled = true; if (viewer && !viewer.isDestroyed()) viewer.destroy(); };
  }, []);

  if (error) return <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>;
  return <div ref={container} className="h-[420px] w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-900" aria-label="Animated route around the globe" />;
}

export default function HowItWorks() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <header className="text-center">
        <h1 className="text-4xl font-bold text-foreground">How Giggo works</h1>
        <p className="mx-auto mt-3 max-w-2xl text-subtle">From the first proposal to the final payment, every step is protected by milestones and escrow.</p>
      </header>
      
      <ol className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {STEPS.map(([Icon, title, text], index) => (
          <li key={title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-brand-700"><Icon className="h-5 w-5" aria-hidden="true" /></span><span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Step {index + 1}</span></div>
            <h2 className="mt-3 font-semibold text-slate-900">{title}</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>
          </li>
        ))}
      </ol>
      <div className="mt-10 flex justify-center gap-3"><Link to="/register"><Button>Get started</Button></Link><Link to="/find-jobs"><Button variant="secondary">Browse jobs</Button></Link></div>
    </div>
  );
}
