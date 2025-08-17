// todo: use useCallbacks where needed

import { Button } from "../ui/button";

interface CanvasCardNodeProps {
  id?: string; // DB id
  content: string;
  onChange: (newContent: string) => void;
  cardTypeTitle: string;
  cardTypeId: string;
  onDelete?: () => void;
}

export default function CanvasCardNode({
  data,
}: {
  data: CanvasCardNodeProps;
}) {
  return (
    <div className="p-6 rounded-lg shadow bg-white w-64 text-black cursor-grab active:cursor-grabbing">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <label>{data.cardTypeTitle}</label>
          <Button
            onClick={data.onDelete}
            className="text-red-500  cursor-pointer text-sm hover:text-red-700"
          >
            ✕
          </Button>
        </div>
        <textarea
          rows={5}
          value={data.content}
          onChange={(e) => data.onChange(e.target.value)}
          className="nodrag border border-gray-300 rounded"
        />
      </div>
    </div>
  );
}
