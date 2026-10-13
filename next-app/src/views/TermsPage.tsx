import Link from "next/link";
import { InfoPage, InfoSection, InfoList } from "@/components/InfoPage";

export function TermsPage() {
  return (
    <InfoPage
      eyebrow="TERMS OF SERVICE & MEMBERSHIP AGREEMENT"
      title={
        <>
          Clear expectations for a <em>safe, thriving community.</em>
        </>
      }
      lede={
        <>
          By using stress-unwind, booking sports turfs, participating in community
          circles, or scheduling clinical consultations, you agree to these terms.
          Our community is designed to foster genuine connection and burnout
          recovery without corporate pressure.
        </>
      }
      updated="October 2026"
    >
      <InfoSection heading="1. Community Purpose & Eligibility">
        <p>
          stress-unwind is an independent corporate wellness and sports matchmaking
          platform created to support mental wellbeing, recreational activity, and
          authentic camaraderie across Delhi-NCR and beyond.
        </p>
        <InfoList
          items={[
            "You must be at least 18 years of age to register and access activities.",
            "One verified account per individual. Duplicate accounts or impersonation violate community safety standards.",
            "Participation is entirely voluntary and is not governed by your corporate employment agreement.",
          ]}
        />
      </InfoSection>

      <InfoSection heading="2. Auto-Assigned Cute Handles & Anti-Trolling Standard" tone="honest">
        <p>
          To maintain an environment free of corporate rank, pedigree, or personal
          doxxing, members interact under algorithmically generated sports handles.
        </p>
        <InfoList
          items={[
            "You agree not to bypass, hack, or falsify your assigned avatar or handle.",
            "You agree not to pressure other members to disclose their real names, employers, salary bands, or personal social media handles.",
            "Discriminatory speech, sexual harassment, intimidation, stalking, and defamation result in immediate, permanent account termination.",
          ]}
        />
      </InfoSection>

      <InfoSection heading="3. Badminton Turf & Sports Activity Bookings" tone="callout">
        <p>
          When you match with a peer for a 2-player badminton game or join a group sports
          session across Delhi-NCR partner venues (Janakpuri, Cyber Hub, Sec 54, Noida, Palwal):
        </p>
        <InfoList
          items={[
            "Commitment & Punctuality: Both players must arrive at the venue 10 minutes prior to the scheduled court booking hour.",
            "Cancellation Notice: If you must cancel, you must notify the matchmaking desk at least 4 hours before slot time to allow court reallocation.",
            "Court Etiquette: Non-marking shoes are strictly required on all BWF synthetic and wooden courts. Respect arena staff, referees, and fellow players.",
            "Passcode Verification: Entry is permitted solely via the match confirmation pass issued by our operations desk.",
          ]}
        />
      </InfoSection>

      <InfoSection heading="4. Assumption of Risk & Sports Physical Waiver">
        <p>
          Badminton, box cricket, running, and physical sports involve inherent physical
          exertion and risk of injury (including sprains, falls, or cardiovascular stress).
        </p>
        <InfoList
          items={[
            "You certify that you are medically fit to engage in recreational physical activity.",
            "stress-unwind coordinates matchmaking and venue reservations as a technology intermediary; we do not employ venue personnel or inspect courts in real-time.",
            "You participate at your own discretion and assume full responsibility for your personal health and physical safety during matches.",
          ]}
        />
      </InfoSection>

      <InfoSection heading="5. Clinical Tele-Mental Health Consultations" tone="callout">
        <p>
          Our therapy directory connects members with verified, independent RCI-licensed
          psychologists and psychiatrists for confidential consultations.
        </p>
        <InfoList
          items={[
            "Not an Emergency Crisis Service: Virtual doctor cabins are not designed for acute psychiatric emergencies. If you or someone you know is in severe crisis, please immediately dial the national Tele-MANAS helpline (14416) or KIRAN (1800-599-0019).",
            "Professional Boundaries: Therapists maintain independent professional judgment under statutory medical council regulations.",
            "Appointment Courtesy: Consultations require 12-hour advance cancellation notice. Missed appointments without notice may forfeit session credits.",
          ]}
        />
      </InfoSection>

      <InfoSection heading="6. Prohibited Conduct & Employer-Blind Protection">
        <p>
          Any attempt to compromise the 100% employer-blind architecture of the platform
          is treated with zero tolerance:
        </p>
        <InfoList
          items={[
            "Zero Doxxing: Taking screenshots of peer venting, group discussions, or identity clues and transmitting them to corporate managers or social media is strictly forbidden.",
            "No Commercial Solicitation: Direct pitching, recruitment headhunting, or multi-level marketing is prohibited.",
            "Breach Consequences: Immediate permanent ban, revocation of all court bookings, and potential civil liability under applicable Indian cyber laws.",
          ]}
        />
      </InfoSection>

      <InfoSection heading="7. Intellectual Property & User Content">
        <p>
          You retain ownership of the insights and text you share in community groups.
          However, you grant stress-unwind a non-exclusive license to host and display
          that content within the app to support the community.
        </p>
      </InfoSection>

      <InfoSection heading="8. Limitation of Liability">
        <p>
          To the maximum extent permitted by applicable law, stress-unwind Technologies
          shall not be liable for any indirect, incidental, punitive, or consequential
          damages resulting from your use of the platform, venue conditions, or interactions
          between members off-platform.
        </p>
      </InfoSection>

      <InfoSection heading="9. Governing Law & Dispute Resolution">
        <p>
          These Terms of Service are governed by and construed in accordance with the
          laws of India. Any legal dispute or controversy arising under these terms
          shall be subject to the exclusive jurisdiction of the competent courts in
          New Delhi, India.
        </p>
      </InfoSection>

      <InfoSection heading="10. Support & Grievances">
        <p>
          Have questions about these terms or need clarification regarding court bookings
          or privacy protections? Please reach out via our{" "}
          <Link href="/contact" style={{ color: "var(--forest-sage)", textDecoration: "underline" }}>
            Contact Desk
          </Link>{" "}
          or email legal@stress-unwind.com.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
