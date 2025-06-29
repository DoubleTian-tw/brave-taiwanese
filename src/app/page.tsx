import { getHotspots } from "@/utils/server";
import { Hotspot } from "../types";
import Map from "./_Map";

export default async function Page() {
    const serverHotspots: Hotspot[] = await getHotspots();
    return <Map serverHotspots={serverHotspots} />;
}
