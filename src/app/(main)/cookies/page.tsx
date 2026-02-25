export default function CookiesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="bg-white rounded-2xl border border-warm-border/30 shadow-card p-6 lg:p-8">
        <h1 className="text-xl font-bold text-warm-brown mb-1">Cookie Policy</h1>
        <p className="text-xs text-warm-gray mb-6">Last updated December 8, 2023</p>

        <div className="text-sm text-warm-brown leading-relaxed space-y-5">
          <p>
            This Cookie Policy explains how t&apos;day (&quot;Company,&quot; &quot;we,&quot;
            &quot;us,&quot; or &quot;our&quot;) uses cookies and similar technologies to recognize
            you when you visit our website at{" "}
            <a href="https://www.tday.co" className="text-forest hover:text-forest-hover">
              https://www.tday.co
            </a>{" "}
            (&quot;Website&quot;). It explains what these technologies are and why we use them, as
            well as your rights to control our use of them.
          </p>

          <section>
            <h2 className="font-semibold text-base mb-2">What are cookies?</h2>
            <p>
              Cookies are small data files that are placed on your computer or mobile device when
              you visit a website. Cookies are widely used by website owners in order to make their
              websites work, or to work more efficiently, as well as to provide reporting
              information.
            </p>
            <p className="mt-2">
              Cookies set by the website owner (in this case, t&apos;day) are called &quot;first
              party cookies.&quot; Cookies set by parties other than the website owner are called
              &quot;third party cookies.&quot; Third party cookies enable third party features or
              functionality to be provided on or through the website (e.g., interactive content and
              analytics).
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base mb-2">Why do we use cookies?</h2>
            <p>
              We use first and third party cookies for several reasons. Some cookies are required
              for technical reasons in order for our Website to operate, and we refer to these as
              &quot;essential&quot; or &quot;strictly necessary&quot; cookies. Third parties serve
              cookies through our Website for analytics and other purposes.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base mb-2">Essential cookies we use</h2>
            <div className="bg-cream-light rounded-xl p-4 space-y-3 mt-2">
              <div>
                <p className="font-semibold text-xs text-warm-gray uppercase tracking-wide">
                  Session Cookie
                </p>
                <p className="text-xs mt-1">
                  Used for authentication to keep you logged in. This is an essential cookie
                  required for the site to function. It expires when your session ends or after a
                  set period.
                </p>
              </div>
              <div>
                <p className="font-semibold text-xs text-warm-gray uppercase tracking-wide">
                  Timezone Cookie
                </p>
                <p className="text-xs mt-1">
                  Used to track the current date in your local timezone so your daily rating
                  matches your actual day. This is a session-based cookie.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-semibold text-base mb-2">
              What about other tracking technologies?
            </h2>
            <p>
              Cookies are not the only way to recognize or track visitors to a website. We may use
              other, similar technologies from time to time, like web beacons (sometimes called
              &quot;tracking pixels&quot; or &quot;clear gifs&quot;). These are tiny graphics files
              that contain a unique identifier that enable us to recognize when someone has visited
              our Website or opened an email.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base mb-2">How can you control cookies?</h2>
            <p>
              You have the right to decide whether to accept or reject cookies. You can set or
              amend your web browser controls to accept or refuse cookies. If you choose to reject
              cookies, you may still use our Website though your access to some functionality and
              areas of our Website may be restricted.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base mb-2">
              How often will we update this Cookie Policy?
            </h2>
            <p>
              We may update this Cookie Policy from time to time in order to reflect changes to the
              cookies we use or for other operational, legal, or regulatory reasons. Please revisit
              this Cookie Policy regularly to stay informed about our use of cookies and related
              technologies.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base mb-2">Where can I get further information?</h2>
            <p>
              If you have any questions about our use of cookies or other technologies, please
              email us at{" "}
              <a href="mailto:info@tday.co" className="text-forest hover:text-forest-hover">
                info@tday.co
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
