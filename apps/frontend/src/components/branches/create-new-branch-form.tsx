"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createBranchSchema, type CreateBranchFormValues } from "@/lib/schema";
import { useBranch } from "@/hooks/use-branch";
import { GitBranchIcon } from "@/components/icons/mail-icon";
import { Branch } from "@detective-quill/shared-types";

interface CreateNewBranchFormProps {
  projectId: string;
  branches: Branch[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateNewBranchForm = ({
  projectId,
  branches,
  open,
  onOpenChange,
}: CreateNewBranchFormProps) => {
  const activeBranch = branches.find((b) => b.is_active);
  const defaultBranch = branches.find((b) => b.is_default);
  const baseBranch = activeBranch ?? defaultBranch ?? branches[0];
  const parentCommitId = baseBranch?.head_commit_id ?? null;
  const parentBranchId = baseBranch?.id ?? null;

  const form = useForm<CreateBranchFormValues>({
    resolver: zodResolver(createBranchSchema),
    defaultValues: {
      name: "",
      is_default: false,
      description: "",
    },
  });

  const { createBranchMutation } = useBranch({ projectId });
  const isPending = createBranchMutation.isPending;

  const onSubmit = (values: CreateBranchFormValues) => {
    if (!parentCommitId) return;
    createBranchMutation.mutate({ values, parentCommitId, parentBranchId });
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold mystery-title tracking-tight">
            New Branch
          </DialogTitle>
          <p className="text-muted-foreground text-lg mt-0.5">
            Branching from{" "}
            <span className="text-lg font-playfair-display text-background bg-foreground uppercase rounded px-2 ml-2 py-1 w-fit">
              {baseBranch?.name ?? "current branch"}
            </span>
          </p>
        </DialogHeader>

        {!parentCommitId ? (
          <div className="rounded-lg flex items-center justify-center gap-2 border border-dashed border-border bg-muted/30 p-12 text-center">
            <GitBranchIcon />
            <p className="text-muted-foreground">
              No base commit found. Create a commit before branching.
            </p>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[18px] font-medium noir-text">
                      Branch Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="alternate-ending"
                        {...field}
                        disabled={isPending}
                        className="border"
                      />
                    </FormControl>
                    <FormDescription className="text-[1rem]">
                      Choose a descriptive name for your alternate plotline
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[18px] font-medium noir-text">
                      Description
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="A brief description of this branch"
                        {...field}
                        disabled={isPending}
                        className="border"
                      />
                    </FormControl>
                    <FormDescription className="text-[1rem]">
                      Optionally add a description to help you remember the
                      purpose of this branch.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="is_default"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isPending}
                        className="w-6 h-6"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-[18px] font-medium noir-text">
                        Set as default branch
                      </FormLabel>
                      <FormDescription className="text-[1rem]">
                        Make this the primary branch for your project. You can
                        only have one default branch at a time.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { form.reset(); onOpenChange(false); }}
                  disabled={isPending}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending} className="cursor-pointer">
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isPending ? "Creating..." : "Create Branch"}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateNewBranchForm;