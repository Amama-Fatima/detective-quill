"use client";
import React, { useEffect } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "../ui/popover";
import { Button } from "../ui/button";
import { CardType } from "@detective-quill/shared-types/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { NewCardTypeForm } from "./new-card-type-form";
import { useUserCardTypesStore } from "@/stores/use-user-card-types-store";

interface AddCardPopoverProps {
  cardTypes: CardType[];
  addCard: (type: CardType) => void;
  accessToken: string;
  userTypes: CardType[] | null;
}

export const AddCardPopover = ({
  cardTypes,
  addCard,
  accessToken,
  userTypes,
}: AddCardPopoverProps) => {
  const type = cardTypes[0].blueprint_type;
  const { userTypes: storeUserTypes, setUserTypes: setStoreUserTypes } =
    useUserCardTypesStore();

  useEffect(() => {
    if (userTypes && userTypes.length > 0) {
      setStoreUserTypes(() => userTypes);
    }
  }, [userTypes, setStoreUserTypes]);

  return (
    <div>
      <Popover>
        <PopoverTrigger className="bg-white text-black px-2 py-[0.35rem] cursor-pointer rounded-md">
          + Add Card
        </PopoverTrigger>
        <PopoverContent>
          <div>
            <p>Default Types</p>
            {cardTypes.map((type) => (
              <Button
                key={type.id}
                onClick={() => addCard(type)}
                className="w-full text-left cursor-pointer my-3"
              >
                {type.title}
              </Button>
            ))}
          </div>
          <div>
            <p>Your Types</p>
            {storeUserTypes ? (
              storeUserTypes.map((type) => (
                <Button
                  key={type.id}
                  onClick={() => addCard(type)}
                  className="w-full text-left cursor-pointer my-3"
                >
                  {type.title}
                </Button>
              ))
            ) : (
              <p>No custom card types found.</p>
            )}
          </div>
          <hr className="bg-white my-3" />
          <div className="flex justify-center my-3">
            <Dialog>
              <DialogTrigger className="bg-gray-100 p-[0.5rem] text-black font-semibold rounded-md cursor-pointer text-[0.9rem] w-full">
                + Create New Card Type
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Card Type for {type}</DialogTitle>
                </DialogHeader>
                <NewCardTypeForm type={type} accessToken={accessToken} />
              </DialogContent>
            </Dialog>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
