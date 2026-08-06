"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button className="button" type="button" onClick={() => signOut({ callbackUrl: "/login" })}>
      Đăng xuất
    </button>
  );
}
