import { ReadyState } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ImCheckmark, ImCross } from "react-icons/im";

export default function HostState0({
  readyState,
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

  useEffect(() => {
    console.log(readyState);
  }, [readyState]);

  function addLength(arr: string[], maxLength: number) {
    let newArr = [
      ...arr,
      ...Array(Math.max(0, maxLength - arr.length)).fill(""),
    ];
    return newArr;
  }

  return (
    <div className="min-w-[300px] w-full max-w-[500px] mx-auto h-full flex justify-center items-center my-auto flex-col gap-8">
      <div className="flex flex-col gap-3 items-center justify-center">
        <h1 className="text-5xl">unspoken.</h1>
        <h3 className="text-xl">Scan here to begin</h3>
        <div className="flex flex-col items-center justify-center gap-1.5">
          <p>
            Room ID: <span className="font-bold">{room_id}</span>
          </p>
          <div className="flex gap-6">
            {addLength(
              [...Object.values(readyState).map((e) => String(e))],
              2
            ).map((e, i) => {
              return (
                <div key={"Ready" + i}>
                  {e == "true" ? (
                    <ImCheckmark color="#13ad52"></ImCheckmark>
                  ) : (
                    <ImCross color="#ef4243"></ImCross>
                  )}
                </div>
              );
            })}
          </div>
        </div>
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
