"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type QueryInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading?: boolean;
};

export const QueryInput = ({
  value,
  onChange,
  onSubmit,
  isLoading = false,
}: QueryInputProps) => {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Ask about this manuscript..."
        className="h-9"
      />
      <Button type="submit" size="sm" disabled={isLoading} className="h-9 px-4 cursor-pointer hover:bg-primary/90 ">
        {isLoading ? "Asking..." : "Ask"}
      </Button>
    </form>
  );
};
