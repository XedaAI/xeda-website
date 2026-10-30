import { useEffect, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/contexts/LanguageContext";

// The policy in both languages, rendered by one template. Keeping the text as
// data rather than two copies of the markup means the versions cannot drift
// apart in structure: same sections, same order. Section numbers come from the
// order, so cross-references in the text ("Section 8", "Abschnitt 9") hold as
// long as both arrays keep that order. Change both languages together.

interface Item {
  label?: string;
  text: ReactNode;
}

interface Section {
  title: string;
  intro?: ReactNode;
  items?: Item[];
  outro?: ReactNode;
  address?: ReactNode;
}

interface Policy {
  back: string;
  title: string;
  updated: string;
  sections: Section[];
}

const impressumLink = (
  <Link to="/impressum" className="text-primary hover:underline">Impressum</Link>
);

const address = (
  <>
    <strong className="text-foreground">Xeda UG (haftungsbeschränkt)</strong><br />
    Bismarckstr. 54, 67059 Ludwigshafen am Rhein, Deutschland<br />
    E-Mail: saad.bakhtiyar@xeda.ai
  </>
);

const en: Policy = {
  back: "Back to Home",
  title: "Privacy Policy",
  updated: "Last updated: October 20, 2026",
  sections: [
    {
      title: "Introduction",
      intro: (
        <>
          Xeda UG (haftungsbeschränkt) (“xeda.ai”, “we”) respects your privacy and is committed to protecting your
          personal data. This privacy policy explains how we collect, use, and safeguard your information when you
          visit our website or use our services. The controller responsible for data processing is Xeda UG
          (haftungsbeschränkt); full contact details are in our {impressumLink}.
        </>
      ),
    },
    {
      title: "Information We Collect",
      intro: "We may collect the following types of information:",
      items: [
        { label: "Contact Information:", text: "Name, email address, company name, and phone number when you submit our contact form." },
        { label: "Usage Data:", text: "Information about how you interact with our website, including pages visited, time spent, and navigation patterns." },
        { label: "Technical Data:", text: "IP address, browser type, device information, and operating system." },
        { label: "Cookie Data:", text: "Information collected through cookies and similar tracking technologies." },
      ],
    },
    {
      title: "How We Use Your Information",
      intro: "We use the collected information for the following purposes:",
      items: [
        { text: "To respond to your inquiries and provide customer support" },
        { text: "To send you information about our services that may interest you" },
        { text: "To improve our website and user experience" },
        { text: "To analyze website traffic and usage patterns" },
        { text: "To comply with legal obligations" },
      ],
    },
    {
      title: "Cookies and Tracking Technologies",
      intro: "We use cookies and similar tracking technologies to enhance your browsing experience. Cookies are small text files stored on your device that help us:",
      items: [
        { label: "Essential Cookies:", text: "Required for the website to function properly." },
        { label: "Analytics Cookies:", text: "Help us understand how visitors interact with our website." },
        { label: "Preference Cookies:", text: "Remember your settings and preferences." },
      ],
      outro: "You can manage your cookie preferences through your browser settings or by using the cookie consent banner when you first visit our website.",
    },
    {
      title: "Data Security",
      intro: "We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. All traffic to and from this site and its backend services is encrypted in transit (TLS/HTTPS), and stored data is encrypted at rest by our infrastructure providers. This is standard transport and storage encryption — our own systems and the sub-processors listed in Section 8 can access message content as needed to provide the service (e.g. to generate an AI reply or send you an email); it is not end-to-end encryption. However, no method of transmission over the Internet is 100% secure.",
    },
    {
      title: "Your Rights (GDPR)",
      intro: "Under the General Data Protection Regulation (GDPR), you have the following rights:",
      items: [
        { label: "Right of Access (Art. 15 GDPR):", text: "Request a copy of your personal data." },
        { label: "Right to Rectification (Art. 16 GDPR):", text: "Request correction of inaccurate data." },
        { label: "Right to Erasure (Art. 17 GDPR):", text: "Request deletion of your personal data." },
        { label: "Right to Restriction (Art. 18 GDPR):", text: "Request limitation of processing." },
        { label: "Right to Data Portability (Art. 20 GDPR):", text: "Request transfer of your data." },
        { label: "Right to Object (Art. 21 GDPR):", text: "Object to processing of your data." },
        { label: "Right to Lodge a Complaint (Art. 77 GDPR):", text: "Complain to a data-protection supervisory authority, in particular the one responsible for us: the State Commissioner for Data Protection and Freedom of Information of Rhineland-Palatinate (Der Landesbeauftragte für den Datenschutz und die Informationsfreiheit Rheinland-Pfalz)." },
      ],
    },
    {
      title: "Data Retention",
      intro: "We retain your personal data only for as long as necessary to fulfill the purposes for which it was collected, including legal, accounting, or reporting requirements. Contact form submissions are typically retained for 2 years unless you request earlier deletion. Messages in our AI chat assistant are deleted automatically 30 days after they are sent (see Section 9).",
    },
    {
      title: "Third-Party Services & Sub-Processors",
      intro: "We use the following sub-processors to operate this site and our AI assistant. Each acts as a data processor on our behalf under a data processing agreement (DPA); where a provider is based outside the EU/EEA, the transfer is covered by Standard Contractual Clauses (SCCs) or an equivalent safeguard.",
      items: [
        { label: "Supabase:", text: "database, authentication, and backend hosting for contact submissions, newsletter subscriptions, and chat history." },
        { label: "Google (Gemini API, paid service):", text: "generates the AI assistant’s replies and transcribes your question when you use the microphone. Messages and voice recordings you send the chat assistant are transmitted to Google for processing; processing may take place outside the EU, including in the USA. Under Google’s terms for paid use, your prompts and the replies are not used to improve Google’s products." },
        { label: "ElevenLabs:", text: "converts the chat assistant’s replies to spoken questions into audio. ElevenLabs receives only the text of our reply, never your recording. Processing may take place outside the EU, including in the USA." },
        { label: "Resend:", text: "delivers contact-form notification and confirmation emails." },
        { label: "Mailchimp:", text: "manages newsletter subscriptions and delivery." },
      ],
      outro: "These services have their own privacy policies, and we encourage you to review them. This public website and its AI assistant run on the managed, cloud-hosted services listed above — they are not deployed on-premise or in a private cloud.",
    },
    {
      title: "AI Chat Assistant and Voice Input",
      intro: "The chat assistant on this website is an AI, not a person. It answers questions about Xeda and our services. Its answers can be wrong, and it does not give legal, tax or financial advice. Using it is optional; you can always reach us through the contact form or by email instead.",
      items: [
        { label: "What we process:", text: "the messages you type or speak and the assistant’s replies. To let you continue a conversation, we store it under a random session ID that is kept in your browser’s local storage, together with your chosen chat language and voice. The assistant does not use cookies." },
        { label: "Voice input:", text: "when you use the microphone, your recording is sent to Google (Gemini API) to be turned into text. We do not store the recording; only the transcribed text is kept, like a typed message. Replies to spoken questions are read aloud using ElevenLabs, which receives only the reply text." },
        { label: "Who processes it:", text: "Google transcribes spoken questions and generates the replies, ElevenLabs reads replies aloud, and Supabase stores the conversation (see Section 8). Processing by Google and ElevenLabs may take place outside the EU, including in the USA." },
        { label: "Purpose and legal basis:", text: "answering your enquiry. Where it concerns a possible engagement with us, the legal basis is Art. 6(1)(b) GDPR (steps taken at your request before entering into a contract); otherwise it is Art. 6(1)(f) GDPR, our legitimate interest in answering questions from visitors to our website." },
        { label: "Retention:", text: "messages are deleted automatically 30 days after they are sent, and conversations nobody has continued for 30 days are deleted with them. You can delete a conversation at any time with the bin icon in the chat window." },
        { label: "Please do not enter", text: "personal data about yourself or others, client data, or anything confidential. The chat is a simple website assistant and is not designed for such information." },
      ],
    },
    {
      title: "Changes to This Policy",
      intro: "We may update this privacy policy from time to time. Any changes will be posted on this page with an updated revision date. We encourage you to review this policy periodically.",
    },
    {
      title: "Contact Us",
      intro: "If you have any questions about this privacy policy or our data practices, please contact us at:",
      address,
    },
  ],
};

const de: Policy = {
  back: "Zurück zur Startseite",
  title: "Datenschutzerklärung",
  updated: "Stand: 20. Oktober 2026",
  sections: [
    {
      title: "Einleitung",
      intro: (
        <>
          Die Xeda UG (haftungsbeschränkt) („xeda.ai“, „wir“) respektiert Ihre Privatsphäre und schützt Ihre
          personenbezogenen Daten. Diese Datenschutzerklärung erläutert, wie wir Ihre Daten erheben, verwenden und
          schützen, wenn Sie unsere Website besuchen oder unsere Leistungen nutzen. Verantwortlicher für die
          Datenverarbeitung ist die Xeda UG (haftungsbeschränkt); die vollständigen Kontaktdaten finden Sie in
          unserem {impressumLink}.
        </>
      ),
    },
    {
      title: "Welche Daten wir erheben",
      intro: "Wir können die folgenden Arten von Daten erheben:",
      items: [
        { label: "Kontaktdaten:", text: "Name, E-Mail-Adresse, Firmenname und Telefonnummer, wenn Sie unser Kontaktformular absenden." },
        { label: "Nutzungsdaten:", text: "Informationen darüber, wie Sie unsere Website nutzen, einschließlich besuchter Seiten, Verweildauer und Navigationsverhalten." },
        { label: "Technische Daten:", text: "IP-Adresse, Browsertyp, Geräteinformationen und Betriebssystem." },
        { label: "Cookie-Daten:", text: "Informationen, die über Cookies und ähnliche Technologien erhoben werden." },
      ],
    },
    {
      title: "Wofür wir Ihre Daten verwenden",
      intro: "Wir verwenden die erhobenen Daten für folgende Zwecke:",
      items: [
        { text: "um Ihre Anfragen zu beantworten und Sie zu unterstützen" },
        { text: "um Ihnen Informationen über unsere Leistungen zu senden, die Sie interessieren könnten" },
        { text: "um unsere Website und die Nutzererfahrung zu verbessern" },
        { text: "um Besucherzahlen und Nutzungsmuster der Website auszuwerten" },
        { text: "um gesetzliche Pflichten zu erfüllen" },
      ],
    },
    {
      title: "Cookies und ähnliche Technologien",
      intro: "Wir verwenden Cookies und ähnliche Technologien, um Ihren Besuch auf unserer Website zu verbessern. Cookies sind kleine Textdateien, die auf Ihrem Gerät gespeichert werden. Wir unterscheiden:",
      items: [
        { label: "Notwendige Cookies:", text: "Sie sind erforderlich, damit die Website ordnungsgemäß funktioniert." },
        { label: "Analyse-Cookies:", text: "Sie helfen uns zu verstehen, wie Besucher unsere Website nutzen." },
        { label: "Präferenz-Cookies:", text: "Sie speichern Ihre Einstellungen und Präferenzen." },
      ],
      outro: "Sie können Ihre Cookie-Einstellungen in Ihrem Browser oder über das Cookie-Banner verwalten, das beim ersten Besuch unserer Website erscheint.",
    },
    {
      title: "Datensicherheit",
      intro: "Wir treffen angemessene technische und organisatorische Maßnahmen, um Ihre personenbezogenen Daten vor unbefugtem Zugriff, Veränderung, Offenlegung oder Vernichtung zu schützen. Sämtliche Datenübertragungen zu und von dieser Website und ihren Backend-Diensten sind verschlüsselt (TLS/HTTPS), und gespeicherte Daten werden von unseren Infrastrukturanbietern verschlüsselt abgelegt. Dabei handelt es sich um übliche Transport- und Speicherverschlüsselung – unsere eigenen Systeme und die in Abschnitt 8 genannten Auftragsverarbeiter können auf Inhalte zugreifen, soweit dies zur Erbringung des Dienstes erforderlich ist (z. B. um eine KI-Antwort zu erzeugen oder Ihnen eine E-Mail zu senden); eine Ende-zu-Ende-Verschlüsselung ist es nicht. Keine Übertragung über das Internet ist jedoch zu 100 % sicher.",
    },
    {
      title: "Ihre Rechte nach der DSGVO",
      intro: "Nach der Datenschutz-Grundverordnung (DSGVO) haben Sie folgende Rechte:",
      items: [
        { label: "Auskunftsrecht (Art. 15 DSGVO):", text: "Sie können eine Kopie Ihrer personenbezogenen Daten verlangen." },
        { label: "Recht auf Berichtigung (Art. 16 DSGVO):", text: "Sie können die Berichtigung unrichtiger Daten verlangen." },
        { label: "Recht auf Löschung (Art. 17 DSGVO):", text: "Sie können die Löschung Ihrer personenbezogenen Daten verlangen." },
        { label: "Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO):", text: "Sie können verlangen, dass wir die Verarbeitung einschränken." },
        { label: "Recht auf Datenübertragbarkeit (Art. 20 DSGVO):", text: "Sie können verlangen, dass wir Ihre Daten an Sie oder einen Dritten übermitteln." },
        { label: "Widerspruchsrecht (Art. 21 DSGVO):", text: "Sie können der Verarbeitung Ihrer Daten widersprechen." },
        { label: "Beschwerderecht (Art. 77 DSGVO):", text: "Sie können sich bei einer Datenschutz-Aufsichtsbehörde beschweren, insbesondere bei der für uns zuständigen: dem Landesbeauftragten für den Datenschutz und die Informationsfreiheit Rheinland-Pfalz." },
      ],
    },
    {
      title: "Speicherdauer",
      intro: "Wir speichern Ihre personenbezogenen Daten nur so lange, wie es für die Zwecke erforderlich ist, für die sie erhoben wurden, einschließlich gesetzlicher, buchhalterischer oder berichtsbezogener Pflichten. Anfragen über das Kontaktformular bewahren wir in der Regel 2 Jahre auf, sofern Sie keine frühere Löschung verlangen. Nachrichten in unserem KI-Chat-Assistenten werden 30 Tage nach dem Senden automatisch gelöscht (siehe Abschnitt 9).",
    },
    {
      title: "Drittanbieter und Auftragsverarbeiter",
      intro: "Für den Betrieb dieser Website und unseres KI-Assistenten setzen wir die folgenden Auftragsverarbeiter ein. Jeder handelt auf Grundlage eines Auftragsverarbeitungsvertrags (AVV) in unserem Auftrag; hat ein Anbieter seinen Sitz außerhalb der EU bzw. des EWR, ist die Übermittlung durch Standardvertragsklauseln der EU-Kommission oder eine gleichwertige Garantie abgesichert.",
      items: [
        { label: "Supabase:", text: "Datenbank, Authentifizierung und Backend-Hosting für Kontaktanfragen, Newsletter-Anmeldungen und den Chat-Verlauf." },
        { label: "Google (Gemini API, kostenpflichtiger Dienst):", text: "erzeugt die Antworten des KI-Assistenten und wandelt Ihre Frage in Text um, wenn Sie das Mikrofon nutzen. Nachrichten und Sprachaufnahmen, die Sie an den Chat-Assistenten senden, werden zur Verarbeitung an Google übermittelt; die Verarbeitung kann außerhalb der EU erfolgen, auch in den USA. Nach den Bedingungen von Google für die kostenpflichtige Nutzung werden Ihre Eingaben und die Antworten nicht zur Verbesserung von Google-Produkten verwendet." },
        { label: "ElevenLabs:", text: "setzt die Antworten des Chat-Assistenten auf gesprochene Fragen in gesprochene Sprache um. ElevenLabs erhält nur den Text unserer Antwort, nie Ihre Aufnahme. Die Verarbeitung kann außerhalb der EU erfolgen, auch in den USA." },
        { label: "Resend:", text: "versendet Benachrichtigungs- und Bestätigungs-E-Mails zum Kontaktformular." },
        { label: "Mailchimp:", text: "verwaltet Newsletter-Anmeldungen und den Newsletter-Versand." },
      ],
      outro: "Diese Dienste haben eigene Datenschutzerklärungen, die wir Ihnen zur Lektüre empfehlen. Diese öffentliche Website und ihr KI-Assistent laufen auf den oben genannten verwalteten Cloud-Diensten – sie werden nicht On-Premise oder in einer Private Cloud betrieben.",
    },
    {
      title: "KI-Chat-Assistent und Spracheingabe",
      intro: "Der Chat-Assistent auf dieser Website ist eine KI, kein Mensch. Er beantwortet Fragen zu Xeda und unseren Leistungen. Seine Antworten können falsch sein, und er erteilt keine Rechts-, Steuer- oder Finanzberatung. Die Nutzung ist freiwillig; Sie erreichen uns jederzeit auch über das Kontaktformular oder per E-Mail.",
      items: [
        { label: "Was wir verarbeiten:", text: "die Nachrichten, die Sie tippen oder sprechen, und die Antworten des Assistenten. Damit Sie ein Gespräch fortsetzen können, speichern wir es unter einer zufälligen Sitzungs-ID, die im lokalen Speicher (Local Storage) Ihres Browsers abgelegt wird, zusammen mit der gewählten Chat-Sprache und Stimme. Der Assistent verwendet keine Cookies." },
        { label: "Spracheingabe:", text: "Wenn Sie das Mikrofon nutzen, wird Ihre Aufnahme an Google (Gemini API) gesendet und in Text umgewandelt. Die Aufnahme selbst speichern wir nicht; aufbewahrt wird nur der umgewandelte Text, wie eine getippte Nachricht. Antworten auf gesprochene Fragen werden mit ElevenLabs vorgelesen, das nur den Antworttext erhält." },
        { label: "Wer die Daten verarbeitet:", text: "Google wandelt gesprochene Fragen in Text um und erzeugt die Antworten, ElevenLabs liest Antworten vor, und Supabase speichert das Gespräch (siehe Abschnitt 8). Die Verarbeitung durch Google und ElevenLabs kann außerhalb der EU erfolgen, auch in den USA." },
        { label: "Zweck und Rechtsgrundlage:", text: "die Beantwortung Ihrer Anfrage. Betrifft sie eine mögliche Zusammenarbeit mit uns, ist Rechtsgrundlage Art. 6 Abs. 1 lit. b DSGVO (vorvertragliche Maßnahmen auf Ihre Anfrage); andernfalls Art. 6 Abs. 1 lit. f DSGVO, unser berechtigtes Interesse an der Beantwortung von Fragen der Besucher unserer Website." },
        { label: "Speicherdauer:", text: "Nachrichten werden 30 Tage nach dem Senden automatisch gelöscht; Gespräche, die 30 Tage lang nicht fortgesetzt wurden, werden mit ihnen gelöscht. Über das Papierkorb-Symbol im Chatfenster können Sie ein Gespräch jederzeit selbst löschen." },
        { label: "Bitte geben Sie", text: "keine personenbezogenen Daten über sich oder andere, keine Mandanten- oder Kundendaten und nichts Vertrauliches ein. Der Chat ist ein einfacher Website-Assistent und nicht für solche Informationen ausgelegt." },
      ],
    },
    {
      title: "Änderungen dieser Datenschutzerklärung",
      intro: "Wir können diese Datenschutzerklärung von Zeit zu Zeit anpassen. Änderungen veröffentlichen wir auf dieser Seite mit aktualisiertem Datum. Bitte sehen Sie sich diese Erklärung regelmäßig an.",
    },
    {
      title: "Kontakt",
      intro: "Bei Fragen zu dieser Datenschutzerklärung oder zu unserem Umgang mit Ihren Daten erreichen Sie uns unter:",
      address,
    },
  ],
};

const Privacy = () => {
  const { language } = useLanguage();
  const policy = language === "de" ? de : en;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead page="privacy" />
      <div className="container mx-auto px-6 py-12">
        <Link to="/">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {policy.back}
          </Button>
        </Link>

        <article className="prose prose-neutral dark:prose-invert max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-2">{policy.title}</h1>
          <p className="text-muted-foreground mb-8">{policy.updated}</p>

          {policy.sections.map((section, index) => (
            <section key={section.title} className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                {index + 1}. {section.title}
              </h2>
              {section.intro && (
                <p className={`text-muted-foreground leading-relaxed${section.items ? " mb-4" : ""}`}>
                  {section.intro}
                </p>
              )}
              {section.items && (
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  {section.items.map((item, i) => (
                    <li key={i}>
                      {item.label && <strong className="text-foreground">{item.label}</strong>}{" "}
                      {item.text}
                    </li>
                  ))}
                </ul>
              )}
              {section.outro && (
                <p className="text-muted-foreground leading-relaxed mt-4">{section.outro}</p>
              )}
              {section.address && <p className="text-muted-foreground mt-4">{section.address}</p>}
            </section>
          ))}
        </article>
      </div>
    </div>
  );
};

export default Privacy;
