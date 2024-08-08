"use server";
import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

type Data = {
  pageLoadTime: number;
  totalRequestSize: number;
  numberOfRequests: number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== "POST") {
    return res.status(405).end(); // Method Not Allowed
  }

  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL is required" } as any);
  }

  try {
    const startTime = Date.now();
    const response = await axios.get(url);
    const endTime = Date.now();

    const pageLoadTime = endTime - startTime;
    const totalRequestSize =
      parseInt(response.headers["content-length"] || "0") / 1024; // in KB
    const numberOfRequests = 1; // This is simplified; in reality, you'd need to analyze all resources

    res.status(200).json({
      pageLoadTime: Math.round(pageLoadTime),
      totalRequestSize: Math.round(totalRequestSize),
      numberOfRequests,
    });
  } catch (error) {
    console.error("Error analyzing website:", error);
    res.status(500).json({ error: "Failed to analyze website" } as any);
  }
}
