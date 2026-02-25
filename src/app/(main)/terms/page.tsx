import Link from "next/link";

const TOC = [
  "Agreement to Terms",
  "Intellectual Property Rights",
  "User Representations",
  "User Registration",
  "Prohibited Activities",
  "User Generated Contributions",
  "Contribution License",
  "Submissions",
  "Third-Party Website and Content",
  "Site Management",
  "Privacy Policy",
  "Copyright Infringements",
  "Term and Termination",
  "Modifications and Interruptions",
  "Governing Law",
  "Dispute Resolution",
  "Corrections",
  "Disclaimer",
  "Limitations of Liability",
  "Indemnification",
  "User Data",
  "Electronic Communications, Transactions, and Signatures",
  "California Users and Residents",
  "Miscellaneous",
  "Contact Us",
];

function toId(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="bg-white rounded-2xl border border-warm-border/30 shadow-card p-6 lg:p-8">
        <h1 className="text-xl font-bold text-warm-brown mb-1">Terms of Use</h1>
        <p className="text-xs text-warm-gray mb-6">Last updated November 24, 2023</p>

        <div className="text-sm text-warm-brown leading-relaxed space-y-5">
          {/* Table of Contents */}
          <nav className="bg-cream-light rounded-xl p-4">
            <p className="font-semibold text-xs text-warm-gray uppercase tracking-wide mb-2">
              Table of Contents
            </p>
            <ol className="list-decimal list-inside space-y-1 text-xs">
              {TOC.map((item) => (
                <li key={item}>
                  <a href={"#" + toId(item)} className="text-forest hover:text-forest-hover">
                    {item}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <section id="agreement-to-terms">
            <h2 className="font-semibold text-base mb-2">1. Agreement to Terms</h2>
            <p>
              These Terms of Use constitute a legally binding agreement made between you and
              t&apos;day (&quot;Company,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;),
              concerning your access to and use of the tday.co website as well as any other media
              form, media channel, mobile website or mobile application related, linked, or
              otherwise connected thereto (collectively, the &quot;Site&quot;). By accessing the
              Site, you agree that you have read, understood, and agree to be bound by all of these
              Terms of Use. If you do not agree with all of these Terms of Use, then you are
              expressly prohibited from using the Site and you must discontinue use immediately.
            </p>
          </section>

          <section id="intellectual-property-rights">
            <h2 className="font-semibold text-base mb-2">2. Intellectual Property Rights</h2>
            <p>
              Unless otherwise indicated, the Site is our proprietary property and all source code,
              databases, functionality, software, website designs, audio, video, text, photographs,
              and graphics on the Site (collectively, the &quot;Content&quot;) and the trademarks,
              service marks, and logos contained therein (the &quot;Marks&quot;) are owned or
              controlled by us or licensed to us, and are protected by copyright and trademark laws.
            </p>
          </section>

          <section id="user-representations">
            <h2 className="font-semibold text-base mb-2">3. User Representations</h2>
            <p>
              By using the Site, you represent and warrant that: (1) all registration information
              you submit will be true, accurate, current, and complete; (2) you will maintain the
              accuracy of such information; (3) you have the legal capacity and you agree to comply
              with these Terms of Use; (4) you are not a minor in your jurisdiction of residence;
              (5) you will not access the Site through automated or non-human means; (6) you will
              not use the Site for any illegal or unauthorized purpose; and (7) your use of the Site
              will not violate any applicable law or regulation.
            </p>
          </section>

          <section id="user-registration">
            <h2 className="font-semibold text-base mb-2">4. User Registration</h2>
            <p>
              You may be required to register with the Site. You agree to keep your password
              confidential and will be responsible for all use of your account and password. We
              reserve the right to remove, reclaim, or change a username you select if we determine,
              in our sole discretion, that such username is inappropriate, obscene, or otherwise
              objectionable.
            </p>
          </section>

          <section id="prohibited-activities">
            <h2 className="font-semibold text-base mb-2">5. Prohibited Activities</h2>
            <p>
              You may not access or use the Site for any purpose other than that for which we make
              the Site available. The Site may not be used in connection with any commercial
              endeavors except those that are specifically endorsed or approved by us. As a user of
              the Site, you agree not to engage in any activity that interferes with, disrupts, or
              imposes an unreasonable burden on the Site or its connected networks.
            </p>
          </section>

          <section id="user-generated-contributions">
            <h2 className="font-semibold text-base mb-2">6. User Generated Contributions</h2>
            <p>
              The Site may invite you to contribute content such as ratings, comments, journal
              entries, and other materials. Your contributions must not be illegal, obscene,
              threatening, defamatory, invasive of privacy, or otherwise injurious to third parties.
              Contributions must not contain software viruses or any form of unsolicited
              communication.
            </p>
          </section>

          <section id="contribution-license">
            <h2 className="font-semibold text-base mb-2">7. Contribution License</h2>
            <p>
              By posting your contributions to any part of the Site, you grant us an unrestricted,
              unlimited, irrevocable, perpetual, non-exclusive, transferable, royalty-free license to
              use, copy, reproduce, and distribute your contributions for any lawful purpose.
              Journal entries are encrypted and private &mdash; they are excluded from this license.
            </p>
          </section>

          <section id="submissions">
            <h2 className="font-semibold text-base mb-2">8. Submissions</h2>
            <p>
              You acknowledge and agree that any questions, comments, suggestions, or other
              information regarding the Site that you provide to us are non-confidential and shall
              become our sole property.
            </p>
          </section>

          <section id="third-party-website-and-content">
            <h2 className="font-semibold text-base mb-2">9. Third-Party Website and Content</h2>
            <p>
              The Site may contain links to other websites and content belonging to or originating
              from third parties. We do not investigate, monitor, or check such content for accuracy,
              appropriateness, or completeness and are not responsible for any third-party content
              accessed through the Site.
            </p>
          </section>

          <section id="site-management">
            <h2 className="font-semibold text-base mb-2">10. Site Management</h2>
            <p>
              We reserve the right, but not the obligation, to: (1) monitor the Site for violations
              of these Terms of Use; (2) take legal action against anyone who violates the law or
              these Terms of Use; (3) refuse, restrict, or disable access to any user&apos;s
              contribution; (4) remove from the Site content that is excessive in size or
              burdensome; and (5) otherwise manage the Site in a manner designed to protect our
              rights and property.
            </p>
          </section>

          <section id="privacy-policy">
            <h2 className="font-semibold text-base mb-2">11. Privacy Policy</h2>
            <p>
              We care about data privacy and security. Please review our{" "}
              <Link href="/privacy" className="text-forest hover:text-forest-hover">
                Privacy Policy
              </Link>
              . By using the Site, you agree to be bound by our Privacy Policy, which is
              incorporated into these Terms of Use.
            </p>
          </section>

          <section id="copyright-infringements">
            <h2 className="font-semibold text-base mb-2">12. Copyright Infringements</h2>
            <p>
              We respect the intellectual property rights of others. If you believe that any material
              available on or through the Site infringes upon any copyright you own or control,
              please immediately notify us at info@tday.co.
            </p>
          </section>

          <section id="term-and-termination">
            <h2 className="font-semibold text-base mb-2">13. Term and Termination</h2>
            <p>
              These Terms of Use shall remain in full force and effect while you use the Site. We
              reserve the right to deny access to and use of the Site to any person for any reason at
              any time, without notice. If we terminate your account, you are prohibited from
              registering and creating a new account.
            </p>
          </section>

          <section id="modifications-and-interruptions">
            <h2 className="font-semibold text-base mb-2">14. Modifications and Interruptions</h2>
            <p>
              We reserve the right to change, modify, or remove the contents of the Site at any time
              or for any reason at our sole discretion without notice. We will not be liable to you
              or any third party for any modification, suspension, or discontinuance of the Site.
            </p>
          </section>

          <section id="governing-law">
            <h2 className="font-semibold text-base mb-2">15. Governing Law</h2>
            <p>
              These Terms shall be governed by and defined following the laws of the State of New
              Jersey. t&apos;day and yourself irrevocably consent that the courts of New Jersey shall
              have exclusive jurisdiction to resolve any dispute which may arise in connection with
              these Terms.
            </p>
          </section>

          <section id="dispute-resolution">
            <h2 className="font-semibold text-base mb-2">16. Dispute Resolution</h2>
            <p>
              Any legal action of whatever nature brought by either you or us shall be commenced or
              prosecuted in the state and federal courts located in New Jersey, and the parties
              hereby consent to the personal jurisdiction of such courts.
            </p>
          </section>

          <section id="corrections">
            <h2 className="font-semibold text-base mb-2">17. Corrections</h2>
            <p>
              There may be information on the Site that contains typographical errors, inaccuracies,
              or omissions. We reserve the right to correct any errors, inaccuracies, or omissions
              and to change or update information on the Site at any time, without prior notice.
            </p>
          </section>

          <section id="disclaimer">
            <h2 className="font-semibold text-base mb-2">18. Disclaimer</h2>
            <p>
              The Site is provided on an as-is and as-available basis. You agree that your use of
              the Site and our services will be at your sole risk. To the fullest extent permitted by
              law, we disclaim all warranties, express or implied, including implied warranties of
              merchantability, fitness for a particular purpose, and non-infringement.
            </p>
          </section>

          <section id="limitations-of-liability">
            <h2 className="font-semibold text-base mb-2">19. Limitations of Liability</h2>
            <p>
              In no event will we or our directors, employees, or agents be liable to you or any
              third party for any direct, indirect, consequential, exemplary, incidental, special, or
              punitive damages arising from your use of the Site, even if we have been advised of the
              possibility of such damages.
            </p>
          </section>

          <section id="indemnification">
            <h2 className="font-semibold text-base mb-2">20. Indemnification</h2>
            <p>
              You agree to defend, indemnify, and hold us harmless, including our subsidiaries,
              affiliates, and all of our respective officers, agents, partners, and employees, from
              and against any loss, damage, liability, claim, or demand arising out of your use of
              the Site or breach of these Terms of Use.
            </p>
          </section>

          <section id="user-data">
            <h2 className="font-semibold text-base mb-2">21. User Data</h2>
            <p>
              We will maintain certain data that you transmit to the Site for the purpose of managing
              the performance of the Site, as well as data relating to your use of the Site. You are
              solely responsible for all data that you transmit or that relates to any activity you
              have undertaken using the Site.
            </p>
          </section>

          <section id="electronic-communications-transactions-and-signatures">
            <h2 className="font-semibold text-base mb-2">
              22. Electronic Communications, Transactions, and Signatures
            </h2>
            <p>
              Visiting the Site, sending us emails, and completing online forms constitute electronic
              communications. You consent to receive electronic communications, and you agree that
              all agreements, notices, disclosures, and other communications we provide to you
              electronically satisfy any legal requirement that such communication be in writing.
            </p>
          </section>

          <section id="california-users-and-residents">
            <h2 className="font-semibold text-base mb-2">23. California Users and Residents</h2>
            <p>
              If any complaint with us is not satisfactorily resolved, you can contact the Complaint
              Assistance Unit of the Division of Consumer Services of the California Department of
              Consumer Affairs in writing at 1625 North Market Blvd., Suite N 112, Sacramento,
              California 95834 or by telephone at (800) 952-5210 or (916) 445-1254.
            </p>
          </section>

          <section id="miscellaneous">
            <h2 className="font-semibold text-base mb-2">24. Miscellaneous</h2>
            <p>
              These Terms of Use and any policies posted by us on the Site constitute the entire
              agreement and understanding between you and us. Our failure to exercise or enforce any
              right or provision of these Terms of Use shall not operate as a waiver of such right or
              provision.
            </p>
          </section>

          <section id="contact-us">
            <h2 className="font-semibold text-base mb-2">25. Contact Us</h2>
            <p>
              To resolve a complaint regarding the Site or to receive further information regarding
              use of the Site, please contact us at:{" "}
              <a href="mailto:info@tday.co" className="text-forest hover:text-forest-hover">
                info@tday.co
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
