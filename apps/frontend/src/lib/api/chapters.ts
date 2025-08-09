import { GetChaptersResponse } from "@detective-quill/shared-types";

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
