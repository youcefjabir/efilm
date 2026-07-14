import { Suspense } from "react";

import { env } from "@/lib/env";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="page" style={{ maxWidth: 420, paddingTop: "12vh" }}>
      <h1>{env.appName}</h1>
      <p className="muted">Private studio. Sign in with your owner email.</p>
      <div className="panel" style={{ marginTop: 18 }}>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
      <p className="faint" style={{ marginTop: 14 }}>
        Access is limited to the configured owner account. Magic link sign-in;
        no passwords are stored.
      </p>
    </div>
  );
}
