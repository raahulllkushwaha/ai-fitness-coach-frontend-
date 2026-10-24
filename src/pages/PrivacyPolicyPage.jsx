
import { Activity, ArrowLeft, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import './PrivacyPolicyPage.css';

const sections = [
  {
    title: '1. About this project',
    paragraphs: [
      'AI Fitness Coach is an independently developed student portfolio project created for educational purposes, software development practice, and demonstration of fitness tracking and AI-assisted coaching features.',
      'At the time of writing, this is a personal development project, not an established commercial fitness or medical service. Features may change as development continues.',
    ],
  },
  {
    title: '2. Information the application processes',
    paragraphs: [
      'Depending on the features you use, the application may process account information such as your name, username, and email address; workouts and exercise records you create; fitness activity data you choose to import; and technical information needed to operate and secure the service.',
      'Please avoid submitting sensitive information that is not needed to use the application.',
    ],
  },
  {
    title: '3. How information is used',
    paragraphs: [
      'Information is used to operate your account, save and display workouts, provide fitness analytics, support authorized activity synchronization, generate coaching responses where available, and troubleshoot or secure the application.',
    ],
  },
  {
    title: '4. Intervals.icu integration',
    paragraphs: [
      'When the Intervals.icu integration is enabled, connecting your account will require your authorization. The application is intended to request permission to read training activity data for import and analysis. You should never need to give AI Fitness Coach your Intervals.icu password.',
      'Authorized activity data is associated with your AI Fitness Coach account. Disconnecting an integration is intended to stop future access; it does not automatically remove activity records already imported into AI Fitness Coach.',
      'Intervals.icu remains a separate service and its own terms and privacy policy apply to your use of that service.',
    ],
  },
  {
    title: '5. Hosting and third-party services',
    paragraphs: [
      'The application uses third-party infrastructure to host its frontend and backend. Features that rely on external integrations or an AI provider may send the information needed for that feature to the relevant provider for processing.',
      'I do not sell personal information. Information may be processed by service providers needed to operate the application, or disclosed when required for security or by law.',
    ],
  },
  {
    title: '6. Data retention and deletion requests',
    paragraphs: [
      'Information may be retained for as long as it is needed to operate the application and maintain its records. Disconnecting an integration does not necessarily delete previously imported workouts.',
      'To ask about your information or request deletion, contact the developer using the email below. Requests will be reviewed and handled where technically and legally possible. Some backup or security records may remain for a limited period.',
    ],
  },
  {
    title: '7. Security',
    paragraphs: [
      'Reasonable measures are used to protect application data. However, no internet service or storage system can be guaranteed to be completely secure.',
    ],
  },
  {
    title: '8. Fitness and AI disclaimer',
    paragraphs: [
      'Fitness analytics and AI-generated coaching responses are for informational and educational purposes only. They are not medical advice, diagnosis, or a substitute for guidance from a qualified healthcare professional.',
    ],
  },
  {
    title: '9. Changes to this policy',
    paragraphs: [
      'This policy may be updated as the project and its features evolve. The effective date below will be updated when material changes are made.',
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="privacy-page">
      <header className="privacy-header">
        <Link to="/login" className="privacy-brand">
          <span className="privacy-mark">
            <Activity size={22} />
          </span>
          <span>
            <strong>AI Fitness Coach</strong>
            <small>PRIVACY & TRANSPARENCY</small>
          </span>
        </Link>

        <Link to="/login" className="privacy-back">
          <ArrowLeft size={15} />
          Back to app
        </Link>
      </header>

      <section className="privacy-hero">
        <span className="privacy-pill">
          <ShieldCheck size={14} />
          Student-built portfolio project
        </span>

        <p className="privacy-eyebrow">YOUR DATA MATTERS</p>
        <h1>Privacy <span>Policy.</span></h1>
        <p className="privacy-intro">
          How AI Fitness Coach handles account information, workout records,
          and activity data used by its fitness features.
        </p>

        <div className="privacy-meta">
          <span>Effective date: October 24, 2026</span>
          <span>Last updated: October 24, 2026</span>
        </div>
      </section>

      <article className="privacy-document">
        {sections.map((section) => (
          <section className="privacy-section" key={section.title}>
            <h2>{section.title}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </section>
        ))}

        <section className="privacy-section privacy-contact">
          <h2>10. Contact</h2>
          <p>
            For privacy questions or requests concerning your information,
            contact the developer:
          </p>
          <a href="mailto:raahullkushwaha@gmail.com">
            raahullkushwaha@gmail.com
          </a>
          <p className="privacy-contact-note">
        
          </p>
        </section>
      </article>

      <footer className="privacy-footer">
        <span>AI Fitness Coach</span>
        <span>Built as a student portfolio project.</span>
      </footer>
    </main>
  );
}
