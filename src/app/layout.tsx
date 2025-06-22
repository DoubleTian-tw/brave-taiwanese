import type { Metadata } from "next";
import "../index.css";

export const metadata: Metadata = {
    title: "Brave Taiwanese",
    description: "An application to find nearby shelters in Taiwan.",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                <div id="root">{children}</div>
            </body>
        </html>
    );
}
