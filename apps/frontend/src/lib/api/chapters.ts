import {
  CreateChapterDto,
  CreateChapterResponse,
  GetChaptersResponse,
  UpdateChapterDto,
  UpdateChapterResponse,
} from "@detective-quill/shared-types";

export async function getChapters(
  projectTitle: string,
  accessToken: string
): Promise<GetChaptersResponse> {
  const response = await fetch(
    `http://localhost:3001/chapters?projectTitle=${encodeURIComponent(
      projectTitle
    )}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch chapters: ${response.statusText}`);
  }

  return response.json();
}

export async function createChapter(
  chapterData: CreateChapterDto,
  accessToken: string
): Promise<CreateChapterResponse> {
  const response = await fetch("http://localhost:3001/chapters", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(chapterData),
  });

  if (!response.ok) {
    throw new Error(`Failed to create chapter: ${response.statusText}`);
  }

  return response.json();
}

export async function updateChapter(
  chapterId: string,
  updateData: Omit<UpdateChapterDto, "id">,
  accessToken: string
): Promise<UpdateChapterResponse> {
  const response = await fetch(`http://localhost:3001/chapters/${chapterId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updateData),
  });

  if (!response.ok) {
    throw new Error(`Failed to update chapter: ${response.statusText}`);
  }

  return response.json();
}

export async function deleteChapter(
  chapterId: string,
  accessToken: string
): Promise<{ success: boolean; message?: string }> {
  const response = await fetch(`http://localhost:3001/chapters/${chapterId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to delete chapter: ${response.statusText}`);
  }

  return response.json();
}
