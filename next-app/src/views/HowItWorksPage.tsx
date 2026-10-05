import Link from "next/link";
import {
  InfoPage,
  InfoSection,
  InfoList,
} from "@/components/InfoPage";

export function HowItWorksPage() {
  return (
    <InfoPage
      eyebrow="HOW IT WORKS"
      title={
        <>
          Talk it out, <em>without</em> putting your name to it.
        </>
      }
      lede={
        <>
          This is a place for students and working professionals to say the
          thing out loud, find someone to talk to when the day is heavy, and
          arrange to meet in real life when you both feel ready. You can take
          part under an alias. You never have to share your real name, your
          workplace or your college to take part.
        </>
      }
      updated="5 October 2026"
    >
      <InfoSection heading="What you can do here">
        <InfoList
          items={[
            "Start a conversation without revealing your name. In any group or in the open lounge, you can post under a quiet alias instead of your profile name.",
            "Find someone to talk to one-to-one. Send a connection request, and if they accept, you get a private conversation. Nothing is published and nobody else can see it.",
            "Browse or start a group. Six categories cover sports, wellbeing, arts, learning, social and outdoors. Anyone can start a new subgroup.",
            "Plan something in person. Create a meetup with a time, a place and a limit on how many people join, and let others sign up.",
            "Take a quiet moment. A private daily check-in and a short breathing space, neither of which anyone else can see.",
            "Ask a professional for support. Approved psychologists take appointment requests through the same flow as meetups.",
          ]}
        />
      </InfoSection>

      <InfoSection heading="How the alias works, honestly">
        <p>
          An alias is a display name, not a disguise. When you post under an
          alias, other members see a stable, generated label like{" "}
          <em>Quiet 4f9a21</em> — not your profile name, and not a different
          person each time. That means the same alias follows you, which keeps
          a conversation coherent without attaching it to you.
        </p>
        <p>
          The alias is deliberately not a mask you can hide behind. If you post
          something that gets reported, a moderator can see which account wrote
          it. That is the trade: you are not traceable by strangers browsing the
          feed, but you are not unaccountable to the people responsible for the
          space.
        </p>
      </InfoSection>

      <InfoSection heading="What we can and cannot see" tone="honest">
        <InfoList
          items={[
            "Other members cannot see your email address. It is never shown on your profile.",
            "Private conversations are visible only to the two people in them and to administrators acting for safety.",
            "Your daily check-in is private. Application administrators cannot see it, by policy and by database rule.",
            "This is not end-to-end encrypted. The people who operate the platform can read the database. We do not read your conversations casually, but we could if a safety issue required it.",
            "Nothing here is anonymous to the platform operator. It is low-visibility, not untraceable.",
          ]}
        />
      </InfoSection>

      <InfoSection heading="Getting started">
        <p>
          You need an account, and confirming your email is required. That is
          the one part we cannot do anonymously: it is what stops an unlimited
          number of throwaway accounts taking part. After that, everything else
          is your choice.
        </p>
        <p className="info-actions">
          <Link className="wellness-button" href="/signin">
            Sign in or create an account
          </Link>
          <Link className="text-action" href="/groups">
            Browse groups first →
          </Link>
        </p>
      </InfoSection>

      <InfoSection heading="Read next">
        <InfoList
          items={[
            "Community guidelines and how to report something that worries you.",
            "What we collect, who can see it, and how long we keep it.",
            "Tips for meeting someone from here safely, in person.",
          ]}
        />
        <p className="info-actions">
          <Link className="text-action" href="/safety">
            Safety and community guidelines →
          </Link>
          <Link className="text-action" href="/privacy">
            Privacy →
          </Link>
          <Link className="text-action" href="/take-a-moment">
            Take a moment →
          </Link>
        </p>
      </InfoSection>
    </InfoPage>
  );
}