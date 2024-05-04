import { RealtimeChannel } from "@supabase/supabase-js";

export default function State3({
  question,
}: {
  channel: RealtimeChannel | undefined;
  user_id: string;
  question: string;
  room_id: string | undefined;
}) {
  return (
    <div className="flex flex-col max-w-[300px] mx-auto h-full items-center justify-center gap-5 px-3 py-8 grow">
      <div className="text-xl text-center">{question}</div>
    </div>
  );
}
