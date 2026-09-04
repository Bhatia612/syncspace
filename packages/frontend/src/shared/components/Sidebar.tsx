import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { LayoutGrid, LayoutTemplate, Users, Settings, LogOut, PanelLeftClose, PanelLeft } from "lucide-react"
import { useAuth } from "../../features/auth/AuthContext"
import { logout } from "../../features/auth/authApi"
import { disconnectSocket } from "../../socket/socket"

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])
  return isMobile
}

function Sidebar() {
  const { user, setUser } = useAuth()
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    setCollapsed(isMobile)
  }, [isMobile])

  const handleLogout = async () => {
    try {
      await logout()
    } catch {
      setUser(null)
    }
    disconnectSocket()
    setUser(null)
    navigate("/login")
  }

  const open = !collapsed

  return (
    <>
      {isMobile && (
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCollapsed(true)}
              className="fixed inset-0 z-30 bg-canvas/60 backdrop-blur-[2px]"
            />
          )}
        </AnimatePresence>
      )}

      <motion.aside
        animate={{ width: collapsed ? 68 : 240 }}
        transition={{ type: "spring", stiffness: 400, damping: 32 }}
        className={`flex h-screen shrink-0 flex-col overflow-hidden border-r border-border bg-surface-1 ${isMobile ? "fixed left-0 top-0 z-40" : ""
          }`}
      >
        <div className="flex items-center justify-between px-4 py-5">
          {!collapsed && <span className="display whitespace-nowrap text-2xl text-text">SyncSpace</span>}
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-surface-2 hover:text-text"
            title={collapsed ? "Expand" : "Collapse"}
          >
            {collapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-3">
          <SidebarItem icon={<LayoutGrid size={18} />} label="Boards" active collapsed={collapsed} onClick={() => { navigate("/"); if (isMobile) setCollapsed(true) }} />
          <SidebarItem icon={<LayoutTemplate size={18} />} label="Templates" collapsed={collapsed} disabled />
          <SidebarItem icon={<Users size={18} />} label="Members" collapsed={collapsed} disabled />
          <SidebarItem icon={<Settings size={18} />} label="Settings" collapsed={collapsed} disabled />
        </nav>

        <div className="border-t border-border p-3">
          {collapsed ? (
            <button
              onClick={() => setCollapsed(false)}
              title={user?.name}
              className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-accent text-sm font-semibold text-on-accent"
            >
              {user?.name?.charAt(0).toUpperCase() ?? "?"}
            </button>
          ) : (
            <>
              <div className="mb-2 px-2">
                <p className="truncate text-sm text-text">{user?.name}</p>
                <p className="truncate text-xs text-text-faint">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-text-muted transition-colors hover:bg-surface-2 hover:text-danger"
              >
                <LogOut size={18} />
                Log out
              </button>
            </>
          )}
        </div>
      </motion.aside>

      {isMobile && <div className="w-[68px] shrink-0" />}
    </>
  )
}

function SidebarItem({
  icon,
  label,
  active = false,
  disabled = false,
  collapsed = false,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  active?: boolean
  disabled?: boolean
  collapsed?: boolean
  onClick?: () => void
}) {
  if (disabled) {
    return (
      <div
        title={collapsed ? `${label} (soon)` : undefined}
        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-text-faint ${collapsed ? "justify-center" : "justify-between"
          }`}
      >
        <span className="flex items-center gap-3">
          {icon}
          {!collapsed && label}
        </span>

      </div>
    )
  }

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${collapsed ? "justify-center" : ""
        } ${active ? "bg-surface-2 text-text" : "text-text-muted hover:bg-surface-2 hover:text-text"}`}
    >
      {icon}
      {!collapsed && label}
    </motion.button>
  )
}

export default Sidebar