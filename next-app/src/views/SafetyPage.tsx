import Link from "next/link";
import { InfoPage, InfoSection, InfoList } from "@/components/InfoPage";

export function SafetyPage() {
  return (
    <InfoPage
      eyebrow="SAFETY AND COMMUNITY GUIDELINES"
      title={<>A place people feel safe in, <em>or not worth using.</em></>}
      lede={
        <>
          These are the rules we hold everyone to, how to get help, and what we
          do when something goes wrong. If any of this is unclear, or you think
          we are not enforcing it properly, please tell us.
        </>
      }
      updated="5 October 2026"
    >
      <InfoSection heading="The short version">
        <InfoList
          items={[
            "Be decent. A person on the other side is having a day.",
            "Do not pressure anyone into meeting in person, or into anything else.",
            "Do not post other people's private information. No screenshots of private conversations, no doxxing, no naming someone's employer or college to pressure them.",
            "Nobody has to prove who they are here. Do not ask others to.",
            "No harassment, threats, hate speech, sexual content, or anything illegal.",
            "One account per person.",
          ]}
        />
      </InfoSection>

      <InfoSection heading="If something goes wrong">
        <p>
          Every post, reply and conversation can be reported. Use the flag icon
          on the content. A report goes to the moderation queue; hiding a post
          resolves the report, and so does dismissing it after a look.
        </p>
        <InfoList
          items={[
            "Reported content can be hidden quickly, without waiting for a full judgement.",
            "Repeat or serious breaches lead to an account being blocked.",
            "Threats, harassment, or sharing someone's private information are removed and the account is blocked.",
            "We will tell you what we did about a report you made, unless doing so would identify the person you reported.",
          ]}
        />
      </InfoSection>

      <InfoSection heading="Meeting someone in person" tone="callout">
        <p>
          This part matters most. An alias means someone can choose to meet you
          without their name or employer attached, and that cuts both ways.
        </p>
        <InfoList
          items={[
            "Always meet in a public, staffed place. Not a home, not a car park alone, not someone's address.",
            "Tell a friend where you are going and when you expect to be back.",
            "Arrange your own transport home, including if you change your mind.",
            "Keep your own contact details private until you actually meet. Do not share a phone number or a social handle in a group post.",
            "Trust your gut. Leaving early needs no explanation, and you never owe anyone a reason.",
            "Alcohol before or during a first meeting is a bad idea for the person who drank.",
            "You can block someone at any time. You do not need a reason and you do not need to announce it.",
          ]}
        />
      </InfoSection>

      <InfoSection heading="What we cannot promise">
        <InfoList
          items={[
            "We cannot guarantee anyone is who they say they are. An alias is not verification.",
            "We cannot verify that an approved professional is who they claim to be beyond what they told us. If a psychologist is listed, check their registration independently before sharing anything sensitive.",
            "We do not monitor conversations in real time.",
            "We cannot remove content from outside this service, or from screenshots you or someone else has already taken.",
          ]}
        />
      </InfoSection>

      <InfoSection heading="Professional support">
        <p>
          This is a community, not a treatment service. Nothing here is
          medical advice, and nobody here is a substitute for a clinician. If
          you are struggling in a way that needs real help, please talk to
          someone qualified, or to a local crisis line. In an emergency,
          contact your local emergency services.
        </p>
      </InfoSection>

      <InfoSection heading="Reporting a safety problem with the platform">
        <p>
          To report content, use the flag on the post. To report something
          urgent that needs a person rather than a queue, use the{" "}
          <Link href="/contact">contact form</Link> and say it is urgent.
        </p>
      </InfoSection>
    </InfoPage>
  );
}