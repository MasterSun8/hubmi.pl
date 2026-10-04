"use client";

import Link from "next/link";
import { useLoadedSubmission } from "./submission-details-provider";

const dateFormat = new Intl.DateTimeFormat("pl-PL", { day: "numeric", month: "long", year: "numeric" });

// Grant applications the author submitted for this idea; the call page shows their content.
export function GrantApplications() {
  const { applications } = useLoadedSubmission();
  if (applications.length === 0) return null;

  return (
    <section className="flex flex-col gap-5 border-b border-line pb-7.5" aria-labelledby="applications-title">
      <h2 id="applications-title" className="text-subtitle font-light">
        Wnioski w naborach
      </h2>
      <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
        {applications.map((application) => (
          <li key={application.id}>
            <Link href={`/admin/nabory/${application.callId}`} className="text-primary">
              {application.callTitle}
            </Link>
            {application.submittedAt && (
              <span className="text-caption"> · złożono {dateFormat.format(new Date(application.submittedAt))}</span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
