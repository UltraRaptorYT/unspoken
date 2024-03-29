import { ReadyState } from "@/types";

export default function HostState1({
  // readyState,
  // room_id,
  question,
}: {
  readyState: ReadyState;
  room_id: string | undefined;
  question: string;
}) {
  return (
    <div className="min-w-[300px] w-full max-w-[500px] mx-auto h-full flex justify-center items-center my-auto flex-col gap-8">
      <h1 className="text-3xl text-center">{question}</h1>
      {/* HostState 1 {JSON.stringify(readyState)} */}
    </div>
  );
}
