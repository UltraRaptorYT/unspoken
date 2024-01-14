import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import supabase from "@/lib/supabase";
import { RealtimeChannel } from "@supabase/supabase-js";
import { ROOM_TYPE } from "@/types";
import CustomContainer from "@/components/CustomContainer";
import HostState0 from "@/components/state/host/HostState0";

function Host() {
  let { room_id } = useParams();
  let [QRImage, SetQRImage] = useState<string>("");
  let [loading, setLoading] = useState<boolean>(true);
  const [channel, setChannel] = useState<RealtimeChannel>();
  const [currentState, setCurrentState] = useState<number>(0);

  const STATE_MAPPING = {
    0: <HostState0 test={currentState}></HostState0>,
  };
  
  async function ensureRoomCreated() {
    const { error } = await supabase
      .from("unspoken_room")
      .insert([{ room_id: room_id }])
      .select();
    if (error) {
      if (error.code != "23505") {
        console.log(error);
      }
    }
  }

  async function getRoomState() {
    const { data, error } = await supabase
      .from("unspoken_room")
      .select()
      .eq("room_id", room_id);
    if (error) {
      return console.log(error);
    }
    setCurrentState((data as ROOM_TYPE[])[0]?.state);
  }

  useEffect(() => {
    ensureRoomCreated();
    SetQRImage(
      `https://api.qrserver.com/v1/create-qr-code/?size=150x150&margin=5&data=${
        import.meta.env.VITE_CLIENT_URL
      }/${room_id}`
    );
    if (room_id) {
      const channel = supabase.channel(`${room_id}_room`, {
        config: {
          broadcast: {
            self: true,
          },
          presence: {
            key: "HOST",
          },
        },
      });

      channel
        .on("presence", { event: "sync" }, () => {
          const newState = channel.presenceState();
          console.log("sync", newState);
        })
        .on("presence", { event: "join" }, async ({ key, newPresences }) => {
          console.log("join", key, newPresences);
        })
        .on("presence", { event: "leave" }, async ({ key, leftPresences }) => {
          console.log("leave", key, leftPresences);
        });

      channel.on("broadcast", { event: "ready" }, ({ payload }) => {
        console.log(payload);
      });

      channel.subscribe();

      setChannel(channel);
      getRoomState();

      return () => {
        channel.unsubscribe();
        setChannel(undefined);
      };
    }
  }, []);

  return (
    <div className="min-w-[300px] w-full max-w-[300px] mx-auto h-full flex justify-center items-center my-auto flex-col gap-8">
      <div className="flex flex-col gap-3 items-center justify-center">
        <h1 className="text-5xl">unspoken.</h1>
        <h3 className="text-xl">Scan here to begin</h3>
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
      <CustomContainer children={STATE_MAPPING[0]}></CustomContainer>
    </div>
  );
}

export default Host;
