"use client";

import { createSupabaseBrowserClient } from "@/supabase/browser-client";
import React, { useEffect } from "react";

const supabaseBrowserClient = createSupabaseBrowserClient();

const Test = () => {
  const [session, setSession] = React.useState(null);
  useEffect(() => {
    async function getSession() {
      try {
        const { data: session, error } =
          await supabaseBrowserClient.auth.getSession();
        console.log("Session:", session);
        setSession(session as any);
      } catch (error) {
        console.error("Error fetching session:", error);
      }
    }
    getSession();
  }, []);
  return <div>Test: {JSON.stringify(session)}</div>;
};

export default Test;
