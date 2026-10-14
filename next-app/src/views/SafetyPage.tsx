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

      <InfoSection heading="Emergency & Crisis Support" tone="callout">
        <p>
          stress-unwind is a peer wellness community, not an emergency clinical service. If you or someone you know is in severe emotional distress, having thoughts of self-harm, or experiencing a psychiatric emergency, please reach out to these 24/7 free, confidential national helplines immediately:
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "12px", margin: "16px 0" }}>
          <div style={{ background: "rgba(13, 148, 136, 0.08)", border: "1.5px solid #0d9488", borderRadius: "12px", padding: "16px" }}>
            <strong style={{ display: "block", color: "#0f766e", fontSize: "16px", marginBottom: "4px" }}>
              📞 Tele-MANAS
            </strong>
            <span style={{ fontSize: "13px", color: "#475569", display: "block", marginBottom: "8px" }}>
              Ministry of Health &amp; Family Welfare · 24/7 Toll-Free
            </span>
            <a
              href="tel:14416"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "#0d9488",
                color: "#ffffff",
                padding: "8px 16px",
                borderRadius: "8px",
                fontWeight: 700,
                textDecoration: "none",
                fontSize: "14px",
              }}
            >
              Call 14416 (or 1800-891-4416)
            </a>
          </div>

          <div style={{ background: "rgba(124, 58, 237, 0.08)", border: "1.5px solid #7c3aed", borderRadius: "12px", padding: "16px" }}>
            <strong style={{ display: "block", color: "#6d28d9", fontSize: "16px", marginBottom: "4px" }}>
              📞 KIRAN Helpline
            </strong>
            <span style={{ fontSize: "13px", color: "#475569", display: "block", marginBottom: "8px" }}>
              Govt. Mental Health Helpline · 13 Languages · 24/7
            </span>
            <a
              href="tel:18005990019"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "#7c3aed",
                color: "#ffffff",
                padding: "8px 16px",
                borderRadius: "8px",
                fontWeight: 700,
                textDecoration: "none",
                fontSize: "14px",
              }}
            >
              Call 1800-599-0019
            </a>
          </div>

          <div style={{ background: "#fee2e2", border: "1.5px solid #f87171", borderRadius: "12px", padding: "16px" }}>
            <strong style={{ display: "block", color: "#991b1b", fontSize: "16px", marginBottom: "4px" }}>
              🚨 National Emergency
            </strong>
            <span style={{ fontSize: "13px", color: "#7f1d1d", display: "block", marginBottom: "8px" }}>
              Police, Ambulance &amp; Disaster Response · All India
            </span>
            <a
              href="tel:112"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "#dc2626",
                color: "#ffffff",
                padding: "8px 16px",
                borderRadius: "8px",
                fontWeight: 700,
                textDecoration: "none",
                fontSize: "14px",
              }}
            >
              Call 112
            </a>
          </div>
        </div>
        <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
          These services are completely free, confidential, and available round the clock across India. Your employer has zero access or visibility into calls made to these helplines.
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