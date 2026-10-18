import Image from "next/image";

const faces = [
  { src: "/photos/avatar-1.jpg", alt: "" },
  { src: "/photos/avatar-2.jpg", alt: "" },
  { src: "/photos/avatar-3.jpg", alt: "" },
  { src: "/photos/avatar-4.jpg", alt: "" },
];

const moments = [
  {
    src: "/photos/dinner.jpg",
    alt: "Three plates of food arranged on a wooden table",
    name: "Theo",
    time: "Tuesday, 7:42 pm",
    note: "Dinner, eventually.",
    avatar: "/photos/avatar-2.jpg",
    offset: "",
  },
  {
    src: "/photos/lake.jpg",
    alt: "A wooden boathouse on a still alpine lake",
    name: "Mira",
    time: "Tuesday, 6:08 am",
    note: "No signal. No problem.",
    avatar: "/photos/avatar-1.jpg",
    offset: "lg:mt-10",
  },
  {
    src: "/photos/flowers.jpg",
    alt: "Yellow poppies against a bright blue sky",
    name: "June",
    time: "Tuesday, 4:31 pm",
    note: "Took the long way home.",
    avatar: "/photos/avatar-3.jpg",
    offset: "lg:mt-4",
  },
  {
    src: "/photos/city.jpg",
    alt: "A wide city avenue lined with tall buildings",
    name: "Sam",
    time: "Tuesday, 6:48 pm",
    note: "The city, doing its thing.",
    avatar: "/photos/avatar-4.jpg",
    offset: "lg:mt-16",
  },
];

const principles = [
  {
    title: "Your people, not an audience.",
    body: "Choose a small circle. Share what you want with the people who’ll get it.",
    color: "text-coral",
  },
  {
    title: "The whole day, not the highlight.",
    body: "Coffee, errands, bad lighting. The ordinary is usually the good part.",
    color: "text-butter",
  },
  {
    title: "No scores to keep.",
    body: "No follower counts or engagement games. Just photos, little notes, and being close.",
    color: "text-sky",
  },
];

function Spark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M32 2c2.1 16.3 13.6 27.8 29.9 30C45.6 34.1 34.1 45.6 32 62 29.9 45.6 18.4 34.1 2.1 32 18.4 29.9 29.9 18.4 32 2Z"
        fill="currentColor"
      />
    </svg>
  );
}

function Brand() {
  return (
    <span className="flex items-center gap-2">
      <Spark className="h-6 w-6 text-coral" />
      <span className="font-display text-[1.8rem] font-semibold leading-none tracking-[-0.07em]">
        lark
      </span>
    </span>
  );
}

