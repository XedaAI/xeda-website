import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/SEOHead";
import LegalLinks from "@/components/LegalLinks";

const Impressum = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead page="impressum" />
      <div className="container mx-auto px-6 py-12">
        <Link to="/">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <article className="prose prose-neutral dark:prose-invert max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-8">Impressum</h1>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Angaben gemäß § 5 DDG</h2>
            <p className="text-muted-foreground leading-relaxed">
              Xeda UG (haftungsbeschränkt)<br />
              Bismarckstr. 54<br />
              67059 Ludwigshafen am Rhein<br />
              Deutschland
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Vertreten durch</h2>
            <p className="text-muted-foreground leading-relaxed">
              Geschäftsführer: Muhammad Saad Bakhtiar
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Kontakt</h2>
            <p className="text-muted-foreground leading-relaxed">
              Telefon:{" "}
              <a href="tel:+491794158530" className="text-primary hover:underline">+49 179 4158530</a>
              <br />
              E-Mail:{" "}
              <a href="mailto:saad.bakhtiar@xeda.ai" className="text-primary hover:underline">saad.bakhtiar@xeda.ai</a>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Registereintrag</h2>
            <p className="text-muted-foreground leading-relaxed">
              Eintragung im Handelsregister<br />
              Registergericht: Amtsgericht Ludwigshafen am Rhein<br />
              Registernummer: HRB 71014
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Umsatzsteuer-ID</h2>
            <p className="text-muted-foreground leading-relaxed">
              Umsatzsteuer-Identifikationsnummer gemäß § 27a Umsatzsteuergesetz:<br />
              Wird nach Erteilung durch das Bundeszentralamt für Steuern ergänzt.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
            <p className="text-muted-foreground leading-relaxed">
              Muhammad Saad Bakhtiar<br />
              Bismarckstr. 54, 67059 Ludwigshafen am Rhein
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Verbraucherstreitbeilegung/Universalschlichtungsstelle</h2>
            <p className="text-muted-foreground leading-relaxed">
              Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer 
              Verbraucherschlichtungsstelle teilzunehmen.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Haftung für Inhalte</h2>
            <p className="text-muted-foreground leading-relaxed">
              Für eigene Inhalte auf diesen Seiten sind wir nach den allgemeinen Gesetzen
              verantwortlich. Soweit wir Informationen Dritter übermitteln oder speichern, richtet sich
              unsere Verantwortlichkeit nach den Artikeln 4 bis 6 der Verordnung (EU) 2022/2065
              (Digital Services Act) in Verbindung mit § 7 DDG. Eine allgemeine Verpflichtung, diese
              Informationen zu überwachen oder aktiv nach Umständen zu forschen, die auf eine
              rechtswidrige Tätigkeit hinweisen, besteht nach Art. 8 DSA nicht.
              <br /><br />
              Verpflichtungen zur Entfernung von Informationen oder zur Sperrung ihrer Nutzung aufgrund
              gerichtlicher oder behördlicher Anordnungen bleiben hiervon unberührt. Eine diesbezügliche
              Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung
              möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte
              umgehend entfernen.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Haftung für Links</h2>
            <p className="text-muted-foreground leading-relaxed">
              Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen 
              Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. 
              Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der 
              Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf 
              mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der 
              Verlinkung nicht erkennbar.
              <br /><br />
              Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete 
              Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von 
              Rechtsverletzungen werden wir derartige Links umgehend entfernen.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Urheberrecht</h2>
            <p className="text-muted-foreground leading-relaxed">
              Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen 
              dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art 
              der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen 
              Zustimmung des jeweiligen Autors bzw. Erstellers. Downloads und Kopien dieser Seite sind 
              nur für den privaten, nicht kommerziellen Gebrauch gestattet.
              <br /><br />
              Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden die 
              Urheberrechte Dritter beachtet. Insbesondere werden Inhalte Dritter als solche 
              gekennzeichnet. Sollten Sie trotzdem auf eine Urheberrechtsverletzung aufmerksam werden, 
              bitten wir um einen entsprechenden Hinweis. Bei Bekanntwerden von Rechtsverletzungen 
              werden wir derartige Inhalte umgehend entfernen.
            </p>
          </section>
        </article>

        <LegalLinks className="mt-12 pt-8 border-t border-border max-w-3xl mx-auto" />
      </div>
    </div>
  );
};

export default Impressum;
