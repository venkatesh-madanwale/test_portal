import { useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import MeetOurTeam from "./MeetOurTeam";

function App() {

    const user = useSelector((state: RootState) => state.auth.user);

    return (
        <>
            <div>
                <div><h1>Hi {user?.name}...</h1></div>
                <img style={{ "height": "82vh", "width": "90vw" }} src="/src/assets/dashboard.jpg.webp" />
            </div>
            <div>
                <MeetOurTeam/>
            </div>
        </>
    )
}
export default App