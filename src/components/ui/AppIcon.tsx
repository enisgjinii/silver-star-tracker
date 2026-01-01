import { getAppIcon } from "@/lib/app-icons"
import { cn } from "@/lib/utils"

interface AppIconProps {
    appName: string
    icon?: string // Base64 or URL
    className?: string
    size?: number
}

export function AppIcon({ appName, icon, className, size = 24 }: AppIconProps) {
    const { icon: fallbackEmoji, color } = getAppIcon(appName)

    return (
        <div
            className={cn(
                "rounded flex items-center justify-center overflow-hidden shrink-0",
                className
            )}
            style={{
                width: size,
                height: size,
                backgroundColor: icon ? 'transparent' : `${color}20`,
                color: color
            }}
        >
            {icon ? (
                <img
                    src={icon}
                    alt={appName}
                    className="h-full w-full object-contain"
                    onError={(e) => {
                        // Fallback to emoji if image fails
                        e.currentTarget.style.display = 'none'
                        e.currentTarget.parentElement!.innerHTML = `<span>${fallbackEmoji}</span>`
                    }}
                />
            ) : (
                <span style={{ fontSize: size * 0.6 }}>{fallbackEmoji}</span>
            )}
        </div>
    )
}
