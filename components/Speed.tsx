"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface Metrics {
  pageLoadTime: number;
  totalRequestSize: number;
  numberOfRequests: number;
}

const SpeedX: React.FC = () => {
  const [url, setUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeWebsite = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      if (!response.ok) {
        throw new Error("Failed to analyze website");
      }
      const data: Metrics = await response.json();
      setMetrics(data);
    } catch (error) {
      console.error("Error analyzing website:", error);
      setError("Failed to analyze website. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const chartData = metrics
    ? [
        { name: "Page Load Time (ms)", value: metrics.pageLoadTime },
        { name: "Total Request Size (KB)", value: metrics.totalRequestSize },
        { name: "Number of Requests", value: metrics.numberOfRequests },
      ]
    : [];

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">
        SpeedX - Website Performance Analyzer
      </h1>
      <div className="flex gap-2 mb-4">
        <Input
          type="text"
          value={url}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setUrl(e.target.value)
          }
          placeholder="Enter website URL"
          className="flex-grow"
        />
        <Button onClick={analyzeWebsite} disabled={loading}>
          {loading ? "Analyzing..." : "Analyze"}
        </Button>
      </div>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Page Load Time: {metrics.pageLoadTime} ms</p>
              <p>Total Request Size: {metrics.totalRequestSize} KB</p>
              <p>Number of Requests: {metrics.numberOfRequests}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Performance Chart</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SpeedX;
