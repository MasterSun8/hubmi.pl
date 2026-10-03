"use client";

import type { ReactNode } from "react";
import { useLoadedInitiative } from "./initiative-provider";

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2.5">
      <h2 className="text-caption font-medium tracking-label-sm uppercase">{title}</h2>
      {children}
    </section>
  );
}

// What the innovation is, who it is for, who can implement it and whether it works.
export function InitiativeDescription() {
  const initiative = useLoadedInitiative();

  return (
    <div className="flex flex-col gap-7.5">
      <h2 className="text-subtitle font-light">Opis</h2>
      <p className="-mt-5 max-w-[65ch] whitespace-pre-wrap">{initiative.description}</p>
      {initiative.problem && (
        <Block title="Na jaki problem odpowiada">
          <p className="max-w-[65ch] whitespace-pre-wrap">{initiative.problem}</p>
        </Block>
      )}
      {initiative.targetGroups.length > 0 && (
        <Block title="Dla kogo">
          <ul className="m-0 max-w-[65ch] list-disc pl-5">
            {initiative.targetGroups.map((group) => (
              <li key={group}>{group}</li>
            ))}
          </ul>
        </Block>
      )}
      {initiative.implementers && (
        <Block title="Kto może wdrożyć">
          <p className="max-w-[65ch] whitespace-pre-wrap">{initiative.implementers}</p>
        </Block>
      )}
      {initiative.effectiveness && (
        <Block title="Czy to działa">
          <p className="max-w-[65ch] whitespace-pre-wrap">{initiative.effectiveness}</p>
        </Block>
      )}
      {initiative.requiredResources && (
        <Block title="Potrzebne zasoby">
          <p className="max-w-[65ch] whitespace-pre-wrap">{initiative.requiredResources}</p>
        </Block>
      )}
    </div>
  );
}
