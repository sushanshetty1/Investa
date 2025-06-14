import React, { Suspense } from "react";
import ResetPasswordConfirmation from "./ResetPasswordConfirmation";

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ResetPasswordConfirmation />
    </Suspense>
  );
}
