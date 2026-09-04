import type { ReactNode } from "react"
import Sidebar from "./Sidebar"

function AppLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1 overflow-auto">{children}</div>
        </div>
    )
}

export default AppLayout