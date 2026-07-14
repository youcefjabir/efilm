import { NewProjectForm } from "./new-project-form";

export default function NewProjectPage() {
  return (
    <div className="page" style={{ maxWidth: 560 }}>
      <h1>New project</h1>
      <p className="muted">Create the project, then upload photos in any order.</p>
      <div className="panel" style={{ marginTop: 16 }}>
        <NewProjectForm />
      </div>
    </div>
  );
}
