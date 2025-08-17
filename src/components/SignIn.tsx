import React from "react";
import { signIn } from "next-auth/react";

const SignIn = () => {
  return (
    <form
      action={async () => {
        await signIn("google");
      }}
    >
      <button type="submit">Sign In</button>
    </form>
  );
};

export default SignIn;
