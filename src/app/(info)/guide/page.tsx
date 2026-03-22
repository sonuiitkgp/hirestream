import { Upload, User, Search, MessageCircle, Briefcase, Users, Eye, Settings, MessageSquareDiff, Compass, Bell } from "lucide-react";

function Section({ icon: Icon, title, children }: { icon: typeof Upload; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-3">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <h2 className="text-base font-semibold">{title}</h2>
      </div>
      <div className="text-sm text-muted-foreground leading-relaxed space-y-2 pl-12">
        {children}
      </div>
    </div>
  );
}

export default function GuidePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">User Guide</h1>
        <p className="text-sm text-muted-foreground">
          Everything you need to know to get the most out of HireStream.
        </p>
      </div>

      {/* Getting Started */}
      <div className="space-y-1">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">Getting Started</h2>
      </div>

      <Section icon={Upload} title="Upload Your Resume">
        <p>
          Head to <strong>My Profile</strong> and click the upload button. Upload your resume as a PDF (max 10MB).
          Our AI will automatically extract your experience, projects, education, skills, and more into a structured profile.
        </p>
        <p>
          You can choose to <strong>merge</strong> (fill in empty fields only) or <strong>replace</strong> (overwrite existing data) when uploading.
        </p>
      </Section>

      <Section icon={User} title="Edit Your Profile">
        <p>
          After the AI parses your resume, review and refine your profile. You can manually edit any section:
          experience, projects, internships, education, extra-curriculars, and more.
        </p>
        <p>
          Add links to your LinkedIn, GitHub, and personal website. Set a compelling headline and bio.
        </p>
      </Section>

      <Section icon={Eye} title="Profile Visibility">
        <p>
          Control who sees your profile from <strong>Settings</strong>:
        </p>
        <ul className="list-disc pl-4 space-y-1">
          <li><strong>Public</strong> &mdash; Visible to everyone and searchable by recruiters</li>
          <li><strong>Private</strong> &mdash; Only visible to people with your share link</li>
          <li><strong>Hidden</strong> &mdash; Not visible to anyone except you</li>
        </ul>
        <p>
          Your shareable profile link (found in Settings) lets you share your profile with specific people regardless of visibility settings.
        </p>
      </Section>

      {/* For Job Seekers */}
      <div className="space-y-1 pt-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">For Job Seekers</h2>
      </div>

      <Section icon={Compass} title="Discover People">
        <p>
          The <strong>Discover</strong> page shows profiles similar to yours using AI-powered semantic matching.
          You can also search by skills, technologies, or describe the kind of person you&apos;re looking for.
        </p>
        <p>
          Click on any profile to view it, or use the message button to start a conversation.
        </p>
      </Section>

      <Section icon={MessageCircle} title="Peer Reviews">
        <p>
          Visit other people&apos;s public profiles to leave constructive comments on specific sections.
          Comments can be accepted or declined by the profile owner.
        </p>
        <p>
          Your received comments appear in <strong>Peer Reviews</strong> in the sidebar.
        </p>
      </Section>

      <Section icon={MessageSquareDiff} title="Suggestions">
        <p>
          On any public profile, you can suggest edits to text fields — similar to Google Docs suggestions.
          Select text or use the suggest button to propose changes.
        </p>
        <p>
          When the profile owner accepts a suggestion, their profile is automatically updated with the suggested text.
          View your received suggestions in <strong>Suggestions</strong> in the sidebar.
        </p>
      </Section>

      <Section icon={Users} title="Messaging">
        <p>
          You can message anyone on the platform — other job seekers for networking and collaboration,
          or recruiters who reach out to you. All conversations are in your <strong>Mailbox</strong>.
        </p>
        <p>
          Start a conversation from someone&apos;s profile page, from search results, or from the Discover page.
        </p>
      </Section>

      {/* For Recruiters */}
      <div className="space-y-1 pt-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">For Recruiters</h2>
      </div>

      <Section icon={Search} title="Search Talent">
        <p>
          Describe the candidate you&apos;re looking for in natural language — &ldquo;React developer with 3 years experience&rdquo;
          or &ldquo;ML engineer familiar with PyTorch and computer vision&rdquo;. Our AI finds the best matches using semantic search.
        </p>
        <p>
          Results are ranked by relevance. Click a profile to view it, or message candidates directly from search results.
        </p>
      </Section>

      <Section icon={Briefcase} title="Post Jobs">
        <p>
          Go to <strong>My Jobs</strong> to create job postings with title, description, requirements, location, and salary range.
          Each job is automatically embedded by AI for matching.
        </p>
        <p>
          Click the <strong>people icon</strong> on any job card to find matching profiles — candidates are ranked by how well
          their profile matches your job requirements. You can message top matches directly.
        </p>
      </Section>

      <Section icon={Settings} title="Switch Roles">
        <p>
          HireStream supports dual roles. Use the <strong>Switch Role</strong> button in the sidebar to toggle
          between Job Seeker and Recruiter views. You can use both roles with the same account.
        </p>
      </Section>

      {/* Notifications */}
      <div className="space-y-1 pt-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">Staying Updated</h2>
      </div>

      <Section icon={Bell} title="Notifications">
        <p>
          The notification bell in the sidebar keeps you updated on:
        </p>
        <ul className="list-disc pl-4 space-y-1">
          <li>New messages from recruiters or peers</li>
          <li>Comments and replies on your profile</li>
          <li>Suggestions on your profile (accepted/declined)</li>
          <li>Profile views</li>
        </ul>
        <p>
          Click the bell to see recent notifications, or visit the full <strong>Notifications</strong> page
          for your complete history with filtering options.
        </p>
      </Section>
    </div>
  );
}
