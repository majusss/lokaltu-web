import { Map } from "@/components/ui/map";

export default function MapPage() {
    return (
        <div className="w-full h-screen pb-18">
            <Map theme="light" attributionControl={false}/>
        </div>
    );
}