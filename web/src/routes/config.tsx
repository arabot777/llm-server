import { type RouteObject } from "react-router"
import { Navigate } from "react-router"
import { Suspense, lazy } from "react"
import { ROUTES } from "./constants"
import { ProtectedRoute } from "@/feature/auth/components/ProtectedRoute"

//page - 全部懒加载
const ModelPage = lazy(() => import("@/pages/model/page"))
const ChannelPage = lazy(() => import("@/pages/channel/page"))
const TokenPage = lazy(() => import("@/pages/token/page"))
const GroupPage = lazy(() => import("@/pages/group/page"))
const LogPage = lazy(() => import("@/pages/log/page"))
const MCPPage = lazy(() => import("@/pages/mcp/page"))
const PlaygroundPage = lazy(() => import("@/pages/playground/page"))

// import layout component directly
import { RootLayout } from "@/components/layout/RootLayOut"
import { LoadingFallback } from "@/components/common/LoadingFallBack"

// lazy load pages - 懒加载重型页面
const LoginPage = lazy(() => import("@/pages/auth/login"))
const MonitorPage = lazy(() => import("@/pages/monitor/page"))

// lazy load component wrapper
const lazyLoad = (Component: React.ComponentType) => (
    <Suspense fallback={<LoadingFallback />}>
        <Component />
    </Suspense>
)



// routes config
export function useRoutes(): RouteObject[] {

    // auth routes
    const authRoutes: RouteObject[] = [
        { path: "/login", element: lazyLoad(LoginPage) },
    ]

    // app routes
    const appRoutes: RouteObject = {
        element: <ProtectedRoute />,
        children: [{
            element: <RootLayout />,
            children: [
                {
                    path: "/",
                    element: <Navigate to={`${ROUTES.MONITOR}`} replace />
                },
                {
                    path: ROUTES.MONITOR,
                    element: lazyLoad(MonitorPage),
                },
                {
                    path: ROUTES.KEY,
                    element: lazyLoad(TokenPage),
                },
                {
                    path: ROUTES.GROUP,
                    element: lazyLoad(GroupPage),
                },
                {
                    path: ROUTES.CHANNEL,
                    element: lazyLoad(ChannelPage),
                },
                {
                    path: ROUTES.MODEL,
                    element: lazyLoad(ModelPage),
                },
                {
                    path: ROUTES.LOG,
                    element: lazyLoad(LogPage),
                },
                {
                    path: ROUTES.MCP,
                    element: lazyLoad(MCPPage),
                },
                {
                    path: ROUTES.PLAYGROUND,
                    element: lazyLoad(PlaygroundPage),
                }
            ]
        }]
    }

    return [...authRoutes, appRoutes]
}
