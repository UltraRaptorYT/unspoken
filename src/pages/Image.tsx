"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

export default function Image() {
  let [searchParams, setSearchParams] = useSearchParams();
  const [imageURL, setImageURL] = useState<string | null>();
  useEffect(() => {
    console.log(searchParams);
    if (searchParams.get("imageURL")) {
      setImageURL(searchParams.get("imageURL"));
    }
  }, [searchParams]);

  async function downloadImage(imgURL: string) {
    const link = document.createElement("a");
    link.setAttribute("target", "_blank");
    link.download = imgURL.substring(
      imgURL.lastIndexOf("/") + 1,
      imgURL.length
    );
    let res = await fetch(imgURL);
    let blob = await res.blob();
    link.href = URL.createObjectURL(blob);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  return (
    <div className="flex flex-col max-w-[300px] mx-auto h-full items-center justify-center gap-5 px-3 py-8 grow">
      <div className="text-xl text-center">Download Image here!</div>
      <Button
        variant={"secondary"}
        onClick={() => downloadImage(imageURL || "")}
      >
        Download here
      </Button>
    </div>
  );
}
