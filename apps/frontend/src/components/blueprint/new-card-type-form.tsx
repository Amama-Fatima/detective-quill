"use client";
import { set, z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import React from "react";
import { useState } from "react";
import { BlueprintType } from "@detective-quill/shared-types";
import { createCardType } from "@/lib/backend-calls/card-types";
import { toast } from "sonner";

interface NewCardTypeFormProps {
  type: BlueprintType;
  accessToken: string;
}

const NewCardTypeFormSchema = z.object({
  title: z.string().min(2).max(100),
  description: z.string().max(500),
});

export const NewCardTypeForm = ({
  accessToken,
  type,
}: NewCardTypeFormProps) => {
  const form = useForm({
    resolver: zodResolver(NewCardTypeFormSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const [loading, setLoading] = useState(false);

  const onSubmit = (data: z.infer<typeof NewCardTypeFormSchema>) => {
    const createCardTypeData = {
      ...data,
      blueprint_type: type,
    };
    try {
    setLoading(true);
      createCardType(accessToken, createCardTypeData);
      form.reset();
      toast.success("Card type created successfully");
    } catch (error) {
      console.error("Error creating card type:", error);
      toast.error("Failed to create card type");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Title" {...field} />
              </FormControl>
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
                <Input placeholder="Description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="cursor-pointer">Create</Button>
      </form>
    </Form>
  );
};


// todo: use zustand so that when a new card type is created it automatically shows up on the add card popover