import { ReadyState } from "@/types";
import { useState, useEffect } from "react";

export default function HostState2({
  // readyState,
  question,
}: {
  readyState: ReadyState;
  room_id: string | undefined;
  question: string;
}) {
  const [currentQn, setCurrentQn] = useState<string>("");
  useEffect(() => {
    setCurrentQn(question.replace("<PERSON>", "the other person"));
  }, []);

  return (
    <div className="min-w-[300px] w-full max-w-[500px] mx-auto h-full flex justify-center items-center my-auto flex-col gap-8">
      <h1 className="text-3xl text-center">{currentQn}</h1>
      {/* HostState 2 {JSON.stringify(readyState)} */}
    </div>
  );
}
