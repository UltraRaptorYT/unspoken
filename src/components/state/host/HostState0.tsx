import { ReadyState } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function HostState0({
  // readyState,
  room_id,
  clearRoom,
}: {
  readyState: ReadyState;
  room_id: string | undefined;
  question: string;
  clearRoom: () => void;
}) {
  const [QRImage, SetQRImage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    SetQRImage(
      `https://api.qrserver.com/v1/create-qr-code/?size=150x150&margin=5&data=${
        import.meta.env.VITE_CLIENT_URL
      }/${room_id}`
    );
  }, []);

  return (
    <div className="min-w-[300px] w-full max-w-[500px] mx-auto h-full flex justify-center items-center my-auto flex-col gap-8">
      <div className="flex flex-col gap-3 items-center justify-center">
        <h1 className="text-5xl">unspoken.</h1>
        <h3 className="text-xl">Scan here to begin</h3>
        <p>
          Room ID: <span className="font-bold">{room_id}</span>
        </p>
      </div>
      <div className="w-[150px] aspect-square relative">
        <img
          src={QRImage}
          onLoad={() => setLoading(false)}
          className="w-full h-full rounded-md"
        />
        {loading && (
          <Skeleton className="w-full h-full absolute top-0 left-0 rounded-md" />
        )}
      </div>
      <Button onClick={() => clearRoom()} variant={"secondary"}>
        RESET ROOM
      </Button>
      {/* {JSON.stringify(readyState)} */}
    </div>
  );
}
