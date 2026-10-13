import Link from "next/link";
import { InfoPage, InfoSection, InfoList } from "@/components/InfoPage";

export function PrivacyPage() {
  return (
    <InfoPage
      eyebrow="PRIVACY & DATA GOVERNANCE CHARTER"
      title={
        <>
          100% Employer-Blind. <em>Zero Workplace Tracking.</em>
        </>
      }
      lede={
        <>
          stress-unwind was engineered from the ground up to guarantee absolute
          confidentiality for corporate professionals. We never share identity,
          attendance, mental health check-ins, or activity bookings with your
          employer, HR department, or external advertisers.
        </>
      }
      updated="October 2026 (Compliant with India DPDP Act 2023)"
    >
      <InfoSection heading="1. The 100% Employer-Blind Guarantee" tone="callout">
        <p>
          Corporate burnout recovery and mental wellbeing require psychological
          safety. Traditional enterprise wellness programs often report aggregated or
          anonymized engagement metrics back to HR managers, creating anxiety around
          job security, appraisal bias, or career impact.
        </p>
        <p>
          <strong>Our Absolute Guarantee:</strong> stress-unwind maintains zero
          corporate management reporting. We do not integrate with enterprise Single
          Sign-On (SSO) reporting feeds, nor do we provide organizational dashboard
          audits. Your presence here, the sports turfs you book, the peer circles you
          frequent, and the therapists you consult remain completely blind to your
          employer.
        </p>
      </InfoSection>

      <InfoSection heading="2. Identity Protection & Auto-Assigned Cute Handles">
        <p>
          To permanently eliminate harassment, trolling, competitive comparison, and
          unsolicited corporate outreach, stress-unwind assigns members curated,
          playful handles (such as <em>Junior Ronaldo</em>, <em>Crazy Kohli</em>,{" "}
          <em>Shuttle Queen</em>, and <em>Iron Gymmer</em>) paired with cute 3D
          avatars based on selected gender and sporting passions.
        </p>
        <InfoList
          items={[
            "Real full names, corporate email addresses, and professional job titles are NEVER displayed publicly or to peers.",
            "Display name entry is intentionally algorithm-controlled to prevent members from inadvertently revealing their personal names or corporate designations.",
            "In peer groups and badminton match lobbies, you are only recognized by your cute sports avatar and proximity zone.",
          ]}
        />
      </InfoSection>

      <InfoSection heading="3. Geolocation, Proximity Engine & Locality Lock" tone="honest">
        <p>
          To calculate fair midpoint venues for 2-player sports matchmaking (e.g.,
          matching players between Janakpuri and Gurgaon at neutral Aerocity courts),
          the platform records your approximate metropolitan locality.
        </p>
        <InfoList
          items={[
            "We collect broad regional localities (e.g., Janakpuri, DLF Cyber City, Sector 54 Gurgaon, Noida Sector 62, Palwal), NOT continuous background GPS tracks.",
            "Locality Locking: Once selected during registration, your primary locality is permanently locked to prevent deceptive matchmaking or spoofed venue bookings.",
            "Commute coordinates are used solely to recommend the nearest tournament-grade badminton courts with balanced travel times for both players.",
          ]}
        />
      </InfoSection>

      <InfoSection heading="4. Badminton Turf Bookings & Operations Desk Protocols">
        <p>
          When you request or confirm an indoor badminton court booking, our central
          sports operations desk acts as an intermediary with partner arenas (such as
          SP Arena Janakpuri, Fitso Cyber Hub, and Sector 54 Rapid Sports Dome).
        </p>
        <InfoList
          items={[
            "Venue managers only receive an encrypted Match Confirmation ID, court hour, and match passcode.",
            "Turf operators are NEVER provided with your email, employer name, or personal identity profile.",
            "Phone numbers provided for verification are used strictly by our automated desk to transmit court gate passes and match reminders via secure SMS/WhatsApp.",
          ]}
        />
      </InfoSection>

      <InfoSection heading="5. Clinical Psychology & Doctor Cabin Confidentiality" tone="callout">
        <p>
          All mental health consultations and therapy sessions booked through the
          platform are conducted under strict medical doctor-patient privilege in
          compliance with Rehabilitation Council of India (RCI) guidelines and the
          Mental Healthcare Act 2017.
        </p>
        <InfoList
          items={[
            "Therapy sessions take place inside private encrypted virtual cabins.",
            "Platform administrators, developers, and corporate employers CANNOT view session notes, video streams, or clinical records.",
            "Psychologists retain clinical autonomy and are bound by statutory medical ethics not to disclose consultation records to third parties.",
            "If an individual expresses acute self-harm risk, clinicians adhere to national emergency protocols (connecting with Tele-MANAS 14416 or KIRAN 1800-599-0019).",
          ]}
        />
      </InfoSection>

      <InfoSection heading="6. What Data We Collect & Store">
        <InfoList
          items={[
            "Account Credentials: Encrypted login token and verified email for security and authentication.",
            "Profile Preferences: Cute handle choice, avatar selection, sport interests, and preferred time slots.",
            "Activity & Booking Logs: Match records, court booking confirmations, and community discussion posts.",
            "Daily Mood Check-ins: Personal emotional check-in logs. These are strictly client-accessible for your personal wellness tracking and cannot be audited by staff.",
            "Operations Security Logs: IP addresses and access timestamps retained temporarily for security, DDoS prevention, and rate limiting.",
          ]}
        />
      </InfoSection>

      <InfoSection heading="7. Third-Party Processors & Infrastructure">
        <p>
          We deliberately avoid commercial ad trackers, marketing surveillance pixels,
          and social network telemetry.
        </p>
        <InfoList
          items={[
            "Database & Auth: Hosted on Supabase with enterprise AES-256 encryption at rest and TLS 1.3 in transit.",
            "Cloud Hosting: Deployed via Vercel edge infrastructure for low-latency delivery across India.",
            "No Ad Networks: We do not sell data, display programmatic advertisements, or embed Meta/Google advertising pixels.",
          ]}
        />
      </InfoSection>

      <InfoSection heading="8. Compliance with India DPDP Act 2023 & GDPR" tone="honest">
        <p>
          Under the Digital Personal Data Protection Act (DPDP Act 2023) and global
          standards, you hold statutory rights over your personal data:
        </p>
        <InfoList
          items={[
            "Right to Access: You can request a complete disclosure of all information held against your account.",
            "Right to Correction: You can rectify or update your communication email or sports interests at any time.",
            "Right to Erasure ('Right to be Forgotten'): You can request immediate and permanent deletion of your account, booking logs, and forum contributions.",
            "Right to Grievance Redressal: You can escalate any privacy concern directly to our designated Data Protection Officer.",
          ]}
        />
      </InfoSection>

      <InfoSection heading="9. Data Retention & Account Deletion">
        <p>
          We do not retain information longer than necessary to provide our wellness
          services.
        </p>
        <InfoList
          items={[
            "Active Accounts: Maintained while your membership is active to preserve your booked sports passes and community connections.",
            "Account Deletion: To delete your account permanently, email privacy@stress-unwind.com or submit a request via our Contact Desk. All user rows, check-ins, and match passes are permanently purged within 7 business days.",
            "Security Logs: Network access logs are automatically rotated and deleted after 30 days.",
          ]}
        />
      </InfoSection>

      <InfoSection heading="10. Grievance Officer & Contact Details">
        <p>
          In accordance with the Information Technology Act 2000 and the DPDP Act 2023,
          the designated Grievance Officer and Data Protection Officer is:
        </p>
        <div
          style={{
            padding: "16px 20px",
            background: "var(--surface-raised)",
            border: "1px solid var(--line)",
            borderRadius: "8px",
            fontSize: "14px",
            lineHeight: "1.7",
            marginTop: "12px",
          }}
        >
          <strong>Grievance &amp; Data Protection Officer:</strong> N. Dogra
          <br />
          <strong>Entity:</strong> stress-unwind Technologies Pvt. Ltd.
          <br />
          <strong>Official Address:</strong> Level 4, DLF Cyber City, Phase 2,
          Gurgaon, Haryana 122002, India
          <br />
          <strong>Direct Escalation Email:</strong>{" "}
          <a
            href="mailto:privacy@stress-unwind.com"
            style={{ color: "var(--forest-sage)", textDecoration: "underline" }}
          >
            privacy@stress-unwind.com
          </a>
          <br />
          <strong>Response SLA:</strong> Acknowledged within 24 hours; resolved
          within 36 business hours.
        </div>
      </InfoSection>
    </InfoPage>
  );
}