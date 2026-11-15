import type { Metadata } from "next";
import { ProgramsPage } from "../../../views/ProgramsPage";
import { getProgramConfig, getProgramTypeFromPath } from "../../../lib/programConfig";

interface Props {
  params: Promise<{ type: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { type } = await params;
  const programType = getProgramTypeFromPath(type);
  if (!programType) {
    return {
      title: "Wellness Program | Stress Unwind",
      description: "Explore corporate and peer wellness programs on Stress Unwind.",
    };
  }

  const cfg = getProgramConfig(programType);
  const title = `${cfg.label} Program | Stress Unwind`;
  const description = `${cfg.tagline}. ${cfg.description} Join guided wellness sessions on Stress Unwind.`;
  const canonicalUrl = `https://stress-unwind.com/programs/${type}`;

  return {
    title,
    description,
    keywords: [
      "Stress Unwind",
      cfg.label,
      "corporate wellness program",
      "workplace stress relief",
      "team wellbeing sessions",
      "employee mental health",
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default function Page() {
  return <ProgramsPage />;
}
