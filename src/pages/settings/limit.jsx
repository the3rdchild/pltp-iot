import React, { useEffect, useState } from "react";
import { Card, CardContent } from "../../components/ui/card.jsx";
import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from "recharts";

const Gauge = ({ value, min, max }) => {
  const percent = Math.min(
    100,
    Math.max(0, ((value - min) / (max - min)) * 100)
  );

  const data = [
    {
      name: "Limit",
      value: percent,
      fill:
        percent >= 90 ? "#ff4d4f" : // merah - hampir limit
        percent >= 70 ? "#ffa940" : // orange
        "#00C49F"                  // hijau normal
    },
  ];

  return (
    <RadialBarChart
      width={260}
      height={160}
      cx={130}
      cy={140}
      innerRadius={80}
      outerRadius={120}
      barSize={18}
      data={data}
      startAngle={180}
      endAngle={0}
    >
      <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
      <RadialBar clockWise dataKey="value" />
    </RadialBarChart>
  );
};

const Limit = () => {
  const [data, setData] = useState([
    { id: 1, name: "Pressure", value: 42, min: 0, max: 100 },
    { id: 2, name: "Temperature", value: 72, min: 0, max: 100 },
    { id: 3, name: "Flowrate", value: 95, min: 0, max: 100 },
  ]);

  const getAnomaly = (value) => {
    if (value >= 90) return "⚠️ High Risk";
    if (value >= 70) return "⚠ Warning";
    return "✔ Normal";
  };

  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {data.map((item) => (
        <Card key={item.id} className="shadow-md border">
          <CardContent className="p-4">
            <h2 className="text-lg font-bold mb-2">{item.name}</h2>

            <Gauge value={item.value} min={item.min} max={item.max} />

            <p className="text-center mt-4 text-sm">
              Value: <strong>{item.value}</strong>
              <br />
              Status: <strong>{getAnomaly(item.value)}</strong>
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default Limit;
