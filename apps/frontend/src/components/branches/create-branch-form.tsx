"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { GitBranch, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createBranch } from "@/lib/backend-calls/branches";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CreateBranchDto } from "@detective-quill/shared-types";
import { createBranchSchema, type CreateBranchFormValues } from "@/lib/schema";

interface CreateBranchBtnProps {
  projectId: string;
  parentCommitId: string; // The current HEAD commit of the branch we're branching from
}

const CreateBranchBtn = ({
  projectId,
  parentCommitId,
}: CreateBranchBtnProps) => {
  const [open, setOpen] = useState(false);
  const { session } = useAuth();
  const accessToken = session?.access_token || "";
  const queryClient = useQueryClient();

  const form = useForm<CreateBranchFormValues>({
    resolver: zodResolver(createBranchSchema),
    defaultValues: {
      name: "",
      is_default: false,
      description: "",
    },
  });

  const { mutate: createBranchMutate, isPending } = useMutation({
    mutationFn: async (values: CreateBranchFormValues) => {
      const dto: CreateBranchDto = {
        name: values.name,
        is_default: values.is_default,
        parent_commit_id: parentCommitId,
      };
      return await createBranch(projectId, dto, accessToken);
    },
    onSuccess: (data) => {
      toast.success(`Branch created successfully`);
      queryClient.invalidateQueries({ queryKey: ["branches", projectId] });
      setOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast.error(`Failed to create branch: ${error.message}`);
    },
  });

  const onSubmit = (values: CreateBranchFormValues) => {
    createBranchMutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="cursor-pointer">
          <GitBranch className="w-4 h-4 mr-2" />
          Create Branch
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Branch</DialogTitle>
          <DialogDescription>
            Create a new branch to explore alternate storylines or plot
            directions without affecting your main manuscript.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Branch Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="alternate-ending"
                      {...field}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormDescription>
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
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="A brief description of this branch"
                      {...field}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormDescription>
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
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Set as default branch</FormLabel>
                    <FormDescription>
                      Make this the primary branch for your project. You can
                      only have one default branch at a time.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  form.reset();
                }}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Branch
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateBranchBtn;
