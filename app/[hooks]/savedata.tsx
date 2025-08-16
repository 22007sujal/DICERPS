// hooks/useDiceRps.ts
import { useState } from "react";

interface DiceRpsData {
  wallet_address: string;
  username: string;
  profile_image: string;
}

export function useDiceRps(apiBaseUrl: string) {
  const [data, setData] = useState<DiceRpsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Save profile to backend
  async function saveDiceRps(info: DiceRpsData) {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${apiBaseUrl}/save_profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(info),
      });

      if (!res.ok) throw new Error("Failed to save data");
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }

  // Get profile by wallet address
  async function getDiceRps(wallet_address: string) {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${apiBaseUrl}/get_profile?wallet_address=${wallet_address}`);
      if (!res.ok) throw new Error("Failed to fetch data");

      const result: DiceRpsData = await res.json();
      setData(result);
      return result;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }

  // Upload image to ImgBB and get URL
  async function uploadImage(file: File): Promise<string | null> {
    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch(`https://api.imgbb.com/1/upload?key=b492e60ab6e8f99c8fa321f4ad9abd49`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Image upload failed");

      const result = await res.json();
      return result.data.url; // Hosted image link
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { data, loading, error, saveDiceRps, getDiceRps, uploadImage };
}
