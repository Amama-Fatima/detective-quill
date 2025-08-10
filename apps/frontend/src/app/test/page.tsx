"use client";

import { createChapter, getChapters } from "@/lib/api/chapters";
import { createSupabaseBrowserClient } from "@/supabase/browser-client";
import {
  ChapterWithProject,
  CreateChapterDto,
} from "@detective-quill/shared-types";
import React, { useEffect, useState } from "react";

const chapterData: CreateChapterDto = {
  projectTitle: "and",
  title: "New Chapter",
  content: "This is the content of the new chapter.",
  chapterOrder: 5,
};

const TestPage = () => {
  const supabaseBrowserClient = createSupabaseBrowserClient();
  const [session, setSession] = useState<any | null>(null);
  const [chapters, setChapters] = useState<any | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    async function getSession() {
      try {
        const { data, error } = await supabaseBrowserClient.auth.getSession();
        console.log("Session:", data.session);
        setSession(data.session as any);
      } catch (error) {
        console.error("Error fetching session:", error);
      }
    }
    getSession();
  }, []);

  useEffect(() => {
    if (!session) {
      // throw new Error("No access token available");
      console.log("No access token available");
      return;
    }

    const fetchChapters = async () => {
      setError("");

      try {
        const response = await createChapter(chapterData, session.access_token);
        console.log("Create Chapter Response:", response);

        if (response.success) {
          setChapters(response.data);
        } else {
          setError(response.message || "Failed to fetch chapters");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      }
    };
    // console.log("Access Token:", session.access_token);
    fetchChapters();
  }, [session]);

  useEffect(() => {
    console.log("Chapters:", chapters);
  }, [chapters]);
  return <div>Test: {JSON.stringify(session)}</div>;
};

export default TestPage;
