

// todo: use useCallbacks where needed

interface CanvasCardNodeProps {
    content: string;
    onChange: (newContent: string) => void;
    cardTypeTitle: string;
    cardTypeId: string;
}

export default function CanvasCardNode({ data }: { data: CanvasCardNodeProps }) {

  return (
    <div className="p-6 rounded-lg shadow bg-white w-64 text-black cursor-grab active:cursor-grabbing">
      <div className="flex flex-col gap-6">
        <label htmlFor="text">{data.cardTypeTitle}</label>
        <textarea
          rows={5}
          id="text"
          name="text"
          value={data.content}
          onChange={(e) => data.onChange(e.target.value)}
          className="nodrag border border-gray-300 rounded"
        />
      </div>
    </div>
  );
}