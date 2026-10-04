"use client";

import Link from "next/link";
import { ideaStageLabels, type IdeaStage } from "@/shared/components/idea-stage";
import { plural } from "../../../zgloszenia/components/submissions-provider";
import { useLoadedCall } from "./call-details-provider";

const dateFormat = new Intl.DateTimeFormat("pl-PL", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });

// Submitted applications: each one expands to its sections and links to the idea it came from.
export function CallApplications() {
  const call = useLoadedCall();
  const count = call.applications.length;

  return (
    <section className="flex flex-col gap-5" aria-labelledby="applications-title">
      <div className="flex flex-col gap-1">
        <h2 id="applications-title" className="text-subtitle font-light text-primary">
          Złożone wnioski
        </h2>
        <p className="text-caption">
          {count} {plural(count, "wniosek", "wnioski", "wniosków")}. Każdy przygotował autor pomysłu z pomocą AI na
          podstawie swojej kanwy.
        </p>
      </div>

      {count === 0 && <p>W tym naborze nikt jeszcze nie złożył wniosku.</p>}

      <ul className="m-0 flex list-none flex-col gap-5 p-0">
        {call.applications.map((application) => (
          <li key={application.id} className="border border-line bg-surface">
            <details className="group">
              <summary className="flex flex-wrap items-baseline justify-between gap-x-5 gap-y-1 p-5">
                <span className="flex flex-col gap-1">
                  <span className="text-card-title font-light">{application.submissionTitle}</span>
                  <span className="text-caption">
                    {application.submissionLocation}
                    {application.submissionStage &&
                      ` · ${ideaStageLabels[application.submissionStage as IdeaStage].toLocaleLowerCase("pl")}`}
                    {application.submittedAt && ` · złożono ${dateFormat.format(new Date(application.submittedAt))}`}
                  </span>
                </span>
                <span className="text-caption font-medium tracking-label-sm text-primary uppercase">
                  <span className="group-open:hidden">Pokaż wniosek</span>
                  <span className="hidden group-open:inline">Zwiń</span>
                </span>
              </summary>
              <div className="flex flex-col gap-5 border-t border-line p-5">
                <dl className="m-0 flex flex-col gap-4">
                  {call.sections.map((section) => (
                    <div key={section.key} className="flex flex-col gap-1">
                      <dt className="text-caption font-medium tracking-label-sm text-primary uppercase">{section.label}</dt>
                      <dd className="m-0 max-w-[70ch] whitespace-pre-wrap">
                        {application.sections[section.key]?.trim() || <span className="text-muted">nie wypełniono</span>}
                      </dd>
                    </div>
                  ))}
                </dl>
                <Link href={`/admin/zgloszenia/${application.submissionId}`} className="self-start text-primary">
                  Zobacz pomysł, kanwę i rozmowę <span aria-hidden="true">→</span>
                </Link>
              </div>
            </details>
          </li>
        ))}
      </ul>
    </section>
  );
}
