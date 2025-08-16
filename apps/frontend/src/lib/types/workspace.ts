import { FsNodeTreeResponse } from "@detective-quill/shared-types";

export interface WorkspaceFile extends FsNodeTreeResponse {
  isDirty?: boolean;
  isNew?: boolean;
  slug?: string; // For URL routing
}

export interface TreeViewElement {
  id: string;
  name: string;
  isSelectable: boolean;
  children?: TreeViewElement[];
}
