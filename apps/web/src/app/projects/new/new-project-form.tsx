"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function NewProjectForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [propertyType, setPropertyType] = useState("auto");
  const [lengthPreference, setLengthPreference] = useState("auto");
  const [customLength, setCustomLength] = useState(35);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          address: address || undefined,
          propertyType,
          lengthPreference,
          customLengthSeconds: lengthPreference === "custom" ? customLength : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not create project");
      router.push(`/projects/${data.project.id}/analysis`);
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <label className="field">
        <span className="lbl">Project name *</span>
        <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Storgatan 12" />
      </label>
      <label className="field">
        <span className="lbl">Address (optional)</span>
        <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} />
      </label>
      <label className="field">
        <span className="lbl">Property type</span>
        <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)}>
          <option value="auto">Auto-detect</option>
          <option value="apartment">Apartment</option>
          <option value="house">House / villa</option>
          <option value="townhouse">Townhouse</option>
          <option value="vacation_home">Vacation home</option>
          <option value="new_construction">New construction</option>
        </select>
      </label>
      <label className="field">
        <span className="lbl">Film length</span>
        <select value={lengthPreference} onChange={(e) => setLengthPreference(e.target.value)}>
          <option value="auto">Auto (recommended)</option>
          <option value="short">Short (~15 s)</option>
          <option value="normal">Normal (~35 s)</option>
          <option value="long">Long (~55 s)</option>
          <option value="custom">Custom</option>
        </select>
      </label>
      {lengthPreference === "custom" && (
        <label className="field">
          <span className="lbl">Approximate length: {customLength}s</span>
          <input
            type="range"
            min={10}
            max={90}
            value={customLength}
            onChange={(e) => setCustomLength(Number(e.target.value))}
          />
        </label>
      )}
      {error && <p className="error-text">{error}</p>}
      <button className="btn primary" disabled={busy} type="submit">
        {busy ? "Creating…" : "Create project"}
      </button>
    </form>
  );
}
