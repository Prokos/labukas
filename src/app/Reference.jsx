import { useState } from "react";
import { Icon, PageHeading } from "../components/Controls.jsx";
import {
  alphabet,
  caseColumns,
  nounForms,
  pluralForms,
  pronounForms,
  verbPeople,
  verbForms,
  numeralForms,
} from "../curriculum/reference.js";
export default function StudyReference() {
  const [query, setQuery] = useState("");
  const sections = [
    {
      title: "Alphabet & spelling",
      note: "Č sounds like ch, š like sh, ž like the s in measure. I and u are short; į/y and ų/ū are long. I can also mark a soft consonant before another vowel.",
      headers: ["Capital", "Lowercase", "Letter name"],
      rows: alphabet,
    },
    {
      title: "Noun cases · singular",
      note: "Compare the same noun across the columns. For example: namas → name (in a house).",
      headers: caseColumns,
      rows: nounForms,
    },
    {
      title: "Noun cases · plural",
      note: "Use these alongside the singular forms to compare how endings change.",
      headers: caseColumns,
      rows: pluralForms,
    },
    {
      title: "Personal pronouns",
      note: "For example: aš (I), man (to me), mane (me). Choose the form for the role in the sentence.",
      headers: caseColumns.slice(0, 6),
      rows: pronounForms,
    },
    {
      title: "Verb forms across people",
      note: "Read across a row to compare people; compare rows to look up a tense.",
      headers: ["Verb / tense", ...verbPeople],
      rows: verbForms,
    },
    {
      title: "Numbers & agreement",
      note: "Compare counting, order, and plural numeral forms: vienas, pirmas, vieni.",
      headers: ["Number", "Cardinal", "Ordinal", "Plural numeral"],
      rows: numeralForms,
    },
  ];
  const needle = query.trim().toLocaleLowerCase("lt");
  const visible = sections
    .map((section) => ({
      ...section,
      rows:
        !needle ||
        (section.title + " " + section.headers.join(" "))
          .toLocaleLowerCase("lt")
          .includes(needle)
          ? section.rows
          : section.rows.filter((row) =>
              row.join(" ").toLocaleLowerCase("lt").includes(needle),
            ),
    }))
    .filter((section) => section.rows.length);
  return (
    <>
      <PageHeading
        eyebrow="REFERENCE"
        title="Spelling & grammar"
        subtitle="Find a topic or look up a Lithuanian form."
      />
      <div className="search">
        <Icon name="Search" />
        <input
          aria-label="Search reference"
          placeholder="Try genitive, pronouns, or a word…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="reference-topics">
        {visible.map((section, n) => (
          <details
            key={section.title}
            className="study-reference"
            open={needle ? true : undefined}
          >
            <summary>{section.title}</summary>
            <p>{section.note}</p>
            <div className="reference-scroll">
              <table>
                <thead>
                  <tr>
                    {section.headers.map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {section.rows.map((row, r) => (
                    <tr key={r}>
                      {row.map((cell, c) => (
                        <td key={c} lang="lt">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        ))}
      </div>
      {!visible.length && (
        <p>No matching forms. Try a topic name or another spelling.</p>
      )}
    </>
  );
}