export default function Home() {
  return (
    <div id="top" className="flex min-h-full flex-col overflow-x-clip">
      <header className="w-full">
        <div className="container-page flex items-center justify-between py-5 lg:py-7">
          <a
            href="#top"
            aria-label="Lark, back to top"
            className="rounded-md"
          >
            <Brand />
          </a>

          <nav
            aria-label="Main navigation"
            className="hidden items-center gap-9 md:flex"
          >
            <a href="#moments" className="nav-link">
              The roll
            </a>
            <a href="#why" className="nav-link">
              Why Lark
            </a>
            <a href="#join" className="nav-link">
              Early access
            </a>
          </nav>

          <a href="#join" className="btn btn--outline btn--small">
            Get early access
          </a>
        </div>
      </header>

      <main className="flex-1">
        <section className="container-page relative">
          <div className="grid gap-16 pb-20 pt-10 sm:pt-14 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:gap-10 lg:pb-28 lg:pt-16">
            <div className="relative z-10">
              <p className="reveal inline-flex items-center gap-2.5 text-sm font-medium text-ink/65">
                <span className="h-2 w-2 rounded-full bg-coral" />
                Now in early access
              </p>

              <h1 className="reveal reveal--d1 mt-5 font-display text-[clamp(3.9rem,8.6vw,7.5rem)] font-bold leading-[0.86] tracking-[-0.07em]">
                Keep the
                <br />
                little
                <br />
                things.
              </h1>

              <p className="reveal reveal--d2 mt-8 max-w-[30rem] text-[1.05rem] leading-[1.6] text-ink/65 sm:text-lg">
                A photo diary for the moments that never make the highlight
                reel: the good light, the messy kitchen, the walk home. Share
                them with the people who get it.
              </p>

              <div className="reveal reveal--d3 mt-8 flex flex-wrap items-center gap-x-7 gap-y-4">
                <a href="#join" className="btn btn--primary">
                  Get early access
                  <span className="btn__dot" aria-hidden="true" />
                </a>
                <a href="#moments" className="quiet-link">
                  See today’s roll
                </a>
              </div>

              <div className="reveal reveal--d4 mt-10 flex flex-wrap items-center gap-x-3 gap-y-2">
                <div className="flex -space-x-2.5">
                  {faces.slice(0, 3).map((face) => (
                    <Image
                      key={face.src}
                      src={face.src}
                      alt={face.alt}
                      width={160}
                      height={160}
                      className="h-8 w-8 rounded-full border-2 border-paper object-cover"
                    />
                  ))}
                </div>
                <p className="text-sm text-ink/65">
                  Join{" "}
                  <span className="font-medium text-ink">12,000 people</span>{" "}
                  keeping the little things.
                </p>
              </div>
            </div>

            <div className="hero-art">
              <div className="hero-art__panel" aria-hidden="true" />

              <Spark className="hero-art__spark" />

              <figure className="hero-photo hero-photo--main">
                <div className="hero-photo__media">
                  <Image
                    src="/photos/friends.jpg"
                    alt="Friends sitting shoulder to shoulder, looking out over the water"
                    fill
                    priority
                    sizes="(max-width: 1023px) 86vw, 44vw"
                    className="object-cover"
                  />
                </div>
              </figure>

              <figure className="hero-photo hero-photo--portrait">
                <div className="hero-photo__media">
                  <Image
                    src="/photos/portrait.jpg"
                    alt="A woman with long brown hair standing in front of a bright blue wall"
                    fill
                    sizes="(max-width: 1023px) 32vw, 16vw"
                    className="object-cover"
                  />
                </div>
                <figcaption className="hero-caption hero-caption--small">
                  the good light.
                </figcaption>
              </figure>

              <figure className="hero-photo hero-photo--forest">
                <div className="hero-photo__media">
                  <Image
                    src="/photos/forest.jpg"
                    alt="Sunlight streaming through an autumn forest"
                    fill
                    sizes="(max-width: 1023px) 42vw, 20vw"
                    className="object-cover"
                  />
                </div>
              </figure>
            </div>
          </div>
        </section>

        <section id="moments" className="scroll-mt-6 border-t border-ink/15">
          <div className="container-page py-20 lg:py-28">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between md:gap-16">
              <h2 className="font-display text-[clamp(2.8rem,5.4vw,4.8rem)] font-semibold leading-[0.94] tracking-[-0.06em]">
                The little things,
                <br />
                lately.
              </h2>
              <p className="max-w-sm text-[0.98rem] leading-7 text-ink/65 md:mb-1">
                A small window into the rolls of the Lark community. No
                trends, no performance. Just what caught someone’s eye.
              </p>
            </div>

            <div className="mt-14 grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 lg:mt-20 lg:grid-cols-4 lg:gap-x-6">
              {moments.map((moment) => (
                <article
                  key={moment.name}
                  className={`group ${moment.offset}`}
                >
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[1.4rem] bg-ink/5">
                    <Image
                      src={moment.src}
                      alt={moment.alt}
                      fill
                      sizes="(max-width: 1023px) 46vw, 22vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]"
                    />
                  </div>

                  <div className="mt-4 flex items-center gap-2.5">
                    <Image
                      src={moment.avatar}
                      alt=""
                      width={160}
                      height={160}
                      className="h-6 w-6 rounded-full object-cover"
                    />
                    <p className="text-[13px] font-medium">{moment.name}</p>
                    <p className="hidden text-[13px] text-ink/65 sm:block">
                      {moment.time}
                    </p>
                  </div>

                  <p className="mt-2 max-w-[15rem] font-display text-[1.15rem] font-medium leading-snug tracking-[-0.02em]">
                    {moment.note}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          id="why"
          className="relative scroll-mt-6 overflow-hidden bg-ink text-paper"
        >
          <Spark className="absolute -right-28 top-16 h-[30rem] w-[30rem] rotate-12 text-paper/[0.035]" />

          <div className="container-page relative grid gap-16 py-20 lg:grid-cols-[0.92fr_1.08fr] lg:gap-24 lg:py-32">
            <div>
              <h2 className="max-w-[35rem] font-display text-[clamp(2.8rem,5.4vw,4.8rem)] font-semibold leading-[0.94] tracking-[-0.06em]">
                A quieter
                <br />
                kind of social.
              </h2>
              <p className="mt-8 max-w-[29rem] text-[1.02rem] leading-7 text-paper/60">
                You don’t need another place to perform. Lark is for the
                photos you take for no one in particular: the morning light,
                the half-finished dinner, the walk home. Share them with a
                circle you actually know.
              </p>
            </div>

            <div className="lg:pt-2">
              {principles.map((principle, index) => (
                <div
                  key={principle.title}
                  className={`flex gap-5 border-t border-paper/20 py-7 lg:py-8 ${
                    index === principles.length - 1 ? "border-b" : ""
                  }`}
                >
                  <Spark
                    className={`mt-1.5 h-5 w-5 shrink-0 ${principle.color}`}
                  />
                  <div>
                    <h3 className="font-display text-[1.5rem] font-medium tracking-[-0.03em]">
                      {principle.title}
                    </h3>
                    <p className="mt-2.5 max-w-md text-[0.97rem] leading-7 text-paper/55">
                      {principle.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="join"
          className="relative scroll-mt-6 overflow-hidden bg-coral text-ink"
        >
          <div
            className="absolute -right-40 -top-48 h-[34rem] w-[34rem] rounded-full border border-ink/15"
            aria-hidden="true"
          />
          <div
            className="absolute -right-12 top-16 h-[18rem] w-[18rem] rounded-full border border-ink/15"
            aria-hidden="true"
          />
          <Spark className="absolute -bottom-20 -left-20 h-80 w-80 -rotate-12 text-ink/[0.055]" />

          <div className="container-page relative z-10 grid gap-12 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:gap-20 lg:py-28">
            <div>
              <p className="flex items-center gap-2.5 text-sm font-medium text-ink/85">
                <Spark className="h-3.5 w-3.5" />
                Now in early access
              </p>
              <h2 className="mt-6 max-w-[49rem] font-display text-[clamp(2.9rem,5.8vw,5.5rem)] font-semibold leading-[0.92] tracking-[-0.065em]">
                Save a little room for the little things.
              </h2>
            </div>

            <div className="lg:pb-2">
              <p className="max-w-md text-[1rem] leading-7 text-ink">
                Lark is opening slowly. Leave your email and we’ll save you a
                spot with the first group.
              </p>

              <div className="join-field mt-6">
                <label htmlFor="email" className="sr-only">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                />
                <button type="button">Request an invite</button>
              </div>

              <p className="mt-3 text-sm text-ink/85">
                No noise. Just a note when it’s your turn.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-paper">
        <div className="container-page py-12 lg:py-16">
          <div className="flex flex-col justify-between gap-12 sm:flex-row sm:gap-8">
            <div className="max-w-xs">
              <a href="#top" aria-label="Lark, back to top" className="rounded-md">
                <Brand />
              </a>
              <p className="mt-4 text-sm leading-6 text-ink/65">
                A small place for the everyday.
              </p>
            </div>

            <div className="flex gap-14 sm:gap-24">
              <nav aria-label="Footer navigation" className="flex flex-col gap-3">
                <p className="mb-1 text-sm font-semibold">Explore</p>
                <a href="#moments" className="footer-link">
                  The roll
                </a>
                <a href="#why" className="footer-link">
                  Why Lark
                </a>
                <a href="#join" className="footer-link">
                  Early access
                </a>
              </nav>

              <div className="flex flex-col gap-3">
                <p className="mb-1 text-sm font-semibold">Say hello</p>
                <a href="mailto:hi@lark.app" className="footer-link">
                  hi@lark.app
                </a>
                <p className="max-w-[11rem] text-sm leading-6 text-ink/65">
                  We read every note.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-2 border-t border-ink/15 pt-6 text-sm text-ink/65 sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 Lark</p>
            <p>Made for the moments in between.</p>
          </div>
        </div>
      </footer>

      <div className="page-grain" aria-hidden="true" />
    </div>
  );
}
