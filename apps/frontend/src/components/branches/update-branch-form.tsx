"use client";

import React, { useEffect, useState } from "react";
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
import { Loader2, Pencil } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateBranch } from "@/lib/backend-calls/branches";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { Branch, UpdateBranchDto } from "@detective-quill/shared-types";
import { updateBranchSchema } from "@/lib/schema";

type UpdateBranchFormValues = z.infer<typeof updateBranchSchema>;

interface UpdateBranchFormProps {
  projectId: string;
  branch: Branch;
  onBranchUpdated?: (updatedBranch: Branch) => void;
}

const UpdateBranchForm = ({
  projectId,
  branch,
  onBranchUpdated,
}: UpdateBranchFormProps) => {
  const [open, setOpen] = useState(false);
  const { session } = useAuth();
  const accessToken = session?.access_token || "";
  const queryClient = useQueryClient();

  const form = useForm<UpdateBranchFormValues>({
    resolver: zodResolver(updateBranchSchema),
    defaultValues: {
      name: branch.name,
      is_default: branch.is_default,
    },
  });

  useEffect(() => {
    form.reset({
      name: branch.name,
      is_default: branch.is_default,
    });
  }, [branch, form]);

  const { mutate: updateBranchMutate, isPending } = useMutation({
    mutationFn: async (values: UpdateBranchFormValues) => {
      const dto: UpdateBranchDto = {
        name: values.name?.trim(),
        is_default: values.is_default,
      };
      return await updateBranch(projectId, branch.id, dto, accessToken);
    },
    onSuccess: (response) => {
      toast.success("Branch updated successfully");
      queryClient.invalidateQueries({ queryKey: ["branches", projectId] });

      if (response?.data) {
        onBranchUpdated?.(response.data);
      }

      setOpen(false);
    },
    onError: (error: Error) => {
      toast.error(`Failed to update branch: ${error.message}`);
    },
  });

  const onSubmit = (values: UpdateBranchFormValues) => {
    updateBranchMutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="cursor-pointer">
          <Pencil className="w-4 h-4 mr-2" />
          Edit Branch
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Update Branch</DialogTitle>
          <DialogDescription>
            Update the branch name or set it as the default branch for this
            project.
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
                    Update the name for this branch
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
                  form.reset({
                    name: branch.name,
                    is_default: branch.is_default,
                  });
                }}
                disabled={isPending}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending} className="cursor-pointer">
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Branch
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateBranchForm;
