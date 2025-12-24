export const BASE_PATH = '/' as const

export const ROUTES = {
    MONITOR: "/monitor",
    KEY: "/key",
    GROUP: "/group",
    CHANNEL: "/channel",
    MODEL: "/model",
    LOG: "/log",
    MCP: "/mcp",
    PLAYGROUND: "/playground",
} as const

export type RouteKey = keyof typeof ROUTES
export type RoutePath = typeof ROUTES[RouteKey]

// get route path by key
export const getRoute = (key: RouteKey): RoutePath => ROUTES[key] 