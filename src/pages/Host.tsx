import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

function Host() {
  let { roomID } = useParams();
  let [QRImage, SetQRImage] = useState<string>("");

  useEffect(() => {
    SetQRImage(
      `https://api.qrserver.com/v1/create-qr-code/?size=150x150&margin=5&data=${
        import.meta.env.VITE_CLIENT_URL
      }/${roomID}`
    );
  }, []);

  return (
    <div className="min-w-[300px] w-full max-w-[300px] mx-auto h-full flex justify-center items-center my-auto flex-col gap-5">
      <h1 className="text-3xl">unspoken.</h1>
      {roomID}
      <img src={QRImage} />
    </div>
  );
}

export default Host;
