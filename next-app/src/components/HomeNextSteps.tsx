import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  HeartHandshake,
  MessageCircle,
  Sparkles,
  Users,
} from "lucide-react";
import { Mascot } from "./Mascot";

const steps = [
  {
    id: "people",
    href: "/people",
    number: "01",
    label: "A SHARED INTEREST. A NEW HELLO.",
    title: "Meet people",
    text: "Find someone who enjoys your kind of things. Start with a shared interest; let the conversation follow.",
    cta: "Explore the community",
    icon: Users,
  },
  {
    id: "plans",
    href: "/book-activities",
    number: "02",
    label: "LESS SCROLLING. MORE SHOWING UP.",
    title: "Make a plan",
    text: "A lunchtime walk, a friendly game, a proper screen break. Find an activity or bring your own idea.",
    cta: "Find your next plan",
    icon: CalendarDays,
  },
  {
    id: "conversations",
    href: "/discuss",
    number: "03",
    label: "A LITTLE SHARING. A LITTLE LIGHTER.",
    title: "Join the conversation",
    text: "Read along, share a small win, or ask an honest question. There’s room for your quiet days, too.",
    cta: "Read the conversations",
    icon: MessageCircle,
  },
];

export function HomeNextSteps({ signedIn }: { signedIn: boolean }) {
  return (
    <section
      className="home-next-steps"
      aria-labelledby="home-next-title"
      id="your-next-good-thing"
    >
      <header className="next-steps-heading">
        <div>
          <span className="eyebrow">
            <Sparkles size={13} /> A LITTLE PAUSE. A NEW POSSIBILITY.
          </span>
          <h2 id="home-next-title">
            What feels good <em>next?</em>
          </h2>
        </div>
        <p>
          A hello. A plan. A thought shared.
          <br />
          Start wherever you feel comfortable.
        </p>
      </header>
      <div className="next-steps-grid">
        {steps.map((step) => (
          <Link
            href={step.href}
            className={`next-step-card next-step-${step.id}`}
            key={step.id}
            aria-labelledby={`next-${step.id}-title`}
          >
            <div className="next-step-scene" aria-hidden="true">
              <span className="next-scene-number">
                {step.number} / A SMALL START
              </span>
              {step.id === "people" ? (
                <div className="next-people-scene">
                  <span className="next-interest">
                    Your kind of people <Sparkles size={12} />
                  </span>
                  <div className="next-portraits">
                    <Mascot variant={1} />
                    <Mascot variant={2} />
                    <Mascot variant={3} />
                  </div>
                  <span className="next-scene-caption">
                    One thing in common is a start.
                  </span>
                </div>
              ) : step.id === "plans" ? (
                <div className="next-plan-scene">
                  <div className="next-plan-sheet">
                    <span>A LITTLE TIME, TOGETHER</span>
                    <CalendarDays size={31} strokeWidth={1.3} />
                    <strong>Let’s make time.</strong>
                    <small>A walk. A game. A proper break.</small>
                  </div>
                  <span className="next-plan-spark">✳</span>
                </div>
              ) : (
                <div className="next-chat-scene">
                  <span className="next-chat-bubble">
                    A small win. An honest question.
                  </span>
                  <span className="next-chat-bubble">
                    A good place to start.
                    <span className="next-chat-dots">
                      <i />
                      <i />
                      <i />
                    </span>
                  </span>
                </div>
              )}
            </div>
            <div className="next-step-copy">
              <span className="next-step-kicker">{step.label}</span>
              <h3 id={`next-${step.id}-title`}>{step.title}</h3>
              <p>{step.text}</p>
              <span className="next-step-link">
                {step.cta}
                <span>
                  <ArrowUpRight size={18} />
                </span>
              </span>
            </div>
          </Link>
        ))}
      </div>
      <footer className="next-steps-footer">
        <p>
          <span className="next-open-dot" />
          {signedIn
            ? "Follow an interest. Make a little room for connection."
            : "Take a look around. Sign in when you’re ready to connect or join."}
        </p>
        <Link href="/psychologists">
          <HeartHandshake size={17} /> Prefer one-to-one support?{" "}
          <span>
            Explore care <ArrowRight size={15} />
          </span>
        </Link>
      </footer>
    </section>
  );
}
