"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { useIndicators } from "./indicators-provider";

const MAX_RESULTS = 8;

// Figma 15:1206 (field) and 15:1327 (open results list): searching replaces fixed tabs,
// because the database holds well over a hundred indicators.
export function IndicatorSearch() {
  const { indicators, selected, select, status } = useIndicators();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const optionId = (index: number) => `${listId}-option-${index}`;

  const phrase = query.trim().toLocaleLowerCase("pl");
  const matches = phrase
    ? indicators.filter((indicator) =>
        `${indicator.name} ${indicator.category}`.toLocaleLowerCase("pl").includes(phrase),
      )
    : indicators;
  const results = matches.slice(0, MAX_RESULTS);

  function choose(name: string) {
    select(name);
    setQuery("");
    setOpen(false);
    inputRef.current?.blur();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActive((index) => Math.min(index + 1, results.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter" && open && results[active]) {
      event.preventDefault();
      choose(results[active].name);
    } else if (event.key === "Escape") {
      setQuery("");
      setOpen(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-x-7.5 gap-y-2.5">
      <div className="relative w-110 max-w-full">
        <label htmlFor={`${listId}-input`} className="sr-only">
          Wyszukaj wskaźnik
        </label>
        <div className="flex h-10 items-center gap-2.5 rounded-input border border-field px-5 transition-colors focus-within:border-primary">
          <svg viewBox="0 0 16 16" fill="none" className="size-4 flex-none" aria-hidden="true">
            <circle cx="7" cy="7" r="5.25" stroke="currentColor" strokeWidth="1.5" />
            <path d="M11 11L14.5 14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            id={`${listId}-input`}
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={open && results[active] ? optionId(active) : undefined}
            disabled={status !== "ready"}
            className="min-w-0 flex-1 bg-transparent text-ink placeholder:text-ink focus:outline-none"
            placeholder={selected?.name ?? "Ładowanie wskaźników…"}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setOpen(false)}
            onKeyDown={handleKeyDown}
          />
          <svg viewBox="0 0 12 12" fill="none" className="size-3 flex-none" aria-hidden="true">
            <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {open && (
          <div className="absolute top-full left-0 z-10 mt-2 w-full bg-surface p-5 shadow-dialog hc:border hc:border-line">
            <p className="text-caption font-medium tracking-label-sm uppercase">
              {phrase ? `Pasujące wskaźniki · ${matches.length} z ${indicators.length}` : `Wskaźniki · ${indicators.length}`}
            </p>
            <ul id={listId} role="listbox" aria-label="Wskaźniki" className="m-0 mt-1 list-none p-0">
              {results.map((indicator, index) => (
                <li
                  key={indicator.name}
                  id={optionId(index)}
                  role="option"
                  aria-selected={index === active}
                  // mousedown keeps focus in the input, so the list does not close before the click lands.
                  onMouseDown={(event) => {
                    event.preventDefault();
                    choose(indicator.name);
                  }}
                  onMouseEnter={() => setActive(index)}
                  className="flex cursor-pointer items-baseline justify-between gap-5 border-t border-line/40 py-2 aria-selected:text-primary"
                >
                  <span>{indicator.name}</span>
                  <span className="flex-none text-caption text-muted">{indicator.category.toLocaleLowerCase("pl")}</span>
                </li>
              ))}
              {results.length === 0 && <li className="border-t border-line/40 py-2">Brak wskaźników dla „{query}”.</li>}
            </ul>
            {matches.length > results.length && (
              <p className="mt-1 text-caption text-muted">
                + {matches.length - results.length} więcej — doprecyzuj wyszukiwanie
              </p>
            )}
          </div>
        )}
      </div>
      <p className="text-caption">
        {status === "ready" ? `${indicators.length} wskaźników w bazie · wpisz, aby wyszukać` : ""}
      </p>
    </div>
  );
}
