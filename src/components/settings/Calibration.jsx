import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

/**
 * Calibration.jsx
 *
 * Simple but practical calibration UI for Steam Monitoring (NCG, Dryness, TDS, Purity, etc).
 *
 * Requirements:
 *  - axios installed
 *  - recharts installed
 *
 * Usage:
 *  import Calibration from "@/components/settings/Calibration";
 *  <Calibration />
 *
 * Notes:
 *  - The component uses a small KMeans implementation for suggestions.
 *  - Replace mockFetchData() with axios calls to your backend endpoints.
 */

/* ------------------ Utility helpers ------------------ */

// small CSV exporter
function exportCsv(filename, rows) {
  if (!rows || !rows.length) return;
  const header = Object.keys(rows[0]).join(",");
  const data = rows.map((r) => Object.values(r).join(",")).join("\n");
  const csv = header + "\n" + data;
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Simple KMeans implementation for 2D points
function kmeans2D(points, k = 3, maxIter = 50) {
  if (!points.length) return { centroids: [], assignments: [] };
  // init centroids: pick k random distinct points
  const centroids = [];
  const used = new Set();
  while (centroids.length < Math.min(k, points.length)) {
    const idx = Math.floor(Math.random() * points.length);
    if (!used.has(idx)) {
      used.add(idx);
      centroids.push({ x: points[idx].x, y: points[idx].y });
    }
  }

  let assignments = new Array(points.length).fill(-1);

  for (let iter = 0; iter < maxIter; iter++) {
    let changed = false;
    // assign
    for (let i = 0; i < points.length; i++) {
      let best = -1;
      let bestD = Infinity;
      for (let j = 0; j < centroids.length; j++) {
        const dx = points[i].x - centroids[j].x;
        const dy = points[i].y - centroids[j].y;
        const d = dx * dx + dy * dy;
        if (d < bestD) {
          bestD = d;
          best = j;
        }
      }
      if (assignments[i] !== best) {
        changed = true;
        assignments[i] = best;
      }
    }
    // update
    const sums = centroids.map(() => ({ x: 0, y: 0, n: 0 }));
    for (let i = 0; i < points.length; i++) {
      const a = assignments[i];
      sums[a].x += points[i].x;
      sums[a].y += points[i].y;
      sums[a].n += 1;
    }
    for (let j = 0; j < centroids.length; j++) {
      if (sums[j].n > 0) {
        centroids[j].x = sums[j].x / sums[j].n;
        centroids[j].y = sums[j].y / sums[j].n;
      }
    }
    if (!changed) break;
  }

  return { centroids, assignments };
}

/* ------------------ Mock data fetch (replace in prod) ------------------ */
// returns array of objects: { timestamp, temperature, pressure, ncg, dryness, tds }
async function mockFetchData(sensor, variable, limit = 500) {
  // generate synthetic steam data for demo
  const out = [];
  for (let i = 0; i < limit; i++) {
    const ts = Date.now() - (limit - i) * 60000;
    const temperature = 280 + Math.sin(i / 20) * 10 + Math.random() * 2;
    const pressure = 8 + Math.cos(i / 15) * 0.2 + Math.random() * 0.05;
    const ncg = 0.5 + (pressure - 8) * 0.3 + Math.random() * 0.2;
    const dryness = Math.min(1, Math.max(0, (temperature - 270) / 40 + Math.random() * 0.05));
    const tds = 100 + Math.random() * 20;
    out.push({
      id: i,
      timestamp: new Date(ts).toISOString(),
      temperature: Number(temperature.toFixed(3)),
      pressure: Number(pressure.toFixed(4)),
      ncg: Number(ncg.toFixed(4)),
      dryness: Number(dryness.toFixed(4)),
      tds: Number(tds.toFixed(2)),
    });
  }
  // simulate network latency
  await new Promise((r) => setTimeout(r, 300));
  return out;
}

/* ------------------ Main component ------------------ */

export default function Calibration() {
  const [sensors, setSensors] = useState([
    { id: "unit5", name: "Unit 5 Kamojang" },
    { id: "unit4", name: "Unit 4 Kamojang" },
  ]);
  const [selectedSensor, setSelectedSensor] = useState("unit5");
  const [variable, setVariable] = useState("ncg"); // or 'dryness', 'tds', etc
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [kval, setKval] = useState(3);
  const [suggestedPoints, setSuggestedPoints] = useState([]); // {x,y,label}
  const [selectedPoints, setSelectedPoints] = useState([]); // manual picks
  const chartRef = useRef(null);

  useEffect(() => {
    // initial fetch
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSensor, variable]);

  async function fetchData() {
    setLoading(true);
    try {
      // replace mockFetchData with axios.get('/api/calibration/fetch-data', {params: {sensor:selectedSensor, variable}}) in production
      const data = await mockFetchData(selectedSensor, variable, 1000);
      setRawData(data);
      setSuggestedPoints([]);
      setSelectedPoints([]);
    } catch (err) {
      console.error("fetch error", err);
      alert("Error fetching data (see console).");
    } finally {
      setLoading(false);
    }
  }

  function prepareScatterData(xField, yField) {
    return rawData.map((r) => ({
      x: Number(r[xField]),
      y: Number(r[yField]),
      id: r.id,
      ts: r.timestamp,
      ...r,
    }));
  }

  function onChartClick(e) {
    // recharts passes payload in e.activePayload; but easier: get mouse coords and find nearest point
    if (!e || !e.activeLabel) return;
    // ignore (click handling via point selection below)
  }

  function toggleSelectPoint(point) {
    // add/remove point from selectedPoints by id
    const exists = selectedPoints.find((p) => p.id === point.id);
    if (exists) {
      setSelectedPoints(selectedPoints.filter((p) => p.id !== point.id));
    } else {
      setSelectedPoints([...selectedPoints, point]);
    }
  }

  function runKmeansOn(selectedX = "temperature", selectedY = variable === "ncg" ? "ncg" : "dryness") {
    // default axes: x=temperature y=variable
    const pts = prepareScatterData(selectedX, selectedY).map((p) => ({ x: p.x, y: p.y, ref: p }));
    const k = Math.max(1, Math.min(10, parseInt(kval) || 3));
    const { centroids, assignments } = kmeans2D(pts, k, 100);
    const centroidsWithMeta = centroids.map((c, idx) => ({ x: Number(c.x.toFixed(6)), y: Number(c.y.toFixed(6)), cluster: idx }));
    setSuggestedPoints(centroidsWithMeta);
  }

  async function runCalibrationBackend() {
    // In production you'd send selectedPoints OR suggestedPoints and rawData metadata to backend to compute model-optimal points.
    // Here we simulate a POST and return centroids as "optimal points".
    try {
      const payload = {
        sensor: selectedSensor,
        variable,
        selectedPoints,
        suggestedPoints,
        rawDataSummary: { count: rawData.length },
      };
      // replace this with axios.post("/api/calibration/run", payload)
      await new Promise((r) => setTimeout(r, 500));
      alert("Calibration run simulated. Use suggestedPoints as centroid recommendations.");
      // optionally save result to server
    } catch (err) {
      console.error(err);
      alert("Calibration run failed (see console).");
    }
  }

  function clearSelections() {
    setSelectedPoints([]);
    setSuggestedPoints([]);
  }

  function downloadSelectedCsv() {
    if (selectedPoints.length) {
      exportCsv("calibration_selected_points.csv", selectedPoints.map((p) => ({ id: p.id, ts: p.ts, x: p.x, y: p.y })));
    } else if (suggestedPoints.length) {
      exportCsv("calibration_suggested_points.csv", suggestedPoints.map((p) => ({ x: p.x, y: p.y, cluster: p.cluster })));
    } else {
      alert("No points selected or suggested to export.");
    }
  }

  // Chart axes fields (allow user to choose)
  const xField = "temperature";
  const yField = variable === "ncg" ? "ncg" : variable === "dryness" ? "dryness" : "tds";

  const scatterData = prepareScatterData(xField, yField);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Calibration — Steam Monitoring (PGE Kamojang)</h2>
        <div className="text-sm text-gray-600">Calibration helps pick sampling points to get optimal AI performance</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="col-span-1">
          <label className="block text-sm font-medium mb-1">Sensor / Unit</label>
          <select
            className="w-full border rounded p-2"
            value={selectedSensor}
            onChange={(e) => setSelectedSensor(e.target.value)}
          >
            {sensors.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Variable</label>
          <select className="w-full border rounded p-2" value={variable} onChange={(e) => setVariable(e.target.value)}>
            <option value="ncg">NCG</option>
            <option value="dryness">Dryness</option>
            <option value="tds">TDS</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">K (clusters for suggestion)</label>
          <input
            type="number"
            min="1"
            max="10"
            value={kval}
            onChange={(e) => setKval(e.target.value)}
            className="w-full border rounded p-2"
          />
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={fetchData}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "Fetching..." : "Fetch Data"}
        </button>

        <button
          onClick={() => runKmeansOn(xField, yField)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Suggest Points (KMeans)
        </button>

        <button onClick={runCalibrationBackend} className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
          Run Calibration
        </button>

        <button onClick={downloadSelectedCsv} className="border px-4 py-2 rounded">
          Export Selected
        </button>

        <button onClick={clearSelections} className="border px-4 py-2 rounded">
          Clear
        </button>
      </div>

      <div style={{ height: 420 }} className="mb-6 border rounded p-2 bg-white">
        <ResponsiveContainer>
          <ScatterChart
            data={scatterData}
            ref={chartRef}
            onMouseDown={(e) => {
              if (!e) return;
              // If clicked on point, add/remove that point from selectedPoints
              const payload = e && e.activePayload && e.activePayload[0] && e.activePayload[0].payload;
              if (payload) {
                toggleSelectPoint(payload);
              }
            }}
          >
            <CartesianGrid />
            <XAxis type="number" dataKey="x" name={xField} unit={xField === "temperature" ? "K" : ""} />
            <YAxis type="number" dataKey="y" name={yField} unit={yField === "ncg" ? "" : ""} />
            <Tooltip
              cursor={{ strokeDasharray: "3 3" }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="bg-white p-2 border rounded shadow">
                      <div><strong>ts:</strong> {d.ts}</div>
                      <div><strong>x:</strong> {d.x}</div>
                      <div><strong>y:</strong> {d.y}</div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />
            {/* raw data */}
            <Scatter name="raw" data={scatterData} fill="#8884d8" />
            {/* selected manual */}
            {selectedPoints.length > 0 && (
              <Scatter name="selected" data={selectedPoints.map((p) => ({ x: p.x, y: p.y }))} fill="#ff7300" />
            )}
            {/* suggested centroids */}
            {suggestedPoints.length > 0 && (
              <Scatter
                name="suggested"
                data={suggestedPoints.map((c) => ({ x: c.x, y: c.y }))}
                fill="#00C49F"
              />
            )}
          </ScatterChart>
        </ResponsiveContainer>
        <div className="text-xs text-gray-500 mt-2">Tip: klik titik pada chart untuk memilih/deselect titik manual.</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border rounded p-4 overflow-auto">
          <h3 className="font-medium mb-2">Raw Sample Data (first 200 rows)</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="pr-2">id</th>
                <th className="pr-2">timestamp</th>
                <th className="pr-2">temp</th>
                <th className="pr-2">pressure</th>
                <th className="pr-2">ncg</th>
                <th className="pr-2">dryness</th>
                <th className="pr-2">tds</th>
              </tr>
            </thead>
            <tbody>
              {rawData.slice(0, 200).map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td>{r.id}</td>
                  <td>{new Date(r.timestamp).toLocaleString()}</td>
                  <td>{r.temperature}</td>
                  <td>{r.pressure}</td>
                  <td>{r.ncg}</td>
                  <td>{r.dryness}</td>
                  <td>{r.tds}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white border rounded p-4 overflow-auto">
          <h3 className="font-medium mb-2">Calibration Picks</h3>

          <div className="mb-3">
            <strong>Manual selected points:</strong> {selectedPoints.length}
            <button
              className="ml-2 text-xs border rounded px-2"
              onClick={() => selectedPoints.length && exportCsv("manual_selected.csv", selectedPoints)}
            >
              Export manual
            </button>
          </div>

          <ul className="mb-4">
            {selectedPoints.map((p) => (
              <li key={p.id} className="flex justify-between py-1 border-b">
                <div>ID {p.id} — x: {p.x} — y: {p.y}</div>
                <div>
                  <button className="text-xs border rounded px-2" onClick={() => toggleSelectPoint(p)}>Remove</button>
                </div>
              </li>
            ))}
            {!selectedPoints.length && <li className="text-sm text-gray-500">No manual points selected.</li>}
          </ul>

          <h4 className="font-medium">Suggested points (KMeans)</h4>
          <div className="mb-3 text-sm text-gray-600">K = {kval} — {suggestedPoints.length} centroids</div>

          <ol className="list-decimal pl-5">
            {suggestedPoints.map((c, idx) => (
              <li key={idx} className="mb-2">
                <div>centroid #{idx}: x = {c.x}, y = {c.y}</div>
                <div className="mt-1">
                  <button
                    className="text-xs mr-2 border px-2 rounded"
                    onClick={() => {
                      // copy centroid to manual selectedPoints (as pseudo-point)
                      const fakePoint = { id: `sug-${idx}-${Date.now()}`, x: c.x, y: c.y, ts: new Date().toISOString() };
                      setSelectedPoints((s) => [...s, fakePoint]);
                    }}
                  >
                    Add to selected
                  </button>
                </div>
              </li>
            ))}
            {!suggestedPoints.length && <li className="text-sm text-gray-500">No suggestions yet — run KMeans.</li>}
          </ol>
        </div>
      </div>

      <div className="mt-6 text-xs text-gray-500">
        <p><strong>Next steps / integration notes:</strong></p>
        <ul className="list-disc pl-5">
          <li>Replace <code>mockFetchData()</code> with an API: <code>GET /api/calibration/fetch-data?sensor=&lt;id&gt;&variable=&lt;var&gt;</code>.</li>
          <li>For production, run calibration algorithm on backend: <code>POST /api/calibration/run</code> with payload: sensor, variable, selectedPoints or entire dataset. Backend should return recommended calibration points and performance metrics.</li>
          <li>Store calibration config: <code>POST /api/calibration/save</code> with user, sensor, variable, centroids.</li>
        </ul>
      </div>
    </div>
  );
}
