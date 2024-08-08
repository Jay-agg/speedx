"use server";
import type { NextApiRequest, NextApiResponse } from "next";
import puppeteer from "puppeteer";

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
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    let totalRequestSize = 0;
    let numberOfRequests = 0;

    // Intercept and track all network requests
    page.on("request", (request) => {
      numberOfRequests++;
    });

    // Intercept and track responses to calculate total request size
    page.on("response", async (response) => {
      const headers = response.headers();
      if (headers["content-length"]) {
        totalRequestSize += parseInt(headers["content-length"]) / 1024; // in KB
      }
    });

    const startTime = Date.now();
    await page.goto(url, { waitUntil: "networkidle0" }); // Wait until no more network activity
    const endTime = Date.now();

    const pageLoadTime = endTime - startTime;

    await browser.close();

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
