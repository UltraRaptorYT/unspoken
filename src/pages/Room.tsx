import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import supabase from "@/lib/supabase";
import { RealtimeChannel } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { ROOM_TYPE } from "@/types";
import State0 from "@/components/state/State0";

function Room() {
  const { room_id } = useParams();
  const user_id = uuidv4();
  const navigate = useNavigate();
  const [channel, setChannel] = useState<RealtimeChannel>();
  const [currentState, setCurrentState] = useState<number>(0);
  
  const STATE_MAPPING = {
    0: <State0></State0>,
  };

  async function checkRoomState() {
    let { data, error } = await supabase
      .from("unspoken_user_room")
      .select()
      .eq("room_id", room_id);
    if (error) {
      return console.error("Error");
    }
    if (data && data.length >= 2) {
      return navigate("/");
    }
  }

  async function checkRoomExist() {
    let { data, error } = await supabase
      .from("unspoken_room")
      .select()
      .eq("room_id", room_id);
    if (error) {
      return console.error("Error");
    }
    if (data?.length == 0) {
      return navigate("/");
    }
    checkRoomState();
    setCurrentState((data as ROOM_TYPE[])[0]?.state);
    return console.log("ROOM OKAY");
  }

  async function addUser() {
    let { error } = await supabase
      .from("unspoken_user")
      .insert({ user_id: user_id })
      .select();
    if (error) {
      return console.error("Error");
    }
    return console.log(`USER ${user_id} INSERTED`);
  }

  async function addUserRoom(user_id: string, room_id: string) {
    let { error } = await supabase
      .from("unspoken_user_room")
      .insert({ user_id: user_id, room_id: room_id })
      .select();
    if (error) {
      return console.error("Error");
    }
    return console.log(`USER ${user_id} INSERTED INTO ROOM ${room_id}`);
  }

  async function removeUserRoom(user_id: string, room_id: string) {
    let { error } = await supabase
      .from("unspoken_user_room")
      .delete()
      .eq("user_id", user_id)
      .eq("room_id", room_id);
    if (error) {
      return console.error("Error");
    }
    return console.log(`USER ${user_id} REMOVED FROM ROOM ${room_id}`);
  }

  useEffect(() => {
    if (room_id) {
      checkRoomExist();
      const channel = supabase.channel(`${room_id}_room`, {
        config: {
          broadcast: {
            self: true,
          },
          presence: {
            key: user_id,
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
          await addUser();
          await addUserRoom(key, room_id);
        })
        .on("presence", { event: "leave" }, async ({ key, leftPresences }) => {
          console.log("leave", key, leftPresences);
          await removeUserRoom(key, room_id);
        });

      channel.subscribe(async (status) => {
        if (status !== "SUBSCRIBED") {
          return;
        }

        const presenceTrackStatus = await channel.track({ user_id: user_id });
        console.log(presenceTrackStatus);
      });
      setChannel(channel);

      return () => {
        channel.unsubscribe();
        setChannel(undefined);
      };
    }
  }, []);

  async function broadcast() {
    if (channel) {
      channel.send({
        type: "broadcast",
        event: "ready",
        payload: { user_id: user_id },
      });
    }
  }

  return (
    <div>
      {room_id}
      <Button onClick={broadcast}>test</Button>
    </div>
  );
}

export default Room;
