import React, { useEffect, useState } from "react";
import {
    LineChart,
    Line,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

function EnvironmentalUI() {
    const [barangay, setBarangay] = useState("Abella");
    const [data, setData] = useState([]);
    const [view, setView] = useState("table"); // 'table' or 'graph'
    const [barangays, setBarangays] = useState([]);

    useEffect(() => {
        fetch(`http://localhost:5500/barangays`)
            .then((res) => res.json())
            .then((json) => setBarangays(json))
            .catch((err) => console.error("Error fetching data:", err));
    }, []);

    useEffect(() => {
        fetch(`http://localhost:5500/barangays/${barangay}`)
            .then((res) => res.json())
            .then((json) => setData(json))
            .catch((err) => console.error("Error fetching data:", err));
    }, [barangay]);

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">
                    🌍 Environmental Data
                </h2>

                {/* Dropdown + View Toggle */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">
                            Select Barangay:
                        </label>
                        <select
                            value={barangay}
                            onChange={(e) => setBarangay(e.target.value)}
                            className="border border-gray-300 px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white"
                        >
                            {/* <option value="">-- Select Barangay --</option> */}
                            {barangays.map((bgy, idx) => (
                                <option key={idx} value={bgy}>
                                    {bgy}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Toggle Buttons */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setView("table")}
                            className={`px-4 py-2 rounded-lg font-medium ${view === "table"
                                ? "bg-blue-600 text-white shadow"
                                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
                                }`}
                        >
                            Table
                        </button>
                        <button
                            onClick={() => setView("graph")}
                            className={`px-4 py-2 rounded-lg font-medium ${view === "graph"
                                ? "bg-blue-600 text-white shadow"
                                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
                                }`}
                        >
                            Graph
                        </button>
                    </div>
                </div>

                {/* Conditional Rendering */}
                {view === "table" ? (
                    // Table View
                    <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
                        <table className="table-auto border-collapse w-full text-sm text-left text-gray-700">
                            <thead className="bg-blue-600 text-white text-sm uppercase tracking-wide">
                                <tr>
                                    <th className="px-4 py-3">Timestamp</th>
                                    <th className="px-4 py-3">Rainfall (mm)</th>
                                    <th className="px-4 py-3">Water Level (m)</th>
                                    <th className="px-4 py-3">Flow Velocity (m/s)</th>
                                    <th className="px-4 py-3">Wind Speed (m/s)</th>
                                    <th className="px-4 py-3">Wind Direction</th>
                                    <th className="px-4 py-3">Temperature (°C)</th>
                                    <th className="px-4 py-3">Humidity (%)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.length > 0 ? (
                                    data.map((row) => (
                                        <tr
                                            key={row.id}
                                            className="hover:bg-gray-100 transition"
                                        >
                                            <td className="border px-4 py-2">
                                                {new Date(
                                                    row.timestamp
                                                ).toLocaleString()}
                                            </td>
                                            <td className="border px-4 py-2">
                                                {row.rainfall_mm}
                                            </td>
                                            <td className="border px-4 py-2">
                                                {row.water_level_m}
                                            </td>
                                            <td className="border px-4 py-2">
                                                {row.flow_velocity_ms}
                                            </td>
                                            <td className="border px-4 py-2">
                                                {row.wind_speed_mps}
                                            </td>
                                            <td className="border px-4 py-2">
                                                {row.wind_direction}
                                            </td>
                                            <td className="border px-4 py-2">
                                                {row.temperature_c}
                                            </td>
                                            <td className="border px-4 py-2">
                                                {row.humidity_percent}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            className="border px-4 py-6 text-center text-gray-500"
                                            colSpan="8"
                                        >
                                            No data available
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    // Graph View
                    <div className="bg-white shadow-lg rounded-xl p-4">
                        {data.length > 0 ? (
                            <ResponsiveContainer width="100%" height={400}>
                                <LineChart data={data}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="timestamp"
                                        tickFormatter={(t) =>
                                            new Date(t).toLocaleTimeString()
                                        }
                                    />
                                    <YAxis />
                                    <Tooltip
                                        labelFormatter={(label) =>
                                            new Date(label).toLocaleString()
                                        }
                                    />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="rainfall_mm"
                                        stroke="#3b82f6"
                                        name="Rainfall (mm)"
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="water_level_m"
                                        stroke="#10b981"
                                        name="Water Level (m)"
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="temperature_c"
                                        stroke="#ef4444"
                                        name="Temperature (°C)"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-center text-gray-500 py-6">
                                No data available
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default EnvironmentalUI;
