import "@/App.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@supabase/supabase-js";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_API_KEY
);

function Home() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement | null>(null);

  async function createRoom() {
    if (!inputRef.current) {
      return;
    }
    let roomID: string = inputRef.current.value;
    if (roomID.trim().length == 0) {
      return;
    }
    const { data, error } = await supabase
      .from("unspoken_room")
      .insert([{ roomID: roomID }])
      .select();
    if (error) {
      console.log(error);
      if (error.code == "23505") {
        return navigate(`/host/${roomID}`);
      }
      return;
    }
    console.log(data);
    navigate(`/host/${roomID}`);
  }

  // async function joinRoom() {}

  return (
    <>
      <div className="min-w-[300px] w-full max-w-[300px] mx-auto h-full flex justify-center items-center my-auto flex-col gap-5">
        <h1 className="text-3xl">unspoken.</h1>
        <Input type="text" placeholder="Room Code" ref={inputRef} />
        <div className="flex justify-between items-center w-full">
          <Button variant={"secondary"}>Join Room</Button>
          <Button variant={"default"} onClick={createRoom}>
            Create Room
          </Button>
        </div>
      </div>
    </>
  );
}

export default Home;
