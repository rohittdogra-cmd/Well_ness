import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { HomePage } from "../views/HomePage";

export const metadata: Metadata = pageMetadata("/", {
  title:
    "stress-unwind · 2-Player Badminton Turf Booking & 100% Employer-Blind Corporate Wellness Delhi-NCR",
  description:
    "Delhi-NCR's premier 100% employer-blind sports turf booking and corporate wellness platform. Book tournament-grade indoor badminton courts across Janakpuri, Cyber Hub, Gurgaon Sector 54, Noida, and Palwal. Connect with colleagues using cute auto-assigned avatars and consult licensed clinical psychologists with zero HR tracking.",
  keywords: [
    "badminton turf booking delhi ncr",
    "book badminton court online gurgaon",
    "indoor badminton court janakpuri sp arena",
    "fitso smash arena cyber hub gurgaon",
    "sector 54 rapid sports dome gurgaon",
    "noida sector 62 badminton turf",
    "palwal national sports arena",
    "2 player badminton matchmaking delhi",
    "corporate wellness platform india",
    "100% employer-blind mental health",
    "licensed clinical psychologists delhi ncr",
  ],
});

export default function Page() {
  return <HomePage />;
}
