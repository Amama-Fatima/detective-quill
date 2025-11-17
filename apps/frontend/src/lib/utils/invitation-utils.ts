export const validateEmails = (
  emails: string[],
  notAllowedEmails: string[]
) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Normalize: trim + lowercase to avoid case-variant duplicates
  const cleaned = emails.map((e) => e.trim().toLowerCase());

  const invalidEmails = cleaned.filter(
    (email) => !emailRegex.test(email) || notAllowedEmails.includes(email)
  );

  // Valid = everything not in invalid
  const valid = cleaned.filter(
    (email) => emailRegex.test(email) && !notAllowedEmails.includes(email)
  );

  // Remove duplicates using Set
  const uniqueValid = Array.from(new Set(valid));

  return {
    validEmails: uniqueValid,
    invalidEmails,
  };
};
