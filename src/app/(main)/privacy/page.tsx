export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="bg-white rounded-2xl border border-warm-border/30 shadow-card p-6 lg:p-8">
        <h1 className="text-xl font-bold text-warm-brown mb-1">Privacy Notice</h1>
        <p className="text-xs text-warm-gray mb-6">Last updated November 24, 2023</p>

        <div className="text-sm text-warm-brown leading-relaxed space-y-5">
          <p>
            Thank you for choosing to be part of our community at t&apos;day
            (&quot;Company,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). We are
            committed to protecting your personal information and your right to privacy. If you
            have any questions or concerns about this privacy notice or our practices with regard
            to your personal information, please contact us at privacy@tday.co.
          </p>

          <section>
            <h2 className="font-semibold text-base mb-2">1. What Information Do We Collect?</h2>
            <p className="mb-2">
              <strong>Personal information you disclose to us.</strong> We collect personal
              information that you voluntarily provide to us when you register on the Website,
              express an interest in obtaining information about us or our products and services, or
              otherwise when you contact us.
            </p>
            <p>
              The personal information we collect may include: names, email addresses, usernames,
              passwords, contact preferences, country of residence, age group, and gender. We do
              not process sensitive information. Journal entries are encrypted with field-level
              encryption and cannot be read by us.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base mb-2">2. How Do We Use Your Information?</h2>
            <p>
              We use personal information collected via our Website for a variety of business
              purposes: to facilitate account creation and authentication, to send administrative
              information, to provide and manage your account, to respond to your inquiries, to
              compile anonymous statistical data and analysis for our internal use, and to protect
              our services.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base mb-2">
              3. Will Your Information Be Shared With Anyone?
            </h2>
            <p>
              We may process or share your data based on the following legal basis: consent,
              legitimate interests, performance of a contract, legal obligations, and vital
              interests. We may share information with third-party service providers who perform
              services for us or on our behalf, including data analysis, email delivery, hosting
              services, and customer service.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base mb-2">4. Do We Use Cookies?</h2>
            <p>
              We may use cookies and similar tracking technologies to access or store information.
              Please see our{" "}
              <a href="/cookies" className="text-forest hover:text-forest-hover">
                Cookie Policy
              </a>{" "}
              for more details on how we use cookies.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base mb-2">
              5. How Long Do We Keep Your Information?
            </h2>
            <p>
              We will only keep your personal information for as long as it is necessary for the
              purposes set out in this privacy notice, unless a longer retention period is required
              or permitted by law. When we have no ongoing legitimate business need to process your
              personal information, we will either delete or anonymize such information.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base mb-2">
              6. How Do We Keep Your Information Safe?
            </h2>
            <p>
              We have implemented appropriate technical and organizational security measures
              designed to protect the security of any personal information we process. Passwords are
              hashed using PBKDF2 with SHA-256. Journal entries are encrypted with field-level
              encryption. However, despite our safeguards, no electronic transmission over the
              Internet or information storage technology can be guaranteed to be 100% secure.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base mb-2">7. What Are Your Privacy Rights?</h2>
            <p>
              In some regions (like the EEA, UK, and Canada), you have certain rights under
              applicable data protection laws. These may include the right to request access to and
              obtain a copy of your personal information, the right to request rectification or
              erasure, the right to restrict processing, and the right to data portability. You may
              delete your account at any time through the Settings page.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base mb-2">8. Do-Not-Track Features</h2>
            <p>
              Most web browsers include a Do-Not-Track (&quot;DNT&quot;) feature or setting you can
              activate to signal your privacy preference. We do not currently respond to DNT browser
              signals or any other mechanism that automatically communicates your choice not to be
              tracked online.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base mb-2">
              9. Do California Residents Have Specific Privacy Rights?
            </h2>
            <p>
              California Civil Code Section 1798.83 permits California residents to request
              information regarding the disclosure of your personal information by us to third
              parties for their direct marketing purposes. If you are a California resident and
              would like to make such a request, please submit your request in writing to
              privacy@tday.co.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base mb-2">
              10. Do We Make Updates to This Notice?
            </h2>
            <p>
              We may update this privacy notice from time to time. The updated version will be
              indicated by an updated &quot;Last updated&quot; date. We encourage you to review this
              privacy notice frequently.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base mb-2">
              11. How Can You Contact Us About This Notice?
            </h2>
            <p>
              If you have questions or comments about this notice, you may email us at{" "}
              <a href="mailto:privacy@tday.co" className="text-forest hover:text-forest-hover">
                privacy@tday.co
              </a>{" "}
              or{" "}
              <a href="mailto:support@tday.co" className="text-forest hover:text-forest-hover">
                support@tday.co
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
