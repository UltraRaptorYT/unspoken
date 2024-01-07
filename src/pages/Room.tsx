import { useParams } from "react-router-dom";

function Room() {
  let { roomID } = useParams();
  return <div>{roomID}</div>;
}

export default Room;
