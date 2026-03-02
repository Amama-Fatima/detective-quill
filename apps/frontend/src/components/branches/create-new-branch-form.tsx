"use client";

import React from "react";
import { Button } from "@/components/ui/button";
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
import { useRouter } from "next/navigation";

interface CreateBranchFormProps {
  projectId: string;
  parentCommitId: string; // The current HEAD commit of the branch we're branching from
}

const CreateNewBranchForm = ({
  projectId,
  parentCommitId,
}: CreateBranchFormProps) => {
  const router = useRouter();
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
    createBranchMutation.mutate({ values, parentCommitId });
    form.reset();
    router.push(`/workspace/${projectId}/version-control`);
  };

  // const { mutate: createBranchMutate, isPending } = useMutation({
  //   mutationFn: async (values: CreateBranchFormValues) => {
  //     const dto: CreateBranchDto = {
  //       name: values.name,
  //       is_default: values.is_default,
  //       parent_commit_id: parentCommitId,
  //     };
  //     return await createBranch(projectId, dto, accessToken);
  //   },
  //   onSuccess: (data) => {
  //     toast.success(`Branch created successfully`);
  //     queryClient.invalidateQueries({ queryKey: ["branches", projectId] });
  //     form.reset();
  //   },
  //   onError: (error: Error) => {
  //     toast.error(`Failed to create branch: ${error.message}`);
  //   },
  // });

  return (
    <div className="sm:max-w-[800px] shadow-lg bg-card p-6 rounded-lg">
      <div>
        <h1 className="text-2xl font-semibold mystery-title tracking-tight">
          Create New Branch{" "}
        </h1>
        <p className="text-muted-foreground text-[1rem] mt-2">
          Create a new branch to explore alternate storylines or plot directions
          without affecting your main manuscript.
        </p>
      </div>

      <div className="mt-8">
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
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                form.reset();
              }}
              disabled={isPending}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="cursor-pointer ml-4"
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPending ? "Creating..." : "Create Branch"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default CreateNewBranchForm;
