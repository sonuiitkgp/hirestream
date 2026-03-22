import { Zap, Brain, Users, MessageCircle, Search, Shield, Sparkles } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 p-4 md:p-6">
      {/* Hero */}
      <div className="text-center space-y-3">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto">
          <Zap className="h-7 w-7" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">About HireStream</h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          An AI-powered talent platform that makes hiring smarter and job searching more collaborative.
        </p>
      </div>

      {/* Mission */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-3">
        <h2 className="text-lg font-semibold">Our Mission</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          HireStream bridges the gap between talented professionals and the right opportunities.
          We believe that finding the right job or the right candidate shouldn&apos;t be a needle-in-a-haystack
          exercise. By combining AI-powered semantic matching with peer collaboration, we create a
          platform where profiles improve through community feedback and recruiters find exactly
          who they&apos;re looking for.
        </p>
      </div>

      {/* Features grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">What Makes Us Different</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            {
              icon: Brain,
              title: "AI Resume Parsing",
              desc: "Upload your resume and our AI extracts structured data instantly, building a rich searchable profile.",
            },
            {
              icon: Search,
              title: "Semantic Talent Search",
              desc: "Recruiters search by describing what they need in natural language. AI matches profiles by meaning, not just keywords.",
            },
            {
              icon: Users,
              title: "Peer Reviews & Suggestions",
              desc: "Community members can review profiles and suggest improvements, like Google Docs-style inline editing.",
            },
            {
              icon: MessageCircle,
              title: "Direct Messaging",
              desc: "Job seekers and recruiters can communicate directly. Job seekers can also connect and collaborate with peers.",
            },
            {
              icon: Sparkles,
              title: "Smart Job Matching",
              desc: "When recruiters post jobs, AI ranks candidate profiles by relevance, surfacing the best matches instantly.",
            },
            {
              icon: Shield,
              title: "Privacy Controls",
              desc: "Control your profile visibility. Share publicly, keep it private, or use shareable links for specific audiences.",
            },
          ].map((feature) => (
            <div key={feature.title} className="rounded-lg border border-border bg-card p-4 space-y-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <feature.icon className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-semibold">{feature.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">How It Works</h2>
        <div className="space-y-3">
          {[
            { step: "1", title: "Create your profile", desc: "Sign up and upload your resume. AI parses it into a structured, searchable profile." },
            { step: "2", title: "Get discovered", desc: "Your profile is embedded with AI, making you discoverable through semantic search by recruiters and peers." },
            { step: "3", title: "Improve with peer feedback", desc: "Community members can suggest edits and leave comments to help you present your best self." },
            { step: "4", title: "Connect directly", desc: "Recruiters reach out with opportunities. Job seekers collaborate and network with each other." },
          ].map((item) => (
            <div key={item.step} className="flex gap-4 items-start">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                {item.step}
              </div>
              <div>
                <h3 className="text-sm font-semibold">{item.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tech */}
      <div className="rounded-xl border border-border bg-muted/30 p-6 space-y-3">
        <h2 className="text-lg font-semibold">Built With</h2>
        <div className="flex flex-wrap gap-2">
          {["Next.js", "React", "TypeScript", "Prisma", "PostgreSQL", "pgvector", "Gemini AI", "Groq", "NextAuth", "Tailwind CSS"].map((tech) => (
            <span key={tech} className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              {tech}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
