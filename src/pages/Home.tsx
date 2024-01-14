import "@/App.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import supabase from "@/lib/supabase";

function Home() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement | null>(null);

  async function createRoom() {
    if (!inputRef.current) {
      return;
    }
    let room_id: string = inputRef.current.value;
    if (room_id.trim().length == 0) {
      return;
    }
    const { data, error } = await supabase
      .from("unspoken_room")
      .insert([{ room_id: room_id }])
      .select();
    if (error) {
      console.log(error);
      if (error.code == "23505") {
        return navigate(`/host/${room_id}`);
      }
      return;
    }
    console.log(data);
    navigate(`/host/${room_id}`);
  }

  async function joinRoom() {
    if (!inputRef.current) {
      return;
    }
    let room_id: string = inputRef.current.value;
    if (room_id.trim().length == 0) {
      toast({
        title: "Invalid Room Code",
        variant: "destructive",
        duration: 1000,
      });
      return;
    }
    const { data, error } = await supabase
      .from("unspoken_room")
      .select()
      .eq("room_id", room_id);
    if (error) {
      console.log(error);
      return;
    }
    if (data.length == 0) {
      toast({
        title: "Invalid Room Code",
        variant: "destructive",
        duration: 1000,
      });
      return;
    }
    const roomFull = await checkRoomStatus(room_id);
    if (!roomFull) {
      navigate(`/${room_id}`);
    }
  }

  async function checkRoomStatus(room_id: string): Promise<Boolean> {
    const { data, error } = await supabase
      .from("unspoken_user_room")
      .select()
      .eq("room_id", room_id);
    if (error) {
      console.log(error);
      return true;
    }
    if (data.length >= 2) {
      toast({
        title: "Room is Full",
        variant: "destructive",
        duration: 1000,
      });
      return true;
    }
    return false;
  }

  return (
    <>
      <div className="min-w-[300px] w-full max-w-[300px] mx-auto h-full flex justify-center items-center my-auto flex-col gap-5">
        <h1 className="text-3xl">unspoken.</h1>
        <Input type="text" placeholder="Room Code" ref={inputRef} />
        <div className="flex justify-between items-center w-full">
          <Button variant={"secondary"} onClick={joinRoom}>
            Join Room
          </Button>
          <Button variant={"default"} onClick={createRoom}>
            Create Room
          </Button>
        </div>
      </div>
    </>
  );
}

export default Home;
